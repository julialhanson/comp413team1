import { createQueryString } from "../utils/func-utils";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/v1/heatmap"; // Adjust for production

export const generateHeatmap = async (imgFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", imgFile);

    const response = await axios.post(API_URL, formData, {
      responseType: "blob"
    });

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error generating heatmap:", error);
    return null;
  }
};
