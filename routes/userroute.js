const router = require("express").Router();
const usercontroller = require("../controllers/usercontroller");
router.post("/signup",usercontroller.signup);
router.post("/signin",usercontroller.login);
router.get("/gettopsummaries",usercontroller.gettopsummaries);
module.exports = router;