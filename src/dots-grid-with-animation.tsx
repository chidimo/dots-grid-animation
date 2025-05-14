import type React from "react";
import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  baseRadius: number;
};

export const DotsGridWithAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const spacing = 32;
  const radius = 2;
  const animationFrameId = useRef<number | undefined>(undefined);
  const dots = useRef<Dot[]>([]);

  console.log(dots.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
            baseRadius: radius,
          });
        }
      }
    };

    const resizeCanvas = () => {
      if (!containerRef.current) return;
      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;
      generateDots();
    };

    const handleMouseMove = (e: MouseEvent) => {
        const bounds = containerRef.current?.getBoundingClientRect();
        if (!bounds) return;
        if (
          e.clientX >= bounds.left &&
          e.clientX <= bounds.right &&
          e.clientY >= bounds.top &&
          e.clientY <= bounds.bottom
        ) {
          mouse.current.x = e.clientX - bounds.left;
          mouse.current.y = e.clientY - bounds.top;
        } else {
          mouse.current.x = -9999;
          mouse.current.y = -9999;
        }
      };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const dot of dots.current) {
        const dx = dot.x + dot.offsetX - mouse.current.x;
        const dy = dot.y + dot.offsetY - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        console.log({ dx, dy, dist });

        const repelRadius = 120;
        const maxRepel = 25;

        if (dist < repelRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / repelRadius) * maxRepel;

          dot.offsetX += Math.cos(angle) * force;
          dot.offsetY += Math.sin(angle) * force;
        }

        // Ease back to origin
        dot.offsetX *= 0.9;
        dot.offsetY *= 0.9;

        const proximity = Math.max(0, 1 - dist / 150);
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
    containerRef.current?.addEventListener("resize", resizeCanvas);
    containerRef.current?.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (!animationFrameId.current) return;
      cancelAnimationFrame(animationFrameId.current);
      containerRef.current?.removeEventListener("resize", resizeCanvas);
      containerRef.current?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ display: "block", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "#001f2f", // dark blue background
        //   position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
    </div>
  );
};
