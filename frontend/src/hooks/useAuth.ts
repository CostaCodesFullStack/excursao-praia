import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/api/client";
import type { LoginPayload, User } from "@/types";

const authQueryKey = ["auth", "me"];

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: async () => {
      const response = await api.get<User>("/auth/me");
      return response.data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post<{ token: string; user: User }>("/auth/login", payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKey, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.removeQueries();
    },
  });
}

