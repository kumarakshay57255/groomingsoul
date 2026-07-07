import Link from "next/link";
import { LogoMark } from "./Logo";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-coral-soft/55 blur-3xl animate-breathe" />
        <div
          className="absolute -bottom-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-sage-soft/55 blur-3xl animate-breathe"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute inset-0 bg-grain opacity-50" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 sm:px-8">
        <Link href="/" aria-label="Home" className="inline-flex w-fit">
          <LogoMark className="h-10 w-10" />
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-balance text-4xl text-brand-brown sm:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-pretty text-ink-soft">{subtitle}</p>
            )}
            <div className="mt-8 rounded-3xl border border-line bg-cream p-7 sm:p-8">
              {children}
            </div>
            {footer && (
              <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = rest.id ?? rest.name;
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </span>
      <input
        id={id}
        {...rest}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-soft/55 focus:border-clinical"
      />
    </label>
  );
}
