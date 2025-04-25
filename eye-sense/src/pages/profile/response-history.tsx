import { useEffect, useState } from "react";
import { Survey, SurveyResponse } from "../../types";
import { useParams } from "react-router-dom";
import { getResponsesWithQuery } from "../../controllers/response-controller";
import { getSurveyWithId } from "../../controllers/survey-controller";
import ResponseListItem from "../../components/response-list-item";

const ResponseHistory = () => {
  const { username } = useParams();

  const [mapResponseToSurvey, setMapResponseToSurvey] = useState<
    Map<SurveyResponse, Survey>
  >(new Map());

  useEffect(() => {
    if (username !== undefined) {
      // Get all responses made by user in parameters
      getResponsesAndSurveys().then((surveyResponses) => {
        const numResponses = surveyResponses.length;

        // Map the responses to surveys and update the state in one go
        setMapResponseToSurvey((prevMapResponseToSurvey) => {
          const newMapResponseToSurvey = new Map<SurveyResponse, Survey>(
            JSON.parse(JSON.stringify(Array.from(prevMapResponseToSurvey)))
          );

          surveyResponses.forEach(({ response, survey }) => {
            newMapResponseToSurvey.set(response, survey);
          });

          // Make sure mapResponseToSurvey does not overpopulate with duplicates
          if (newMapResponseToSurvey.size > numResponses) {
            return prevMapResponseToSurvey;
          }

          return newMapResponseToSurvey;
        });
      });
    }
  }, []);

  const getResponsesAndSurveys = async () => {
    if (username === undefined) return [];

    const data = await getResponsesWithQuery({ username: username });
    const surveyPromises = data.map(async (response: SurveyResponse) => {
      const survey: Survey = await getSurveyWithId(response.survey_id);
      return { response, survey };
    });

    return Promise.all(surveyPromises);
  };

  // const getSurveyForResponse = async (
  //   response: SurveyResponse
  // ): Promise<Survey> => {
  //   return await getSurveyWithId(response.survey_id);
  // };

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <h1 className="font-bold tracking-wide text-xl mb-2">Past Responses</h1>
      {mapResponseToSurvey.size > 0 ? (
        Array.from(mapResponseToSurvey)
          .sort((a, b) => {
            return +b[0].time_taken - +a[0].time_taken;
          })
          .map(([response, survey], index) => (
            <ResponseListItem key={index} survey={survey} response={response} />
          ))
      ) : (
        <p className="italic dark-grey">No response history found.</p>
      )}
      {/* {mapResponseToSurvey && mapResponseToSurvey.length > 0 ? (
        mapResponseToSurvey.map((response, index) => {
          return (
            <SurveyListItem
              key={index}
              username={username}
              survey={getSurveyForResponse(response)}
            />
          );
        })
      ) : (
        <p className="italic dark-grey">No published surveys found.</p>
      )} */}
    </div>
  );
};

export default ResponseHistory;
