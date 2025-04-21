import { GazeDataCoordinate } from "../types";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/v1/heatmaps";

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
  console.log("gazeData:", gazeData);
  console.log("width:", width);
  console.log("height:", height);
  try {
    const gazeDataStr: string = JSON.stringify(gazeData);
    console.log("gazeDataStr:", gazeDataStr);

    const response = await axios.post(API_URL + "/", {
      gazeDataStr,
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
