import { GazeDataCoordinate } from "../types";
import api from "../utils/axios";

const API_URL = "http://127.0.0.1:5000/heatmaps";

export const getHeatmapFromGazeData = async ({
  gazeData,
  width,
  height,
  imageBase64,
}: {
  gazeData: GazeDataCoordinate[];
  width: number;
  height: number;
  imageBase64: string;
}) => {
  try {
    const response = await api.post(API_URL, {
      gazeDataStr: JSON.stringify(gazeData),
      width,
      height,
      imageBase64,
    });
    return response.data; // should return { heatmapUrl: 'data:image/png;base64,...' }
  } catch (error) {
    console.log("Error generating heatmap:", error);
    return null;
  }
};
