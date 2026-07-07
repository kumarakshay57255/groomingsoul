import { api } from "./api";
import type { CourseCategory, CourseType } from "./courses";

export type PurchaseStatus =
  | "pending_verification"
  | "active"
  | "expired"
  | "rejected";

export type PurchaseSummary = {
  id: string;
  courseId: string;
  status: PurchaseStatus;
  isUnlocked: boolean;
  pricePaidInr: number;
  receiptImagePath: string | null;
  payerName: string | null;
  payerPhone: string | null;
  payerEmail: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  adminNote: string | null;
  createdAt: string;
  course: {
    id: string;
    slug: string;
    title: string;
    coverColor: string;
    category: CourseCategory;
    type: CourseType;
    validityDays: number;
    priceInr: number;
  } | null;
};

export type DashboardLesson = {
  id: string;
  title: string;
  durationSec: number;
  position: number;
  completedAt: string | null;
};

export type DashboardModule = {
  id: string;
  title: string;
  position: number;
  lessons: DashboardLesson[];
};

export type DashboardPurchase = {
  id: string;
  status: PurchaseStatus;
  isUnlocked: boolean;
  activatedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  adminNote: string | null;
  receiptImagePath: string | null;
  course: {
    id: string;
    slug: string;
    title: string;
    category: CourseCategory;
    type: CourseType;
    coverColor: string;
    instructor: string | null;
    description: string | null;
    validityDays: number;
    priceInr: number;
  };
  modules: DashboardModule[];
  progress: {
    totalLessons: number;
    completedLessons: number;
    percent: number;
  };
};

export async function fetchMyPurchases(): Promise<PurchaseSummary[]> {
  const data = await api<{ ok: true; purchases: PurchaseSummary[] }>(
    "/api/purchases/me",
    { cache: "no-store" }
  );
  return data.purchases;
}

export async function fetchPurchaseCurriculum(
  purchaseId: string
): Promise<DashboardPurchase> {
  const data = await api<{ ok: true; purchase: DashboardPurchase }>(
    `/api/dashboard/courses/${encodeURIComponent(purchaseId)}`,
    { cache: "no-store" }
  );
  return data.purchase;
}

export type LessonView = {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    durationSec: number;
    streamUrl: string;
    completedAt: string | null;
  };
  module: { id: string; title: string };
  course: {
    id: string;
    slug: string;
    title: string;
    type: CourseType;
    coverColor: string;
  };
  purchase: {
    id: string;
    expiresAt: string | null;
    daysRemaining: number | null;
  };
  navigation: {
    prevLessonId: string | null;
    nextLessonId: string | null;
    lessonIndex: number;
    lessonTotal: number;
  };
};

export async function fetchLesson(lessonId: string): Promise<LessonView> {
  const data = await api<{ ok: true } & LessonView>(
    `/api/dashboard/lessons/${encodeURIComponent(lessonId)}`,
    { cache: "no-store" }
  );
  // Strip the wrapper "ok" — keep just the view fields
  const { lesson, module, course, purchase, navigation } = data;
  return { lesson, module, course, purchase, navigation };
}

export type LessonCompletionResult = {
  progress: { completedLessons: number; totalLessons: number; percent: number };
  certificateQueued: boolean;
};

export async function markLessonComplete(
  lessonId: string
): Promise<LessonCompletionResult> {
  const data = await api<{ ok: true } & LessonCompletionResult>(
    `/api/dashboard/lessons/${encodeURIComponent(lessonId)}/complete`,
    { method: "POST" }
  );
  return { progress: data.progress, certificateQueued: data.certificateQueued };
}

export function purchaseStatusLabel(s: PurchaseStatus): string {
  switch (s) {
    case "pending_verification":
      return "Payment under review";
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "rejected":
      return "Receipt rejected";
  }
}
