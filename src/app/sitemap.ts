import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/libs/mongoConnect";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cyneth.com.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const client = await connectToDatabase();
    const db = client.db("cyneth");
    const products = await db
      .collection("products")
      .find({ active: true }, { projection: { _id: 1, updatedAt: 1 } })
      .toArray();

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/productos/${p._id.toString()}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...productUrls];
  } catch {
    return staticPages;
  }
}
