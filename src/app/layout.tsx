import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cyneth Sanitarios",
  description: "CYNETH Sanitarios ofrece las mejores marcas del mercado en grifería, sanitarios, duchas y accesorios. Asesoramiento técnico especializado y precios competitivos desde 2021.",
  keywords: "sanitarios, grifería, duchas, baños, cocinas, obras, construcción, Argentina",
  openGraph: {
    title: "CYNETH Sanitarios - Productos Premium",
    description: "Productos sanitarios de calidad para obras y proyectos de cualquier escala",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
