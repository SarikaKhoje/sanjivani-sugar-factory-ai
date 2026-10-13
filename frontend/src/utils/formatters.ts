/**
 * Formats a number into Indian Rupees using the en-IN locale.
 * Example: 119000 -> "₹1,19,000"
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats tonnes with decimal formatting.
 * Example: 1207.25 -> "1,207.25 T"
 */
export function formatTonnes(tonnes: number): string {
  if (isNaN(tonnes) || tonnes === null || tonnes === undefined) {
    return '0.00 T';
  }
  return `${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(tonnes)} T`;
}

/**
 * Standard number formatter with Indian grouping.
 */
export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(val);
}

/**
 * Formats the current date for the dashboard header.
 * Example: "Tuesday, 13 October 2026"
 */
export function formatHeaderDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a time string for chat message timestamps.
 * Example: "01:45 PM"
 */
export function formatTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
