import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use Cases | Dynamic Diagramming & Workflow Visualizer",
  description: "See how software engineers, HR managers, educators, and product teams use Visual Node Flow to build org charts, family trees, database UML diagrams, and network architectures.",
  keywords: [
    "online family tree builder",
    "interactive org charts",
    "team database visualizer",
    "network architecture design tool",
    "workflow visualizer",
    "vnflo use cases"
  ],
};

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
