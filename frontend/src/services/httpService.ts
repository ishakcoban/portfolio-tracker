// src/services/httpService.ts
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: add request/response interceptors
api.interceptors.request.use((config) => {

  return config;
});

api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generic HTTP methods
const httpService = {
  get: async (url: string, config?: AxiosRequestConfig) => {
    const response: AxiosResponse = await api.get(url, config);
    return response;
  },

  post: async (url: string, data: any, config?: AxiosRequestConfig) => {
    const response: AxiosResponse = await api.post(url, data, config);
    return response;
  },

  put: async <T>(url: string, data: any, config?: AxiosRequestConfig) => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig) => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  },
};

export default httpService;
