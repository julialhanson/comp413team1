import React from "react";
import { DbSurvey } from "../types";
import { useNavigate } from "react-router-dom";

const SurveyListItem = ({ survey }: { survey: DbSurvey }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl mb-3 p-4 flex justify-between transition duration-100 cursor-pointer hover:bg-gray-100"
      onClick={() => navigate(`/view-survey/${survey._id}`)}
    >
      <p>{survey.name ? survey.name : "<No name>"}</p>

      <p className="dark-grey italic">
        {survey.time_created && new Date(survey.time_created).toLocaleString()}
      </p>
    </div>
  );
};

export default SurveyListItem;
