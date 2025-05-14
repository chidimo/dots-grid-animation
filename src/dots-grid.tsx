import { useRef, useEffect } from "react";

type Dot = {
  x: number;
  y: number;
  baseRadius: number;
};

export const DotsGrid = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const spacing = 40;
  const dotRadius = 2;
  const maxRadius = 6;
  const animationFrameId = useRef<number | undefined>(undefined);
  const dots = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const generateDots = () => {
      const cols = Math.floor(canvas.width / spacing);
      const rows = Math.floor(canvas.height / spacing);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          dots.current.push({
            x: x * spacing + spacing / 2,
            y: y * spacing + spacing / 2,
            baseRadius: dotRadius,
          });
        }
      }
    };

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
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
        const dx = dot.x - mouse.current.x;
        const dy = dot.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 150);
        const radius =
          dot.baseRadius + proximity * (maxRadius - dot.baseRadius);

        console.log({ dx, dy, dist, proximity, radius });

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * proximity})`;
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flexGrow: 1,
        width: "100%",
        height: "100%",
        background: "#0d0d0d",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
