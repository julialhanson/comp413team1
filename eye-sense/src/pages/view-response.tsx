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
    <>
      {surveyName ? (
        <div className="max-w-2xl ml-auto mr-auto p-5">
          <h1 className="w-full bg-white rounded-xl p-4 mb-3 font-bold">
            {surveyName}
          </h1>
          {surveyQuestions.map((question, questionIdx) => (
            <QuestionDisplay
              key={questionIdx}
              question={question}
              heatmapUrl={
                surveyResponse?.heatmaps
                  ? surveyResponse?.heatmaps[questionIdx]
                  : ""
              }
              selectedOptionIds={surveyResponse?.selected[questionIdx]}
              index={questionIdx}
            />
          ))}
        </div>
      ) : (
        <></>
        // <p>The survey that you responded to may have been deleted.</p>
      )}
    </>
  );
};

export default ViewResponse;
