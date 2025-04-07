import axios from "axios";

const API_URL = "http://localhost:5050/api/v1/auth"; // Adjust for production

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(API_URL + `/login`, {
      username: username,
      password: password,
    });
    return response.data;
  } catch (error) {
    console.error(`Error logging in user with username: ${username}`, error);
    return null;
  }
};
