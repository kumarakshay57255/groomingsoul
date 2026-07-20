"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCopy,
  Crown,
  Loader2,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserCog,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  AdminStaffMember,
  STAFF_ROLES,
  STAFF_ROLE_LABELS,
  type StaffRole,
  deleteStaff,
  fetchAdminStaff,
  inviteStaff,
  updateStaff,
} from "@/lib/adminStaff";
import {
  INDIAN_PHONE_HTML_PATTERN,
  PHONE_HELPER,
  normalizeIndianPhone,
} from "@/lib/phone";
import { useAuth } from "@/lib/auth";

const ROLE_TONE: Record<StaffRole, string> = {
  admin: "bg-brand-brown text-cream",
  intern: "bg-sage-soft/55 text-sage-deep",
};

export function StaffManager() {
  const { user: me } = useAuth();
  const [items, setItems] = useState<AdminStaffMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffRole>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminStaffMember | null>(null);
  const [invitedToast, setInvitedToast] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const opts: { role?: StaffRole } = {};
      if (roleFilter !== "all") opts.role = roleFilter;
      setItems(await fetchAdminStaff(opts));
    } catch {
      setError("Couldn't load staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((s) =>
      `${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(q)
    );
  }, [items, search]);

  async function patch(id: string, patchBody: { role?: StaffRole; isActive?: boolean }) {
    try {
      const updated = await updateStaff(id, patchBody);
      setItems((arr) =>
        arr?.map((x) => (x.id === id ? updated : x)) ?? null
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function handleDelete(s: AdminStaffMember) {
    if (!confirm(`Permanently delete ${s.name} (${s.email})? This cannot be undone.`)) return;
    try {
      await deleteStaff(s.id);
      setItems((arr) => arr?.filter((x) => x.id !== s.id) ?? null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  return (
    <>
      {error && (
        <div className="mt-4 rounded-2xl border border-coral/40 bg-coral-soft/40 p-3 text-sm text-brand-brown">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full rounded-full border border-line bg-cream py-2 pl-9 pr-4 text-sm outline-none focus:border-clinical"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as never)}
            className="rounded-full border border-line bg-cream px-3 py-1.5 text-sm outline-none focus:border-clinical"
          >
            <option value="all">All roles</option>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {STAFF_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            <Plus size={14} /> Invite staff
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-soft">
            No staff match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-3 py-3">Email · Phone</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((s) => {
                const isMe = me?.id === s.id;
                return (
                  <tr
                    key={s.id}
                    className={`align-middle ${!s.isActive ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-brand-brown">
                        {s.name}
                        {isMe && (
                          <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-brand-brown/70">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[0.7rem] text-ink-soft">
                        Joined {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">
                      <div>{s.email}</div>
                      <div className="text-[0.7rem]">{s.phone}</div>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={s.role}
                        disabled={isMe}
                        onChange={(e) =>
                          patch(s.id, { role: e.target.value as StaffRole })
                        }
                        className={`rounded-full px-2.5 py-0.5 text-[0.72rem] disabled:cursor-not-allowed disabled:opacity-70 ${ROLE_TONE[s.role]}`}
                      >
                        {STAFF_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {STAFF_ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      {s.isActive ? (
                        <span className="rounded-full bg-sage-soft/55 px-2 py-0.5 text-[0.7rem] text-sage-deep">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-brand-brown/15 px-2 py-0.5 text-[0.7rem] text-brand-brown">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <IconBtn
                          label="Edit"
                          tone="primary"
                          onClick={() => setEditing(s)}
                        >
                          <Pencil size={13} />
                        </IconBtn>
                        {s.isActive ? (
                          <IconBtn
                            label="Deactivate"
                            disabled={isMe}
                            onClick={() => patch(s.id, { isActive: false })}
                          >
                            <Pause size={13} />
                          </IconBtn>
                        ) : (
                          <IconBtn
                            label="Reactivate"
                            onClick={() => patch(s.id, { isActive: true })}
                          >
                            <Play size={13} />
                          </IconBtn>
                        )}
                        <IconBtn
                          label="Delete"
                          tone="danger"
                          disabled={isMe}
                          onClick={() => handleDelete(s)}
                        >
                          <Trash2 size={13} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onCreated={(staff, devTemp) => {
            setItems((arr) => (arr ? [staff, ...arr] : [staff]));
            setInviteOpen(false);
            if (devTemp) {
              setInvitedToast({ email: staff.email, tempPassword: devTemp });
            }
          }}
        />
      )}

      {invitedToast && (
        <TempPasswordModal
          email={invitedToast.email}
          tempPassword={invitedToast.tempPassword}
          onClose={() => setInvitedToast(null)}
        />
      )}

      {editing && (
        <EditStaffModal
          initial={editing}
          isSelf={me?.id === editing.id}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setItems((arr) =>
              arr?.map((x) => (x.id === updated.id ? updated : x)) ?? null
            );
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  tone = "neutral",
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "neutral" | "primary" | "danger";
  children: React.ReactNode;
}) {
  const styles =
    tone === "danger"
      ? "border-coral/50 text-coral hover:bg-coral hover:text-cream"
      : tone === "primary"
        ? "border-line text-brand-brown hover:border-clinical hover:bg-clinical hover:text-cream"
        : "border-line text-ink hover:border-brand-brown/50 hover:text-brand-brown";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border bg-cream transition-colors ${styles} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

/* ---------------- Invite modal ---------------- */

function InviteModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (s: AdminStaffMember, devTempPassword?: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("intern");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!normalizeIndianPhone(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const { staff, devTempPassword } = await inviteStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: normalizeIndianPhone(phone)!,
        role,
        password: password.trim() || undefined,
      });
      onCreated(staff, devTempPassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invite failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]"
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Invite staff
            </p>
            <h2 className="mt-1 font-display text-2xl text-brand-brown">
              Add admin or intern
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft hover:bg-cream-deep"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextField label="Full name" value={name} onChange={setName} required />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Contact number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
              pattern={INDIAN_PHONE_HTML_PATTERN}
              maxLength={15}
              placeholder="9XXXXXXXXX"
              required
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
            <p className="mt-1 text-[0.7rem] text-ink-soft">{PHONE_HELPER}</p>
          </div>
          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {STAFF_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[0.7rem] text-ink-soft">
              Admins get full access. Interns can review test submissions and
              therapy leads (more scopes will be added in Phase 5).
            </p>
          </div>

          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="text"
              autoComplete="new-password"
              minLength={6}
              placeholder="Set a login password (min 6 characters)"
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
            <p className="mt-1 text-[0.7rem] text-ink-soft">
              This is the password they&apos;ll log in with. Share it with them.
            </p>
          </div>

          <div className="rounded-xl bg-sun/20 px-3 py-2 text-[0.78rem] text-brand-brown">
            <UserCog size={12} className="-mt-0.5 mr-1 inline" />
            Leave the password blank to auto-generate a temporary one instead.
          </div>

          {error && (
            <p className="rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-cream-deep/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:border-brand-brown/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-clinical px-5 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Inviting…
              </>
            ) : (
              "Send invite"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Temp password reveal ---------------- */

function TempPasswordModal({
  email,
  tempPassword,
  onClose,
}: {
  email: string;
  tempPassword: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]">
        <div className="border-b border-line bg-sage-soft/40 px-6 py-5">
          <div className="flex items-center gap-2 text-sage-deep">
            <Crown size={15} className="text-sun" />
            <p className="text-[0.7rem] uppercase tracking-[0.18em]">
              Staff invited
            </p>
          </div>
          <h2 className="mt-1 font-display text-2xl text-brand-brown">
            Share their temporary password
          </h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-ink-soft">
            Account created for <strong className="text-brand-brown">{email}</strong>.
            Share this one-time password — they can reset it after first sign-in via
            <code className="ml-1 rounded bg-cream-deep px-1.5 py-0.5 font-mono text-[0.78rem]">
              /forgot-password
            </code>.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-sun/40 bg-sun/15 px-4 py-3">
            <code className="flex-1 font-mono text-lg tracking-wider text-brand-brown">
              {tempPassword}
            </code>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-3 py-1.5 text-xs font-medium text-cream hover:bg-clinical-deep"
            >
              <ClipboardCopy size={11} /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-4 text-[0.78rem] text-ink-soft">
            Phase 5 wires up email delivery (Resend) so this step becomes
            automatic.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-cream-deep/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Edit modal ---------------- */

function EditStaffModal({
  initial,
  isSelf,
  onClose,
  onSaved,
}: {
  initial: AdminStaffMember;
  isSelf: boolean;
  onClose: () => void;
  onSaved: (s: AdminStaffMember) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [role, setRole] = useState<StaffRole>(initial.role);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    /* Build a minimal diff so we don't trip the self-protection rules
       (e.g. sending the same role for yourself is fine; sending a different
       role for yourself would 400). */
    const patchBody: {
      name?: string;
      phone?: string;
      role?: StaffRole;
      isActive?: boolean;
    } = {};
    if (name.trim() !== initial.name) patchBody.name = name.trim();
    if (normalized !== initial.phone) patchBody.phone = normalized;
    if (role !== initial.role) patchBody.role = role;
    if (isActive !== initial.isActive) patchBody.isActive = isActive;

    if (Object.keys(patchBody).length === 0) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateStaff(initial.id, patchBody);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]"
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Edit staff member
            </p>
            <h2 className="mt-1 truncate font-display text-2xl text-brand-brown">
              {initial.name}
            </h2>
            <p className="truncate text-[0.78rem] text-ink-soft">
              {initial.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft hover:bg-cream-deep"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextField label="Full name" value={name} onChange={setName} required />

          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Contact number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
              pattern={INDIAN_PHONE_HTML_PATTERN}
              maxLength={15}
              required
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
            <p className="mt-1 text-[0.7rem] text-ink-soft">{PHONE_HELPER}</p>
          </div>

          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              disabled={isSelf}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical disabled:cursor-not-allowed disabled:opacity-70"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {STAFF_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {isSelf && (
              <p className="mt-1 text-[0.7rem] text-ink-soft">
                You cannot change your own role. Ask another admin if you need it changed.
              </p>
            )}
          </div>

          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 text-sm ${
              isSelf ? "opacity-60" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSelf}
              className="h-4 w-4"
            />
            <span>
              <strong>Account active</strong> — uncheck to revoke sign-in and
              kill any open sessions.
            </span>
          </label>
          {isSelf && (
            <p className="text-[0.7rem] text-ink-soft">
              You cannot deactivate your own account.
            </p>
          )}

          <div className="rounded-xl bg-cream-deep/60 px-3 py-2 text-[0.72rem] text-ink-soft">
            Email <code>{initial.email}</code> is the account&apos;s permanent
            identifier and can&apos;t be changed here. Delete + re-invite if it
            ever needs to.
          </div>

          {error && (
            <p className="rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-cream-deep/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:border-brand-brown/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-clinical px-5 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
        {...rest}
      />
    </div>
  );
}
