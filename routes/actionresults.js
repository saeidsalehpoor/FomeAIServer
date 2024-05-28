require('dotenv').config();
var express = require('express');
var router = express.Router();

router.get("/actionResult/:actionId/:userId", async (req, res) => {
    try {
        const { actionId, userId } = req.params;

        const actionResults = await req.db
            .from("actionresults")
            .select("successcnt", "failcnt", "feedback")
            .where({ id: actionId, userid: userId });
        
        res.json({ error: false, actionResults });
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});



module.exports = router;
