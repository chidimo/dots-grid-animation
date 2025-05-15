import {
  useState,
  useEffect,
  useRef,
  useCallback,
  createRef,
  type RefObject,
} from "react";
import styles from "./interactive-dot-grid.module.css";

type Dot = {
  id: number;
  originalX: number;
  originalY: number;
  x: number;
  y: number;
  color: string;
};

type DotRef = RefObject<HTMLDivElement | null>;

export const InteractiveDotGrid = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [dots, setDots] = useState<Dot[]>([]);

  const animationRef = useRef<number | undefined>(undefined);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const dotRefs = useRef<DotRef[]>([]);
  const spacing = 40;
  const maxRadius = 150;
  const pushFactor = 30;

  // Generate dots based on container dimensions
  const generateDots = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const cols = Math.floor(containerRect.width / spacing);
    const rows = Math.floor(containerRect.height / spacing);

    console.log({ cols, rows });

    const newDots: Dot[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const id = row * cols + col;
        newDots.push({
          id,
          originalX: 0,
          originalY: 0,
          x: col * spacing + spacing / 2,
          y: row * spacing + spacing / 2,
          color: "rgba(66, 130, 81, 0.5)",
        });
      }
    }

    setDots(newDots);
    if (dotRefs?.current) {
      dotRefs.current = Array(newDots.length)
        .fill(0)
        .map(() => createRef());
    }
  }, []);

  // Initialize and handle window resize
  useEffect(() => {
    generateDots();

    const handleResize = () => {
      generateDots();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [generateDots]);

  // Track mouse position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animation loop using requestAnimationFrame for smooth performance
  const updateDots = useCallback(() => {
    if (
      !containerRef.current ||
      dots.length === 0 ||
      dotRefs.current.length === 0
    )
      return;

    const { x: mouseX, y: mouseY } = mousePositionRef.current;

    for (const dotRef of dotRefs.current) {
      if (!dotRef.current) return;
      const dotEl = dotRef.current;
      const dotRect = dotEl.getBoundingClientRect();
      const dotCenterX = dotRect.left + dotRect.width / 2;
      const dotCenterY = dotRect.top + dotRect.height / 2;

      // Calculate distance
      const distX = mouseX - dotCenterX;
      const distY = mouseY - dotCenterY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < maxRadius) {
        // Calculate push strength (stronger when closer)
        const strength = (1 - distance / maxRadius) * pushFactor;

        // Check if distance is not zero to avoid division by zero
        if (distance > 0) {
          // Calculate movement direction (away from mouse)
          const moveX = (-distX / distance) * strength;
          const moveY = (-distY / distance) * strength;

          // Apply animation class
          dotEl.classList.add(styles.animateDot);

          // Store the target position as CSS variables
          dotEl.style.setProperty("--target-x", `${moveX}px`);
          dotEl.style.setProperty("--target-y", `${moveY}px`);

          // Change color based on distance
          const intensity = Math.min(1, (1 - distance / maxRadius) * 2);
          const r = Math.round(66 + intensity * 100);
          const g = Math.round(130 + intensity * 100);
          const b = Math.round(81 + intensity * 100);
          dotEl.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${
            0.5 + intensity * 0.5
          })`;
        }
      } else {
        // If dot was previously animated, remove the class
        dotEl.classList.remove(styles.animateDot);
        dotEl.style.backgroundColor = "rgba(66, 130, 81, 0.5)";
      }
    }

    animationRef.current = requestAnimationFrame(updateDots);
  }, [dots]);

  // Start and clean up animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateDots);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateDots]);

  console.log(dots);

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div
          ref={containerRef}
          className={styles.dotsContainer}
          style={{
            gridTemplateColumns: `repeat(auto-fill, ${spacing}px)`,
            gridTemplateRows: `repeat(auto-fill, ${spacing}px)`,
          }}
        >
          {dots.map((dot, index) => {
            return (
              <div
                key={dot.id}
                ref={dotRefs?.current?.[index]}
                className={styles.dot}
              />
            );
          })}
        </div>

        <div className={styles.centerStage}>Hello</div>
      </div>
    </div>
  );
};
