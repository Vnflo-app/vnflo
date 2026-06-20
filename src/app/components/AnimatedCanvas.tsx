import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  label: string;
  pulsePhase: number;
}

interface Edge {
  from: number;
  to: number;
}

const NODE_LABELS = ["CEO", "Alice", "Bob", "Team A", "Team B", "Project", "Node 7", "Node 8", "Child", "Parent", "Idea", "Plan"];

function hexToRgb(hex: string): string {
  const h = hex.replace(/^#/, "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function AnimatedCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark, theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const rgbAccent = hexToRgb(theme.accent);

    const nodes: Node[] = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 18 + Math.random() * 14,
      color: theme.accent,
      label: NODE_LABELS[i],
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const edges: Edge[] = [
      { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 },
      { from: 1, to: 4 }, { from: 2, to: 5 }, { from: 3, to: 6 },
      { from: 4, to: 7 }, { from: 5, to: 8 }, { from: 6, to: 9 },
      { from: 7, to: 10 }, { from: 8, to: 11 }, { from: 9, to: 10 },
    ];

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, W(), H());

      // Update nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < n.radius) {
          n.x = n.radius;
          n.vx = Math.abs(n.vx);
        } else if (n.x > W() - n.radius) {
          n.x = W() - n.radius;
          n.vx = -Math.abs(n.vx);
        }

        if (n.y < n.radius) {
          n.y = n.radius;
          n.vy = Math.abs(n.vy);
        } else if (n.y > H() - n.radius) {
          n.y = H() - n.radius;
          n.vy = -Math.abs(n.vy);
        }
      });

      // Draw edges with animated dash
      edges.forEach(({ from, to }) => {
        const a = nodes[from];
        const b = nodes[to];
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const alpha = Math.max(0, 1 - dist / 350) * 0.5;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 8]);
        ctx.lineDashOffset = -time * 20;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, `rgba(${rgbAccent}, ${alpha})`);
        grad.addColorStop(1, `rgba(${rgbAccent}, ${alpha * 0.5})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = Math.sin(time * 2 + n.pulsePhase) * 0.15 + 0.85;
        const opacityFactor = 0.7 + (i % 3) * 0.1;

        // Glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 2.5);
        glow.addColorStop(0, `rgba(${rgbAccent}, 0.25)`);
        glow.addColorStop(1, `rgba(${rgbAccent}, 0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 2.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * pulse, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(n.x - n.radius * 0.3, n.y - n.radius * 0.3, 0, n.x, n.y, n.radius);
        bodyGrad.addColorStop(0, `rgba(${rgbAccent}, ${0.93 * opacityFactor})`);
        bodyGrad.addColorStop(1, `rgba(${rgbAccent}, ${0.6 * opacityFactor})`);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Border
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgbAccent}, ${0.8 * opacityFactor})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = `${Math.round(n.radius * 0.55)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.label, n.x, n.y);
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [theme, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
      style={{ pointerEvents: "none" }}
    />
  );
}

