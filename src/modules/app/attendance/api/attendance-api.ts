import { useQuery } from "@tanstack/react-query";
import type {
  AttendanceListParams,
  AttendanceRecord,
  AttendanceResponse,
} from "../types/attendance.types";
import { covalentHubClient } from "@/services/clients/covalent.client";

export const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (params: AttendanceListParams) =>
    [...attendanceKeys.lists(), params] as const,
  detail: (id?: string) => [...attendanceKeys.all, "detail", id] as const,
};

export function useAttendanceQuery(params: AttendanceListParams) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: async (): Promise<AttendanceResponse> => {
      const response = await covalentHubClient.get("/attendance/records", {
        params: {
          page: params.pageIndex + 1,
          pageSize: params.pageSize,
          search: params.search || undefined,
          fromDate: params.date || undefined,
          status: params.status || undefined,
          source: params.source || undefined,
        },
      });

      return response.data.data ?? response.data;
    },
  });
}

export function useAttendanceByIdQuery(attendanceId?: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(attendanceId),
    enabled: Boolean(attendanceId),
    queryFn: async (): Promise<AttendanceRecord> => {
      const response = await covalentHubClient.get(
        `/attendance/records/${attendanceId}`
      );

      return response.data.data ?? response.data;
    },
  });
}