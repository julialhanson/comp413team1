import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";
import { authenticateToken } from "../utils/authenticate.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const collection = db.collection("Responses")
    let query = {};
  
    if (req.query.username) {
      query.username = req.query.username;
    }
    if (req.query.time_taken) {
      query.time_taken = req.query.time_taken;
    }
    if (req.query.survey_id) {
      query.survey_id = req.query.survey_id;
    }
  
    // Get all responses if no query given
    if (Object.keys(query).length == 0) {
      let results = await collection.find({}).toArray();
      return res.send(results).status(200);
    } else {
      try {
        let responses = await collection.find(query).toArray();
        return res.status(200).json(responses);
      } catch (error) {
        return res
          .status(400)
          .json({ error: "Error fetching surveys", details: error.message });
      }
    }
  })

export default router;