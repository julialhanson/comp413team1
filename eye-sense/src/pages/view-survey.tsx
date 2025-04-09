import { useEffect, useState } from "react";
import { Question, SurveyResponse } from "../types";
import QuestionDisplay from "../components/question-display";
import {
  getQuestionsFromSurvey,
  submitResponse,
} from "../controllers/survey-controller.ts";
import { useParams } from "react-router-dom";

const ViewSurvey = () => {
  const { id } = useParams();
  const [surveyName, setSurveyName] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [response, setResponse] = useState<SurveyResponse>({
    username: "username", // TODO: CHANGE WHEN WE CAN GET USERNAME
    survey_id: id,
    time_taken: new Date(),
    selected: [],
    heatmaps: new Map<number, string>(),
  });

  useEffect(() => {
    getQuestionsFromSurvey(id).then((data) => {
      setSurveyName(data.name);
      setQuestions(data.questions);

      // Initialize "selected" array to be the length of the survey so each index corresponds to the same question
      const initSelected = new Array(data.length).fill([]);
      setResponse((prevResponse) => ({
        ...prevResponse,
        selected: initSelected,
      }));
    });
  }, [id]);

  const selectOption = (questionIdx: number, optionId: string) => {
    const currQuestion = questions[questionIdx];
    const newSelected = [...response.selected];
    if (currQuestion.type !== "checkboxes") {
      newSelected[questionIdx] = [optionId];
    } else {
      newSelected[questionIdx].push(optionId);
    }
    setResponse((prevResponse) => ({
      ...prevResponse,
      selected: newSelected,
    }));
  };

  const deselectOption = (questionIdx: number, optionId: string) => {
    const newSelected = [...response.selected];
    newSelected[questionIdx] = newSelected[questionIdx].filter(
      (selected) => selected !== optionId
    );
    setResponse((prevResponse) => ({
      ...prevResponse,
      selected: newSelected,
    }));
  };

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <h1 className="w-full bg-white rounded-xl p-4 mb-3 font-bold">
        {surveyName}
      </h1>
      {questions.map((question, questionIdx) => (
        <QuestionDisplay
          key={questionIdx}
          question={question}
          index={questionIdx}
          selectOption={selectOption}
          deselectOption={deselectOption}
        />
      ))}

      <button
        className="btn blue-btn float-right"
        onClick={() => submitResponse(id, response)}
      >
        Submit
      </button>
    </div>
  );
};

export default ViewSurvey;
