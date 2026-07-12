"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, ShoppingCart, ArrowRight } from "lucide-react";
import { bookCoverUrl, type Book } from "@/lib/books";

export function FeaturedBook({
  book,
  totalBooks,
}: {
  book: Book | null;
  totalBooks: number;
}) {
  if (!book) return null;
  const cover = bookCoverUrl(book);

  return (
    <section className="relative overflow-hidden bg-cream-deep/30 py-20 sm:py-24">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-6 top-8 hidden h-56 w-auto rotate-[10deg] opacity-20 lg:block"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-5 sm:px-8 lg:flex-row lg:gap-16">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="shrink-0"
        >
          {cover ? (
            <Image
              src={cover}
              alt={book.title}
              width={240}
              height={360}
              className="w-48 rounded-r-md rounded-l-sm shadow-[0_28px_50px_-18px_rgba(1,32,87,.55)] sm:w-56"
            />
          ) : (
            <div className="grid h-72 w-48 place-items-center rounded-md bg-navy text-cream/70 shadow-xl sm:w-56">
              <BookOpen size={40} strokeWidth={1.3} />
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-sage-deep">
              Published Work
            </span>
            <span className="h-px w-12 bg-gold/60" />
          </div>

          <h2 className="mt-4 font-display text-4xl leading-[1.05] text-balance text-ink sm:text-5xl">
            {book.title}
          </h2>
          {book.subtitle && (
            <p className="mt-2 font-display text-xl italic text-sage-deep">
              {book.subtitle}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-ink-soft lg:justify-start">
            {book.author && <span>by {book.author}</span>}
            {book.format && (
              <span className="rounded-full bg-sage-soft/60 px-3 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-sage-deep">
                {book.format}
              </span>
            )}
          </div>

          {book.description && (
            <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-ink-soft lg:mx-0">
              {book.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
            {book.amazonUrl && (
              <a
                href={book.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-soft hover:shadow-lg"
              >
                <ShoppingCart size={16} />
                Buy on Amazon
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            )}
            {totalBooks > 1 && (
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-deep hover:text-brand-brown"
              >
                See all books
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
