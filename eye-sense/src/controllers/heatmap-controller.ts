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

    // const heatmapUrl = URL.createObjectURL(response.data);

    // return { heatmapUrl }; // should return { heatmapUrl: 'data:image/png;base64,...' }

    const heatmapBlob = response.data;
    return { heatmapBlob };
  } catch (error) {
    console.log("Error generating heatmap:", error);
    return null;
  }
};
