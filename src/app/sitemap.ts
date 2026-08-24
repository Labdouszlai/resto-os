const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://restoos.com";

export default function sitemap() {
  const now = new Date();

  const staticPages = [
    { url: APP_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/sign-up`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  return staticPages.map((p) => ({
    url: p.url,
    lastModified: p.lastModified,
    changeFrequency: p.changeFrequency as
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never",
    priority: p.priority,
  }));
}
