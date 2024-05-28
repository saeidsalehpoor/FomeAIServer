var express = require('express');
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ app: "FomeAI" });
});

router.get("/api/user", async (req, res) => {
  try {
    const users = await req.db.from("user").select("displayname", "email");
    res.json({ error: false, users });
  } catch (error) {
    res.json({ error: true, message: error });
  }
});


module.exports = router;
