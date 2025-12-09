import axiosClient from "./axios";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axiosClient.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await axiosClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosClient.get("/auth/me");
    return response.data;
  },
};
