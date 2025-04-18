import api from "../utils/axios";

const API_URL = "/uploads"; // Adjust for production

export const uploadImageToGCP = async (selectedFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await api.post(API_URL, formData, {
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

export const retrieveImageFromGCP = async (filename: string) => {
  try {
    const response = await api.get(API_URL + `/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving image ${filename} from GCP:`, error);
    return null;
  }
};
