import api from "../utils/axios";

const API_URL = "/uploads"; // Adjust for production

export const uploadImageToGCP = async (
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

    const response = await api.post(API_URL, formData, {
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
