import { api } from "./api";

export type ReviewStatus = "pending" | "in_review" | "completed";

export const REVIEW_STATUSES: ReviewStatus[] = [
  "pending",
  "in_review",
  "completed",
];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  in_review: "In review",
  completed: "Completed",
};

export type SubmissionIdentity = {
  name: string;
  email: string;
  phone: string;
};

export type SubmissionAnswer = {
  id: string;
  response: number | string | null;
};

export type AdminSubmissionSummary = {
  id: string;
  testSlug: string;
  testName: string;
  identity: SubmissionIdentity;
  reviewStatus: ReviewStatus;
  summary: string | null;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminSubmissionDetail = AdminSubmissionSummary & {
  answers: SubmissionAnswer[];
};

export async function fetchAdminSubmissions(opts: {
  testSlug?: string;
  status?: ReviewStatus;
  q?: string;
} = {}): Promise<AdminSubmissionSummary[]> {
  const qs = new URLSearchParams();
  if (opts.testSlug) qs.set("testSlug", opts.testSlug);
  if (opts.status) qs.set("status", opts.status);
  if (opts.q) qs.set("q", opts.q);
  const url = `/api/admin/test-submissions${qs.toString() ? `?${qs}` : ""}`;
  const d = await api<{ ok: true; submissions: AdminSubmissionSummary[] }>(
    url,
    { cache: "no-store" }
  );
  return d.submissions;
}

export async function fetchAdminSubmission(
  id: string
): Promise<AdminSubmissionDetail> {
  const d = await api<{ ok: true; submission: AdminSubmissionDetail }>(
    `/api/admin/test-submissions/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  return d.submission;
}

export async function updateSubmission(
  id: string,
  patch: { reviewStatus?: ReviewStatus; summary?: string | null }
): Promise<AdminSubmissionDetail> {
  const d = await api<{ ok: true; submission: AdminSubmissionDetail }>(
    `/api/admin/test-submissions/${encodeURIComponent(id)}`,
    { method: "PATCH", body: patch as Record<string, unknown> }
  );
  return d.submission;
}

export async function deleteSubmission(id: string): Promise<void> {
  await api(`/api/admin/test-submissions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
