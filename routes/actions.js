require('dotenv').config();
var express = require('express');
var router = express.Router();

/*
router.get("/action", async function(req, res, next) {
    const { actionId } = req.body;
    try {
      const actions = await req.db
        .from("actions")
        .select("title", "desc")
        .where("id", actionId);
  
        res.json({ error: false, actions });
    } catch (error) {
      res.json({ error: true, message: error });
    }
  });
  */
  
  router.get("/action:actionId", async (req, res) => {
    try {
      const actions = await req.db
        .from("actions")
        .select("title", "desc")
        .where("id", req.params.actionId);
  
      res.json({ error: false, actions });
    } catch (error) {
      res.json({ error: true, message: error });
    }
  });

  module.exports = router;