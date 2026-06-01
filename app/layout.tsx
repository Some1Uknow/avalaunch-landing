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
  title: "AvaLaunch - Launch L1s instantly",
  description:
    "The launch control layer for Avalanche L1 teams. Plan the chain, validate the environment, monitor the moving parts, and ship a grant-ready launch story.",
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
