import { useCallback } from "react";
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { generateId } from "../../db/index";
import { applyElkLayout } from "./useElkLayout";
import { useAuthStore } from "../../stores/authStore";
import { useAIChatStore } from "../../stores/aiChatStore";
import { getSetting } from "../../db/index";
import { supabase } from "../../db/supabase";
import { AI_SYSTEM_PROMPT } from "../constants";

interface UseAIDiagramArgs {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  pushHistory: (n: Node[], e: Edge[]) => void;
  rfInstance: ReactFlowInstance | null;
  theme: any;
  edgeType: "default" | "step";
  defaultNodeData: any;
}

export function useAIDiagram({
  nodes, edges, setNodes, setEdges, pushHistory, rfInstance, theme, edgeType, defaultNodeData
}: UseAIDiagramArgs) {
  const addMessage = useAIChatStore((s) => s.addMessage);
  const setIsGenerating = useAIChatStore((s) => s.setIsGenerating);
  const isGenerating = useAIChatStore((s) => s.isGenerating);

  const handleUpdateDiagram = useCallback(async (
    aiNodes: any[],
    aiEdges: any[],
    textMessage?: string,
    options?: { mode?: "replace" | "merge"; template?: any }
  ) => {
    const mode = options?.mode ?? "replace";
    const activeNodes = nodes.filter((n) => n.selected);

    if (activeNodes.length === 1 && options?.template) {
      const targetNode = activeNodes[0];
      const pos = targetNode.position;
      const tpl = options.template;

      const deletedNodeIds = new Set<string>();
      const queue = [targetNode.id];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (!deletedNodeIds.has(currentId)) {
          deletedNodeIds.add(currentId);
          edges.forEach((e) => {
            if (e.source === currentId && !deletedNodeIds.has(e.target)) queue.push(e.target);
          });
        }
      }

      const idMap: Record<string, string> = {};
      const tplNodes = tpl.nodes.map((n: any) => {
        const newId = generateId();
        idMap[n.id] = newId;
        return {
          id: newId, type: "custom", position: { x: 0, y: 0 }, width: 160, height: 80,
          data: { ...defaultNodeData, label: n.label, shape: n.shape || "rect", bgColor: n.bgColor || theme.nodeBg, borderColor: n.bgColor ? `${n.bgColor}99` : theme.nodeBorder, textColor: theme.nodeText },
        };
      });

      const tplEdges = tpl.edges.map((e: any) => ({ id: generateId(), source: idMap[e.source] || e.source, target: idMap[e.target] || e.target, label: e.label }));
      const laidNodes = await applyElkLayout(tplNodes as Node[], tplEdges as Edge[], "TB");

      const rootNode = laidNodes.find((tn: any) => !tplEdges.some((te: any) => te.target === tn.id)) || laidNodes[0];
      const dx = pos.x - (rootNode?.position?.x || 0);
      const dy = pos.y - (rootNode?.position?.y || 0);

      const positionedNodes = laidNodes.map((tn: any) => ({ ...tn, position: { x: tn.position.x + dx, y: tn.position.y + dy } }));
      const keepEdges = edges.filter((e) => !deletedNodeIds.has(e.source) && !deletedNodeIds.has(e.target));
      const incomingEdges = edges.filter((e) => e.target === targetNode.id && !deletedNodeIds.has(e.source));
      const reconnectedEdges = incomingEdges.map((e) => ({ ...e, target: rootNode.id }));

      const newEdges = [...keepEdges, ...reconnectedEdges, ...tplEdges.map((e: any) => ({
        ...e, style: { stroke: theme.accent, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent }, type: edgeType, reconnectable: true,
      }))].map((e) => ({ ...e, reconnectable: true }));

      const newNodes = [...nodes.filter((n) => !deletedNodeIds.has(n.id)), ...positionedNodes];

      pushHistory(nodes, edges);
      setNodes(newNodes as Node[]);
      setEdges(newEdges as Edge[]);
      return;
    }



    pushHistory(nodes, edges);

    let updatedNodes: Node[] = [];
    if (mode === "merge") {
      const existingKeep = nodes.filter((n) => !aiNodes.some((an) => an.id === n.id));
      const newOrUpdated = aiNodes.map((aiNode, idx) => {
        const existingNode = nodes.find((n) => n.id === aiNode.id);
        const position = existingNode ? existingNode.position : (aiNode.position || { x: 150 + (idx % 4) * 220, y: 100 + Math.floor(idx / 4) * 150 });
        const width = typeof existingNode?.width === "number" ? existingNode.width : 160;
        const height = typeof existingNode?.height === "number" ? existingNode.height : 80;
        return { id: aiNode.id, type: "custom", position, width, height, data: { ...defaultNodeData, ...(existingNode ? existingNode.data : {}), label: aiNode.label, shape: aiNode.shape || "rect", bgColor: aiNode.bgColor || theme.nodeBg, borderColor: aiNode.bgColor ? `${aiNode.bgColor}99` : theme.nodeBorder, textColor: theme.nodeText } as unknown as Record<string, unknown> };
      });
      updatedNodes = [...existingKeep, ...newOrUpdated];
    } else {
      updatedNodes = aiNodes.map((aiNode, idx) => {
        const existingNode = nodes.find((n) => n.id === aiNode.id);
        const position = existingNode ? existingNode.position : (aiNode.position || { x: 150 + (idx % 4) * 220, y: 100 + Math.floor(idx / 4) * 150 });
        const width = typeof existingNode?.width === "number" ? existingNode.width : 160;
        const height = typeof existingNode?.height === "number" ? existingNode.height : 80;
        return { id: aiNode.id, type: "custom", position, width, height, data: { ...defaultNodeData, ...(existingNode ? existingNode.data : {}), label: aiNode.label, shape: aiNode.shape || "rect", bgColor: aiNode.bgColor || theme.nodeBg, borderColor: aiNode.bgColor ? `${aiNode.bgColor}99` : theme.nodeBorder, textColor: theme.nodeText } as unknown as Record<string, unknown> };
      });
    }

    let updatedEdges: Edge[] = [];
    if (mode === "merge") {
      const existingKeep = edges.filter((e) => !aiEdges.some((ae) => ae.id === e.id));
      const newOrUpdated = aiEdges.map((aiEdge) => {
        const existingEdge = edges.find((e) => e.id === aiEdge.id);
        return { id: aiEdge.id, source: aiEdge.source, target: aiEdge.target, label: aiEdge.label, style: { stroke: theme.accent, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent }, type: edgeType, reconnectable: true, ...(existingEdge || {}) };
      });
      updatedEdges = [...existingKeep, ...newOrUpdated].map((e) => ({ ...e, reconnectable: true }));
    } else {
      updatedEdges = aiEdges.map((aiEdge) => {
        const existingEdge = edges.find((e) => e.id === aiEdge.id);
        return { id: aiEdge.id, source: aiEdge.source, target: aiEdge.target, label: aiEdge.label, style: { stroke: theme.accent, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent }, type: edgeType, reconnectable: true, ...(existingEdge || {}) };
      }).map((e) => ({ ...e, reconnectable: true }));
    }

    setNodes(updatedNodes as Node[]);
    setEdges(updatedEdges as Edge[]);

    if (textMessage) addMessage({ role: "assistant", content: textMessage });

    if (nodes.length <= 1 && updatedNodes.length >= 2) {
      setTimeout(async () => {
        const laid = await applyElkLayout(updatedNodes as Node[], updatedEdges as Edge[], "TB");
        setNodes(laid);
        setTimeout(() => rfInstance?.fitView({ padding: 0.1 }), 100);
      }, 60);
    }
  }, [nodes, edges, rfInstance, theme, edgeType, defaultNodeData, addMessage, pushHistory, setNodes, setEdges]);

  const handleAskAI = useCallback(async (promptText: string, nodeId: string | null) => {
    const user = useAuthStore.getState().user;
    setIsGenerating(true);
    addMessage({ role: "user", content: nodeId ? `[Node Edit] ${promptText}` : promptText });
    try {
      const isPro = user?.subscriptionStatus === "active";
      let url = "/api/ai/generate";
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      let body: Record<string, unknown> = {};

      const diagramContext = {
        nodes: nodes.map((n) => ({ id: n.id, label: n.data.label || "", shape: n.data.shape || "rect", bgColor: n.data.bgColor || "" })),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label || "" })),
      };
 if (isPro) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not authenticated");
        headers["Authorization"] = `Bearer ${token}`;
        body = {
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            { 
              role: "user", 
              content: `Current diagram state:\n${JSON.stringify(diagramContext, null, 2)}\n\nUser request: ${promptText}${nodeId ? ` (Target Node: ID "${nodeId}")` : ""}` 
            }
          ]
        };
      } else {
        const savedKey = await getSetting<string>("api-key");
        const savedProvider = await getSetting<string>("ai-provider") || "openrouter";
        const savedModel = await getSetting<string>("ai-model") || "openai/gpt-4o-mini";
        
        if (savedProvider === "openrouter") {
          url = "/api/ai/generate";
          headers["Authorization"] = `Bearer ${savedKey}`;
          body = {
            model: savedModel,
            messages: [
              { role: "system", content: AI_SYSTEM_PROMPT },
              { role: "user", content: `Current diagram state:\n${JSON.stringify(diagramContext, null, 2)}\n\nUser request: ${promptText}${nodeId ? ` (Target Node: ID "${nodeId}")` : ""}` }
            ]
          };
        } else {
          throw new Error("Direct guest provider chat is not supported on this canvas popover.");
        }
      }

      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `API error ${res.status}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || "";

      let textMsg = "Diagram updated successfully!";
      let parsedDiagram = null;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) textMsg = parsed.message;
          if (parsed.diagram) parsedDiagram = parsed.diagram;
          else if (parsed.nodes) parsedDiagram = parsed;
        } else {
          textMsg = content;
        }
      } catch {
        textMsg = content || "Error parsing AI response.";
      }

      if (parsedDiagram) {
        handleUpdateDiagram(parsedDiagram.nodes || [], parsedDiagram.edges || [], textMsg);
      } else {
        addMessage({ role: "assistant", content: textMsg });
      }

      if (isPro) {
        useAuthStore.getState().refreshProfile();
      }
    } catch (err: any) {
      console.error(err);
      addMessage({ role: "assistant", content: `Error: ${err.message || "Failed to generate response."}` });
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, handleUpdateDiagram, addMessage, setIsGenerating]);

  return { handleUpdateDiagram, handleAskAI, isGenerating };
}