import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HeloraSettings } from "../types/settings.types";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { defaultHeloraSettings } from "../constants/settings-constants";

export const settingsKeys = {
  all: ["settings"] as const,
  detail: () => [...settingsKeys.all, "detail"] as const,
};

export function useHeloraSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: async (): Promise<HeloraSettings> => {
      try {
        const response = await covalentHubClient.get("/api/v1/settings");
        return response.data.data ?? response.data;
      } catch {
        return defaultHeloraSettings;
      }
    },
  });
}

export function useUpdateHeloraSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: HeloraSettings) => {
      const response = await covalentHubClient.put("/api/v1/settings", settings);
      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
    },
  });
}