import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Survey } from "../types";
import { getSurveyWithId } from "../controllers/survey-controller";
import QuestionDisplay from "../components/question-display";

const ViewResponse = () => {
  const { id } = useParams();

  const [survey, setSurvey] = useState<Survey>();

  useEffect(() => {
    getSurveyWithId(id).then((data) => setSurvey(data));
  });

  return (
    <>
      {survey ? (
        <div className="max-w-2xl ml-auto mr-auto p-5">
          <h1 className="w-full bg-white rounded-xl p-4 mb-3 font-bold">
            {survey.name}
          </h1>
          {survey.questions.map((question, questionIdx) => (
            <QuestionDisplay
              key={questionIdx}
              question={question}
              index={questionIdx}
              isResponseDisplay={true}
            />
          ))}
        </div>
      ) : (
        <p>The survey that you responded to may have been deleted.</p>
      )}
    </>
  );
};

export default ViewResponse;
