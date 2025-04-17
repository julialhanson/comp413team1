import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

// Get all choices in the database
router.get("/", async (req, res) => {
  let collection = await db.collection("Choices");
  let results = await collection.find({}).toArray();
  return res.send(results).status(200);
});

// Get a specific choice in the database
router.get("/:id", async (req, res) => {
  let collection = await db.collection("Choices");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result)
    res.send(`Choice with id ${req.params.id} not found`).status(404);
  else res.send(result).status(200);
});

// Replace information for a given choice
router.put("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) }; //new ObjectId(req.params.id) };

    const updatedDocument = {
      $set: {
        text: req.body.text,
      },
    };
    let collection = await db.collection("Choices");
    let result = await collection.updateOne(query, updatedDocument);
    return res.send(result).status(200);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error updating choice");
  }
});

// Modify information in the choice
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {};
    for (const key in req.body) {
      if (req.body[key] != null) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length == 0) {
      console.log("length of request body was ", Object.keys(updates).length);
      return res.status(500).send("ERROR: request body empty");
    }

    const updatedDocument = { $set: updates };
    let collection = await db.collection("Questions");
    let result = await collection.updateOne(query, updatedDocument);
    return res.send(result).status(200);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error updating question");
  }
});

// Delete a choice
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = db.collection("Choices");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (e) {
    console.error(e);
    res.status(500).send(`Error deleting choice with id ${req.params.id}`);
  }
});

export default router;
