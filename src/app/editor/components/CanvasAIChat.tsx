import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Trash } from "lucide-react";
import { useEditorTheme } from "../context/EditorThemeContext";
import { useAuthStore } from "../../stores/authStore";
import { useAIChatStore, type ChatMessage } from "../../stores/aiChatStore";
import { supabase } from "../../db/supabase";
import { type Node, type Edge } from "@xyflow/react";

interface CanvasAIChatProps {
  currentNodes: Node[];
  currentEdges: Edge[];
  onUpdateDiagram: (nodes: any[], edges: any[], textMessage?: string) => void;
}

const AI_SYSTEM_PROMPT = `You are a conversational diagram assistant. You generate or modify diagrams based on user instructions.
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
Output ONLY the JSON object. Do not wrap it in markdown or code blocks.`;

export function CanvasAIChat({ currentNodes, currentEdges, onUpdateDiagram }: CanvasAIChatProps) {
  const { theme } = useEditorTheme();
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const { messages, isGenerating, addMessage, clearChat, setIsGenerating } = useAIChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [enableReasoning, setEnableReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPro = user?.subscriptionStatus === "active";
  const creditsExhausted = isPro && user?.aiCredits !== undefined && user.aiCredits <= 0;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    
    if (!isPro) {
      alert("Pro subscription is required to chat with the AI.");
      return;
    }
    
    if (creditsExhausted) {
      alert("You have exhausted your AI credits. Upgrade or buy more credits.");
      return;
    }

    const userMsg = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMsg });
    setIsGenerating(true);

    try {
      const url = "/api/ai/generate";
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      const diagramContext = {
        nodes: currentNodes.map(n => ({
          id: n.id,
          label: n.data.label || "",
          shape: n.data.shape || "rect",
          bgColor: n.data.bgColor || "",
        })),
        edges: currentEdges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || "",
        }))
      };

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");
      headers["Authorization"] = `Bearer ${token}`;

      const body = {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Current diagram state:\n${JSON.stringify(diagramContext, null, 2)}\n\nUser request: ${userMsg}` 
          }
        ],
        ...(enableReasoning && { reasoning: { enabled: true } })
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `API error ${res.status}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || "";
      const reasoningDetails = json.choices?.[0]?.message?.reasoning_details;

      let textMsg = "Diagram updated successfully!";
      let parsedDiagram = null;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) {
            textMsg = parsed.message;
          }
          if (parsed.diagram) {
            parsedDiagram = parsed.diagram;
          } else if (parsed.nodes) {
            parsedDiagram = parsed;
          }
        } else {
          textMsg = content;
        }
      } catch {
        textMsg = content || "Error parsing AI response.";
      }

      if (parsedDiagram) {
        onUpdateDiagram(parsedDiagram.nodes || [], parsedDiagram.edges || [], textMsg);
        addMessage({ 
          role: "assistant", 
          content: textMsg,
          reasoning_details: reasoningDetails
        });
      } else {
        addMessage({ 
          role: "assistant", 
          content: textMsg,
          reasoning_details: reasoningDetails
        });
      }

      refreshProfile();

    } catch (err: any) {
      console.error(err);
      addMessage({ role: "assistant", content: `Error: ${err.message || "Failed to generate response."}` });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute z-[900] bottom-[72px] right-4 md:bottom-5 md:right-[460px]">


      {/* Slide-out Chat Panel */}
      {isOpen && (
        <div
          className="absolute bottom-14 right-0 w-[320px] xs:w-[360px] max-w-[calc(100vw-32px)] h-[480px] rounded-2xl border flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200"
          style={{
            background: theme.panel,
            borderColor: theme.border,
            backdropFilter: "blur(20px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: theme.accent }} />
              <span className="font-semibold text-xs" style={{ color: theme.textPrimary }}>
                AI Copilot Chat
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isPro && user?.aiCredits !== undefined && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${theme.accent}1a`, color: theme.accent, borderColor: `${theme.accent}33` }}>
                  Credits: {user.aiCredits.toLocaleString()}
                </span>
              )}
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1 rounded hover:bg-white/5 transition-colors"
                style={{ color: theme.textMuted }}
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/5 transition-colors"
                style={{ color: theme.textMuted }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] mb-0.5 px-1" style={{ color: theme.textMuted }}>
                    {isUser ? "You" : "AI Copilot"}
                  </span>
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      isUser
                        ? "text-primary-foreground rounded-tr-none shadow-md"
                        : "rounded-tl-none border"
                    }`}
                    style={{
                      background: isUser
                        ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`
                        : theme.surfaceHover,
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
              <div className="flex items-center gap-2 p-2 rounded-xl border max-w-[50%] self-start" style={{ background: theme.surfaceHover, borderColor: theme.border }}>
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: "0ms", backgroundColor: theme.accent }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: "150ms", backgroundColor: theme.accent }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: "300ms", backgroundColor: theme.accent }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t flex gap-2"
            style={{ borderColor: theme.border }}
          >
            <input
              type="text"
              placeholder="Ask AI to add, delete, or modify nodes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isGenerating || creditsExhausted || !isPro}
              className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none focus:border-primary/50"
              style={{
                background: theme.surfaceHover,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            />
            <button
              type="button"
              onClick={() => setEnableReasoning(!enableReasoning)}
              className={`px-2 py-2 rounded-xl border text-xs transition-colors ${
                enableReasoning ? 'bg-accent/20 border-accent' : 'hover:bg-white/5'
              }`}
              style={{
                borderColor: enableReasoning ? theme.accent : theme.border,
                color: enableReasoning ? theme.accent : theme.textMuted,
              }}
              title="Enable reasoning mode for complex tasks"
            >
              🧠
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isGenerating || creditsExhausted || !isPro}
              className="px-3 py-2 rounded-xl text-primary-foreground disabled:opacity-40 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}