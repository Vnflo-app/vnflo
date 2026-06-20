import React from "react";
import { CustomNode } from "./nodes/CustomNode";
import { FrameNode } from "./nodes/FrameNode";
import { EditableEdge } from "./components/EditableEdge";

export const NODE_TYPES = {
  custom: CustomNode,
  frame: FrameNode,
} as const;

export const EDGE_TYPES = {
  default: (props: any) => React.createElement(EditableEdge, { ...props, pathType: "bezier" }),
  step: (props: any) => React.createElement(EditableEdge, { ...props, pathType: "step" }),
};

export const AI_SYSTEM_PROMPT = `You are a conversational diagram assistant. You generate or modify diagrams based on user instructions.
The diagram is represented as a JSON object:
{
  "nodes": [
    { "id": "1", "label": "Label", "shape": "rect", "bgColor": "#080808" }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "2", "label": "optional" }
  ]
}
Available shapes: rect, rounded, circle, diamond, hexagon, parallelogram, triangle, cylinder, cloud, process, decision.
Colors should be valid hex values (e.g. "#080808").

If the user provides an existing diagram, you MUST modify it per their instructions (add nodes, delete nodes, connect nodes, change text/color/shape) and return the complete, updated diagram JSON.

You MUST respond with a JSON object in this EXACT format:
{
  "message": "A helpful text explanation of the changes you made or what you created",
  "diagram": {
    "nodes": [...],
    "edges": [...]
  }
}
`;
