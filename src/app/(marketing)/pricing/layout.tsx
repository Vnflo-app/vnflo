import type { Metadata } from "next";
import { JsonLd } from "../../components/JsonLd";

export const metadata: Metadata = {
  title: "Premium Pricing & Pro Subscription Plans",
  description: "Start free or subscribe to Pro. Unlock professional flowchart templates, real-time multiplayer, unlimited diagrams, and HD exports (SVG, PDF, Mermaid).",
  keywords: [
    "flowchart software pricing",
    "premium diagramming subscription",
    "visual node flow pro",
    "cheap org chart tool subscription",
    "export diagrams svg pdf",
    "vnflo pricing",
    "get work attention subscription"
  ],
};

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Visual Node Flow Pro Subscription",
  "description": "Unlock unlimited diagramming, real-time collaboration, and high-resolution exports (SVG, PDF, Mermaid) to get your work noticed.",
  "image": "https://www.vnflo.com/vnflo-og.png",
  "offers": [
    {
      "@type": "Offer",
      "name": "Pro Plan - Monthly",
      "price": "399",
      "priceCurrency": "INR",
      "category": "Subscription",
      "url": "https://www.vnflo.com/pricing",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Pro Plan - Annual",
      "price": "3828",
      "priceCurrency": "INR",
      "category": "Subscription",
      "url": "https://www.vnflo.com/pricing",
      "availability": "https://schema.org/InStock"
    }
  ]
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={pricingSchema} />
      {children}
    </>
  );
}
