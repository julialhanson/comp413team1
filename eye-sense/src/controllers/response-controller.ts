import api from "../utils/axios";
import { createQueryString } from "../utils/func-utils";

const API_URL = "/responses"; // Adjust for production

export const getResponseWithId = async (id: string | undefined) => {
  if (id === undefined) return null;
  try {
    const response = await api.get(API_URL + `/${id}`);
    console.log("response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching response with id ${id}:`, error);
    return null;
  }
};

export const getResponsesWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await api.get(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching responses with query ${queryStr}:`, error);
    return null;
  }
};
