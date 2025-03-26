import React, { useEffect, useState } from "react";
import { Survey } from "../../types";
import { getSurveysWithQuery } from "../../controllers/survey-controller";
import SurveyListItem from "../../components/survey-list-item";
import { useParams } from "react-router-dom";

const Surveys = () => {
  const { username } = useParams();

  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    // TODO: get username from session token??
    if (username !== undefined) {
      getSurveysWithQuery({ user_created: username }).then((data) => {
        console.log(data);
        setSurveys(data);
      });
    }
  }, []);

  return (
    <>
      {surveys.map((survey) => {
        // TODO: type check if survey is actually a Survey type
        <SurveyListItem survey={survey} />;
      })}
    </>
  );
};

export default Surveys;
