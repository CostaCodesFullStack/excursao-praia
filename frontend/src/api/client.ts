import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333/api",
  withCredentials: true,
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Nao foi possivel concluir a acao";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Nao foi possivel concluir a acao";
}

export function isApiUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export default api;
