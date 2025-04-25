import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Question, SurveyResponse } from "../types";
import { getQuestionsFromSurvey } from "../controllers/survey-controller";
import QuestionDisplay from "../components/question-display";
import { getResponseWithId } from "../controllers/response-controller";
import {
  getClassificationFromHeatmap,
  getHeatmapAsBase64FromGCP,
} from "../controllers/gcp-controller";

const ViewResponse = () => {
  const { id: responseId } = useParams();

  const [surveyResponse, setSurveyResponse] = useState<SurveyResponse>();
  const [surveyName, setSurveyName] = useState<string>();
  const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([]);
  const [responseClassification, setResponseClassification] =
    useState<string>("");

  const classificationFromPrediction: string[] = [
    "", // do not set a label to 0
    "novice",
    "med_student",
    "dermatologist",
  ];

  const predictionToDisplay: string[] = [
    "",
    "novice",
    "medical student",
    "dermatologist",
  ];

  useEffect(() => {
    getResponseWithId(responseId).then(async (response) => {
      console.log(response);
      setSurveyResponse(response);

      getQuestionsFromSurvey(response.survey_id).then((data) => {
        setSurveyName(data.name);
        setSurveyQuestions(data.questions);
      });

      // response.heatmaps.map(async (heatmap) => {
      //   const imageBase64 = await loadImageAsBase64(heatmap);
      //   console.log("heatmapBase64:", imageBase64);
      //   getClassificationFromHeatmap(imageBase64).then((data) => {
      //     setResponseClassification(data.predictions[0].displayNames[0]);
      //   });
      // });

      if (response.heatmap_urls) {
        const heatmapClassifications: number[] = await Promise.all(
          response.heatmap_urls.map(async (heatmapUrl: string | null) => {
            if (!heatmapUrl) return 0;

            const heatmapBase64Response = await getHeatmapAsBase64FromGCP(
              heatmapUrl
            );
            const heatmapBase64 = heatmapBase64Response.base64;
            console.log("heatmap64:", heatmapBase64);
            const indivHeatmapClassification =
              await getClassificationFromHeatmap(heatmapBase64);
            console.log(
              "indivHeatmapClassification:",
              indivHeatmapClassification
            );

            const classificationIdx = classificationFromPrediction.indexOf(
              indivHeatmapClassification.predictions[0].displayNames[0]
            );
            console.log("classificationIdx:", classificationIdx);
            return classificationIdx;
          })
        );

        console.log("heatmapClassifications:", heatmapClassifications);
        const nonZeroClassifiations = heatmapClassifications.filter(
          (item) => item > 0
        ); // do not count 0s

        if (nonZeroClassifiations.length === 0) return;

        const finalClassification =
          nonZeroClassifiations.reduce((a, b) => a + b) /
          nonZeroClassifiations.length;

        console.log("finalClassification:", finalClassification);

        setResponseClassification(predictionToDisplay[finalClassification]);
      }
    });
  }, [responseId]);

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      {responseClassification && (
        <div className="blue-bg rounded-xl text-center p-4 mb-5">
          <p>
            Based on your heatmaps, we've classified you as a{" "}
            <span className="font-bold">{responseClassification}</span>.
          </p>
        </div>
      )}

      {surveyName ? (
        <>
          <h1 className="w-full bg-white rounded-xl p-4 mb-3 font-bold">
            {surveyName}
          </h1>
          {surveyQuestions.map((question, questionIdx) => (
            <QuestionDisplay
              key={questionIdx}
              question={question}
              heatmapUrl={
                surveyResponse?.heatmaps
                  ? surveyResponse?.heatmaps[questionIdx]
                  : ""
              }
              selectedOptionIds={surveyResponse?.selected[questionIdx]}
              index={questionIdx}
            />
          ))}
        </>
      ) : (
        // <></>
        <p className="italic">
          The survey that you responded to may have been deleted.
        </p>
      )}
    </div>
  );
};

export default ViewResponse;
