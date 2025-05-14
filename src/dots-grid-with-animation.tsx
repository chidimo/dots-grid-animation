import type React from "react";
import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  baseRadius: number;
};

const mouseOut = -9999;

export const DotsGridWithAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: mouseOut, y: mouseOut });
  const spacing = 40;
  const dotRadius = 4;
  const animationFrameId = useRef<number | undefined>(undefined);
  const dots = useRef<Dot[]>([]);
  const mouseStopTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      generateDots();
    };

    const generateDots = () => {
      const cols = Math.floor(canvas.width / spacing);
      const rows = Math.floor(canvas.height / spacing);

      dots.current = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          dots.current.push({
            x: x * spacing + spacing / 2,
            y: y * spacing + spacing / 2,
            offsetX: 0,
            offsetY: 0,
            baseRadius: dotRadius,
          });
        }
      }
    };

    const handleMouseLeave = () => {
      if (mouseStopTimeout.current) {
        clearTimeout(mouseStopTimeout.current);
      }
      mouse.current.x = mouseOut;
      mouse.current.y = mouseOut;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = container.getBoundingClientRect();

      if (
        e.clientX >= bounds.left &&
        e.clientX <= bounds.right &&
        e.clientY >= bounds.top &&
        e.clientY <= bounds.bottom
      ) {
        mouse.current.x = e.clientX - bounds.left;
        mouse.current.y = e.clientY - bounds.top;

        // Clear any existing timeout and set a new one to detect mouse stop
        if (mouseStopTimeout.current) {
          clearTimeout(mouseStopTimeout.current);
        }
        mouseStopTimeout.current = setTimeout(() => {
          mouse.current.x = mouseOut;
          mouse.current.y = mouseOut;
        }, 100);
      } else {
        mouse.current.x = mouseOut;
        mouse.current.y = mouseOut;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const maxRepel = 25;
      const repelRadius = 150;

      for (const dot of dots.current) {
        const dx = dot.x + dot.offsetX - mouse.current.x;
        const dy = dot.y + dot.offsetY - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (
          mouse.current.x !== mouseOut &&
          mouse.current.y !== mouseOut &&
          dist < repelRadius
        ) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / repelRadius) * maxRepel;

          dot.offsetX += Math.cos(angle) * force;
          dot.offsetY += Math.sin(angle) * force;
        }

        const damping = 0.85;
        dot.offsetX *= damping;
        dot.offsetY *= damping;

        const threshold = 0.1;
        if (Math.abs(dot.offsetX) < threshold) dot.offsetX = 0;
        if (Math.abs(dot.offsetY) < threshold) dot.offsetY = 0;

        const proximity = Math.max(0, 1 - dist / repelRadius);
        const radius = dot.baseRadius + proximity * 2;

        ctx.beginPath();
        ctx.arc(
          dot.x + dot.offsetX,
          dot.y + dot.offsetY,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(100, 200, 255, ${0.2 + 0.6 * proximity})`; // soft blue glow
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (mouseStopTimeout.current) {
        clearTimeout(mouseStopTimeout.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flexGrow: 1,
        width: "100%",
        height: "100%",
        background: "#001f2f", // dark blue background
        position: "relative",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: "200px",
          width: "200px",
          background: "#001f2f",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "currentcolor",
        }}
      >
        <p>hello</p>
      </div>
    </div>
  );
};
