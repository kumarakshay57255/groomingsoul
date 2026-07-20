"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, LogOut, Menu, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { useAuth } from "@/lib/auth";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-navy text-cream transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_20px_-8px_rgba(8,26,46,0.6)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" aria-label="Grooming Souls home" className="-m-1 p-1">
          <Logo light />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {site.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group relative text-sm font-medium text-cream/80 transition-colors hover:text-cream"
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex max-w-[14rem] items-center gap-1.5 truncate rounded-full border border-cream/25 px-4 py-2 text-sm font-medium text-cream/90 transition-colors hover:border-cream/60"
                title={user.name}
              >
                <User size={14} className="shrink-0" />
                <span className="truncate">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-cream/80 transition-colors hover:text-cream"
              >
                Sign in
              </Link>
              <Link
                href="/therapy"
                className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Book a session
                <Calendar size={14} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden rounded-full border border-cream/25 p-2 text-cream"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden border-t border-cream/15 bg-navy transition-[max-height] duration-300 ${
          open ? "max-h-80" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-4" aria-label="Mobile">
          {site.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="border-b border-cream/10 py-3 text-base text-cream/85 hover:text-cream"
            >
              {n.label}
            </Link>
          ))}
          {!loading && user ? (
            <div className="mt-4 grid gap-2">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-5 py-3 text-sm font-medium text-cream/90"
              >
                <User size={14} /> {user.name} · Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 px-5 py-3 text-sm font-medium text-gold"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-cream/25 px-5 py-3 text-sm font-medium text-cream/90"
              >
                Sign in
              </Link>
              <Link
                href="/therapy"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 px-5 py-3 text-sm font-medium text-gold"
              >
                Book a session
                <Calendar size={14} />
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
