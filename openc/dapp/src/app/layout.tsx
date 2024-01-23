import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenC",
  description: "Your NFT Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-gray-500">{children}</body>
    </html>
  );
}
