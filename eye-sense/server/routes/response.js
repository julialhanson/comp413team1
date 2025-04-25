import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";
import { authenticateToken } from "../utils/authenticate.js";
import { getSignedUrlForHeatmap, getSignedUrlForImage } from "../utils/gcp.js";

const router = express.Router();

// Get responses according to a query, or all if no query provided
router.get("/", async (req, res) => {
  const collection = db.collection("Responses");
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
});

// Get a specific response in the database
router.get("/:id", async (req, res) => {
  let collection = await db.collection("Responses");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) return res.status(404).send("Response not found");

  if (result.heatmap_urls) {
    const heatmaps = await Promise.all(
      result.heatmap_urls.map(async (heatmap_url) =>
        heatmap_url ? await getSignedUrlForHeatmap(heatmap_url) : null
      )
    );
    result["heatmaps"] = heatmaps;
  }
  res.send(result).status(200);
});

// Delete a specific response in the databse
router.delete("/:id", authenticateToken, async (req, res) => {
  let collection = db.collection("Responses");
  let query = { _id: new ObjectId(req.params.id) };
  let responseToDelete = await collection.findOne(query);

  // Check authorization
  if (responseToDelete.username !== req.user.username) {
    return res.send("Unauthorized").status(401);
  }

  let result = await collection.deleteOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

export default router;
