/**
 * Sidebar navigation config for the admin CMS.
 * Sections are grouped to keep the dense data-first sidebar tidy.
 */
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookMarked,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Stethoscope,
  Trophy,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Sub-phase that ships this item (purely informational, surfaced as a tag). */
  phase?: string;
  /**
   * Roles allowed to see this nav item. Defaults to `['admin']`. Items that
   * include `'intern'` are also visible to interns + accessible to their session.
   */
  roles?: Array<"admin" | "intern">;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export type StaffRole = "admin" | "intern";

/** Defaults to admin-only if `roles` is omitted on the nav item. */
export function isItemVisibleFor(item: AdminNavItem, role: StaffRole): boolean {
  const allowed = item.roles ?? ["admin"];
  return allowed.includes(role);
}

/** Filtered copy of `adminNavGroups` for a given role. Empty groups are dropped. */
export function navGroupsFor(role: StaffRole): AdminNavGroup[] {
  // We resolve `adminNavGroups` lazily because it's defined below.
  return adminNavGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => isItemVisibleFor(it, role)),
    }))
    .filter((g) => g.items.length > 0);
}

/**
 * Returns true if `pathname` (e.g. `/admin/leads`) is reachable by the given
 * role under the current sidebar config. Used by the AdminShell to decide
 * whether to redirect or show the page.
 */
export function isPathAllowedFor(pathname: string, role: StaffRole): boolean {
  if (pathname === "/admin") return role === "admin"; // KPI dashboard
  for (const g of adminNavGroups) {
    for (const it of g.items) {
      if (pathname === it.href || pathname.startsWith(it.href + "/")) {
        return isItemVisibleFor(it, role);
      }
    }
  }
  /* Unknown subpath under /admin — default to admin-only to be safe */
  return role === "admin";
}

/** Where to land each role on sign-in / when blocked from a non-permitted page. */
export function landingPathFor(role: StaffRole): string {
  return role === "admin" ? "/admin" : "/admin/leads";
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, phase: "4.2" },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/therapists",
        label: "Therapists",
        icon: Stethoscope,
        phase: "4.3",
      },
      {
        href: "/admin/team",
        label: "Core Team & Founder",
        icon: Users,
        phase: "4.4",
      },
      {
        href: "/admin/advisory",
        label: "Advisory Panel",
        icon: Award,
        phase: "4.5",
      },
      {
        href: "/admin/achievements",
        label: "Founder Achievements",
        icon: Trophy,
        phase: "4.12",
      },
      {
        href: "/admin/books",
        label: "Books",
        icon: BookMarked,
        phase: "4.13",
      },
      {
        href: "/admin/courses",
        label: "Courses & Lessons",
        icon: GraduationCap,
        phase: "4.6",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/admin/leads",
        label: "Therapy leads",
        icon: Inbox,
        phase: "4.7",
        roles: ["admin", "intern"],
      },
      {
        href: "/admin/tests",
        label: "Test submissions",
        icon: ListChecks,
        phase: "4.8",
        roles: ["admin", "intern"],
      },
      {
        href: "/admin/purchases",
        label: "Purchases & receipts",
        icon: ScrollText,
        phase: "4.9",
      },
      {
        href: "/admin/certificates",
        label: "Certificate queue",
        icon: Truck,
        phase: "4.10",
      },
    ],
  },
  {
    label: "Access",
    items: [
      { href: "/admin/staff", label: "Staff & roles", icon: UserCog, phase: "4.11" },
    ],
  },
];
