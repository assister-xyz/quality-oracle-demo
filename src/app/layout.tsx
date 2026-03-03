import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quality Oracle — AI Agent Evaluation Platform",
  description: "Pre-payment quality verification for AI agents, MCP servers, and skills. Multi-judge consensus scoring with 6-axis evaluation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
      >
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
