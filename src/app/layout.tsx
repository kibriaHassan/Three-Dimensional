import type { Metadata } from "next";
import { Hind_Siliguri, Tiro_Bangla } from "next/font/google";
import "./globals.css";

const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
});

const tiro = Tiro_Bangla({
  subsets: ["bengali", "latin"],
  weight: "400",
  variable: "--font-tiro",
});

export const metadata: Metadata = {
  title: "ত্রিমাত্র — নবম-দশম পদার্থবিজ্ঞান",
  description:
    "নবম ও দশম শ্রেণির পদার্থবিজ্ঞানের বল, টর্ক, টান, কপিকলসহ প্রমাণগুলো ছোট ত্রিমাত্রিক দৃশ্যে।",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${hind.variable} ${tiro.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
