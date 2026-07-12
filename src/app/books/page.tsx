import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, ShoppingCart } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { fetchBooks, bookCoverUrl } from "@/lib/books";

export const metadata: Metadata = {
  title: "Books & Publications — Grooming Souls",
  description:
    "Books written by the Grooming Souls founder — available to buy on Amazon.",
};

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await fetchBooks();

  return (
    <>
      <Nav />
      <main className="flex-1 bg-cream pt-24 sm:pt-28">
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex items-center gap-3">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-sage-deep">
              By the Founder
            </p>
            <span className="h-px w-12 bg-gold/60" />
          </div>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] text-balance text-ink sm:text-5xl">
            Books &amp; <span className="italic text-sage-deep">publications.</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink-soft">
            Writing from the Grooming Souls founder — reflections on the mind,
            healing and the emotions we carry. Available to buy on Amazon.
          </p>

          {books.length === 0 ? (
            <div className="mt-14 rounded-3xl border border-dashed border-line bg-cream px-6 py-16 text-center text-ink-soft">
              <BookOpen size={30} className="mx-auto text-sage-deep/50" />
              <p className="mt-3 text-sm">Books are on the way — check back soon.</p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((b) => {
                const cover = bookCoverUrl(b);
                return (
                  <article
                    key={b.id}
                    className="flex flex-col items-center rounded-2xl border border-line bg-cream p-7 text-center transition-all hover:-translate-y-1 hover:shadow-[0_22px_44px_-26px_rgba(1,32,87,.4)]"
                  >
                    {cover ? (
                      <Image
                        src={cover}
                        alt={b.title}
                        width={200}
                        height={300}
                        className="w-40 rounded-r-md rounded-l-sm shadow-[0_20px_36px_-16px_rgba(1,32,87,.5)]"
                      />
                    ) : (
                      <div className="grid h-56 w-40 place-items-center rounded-md bg-navy text-cream/70 shadow-lg">
                        <BookOpen size={34} strokeWidth={1.3} />
                      </div>
                    )}
                    <h2 className="mt-5 font-display text-xl text-ink">{b.title}</h2>
                    {b.subtitle && (
                      <p className="mt-1 text-sm italic text-sage-deep">
                        {b.subtitle}
                      </p>
                    )}
                    {b.author && (
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft">
                        {b.author}
                      </p>
                    )}
                    {b.description && (
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink-soft">
                        {b.description}
                      </p>
                    )}
                    {b.amazonUrl && (
                      <a
                        href={b.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold-soft"
                      >
                        <ShoppingCart size={15} /> Buy on Amazon
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
