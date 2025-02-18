import React, { useState } from "react";

const Create = () => {
  const [surveyName, setSurveyName] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", type: "multiple choice", options: ["Option 1", "Option 2"] },
  ]);

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
    <div className="w-xl ml-auto mr-auto py-5">
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
          className="question-draft bg-white rounded-xl mb-3 p-3"
          key={index}
        >
          <div className="flex items-start justify-between">
            <input
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
              className="border p-2 rounded-full"
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
              <label key={optionIdx} className="pb-2">
                <input
                  name={"question-" + index}
                  type={getOptionType(question.type)}
                  value={option}
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
                    newQuestions[index].options[optionIdx] = e.target.value;
                    setQuestions(newQuestions);
                  }}
                />
              </label>
            ))}

            <div className="flex justify-between mt-2">
              {/* ADD OPTION BUTTON */}
              <button
                className="text-left btn grey-btn"
                onClick={() => {
                  const newQuestions = [...questions];
                  const optionsLength: number =
                    newQuestions[index].options.length;
                  newQuestions[index].options = [
                    ...newQuestions[index].options,
                    "Option " + (optionsLength + 1),
                  ];
                  setQuestions(newQuestions);
                }}
              >
                Add option
              </button>

              {/* DELETE QUESTION BUTTON */}
              <button
                className="btn blue-btn"
                onClick={() =>
                  setQuestions(
                    questions.filter(
                      (checkQuestion) => checkQuestion !== question
                    )
                  )
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ADD QUESTION BUTTON */}
      <button
        className="w-full bg-white rounded-xl text-left p-3"
        onClick={addQuestion}
      >
        Add question
      </button>
    </div>
  );
};

export default Create;
