import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cyneth.com.ar";

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description:
    "Catálogo de grifería, sanitarios, duchas, caños y conexiones. Filtros por categoría, marca y color. Productos premium para obras y proyectos. Consultá por WhatsApp.",
  openGraph: {
    title: "Catálogo | Cyneth Sanitarios",
    description:
      "Explorá nuestra colección de grifería, sanitarios, duchas y accesorios. Consultá precios por WhatsApp.",
    url: `${siteUrl}/catalogo`,
  },
  alternates: { canonical: `${siteUrl}/catalogo` },
};

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
