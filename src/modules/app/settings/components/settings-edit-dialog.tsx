import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import type {
  HeloraSettings,
  SettingsCategory,
} from "../types/settings.types";
import { SettingsSectionCard } from "./settings-section-card";

interface Props {
  open: boolean;
  category?: SettingsCategory | null;
  settings: HeloraSettings;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (settings: HeloraSettings) => Promise<void> | void;
}

export function SettingsEditDialog({
  open,
  category,
  settings,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const form = useForm({
    defaultValues: settings,
    onSubmit: async ({ value }) => {
      await onSave(value);
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(settings);
    }
  }, [open, settings, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSaving) {
      onClose();
    }
  };

  const title = category?.title ?? "Settings";
  const description =
    category?.description ?? "Update Helora ERP settings for your shop.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-4xl">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto bg-slate-50 p-5">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            {category?.id === "business" && <BusinessSettingsForm form={form} />}
            {category?.id === "orders" && <OrderSettingsForm form={form} />}
            {category?.id === "measurements" && (
              <MeasurementSettingsForm form={form} />
            )}
            {category?.id === "attendance" && (
              <AttendanceSettingsForm form={form} />
            )}
            {category?.id === "prints" && <PrintSettingsForm form={form} />}
            {category?.id === "whatsapp" && (
              <WhatsAppSettingsForm form={form} />
            )}
            {category?.id === "payments" && (
              <PaymentSettingsForm form={form} />
            )}
            {category?.id === "dataImport" && (
              <DataImportSettingsForm form={form} />
            )}
            {category?.id === "preferences" && (
              <PreferenceSettingsForm form={form} />
            )}
          </form>
        </div>

        <DialogFooter className="border-t bg-white px-5 py-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 rounded-lg font-bold"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={form.handleSubmit}
              disabled={isSaving}
              className="h-11 rounded-lg font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Forms                                                              */
/* ------------------------------------------------------------------ */

function BusinessSettingsForm({ form }: { form: any }) {
  return (
    <SettingsSectionCard
      title="Shop details"
      description="These details appear on receipts, printouts, and reports."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField form={form} name="business.shopName" label="Shop name" />
        <TextField form={form} name="business.phoneNumber" label="Phone number" />
        <TextField form={form} name="business.email" label="Email" />
        <TextField form={form} name="business.town" label="Town" />
        <TextField form={form} name="business.address" label="Address" />
        <TextField
          form={form}
          name="business.registrationNumber"
          label="Business registration number"
        />
        <SelectField
          form={form}
          name="business.currency"
          label="Currency"
          options={[
            { value: "LKR", label: "LKR" },
            { value: "USD", label: "USD" },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            form={form}
            name="business.openingTime"
            label="Opening time"
            type="time"
          />
          <TextField
            form={form}
            name="business.closingTime"
            label="Closing time"
            type="time"
          />
        </div>
      </div>
    </SettingsSectionCard>
  );
}

function OrderSettingsForm({ form }: { form: any }) {
  return (
    <>
      <SettingsSectionCard
        title="Order numbers"
        description="Control how normal orders and group orders are numbered."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField form={form} name="orders.orderPrefix" label="Order prefix" />
          <TextField
            form={form}
            name="orders.groupOrderPrefix"
            label="Group order prefix"
          />
          <NumberField
            form={form}
            name="orders.defaultPromisedDays"
            label="Default promised days"
          />
          <SelectField
            form={form}
            name="orders.defaultOrderSource"
            label="Default order source"
            options={[
              { value: "Physical Shop", label: "Physical Shop" },
              { value: "Drezaura", label: "Drezaura" },
              { value: "WhatsApp", label: "WhatsApp" },
            ]}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Order behavior"
        description="Choose how the order flow should work in the shop."
      >
        <SwitchField
          form={form}
          name="orders.allowUrgentOrders"
          label="Allow urgent orders"
          description="Let staff mark orders as urgent."
        />
        <SwitchField
          form={form}
          name="orders.enableSinhalaNotes"
          label="Enable Sinhala notes"
          description="Allow Sinhala or Singlish notes in orders."
        />
        <SwitchField
          form={form}
          name="orders.requireAdvancePayment"
          label="Require advance payment"
          description="Ask for advance payment when creating orders."
        />
        <SwitchField
          form={form}
          name="orders.hidePricesOnTailorPrint"
          label="Hide prices on tailor print"
          description="Tailors will only see work details and measurements."
        />
      </SettingsSectionCard>
    </>
  );
}

function MeasurementSettingsForm({ form }: { form: any }) {
  return (
    <SettingsSectionCard
      title="Measurement rules"
      description="Control how measurements are saved and checked."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          form={form}
          name="measurements.measurementUnit"
          label="Measurement unit"
          options={[
            { value: "Inches", label: "Inches" },
            { value: "Centimeters", label: "Centimeters" },
          ]}
        />
        <SelectField
          form={form}
          name="measurements.defaultCategory"
          label="Default category"
          options={[
            { value: "Uniform", label: "Uniform" },
            { value: "Saree", label: "Saree" },
          ]}
        />
        <NumberField
          form={form}
          name="measurements.warnAfterMonths"
          label="Warn if older than months"
        />
      </div>

      <SwitchField
        form={form}
        name="measurements.allowVersioning"
        label="Keep measurement versions"
        description="Save a new version when measurements are updated."
      />
      <SwitchField
        form={form}
        name="measurements.requireVerification"
        label="Require measurement verification"
        description="Ask staff to confirm old measurements before making an order."
      />
      <SwitchField
        form={form}
        name="measurements.showPreviousMeasurements"
        label="Show previous measurements"
        description="Display latest customer measurements during order creation."
      />
    </SettingsSectionCard>
  );
}

function AttendanceSettingsForm({ form }: { form: any }) {
  return (
    <>
      <SettingsSectionCard
        title="Working time"
        description="These times are used to calculate late minutes and overtime."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            form={form}
            name="attendance.workStartTime"
            label="Work start time"
            type="time"
          />
          <TextField
            form={form}
            name="attendance.workEndTime"
            label="Work end time"
            type="time"
          />
          <NumberField
            form={form}
            name="attendance.lateGraceMinutes"
            label="Late grace minutes"
          />
          <TextField
            form={form}
            name="attendance.overtimeStartsAfter"
            label="Overtime starts after"
            type="time"
          />
          <NumberField
            form={form}
            name="attendance.halfDayMinimumHours"
            label="Half day minimum hours"
          />
          <NumberField
            form={form}
            name="attendance.fullDayMinimumHours"
            label="Full day minimum hours"
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Attendance rules"
        description="Choose how attendance is recorded and approved."
      >
        <SwitchField
          form={form}
          name="attendance.overtimeEnabled"
          label="Enable overtime calculation"
          description="Calculate overtime after work end time."
        />
        <SwitchField
          form={form}
          name="attendance.attendanceApprovalRequired"
          label="Attendance approval required"
          description="Manager must approve attendance records."
        />
        <SwitchField
          form={form}
          name="attendance.deviceAttendanceEnabled"
          label="Device attendance enabled"
          description="Allow attendance data from punch device."
        />
        <SwitchField
          form={form}
          name="attendance.manualAttendanceAllowed"
          label="Manual attendance allowed"
          description="Allow manager to add or correct attendance manually."
        />
      </SettingsSectionCard>
    </>
  );
}

function PrintSettingsForm({ form }: { form: any }) {
  return (
    <>
      <SettingsSectionCard
        title="Print layout"
        description="Control how receipts and tailor copies should print."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            form={form}
            name="prints.defaultPrintSize"
            label="Default print size"
            options={[
              { value: "A4", label: "A4" },
              { value: "Half A4", label: "Half A4" },
              { value: "Thermal", label: "Thermal" },
            ]}
          />
          <SelectField
            form={form}
            name="prints.tailorPrintSize"
            label="Tailor print size"
            options={[
              { value: "A4", label: "A4" },
              { value: "Half A4", label: "Half A4" },
            ]}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Print content"
        description="Choose what details should appear on printouts."
      >
        <SwitchField
          form={form}
          name="prints.showShopHeader"
          label="Show shop header"
          description="Show shop name and contact details at the top."
        />
        <SwitchField
          form={form}
          name="prints.showFooter"
          label="Show footer"
          description="Show thank you note or footer text."
        />
        <SwitchField
          form={form}
          name="prints.showOrderNotes"
          label="Show order notes"
          description="Print order notes when available."
        />
        <SwitchField
          form={form}
          name="prints.showMeasurementNotes"
          label="Show measurement notes"
          description="Print measurement notes for tailoring work."
        />
        <SwitchField
          form={form}
          name="prints.showItemNotesWhenAvailable"
          label="Show item notes only when available"
          description="Avoid empty note sections in printouts."
        />
        <SwitchField
          form={form}
          name="prints.showCustomerPhone"
          label="Show customer phone"
          description="Print customer phone number on documents."
        />
        <SwitchField
          form={form}
          name="prints.showPricesOnCustomerReceipt"
          label="Show prices on customer receipt"
          description="Customer receipt will include amounts."
        />
        <SwitchField
          form={form}
          name="prints.hidePricesOnTailorCopy"
          label="Hide prices on tailor copy"
          description="Tailor copy will not show order price or payment details."
        />
      </SettingsSectionCard>
    </>
  );
}

function WhatsAppSettingsForm({ form }: { form: any }) {
  return (
    <>
      <SettingsSectionCard
        title="WhatsApp connection"
        description="Enable WhatsApp messages for customers."
      >
        <SwitchField
          form={form}
          name="whatsapp.enabled"
          label="Enable WhatsApp"
          description="Allow Helora to send WhatsApp messages."
        />
        <TextField
          form={form}
          name="whatsapp.businessPhoneNumber"
          label="Business WhatsApp number"
          placeholder="Example: 94718370292"
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Automatic messages"
        description="Choose when customers should receive messages."
      >
        <SwitchField
          form={form}
          name="whatsapp.sendOrderCreatedMessage"
          label="Send order created message"
          description="Notify customer after creating an order."
        />
        <SwitchField
          form={form}
          name="whatsapp.sendOrderReadyMessage"
          label="Send order ready message"
          description="Notify customer when order is ready."
        />
        <SwitchField
          form={form}
          name="whatsapp.sendPaymentReceivedMessage"
          label="Send payment received message"
          description="Notify customer after payment is received."
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Message templates"
        description="Use variables like {{customerName}} and {{orderNumber}}."
      >
        <TextareaField
          form={form}
          name="whatsapp.orderCreatedTemplate"
          label="Order created message"
        />
        <TextareaField
          form={form}
          name="whatsapp.orderReadyTemplate"
          label="Order ready message"
        />
        <TextareaField
          form={form}
          name="whatsapp.paymentReceivedTemplate"
          label="Payment received message"
        />
      </SettingsSectionCard>
    </>
  );
}

function PaymentSettingsForm({ form }: { form: any }) {
  return (
    <>
      <SettingsSectionCard
        title="Customer payments"
        description="Control advance payments, credit orders, and receipt numbering."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            form={form}
            name="payments.minimumAdvancePercentage"
            label="Minimum advance percentage"
          />
          <SelectField
            form={form}
            name="payments.defaultPaymentMethod"
            label="Default payment method"
            options={[
              { value: "Cash", label: "Cash" },
              { value: "Card", label: "Card" },
              { value: "Bank Transfer", label: "Bank Transfer" },
            ]}
          />
          <TextField
            form={form}
            name="payments.receiptPrefix"
            label="Receipt prefix"
          />
        </div>

        <SwitchField
          form={form}
          name="payments.advancePaymentEnabled"
          label="Enable advance payments"
          description="Allow staff to collect an advance."
        />
        <SwitchField
          form={form}
          name="payments.allowCreditOrders"
          label="Allow credit orders"
          description="Let selected customers pay later."
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Employee payments"
        description="Control salary and garment production payment methods."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            form={form}
            name="payments.overtimeRateMultiplier"
            label="Overtime rate multiplier"
          />
        </div>

        <SwitchField
          form={form}
          name="payments.monthlySalaryEnabled"
          label="Enable monthly salary"
          description="Allow monthly salary employees."
        />
        <SwitchField
          form={form}
          name="payments.dailyPaymentEnabled"
          label="Enable daily payment"
          description="Allow daily paid employees."
        />
        <SwitchField
          form={form}
          name="payments.pieceRatePaymentEnabled"
          label="Enable piece-rate payment"
          description="Allow payment per stitched item."
        />
        <SwitchField
          form={form}
          name="payments.lateDeductionEnabled"
          label="Enable late deduction"
          description="Deduct salary when employee is late."
        />
      </SettingsSectionCard>
    </>
  );
}

function DataImportSettingsForm({ form }: { form: any }) {
  return (
    <SettingsSectionCard
      title="Import rules"
      description="These settings help when importing old Access DB or Excel data."
    >
      <SwitchField
        form={form}
        name="dataImport.allowDuplicatePhoneNumbers"
        label="Allow duplicate phone numbers"
        description="Useful when family members use the same phone number."
      />
      <SwitchField
        form={form}
        name="dataImport.autoGenerateCustomerNumbers"
        label="Auto-generate missing customer numbers"
        description="Create customer numbers when old data does not have them."
      />
      <SwitchField
        form={form}
        name="dataImport.autoGenerateBlockNumbers"
        label="Auto-generate missing block numbers"
        description="Create block numbers when old data does not have them."
      />
      <SwitchField
        form={form}
        name="dataImport.validateBeforeImport"
        label="Validate before import"
        description="Check data problems before saving to Helora."
      />
      <SwitchField
        form={form}
        name="dataImport.keepImportHistory"
        label="Keep import history"
        description="Save import logs for checking later."
      />
    </SettingsSectionCard>
  );
}

function PreferenceSettingsForm({ form }: { form: any }) {
  return (
    <SettingsSectionCard
      title="System preferences"
      description="Choose how Helora ERP should display common information."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          form={form}
          name="preferences.language"
          label="Language"
          options={[
            { value: "English", label: "English" },
            { value: "Sinhala", label: "Sinhala" },
          ]}
        />
        <SelectField
          form={form}
          name="preferences.dateFormat"
          label="Date format"
          options={[
            { value: "dd MMM yyyy", label: "30 Apr 2026" },
            { value: "yyyy-MM-dd", label: "2026-04-30" },
            { value: "dd/MM/yyyy", label: "30/04/2026" },
          ]}
        />
        <SelectField
          form={form}
          name="preferences.timeFormat"
          label="Time format"
          options={[
            { value: "12-hour", label: "12-hour" },
            { value: "24-hour", label: "24-hour" },
          ]}
        />
        <NumberField
          form={form}
          name="preferences.defaultPageSize"
          label="Default page size"
        />
        <SelectField
          form={form}
          name="preferences.defaultDashboardRange"
          label="Dashboard range"
          options={[
            { value: "Today", label: "Today" },
            { value: "This week", label: "This week" },
            { value: "This month", label: "This month" },
          ]}
        />
        <SelectField
          form={form}
          name="preferences.theme"
          label="Theme"
          options={[
            { value: "System", label: "System" },
            { value: "Light", label: "Light" },
            { value: "Dark", label: "Dark" },
          ]}
        />
      </div>
    </SettingsSectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Field Components                                                   */
/* ------------------------------------------------------------------ */

function TextField({
  form,
  name,
  label,
  type = "text",
  placeholder,
}: {
  form: any;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="grid gap-2">
          <Label className="font-bold text-slate-700">{label}</Label>
          <Input
            type={type}
            value={field.state.value ?? ""}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={placeholder}
            className="h-11 rounded-lg bg-slate-50 text-sm font-semibold shadow-none"
          />
        </div>
      )}
    />
  );
}

function NumberField({
  form,
  name,
  label,
}: {
  form: any;
  name: string;
  label: string;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="grid gap-2">
          <Label className="font-bold text-slate-700">{label}</Label>
          <Input
            type="number"
            value={field.state.value ?? 0}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(Number(event.target.value))}
            className="h-11 rounded-lg bg-slate-50 text-sm font-semibold shadow-none"
          />
        </div>
      )}
    />
  );
}

function SelectField({
  form,
  name,
  label,
  options,
}: {
  form: any;
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="grid gap-2">
          <Label className="font-bold text-slate-700">{label}</Label>
          <Select
            value={field.state.value}
            onValueChange={field.handleChange}
          >
            <SelectTrigger className="h-11 rounded-lg bg-slate-50 text-sm font-semibold shadow-none">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
}

function SwitchField({
  form,
  name,
  label,
  description,
}: {
  form: any;
  name: string;
  label: string;
  description: string;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <Label className="font-black text-slate-900">{label}</Label>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <Switch
            checked={Boolean(field.state.value)}
            onCheckedChange={field.handleChange}
          />
        </div>
      )}
    />
  );
}

function TextareaField({
  form,
  name,
  label,
}: {
  form: any;
  name: string;
  label: string;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="grid gap-2">
          <Label className="font-bold text-slate-700">{label}</Label>
          <Textarea
            value={field.state.value ?? ""}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            className="min-h-24 rounded-lg bg-slate-50 text-sm font-semibold shadow-none"
          />
        </div>
      )}
    />
  );
}