import api from "../utils/axios";

const API_URL = "/upload"; // Adjust for production

export const uploadGCPImage = async (selectedFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await api.post(API_URL + `/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error uploading image ${selectedFile} to GCP:`, error);
    return null;
  }
};
