import { api, API_BASE_URL } from "./api";

export type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  description: string | null;
  amazonUrl: string | null;
  format: string | null;
  coverImagePath: string | null;
  position: number;
};

export type AdminBook = Book & {
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export function bookCoverUrl(b: Pick<Book, "coverImagePath">): string | null {
  if (!b.coverImagePath) return null;
  return b.coverImagePath.startsWith("http")
    ? b.coverImagePath
    : `${API_BASE_URL}${b.coverImagePath}`;
}

/* ---------------- Public ---------------- */

export async function fetchBooks(): Promise<Book[]> {
  const d = await api<{ ok: true; books: Book[] }>("/api/books", {
    cache: "no-store",
  });
  return d.books;
}

/* ---------------- Admin ---------------- */

export async function fetchAdminBooks(): Promise<AdminBook[]> {
  const d = await api<{ ok: true; books: AdminBook[] }>("/api/admin/books", {
    cache: "no-store",
  });
  return d.books;
}

export async function createBook(form: FormData): Promise<AdminBook> {
  const d = await api<{ ok: true; book: AdminBook }>("/api/admin/books", {
    method: "POST",
    body: form,
  });
  return d.book;
}

export async function updateBook(
  id: string,
  form: FormData
): Promise<AdminBook> {
  const d = await api<{ ok: true; book: AdminBook }>(
    `/api/admin/books/${encodeURIComponent(id)}`,
    { method: "PATCH", body: form }
  );
  return d.book;
}

export async function deleteBook(id: string): Promise<void> {
  await api(`/api/admin/books/${encodeURIComponent(id)}`, { method: "DELETE" });
}
