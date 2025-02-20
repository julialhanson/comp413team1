import React, { useState } from "react";

const Create = () => {
  type Option = {
    id: number;
    text: string;
  };
  type Question = {
    text: string;
    type: string | "multiple choice" | "checkboxes" | "dropdown";
    options: Option[];
  };

  const [surveyName, setSurveyName] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [optionId, setOptionId] = useState<number>(1);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", type: "multiple choice", options: [] },
    ]);
  };

  const getOptionType = (type: string) => {
    switch (type) {
      case "checkboxes":
        return "checkbox";
      case "dropdown":
        return "option";
      default:
        return "radio";
    }
  };

  return (
    <div className="max-w-xl ml-auto mr-auto p-5">
      {/* NAME SURVEY */}
      <div className="flex items-center justify-between mb-3">
        <input
          className="bg-white rounded-xl w-full h-full p-2 mr-2"
          type="text"
          value={surveyName}
          onChange={(e) => setSurveyName(e.target.value)}
          placeholder="Input survey name..."
        />
        <button className="btn blue-btn">Publish</button>
      </div>

      {/* DISPLAY QUESTIONS */}
      {questions.map((question, index) => (
        <div
          className="question-draft bg-white rounded-xl mb-3 p-4"
          key={index}
        >
          <div className="flex items-start justify-between">
            <h1 className="font-bold">{index + 1}</h1>
            <input
              className="w-full mx-3"
              type="text"
              value={question.text}
              placeholder="Write your question..."
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].text = e.target.value;
                setQuestions(newQuestions);
              }}
            />

            {/* SELECT QUESTION TYPE */}
            <select
              className="border p-2 rounded-full cursor-pointer"
              value={question.type}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].type = e.target.value;
                setQuestions(newQuestions);
              }}
            >
              <option value="multiple choice">Multiple Choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>

          {/* DISPLAY QUESTION OPTIONS */}
          <div className="flex flex-col">
            {question.options.map((option, optionIdx) => (
              <div key={option.id} className="mb-2">
                <button
                  className="text-red-600 mr-2"
                  onClick={() => {
                    const newQuestions = [...questions];
                    const newOptions = question.options.filter(
                      (_checkOption, checkOptionIdx) =>
                        checkOptionIdx !== optionIdx
                    );
                    newQuestions[index].options = newOptions;
                    setQuestions(newQuestions);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <label className="pb-2">
                  <input
                    name={"question-" + index}
                    type={getOptionType(question.type)}
                    value={option.text}
                    disabled
                    // checked={selectedValue === option}
                    // onChange={onChange}
                  />
                  <input
                    className="mx-2"
                    type="text"
                    placeholder={"Option " + (optionIdx + 1)}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].options[optionIdx].text =
                        e.target.value;
                      setQuestions(newQuestions);
                    }}
                  />
                </label>
              </div>
            ))}

            <div className="flex justify-between mt-2">
              {/* ADD OPTION BUTTON */}
              <button
                className="text-left btn grey-btn"
                onClick={() => {
                  const newQuestions = [...questions];
                  const optionsLength: number =
                    newQuestions[index].options.length;
                  setOptionId(optionId + 1);
                  newQuestions[index].options = [
                    ...newQuestions[index].options,
                    {
                      id: optionId,
                      text: "Option " + (optionsLength + 1),
                    },
                  ];
                  setQuestions(newQuestions);
                }}
              >
                Add option
              </button>

              {/* DELETE QUESTION BUTTON */}
              <button
                className="btn text-gray-500"
                onClick={() =>
                  setQuestions(
                    questions.filter(
                      (checkQuestion) => checkQuestion !== question
                    )
                  )
                }
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ADD QUESTION BUTTON */}
      <button
        className="w-full bg-white rounded-xl text-left p-3 cursor-pointer text-gray-500"
        onClick={addQuestion}
      >
        <i className="fa-solid fa-plus px-1"></i> Add question
      </button>
    </div>
  );
};

export default Create;
