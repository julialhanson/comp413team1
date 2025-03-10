import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

// Get all questions in the database
router.get("/", async (req, res) => {
    let collection = await db.collection("Questions");
    let results = await collection.find({}).toArray();
    return res.send(results).status(200);
});

// Get a specific question in the database
router.get("/:id", async (req, res) => {
    let collection = await db.collection("Questions");
    let query = { _id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

// Replace information for a given question
router.put("/:id", async(req, res) => {
    try {
        const query = {_id: new ObjectId(req.params.id) };
        const updatedDocument = {
            $set: {
                question_id: req.body.question_id,
                organization: req.body.organization,
                user_created: req.body.user_created,
                time_created: req.body.time_created,
                last_edited: req.body.last_edited,
                image: req.body.image,
                choices: req.body.choices,
            },
        };

        let collection = await db.collection("Questions");
        let result = await collection.replaceOne(query, updatedDocument);

        if (result.matchedCount == 0) {
            res.status(404).send("Question not found");
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error replacing question information");
    }
});

// Create a new question
router.post("/", async(req,res) => {
    try {
        let newDocument = {
            question_id: req.body.question_id,
            organization: req.body.organization,
            user_created: req.body.user_created,
            time_created: req.body.time_created,
            last_edited: req.body.last_edited,
            image: req.body.image,
            choices: req.body.choices,
        };
        let collection = await db.collection("Questions");
        let result = await collection.insertOne(newDocument)
        return res.send(result).status(204);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error adding question")
    }
});

// Modify information in the question
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
        let collection = await db.collection("Questions");
        let result = await collection.updateOne(query, updatedDocument);
        return res.send(result).status(200);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error updating question")
    }
});

// Delete a question
router.delete("/:id", async(req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)};
        const collection = db.collection("Questions");
        let result = await collection.deleteOne(query);

        res.send(result).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error deleting question")
    }
});

export default router;