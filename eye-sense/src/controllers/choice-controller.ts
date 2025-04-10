import { Choice } from "../types";
import api from "../utils/axios";

const API_URL = "/choices"; // Adjust for production

export const modifyChoiceWithId = async (id: string, choice: Choice) => {
  try {
    const response = await api.put(API_URL + `/${id}`, choice);
    return response.data;
  } catch (error) {
    console.error(`Error updating choice with id ${id}:`, error);
    return null;
  }
};
