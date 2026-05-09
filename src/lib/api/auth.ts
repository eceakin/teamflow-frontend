import api from "@/lib/axios";
import type { User, ApiResponse } from "@/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const loginApi = (payload: LoginPayload) =>
  api.post<ApiResponse<AuthData>>("/auth/login", payload);

export const registerApi = (payload: RegisterPayload) =>
  api.post<ApiResponse<AuthData>>("/auth/register", payload);

export const logoutApi = (refreshToken: string) =>
  api.post("/auth/logout", { refreshToken });

export const getMeApi = () =>
  api.get<ApiResponse<User>>("/auth/me");

export const updateProfileApi = (payload: { full_name?: string; avatar_url?: string }) =>
  api.put<ApiResponse<User>>("/auth/profile", payload);

export const changePasswordApi = (payload: {
  current_password: string;
  new_password: string;
}) => api.put("/auth/password", payload);