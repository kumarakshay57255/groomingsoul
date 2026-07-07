"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, ApiError, API_BASE_URL } from "@/lib/api";
import { formatInr, type CourseDetail } from "@/lib/courses";
import {
  INDIAN_PHONE_HTML_PATTERN,
  PHONE_HELPER,
  normalizeIndianPhone,
} from "@/lib/phone";

type Props = {
  open: boolean;
  onClose: () => void;
  course: CourseDetail;
};

export function CheckoutModal({ open, onClose, course }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Body scroll lock */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Reset on close */
  useEffect(() => {
    if (!open) {
      setFile(null);
      setFilePreview(null);
      setError(null);
      setSubmitting(false);
      formRef.current?.reset();
    }
  }, [open]);

  /* Esc to close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* File preview lifecycle */
  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!file) {
      setError("Please attach the payment receipt screenshot.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const rawPhone = String(fd.get("payerPhone") ?? "").trim();
    const normalisedPhone = normalizeIndianPhone(rawPhone);
    if (!normalisedPhone) {
      setError("Enter a valid 10-digit Indian mobile number (starts with 6–9).");
      return;
    }
    fd.set("payerPhone", normalisedPhone);
    fd.set("courseId", course.id);
    fd.set("receipt", file, file.name);

    setSubmitting(true);
    setError(null);

    try {
      await api("/api/purchases", { method: "POST", body: fd });
      onClose();
      router.push("/checkout/success");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("We couldn't submit just now — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const validityLabel =
    course.validityDays >= 180
      ? "6 months"
      : course.validityDays >= 90
        ? "3 months"
        : course.validityDays >= 30
          ? "1 month"
          : `${course.validityDays} days`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close checkout"
            onClick={onClose}
            className="absolute inset-0 bg-brand-brown/45 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="sticky right-4 top-4 z-10 ml-auto grid h-9 w-9 place-items-center rounded-full bg-cream text-ink-soft shadow hover:bg-cream-deep"
            >
              <X size={16} />
            </button>

            <div className="grid gap-0 px-7 pb-8 pt-2 sm:grid-cols-2 sm:px-9">
              {/* Left — QR + instructions */}
              <div className="border-b border-line pb-7 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-7">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sage-deep">
                  <Wallet size={14} /> Step 1 · Pay via UPI
                </div>
                <h2
                  id="checkout-title"
                  className="mt-2 font-display text-2xl text-brand-brown sm:text-3xl"
                >
                  Scan &amp; pay {formatInr(course.priceInr)}
                </h2>

                <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-cream-deep/40">
                  <div className="bg-cream p-4">
                    <Image
                      src="/qr.jpeg"
                      alt="Grooming Souls — Arhama Malik · official UPI QR"
                      width={746}
                      height={639}
                      className="mx-auto h-auto w-full max-w-[260px] rounded-xl"
                      priority
                    />
                  </div>
                  <p className="border-t border-line bg-cream-deep/60 px-4 py-2 text-center text-[0.7rem] text-ink-soft">
                    Pay to <strong className="text-brand-brown">Arhama Malik</strong> — Grooming Souls official UPI
                  </p>
                </div>

                <ol className="mt-5 space-y-2 text-sm text-ink-soft">
                  <li>1. Open any UPI app (Paytm/PhonePe/GPay).</li>
                  <li>2. Scan the QR and pay <strong>{formatInr(course.priceInr)}</strong>.</li>
                  <li>3. Screenshot the success page from your UPI app.</li>
                  <li>4. Upload the screenshot here →</li>
                </ol>

                <div className="mt-5 rounded-xl bg-sage-soft/45 px-3 py-2.5 text-xs text-sage-deep">
                  <strong>{validityLabel}</strong> of access begins from the
                  moment our team verifies your payment (typically within 12
                  hours).
                </div>
              </div>

              {/* Right — form */}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="pt-7 sm:pl-7 sm:pt-0"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sage-deep">
                  <Upload size={14} /> Step 2 · Submit details
                </div>
                <h3 className="mt-2 font-display text-2xl text-brand-brown sm:text-3xl">
                  Upload your receipt
                </h3>

                <div className="mt-5 space-y-4">
                  <Field
                    label="Full name"
                    name="payerName"
                    type="text"
                    required
                    defaultValue={user?.name ?? ""}
                  />
                  <div>
                    <Field
                      label="Contact number"
                      name="payerPhone"
                      type="tel"
                      inputMode="tel"
                      required
                      defaultValue={user?.phone ?? ""}
                      pattern={INDIAN_PHONE_HTML_PATTERN}
                      maxLength={15}
                      placeholder="9XXXXXXXXX"
                      title="10-digit Indian mobile number"
                    />
                    <p className="mt-1.5 text-[0.7rem] text-ink-soft">
                      {PHONE_HELPER}
                    </p>
                  </div>
                  <Field
                    label="Email"
                    name="payerEmail"
                    type="email"
                    required
                    defaultValue={user?.email ?? ""}
                  />

                  <div>
                    <span className="text-xs uppercase tracking-[0.14em] text-sage-deep">
                      Payment receipt (JPG / PNG / WebP, max 5 MB)
                    </span>
                    <label
                      htmlFor="receipt"
                      className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-brand-brown/30 bg-cream-deep/40 p-3 text-sm transition-colors hover:border-clinical"
                    >
                      {filePreview ? (
                        <div className="flex flex-1 items-center gap-3">
                          {/* Local object URL — plain img is correct here */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={filePreview}
                            alt="Receipt preview"
                            className="h-14 w-14 rounded-md object-cover"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-brand-brown">
                              {file?.name}
                            </div>
                            <div className="text-[0.7rem] text-ink-soft">
                              {((file?.size ?? 0) / 1024).toFixed(0)} KB · click
                              to change
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload size={18} className="text-brand-brown" />
                          <span className="text-ink-soft">
                            Click to attach screenshot
                          </span>
                        </>
                      )}
                      <input
                        id="receipt"
                        name="receipt"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-xl border border-coral/40 bg-coral-soft/40 px-4 py-2.5 text-sm text-brand-brown">
                      {error}
                    </p>
                  )}

                  {!user && (
                    <p className="rounded-xl bg-sun/25 px-3 py-2.5 text-xs text-brand-brown">
                      You&apos;ll need to{" "}
                      <a
                        href={`/login?next=${
                          typeof window !== "undefined"
                            ? encodeURIComponent(window.location.pathname)
                            : "/"
                        }`}
                        className="font-medium underline"
                      >
                        sign in
                      </a>{" "}
                      before submitting.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinical px-6 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-clinical-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} /> Submit for verification
                      </>
                    )}
                  </button>
                  <p className="text-center text-[0.7rem] text-ink-soft">
                    Receipts are stored confidentially at {API_BASE_URL}.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = rest.id ?? rest.name;
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </span>
      <input
        id={id}
        {...rest}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-clinical"
      />
    </label>
  );
}
