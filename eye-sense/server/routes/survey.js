import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res) => {
    let collection = await db.collection("Surveys");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

router.get("/id", async (req, res) => {
    let collection = await db.collection("Surveys");
    let query = { _id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

router.put("/id", async(req, res) => {
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
            res.status(404).send("Survey not found");
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error replacing survey information");
    }
});


router.post("/", async(req,res) => {
    try {
        let newDocument = {
            // took response information from design doc, feel free to change if needed
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
        res.send(result).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error adding survey")
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)};
        const updates = {
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
        let result = await collection.updateOne(query, updates);
        res.send(result).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error updating survey")
    }
});

router.delete("/:id", async(req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)};
        const collection = db.collection("Surveys");
        let result = await collection.deleteOne(query);

        res.send(result).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error deleting survey")
    }
});

export default router;