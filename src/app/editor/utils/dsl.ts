import type { Node, Edge } from "@xyflow/react";

// ── Flowchart DSL ──────────────────────────────────────────────────────────

export function generateFlowchartDSL(frameNodes: Node[], frameEdges: Edge[]): string {
  let dsl = `// Flowchart\n`;
  frameNodes.forEach((n) => {
    if (n.type === "frame") return;
    const label = n.data?.label || n.id;
    const shape = n.data?.shape || "rect";
    const color = n.data?.bgColor || "";
    dsl += `${n.id} [label="${label}"] [shape=${shape}]${
      color ? ` [color=${color}]` : ""
    }\n`;
  });
  frameEdges.forEach((e) => {
    const label = e.label ? ` [label="${e.label}"]` : "";
    const dashed = e.style?.strokeDasharray ? " [dashed]" : "";
    dsl += `${e.source} -> ${e.target}${label}${dashed}\n`;
  });
  return dsl;
}

export function parseFlowchartDSL(dslText: string, frameId: string) {
  const lines = dslText.split("\n");
  const newNodes: any[] = [];
  const newEdges: any[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;

    const edgeMatch = line.match(
      /^(\w+)\s*->\s*(\w+)(?:\s+\[label="([^"]*)"\])?(?:\s+\[(dashed)\])?$/
    );
    if (edgeMatch) {
      newEdges.push({
        id: `dsl-e-${edgeMatch[1]}-${edgeMatch[2]}-${Math.random()
          .toString(36)
          .substr(2, 4)}`,
        source: edgeMatch[1],
        target: edgeMatch[2],
        label: edgeMatch[3] || undefined,
        style: edgeMatch[4] === "dashed" ? { strokeDasharray: "5,5" } : undefined,
      });
      continue;
    }

    const nodeMatch = line.match(
      /^(\w+)(?:\s+\[label="([^"]*)"\])?(?:\s+\[shape=(\w+)\])?(?:\s+\[color=([^\]]+)\])?$/
    );
    if (nodeMatch) {
      newNodes.push({
        id: nodeMatch[1],
        type: "custom",
        parentId: frameId,
        position: { x: 50 + Math.random() * 200, y: 50 + Math.random() * 300 },
        width: 160,
        height: 80,
        data: {
          label: nodeMatch[2] || nodeMatch[1],
          shape: nodeMatch[3] || "rect",
          bgColor: nodeMatch[4] || "#080808",
          borderColor: nodeMatch[4] || "#080808",
          textColor: "#ffffff",
          borderWidth: 2,
          borderStyle: "solid",
          fontSize: 13,
        },
      });
    }
  }

  // Auto-create missing nodes referenced by edges
  newEdges.forEach((e) => {
    [e.source, e.target].forEach((id) => {
      if (!newNodes.some((n) => n.id === id)) {
        newNodes.push({
          id,
          type: "custom",
          parentId: frameId,
          position: { x: 50 + Math.random() * 200, y: 50 + Math.random() * 300 },
          width: 160,
          height: 80,
          data: {
            label: id,
            shape: "rect",
            bgColor: "#080808",
            borderColor: "#080808",
            textColor: "#ffffff",
            borderWidth: 2,
            borderStyle: "solid",
            fontSize: 13,
          },
        });
      }
    });
  });

  return { nodes: newNodes, edges: newEdges };
}

// ── ERD DSL ─────────────────────────────────────────────────────────────────

export function generateERD_DSL(frameNodes: Node[], frameEdges: Edge[]): string {
  let dsl = `// ER Diagram\n`;
  frameNodes.forEach((n) => {
    if (n.type === "frame") return;
    const label = (n.data?.label as string) || "";
    const parts = label.split("\n");
    const tableName = parts[0]?.trim() || n.id;
    dsl += `${tableName} {\n`;

    parts.slice(2).forEach((line: string) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      const isPK = cleanLine.includes("[PK]");
      const isFK = cleanLine.includes("[FK]");
      const cleanAttr = cleanLine.replace(/\[PK\]|\[FK\]/g, "").trim();
      const attrParts = cleanAttr.split(":");
      const attrName = attrParts[0]?.trim();
      const attrType = attrParts[1]?.trim() || "VARCHAR(255)";
      dsl += `  ${attrName} ${attrType}${isPK ? " pk" : ""}${isFK ? " fk" : ""}\n`;
    });
    dsl += `}\n\n`;
  });

  frameEdges.forEach((e) => {
    dsl += `${e.source} -> ${e.target} [label="${e.label || "1:N"}"]\n`;
  });
  return dsl;
}

export function parseERD_DSL(dslText: string, frameId: string) {
  const lines = dslText.split("\n");
  const newNodes: any[] = [];
  const newEdges: any[] = [];
  let currentTable: { name: string; attrs: string[] } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;

    const relMatch = line.match(
      /^(\w+)\s*->\s*(\w+)(?:\s+\[label="([^"]*)"\])?$/
    );
    if (relMatch) {
      newEdges.push({
        id: `erd-e-${relMatch[1]}-${relMatch[2]}-${Math.random()
          .toString(36)
          .substr(2, 4)}`,
        source: relMatch[1],
        target: relMatch[2],
        label: relMatch[3] || "1:N",
      });
      continue;
    }

    const tableStart = line.match(/^(\w+)\s*\{$/);
    if (tableStart) {
      currentTable = { name: tableStart[1], attrs: [] };
      continue;
    }

    if (line === "}" && currentTable) {
      const attrLines = currentTable.attrs;
      const label = `${currentTable.name}\n${"-".repeat(
        currentTable.name.length
      )}\n${attrLines.join("\n")}`;
      newNodes.push({
        id: currentTable.name,
        type: "custom",
        parentId: frameId,
        position: { x: 50 + Math.random() * 200, y: 50 + Math.random() * 300 },
        width: 180,
        height: 40 + attrLines.length * 20,
        data: {
          label,
          shape: "rect",
          bgColor: "#047857",
          borderColor: "#10b981",
          textColor: "#ffffff",
          borderWidth: 2,
          borderStyle: "solid",
          fontSize: 12,
        },
      });
      currentTable = null;
      continue;
    }

    if (currentTable) {
      const fieldParts = line.split(/\s+/);
      const fieldName = fieldParts[0];
      const fieldType = fieldParts[1] || "VARCHAR(255)";
      const isPK = fieldParts.slice(2).some((p) => p.toLowerCase() === "pk");
      const isFK = fieldParts.slice(2).some((p) => p.toLowerCase() === "fk");
      const key = isPK || isFK ? `[${isPK ? "PK " : ""}${isFK ? "FK" : ""}]` : "";
      currentTable.attrs.push(`${key}${fieldName}: ${fieldType}`);
    }
  }

  return { nodes: newNodes, edges: newEdges };
}