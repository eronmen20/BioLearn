import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { createClient } from "@supabase/supabase-js";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f1a" },
  ],
};

const DEFAULT_META = {
  title: "BioLearn — Belajar Biologi Interaktif",
  description:
    "Pembelajaran biologi interaktif untuk SMA & persiapan kuliah. Jelajahi, belajar, uji pemahamanmu! Interactive biology learning for high school & college prep.",
  openGraph: {
    title: "BioLearn — Belajar Biologi Interaktif",
    description: "Pembelajaran biologi interaktif untuk SMA & persiapan kuliah.",
    type: "website" as const,
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "BioLearn — Belajar Biologi Interaktif",
    description: "Pembelajaran biologi interaktif untuk SMA & persiapan kuliah.",
  },
};

async function getHomepageSeo() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "homepage")
      .single();
    const v = (data?.value || {}) as {
      meta_title?: string;
      meta_description?: string;
    };
    const title = v.meta_title?.trim() || DEFAULT_META.title;
    const description = v.meta_description?.trim() || DEFAULT_META.description;
    return { ...DEFAULT_META, title, description, openGraph: { ...DEFAULT_META.openGraph, title, description }, twitter: { ...DEFAULT_META.twitter, title, description } };
  } catch {
    return DEFAULT_META;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getHomepageSeo();
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    icons: {
      icon: [
        { url: "/favicon.png?v=2", type: "image/png", sizes: "any" },
        { url: "/favicon.png", type: "image/png", sizes: "any" },
      ],
      apple: [{ url: "/favicon.png?v=2", type: "image/png" }],
    },
  };
}

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('biolearn-theme') || 'light';
      var r = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
      document.documentElement.setAttribute('data-theme', r);
    } catch(e) {}
  })()
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
