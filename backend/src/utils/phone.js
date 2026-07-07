/**
 * Normalises an Indian mobile number to the form `+91XXXXXXXXXX`.
 *
 * Accepts user-friendly inputs like:
 *   - "9389872523"
 *   - "+91 93898 72523"
 *   - "919389872523"
 *
 * Rules:
 *   - Must contain exactly 10 mobile digits (after stripping country code).
 *   - First mobile digit must be 6–9 (Indian mobile range).
 *
 * Returns the normalised string, or `null` if invalid.
 */
function normalizeIndianPhone(raw) {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/\D/g, '');

  let mobile;
  if (digits.length === 10) mobile = digits;
  else if (digits.length === 12 && digits.startsWith('91')) mobile = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) mobile = digits.slice(1);
  else return null;

  if (!/^[6-9]\d{9}$/.test(mobile)) return null;
  return `+91${mobile}`;
}

module.exports = { normalizeIndianPhone };
