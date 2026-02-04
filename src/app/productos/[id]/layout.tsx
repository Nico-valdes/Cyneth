import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cyneth.com.ar";

export const metadata: Metadata = {
  title: "Producto",
  description:
    "Detalle de producto en Cyneth Sanitarios. Consultá disponibilidad y precios por WhatsApp.",
  openGraph: {
    url: `${siteUrl}/productos`,
  },
  robots: { index: true, follow: true },
};

export default function ProductoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
