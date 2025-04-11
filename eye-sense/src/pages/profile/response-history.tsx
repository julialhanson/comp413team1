import React, { useEffect, useState } from "react";
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
      // Get all responses made by current user
      getResponsesWithQuery({ username: username }).then(
        (data: SurveyResponse[]) => {
          console.log("responses with query:", data);
          // For each survey response
          for (const response of data) {
            console.log("individual response:", response);
            // Get the corresponding survey opject
            getSurveyWithId(response.survey_id).then((survey) => {
              // Map the survey response to its survey object
              setMapResponseToSurvey((prevMapResponseToSurvey) => {
                const newMapResponseToSurvey = new Map(prevMapResponseToSurvey);
                newMapResponseToSurvey.set(response, survey);
                return newMapResponseToSurvey;
              });
              console.log(mapResponseToSurvey);
            });
          }
        }
      );
    }
  }, [username]);

  // const getSurveyForResponse = async (
  //   response: SurveyResponse
  // ): Promise<Survey> => {
  //   return await getSurveyWithId(response.survey_id);
  // };

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <h1 className="font-bold tracking-wide text-xl mb-2">Past Responses</h1>
      {mapResponseToSurvey && mapResponseToSurvey.size > 0 ? (
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
