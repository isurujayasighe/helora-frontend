export type OrderStatus = "Processing" | "Invoiced" | "Delivered" | "Cancelled";

export interface SalesPart {
  lineItemNo: number;
  state: OrderStatus;
  salesParts: string; // From JSON: "TRICIDE 3:1 25L"
  grossAmount: string; // Kept as string to match your JSON "0" or "389.60"
  salesUnitMeasure: string; // From JSON: "L"
  qty: number;
}

export interface Order {
  status: string;  
  orderNo: string;
  customerNo: string;
  state: OrderStatus;      // The display state (e.g., "Invoiced")
  ifsState: string;        // The backend system state (e.g., "Planned")
  shipAddrNo: string;      // The full address string
  dateEntered: string;     // ISO Date string
  totalAmount: string;
  totalQuantity: number;
  orderLines: SalesPart[];
}

