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
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </head>
      <body className="text-gray-500">{children}</body>
    </html>
  );
}
