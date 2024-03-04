const express = require("express");
const app = express();
require("dotenv").config();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require('path');
const mongoose = require("mongoose");
const adminroute = require("./routes/adminroute");
const userroute = require("./routes/userroute");
mongoose.connect(process.env.MONGO_URL)
.then((conn,err) => {
    if(conn){
        console.log("MONGODB is connected")
    }
    else{
        console.log("Error  in connecting to database")
    }
})
mongoose.Promise = global.Promise;
//const userRoute = require("./routes/userRoute");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });
app.use("/admin",adminroute);
app.use("/user",userroute);
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
module.exports = app;