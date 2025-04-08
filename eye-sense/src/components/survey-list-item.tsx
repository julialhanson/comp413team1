import React from "react";
import { DbSurvey } from "../types";
import { Link } from "react-router-dom";

const SurveyListItem = ({ survey }: { survey: DbSurvey }) => {
  return (
    <Link to={`/view-survey/${survey._id}`}>
      <div className="bg-white rounded-xl mb-3 p-4 flex justify-between transition duration-100 hover:bg-gray-100">
        <p>{survey.name ? survey.name : "<No name>"}</p>

        <p className="dark-grey italic">
          {survey.time_created && survey.time_created.toLocaleString()}
        </p>
      </div>
    </Link>
  );
};

export default SurveyListItem;
