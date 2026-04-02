import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSROX — Botnet C2 Interface",
  description: "Command & Control Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-bg-dark scanlines crt-flicker">{children}</body>
    </html>
  );
}
