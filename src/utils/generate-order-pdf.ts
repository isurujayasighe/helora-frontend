import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Order } from "@/types/orders";

type PrintableMeasurementMap = Record<string, string | number | undefined>;

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: Date) {
  const date = value ?? new Date();
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getItemMeasurements(item: unknown): PrintableMeasurementMap {
  if (
    item &&
    typeof item === "object" &&
    "measurements" in item &&
    item.measurements &&
    typeof item.measurements === "object"
  ) {
    return item.measurements as PrintableMeasurementMap;
  }

  return {};
}

function getMeasurementValue(
  measurements: PrintableMeasurementMap,
  keys: string[]
) {
  for (const key of keys) {
    const value = measurements?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "-";
}

function drawHeader(doc: jsPDF, order: Order) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("New Deepani Garment", 10, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Tailoring Work Sheet", 10, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Order #${order.orderNumber}`, pageWidth - 10, 10, {
    align: "right",
  });

  doc.setFillColor(255, 247, 237);
  doc.roundedRect(pageWidth - 52, 13, 42, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(`PROMISED: ${formatDate(order.promisedDate)}`, pageWidth - 31, 18.3, {
    align: "center",
  });

  doc.setDrawColor(210, 210, 210);
  doc.line(10, 23, pageWidth - 10, 23);
}

function drawFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(220, 220, 220);
  doc.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Generated: ${formatDateTime()}`, 10, pageHeight - 5);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 10, pageHeight - 5, {
    align: "right",
  });
}

function drawCustomerSummary(doc: jsPDF, order: Order, startY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, startY, pageWidth - 20, 13, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Customer", 14, startY + 5);
  doc.text("Phone", 68, startY + 5);
  doc.text("Town", 108, startY + 5);
  doc.text("Order Date", 145, startY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(order.customer?.fullName || "-", 14, startY + 10);
  doc.text(order.customer?.phoneNumber || "-", 68, startY + 10);
  doc.text(order.customer?.town || "-", 108, startY + 10);
  doc.text(formatDate(order.orderDate), 145, startY + 10);
}

export function generateOrderPdf(order: Order) {
  const doc = new jsPDF("l", "mm", "a5");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  drawHeader(doc, order);
  drawCustomerSummary(doc, order, 27);

  let currentY = 45;

  autoTable(doc, {
    startY: currentY,
    head: [[
      "Done",
      "No",
      "Cat",
      "Qty",
      "Block",
      "Chest/Bust",
      "Waist",
      "Hip",
      "Shoulder",
      "Sleeve",
      "Length",
    ]],
    body: order.items.map((item, index) => {
      const measurements = getItemMeasurements(item);

      return [
        "☐",
        String(index + 1),
        item.category?.name || "-",
        String(item.quantity ?? "-"),
        item.block?.blockNumber || "-",
        getMeasurementValue(measurements, ["chest", "bust", "blouseBust"]),
        getMeasurementValue(measurements, ["waist"]),
        getMeasurementValue(measurements, ["hip"]),
        getMeasurementValue(measurements, ["shoulder"]),
        getMeasurementValue(measurements, ["sleeveLength"]),
        getMeasurementValue(measurements, [
          "shirtLength",
          "blouseLength",
          "height",
        ]),
      ];
    }),
    styles: {
      fontSize: 6.8,
      cellPadding: 1.8,
      valign: "middle",
      halign: "center",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 9 },
      2: { cellWidth: 18, halign: "left" },
      3: { cellWidth: 10 },
      4: { cellWidth: 22, halign: "left" },
      5: { cellWidth: 16 },
      6: { cellWidth: 14 },
      7: { cellWidth: 12 },
      8: { cellWidth: 16 },
      9: { cellWidth: 16 },
      10: { cellWidth: 16 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      drawHeader(doc, order);
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  const itemNotes = order.items
    .map((item, index) => {
      const note = item.notes?.trim();
      if (!note) return null;

      return {
        title: `Item ${index + 1}`,
        description: item.itemDescription || "-",
        note,
      };
    })
    .filter(Boolean) as { title: string; description: string; note: string }[];

  if (itemNotes.length > 0) {
    if (currentY > pageHeight - 32) {
      doc.addPage();
      drawHeader(doc, order);
      currentY = 27;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Item Notes", margin, currentY);
    currentY += 4;

    itemNotes.forEach((itemNote) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        drawHeader(doc, order);
        currentY = 27;
      }

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, pageWidth - 20, 11, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${itemNote.title}: ${itemNote.description}`, margin + 3, currentY + 4.2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const noteLines = doc.splitTextToSize(
        itemNote.note,
        pageWidth - 28
      );
      doc.text(noteLines, margin + 3, currentY + 8);

      currentY += Math.max(13, 7 + noteLines.length * 3.5);
    });

    currentY += 2;
  }

  if (currentY > pageHeight - 24) {
    doc.addPage();
    drawHeader(doc, order);
    currentY = 27;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Order Notes", margin, currentY);
  currentY += 4;

  doc.setFillColor(255, 251, 235);
  const notesBoxHeight = 12;
  doc.roundedRect(margin, currentY, pageWidth - 20, notesBoxHeight, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const orderNotesText = order.notes?.trim() || "-";
  const orderNotesLines = doc.splitTextToSize(orderNotesText, pageWidth - 28);
  doc.text(orderNotesLines, margin + 3, currentY + 5);

  currentY += Math.max(notesBoxHeight + 3, orderNotesLines.length * 3.8 + 7);

  if (currentY > pageHeight - 18) {
    doc.addPage();
    drawHeader(doc, order);
    currentY = 27;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Tailor Remarks", margin, currentY);
  currentY += 3;

  doc.setDrawColor(210, 210, 210);
  doc.roundedRect(margin, currentY, pageWidth - 20, 14, 2, 2);

  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Checked By: ____________________", margin, currentY);
  doc.text("Date: ____________________", 110, currentY);

  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  doc.save(`order-${order.orderNumber}.pdf`);
}