import { env } from "@/env";
import axios, { 
  type AxiosInstance, 
  type AxiosResponse, 
  type AxiosError, 
  type AxiosRequestConfig 
} from "axios";

interface TypedAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
}) as TypedAxiosInstance;

axiosClient.interceptors.response.use(
  <T = unknown>(response: AxiosResponse<T>): T | AxiosResponse<T> => {
    // Return the data directly, or the full response if data is undefined
    return response?.data ?? response;
  },
  (error: AxiosError) => {
    const errorData = error?.response?.data;
    // Ensure we always reject with an Error object
    if (errorData) {
      const customError = new Error(
        typeof errorData === 'string' ? errorData : 'API Error'
      );
      Object.assign(customError, { data: errorData });
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  },
);



export default axiosClient;
