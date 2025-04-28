import api from "../utils/axios";

const API_URL = "/auth"; // Adjust for production

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post(API_URL + `/login`, {
      username: username,
      password: password,
    });
    return response.data;
  } catch (error) {
    console.error(`Error logging in user with username: ${username}`, error);
    return null;
  }
};
