import { covalentHubClient } from "@/services/clients/covalent.client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface Address {
  addressID: string;
  address01: string;
  address02: string;
  state: string;
  zipCode: string;
  country: string;
  city: string;
}

export interface Communication {
  communicationID: number;
  method: string;
  value: string;
}

export interface PersonProfile {
  personId: string;
  name: string;
  addresses: Address[];
  communicationMethods: Communication[];
}

interface PersonApiResponse {
  success: boolean;
  data: PersonProfile;
  error: null | string;
}

// Query Key Factory
export const personKeys = {
  all: ["person"] as const,
  profile: () => [...personKeys.all, "profile"] as const,
};

export const getPersonProfile = async (): Promise<PersonProfile> => {
  const response = await covalentHubClient.get<PersonApiResponse>(
    "/cp/profile-service/api/CustomerPersons/Get-Person-Details"
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch person profile");
  }

  return response.data.data;
};

type UseGetPersonProfileOptions<TData = PersonProfile> = {
  select?: (data: PersonProfile) => TData;
  config?: Omit<
    UseQueryOptions<PersonProfile, AxiosError, TData>,
    "queryKey" | "queryFn" | "select"
  >;
};

export const useGetPersonProfile = <TData = PersonProfile>({
  select,
  config,
}: UseGetPersonProfileOptions<TData> = {}) => {
  return useQuery<PersonProfile, AxiosError, TData>({
    queryKey: personKeys.profile(),
    queryFn: getPersonProfile,
    select,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    ...config,
  });
};