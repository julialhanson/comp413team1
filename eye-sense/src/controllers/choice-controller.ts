import axios from "axios";
import { Choice } from "../types";

const API_URL = "http://localhost:5050/api/v1/choices"; // Adjust for production

export const modifyChoiceWithId = async (id: string, choice: Choice) => {
  try {
    const response = await axios.patch(API_URL + `/${id}`, choice);
    return response.data;
  } catch (error) {
    console.error(`Error updating choice with id ${id}:`, error);
    return null;
  }
};
