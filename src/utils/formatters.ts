/**
 * Formatting utilities
 */

/**
 * Format number as currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date to locale string
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'en-US'
): string => {
  return new Date(date).toLocaleDateString(locale);
};

/**
 * Format phone number
 * Example: +225 12 34 56 78 (Côte d'Ivoire)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1,3})(\d{0,9})$/);

  if (!match) return phone;

  return `+${match[1]} ${match[2]
    .replace(/(\d{2})/g, '$1 ')
    .trim()}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number = 50
): string => {
  return text.length > maxLength
    ? `${text.slice(0, maxLength)}...`
    : text;
};

export default {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  truncateText,
};
