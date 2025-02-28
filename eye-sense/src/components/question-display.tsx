import { Question } from "../types";

type QuestionDisplayProps = {
  question: Question;
  index: number;
  selectOption: (questionIdx: number, optionIdx: number) => void;
};

const QuestionDisplay = ({
  question,
  index,
  selectOption,
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
        <p className="mx-3 w-full mb-3">{question.text}</p>
      </div>

      {/* DISPLAY QUESTION OPTIONS */}
      <div className="flex flex-col">
        {question.type !== "dropdown" ? (
          <>
            {question.options.map((option) => (
              <label key={option.id} className="mb-2">
                <input
                  className="mr-2"
                  name={"question-" + index}
                  type={getOptionType(question.type)}
                  value={option.text}
                  onChange={() => selectOption(index, option.id)}
                />
                {option.text}
              </label>
            ))}
          </>
        ) : (
          <select className="border rounded-md p-2">
            {question.options.map((option) => (
              <option key={option.id}>{option.text}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;
