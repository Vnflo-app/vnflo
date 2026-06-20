import { useCallback, useEffect, useRef, useState } from "react";
import { useReactFlow, useNodes, useEdges, MarkerType } from "@xyflow/react";
import { Sparkles, Send, X } from "lucide-react";
import { useEditorTheme } from "../context/EditorThemeContext";
import { useAuthStore } from "../../stores/authStore";
import { getSetting } from "../../db/index";
import { supabase } from "../../db/supabase";
import { AI_SYSTEM_PROMPT } from "../constants";

interface ScopedAIChatPanelProps {
  frameId: string;
  onClose: () => void;
}

export function ScopedAIChatPanel({ frameId, onClose }: ScopedAIChatPanelProps) {
  const { theme } = useEditorTheme();
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const { setNodes, setEdges } = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();

  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeFrame = nodes.find((n) => n.id === frameId);
  const frameType = activeFrame?.data?.frameType || "flowchart";

  const isPro = user?.subscriptionStatus === "active";
  const creditsExhausted = isPro && user?.aiCredits !== undefined && user.aiCredits <= 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    if (!isPro) {
      const savedKey = await getSetting<string>("api-key");
      if (!savedKey) {
        alert("Pro subscription or an API Key is required to chat with the AI.");
        return;
      }
    }
    if (creditsExhausted) {
      alert("You have exhausted your AI credits. Upgrade or buy more.");
      return;
    }

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Math.random().toString(), role: "user", content: userMsg }]);
    setIsGenerating(true);

    try {
      let url = "/api/ai/generate";
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      let body: Record<string, unknown> = {};

      const frameNodes = nodes.filter((n) => n.parentId === frameId);
      const frameEdges = edges.filter((e) => frameNodes.some((fn) => fn.id === e.source || fn.id === e.target));

      const diagramContext = {
        nodes: frameNodes.map((n) => ({
          id: n.id,
          label: n.data.label || "",
          shape: n.data.shape || "rect",
          bgColor: n.data.bgColor || "",
        })),
        edges: frameEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || "",
        })),
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
              content: `Scope: You are modifying a diagram inside the frame "${activeFrame?.data?.label}".\n\nCurrent frame state:\n${JSON.stringify(diagramContext, null, 2)}\n\nUser request: ${userMsg}`,
            },
          ],
        };
      } else {
        const savedKey = await getSetting<string>("api-key");
        const savedModel = (await getSetting<string>("ai-model")) || "openai/gpt-4o-mini";
        headers["Authorization"] = `Bearer ${savedKey}`;
        body = {
          model: savedModel,
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            { role: "user", content: `Scope: You are modifying a diagram inside the frame "${activeFrame?.data?.label}".\n\nCurrent frame state:\n${JSON.stringify(diagramContext, null, 2)}\n\nUser request: ${userMsg}` },
          ],
        };
      }

      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || "";

      let textMsg = "Frame diagram updated successfully!";
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
        textMsg = content;
      }

      const defaultNodeDataVal = {
        shape: "rect" as const,
        bgColor: theme.nodeBg,
        borderColor: theme.nodeBorder,
        textColor: theme.nodeText,
        borderWidth: 2,
        borderStyle: "solid" as const,
        fontSize: 13,
        width: 160,
        height: 80,
      };

      if (parsedDiagram) {
        setNodes((ns) => {
          const otherNodes = ns.filter((n) => n.parentId !== frameId && n.id !== frameId);
          const currentFrameNode = ns.find((fn) => fn.id === frameId);
          const newNodes = (parsedDiagram.nodes || []).map((n: any, idx: number) => ({
            id: n.id,
            type: "custom",
            parentId: frameId,
            position: n.position || { x: 40 + (idx % 3) * 150, y: 80 + Math.floor(idx / 3) * 110 },
            width: n.width || 160,
            height: n.height || 80,
            data: {
              ...defaultNodeDataVal,
              label: n.label || n.id,
              shape: n.shape || "rect",
              bgColor: n.bgColor || "#080808",
              borderColor: n.bgColor || "#080808",
            },
          }));
          return [...otherNodes, ...(currentFrameNode ? [currentFrameNode] : []), ...newNodes];
        });

        setEdges((es) => {
          const otherEdges = es.filter((e) => !frameNodes.some((fn) => fn.id === e.source || fn.id === e.target));
          const newEdges = (parsedDiagram.edges || []).map((e: any) => ({
            id: e.id || `e-${e.source}-${e.target}-${Math.random().toString(36).substr(2, 4)}`,
            source: e.source,
            target: e.target,
            label: e.label,
            style: { stroke: theme.accent, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent },
            type: "default",
          }));
          return [...otherEdges, ...newEdges];
        });

        setMessages((prev) => [...prev, { id: Math.random().toString(), role: "assistant", content: textMsg }]);
      } else {
        setMessages((prev) => [...prev, { id: Math.random().toString(), role: "assistant", content: textMsg }]);
      }

      if (isPro) refreshProfile();
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { id: Math.random().toString(), role: "assistant", content: `Error: ${err.message || "Request failed."}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">
      <div className="p-4 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-pulse" style={{ color: theme.accent }} />
          <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
            Frame AI Assistant
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5" style={{ color: theme.textMuted }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6" style={{ color: theme.textMuted }}>
            <Sparkles className="w-8 h-8 mb-3 opacity-30" style={{ color: theme.accent }} />
            <p className="text-xs">Describe changes or type what you want to build inside the active frame.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <span className="text-[9px] mb-0.5 px-1" style={{ color: theme.textMuted }}>
                {isUser ? "You" : "Frame AI"}
              </span>
              <div
                className={`px-3 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                  isUser ? "text-primary-foreground rounded-tr-none shadow-md" : "rounded-tl-none border"
                }`}
                style={{
                  background: isUser ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` : theme.surfaceHover,
                  borderColor: isUser ? "transparent" : theme.border,
                  color: isUser ? "var(--primary-foreground)" : theme.textPrimary,
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {isGenerating && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl border max-w-[50%] self-start" style={{ background: theme.surfaceHover, borderColor: theme.border }}>
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: "0ms", backgroundColor: theme.accent }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: "150ms", backgroundColor: theme.accent }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: "300ms", backgroundColor: theme.accent }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t flex gap-2 flex-shrink-0" style={{ borderColor: theme.border }}>
        <input
          type="text"
          placeholder="Ask AI to design/edit inside frame..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isGenerating || creditsExhausted}
          className="flex-1 px-3 py-2 rounded-xl border outline-none text-xs"
          style={{ background: theme.surfaceHover, borderColor: theme.border, color: theme.textPrimary }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isGenerating || creditsExhausted}
          className="px-3 py-2 rounded-xl text-primary-foreground disabled:opacity-40 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}