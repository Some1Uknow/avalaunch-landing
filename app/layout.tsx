import type { Metadata } from "next";
import { Silkscreen, Sora, Space_Mono } from "next/font/google";
import "./globals.css";

const sans = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

const pixel = Silkscreen({
  subsets: ["latin"],
  variable: "--font-pixel",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AvaLaunch - Launch Avalanche L1s from a prompt",
  description:
    "AvaLaunch is an AI operator for Avalanche L1 builders. Describe the chain, preview the launch plan, approve execution, and manage RPC details, logs, and launch history.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "1254x1254" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} ${pixel.variable}`}>
        {children}
      </body>
    </html>
  );
}
