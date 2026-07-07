"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { site } from "@/lib/site";

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 w-72 origin-bottom-right rounded-2xl border border-line bg-cream p-4 shadow-[0_20px_50px_-20px_rgba(92,58,46,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-display text-base text-brand-brown">
                Hey there 👋
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Have a question? Chat with our team on WhatsApp — we usually
                reply within minutes.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="-m-1 rounded-full p-1 text-ink-soft hover:bg-cream-deep"
            >
              <X size={16} />
            </button>
          </div>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95"
          >
            <MessageCircle size={15} /> Start chat
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label="Open WhatsApp chat"
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-10px_rgba(37,211,102,0.65)] transition-transform hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping" />
        <MessageCircle
          size={24}
          strokeWidth={2.1}
          className="relative animate-floaty"
        />
      </button>
    </div>
  );
}
