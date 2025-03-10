import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

// Get all users in the database
router.get("/", async (req, res) => {
    let collection = await db.collection("Users");
    let results = await collection.find({}).toArray();
    return res.send(results).status(200);
});

// Get a specific user in the database
router.get("/:id", async (req, res) => {
    let collection = await db.collection("Users");
    let query = { _id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

// Replace information for a given user 
router.put("/:id", async(req, res) => {
    try {
        // Checking for duplicate usernames and emails
        let collection = await db.collection("Users");
        const curr_user = await collection.findOne({username: req.body.username});
        const curr_email = await collection.findOne({email: req.body.email});

        if (curr_user != null) {
            return res.status(500).send("ERROR: an account with this username has already been created");
        }
        if (curr_email != null) {
            return res.status(500).send("ERROR: an account with this email has already been created");
        }
        
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

        let result = await collection.replaceOne(query, updatedDocument);

        if (result.matchedCount == 0) {
            return res.status(404).send("User not found");
        } else {
            return res.status(200).send(result);
        }
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error replacing user information");
    }
});

// Create a new user 
router.post("/", async(req,res) => {
    try {
        // Check for duplicate usernames or emails
        let collection = await db.collection("Users");
        const curr_user = await collection.findOne({username: req.body.username});
        const curr_email = await collection.findOne({email: req.body.email});

        if (curr_user != null) {
            return res.status(500).send("ERROR: an account with this username has already been created");
        }
        if (curr_email != null) {
            return res.status(500).send("ERROR: an account with this email has already been created");
        }

        let newDocument = {
            username: req.body.username,
            display_name: req.body.display_name,
            password: req.body.password,
            email: req.body.email,
            organization: req.body.organization,
            role: req.body.role,
            organization_permissions: req.body.organization_permissions,
            
        };
        
        let result = await collection.insertOne(newDocument)
        return res.send(result).status(204);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error adding user")
    }
});

// Modify information for a user
router.patch("/:id", async (req, res) => {
    try {
        // Check for duplicate usernames and emails
        let collection = await db.collection("Users");
        const curr_user = await collection.findOne({username: req.body.username});
        const curr_email = await collection.findOne({email: req.body.email});

        if (curr_user != null) {
            return res.status(500).send("ERROR: an account with this username has already been created");
        }
        if (curr_email != null) {
            return res.status(500).send("ERROR: an account with this email has already been created");
        }

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

        let result = await collection.updateOne(query, updatedDocument);
        return res.send(result).status(200);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error updating user")
    }
});

// Delete a survey
router.delete("/:id", async(req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)};
        const collection = db.collection("Users");
        let result = await collection.deleteOne(query);

        return res.send(result).status(200);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Error deleting user")
    }
});

export default router;