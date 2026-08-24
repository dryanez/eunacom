import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

type Particle = {
  x: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
  color: string;
};

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#22c55e"];

const particles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
  x: (i * 83 + 17) % 100,
  size: 3 + (i % 6) * 1.5,
  speed: 0.2 + (i % 5) * 0.12,
  opacity: 0.04 + (i % 4) * 0.025,
  delay: (i * 23) % 80,
  color: COLORS[i % COLORS.length],
}));

export const Particles: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map((p, i) => {
        const y = 1920 - ((frame + p.delay) * p.speed * 2) % 2200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              opacity: p.opacity,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
