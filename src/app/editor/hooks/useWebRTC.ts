import { useCallback, useEffect, useRef, useState } from "react";

export type RTCStatus = "idle" | "creating" | "waiting" | "connecting" | "connected" | "error";

export interface RemoteCursor {
  peerId: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

interface CollabMessage {
  type: "nodes" | "edges" | "cursor" | "ping" | "sync-request" | "sync-full" | "name";
  payload: unknown;
}

export interface UseWebRTCReturn {
  status: RTCStatus;
  offerCode: string;
  answerCode: string;
  shareLink: string;
  remoteCursors: RemoteCursor[];
  peerName: string;
  createOffer: () => Promise<void>;
  applyAnswer: (code: string) => Promise<void>;
  applyOffer: (code: string) => Promise<void>;
  getAnswer: () => string;
  sendNodes: (nodes: unknown[], edges: unknown[]) => void;
  sendCursor: (x: number, y: number) => void;
  setName: (name: string) => void;
  disconnect: () => void;
  onRemoteUpdate: (cb: (nodes: unknown[], edges: unknown[]) => void) => void;
}

function encode(obj: unknown): string {
  return btoa(JSON.stringify(obj));
}

function decode<T>(code: string): T {
  return JSON.parse(atob(code.trim())) as T;
}

const CURSOR_COLORS = [
  "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#38bdf8",
  "#e879f9", "#fb923c", "#2dd4bf", "#818cf8", "#f472b6",
];

let peerCounter = 0;
function nextCursorColor(): string {
  const c = CURSOR_COLORS[peerCounter % CURSOR_COLORS.length];
  peerCounter++;
  return c;
}

export function useWebRTC(): UseWebRTCReturn {
  const [status, setStatus] = useState<RTCStatus>("idle");
  const [offerCode, setOfferCode] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [peerName, setPeerName_] = useState("Peer");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const remoteUpdateRef = useRef<((n: unknown[], e: unknown[]) => void) | null>(null);
  const localNameRef = useRef("Host");
  const peerIdRef = useRef(`peer-${Math.random().toString(36).slice(2, 8)}`);
  const colorRef = useRef(nextCursorColor());
  const cursorSendTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHostRef = useRef(false);

  const createPC = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    pcRef.current = pc;

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setStatus("connected");
      }
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        setStatus("idle");
        setRemoteCursors([]);
      }
    };

    return pc;
  };

  const waitForGathering = (pc: RTCPeerConnection): Promise<void> =>
    new Promise((resolve) => {
      if (pc.iceGatheringState === "complete") { resolve(); return; }
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") resolve();
      };
    });

  const setupDataChannel = (dc: RTCDataChannel) => {
    dcRef.current = dc;
    dc.onopen = () => {
      setStatus("connected");
      // Send name & request sync on connect
      dc.send(JSON.stringify({ type: "name", payload: localNameRef.current }));
      if (!isHostRef.current) {
        dc.send(JSON.stringify({ type: "sync-request", payload: null }));
      }
    };
    dc.onclose = () => {
      setStatus("idle");
      setRemoteCursors([]);
    };
    dc.onmessage = (ev) => {
      try {
        const msg: CollabMessage = JSON.parse(ev.data);
        if (msg.type === "nodes" || msg.type === "edges") {
          const { nodes, edges } = msg.payload as { nodes: unknown[]; edges: unknown[] };
          remoteUpdateRef.current?.(nodes, edges);
        }
        if (msg.type === "cursor") {
          const cursor = msg.payload as { peerId: string; x: number; y: number; name: string; color: string };
          setRemoteCursors((prev) => {
            const filtered = prev.filter((c) => c.peerId !== cursor.peerId);
            return [...filtered, { peerId: cursor.peerId, x: cursor.x, y: cursor.y, color: cursor.color, name: cursor.name }];
          });
        }
        if (msg.type === "name") {
          setPeerName_(msg.payload as string);
        }
        if (msg.type === "sync-request" && isHostRef.current) {
          // Host sends full sync on request
          dc.send(JSON.stringify({ type: "sync-full", payload: null }));
        }
      } catch { /* ignore malformed */ }
    };
  };

  // HOST: create offer
  const createOffer = useCallback(async () => {
    setStatus("creating");
    isHostRef.current = true;
    const pc = createPC();
    const dc = pc.createDataChannel("collab");
    setupDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitForGathering(pc);

    const code = encode(pc.localDescription);
    setOfferCode(code);
    setShareLink(`${window.location.origin}${window.location.pathname}?offer=${encodeURIComponent(code)}`);
    setStatus("waiting");
  }, []);

  // HOST: apply answer from guest
  const applyAnswer = useCallback(async (code: string) => {
    if (!pcRef.current) return;
    setStatus("connecting");
    const desc = decode<RTCSessionDescriptionInit>(code);
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(desc));
  }, []);

  // GUEST: apply offer, produce answer
  const applyOffer = useCallback(async (code: string) => {
    setStatus("connecting");
    isHostRef.current = false;
    const pc = createPC();

    pc.ondatachannel = (ev) => setupDataChannel(ev.channel);

    const desc = decode<RTCSessionDescriptionInit>(code);
    await pc.setRemoteDescription(new RTCSessionDescription(desc));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await waitForGathering(pc);

    setAnswerCode(encode(pc.localDescription));
  }, []);

  const getAnswer = useCallback(() => answerCode, [answerCode]);

  const sendNodes = useCallback((nodes: unknown[], edges: unknown[]) => {
    if (dcRef.current?.readyState !== "open") return;
    const msg: CollabMessage = { type: "nodes", payload: { nodes, edges } };
    dcRef.current.send(JSON.stringify(msg));
  }, []);

  const sendCursor = useCallback((x: number, y: number) => {
    if (dcRef.current?.readyState !== "open") return;
    const msg: CollabMessage = {
      type: "cursor",
      payload: { peerId: peerIdRef.current, x, y, name: localNameRef.current, color: colorRef.current },
    };
    dcRef.current.send(JSON.stringify(msg));
  }, []);

  const setName = useCallback((name: string) => {
    localNameRef.current = name;
    if (dcRef.current?.readyState === "open") {
      dcRef.current.send(JSON.stringify({ type: "name", payload: name }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (cursorSendTimer.current) clearInterval(cursorSendTimer.current);
    dcRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    setStatus("idle");
    setOfferCode("");
    setAnswerCode("");
    setShareLink("");
    setRemoteCursors([]);
    peerCounter = 0;
  }, []);

  const onRemoteUpdate = useCallback((cb: (n: unknown[], e: unknown[]) => void) => {
    remoteUpdateRef.current = cb;
  }, []);

  useEffect(() => () => { disconnect(); }, [disconnect]);

  // Auto-connect from URL offer param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const offerParam = params.get("offer");
    if (offerParam) {
      applyOffer(offerParam).catch(() => {});
    }
  }, [applyOffer]);

  return {
    status, offerCode, answerCode, shareLink, remoteCursors, peerName,
    createOffer, applyAnswer, applyOffer, getAnswer,
    sendNodes, sendCursor, setName,
    disconnect, onRemoteUpdate,
  };
}