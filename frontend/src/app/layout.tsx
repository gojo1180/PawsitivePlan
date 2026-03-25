import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawsitivePlan",
  description: "Gamified productivity dashboard with virtual pets and AI quests.",
};

import ToasterProvider from "@/components/ui/ToasterProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
