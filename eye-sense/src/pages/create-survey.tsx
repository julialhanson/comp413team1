import { useEffect, useState } from "react";
import { Survey, Question } from "../types";
import {
  createSurvey,
  getQuestionsFromSurvey,
  modifySurveyWithId,
} from "../controllers/survey-controller.ts";
import { useNavigate, useParams } from "react-router-dom";
import ImageUpload from "../components/image-upload";
import { getCurrentUser } from "../controllers/user-controller.ts";
import ToggleButton from "../components/toggle-button.tsx";
import { modifyQuestionWithId } from "../controllers/question-controller.ts";
import { modifyChoiceWithId } from "../controllers/choice-controller.ts";

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { username, id: surveyId } = useParams();
  const [surveyName, setSurveyName] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [optionId, setOptionId] = useState<number>(1);

  useEffect(() => {
    getCurrentUser().then((user) => {
      getQuestionsFromSurvey(surveyId).then((data) => {
        if (user.username === username) {
          setSurveyName(data.name);
          setQuestions(data.questions);
        }
      });
    });
  }, [surveyId, username]);

  const getOptionType = (type: string) => {
    switch (type) {
      case "checkboxes":
        return "checkbox";
      case "dropdown":
        return "hidden";
      default:
        return "radio";
    }
  };

  const setQuestionImg = (newImg: File | null, index: number) => {
    const newQuestions = [...questions];
    const newQuestion = { ...newQuestions[index], image: newImg };
    newQuestions[index] = newQuestion;
    setQuestions(newQuestions);
  };

  const toggleQuestionTracking = (index: number) => {
    const newQuestions = [...questions];
    const oldQuestion = newQuestions[index];
    const newQuestion = {
      ...oldQuestion,
      is_tracking: !oldQuestion.is_tracking,
    };
    newQuestions[index] = newQuestion;
    setQuestions(newQuestions);
  };

  const addOption = (index: number) => {
    const newQuestions = [...questions];
    const optionsLength: number = newQuestions[index].choices.length;

    setOptionId(optionId + 1);

    newQuestions[index].choices = [
      ...newQuestions[index].choices,
      {
        id: "" + optionId,
        text: "Option " + (optionsLength + 1),
      },
    ];
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setOptionId(optionId + 1);

    const newQuestions = [
      ...questions,
      {
        id: questions.length + 1,
        question: "",
        image: null,
        type: "multiple choice",
        is_tracking: false,
        // selected: [],
        // Initialize question with at least one option
        choices: [
          {
            id: "" + optionId,
            text: "Option 1",
          },
        ],
      },
    ];
    setQuestions(newQuestions);
  };

  const deleteQuestion = (question: Question) => {
    setQuestions(
      questions.filter((checkQuestion) => checkQuestion !== question)
    );
  };

  const saveSurvey = (published: boolean) => {
    getCurrentUser()
      .then((user) => {
        // If we want to publish the survey
        if (published) {
          const survey: Survey = {
            name: surveyName,
            organization: user.organization,
            user_created: user.username,
            time_created: new Date(),
            last_edited: new Date(),
            published: published,
            questions: questions,
          };

          createSurvey(survey).then((data) => {
            const insertedSurveyId = data.insertedId;
            navigate(`/view-survey/${insertedSurveyId}`);
          });
        }
        // If we want to just save the survey as a draft
        else {
          const survey = {
            name: surveyName,
            last_edited: new Date(),
            published: published,
            questions: questions,
          };

          console.log(survey);

          for (const question of questions) {
            if (question._id) {
              const { _id, ...newQuestion } = question;

              for (const choice of newQuestion.choices) {
                if (choice._id) {
                  const { _id, ...newChoice } = choice;
                  modifyChoiceWithId(_id, newChoice);
                }
              }

              modifyQuestionWithId(_id, newQuestion);
            }
          }

          modifySurveyWithId(surveyId, survey);
          navigate(`/profile/${user.username}/surveys`);
        }
      })
      .catch(() => {
        console.log("Please log in and try again.");
      });
  };

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      {/* NAME SURVEY */}
      <div className="flex items-center justify-between mb-3">
        <input
          className="bg-white rounded-xl w-full h-full p-2 mr-2"
          type="text"
          value={surveyName}
          onChange={(e) => setSurveyName(e.target.value)}
          placeholder="Input survey name..."
        />

        <button className="btn blue-btn mr-2" onClick={() => saveSurvey(true)}>
          Publish
        </button>

        <button
          className="btn darker-grey-btn"
          onClick={() => saveSurvey(false)}
        >
          Save
        </button>
      </div>

      {/* DISPLAY QUESTIONS */}
      {questions.map((question, index) => (
        <div className="bg-white rounded-xl mb-3 p-4 relative" key={index}>
          <div className="flex items-start justify-between">
            <h1 className="font-bold">{index + 1}</h1>
            <input
              className="w-full mx-3"
              type="text"
              value={question.question}
              placeholder="Write your question..."
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].question = e.target.value;
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
          <div className="grid grid-cols-2">
            <div>
              {question.choices.map((option, optionIdx) => (
                <div key={option.id} className="mb-2 w-fit">
                  <button
                    className="text-red-600"
                    onClick={() => {
                      const newQuestions = [...questions];
                      const newOptions = question.choices.filter(
                        (_checkOption, checkOptionIdx) =>
                          checkOptionIdx !== optionIdx
                      );
                      newQuestions[index].choices = newOptions;
                      setQuestions(newQuestions);
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                  <label className="pb-2">
                    {/* INDICATOR BUTTON */}
                    <input
                      className="ml-2"
                      name={"question-" + index}
                      type={getOptionType(question.type)}
                      value={option.text}
                      disabled
                    />
                    {/* TEXT INPUT */}
                    <input
                      className="mx-2"
                      type="text"
                      placeholder={"Option " + (optionIdx + 1)}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].choices[optionIdx].text =
                          e.target.value;
                        setQuestions(newQuestions);
                      }}
                      // TODO: CHANGE THIS SO IT JUST SHOWS PLACEHOLDER FOR NEW OPTION
                      value={option.text ? option.text : ""}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="m-2">
              {/* DISPLAY IMAGE */}
              {/* <ImageUpload
                resetImage={() => {
                  setQuestionImg(null, index);
                }}
                imgFile={question.image}
              /> */}
            </div>
          </div>
          <div className="flex justify-between mt-2">
            {/* ADD OPTION BUTTON */}
            <button
              className="text-left btn grey-btn"
              onClick={() => addOption(index)}
            >
              Add option
            </button>

            <div className="flex justify-center items-center">
              {/* TOGGLE EYE TRACKING ONLY IF IMAGE EXISTS */}
              {questions[index].image && (
                <>
                  <i className="fa-solid fa-eye dark-grey mr-1"></i>
                  <ToggleButton
                    isToggled={questions[index].is_tracking}
                    toggleFunction={() => toggleQuestionTracking(index)}
                  />
                </>
              )}

              {/* UPLOAD IMAGE TO QUESTION BUTTON */}
              <button className="btn dark-grey">
                <label htmlFor={"questionImg-" + index}>
                  <i className="fa-solid fa-image cursor-pointer"></i>
                </label>
                <input
                  id={"questionImg-" + index}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setQuestionImg(e.target.files[0], index);
                    }
                  }}
                />
              </button>

              {/* DELETE QUESTION BUTTON */}
              <button
                className="btn dark-grey"
                onClick={() => deleteQuestion(question)}
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

export default CreateSurvey;
