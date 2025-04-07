import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5050/api/v1",
  withCredentials: true,
});

export default api;
