"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import {
  isPathAllowedFor,
  landingPathFor,
  navGroupsFor,
  type StaffRole,
} from "@/lib/adminNav";
import { useAuth } from "@/lib/auth";

/**
 * Auth-gated layout for /admin/*.
 *
 *   - anonymous       → redirect to /login?next=/admin/...
 *   - student role    → inline "Admin access only" card
 *   - intern / admin  → shown the console with a role-filtered sidebar
 *   - intern hitting an admin-only page  → redirected to /admin/leads
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Auth gate */
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  /* If an intern landed on an admin-only sub-page, bounce them home. */
  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "intern" && !isPathAllowedFor(pathname, "intern")) {
      router.replace(landingPathFor("intern"));
    }
  }, [loading, user, pathname, router]);

  /* Close mobile drawer on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink-soft">
        <Loader2 size={16} className="mr-2 animate-spin" /> Loading admin…
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "intern") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <ShieldCheck size={40} className="text-coral" />
        <h1 className="mt-5 font-display text-3xl text-brand-brown">
          Staff access only.
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Your account ({user.email}) is signed in as <strong>{user.role}</strong>.
          The admin panel is restricted to foundation staff.
        </p>
        <div className="mt-7 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-clinical px-5 py-2.5 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            Go to dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-brand-brown/25 bg-cream px-5 py-2.5 text-sm font-medium text-brand-brown hover:border-brand-brown/60"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const role = user.role as StaffRole;
  const visibleGroups = navGroupsFor(role);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6EC] sm:flex-row">
      {/* ----- Sidebar ----- */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } fixed inset-0 z-40 bg-cream sm:relative sm:block sm:w-64 sm:flex-shrink-0 sm:border-r sm:border-line`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-5">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <div className="font-display text-base text-brand-brown">
                Grooming Souls
              </div>
              <div className="text-[0.62rem] uppercase tracking-[0.18em] text-sage-deep">
                Admin
              </div>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="sm:hidden rounded-full border border-line p-2 text-ink-soft"
          >
            <X size={14} />
          </button>
        </div>

        <nav
          className="overflow-y-auto py-4 sm:h-[calc(100vh-4rem)]"
          aria-label="Admin navigation"
        >
          {visibleGroups.map((group) => (
            <div key={group.label} className="px-3 pb-4">
              <div className="px-2 pb-2 text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft/70">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.85rem] transition-colors ${
                          active
                            ? "bg-brand-brown text-cream"
                            : "text-ink hover:bg-cream-deep/70 hover:text-brand-brown"
                        }`}
                      >
                        <Icon size={15} strokeWidth={1.8} />
                        <span className="flex-1">{item.label}</span>
                        {item.phase && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[0.6rem] tabular-nums ${
                              active
                                ? "bg-cream/15 text-cream/80"
                                : "bg-cream-deep text-ink-soft/70"
                            }`}
                          >
                            {item.phase}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* ----- Content column ----- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-cream/85 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="sm:hidden rounded-full border border-line bg-cream p-2 text-brand-brown"
          >
            <Menu size={14} />
          </button>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-brand-brown">{user.name}</div>
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-sage-deep">
                {user.role}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-brown px-3.5 py-1.5 text-xs font-medium text-cream hover:bg-brand-brown/85"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
