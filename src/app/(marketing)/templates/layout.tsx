import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Flowchart Templates & Diagram Library",
  description: "Browse 50+ professionally designed templates to kickstart your work. Customize mind maps, ER diagrams, org charts, and flowcharts instantly.",
  keywords: [
    "custom logic flowchart template",
    "database relational schema diagram",
    "professional flowchart library",
    "diagram templates online",
    "vnflo templates"
  ],
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
