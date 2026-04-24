import { covalentHubClient } from "@/services/clients/covalent.client";

// Add this to your invoices.service.ts
export const downloadInvoicePdf = async (invoiceNo: string) => {
  try {
    const response = await covalentHubClient.get(
      `cp/invoice-service/api/Invoices/${invoiceNo}/download`,
      { responseType: 'blob' } // Important: tells axios to handle binary data
    );

    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Set the filename
    link.setAttribute('download', `Invoice-${invoiceNo}.pdf`);
    
    // Append to body, click, and cleanup
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download PDF:", error);
    // You could trigger a toast notification here
  }
};