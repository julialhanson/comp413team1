import React, { useEffect, useState } from "react";
import { DbSurvey } from "../types";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../controllers/user-controller";

const SurveyListItem = ({ survey }: { survey: DbSurvey }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUsername(user.username);
    });
  }, []);

  return (
    <div
      className="bg-white rounded-xl mb-3 p-4 flex justify-between transition duration-100 cursor-pointer hover:bg-gray-100"
      onClick={() => {
        if (survey.published) {
          navigate(`/view-survey/${survey._id}`);
        } else {
          navigate(`/profile/${username}/drafts/${survey._id}`);
        }
      }}
    >
      <p>{survey.name ? survey.name : "<No name>"}</p>

      <p className="dark-grey italic">
        {survey.time_created && new Date(survey.time_created).toLocaleString()}
      </p>
    </div>
  );
};

export default SurveyListItem;
