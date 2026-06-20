import { useState } from "react";
import { motion } from "motion/react";
import { X, Copy, Check, Wifi, WifiOff, Users, Link, Share2, User } from "lucide-react";
import { type UseWebRTCReturn, type RTCStatus } from "../hooks/useWebRTC";
import { useEditorTheme } from "../context/EditorThemeContext";

interface WebRTCModalProps {
  rtc: UseWebRTCReturn;
  onClose: () => void;
}

const STATUS_LABELS: Record<RTCStatus, string> = {
  idle: "Not connected",
  creating: "Creating offer...",
  waiting: "Waiting for peer...",
  connecting: "Connecting...",
  connected: "Connected",
  error: "Connection failed",
};

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
      style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
    >
      {copied ? <Check className="w-3 h-3" style={{ color: "#34d399" }} /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

export function WebRTCModal({ rtc, onClose }: WebRTCModalProps) {
  const { theme } = useEditorTheme();
  const [role, setRole] = useState<"host" | "guest" | null>(null);
  const [pasteCode, setPasteCode] = useState("");
  const [localName, setLocalName] = useState("");

  const { status, offerCode, answerCode, shareLink, createOffer, applyAnswer, applyOffer, disconnect, setName } = rtc;
  const isConnected = status === "connected";

  const inputStyle = {
    background: theme.surfaceHover,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
  };
  const labelStyle = { color: theme.textMuted };
  const monoInputCls = "w-full px-3 py-2 rounded-xl text-xs font-mono resize-none focus:outline-none";

  const handleNameChange = () => {
    if (localName.trim()) setName(localName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-6 w-[480px] max-h-[80vh] overflow-y-auto"
        style={{ background: theme.panel, border: `1px solid ${theme.border}`, backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full" style={{ background: isConnected ? "#34d399" : theme.textMuted }} />
            <h3 className="font-semibold" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: theme.textPrimary }}>
              P2P Collaboration
            </h3>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: theme.textMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-5 px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{ border: `1px solid ${theme.border}`, background: theme.surfaceHover }}
        >
          {isConnected
            ? <Wifi className="w-4 h-4" style={{ color: "#34d399" }} />
            : <WifiOff className="w-4 h-4" style={{ color: theme.textMuted }} />}
          <span className="text-sm" style={{ color: isConnected ? "#34d399" : theme.textMuted }}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="text-xs mb-2 block" style={labelStyle}>Your display name</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: theme.textMuted }} />
              <input
                type="text"
                placeholder="Enter your name..."
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={(e) => { if (e.key === "Enter") handleNameChange(); }}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <button
              onClick={handleNameChange}
              disabled={!localName.trim()}
              className="px-3 py-2 rounded-xl text-xs disabled:opacity-40"
              style={{ background: theme.accent + "33", border: `1px solid ${theme.accent}55`, color: theme.textPrimary }}
            >
              Set
            </button>
          </div>
        </div>

        {isConnected ? (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl" style={{ background: theme.surfaceHover, border: `1px solid ${theme.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" style={{ color: "#34d399" }} />
                <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>Connected</span>
              </div>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Changes sync automatically. Cursors are shared live.
              </p>
            </div>
            <button
              onClick={disconnect}
              className="w-full py-2.5 rounded-xl text-sm transition-colors"
              style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: theme.textMuted }}>
              Direct browser-to-browser P2P — no server in between. Share a link or exchange a code.
            </p>

            {!role ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("host")}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl transition-all"
                  style={{ border: `1px solid ${theme.border}`, background: theme.surfaceHover }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent + "66"; e.currentTarget.style.background = theme.accent + "14"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.surfaceHover; }}
                >
                  <Share2 className="w-6 h-6" style={{ color: theme.accent }} />
                  <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>Host</span>
                  <span className="text-xs text-center" style={{ color: theme.textMuted }}>Create a shareable link</span>
                </button>
                <button
                  onClick={() => setRole("guest")}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl transition-all"
                  style={{ border: `1px solid ${theme.border}`, background: theme.surfaceHover }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent + "66"; e.currentTarget.style.background = theme.accent + "14"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.surfaceHover; }}
                >
                  <Link className="w-6 h-6" style={{ color: theme.accent }} />
                  <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>Guest</span>
                  <span className="text-xs text-center" style={{ color: theme.textMuted }}>Join with host's code</span>
                </button>
              </div>
            ) : role === "host" ? (
              <div className="flex flex-col gap-4">
                {!offerCode ? (
                  <button
                    onClick={createOffer}
                    disabled={status === "creating"}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-primary-foreground text-sm disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg,${theme.accent},${theme.accent}99)`, fontWeight: 600 }}
                  >
                    {status === "creating" ? "Generating..." : "Generate Share Link"}
                  </button>
                ) : (
                  <>
                    {shareLink && (
                      <div>
                        <label className="text-xs mb-2 block" style={labelStyle}>
                          <Link className="w-3 h-3 inline mr-1" />
                          Share this link with your peer:
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 px-3 py-2 rounded-xl text-xs truncate" style={inputStyle}>
                            {shareLink.slice(0, 60)}...
                          </div>
                          <CopyButton text={shareLink} label="Copy Link" />
                        </div>
                      </div>
                    )}

                    <details className="group">
                      <summary className="text-xs cursor-pointer" style={{ color: theme.textMuted }}>
                        Or use manual code exchange
                      </summary>
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-xs mb-2 block" style={labelStyle}>Offer code:</label>
                          <div className="flex gap-2">
                            <div className="flex-1 px-3 py-2 rounded-xl text-xs font-mono truncate" style={inputStyle}>
                              {offerCode.slice(0, 40)}...
                            </div>
                            <CopyButton text={offerCode} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs mb-2 block" style={labelStyle}>Paste answer code:</label>
                          <textarea
                            rows={3}
                            placeholder="Paste answer code here..."
                            value={pasteCode}
                            onChange={(e) => setPasteCode(e.target.value)}
                            className={monoInputCls}
                            style={{ ...inputStyle, lineHeight: 1.4 }}
                          />
                          <button
                            onClick={() => applyAnswer(pasteCode)}
                            disabled={!pasteCode.trim() || status === "connecting"}
                            className="w-full mt-2 py-2.5 rounded-xl text-sm disabled:opacity-40"
                            style={{ background: theme.accent + "33", border: `1px solid ${theme.accent}55`, color: theme.textPrimary }}
                          >
                            Apply Answer & Connect
                          </button>
                        </div>
                      </div>
                    </details>
                  </>
                )}
                <button onClick={() => setRole(null)} className="text-xs transition-colors text-center" style={{ color: theme.textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
                >← Back</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs mb-2 block" style={labelStyle}>Paste host's offer code:</label>
                  <textarea
                    rows={3}
                    placeholder="Paste offer code from host..."
                    value={pasteCode}
                    onChange={(e) => setPasteCode(e.target.value)}
                    className={monoInputCls}
                    style={{ ...inputStyle, lineHeight: 1.4 }}
                  />
                  <button
                    onClick={() => applyOffer(pasteCode)}
                    disabled={!pasteCode.trim() || status === "connecting"}
                    className="w-full mt-2 py-2.5 rounded-xl text-sm disabled:opacity-40"
                    style={{ background: theme.accent + "33", border: `1px solid ${theme.accent}55`, color: theme.textPrimary }}
                  >
                    {status === "connecting" ? "Connecting..." : "Join Session"}
                  </button>
                </div>

                {answerCode && (
                  <div>
                    <label className="text-xs mb-2 block" style={labelStyle}>Share this answer with the host:</label>
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2 rounded-xl text-xs font-mono truncate" style={inputStyle}>
                        {answerCode.slice(0, 40)}...
                      </div>
                      <CopyButton text={answerCode} />
                    </div>
                  </div>
                )}

                <button onClick={() => setRole(null)} className="text-xs transition-colors text-center" style={{ color: theme.textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
                >← Back</button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}