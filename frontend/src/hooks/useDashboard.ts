import { useQuery } from "@tanstack/react-query";

import api from "@/api/client";
import type { DashboardData } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get<DashboardData>("/dashboard");
      return response.data;
    },
  });
}

