import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/editor",
        "/profile",
        "/auth",
        "/forgot-password",
        "/reset-password",
        "/api/",
      ],
    },
    sitemap: "https://www.vnflo.com/sitemap.xml",
  };
}
