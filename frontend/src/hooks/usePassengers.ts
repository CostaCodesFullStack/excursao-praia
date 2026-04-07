import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/api/client";
import { downloadBlob, getFileNameFromDisposition } from "@/lib/utils";
import type { Passenger, PassengerPayload, PassengerQuery, PaymentPayload } from "@/types";

async function invalidatePassengerData(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["passengers"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ...(id ? [queryClient.invalidateQueries({ queryKey: ["passenger", id] })] : []),
  ]);
}

export function usePassengers(params: PassengerQuery) {
  return useQuery({
    queryKey: ["passengers", params],
    queryFn: async () => {
      const response = await api.get<Passenger[]>("/passengers", {
        params,
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePassenger(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["passenger", id],
    queryFn: async () => {
      const response = await api.get<Passenger>(`/passengers/${id}`);
      return response.data;
    },
    enabled: Boolean(id) && enabled,
  });
}

export function useCreatePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PassengerPayload) => {
      const response = await api.post<Passenger>("/passengers", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      await invalidatePassengerData(queryClient, data.id);
    },
  });
}

export function useUpdatePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PassengerPayload }) => {
      const response = await api.put<Passenger>(`/passengers/${id}`, payload);
      return response.data;
    },
    onSuccess: async (data) => {
      await invalidatePassengerData(queryClient, data.id);
      queryClient.setQueryData(["passenger", data.id], data);
    },
  });
}

export function useDeletePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/passengers/${id}`);
      return id;
    },
    onSuccess: async () => {
      await invalidatePassengerData(queryClient);
    },
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PaymentPayload }) => {
      const response = await api.post(`/passengers/${id}/payments`, payload);
      return response.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidatePassengerData(queryClient, variables.id);
    },
  });
}

export function useExportPassengers() {
  return useMutation({
    mutationFn: async (format: "csv" | "pdf") => {
      const response = await api.get(`/export/${format}`, {
        responseType: "blob",
      });

      const fallbackName = format === "csv" ? "passageiros.csv" : "relatorio.pdf";
      const fileName = getFileNameFromDisposition(
        response.headers["content-disposition"],
        fallbackName,
      );

      downloadBlob(response.data, fileName);
      return fileName;
    },
  });
}
