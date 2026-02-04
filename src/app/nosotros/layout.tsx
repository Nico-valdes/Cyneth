import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cyneth.com.ar";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conocé la historia de Cyneth. Desde 2021 ofrecemos soluciones integrales en grifería, sanitarios y caños para obras y proyectos. Compromiso, calidad y confianza en Buenos Aires.",
  openGraph: {
    title: "Nosotros | Cyneth Sanitarios",
    description:
      "Nuestra historia, valores y compromiso con la calidad en productos sanitarios.",
    url: `${siteUrl}/nosotros`,
  },
  alternates: { canonical: `${siteUrl}/nosotros` },
};

export default function NosotrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
