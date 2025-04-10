import express from "express";

import db from "../connection.js";

import { ObjectId } from "mongodb";
import { authenticateToken } from "../utils/authenticate.js";

const router = express.Router();

// Get all surveys in the database
router.get("/", authenticateToken, async (req, res) => {
  let collection = await db.collection("Surveys");
  let query = {};

  if (req.query.organization) {
    query.organization = req.query.organization;
  }
  if (req.query.published) {
    query.published = req.query.published;
  }
  if (req.query.user_created) {
    query.user_created = req.query.user_created;
  }
  if (req.query.question_ids) {
    query.question_ids = req.query.question_ids;
  }
  if (req.query.time_created) {
    query.time_created = req.query.time_created;
  }

  console.log("query length is ", Object.keys(query).length);
  console.log(req.user);

  if (Object.keys(query).length == 0) {
    let results = await collection.find({}).toArray();
    return res.send(results).status(200);
  } else {
    try {
      let surveys = await collection.find(query).toArray();
      return res.status(200).json(surveys);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Error fetching surveys", details: error.message });
    }
  }
});

// Get a specific survey in the database
router.get("/:id", async (req, res) => {
  let collection = await db.collection("Surveys");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Get the list of questions in specific survey in the database
router.get("/:id/questions", async (req, res) => {
  let surveyCollection = db.collection("Surveys");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await surveyCollection.findOne(query);

  if (!result) {
    console.error(`Error getting survey with id ${req.params.id}`);
    res.send("Not found").status(404);
    return;
  }

  // Extract question IDs from the survey
  const questionIds = result.question_ids?.map((id) => new ObjectId(id)) || [];

  if (questionIds.length === 0 || questionIds === null)
    return res.status(404).send([]);

  // Find the questions in the Questions collection
  const questions = await db
    .collection("Questions")
    .find({ _id: { $in: questionIds } })
    .toArray();

  // Fetch choices for each question
  const questionsWithChoices = await Promise.all(
    questions.map(async (question) => {
      const choiceIds =
        question.choice_ids?.map((id) => new ObjectId(id)) || [];
      const choices = await db
        .collection("Choices")
        .find({ _id: { $in: choiceIds } })
        .toArray();

      const { choice_ids, ...restOfQuestion } = question;
      return { ...restOfQuestion, choices };
    })
  );

  res.send({ name: result.name, questions: questionsWithChoices }).status(200);
});

// Modify information in a given survey
router.put("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updatedDocument = {
      $set: {
        organization: req.body.organization,
        user_created: req.body.user_created,
        time_created: req.body.time_created,
        last_edited: req.body.last_edited,
        published: req.body.published,
        questions: req.body.questions,
      },
    };

    let collection = await db.collection("Surveys");
    let result = await collection.updateOne(query, updatedDocument);

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
router.post("/", async (req, res) => {
  try {
    // Insert choices into database
    const questions = req.body.questions;
    const choiceCollection = db.collection("Choices");
    const surveyCollection = db.collection("Surveys");
    const questionCollection = db.collection("Questions");

    const questionsToInsert = [];

    for (const question of questions) {
      const choiceDocs = question.choices.map((choice) => ({
        text: choice.text,
      }));

      // Insert choices and get their _id values
      const choiceInsertResult = await choiceCollection.insertMany(choiceDocs);
      const choiceIds = Object.values(choiceInsertResult.insertedIds);

      // Replace choices with _id references
      const questionToInsert = {
        question: question.question,
        type: question.type,
        // organization: question.organization,
        // user_created: question.user_created,
        // time_created: question.time_created,
        // last_edited: question.last_edited,
        image: question.image,
        choice_ids: choiceIds,
      };

      questionsToInsert.push(questionToInsert);
    }

    // Insert surveys
    const questionInsertResult = await questionCollection.insertMany(
      questionsToInsert
    );

    const questionIds = Object.values(questionInsertResult.insertedIds);

    let newDocument = {
      // survey_id: req.body.survey_id,
      name: req.body.name,
      organization: req.body.organization,
      user_created: req.body.user_created,
      time_created: req.body.time_created,
      last_edited: req.body.last_edited,
      published: req.body.published,
      question_ids: questionIds, //req.body.questions//.map((q) => q.question_id),
    };

    let result = await surveyCollection.insertOne(newDocument);
    return res.send(result).status(201);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error adding survey");
  }
});

// Modify information for a survey
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    let updates = {};
    for (const key in req.body) {
      if (req.body[key] != null) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length == 0) {
      console.log("length of request body was ", Object.keys(updates).length);
      return res.status(500).send("ERROR: request body empty");
    }

    if (updates["questions"]) {
      const { questions, ...newUpdates } = updates;
      const questionIds = questions.map((question) => {
        return question._id;
      });
      newUpdates["question_ids"] = questionIds;
      updates = newUpdates;
    }

    const updatedDocument = { $set: updates };
    let collection = await db.collection("Surveys");
    let result = await collection.updateOne(query, updatedDocument);
    return res.send(result).status(200);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error updating survey");
  }
});

// Delete a survey
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = db.collection("Surveys");
    let result = await collection.deleteOne(query);

    return res.send(result).status(200);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error deleting survey");
  }
});

router.delete("/items", async (req, res) => {
  try {
    let collection = await db.collection("Surveys");

    // Build the query dynamically based on request body
    let query = {};
    if (req.body.survey_id) query.survey_id = req.body.survey_id;
    if (req.body.organization) query.organization = req.body.organization;
    if (req.body.user_created) query.user_created = req.body.user_created;
    if (req.body.time_created) query.time_created = req.body.time_created;
    if (req.body.last_edited) query.last_edited = req.body.last_edited;
    if (req.body.published !== undefined) query.published = req.body.published;
    if (req.body.questions) query.questions = req.body.questions;

    let result = await collection.deleteMany(query);

    if (result.deletedCount === 0) {
      res.status(404).send("No matching surveys found to delete");
    } else {
      res.send(result).status(200);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get all responses to a specific survey
router.get("/:id/responses", async (req, res) => {
  try {
    // Find responses with the given survey_id
    const responses = await db
      .collection("Responses")
      .find({ survey_id: req.params.id })
      .toArray();

    if (responses.length === 0) {
      return res.status(404).json([]); // Return empty array if no responses found
    }

    res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Submit a new response to a specific survey
router.post("/:id/responses", async (req, res) => {
  try {
    let newDocument = {
      username: req.body.username,
      survey_id: req.params.id,
      time_taken: req.body.time_taken,
      selected: req.body.selected,
      heatmaps: req.body.heatmaps,
    };
    let collection = await db.collection("Responses");
    let result = await collection.insertOne(newDocument);
    return res.send(result).status(204);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error submitting response");
  }
});

export default router;
