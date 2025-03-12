import { useState } from "react";
import { Question } from "../types";
import QuestionDisplay from "../components/question-display";

const ViewSurvey = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_id: 1,
      text: "this is dummy question 1",
      type: "dropdown",
      selected: [],
      options: [
        {
          choice_id: 1,
          text: "option 1",
        },
        {
          choice_id: 3,
          text: "option 3",
        },
        {
          choice_id: 7,
          text: "option 7",
        },
      ],
    },
    {
      question_id: 2,
      text: "this is dummy question 2",
      type: "checkboxes",
      selected: [],
      options: [
        {
          choice_id: 2,
          text: "option 2",
        },
        {
          choice_id: 8,
          text: "option 8",
        },
        {
          choice_id: 9,
          text: "option 9",
        },
      ],
    },
    {
      question_id: 3,
      text: "this is dummy question 3",
      type: "multiple choice",
      selected: [],
      options: [
        {
          choice_id: 10,
          text: "option 10",
        },
        {
          choice_id: 11,
          text: "option 11",
        },
        {
          choice_id: 15,
          text: "option 15",
        },
      ],
    },
  ]);

  const selectOption = (questionIdx: number, optionIdx: number) => {
    const newQuestions = [...questions];
    const currQuestion = newQuestions[questionIdx];
    if (currQuestion.type !== "checkboxes") {
      currQuestion.selected = [optionIdx];
    } else {
      currQuestion.selected.push(optionIdx);
    }
    setQuestions(newQuestions);
  };

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      {questions.map((question, questionIdx) => (
        <QuestionDisplay
          key={questionIdx}
          question={question}
          index={questionIdx}
          selectOption={selectOption}
        />
      ))}

      <button className="btn blue-btn float-right">Submit</button>
    </div>
  );
};

export default ViewSurvey;
