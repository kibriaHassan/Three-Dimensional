import type { Metadata } from "next";
import { Noto_Serif_Bengali, Nunito_Sans } from "next/font/google";
import { LocaleProvider } from "@/components/locale";
import "./globals.css";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const notoBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto-bn",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "3dsciencezone — এসএসসি ও HSC পদার্থবিজ্ঞান",
  description:
    "3dsciencezone-এ এসএসসি ও HSC পদার্থবিজ্ঞানের সিমুলেশন। তরঙ্গ, আলো, ভেক্টর ও প্রমাণ নিজে চালিয়ে দেখো।",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${nunito.variable} ${notoBengali.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
