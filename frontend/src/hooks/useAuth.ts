import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api, { getApiErrorMessage, isApiUnauthorizedError } from "@/api/client";
import type { LoginPayload, User } from "@/types";

const authQueryKey = ["auth", "me"];
const sessionValidationErrorMessage =
  "Login concluido, mas a sessao nao foi mantida no navegador. Se voce estiver em HTTP, finalize o HTTPS e tente novamente.";

async function fetchCurrentUser() {
  const response = await api.get<User>("/auth/me");
  return response.data;
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      await api.post<{ token: string; user: User }>("/auth/login", payload);

      try {
        return await fetchCurrentUser();
      } catch (error) {
        throw new Error(
          isApiUnauthorizedError(error) ? sessionValidationErrorMessage : getApiErrorMessage(error),
        );
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKey, user);
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: authQueryKey });
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
