import axios from "axios";
import { Question } from "../types";
import { createQueryString } from "../utils/func-utils";

const API_URL = "http://localhost:5050/api/v1/surveys"; // Adjust for production

export const getAllSurveys = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log(response.data);
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

export const deleteSurveyWithId = async (id: number) => {
  try {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting survey with id ${id}:`, error);
    return null;
  }
};

export const createSurvey = async (questions: Question[]) => {
  try {
    console.log("creating survey");
    const response = await axios.post(API_URL, questions);
    console.log(response.data);
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
