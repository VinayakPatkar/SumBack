const user = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const stringSimilarity = require("string-similarity")
const summary = require("../models/summary")
exports.signup = async(req,res) => {
    const {username,email,password} = req.body;
    try {
        let userPresent = await user.findOne({email : email});
        if (userPresent){
            return res.status(400).json({message : "User already exists"})
        }
        userNew = new user({
            _id: new mongoose.Types.ObjectId(),
            username : username,
            email : email,
            password : password
        })
        const salt = await bcrypt.genSalt(10);
        userNew.password = await bcrypt.hash(password,salt);
        await userNew.save()
        .then((saved,err)=>{
            if (saved){
                return res.status(200).json({message : "User Created"})
            }
            if (err){
                return res.status(400).json({message : "User could not be created"})
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({message : "Error while signing up the user"})
    }
}
exports.login = async(req,res) => {
    const {email,password} = req.body;
    try {
        let userPresent = await user.findOne({email : email});
        if (!userPresent){
            return res.status(400).json({message : "User doesn't exist"});
        }
        const isMatch = await bcrypt.compare(password,userPresent.password);
        if(!isMatch){
            return res.status(400).json({message : "Incorrect password"});
        }
        const payload = {user_ : {id : userPresent._id}}
        jwt.sign(payload,process.env.JWT_KEY,{expiresIn : 3600},(err,token)=>{
            if (err) throw err;
            res.status(200).json({isUser: true,token : token})
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({messsage : "Server error"})
    }
}
exports.gettopsummaries = async(req,res) => {
    try {
        const { queryText } = req.query;
        const allSummaries = await summary.find();
        const results = allSummaries.map(summary => {
            const summary400Similarity = stringSimilarity.compareTwoStrings(queryText, summary.summary400);
            const summary600Similarity = stringSimilarity.compareTwoStrings(queryText, summary.summary600);

            const keywordSimilarities = summary.keywords.map(([keyword, weight]) => ({
                keyword,
                similarity: stringSimilarity.compareTwoStrings(queryText, keyword),
                weight
            }));

            return {
                ...summary.toObject(),
                summary400Similarity,
                summary600Similarity,
                keywordSimilarities
            };
        });

        // Sort results based on similarity scores or any other criteria
        // For example, you can sort by the maximum similarity score across summary400, summary600, and keywords
        const sortedResults = results.sort((a, b) => {
            const maxSimilarityA = Math.max(a.summary400Similarity, a.summary600Similarity, ...a.keywordSimilarities.map(k => k.similarity));
            const maxSimilarityB = Math.max(b.summary400Similarity, b.summary600Similarity, ...b.keywordSimilarities.map(k => k.similarity));
            return maxSimilarityB - maxSimilarityA;
        });

        res.json(sortedResults);
    } catch (error) {
        console.error("Error getting summaries:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

