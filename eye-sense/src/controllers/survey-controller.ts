import { Survey, SurveyResponse } from "../types";
import api from "../utils/axios";
import { createQueryString } from "../utils/func-utils";

const API_URL = "/surveys"; // Adjust for production

export const getAllSurveys = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return null;
  }
};

export const getSurveyWithId = async (id: string | undefined) => {
  if (id === undefined) return null;
  try {
    const response = await api.get(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey with id ${id}:`, error);
    return null;
  }
};

export const getQuestionsFromSurvey = async (id: string | undefined) => {
  if (id === undefined) {
    return null;
  }
  try {
    const response = await api.get(API_URL + `/${id}/questions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching questions from survey with id ${id}:`, error);
    return null;
  }
};

export const deleteSurveyWithId = async (id: string | undefined) => {
  if (id === undefined) return null;
  try {
    const response = await api.delete(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting survey with id ${id}:`, error);
    return null;
  }
};

export const createSurvey = async (survey: Survey) => {
  try {
    const response = await api.post(API_URL, survey);
    return response.data;
  } catch (error) {
    console.error("Error creating survey:", error);
    return null;
  }
};

export const modifySurveyWithId = async (
  id: string | undefined,
  survey: object
) => {
  if (id === undefined) {
    return null;
  }
  try {
    const response = await api.patch(API_URL + `/${id}`, survey);
    return response.data;
  } catch (error) {
    console.error("Error modifying survey:", error);
    return null;
  }
};

export const getSurveysWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await api.get(API_URL + `?${queryStr}`);
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
    const response = await api.delete(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching surveys with query ${queryStr}:`, error);
    return null;
  }
};

export const postResponse = async (
  id: string | undefined,
  surveyResponse: SurveyResponse
) => {
  if (id === undefined) {
    console.error("Survey id is undefined.");
    return null;
  }
  try {
    const response = await api.post(
      API_URL + `/${id}/responses`,
      surveyResponse
    );
    return response.data;
  } catch (error) {
    console.error(`Error submitting response to survey with id ${id}:`, error);
    return null;
  }
};
