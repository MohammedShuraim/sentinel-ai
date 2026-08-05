import type { Metadata, Viewport } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sentellent — AI-Powered Indian Stock Analyst",
    template: "%s · Sentellent",
  },
  description:
    "Sentellent is an AI-powered analyst for Indian stocks: personalized recommendations, portfolio insights, and source-backed answers for NSE companies.",
  applicationName: "Sentellent",
  openGraph: {
    type: "website",
    siteName: "Sentellent",
    title: "Sentellent — AI-Powered Indian Stock Analyst",
    description:
      "Personalized recommendations, portfolio insights, and source-backed AI answers for Indian stocks.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Sentellent — AI-Powered Indian Stock Analyst",
    description:
      "Personalized recommendations, portfolio insights, and source-backed AI answers for Indian stocks.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ToastProvider>
          <AuthProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
