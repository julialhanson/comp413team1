import axios from "axios";
import { Question, Survey, SurveyResponse } from "../types";
import { createQueryString } from "../utils/func-utils";

const API_URL = "http://localhost:5050/api/v1/surveys"; // Adjust for production

export const getAllSurveys = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return null;
  }
};

export const getSurveyWithId = async (id: string) => {
  try {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey with id ${id}:`, error);
    return null;
  }
};

export const getQuestionsFromSurvey = async (id: string | undefined) => {
  if (id === undefined) {
    console.error("Survey id is undefined.");
    return null;
  }
  try {
    const response = await axios.get(API_URL + `/${id}/questions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching questions from survey with id ${id}:`, error);
    return null;
  }
};

export const deleteSurveyWithId = async (id: string) => {
  try {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting survey with id ${id}:`, error);
    return null;
  }
};

export const createSurvey = async (survey: Survey) => {
  try {
    const response = await axios.post(API_URL, survey);
    return response.data;
  } catch (error) {
    console.error("Error creating survey:", error);
    return null;
  }
};

export const getSurveysWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await axios.get(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching surveys with query ${queryStr}:`, error);
    return null;
  }
};

export const deleteSurveysWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await axios.delete(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching surveys with query ${queryStr}:`, error);
    return null;
  }
};

export const submitResponse = async (
  id: string | undefined,
  surveyResponse: SurveyResponse
) => {
  if (id === undefined) {
    console.error("Survey id is undefined.");
    return null;
  }
  try {
    const response = await axios.post(
      API_URL + `/${id}/responses`,
      surveyResponse
    );
    return response.data;
  } catch (error) {
    console.error(`Error submitting response to survey with id ${id}:`, error);
    return null;
  }
};
