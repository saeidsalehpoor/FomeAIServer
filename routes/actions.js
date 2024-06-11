require('dotenv').config();
var express = require('express');
var router = express.Router();


router.get("/action:actionId", async (req, res) => {
  try {
    const actions = await req.db
      .from("actions")
      .select("id", "name", "description", "properform", "image", "image2")
      .where("id", req.params.actionId);

    res.json({ error: false, actions });
  } catch (error) {
    res.json({ error: true, message: error });
  }
});

router.get("/actioncard/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const query = `
      WITH RankedResults AS (
          SELECT 
              ar.actionid, 
              ar.userid, 
              ar.successcnt AS last_successcnt, 
              ar.actiondate,
              ROW_NUMBER() OVER (PARTITION BY ar.actionid, ar.userid ORDER BY ar.actiondate DESC) AS rn
          FROM fomeai.actionresults ar
      ),
      MaxSuccessCnt AS (
          SELECT 
              ar.actionid, 
              ar.userid, 
              MAX(ar.successcnt) AS highest_successcnt
          FROM fomeai.actionresults ar
          GROUP BY ar.actionid, ar.userid
      )
      SELECT 
          r.actionid as id, 
          a.title as name,
          a.description,
          a.properform,
          a.image,
          a.image2,
          r.userid, 
          r.last_successcnt, 
          m.highest_successcnt,
          concat('Previous score: ', r.last_successcnt, '   Personal best: ', m.highest_successcnt) AS scores
      FROM 
          RankedResults r
      JOIN 
          MaxSuccessCnt m ON r.actionid = m.actionid AND r.userid = m.userid
      JOIN
          fomeai.actions a ON r.actionid = a.id
      WHERE 
          r.rn = 1
      AND 
          r.userid = ?
    `;

    const result = await req.db.raw(query, [userId]);

    // Extract the first nested array (data rows)
    const rows = result[0];

    if (rows && rows.length > 0) {
      res.json({ error: false, actions: rows });
    } else {
      res.json({ error: true, message: 'No actions found' });
    }
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

module.exports = router;