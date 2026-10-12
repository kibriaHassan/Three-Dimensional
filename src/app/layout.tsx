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
  title: "ত্রিমাত্র — এসএসসি ও ইন্টার পদার্থবিজ্ঞান",
  description:
    "নবম-দশমের প্রমাণ ত্রিমাত্র দৃশ্যে, আর ইন্টারের পদার্থবিজ্ঞান ১ম ও ২য় পত্রের প্রতিটি অধ্যায় ব্যাখ্যাসহ।",
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
