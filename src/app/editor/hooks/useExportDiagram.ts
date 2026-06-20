import { useCallback } from "react";
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react";
import type { CustomNodeData } from "../nodes/CustomNode";

interface UseExportDiagramArgs {
  rfInstance: ReactFlowInstance | null;
  diagramName: string;
  theme: any;
  nodes: Node[];
  edges: Edge[];
}

export function useExportDiagram({
  rfInstance,
  diagramName,
  theme,
  nodes,
  edges,
}: UseExportDiagramArgs) {
  const handleExport = useCallback(
    async (format: "png" | "jpg" | "pdf" | "mermaid" | "webm" | "mp4") => {
      if (format === "mermaid") {
        const lines = ["flowchart TD"];
        const idMap = new Map<string, string>();
        nodes.forEach((n, i) => {
          const safeId = `N${i}`;
          idMap.set(n.id, safeId);
          const data = n.data as unknown as CustomNodeData;
          const label = (data.label || "Node").replace(/"/g, "'");
          lines.push(`  ${safeId}["${label}"]`);
        });
        edges.forEach((e) => {
          const from = idMap.get(e.source);
          const to = idMap.get(e.target);
          if (!from || !to) return;
          const lbl = e.label ? ` |${String(e.label)}|` : "";
          const arrow = e.markerEnd ? "-->" : "---";
          lines.push(`  ${from}${lbl} ${arrow} ${to}`);
        });
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${diagramName}.mmd`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      if (format === "webm" || format === "mp4") {
        format = "png"; // Fallback
      }

      rfInstance?.fitView({ padding: 0.15, duration: 0 });
      await new Promise((r) => setTimeout(r, 300));

      const rfEl = document.querySelector(".react-flow") as HTMLElement | null;
      if (!rfEl) return;

      const filter = (el: HTMLElement) =>
        !el.classList?.contains("react-flow__minimap") &&
        !el.classList?.contains("react-flow__controls") &&
        !el.classList?.contains("react-flow__panel");

      rfEl.classList.add("react-flow--exporting");

      try {
        const { toPng, toJpeg } = await import("html-to-image");
        const baseOpts = { pixelRatio: 2, backgroundColor: theme.canvas, filter };

        const download = (dataUrl: string, filename: string) => {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = filename;
          a.click();
        };

        if (format === "png") {
          download(await toPng(rfEl, baseOpts), `${diagramName}.png`);
        } else if (format === "jpg") {
          download(await toJpeg(rfEl, { ...baseOpts, quality: 0.95 }), `${diagramName}.jpg`);
        } else if (format === "pdf") {
          const dataUrl = await toPng(rfEl, baseOpts);
          const img = new Image();
          img.src = dataUrl;
          await new Promise<void>((r) => { img.onload = () => r(); });
          const { jsPDF } = await import("jspdf");
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w, h] });
          pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
          pdf.save(`${diagramName}.pdf`);
        }
      } catch (e) {
        console.error("Export failed:", e);
      } finally {
        rfEl.classList.remove("react-flow--exporting");
      }
    },
    [rfInstance, diagramName, theme.canvas, nodes, edges]
  );

  const handleCopyAsPNG = useCallback(async () => {
    const rfEl = document.querySelector(".react-flow") as HTMLElement | null;
    if (!rfEl) return;
    rfEl.classList.add("react-flow--exporting");
    try {
      const { toPng } = await import("html-to-image");
      const filter = (el: HTMLElement) =>
        !el.classList?.contains("react-flow__minimap") &&
        !el.classList?.contains("react-flow__controls") &&
        !el.classList?.contains("react-flow__panel");
      const dataUrl = await toPng(rfEl, { pixelRatio: 2, backgroundColor: theme.canvas, filter });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      alert("PNG copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy PNG:", err);
    } finally {
      rfEl.classList.remove("react-flow--exporting");
    }
  }, [theme.canvas]);

  const handleCopyAsSVG = useCallback(async () => {
    const rfEl = document.querySelector(".react-flow") as HTMLElement | null;
    if (!rfEl) return;
    try {
      const { toSvg } = await import("html-to-image");
      const filter = (el: HTMLElement) =>
        !el.classList?.contains("react-flow__minimap") &&
        !el.classList?.contains("react-flow__controls") &&
        !el.classList?.contains("react-flow__panel");
      const dataUrl = await toSvg(rfEl, { backgroundColor: theme.canvas, filter });
      const svgText = decodeURIComponent(dataUrl.split(",")[1]);
      await navigator.clipboard.writeText(svgText);
      alert("SVG XML copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy SVG:", err);
    }
  }, [theme.canvas]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Diagram link copied to clipboard!");
  }, []);

  const handleCopyMarkdown = useCallback(async () => {
    const text = `![${diagramName}](${window.location.href})`;
    await navigator.clipboard.writeText(text);
    alert("Markdown copied to clipboard!");
  }, [diagramName]);

  const handleCopyHTML = useCallback(async () => {
    const text = `<iframe src="${window.location.href}" width="800" height="600" style="border:none;"></iframe>`;
    await navigator.clipboard.writeText(text);
    alert("HTML embed code copied to clipboard!");
  }, []);

  return {
    handleExport,
    handleCopyAsPNG,
    handleCopyAsSVG,
    handleCopyLink,
    handleCopyMarkdown,
    handleCopyHTML,
  };
}