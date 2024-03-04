const router = require("express").Router();
const admincontroller = require("../controllers/admincontroller");
const checkauth = require("../middlewares/checkauth");
const file_upload = require("../middlewares/upload_pdf");
router.post("/signup",admincontroller.signup);
router.post("/signin",admincontroller.login);
router.post("/upload",checkauth,file_upload.single("pdf"),admincontroller.upload)
module.exports = router;