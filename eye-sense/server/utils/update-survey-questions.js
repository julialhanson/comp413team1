import db from "../connection.js";
import { ObjectId } from "mongodb";

export const insertSurveyQuestionsAndChoices = async (questions) => {
  const surveyCollection = db.collection("Surveys");
  const questionCollection = db.collection("Questions");
  const choiceCollection = db.collection("Choices");

  const questionsToInsert = [];
  const questionsToUpdate = [];

  // Add all new questions
  for (const question of questions) {
    // Add all new choices
    const choiceDocs = [];
    for (const choice of question.choices) {
      // Don't add option if id already exists
      if (choice._id) continue;

      choiceDocs.push({ text: choice.text });
    }

    // Insert choices and get their _id values
    var insertedChoiceIds = [];
    if (choiceDocs.length) {
      const choiceInsertResult = await choiceCollection.insertMany(choiceDocs);
      insertedChoiceIds = Object.values(choiceInsertResult.insertedIds)
        .map(choiceObjectId => choiceObjectId.toString());
    }

    // Add new choice ids to existing choices
    var existingChoiceIds = question.choices
      .filter(choice => choice._id !== null)
      .map(choice => choice._id);
    if (!existingChoiceIds || !existingChoiceIds[0]) existingChoiceIds = [];
    const questionToInsert = {
      ...question,
      choice_ids: existingChoiceIds.concat(insertedChoiceIds),
    };

    // Only modify question (add choices) if id already exists, otherwise insert new question
    if (question._id) {
      const query = { _id: new ObjectId(question._id) };
      const { _id, ...questionToModify } = questionToInsert;
      const updatedDocument = { $set: questionToModify };
      const questionToUpdate = {
        updateOne: {
          filter: query,
          update: updatedDocument,
        },
      };
      questionsToUpdate.push(questionToUpdate);
    } else {
      questionsToInsert.push(questionToInsert);
    }
  }

  // Modify existing questions
  const questionUpdateResult = await questionCollection.bulkWrite(
    questionsToUpdate
  );

  // Insert new questions
  var newQuestionIds = [];
  if (questionsToInsert.length) {
    const questionInsertResult = await questionCollection.insertMany(
      questionsToInsert
    );

    newQuestionIds = Object.values(questionInsertResult.insertedIds)
      .map((questionObjectId) => questionObjectId.toString());
  }
  return newQuestionIds;
};
