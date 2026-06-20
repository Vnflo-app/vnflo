import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Documentation & SDK Reference",
  description: "Learn how to embed interactive diagram iframes, access the API, and customize node styling dynamically inside your own applications.",
  keywords: [
    "vnflo API reference",
    "embed interactive diagram iframe",
    "flow charts developer SDK",
    "developer documentation diagramming",
    "vnflo docs"
  ],
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
