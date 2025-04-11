import { Survey, SurveyResponse } from "../types";
import { useNavigate } from "react-router-dom";

const ResponseListItem = ({
  survey,
  response,
}: {
  survey: Survey;
  response: SurveyResponse;
}) => {
  const navigate = useNavigate();

  console.log("survey:", survey);
  console.log("response:", response);

  return (
    <div
      className="bg-white rounded-xl mb-3 p-4 flex justify-between transition duration-100 cursor-pointer hover:bg-gray-100"
      onClick={() => {
        navigate(`/view-response/${response._id}`);
      }}
    >
      <p>{survey.name ? survey.name : "<No name>"}</p>

      <div className="flex">
        <p className="dark-grey italic">
          {response.time_taken &&
            new Date(response.time_taken).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ResponseListItem;
