import { Question } from "../types";
import { createQueryString } from "../utils/func-utils";
import api from "../utils/axios";

const API_URL = "/questions"; // Adjust for production

export const getAllQuestions = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return null;
  }
};

export const createQuestion = async (question: Question) => {
  try {
    const response = await api.post(API_URL, question);
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    return null;
  }
};

export const getQuestionWithId = async (id: string) => {
  try {
    const response = await api.get(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question with id ${id}:`, error);
    return null;
  }
};

export const deleteQuestionWithId = async (id: string) => {
  try {
    const response = await api.delete(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question with id ${id}:`, error);
    return null;
  }
};

export const modifyQuestionWithId = async (id: string, question: Question) => {
  try {
    const response = await api.patch(API_URL + `/${id}`, question);
    return response.data;
  } catch (error) {
    console.error(`Error updating question with id ${id}:`, error);
    return null;
  }
};

export const getQuestionsWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await api.get(API_URL + `?${queryStr}`);
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
    const response = await api.delete(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching questions with query ${queryStr}:`, error);
    return null;
  }
};
