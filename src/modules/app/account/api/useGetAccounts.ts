import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { type BackendResponse, type InvoiceQueryParams, type InvoicesData } from "../types/Account";

/**
 * Fetcher function for Invoice Service
 */
const fetchInvoices = async (params: InvoiceQueryParams): Promise<InvoicesData> => {
  const { customerNo, status, ...rest } = params;

  const apiParams = {
    ...rest,
    // If status is 'all', we send undefined so the backend returns everything
    portalStatus: status === "all" ? undefined : status,
  };

  const response = await covalentHubClient.get<BackendResponse>(
    `cp/invoice-service/api/Account/customer/${customerNo}`,
    { params: apiParams }
  );

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.error || "Failed to fetch invoices");
  }

  return response.data.data;
};

/**
 * Production-ready hook for retrieving customer invoices
 */
export const useGetAccountDetails = (params: InvoiceQueryParams) => {
  return useQuery({
    // We include the entire params object in the key for automatic refetching on filter change
    queryKey: ["accounts", params],
    queryFn: () => fetchInvoices(params),
    
    // Performance optimizations
    placeholderData: keepPreviousData, // Smooth pagination transitions
    
    // Only fetch if a customer number is present
    enabled: !!params.customerNo,
    
    // Error handling
    retry: 1,
  });
};