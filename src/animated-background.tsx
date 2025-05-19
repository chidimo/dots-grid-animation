import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  baseColor: string;
  activeColor: string;
  size: number;
  currentIntensity: number;
};

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 }); // Target position for smooth movement
  const dotsRef = useRef<Dot[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full window size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Initialize dots
    const initDots = () => {
      const dots: Dot[] = [];
      const spacing = 30;
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          dots.push({
            x: j * spacing,
            y: i * spacing,
            baseColor: "rgba(255, 255, 255, 0.08)", // Dark green with transparency
            activeColor: "rgba(255, 255, 255, 0.5)", // White with transparency
            size: 1,
            currentIntensity: 0,
          });
        }
      }

      dotsRef.current = dots;
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply spring effect to target mouse position
      const springFactor = 0.04; // Controls how quickly the target follows the mouse (0.08 = moderately slow)
      targetMouseRef.current.x +=
        (mouseRef.current.x - targetMouseRef.current.x) * springFactor;
      targetMouseRef.current.y +=
        (mouseRef.current.y - targetMouseRef.current.y) * springFactor;

      // Draw dots
      dotsRef.current.forEach((dot, index) => {
        const distance = Math.sqrt(
          (targetMouseRef.current.x - dot.x) ** 2 +
            (targetMouseRef.current.y - dot.y) ** 2
        );

        // Determine color based on distance from mouse
        const maxDistance = 200;
        const targetIntensity = Math.max(0, 1 - distance / maxDistance);

        // Smoothly transition the current intensity toward the target intensity
        const transitionSpeed = 0.06; // Controls how quickly dots light up and dim
        dotsRef.current[index].currentIntensity +=
          (targetIntensity - dotsRef.current[index].currentIntensity) *
          transitionSpeed;

        const intensity = dotsRef.current[index].currentIntensity;
        const dotSize = dot.size;

        // Create a color that fades between base and active
        if (intensity > 0) {
          // Parse the base and active colors to get their RGB values
          const baseRgb = [255, 255, 255, 0.08]; // Green
          const activeRgb = [255, 255, 255, 0.5]; // White

          // Interpolate between the colors
          const r = Math.round(
            baseRgb[0] + (activeRgb[0] - baseRgb[0]) * intensity
          );
          const g = Math.round(
            baseRgb[1] + (activeRgb[1] - baseRgb[1]) * intensity
          );
          const b = Math.round(
            baseRgb[2] + (activeRgb[2] - baseRgb[2]) * intensity
          );
          const a = baseRgb[3] + (activeRgb[3] - baseRgb[3]) * intensity;

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        } else {
          ctx.fillStyle = dot.baseColor;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(to bottom, #071c14 0%,rgb(7, 23, 17) 50%,rgb(4, 14, 9) 100%)",
        backgroundColor: " #071c14",
        zIndex: 0,
      }}
    />
  );
};
