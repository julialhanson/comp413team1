import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Question, SurveyResponse } from "../types";
import { getQuestionsFromSurvey } from "../controllers/survey-controller";
import QuestionDisplay from "../components/question-display";
import { getResponseWithId } from "../controllers/response-controller";

const ViewResponse = () => {
  const { id: responseId } = useParams();

  const [surveyResponse, setSurveyResponse] = useState<SurveyResponse>();
  const [surveyName, setSurveyName] = useState<string>();
  const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([]);
  const [responseClassification, setResponseClassification] =
    useState<string>("unknown");

  useEffect(() => {
    getResponseWithId(responseId).then((response) => {
      console.log(response);
      setSurveyResponse(response);

      getQuestionsFromSurvey(response.survey_id).then((data) => {
        setSurveyName(data.name);
        setSurveyQuestions(data.questions);
      });
    });
  }, [responseId]);

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <div className="blue-bg rounded-xl text-center p-4 mb-5">
        <p>
          We've classified your response as...{" "}
          <span className="font-bold">{responseClassification}</span>.
        </p>
      </div>

      {surveyName ? (
        <>
          <h1 className="w-full bg-white rounded-xl p-4 mb-3 font-bold">
            {surveyName}
          </h1>
          {surveyQuestions.map((question, questionIdx) => (
            <QuestionDisplay
              key={questionIdx}
              question={question}
              selectedOptionIds={surveyResponse?.selected[questionIdx]}
              index={questionIdx}
            />
          ))}
        </>
      ) : (
        // <></>
        <p className="italic">
          The survey that you responded to may have been deleted.
        </p>
      )}
    </div>
  );
};

export default ViewResponse;
