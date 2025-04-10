import db from "../connection.js";

export const insertSurveyQuestionsAndChoices = async (questions) => {
  const surveyCollection = db.collection("Surveys");
  const questionCollection = db.collection("Questions");
  const choiceCollection = db.collection("Choices");

  const questionsToInsert = [];
  const questionsToUpdate = [];

  // Add all new questions
  for (const question of questions) {
    // Do not insert question into database if id already exists
    // if (question._id) continue; // TODO: won't add new options if the question already exists

    // const choiceDocs = question.choices.map((choice) => ({
    //   text: choice.text,
    // }));

    // Add all new choices
    const choiceDocs = [];
    console.log(question.choices);
    for (const choice of question.choices) {
      // Don't add option if id already exists
      if (choice._id) continue;

      choiceDocs.push({ text: choice.text });
    }

    console.log(choiceDocs);

    // Insert choices and get their _id values
    var choiceIds = [];
    if (choiceDocs.length) {
      const choiceInsertResult = await choiceCollection.insertMany(choiceDocs);
      choiceIds = Object.values(choiceInsertResult.insertedIds);
    }

    // Add new choice ids to existing choices
    const questionToInsert = {
      ...question,
      choice_ids: [...question.choices, ...choiceIds],
    };

    // TODO: actually not SUPPOSED to modify any questions, already do that outside of function
    // Only modify question if id already exists, otherwise insert new question
    if (question._id) {
      // const query = { _id: new ObjectId(question._id) };
      // const updatedDocument = { $set: questionToInsert };
      // const questionToUpdate = {
      //   updateOne: {
      //     filter: query,
      //     update: updatedDocument,
      //   },
      // };
      // questionsToUpdate.push(questionToUpdate);
      // // let result = await surveyCollection.updateOne(query, updatedDocument);
    } else {
      questionsToInsert.push(questionToInsert);
    }
  }

  // // Modify existing questions
  // const questionUpdateResult = await questionCollection.bulkWrite(
  //   questionsToUpdate
  // );

  // Insert new questions
  var newQuestionIds = [];
  if (questionsToInsert.length) {
    const questionInsertResult = await questionCollection.insertMany(
      questionsToInsert
    );

    newQuestionIds = Object.values(questionInsertResult.insertedIds);
  }
  console.log(newQuestionIds);
  return newQuestionIds;
};

export const modifySurveyQuestionsAndChoices = () => {};
