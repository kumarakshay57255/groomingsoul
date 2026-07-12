import { api, API_BASE_URL } from "./api";

export type CourseCategory =
  | "11-12"
  | "cuet-ug"
  | "cuet-pg"
  | "net-jrf"
  | "diploma";

export type CourseType = "academy" | "diploma";

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  instructor: string | null;
  description: string | null;
  coverColor: string;
  coverImagePath: string | null;
  category: CourseCategory;
  type: CourseType;
  priceInr: number;
  validityDays: number;
  estimatedHours: number | null;
  isPublished: boolean;
};

export type Lesson = {
  id: string;
  title: string;
  durationSec: number;
  position: number;
};

export type Module = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

export type CourseDetail = CourseSummary & {
  modules: Module[];
};

export const academyCategories: {
  value: Exclude<CourseCategory, "diploma">;
  label: string;
  short: string;
}[] = [
  { value: "11-12", label: "11th & 12th Psychology", short: "11–12" },
  { value: "cuet-ug", label: "CUET-UG Psychology Prep", short: "CUET-UG" },
  { value: "cuet-pg", label: "CUET-PG Master Bundle", short: "CUET-PG" },
  { value: "net-jrf", label: "NET-JRF Examination Prep", short: "NET-JRF" },
];

export const categoryLabel: Record<CourseCategory, string> = {
  "11-12": "11th & 12th",
  "cuet-ug": "CUET-UG",
  "cuet-pg": "CUET-PG",
  "net-jrf": "NET-JRF",
  diploma: "Diploma",
};

/** Server-friendly fetch — pass through cookies if running from a route handler */
export async function fetchCourses(opts: {
  type: CourseType;
  category?: CourseCategory;
}): Promise<CourseSummary[]> {
  const qs = new URLSearchParams({ type: opts.type });
  if (opts.category) qs.set("category", opts.category);
  const data = await api<{ ok: true; courses: CourseSummary[] }>(
    `/api/courses?${qs.toString()}`,
    { cache: "no-store" }
  );
  return data.courses;
}

export async function fetchCourse(slug: string): Promise<CourseDetail | null> {
  try {
    const data = await api<{ ok: true; course: CourseDetail }>(
      `/api/courses/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    return data.course;
  } catch {
    return null;
  }
}

/** Full URL for a course cover image, or null when none is set. */
export function courseCoverUrl(
  c: Pick<CourseSummary, "coverImagePath">
): string | null {
  if (!c.coverImagePath) return null;
  return c.coverImagePath.startsWith("http")
    ? c.coverImagePath
    : `${API_BASE_URL}${c.coverImagePath}`;
}

export function formatInr(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatDuration(sec: number): string {
  if (!sec || sec < 60) return `${sec}s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}
