import axios from "axios";
import { createQueryString } from "../utils/func-utils";

const API_URL = "http://localhost:5050/api/v1/users"; // Adjust for production

export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
};

export const getUserWithUsername = async (username: string) => {
  try {
    const response = await axios.get(API_URL + `/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with username ${username}:`, error);
    return null;
  }
};

export const deleteUserWithUsername = async (username: string) => {
  try {
    const response = await axios.delete(API_URL + `/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with username ${username}:`, error);
    return null;
  }
};

export const createUser = async (username: string) => {
  try {
    const response = await axios.post(API_URL, username);
    return response.data;
  } catch (error) {
    console.error(`Error creating user with username ${username}:`, error);
    return null;
  }
};

// export const updateUserWithUsername = async (userInfo: User) => {
//   try {
//     const response = await axios.put(API_URL, userInfo);
//     console.log(response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`Error creating user with username ${userInfo.username}:`, error);
//     return null;
//   }
// };

export const getUsersWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await axios.get(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching users with query ${queryStr}:`, error);
    return null;
  }
};
