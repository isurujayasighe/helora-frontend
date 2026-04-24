export interface Invoice {
  invoiceNo: string;
  customerNo: string;
  company: string;
  portalStatus: string; // e.g., "PostedAuth", "Printed", "Preliminary"
  invoiceDate: string;
  ifsStatus:string;
  dueDate: string;
  grossAmount: number;
  currencyCode: string;
  isOverdue: boolean;
  canDownload: boolean;
  invoiceFile: string | null;
  openAmount: number;
  accountStatus: string[];
  
}

export interface AccountAmounts {
  totalOutstanding: number;
  totalInvoiced: number;
  totalCustomerAdvances: number;
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

export interface InvoicesData {
  items: Invoice[];
  totalCount: number;
  page: number;
  pageSize: number;
  invoiceAmounts: null;
  accountAmounts: AccountAmounts;
}

export interface BackendResponse {
  success: boolean;
  data: InvoicesData;
  error: string | null;
}