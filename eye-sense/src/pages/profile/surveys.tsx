import React, { useEffect, useState } from "react";
import { Survey } from "../../types";
import { getSurveysWithQuery } from "../../controllers/survey-controller.ts";
import SurveyListItem from "../../components/survey-list-item";
import { useParams } from "react-router-dom";

const Surveys = () => {
  const { username } = useParams();

  const [publishedSurveys, setPublishedSurveys] = useState<Survey[] | null>([]);
  const [draftSurveys, setDraftSurveys] = useState<Survey[] | null>([]);

  useEffect(() => {
    if (username !== undefined) {
      getSurveysWithQuery({ user_created: username }).then((data: Survey[]) => {
        const published = data.filter(
          (survey: Survey) => survey.published == true
        );
        const drafts = data.filter(
          (survey: Survey) => survey.published != true
        );

        setPublishedSurveys(published);
        setDraftSurveys(drafts);
      });
    }
  }, [username]);

  const handleDeleteSurvey = (surveyId: string | undefined) => {
    if (surveyId === undefined) return;

    const newPublished = (publishedSurveys || []).filter(
      (published) => published._id !== surveyId
    );
    const newDrafts = (draftSurveys || []).filter(
      (draft) => draft._id !== surveyId
    );

    setPublishedSurveys(newPublished);
    setDraftSurveys(newDrafts);
  };

  return (
    <>
      <div className="max-w-2xl ml-auto mr-auto p-5">
        <div className="mb-10">
          <h1 className="font-bold tracking-wide text-xl mb-2">Published</h1>
          {publishedSurveys && publishedSurveys.length > 0 ? (
            publishedSurveys.map((survey, index) => {
              return (
                <SurveyListItem
                  key={index}
                  username={username}
                  survey={survey}
                  onDelete={handleDeleteSurvey}
                />
              );
            })
          ) : (
            <p className="italic dark-grey">No published surveys found.</p>
          )}
        </div>

        <div>
          <h1 className="font-bold tracking-wide text-xl mb-2">Drafts</h1>
          {draftSurveys && draftSurveys.length > 0 ? (
            draftSurveys.map((survey, index) => {
              return (
                <SurveyListItem
                  key={index}
                  username={username}
                  survey={survey}
                  onDelete={handleDeleteSurvey}
                />
              );
            })
          ) : (
            <p className="italic dark-grey">No drafts found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Surveys;
