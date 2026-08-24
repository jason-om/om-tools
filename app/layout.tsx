import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./shell";

export const metadata: Metadata = {
  title: "OM One — Your work, pulled into focus",
  description: "An IC-first work secretary for Grow With OM.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
