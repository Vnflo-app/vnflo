import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Features | Drag-and-drop Flowchart & Org Chart Maker",
  description: "Explore professional diagramming features: smart auto-layouts, version history tracker, real-time multiplayer collaboration, role access controls, and vector quality SVG/PDF exports.",
  keywords: [
    "drag and drop builder",
    "smart diagram auto layout",
    "version history tracker",
    "real-time multiplayer collaboration",
    "role access controls",
    "flowchart maker features",
    "vnflo features"
  ],
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
