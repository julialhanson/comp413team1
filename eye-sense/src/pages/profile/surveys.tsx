import React, { useEffect, useState } from "react";
import { DbSurvey } from "../../types";
import { getSurveysWithQuery } from "../../controllers/survey-controller.ts";
import SurveyListItem from "../../components/survey-list-item";
import { useParams } from "react-router-dom";
import TimeoutModal from "../../components/timeout-modal.tsx";

const Surveys = () => {
  const { username } = useParams();

  const [publishedSurveys, setPublishedSurveys] = useState<DbSurvey[] | null>(
    []
  );
  const [draftSurveys, setDraftSurveys] = useState<DbSurvey[] | null>([]);

  useEffect(() => {
    if (username !== undefined) {
      getSurveysWithQuery({ user_created: username }).then(
        (data: DbSurvey[]) => {
          const published = data.filter(
            (survey: DbSurvey) => survey.published == true
          );
          const drafts = data.filter(
            (survey: DbSurvey) => survey.published != true
          );

          setPublishedSurveys(published);
          setDraftSurveys(drafts);
        }
      );
    }
  }, [username]);

  return (
    <>
      <div className="max-w-2xl ml-auto mr-auto p-5">
        <div className="mb-10">
          <h1 className="font-bold tracking-wide text-xl mb-2">Published</h1>
          {publishedSurveys && publishedSurveys.length > 0 ? (
            publishedSurveys.map((survey, index) => {
              return <SurveyListItem key={index} survey={survey} />;
            })
          ) : (
            <p className="italic dark-grey">No published surveys found.</p>
          )}
        </div>

        <div>
          <h1 className="font-bold tracking-wide text-xl mb-2">Drafts</h1>
          {draftSurveys && draftSurveys.length > 0 ? (
            draftSurveys.map((survey, index) => {
              return <SurveyListItem key={index} survey={survey} />;
            })
          ) : (
            <p className="italic dark-grey">No drafts found.</p>
          )}
        </div>
      </div>

      {!(publishedSurveys || draftSurveys) && <TimeoutModal />}
    </>
  );
};

export default Surveys;
