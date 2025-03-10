import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

// Get all surveys in the database
router.get("/", async (req, res) => {
    let collection = await db.collection("Surveys");
    let results = await collection.find({}).toArray();
    return res.send(results).status(200);
});

// Get a specific survey in the database
router.get("/:id", async (req, res) => {
    let collection = await db.collection("Surveys");
    let query = { _id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

// Modify information in a given survey
router.put("/:id", async(req, res) => {
    try {
        const query = {_id: new ObjectId(req.params.id) };
        const updatedDocument = {
            $set: {
                survey_id: req.body.survey_id,
                organization: req.body.organization,
                user_created: req.body.user_created,
                time_created: req.body.time_created,
                last_edited: req.body.last_edited,
                published: req.body.published,
                questions: req.body.questions,
            },
        };

        let collection = await db.collection("Surveys");
        let result = await collection.replaceOne(query, updatedDocument);

        if (result.matchedCount == 0) {
            return res.status(404).send("Survey not found");
        } else {
            return res.status(200).send(result);
        }
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error replacing survey information");
    }
});

// Create a new survey
router.post("/", async(req,res) => {
    try {
        let newDocument = {
            survey_id: req.body.survey_id,
            organization: req.body.organization,
            user_created: req.body.user_created,
            time_created: req.body.time_created,
            last_edited: req.body.last_edited,
            published: req.body.published,
            questions: req.body.questions,
        };
        let collection = await db.collection("Surveys");
        let result = await collection.insertOne(newDocument)
        return res.send(result).status(204);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error adding survey")
    }
});

// Modify information for a survey
router.patch("/:id", async (req, res) => {
    try {
        const query = {_id: new ObjectId(req.params.id) };
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
        let collection = await db.collection("Surveys");
        let result = await collection.updateOne(query, updatedDocument);
        return res.send(result).status(200);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error updating survey")
    }
});

// Delete a survey
router.delete("/:id", async(req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)};
        const collection = db.collection("Surveys");
        let result = await collection.deleteOne(query);

        return res.send(result).status(200);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error deleting survey")
    }
});

export default router;