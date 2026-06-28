export function formatMoney(value?: string | number | null) {
  return Number(value ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
  }).format(new Date(value));
}
