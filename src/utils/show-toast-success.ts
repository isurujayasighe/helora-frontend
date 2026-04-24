import { toast } from "sonner"

/**
 * Displays a success toast notification (Green).
 */
export const showToastSuccess = (title: string, message?: string) => {
  toast.success(title, {
    description: message,
    duration: 3000,
    position: "top-right",
    // Standard Green Styling
    className: "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-800 group-[.toaster]:border-green-200",
  })
}

/**
 * Displays an error toast notification (Red).
 */
export const showToastError = (title: string, message?: string) => {
  toast.error(title, {
    description: message || "An unexpected error occurred. Please try again.",
    duration: 5000, 
    position: "top-right",
    // Standard Red Styling
    className: "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-800 group-[.toaster]:border-red-200",
  })
}