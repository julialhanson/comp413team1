import axios from "axios";
import api from "../utils/axios";

const API_URL = "/uploads"; // Adjust for production

export const uploadMediaToGCP = async (
  selectedFile: File | string | null | undefined,
  filename: string,
  isHeatmap: boolean = false
) => {
  if (!selectedFile || typeof selectedFile === "string") return null;

  try {
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("filename", filename);

    console.log("formData:", formData);

    const endpoint = isHeatmap ? "/heatmap" : "";
    const response = await api.post(API_URL + endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("response.data:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error uploading image ${selectedFile} to GCP:`, error);
    return null;
  }
};

export const retrieveImageFromGCP = async (filename: string) => {
  try {
    const response = await api.get(API_URL + `/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving image ${filename} from GCP:`, error);
    return null;
  }
};

export const getImageAsBase64FromGCP = async (filename: string) => {
  try {
    const response = await api.get(API_URL + `/images/${filename}/base64`);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving image ${filename} as base 64:`, error);
    return null;
  }
};

export const getHeatmapAsBase64FromGCP = async (filename: string) => {
  try {
    const response = await api.get(API_URL + `/heatmaps/${filename}/base64`);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving heatmap ${filename} as base 64:`, error);
    return null;
  }
};

export const getClassificationFromHeatmap = async (
  imageBase64: string,
  confidenceThreshold = 0.5,
  maxPredictions = 5
) => {
  try {
    const accessResponse = await api.get(API_URL + `/access`);
    const { accessToken, projectId, endpointId } = accessResponse.data;

    console.log("accessData:", accessResponse.data);

    const body = {
      instances: [
        {
          content: imageBase64,
        },
      ],
      parameters: {
        confidenceThreshold,
        maxPredictions,
      },
    };

    const response = await axios.post(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/endpoints/${endpointId}:predict`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating classification from heatmap:", error);
    return null;
  }
};
