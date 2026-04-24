export interface InvoiceLineItem {
  salesParts: string;
  qty: number;
  state: string;
}

export interface Invoice {
  invoiceNo: string;
  customerNo: string;
  portalStatus: "TotalOutstanding" | "Paid" | "Overdue" | string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  currencyCode: string;
  isOverdue: boolean;
  canDownload: boolean;
  orderLines?: InvoiceLineItem[]; // Added for expanded view
}