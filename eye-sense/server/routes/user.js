import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res) => {
    let collection = await db.collection("Users");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

router.get("/:id", async (req, res) => {
    let collection = await db.collection("Users");
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
                username: req.body.username,
                display_name: req.body.display_name,
                password: req.body.password,
                email: req.body.email,
                organization: req.body.organization,
                role: req.body.role,
                organization_permissions: req.body.organization_permissions,
            },
        };

        let collection = await db.collection("Users");
        let result = await collection.replaceOne(query, updatedDocument);

        if (result.matchedCount == 0) {
            res.status(404).send("User not found");
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error replacing user information");
    }
});

router.post("/", async(req,res) => {
    try {
        console.log(req.body);
        let newDocument = {
            // Took schema info from the design doc, feel free to change

            username: req.body.username,
            display_name: req.body.display_name,
            password: req.body.password,
            email: req.body.email,
            organization: req.body.organization,
            role: req.body.role,
            organization_permissions: req.body.organization_permissions,
            
        };
        let collection = await db.collection("Users");
        let result = await collection.insertOne(newDocument)
        res.send(result).status(204);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error adding user")
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)};
        const updates = {
            $set: {
                username: req.body.username,
                display_name: req.body.display_name,
                password: req.body.password,
                email: req.body.email,
                organization: req.body.organization,
                role: req.body.role,
                organization_permissions: req.body.organization_permissions,
            },
        };

        let collection = await db.collection("Users");
        let result = await collection.updateOne(query, updates);
        res.send(result).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error updating user")
    }
});

router.delete("/:id", async(req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)};
        const collection = db.collection("Users");
        let result = await collection.deleteOne(query);

        res.send(result).status(200);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error deleting user")
    }
});

export default router;