import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { showToastError } from "@/utils/show-toast-success";

// --- Types ---
export interface InvoiceLineItem {
  salesParts: string;
  qty: number;
  state: string;
}

export interface Invoice {
  invoiceNo: string;
  customerNo: string;
  company:string;
  portalStatus: "TotalOutstanding" | "Paid" | "OverDue" | string;
  ifsStatus:string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  currencyCode: string;
  isOverdue: boolean;
  canDownload: boolean;
  invoiceId:number;
  openAmount: number;
  orderLines?: InvoiceLineItem[];
}

export interface InvoiceQueryParams {
  customerNo: string;
  page?: number;
  pageSize?: number;
  invoiceNo?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

interface BackendResponse {
  success: boolean;
  data: {
    items: Invoice[];
    totalCount: number;
    invoiceAmounts: {
      totalOutstanding: number;
      totalPaid: number;
      totalOverDue: number;
      totalCancelled:number;
    };
  };
}

// --- API Functions ---
const fetchInvoices = async (params: InvoiceQueryParams) => {
  let backendStatus = undefined;
  if (params.status && params.status !== "all") {
    const statusMap: Record<string, string> = {
      outstanding: "TotalOutstanding",
      paid: "Paid",
      due: "OverDue",
    };
    backendStatus = statusMap[params.status.toLowerCase()] || params.status;
  }

  const response = await covalentHubClient.get<BackendResponse>(
    `cp/invoice-service/api/Invoices/customer/${params.customerNo}`,
    { params: { ...params, portalStatus: backendStatus } }
  );
  return response.data.data;
};

export const getInvoiceBlob = async (invoiceId: number, company: string): Promise<Blob> => {
  try {
    const response = await covalentHubClient.get(
      `invoice-service/api/Invoices/${company}/${invoiceId}`
    );
    const base64Data = response.data.data.invoiceFile;

    // 1. Check for empty file string
    if (!base64Data || base64Data.trim() === "") {
      const errorMsg = "The PDF document for this invoice is not yet available. Please try again later.";
      showToastError("File Processing", errorMsg);
      throw new Error("EMPTY_FILE");
    }

    // 2. Process valid Base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    return new Blob([byteNumbers], { type: "application/pdf" });

  } catch (error: any) {
    // 3. Handle Network or unexpected errors
    if (error.message !== "EMPTY_FILE") {
      showToastError("System Error", "Failed to retrieve the invoice file.");
    }
    throw error; // Re-throw so the calling component knows it failed
  }
};

// Function to handle binary PDF download
export const downloadInvoicePdf = async (invoiceId: number, company: string, invoiceNo:string) => {
  try {
    const response = await covalentHubClient.get(
      `invoice-service/api/Invoices/${company}/${invoiceId}`
    );

    const base64Data = response.data.data.invoiceFile;

    // VALIDATION: Check for empty string or null even if success is true
    if (!base64Data || base64Data.trim() === "") {
      // Throw a specific error to be caught by the catch block
      throw new Error("EMPTY_FILE");
    }

    // Convert Base64 string to a Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    // Trigger the download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Invoice-${invoiceNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error("Download failed:", error);

    if (error.message === "EMPTY_FILE") {
      showToastError(
        "PDF Not Available", 
        "The invoice document is still being processed by the system. Please try again in a few minutes."
      );
    } else {
      showToastError(
        "Download Failed", 
        "Could not retrieve the PDF. Please contact support if this persists."
      );
    }
  }
};

// --- Hook ---
export const useGetInvoices = (params: InvoiceQueryParams) => {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => fetchInvoices(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    enabled: !!params.customerNo,
  });
};