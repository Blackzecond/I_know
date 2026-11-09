import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I Know… You Don’t",
  description: "A hidden-rule card game for friends.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
