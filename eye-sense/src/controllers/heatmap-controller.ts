import { GazeDataCoordinate } from "../types";
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/heatmaps";

export const getHeatmapFromGazeData = async ({
  gazeData,
  width,
  height,
  filename,
}: {
  gazeData: GazeDataCoordinate[];
  width: number;
  height: number;
  filename: string;
}) => {
  try {
    const gazeDataStr: string = JSON.stringify(gazeData);

    const response = await axios.post(
      API_URL + `/`,
      {
        gazeDataStr,
        width,
        height,
        filename,
      },
      {
        responseType: "blob",
      }
    );

    const heatmapUrl = URL.createObjectURL(response.data);

    return { heatmapUrl }; // should return { heatmapUrl: 'data:image/png;base64,...' }
  } catch (error) {
    console.log("Error generating heatmap:", error);
    return null;
  }
};

export const generateExpertHeatmap = async (image: File) => {
  if (!image) return null;

  try {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post(API_URL + `/bot/`, formData, {
      responseType: "blob",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const expertHeatmapUrl = URL.createObjectURL(response.data);
    return { heatmapUrl: expertHeatmapUrl }
    // return response.data;
  } catch (error) {
    console.error(`Error generating expert heatmap`, error);
    return null;
  }
}