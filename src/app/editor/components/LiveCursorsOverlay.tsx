import { motion } from "motion/react";

export interface RemoteCursor {
  peerId: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

interface LiveCursorsOverlayProps {
  cursors: RemoteCursor[];
}

export function LiveCursorsOverlay({ cursors }: LiveCursorsOverlayProps) {
  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none" style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.peerId}
          className="absolute"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-2px, -2px)",
          }}
          animate={{ x: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Cursor arrow */}
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
            <path
              d="M2 2L14 20L11 11L18 8L2 2Z"
              fill={cursor.color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="1"
            />
          </svg>
          {/* Name label */}
          <div
            className="absolute rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap"
            style={{
              left: 14,
              top: 0,
              background: cursor.color,
              color: "#fff",
            }}
          >
            {cursor.name || "Peer"}
          </div>
        </motion.div>
      ))}
    </div>
  );
}