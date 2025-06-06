import { useEffect, useState } from "react";
import { Question, SurveyResponse } from "../types";
import QuestionDisplay from "../components/question-display";
import {
  getQuestionsFromSurvey,
  postResponse,
} from "../controllers/survey-controller.ts";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../controllers/user-controller.ts";
import Container from "../components/container.tsx";

const ViewSurvey = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [surveyName, setSurveyName] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [response, setResponse] = useState<SurveyResponse>({
    username: "",
    survey_id: id,
    time_taken: new Date(),
    selected: [],
    heatmap_urls: [],
  });

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) return;

      getQuestionsFromSurvey(id).then((data) => {
        setSurveyName(data.name);
        setQuestions(data.questions);

        console.log("data.questions:", data.questions);

        // Initialize "selected"/"heatmaps" array to be the length of the survey so each index corresponds to the same question
        const initSelected = new Array(data.length).fill([]);
        const initHeatmaps = new Array(data.length).fill(null);
        setResponse((prevResponse) => ({
          ...prevResponse,
          username: user.username,
          selected: initSelected,
          heatmap_urls: initHeatmaps,
        }));
      });
    });
  }, []);

  const submitResponse = () => {
    postResponse(id, response).then((data) => {
      navigate(`/view-response/${data.insertedId}`);
    });
  };

  const selectOption = (questionIdx: number, optionId: string | undefined) => {
    if (optionId === undefined) {
      console.error("Option does not exist. Please close out the survey.");
      return;
    }

    const currQuestion = questions[questionIdx];
    const newSelected = [...response.selected];

    if (currQuestion.type !== "checkboxes") {
      newSelected[questionIdx] = [optionId];
    } else {
      if (!newSelected[questionIdx]) {
        newSelected[questionIdx] = [];
      }
      newSelected[questionIdx].push(optionId);
    }
    setResponse((prevResponse) => ({
      ...prevResponse,
      selected: newSelected,
    }));
    console.log("newSelected after:", newSelected);
  };

  const deselectOption = (
    questionIdx: number,
    optionId: string | undefined
  ) => {
    const newSelected = [...response.selected];
    newSelected[questionIdx] = newSelected[questionIdx].filter(
      (selected) => selected !== optionId
    );
    setResponse((prevResponse) => ({
      ...prevResponse,
      selected: newSelected,
    }));
  };

  const assignHeatmapUrlToQuestion = (
    questionIdx: number,
    // heatmap: File,
    heatmapUrl: string
  ) => {
    const newHeatmapUrls = [...response.heatmap_urls];
    newHeatmapUrls[questionIdx] = heatmapUrl;
    setResponse((prevResponse) => ({
      ...prevResponse,
      heatmap_urls: newHeatmapUrls,
    }));
  };

  return (
    <Container>
      <h1 className="w-full bg-white rounded-xl p-4 mb-3 font-bold">
        {surveyName}
      </h1>
      {questions.map((question, questionIdx) => (
        <QuestionDisplay
          key={questionIdx}
          question={question}
          index={questionIdx}
          heatmapUrl={response.heatmap_urls[questionIdx]}
          selectOption={selectOption}
          deselectOption={deselectOption}
          assignHeatmapUrlToQuestion={assignHeatmapUrlToQuestion}
        />
      ))}

      <div className="flex justify-end">
        <button className="btn blue-btn" onClick={submitResponse}>
          Submit
        </button>
      </div>
    </Container>
  );
};

export default ViewSurvey;
