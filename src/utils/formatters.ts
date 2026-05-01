export const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatCurrency = (value?: string | number | null) => {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return "Rs. 0";
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (value?: string | number | null) => {
  const number = Number(value ?? 0);

  if (Number.isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-LK").format(number);
};

export const readableStatus = (value?: string | null) => {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};