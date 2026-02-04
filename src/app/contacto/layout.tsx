import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cyneth.com.ar";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contactá a Cyneth Sanitarios. Asesoramiento en grifería, sanitarios y caños. Respuesta en 24 horas. Buenos Aires, Argentina.",
  openGraph: {
    title: "Contacto | Cyneth Sanitarios",
    description:
      "Escribinos o llamanos para tu próximo proyecto. Estamos para asesorarte.",
    url: `${siteUrl}/contacto`,
  },
  alternates: { canonical: `${siteUrl}/contacto` },
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
