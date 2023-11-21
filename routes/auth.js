var express =  require("express");
var router = express.Router();

router.post("/google/login", async (req, res) => {
    console.log(req.body)
    res.send("received")
})

module.exports = router;