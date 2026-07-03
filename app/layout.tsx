import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhD Supervisor Fit Analyzer",
  description:
    "Analyze supervisor fit based on research topics, methods, publications, and PhD application strategy."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
