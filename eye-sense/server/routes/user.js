import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../connection.js";
import { ObjectId } from "mongodb";
// import User from '../models/User';

const router = express.Router();

// Get all users in the database, or users specified by a specific field value
router.get("/", async (req, res) => {
  let collection = await db.collection("Users");
  let query = {};

  if (req.query.organization) {
    query.organization = req.query.organization;
  }
  if (req.query.username) {
    query.username = req.query.username;
  }
  if (req.query.email) {
    query.email = req.query.email;
  }
  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.organization_permissions) {
    query.organization = req.query.organization_permissions;
  }
  console.log("query length is ", Object.keys(query).length);

  if (Object.keys(query).length == 0) {
    let results = await collection.find({}).toArray();
    return res.send(results).status(200);
  } else {
    try {
      let users = await collection.find(query).toArray();
      return res.status(200).json(users)
    } catch (error) {
      return res.status(400).json({error: "Error fetching users", details: error.message});
    }
  }
});

// Get a specific user in the database
router.get("/:id", async (req, res) => {
  let collection = await db.collection("Users");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Replace information for a given user
router.put("/:id", async (req, res) => {
  try {
    // Checking for duplicate usernames and emails
    let collection = await db.collection("Users");
    const curr_user = await collection.findOne({ username: req.body.username });
    const curr_email = await collection.findOne({ email: req.body.email });

    if (curr_user != null) {
      return res
        .status(500)
        .send("ERROR: an account with this username has already been created");
    }
    if (curr_email != null) {
      return res
        .status(500)
        .send("ERROR: an account with this email has already been created");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const query = { _id: new ObjectId(req.params.id) };
    const updatedDocument = {
      $set: {
        username: req.body.username,
        display_name: req.body.display_name,
        password: hashedPassword,
        email: req.body.email,
        organization: req.body.organization,
        role: req.body.role,
        organization_permissions: req.body.organization_permissions,
      },
    };

    let result = await collection.updateOne(query, updatedDocument);

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
router.post("/", async (req, res) => {
  try {
    // Check for duplicate usernames or emails
    let collection = db.collection("Users");
    const curr_user = await collection.findOne({ username: req.body.username });
    const curr_email = await collection.findOne({ email: req.body.email });
    if (!req.body.username || !req.body.email) {
      return res.status(400).send("ERROR: need both username and email");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    if (curr_user != null || curr_email != null) {
      return res
        .status(400)
        .send(
          "ERROR: an account with this username or email has already been created"
        );
    }

    let newDocument = {
      username: req.body.username,
      display_name: req.body.display_name,
      password: hashedPassword,
      email: req.body.email,
      organization: req.body.organization,
      role: req.body.role,
      organization_permissions: req.body.organization_permissions,
    };

    let result = await collection.insertOne(newDocument);
    return res.send(result).status(204);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error adding user");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    let collection = await db.collection("Users");
    const curr_user = await collection.findOne({ username: username });
    // const curr_email = await collection.findOne({ email: req.body.email });
    if (curr_user && (await bcrypt.compare(password, curr_user.password))) {
      const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("token", token, {
        httpOnly: true, // Prevents JavaScript access (protects from XSS attacks)
        secure: true, // Only send over HTTPS (important for production)
        sameSite: "strict", // Prevents CSRF
        maxAge: 3600000, // 1 hour
      });

      res.status(200).json({ token });
    } else {
      res.status(401).send("Incorect Username or Password");
    }
  } catch (error) {
    console.log(error);
  }
});

// Modify information for a user
router.patch("/:id", async (req, res) => {
  try {
    // Check for duplicate usernames and emails
    let collection = await db.collection("Users");
    const userID = req.params.id;

    console.log("userID is ", userID);
    if (!ObjectId.isValid(userID)) {
      return res.status(400).send("ERROR: Invalid User ID format");
    }

    const query = { _id: new ObjectId(req.params.id) };
    const updates = {};
    for (const key in req.body) {
      if (req.body[key] != null) {
        if (key == "password") {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          console.log("hashed password is ", hashedPassword);
          updates[key] = hashedPassword;
        } else if (key == "username") {
          const dupe_user = await collection.findOne({ username: req.body.username });
          if (dupe_user != null) {
            return res
              .status(500)
              .send("ERROR: an account with this username has already been created");
          }
        } else if (key == "email") {
          const dupe_email = await collection.findOne({ email: req.body.email });
          if (dupe_email != null) {
            return res
              .status(500)
              .send("ERROR: an account with this username has already been created");
          }
        } else {
          updates[key] = req.body[key];
        }
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
    return res.status(500).send("Error updating user");
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = db.collection("Users");
    let result = await collection.deleteOne(query);

    return res.send(result).status(200);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error deleting user");
  }
});

// router.delete("/", async (req, res) => {
//   let collection = await db.collection("Users");
//   let query = {};

//   if (req.query.organization) {
//     query.organization = req.query.organization;
//   }
//   if (req.query.username) {
//     query.username = req.query.username;
//   }
//   if (req.query.email) {
//     query.email = req.query.email;
//   }
//   console.log("Query Length is ", Object.keys(query).length);
//   console.log("query is ", query);

//   if (Object.keys(query).length == 0) {
//     return res.status(400).send("ERROR: no parameters included in teh DELETE query request");
//   } else {
//     try {
//       let users = await db.collection("Users");
//       let result = users.deleteMany(query);
//       return res.send(result).status(200);
//     } catch (error) {
//       return res.status(400).json({error: "Error fetching users", details: error.message});
//     }
//   }
// })

export default router;
