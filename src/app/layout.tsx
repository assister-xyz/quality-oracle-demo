import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CustomCursor } from "@/components/custom-cursor";
import { GoogleTagManager } from "@next/third-parties/google";
import { PostHogProvider, ClarityScript, PageViewTracker } from "@/components/posthog-provider";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laureum — AI Agent Quality Verification",
  description: "Verify AI agents before you pay. Multi-judge consensus scoring across 6 dimensions with signed attestations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ClarityScript />
        {/* Google tag (gtag.js) — required for Google Ads conversion detection */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18066381680" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18066381680');`,
          }}
        />
      </head>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body
        className={`${syne.variable} ${inter.variable} ${geistMono.variable} font-body antialiased`}
      >
        <PostHogProvider />
        <PageViewTracker />
        <CustomCursor />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
