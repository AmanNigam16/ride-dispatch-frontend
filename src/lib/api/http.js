import axios from "axios";
import { authApiBase, rideApiBase } from "./env";
import { useAuthStore } from "../../store/authStore";

function attachAuth(config) {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

function handleUnauthorized(error) {
  if (error?.response?.status === 401) {
    useAuthStore.getState().clearSession();
  }

  return Promise.reject(error);
}

export const authHttp = axios.create({
  baseURL: authApiBase
});

export const rideHttp = axios.create({
  baseURL: rideApiBase
});

authHttp.interceptors.request.use(attachAuth);
rideHttp.interceptors.request.use(attachAuth);

authHttp.interceptors.response.use((response) => response, handleUnauthorized);
rideHttp.interceptors.response.use((response) => response, handleUnauthorized);
