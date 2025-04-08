import React, { useEffect, useState } from "react";
import { DbSurvey } from "../../types";
import { getSurveysWithQuery } from "../../controllers/survey-controller.ts";
import SurveyListItem from "../../components/survey-list-item";
import { useParams } from "react-router-dom";

const Surveys = () => {
  const { username } = useParams();

  const [surveys, setSurveys] = useState<DbSurvey[]>([]);

  useEffect(() => {
    if (username !== undefined) {
      getSurveysWithQuery({ user_created: username }).then((data) => {
        console.log(data);
        setSurveys(data);
      });
    }
  }, [username]);

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <h1 className="font-bold tracking-wide text-xl mb-2">Published</h1>
      {surveys.map((survey) => {
        return <SurveyListItem survey={survey} />;
      })}

      <h1 className="font-bold tracking-wide text-xl mb-2">Drafts</h1>
    </div>
  );
};

export default Surveys;
