import axios from "axios";
import { Question } from "../types";
import { createQueryString } from "../utils/func-utils";

const API_URL = "http://localhost:3000/api/v1/questions"; // Adjust for production

export const getAllQuestions = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return null;
  }
};

export const createQuestion = async (question: Question) => {
  try {
    const response = await axios.post(API_URL, question);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    return null;
  }
};

export const getQuestionWithId = async (id: number) => {
  try {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question with id ${id}:`, error);
    return null;
  }
};

export const deleteQuestionWithId = async (id: number) => {
  try {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question with id ${id}:`, error);
    return null;
  }
};

// export const updateQuestionWithId = async (id: number, question: Question) => {
//   try {
//     const response = await axios.put(API_URL + `/${id}`, question);
//     return response.data;
//   } catch (error) {
//     console.error(`Error updating question with id ${id}:`, error);
//     return null;
//   }
// };

export const getQuestionsWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await axios.get(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching questions with query ${queryStr}:`, error);
    return null;
  }
};

export const deleteQuestionsWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await axios.delete(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching questions with query ${queryStr}:`, error);
    return null;
  }
};
