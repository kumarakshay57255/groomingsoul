/**
 * Format the time-until-expiry chip for the student dashboard.
 *
 * We don't trust `daysRemaining` from the backend (it's ceil'd, so 3 minutes
 * shows as "1 day"). Instead we re-derive from the raw `expiresAt` ISO string.
 */

export type ExpiryDisplay = {
  /** Short label for the chip ("3 hrs remaining", "12 min remaining", …). */
  label: string;
  /** True when ≤ 7 days OR ≤ 24 hours — drives the "Renew soon" warning. */
  warn: boolean;
  /** True when expired (≤ 0 ms left). */
  expired: boolean;
  /** Approximate days remaining, floored. Used for filtering / sorting. */
  daysFloor: number;
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function describeExpiry(expiresAt: string | null): ExpiryDisplay {
  if (!expiresAt) {
    return { label: "Active", warn: false, expired: false, daysFloor: 0 };
  }
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms)) {
    return { label: "Active", warn: false, expired: false, daysFloor: 0 };
  }
  if (ms <= 0) {
    return { label: "Expired", warn: true, expired: true, daysFloor: 0 };
  }

  const daysFloor = Math.floor(ms / DAY);

  if (ms < MIN) {
    return { label: "Expires in seconds", warn: true, expired: false, daysFloor: 0 };
  }
  if (ms < HOUR) {
    const m = Math.max(1, Math.floor(ms / MIN));
    return {
      label: `${m} min remaining`,
      warn: true,
      expired: false,
      daysFloor: 0,
    };
  }
  if (ms < DAY) {
    const h = Math.max(1, Math.floor(ms / HOUR));
    return {
      label: `${h} hr${h === 1 ? "" : "s"} remaining`,
      warn: true,
      expired: false,
      daysFloor: 0,
    };
  }
  return {
    label: `${daysFloor} day${daysFloor === 1 ? "" : "s"} remaining`,
    warn: daysFloor <= 7,
    expired: false,
    daysFloor,
  };
}
