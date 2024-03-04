const admin = require("../models/admin");
const summarymod = require("../models/summary");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const pdf = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data")
exports.signup = async(req,res) => {
    const {username,email,password} = req.body;
    try {
        let adminPresent = await admin.findOne({email : email});
        if (adminPresent){
            return res.status(400).json({message : "Admin already exists"})
        }
        adminNew = new admin({
            _id: new mongoose.Types.ObjectId(),
            username : username,
            email : email,
            password : password
        })
        const salt = await bcrypt.genSalt(10);
        adminNew.password = await bcrypt.hash(password,salt);
        await adminNew.save()
        .then((saved,err)=>{
            if (saved){
                return res.status(200).json({message : "Admin Created"})
            }
            if (err){
                return res.status(400).json({message : "Admin could not be created"})
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({message : "Error while signing up the admin"})
    }
}
exports.login = async(req,res) => {
    const {email,password} = req.body;
    try {
        let adminPresent = await admin.findOne({email : email});
        if (!adminPresent){
            return res.status(400).json({message : "Admin doesn't exist"});
        }
        const isMatch = await bcrypt.compare(password,adminPresent.password);
        if(!isMatch){
            return res.status(400).json({message : "Incorrect password"});
        }
        const payload = {admin_ : {id : adminPresent._id}}
        jwt.sign(payload,process.env.JWT_KEY,{expiresIn : 3600},(err,token)=>{
            if (err) throw err;
            res.status(200).json({isAdmin: true,token : token})
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({messsage : "Server error"})
    }
}
exports.upload = async (req, res) => {
    const base_path = './file_store/' + req.file.filename;
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(base_path));
  
    try {
      const response = await axios.post('http://localhost:5000/data', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
  
      const { title, summary, keywords } = response.data.data;
      const {summary_400,summary_600} = summary
      const newSummary = new summarymod({
        title,
        summary400: summary_400[0].summary_text,
        summary600: summary_600[0].summary_text,
        keywords,
      });
  
      // Save the summary to the database
      const savedSummary = await newSummary.save();
  
      console.log('Summary saved successfully:', savedSummary);
  
      res.status(200).json({ message: 'Summary saved successfully' });
    } catch (error) {
      console.error('Error uploading and saving summary:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };