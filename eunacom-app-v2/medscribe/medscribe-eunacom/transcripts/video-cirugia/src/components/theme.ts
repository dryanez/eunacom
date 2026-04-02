export const THEME = {
  bg: "#0a0a0a",
  text: "#ffffff",
  accent: "#6366f1",
  accentLight: "#818cf8",
  success: "#22c55e",
  warning: "#f97316",
  info: "#3b82f6",
  muted: "rgba(255,255,255,0.5)",
  mutedLight: "rgba(255,255,255,0.3)",
  cardBg: "rgba(99,102,241,0.08)",
  cardBorder: "rgba(99,102,241,0.25)",
  gradientAccent:
    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
  gradientSuccess:
    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
} as const;

// Face overlay will be at the top — content starts below this zone
export const FACE_ZONE_HEIGHT = 400;

export const SAFE = {
  top: 150,
  bottom: 170,
  side: 60,
} as const;
