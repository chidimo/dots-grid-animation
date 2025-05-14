import { useRef, useEffect } from "react";

type Dot = {
  x: number;
  y: number;
  baseRadius: number;
};

export const DotsGrid = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const spacing = 40;
  const dotRadius = 2;
  const maxRadius = 6;
  const dots: Dot[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const generateDots = () => {
      const cols = Math.floor(canvas.width / spacing);
      const rows = Math.floor(canvas.height / spacing);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          dots.push({
            x: x * spacing + spacing / 2,
            y: y * spacing + spacing / 2,
            baseRadius: dotRadius,
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
        mouse.current.x = 0;
        mouse.current.y = 0;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const dot of dots) {
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

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    containerRef.current?.addEventListener("resize", resizeCanvas);
    containerRef.current?.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      containerRef.current?.removeEventListener("resize", resizeCanvas);
      containerRef.current?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          background: "#0d0d0d",
          //   position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      />
    </div>
  );
};
