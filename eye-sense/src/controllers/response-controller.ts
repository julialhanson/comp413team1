import { Survey, SurveyResponse } from "../types";
import api from "../utils/axios";
import { createQueryString } from "../utils/func-utils";

const API_URL = "/responses"; // Adjust for production

export const getResponsesWithQuery = async (
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