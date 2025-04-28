// import axios from "axios";
import { createQueryString } from "../utils/func-utils";
import { User } from "../types";
import api from "../utils/axios";

const API_URL = "/users"; // Adjust for production

export const registerUser = async (user: User) => {
  try {
    const response = await api.post(API_URL, user);
    return response.data;
  } catch (error) {
    console.error(`Error creating user with username ${user.username}:`, error);
    return null;
  }
};

export const loginUser = async (user: {
  username: string;
  password: string;
}) => {
  try {
    const response = await api.post(API_URL + `/login`, user);
    return response.data;
  } catch (error) {
    console.error(
      `Error logging in user with username: ${user.username}`,
      error
    );
    return null;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(API_URL + `/logout`);
    return response.data;
  } catch (error) {
    console.error("Error logging out", error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get(API_URL + `/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
};

export const getUserWithUsername = async (username: string) => {
  try {
    const response = await api.get(API_URL + `/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with username ${username}:`, error);
    return null;
  }
};

export const deleteUserWithUsername = async (username: string) => {
  try {
    const response = await api.delete(API_URL + `/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with username ${username}:`, error);
    return null;
  }
};

export const createUser = async (username: string) => {
  try {
    const response = await api.post(API_URL, username);
    return response.data;
  } catch (error) {
    console.error(`Error creating user with username ${username}:`, error);
    return null;
  }
};

export const updateUserRole = async (username: string, role: string) => {
  try {
    const response = await api.patch(API_URL + `/${username}`, { role });
    return response.data;
  } catch (error) {
    console.error(`Error updating user with username ${username}:`, error);
    return null;
  }
};

export const getUsersWithQuery = async (
  queries: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = createQueryString(queries);
  try {
    const response = await api.get(API_URL + `?${queryStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching users with query ${queryStr}:`, error);
    return null;
  }
};
