import { Question } from "../types";

type QuestionDisplayProps = {
  question: Question;
  index: number;
  selectedOptionIds?: string[] | undefined;
  selectOption?: (questionIdx: number, optionId: string | undefined) => void;
  deselectOption?: (questionIdx: number, optionId: string | undefined) => void;
};

const QuestionDisplay = ({
  question,
  index,
  selectedOptionIds,
  selectOption,
  deselectOption,
}: QuestionDisplayProps) => {
  const isResponseDisplay = selectOption && deselectOption ? false : true;

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
              <label key={choice._id} className="mb-2">
                <input
                  className="mr-2"
                  name={"question-" + index}
                  type={getOptionType(question.type)}
                  disabled={isResponseDisplay}
                  checked={
                    choice._id ? selectedOptionIds?.includes(choice._id) : false
                  }
                  value={choice.text}
                  onChange={
                    selectOption && deselectOption
                      ? (e) => {
                          if (e.target.checked) selectOption(index, choice._id);
                          else deselectOption(index, choice._id);
                        }
                      : undefined
                  }
                />
                {choice.text}
              </label>
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
                  choice._id ? selectedOptionIds?.includes(choice._id) : false
                }
              >
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
