/**
 * Client-side mirror of the backend's Indian-phone normaliser.
 * Returns a normalised `+91XXXXXXXXXX` string, or null if invalid.
 *
 * Mirror this carefully with backend/src/utils/phone.js — they must agree.
 */
export function normalizeIndianPhone(raw: string): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");

  let mobile: string | undefined;
  if (digits.length === 10) mobile = digits;
  else if (digits.length === 12 && digits.startsWith("91")) mobile = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) mobile = digits.slice(1);
  else return null;

  if (!/^[6-9]\d{9}$/.test(mobile)) return null;
  return `+91${mobile}`;
}

/** Best-effort live-validation pattern for HTML `pattern` attr. */
export const INDIAN_PHONE_HTML_PATTERN =
  "(\\+?91[ -]?)?[6-9][0-9]{4}[ -]?[0-9]{5}";

/** Helper text used under phone inputs. */
export const PHONE_HELPER = "10-digit Indian mobile number (starts with 6–9).";
