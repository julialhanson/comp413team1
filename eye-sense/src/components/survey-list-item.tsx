import { Survey } from "../types";
import { useNavigate } from "react-router-dom";
import { deleteSurveyWithId } from "../controllers/survey-controller";

const SurveyListItem = ({
  username,
  survey,
  onDelete,
}: {
  username: string | undefined;
  survey: Survey;
  onDelete: (surveyId: string | undefined) => void;
}) => {
  const navigate = useNavigate();

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

      <div className="flex">
        <p className="dark-grey italic">
          {survey.time_created &&
            new Date(survey.time_created).toLocaleString()}
        </p>

        {/* DELETE SURVEY BUTTON */}
        <button
          className="dark-grey cursor-pointer pr-2 pl-5"
          onClick={(e) => {
            e.stopPropagation();
            deleteSurveyWithId(survey._id);
            onDelete(survey._id);
          }}
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default SurveyListItem;
