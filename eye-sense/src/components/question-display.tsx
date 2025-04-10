import { Question } from "../types";

type QuestionDisplayProps = {
  question: Question;
  index: number;
  isResponseDisplay: boolean;
  selectOption?: (questionIdx: number, optionId: string | undefined) => void;
  deselectOption?: (questionIdx: number, optionId: string | undefined) => void;
};

const QuestionDisplay = ({
  question,
  index,
  isResponseDisplay,
  selectOption,
  deselectOption,
}: QuestionDisplayProps) => {
  const getOptionType = (type: string) => {
    switch (type) {
      case "checkboxes":
        return "checkbox";
      default:
        return "radio";
    }
  };

  return (
    <div className="bg-white rounded-xl mb-3 p-4" key={index}>
      <div className="flex items-start">
        <h1 className="font-bold">{index + 1}</h1>
        <p className="mx-3 w-full mb-3">{question.question}</p>
      </div>

      {/* DISPLAY QUESTION OPTIONS */}
      <div className="flex flex-col">
        {question.type !== "dropdown" ? (
          <>
            {question.choices.map((choice) => (
              <label key={choice.id} className="mb-2">
                <input
                  className="mr-2"
                  name={"question-" + index}
                  type={getOptionType(question.type)}
                  value={choice.text}
                  onChange={
                    isResponseDisplay
                      ? () => {}
                      : (e) => {
                          if (e.target.checked) selectOption(index, choice._id);
                          else deselectOption(index, choice._id);
                        }
                  }
                />
                {choice.text}
              </label>
            ))}
          </>
        ) : (
          <select
            className="border rounded-md p-2"
            onChange={(e) => selectOption(index, e.target.value)}
          >
            <option value="" selected disabled hidden>
              Select an option...
            </option>
            {question.choices.map((choice) => (
              <option key={choice._id} value={choice._id}>
                {choice.text}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;
