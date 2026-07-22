import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SITELUR — Sistem Informasi Tata Kelola Rapat RSUD",
  description: "Sistem Informasi Tata Kelola Rapat untuk RSUD",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#F5F8FF] text-[#1C2A3A] antialiased">
        {children}
      </body>
    </html>
  );
}
