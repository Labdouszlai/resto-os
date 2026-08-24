import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://restoos.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/orders/",
          "/pos/",
          "/menu/",
          "/customers/",
          "/suppliers/",
          "/ingredients/",
          "/employees/",
          "/reservations/",
          "/expenses/",
          "/reports/",
          "/settings/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
