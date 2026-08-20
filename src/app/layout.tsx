import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "BioLearn — Belajar Biologi Interaktif",
  description:
    "Pembelajaran biologi interaktif untuk SMA & persiapan kuliah. Jelajahi, belajar, uji pemahamanmu! Interactive biology learning for high school & college prep.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "BioLearn — Belajar Biologi Interaktif",
    description: "Pembelajaran biologi interaktif untuk SMA & persiapan kuliah.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BioLearn — Belajar Biologi Interaktif",
    description: "Pembelajaran biologi interaktif untuk SMA & persiapan kuliah.",
  },
};

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
