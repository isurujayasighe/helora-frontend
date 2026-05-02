import type { LucideIcon } from "lucide-react";

export type SettingsCategoryId =
  | "business"
  | "orders"
  | "measurements"
  | "attendance"
  | "prints"
  | "whatsapp"
  | "payments"
  | "dataImport"
  | "preferences";

export interface SettingsCategory {
  id: SettingsCategoryId;
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
}

export interface HeloraSettings {
  business: BusinessSettings;
  orders: OrderSettings;
  measurements: MeasurementSettings;
  attendance: AttendanceSettings;
  prints: PrintSettings;
  whatsapp: WhatsAppSettings;
  payments: PaymentSettings;
  dataImport: DataImportSettings;
  preferences: SystemPreferenceSettings;
}

export interface BusinessSettings {
  shopName: string;
  phoneNumber: string;
  email: string;
  address: string;
  town: string;
  registrationNumber: string;
  currency: string;
  openingTime: string;
  closingTime: string;
}

export interface OrderSettings {
  orderPrefix: string;
  groupOrderPrefix: string;
  defaultPromisedDays: number;
  defaultOrderSource: string;
  allowUrgentOrders: boolean;
  enableSinhalaNotes: boolean;
  requireAdvancePayment: boolean;
  hidePricesOnTailorPrint: boolean;
}

export interface MeasurementSettings {
  measurementUnit: string;
  defaultCategory: string;
  allowVersioning: boolean;
  requireVerification: boolean;
  warnAfterMonths: number;
  showPreviousMeasurements: boolean;
}

export interface AttendanceSettings {
  workStartTime: string;
  workEndTime: string;
  lateGraceMinutes: number;
  halfDayMinimumHours: number;
  fullDayMinimumHours: number;
  overtimeEnabled: boolean;
  overtimeStartsAfter: string;
  attendanceApprovalRequired: boolean;
  deviceAttendanceEnabled: boolean;
  manualAttendanceAllowed: boolean;
}

export interface PrintSettings {
  defaultPrintSize: string;
  showShopHeader: boolean;
  showFooter: boolean;
  tailorPrintSize: string;
  showOrderNotes: boolean;
  showMeasurementNotes: boolean;
  showItemNotesWhenAvailable: boolean;
  showCustomerPhone: boolean;
  showPricesOnCustomerReceipt: boolean;
  hidePricesOnTailorCopy: boolean;
}

export interface WhatsAppSettings {
  enabled: boolean;
  businessPhoneNumber: string;
  sendOrderCreatedMessage: boolean;
  sendOrderReadyMessage: boolean;
  sendPaymentReceivedMessage: boolean;
  orderCreatedTemplate: string;
  orderReadyTemplate: string;
  paymentReceivedTemplate: string;
}

export interface PaymentSettings {
  advancePaymentEnabled: boolean;
  minimumAdvancePercentage: number;
  allowCreditOrders: boolean;
  defaultPaymentMethod: string;
  receiptPrefix: string;
  monthlySalaryEnabled: boolean;
  dailyPaymentEnabled: boolean;
  pieceRatePaymentEnabled: boolean;
  overtimeRateMultiplier: number;
  lateDeductionEnabled: boolean;
}

export interface DataImportSettings {
  allowDuplicatePhoneNumbers: boolean;
  autoGenerateCustomerNumbers: boolean;
  autoGenerateBlockNumbers: boolean;
  validateBeforeImport: boolean;
  keepImportHistory: boolean;
}

export interface SystemPreferenceSettings {
  language: string;
  dateFormat: string;
  timeFormat: string;
  defaultPageSize: number;
  defaultDashboardRange: string;
  theme: string;
}