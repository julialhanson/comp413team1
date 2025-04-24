import { useState } from "react";
import { Question } from "../types";
// import WebGazer from "./web-gazer";
import TestWebGazer from "./test-web-gazer";

type QuestionDisplayProps = {
  question: Question;
  index: number;
  selectedOptionIds?: string[] | undefined;
  heatmapUrl?: string;
  selectOption?: (questionIdx: number, optionId: string | undefined) => void;
  deselectOption?: (questionIdx: number, optionId: string | undefined) => void;
  assignHeatmapUrlToQuestion?: (
    questionIdx: number,
    heatmapUrl: string
  ) => void;
};

const QuestionDisplay = ({
  question,
  index,
  selectedOptionIds,
  heatmapUrl,
  selectOption,
  deselectOption,
  assignHeatmapUrlToQuestion,
}: QuestionDisplayProps) => {
  const isResponseDisplay =
    selectOption && deselectOption && assignHeatmapUrlToQuestion ? false : true;

  const [localHeatmapUrl, setLocalHeatmapUrl] = useState<string>();
  const [webGazerIsOpen, setWebGazerIsOpen] = useState<boolean>(false);

  const getOptionType = (type: string) => {
    switch (type) {
      case "checkboxes":
        return "checkbox";
      default:
        return "radio";
    }
  };

  const getImageUrl = () => {
    return question.image instanceof File
      ? URL.createObjectURL(question.image)
      : !question.image
      ? undefined
      : question.image;
  };

  return (
    <>
      <div className="bg-white rounded-xl mb-3 p-4" key={index}>
        <div className="flex items-start">
          <h1 className="font-bold">{index + 1}</h1>
          <p className="mx-3 w-full mb-3">{question.question}</p>
        </div>

        {/* DISPLAY QUESTION OPTIONS */}
        <div className="grid grid-cols-2">
          <div>
            {question.type !== "dropdown" ? (
              <>
                {question.choices.map((choice, choiceIdx) => (
                  <div key={choiceIdx} className="mb-2 w-fit">
                    <label key={choice._id}>
                      <input
                        className="mr-2"
                        name={"question-" + index}
                        type={getOptionType(question.type)}
                        disabled={isResponseDisplay}
                        checked={
                          choice._id
                            ? selectedOptionIds?.includes(choice._id)
                            : false
                        }
                        value={choice.text}
                        onChange={
                          selectOption && deselectOption
                            ? (e) => {
                                if (e.target.checked)
                                  selectOption(index, choice._id);
                                else deselectOption(index, choice._id);
                              }
                            : undefined
                        }
                      />
                      {choice.text}
                    </label>
                  </div>
                ))}
              </>
            ) : (
              <select
                className="border rounded-md p-2"
                onChange={
                  selectOption
                    ? (e) => selectOption(index, e.target.value)
                    : undefined
                }
                disabled={isResponseDisplay}
              >
                <option value="" selected hidden>
                  Select an option...
                </option>
                {question.choices.map((choice) => (
                  <option
                    key={choice._id}
                    value={choice._id}
                    selected={
                      choice._id
                        ? selectedOptionIds?.includes(choice._id)
                        : false
                    }
                  >
                    {choice.text}
                  </option>
                ))}
              </select>
            )}
          </div>

          {question.image && (
            <div className="relative m-2">
              <img
                src={
                  isResponseDisplay
                    ? heatmapUrl
                    : localHeatmapUrl
                    ? localHeatmapUrl
                    : question.image instanceof File
                    ? URL.createObjectURL(question.image)
                    : question.image
                }
                alt=""
              />

              {!isResponseDisplay && question.is_tracking && (
                <>
                  <div
                    className={`size-full transparent-black-bg center-screen`}
                  ></div>

                  <p
                    onClick={() => setWebGazerIsOpen(true)}
                    className="center-screen italic grey-btn btn w-max"
                  >
                    {localHeatmapUrl
                      ? "Redo eye tracking"
                      : "Start eye tracking"}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {webGazerIsOpen && (
        <TestWebGazer
          imageUrl={getImageUrl()}
          closeWebGazer={() => setWebGazerIsOpen(false)}
          assignHeatmapUrlToCurrentQuestion={(
            heatmapUrl: string,
            localHeatmapUrl: string
          ) => {
            if (assignHeatmapUrlToQuestion) {
              assignHeatmapUrlToQuestion(index, heatmapUrl);
            }
            console.log("localHeatmapUrl:", localHeatmapUrl);
            setLocalHeatmapUrl(localHeatmapUrl);
          }}
        />
      )}
    </>
  );
};

export default QuestionDisplay;
