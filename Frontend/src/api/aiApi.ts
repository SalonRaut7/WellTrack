import axios from "axios";

const AI_BASE_URL = "http://localhost:8000";

const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

export default aiApi;
