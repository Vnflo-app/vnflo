import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.vnflo.com";
  const routes = [
    "",
    "/features",
    "/use-cases",
    "/pricing",
    "/templates",
    "/docs",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-policy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : (route === "/pricing" || route === "/features" ? 0.8 : 0.5),
  }));
}
// ok