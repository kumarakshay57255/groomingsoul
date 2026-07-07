import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Caveat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grooming Souls — Mental Health & Welfare Foundation",
  description:
    "A Section 8 NGO blending professional psychological care, mental welfare, and high-standard academic excellence. Therapy, free psychometric tests, and premier psychology exam prep — all under one safe roof.",
  keywords: [
    "mental health India",
    "therapy",
    "psychology courses",
    "CUET psychology",
    "NET JRF psychology",
    "Grooming Souls",
  ],
  openGraph: {
    title: "Grooming Souls — Mental Health & Welfare Foundation",
    description:
      "Transforming Minds, Nurturing Souls. A safe space for therapy, psychometric testing, and elite psychology education.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${caveat.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
