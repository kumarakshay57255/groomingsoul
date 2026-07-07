import { api, ApiError, API_BASE_URL } from "./api";
import type { CourseCategory, CourseType } from "./courses";

export type AdminCourseSummary = {
  id: string;
  slug: string;
  title: string;
  instructor: string | null;
  description: string | null;
  coverColor: string;
  category: CourseCategory;
  type: CourseType;
  priceInr: number;
  validityDays: number;
  estimatedHours: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminLesson = {
  id: string;
  title: string;
  description: string | null;
  durationSec: number;
  position: number;
  videoUrl: string | null;
  hasVideo: boolean;
};

export type AdminModule = {
  id: string;
  title: string;
  position: number;
  lessons: AdminLesson[];
};

export type AdminCourseDetail = AdminCourseSummary & {
  modules: AdminModule[];
};

export const ADMIN_CATEGORIES: { value: CourseCategory; label: string }[] = [
  { value: "11-12", label: "Class 11 & 12" },
  { value: "cuet-ug", label: "CUET-UG" },
  { value: "cuet-pg", label: "CUET-PG" },
  { value: "net-jrf", label: "NET-JRF" },
  { value: "diploma", label: "Diploma" },
];

/* ----------------- Courses ----------------- */

export async function fetchAdminCourses(opts: {
  type?: CourseType;
  category?: CourseCategory;
} = {}): Promise<AdminCourseSummary[]> {
  const qs = new URLSearchParams();
  if (opts.type) qs.set("type", opts.type);
  if (opts.category) qs.set("category", opts.category);
  const url = `/api/admin/courses${qs.toString() ? `?${qs}` : ""}`;
  const d = await api<{ ok: true; courses: AdminCourseSummary[] }>(url, {
    cache: "no-store",
  });
  return d.courses;
}

export async function fetchAdminCourse(id: string): Promise<AdminCourseDetail> {
  const d = await api<{ ok: true; course: AdminCourseDetail }>(
    `/api/admin/courses/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  return d.course;
}

export type CourseInput = {
  slug: string;
  title: string;
  instructor?: string | null;
  description?: string | null;
  coverColor?: string;
  category: CourseCategory;
  type: CourseType;
  priceInr: number;
  validityDays: number;
  estimatedHours?: number | null;
  isPublished?: boolean;
};

export async function createCourse(input: CourseInput): Promise<AdminCourseSummary> {
  const d = await api<{ ok: true; course: AdminCourseSummary }>(
    "/api/admin/courses",
    { method: "POST", body: input }
  );
  return d.course;
}

export async function updateCourse(
  id: string,
  input: CourseInput
): Promise<AdminCourseSummary> {
  const d = await api<{ ok: true; course: AdminCourseSummary }>(
    `/api/admin/courses/${encodeURIComponent(id)}`,
    { method: "PATCH", body: input }
  );
  return d.course;
}

export async function deleteCourse(
  id: string,
  force = false
): Promise<void> {
  const url = `/api/admin/courses/${encodeURIComponent(id)}${force ? "?force=1" : ""}`;
  await api(url, { method: "DELETE" });
}

/* ----------------- Modules ----------------- */

export async function createModule(
  courseId: string,
  title: string,
  position: number
): Promise<AdminModule> {
  const d = await api<{ ok: true; module: AdminModule }>(
    `/api/admin/courses/${encodeURIComponent(courseId)}/modules`,
    { method: "POST", body: { title, position } }
  );
  return d.module;
}

export async function updateModule(
  moduleId: string,
  patch: { title?: string; position?: number }
): Promise<AdminModule> {
  const d = await api<{ ok: true; module: AdminModule }>(
    `/api/admin/modules/${encodeURIComponent(moduleId)}`,
    { method: "PATCH", body: patch }
  );
  return d.module;
}

export async function deleteModule(moduleId: string): Promise<void> {
  await api(`/api/admin/modules/${encodeURIComponent(moduleId)}`, {
    method: "DELETE",
  });
}

/* ----------------- Lessons ----------------- */

/**
 * Uploads a lesson via XHR so we can report real upload progress (fetch
 * doesn't expose upload progress in browsers yet).
 */
export function uploadLesson(opts: {
  moduleId: string;
  title: string;
  description?: string;
  durationSec?: number;
  position?: number;
  videoFile?: File | null;
  onProgress?: (pct: number) => void;
}): Promise<AdminLesson> {
  const {
    moduleId,
    title,
    description = "",
    durationSec = 0,
    position = 0,
    videoFile,
    onProgress,
  } = opts;

  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("durationSec", String(durationSec));
    fd.set("position", String(position));
    if (videoFile) fd.set("video", videoFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/admin/modules/${moduleId}/lessons`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as
          | { ok: true; lesson: AdminLesson }
          | { ok: false; error: string };
        if (xhr.status >= 200 && xhr.status < 300 && "lesson" in data) {
          resolve(data.lesson);
        } else {
          reject(
            new ApiError(
              ("error" in data && data.error) || `Upload failed (${xhr.status})`,
              xhr.status
            )
          );
        }
      } catch {
        reject(new ApiError("Upload failed (invalid response)", xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError("Network error", 0));
    xhr.send(fd);
  });
}

export function updateLessonWithVideo(opts: {
  lessonId: string;
  title: string;
  description?: string;
  durationSec?: number;
  position?: number;
  videoFile?: File | null;
  removeVideo?: boolean;
  onProgress?: (pct: number) => void;
}): Promise<AdminLesson> {
  const {
    lessonId,
    title,
    description = "",
    durationSec = 0,
    position = 0,
    videoFile,
    removeVideo,
    onProgress,
  } = opts;

  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("durationSec", String(durationSec));
    fd.set("position", String(position));
    if (videoFile) fd.set("video", videoFile);
    if (removeVideo) fd.set("removeVideo", "1");

    const xhr = new XMLHttpRequest();
    xhr.open("PATCH", `${API_BASE_URL}/api/admin/lessons/${lessonId}`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress && videoFile) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as
          | { ok: true; lesson: AdminLesson }
          | { ok: false; error: string };
        if (xhr.status >= 200 && xhr.status < 300 && "lesson" in data) {
          resolve(data.lesson);
        } else {
          reject(
            new ApiError(
              ("error" in data && data.error) || `Update failed (${xhr.status})`,
              xhr.status
            )
          );
        }
      } catch {
        reject(new ApiError("Update failed (invalid response)", xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError("Network error", 0));
    xhr.send(fd);
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await api(`/api/admin/lessons/${encodeURIComponent(lessonId)}`, {
    method: "DELETE",
  });
}

export function formatInr(rupees: number | null | undefined): string {
  if (rupees == null) return "—";
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatDuration(sec: number): string {
  if (!sec || sec < 60) return `${sec || 0}s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}
