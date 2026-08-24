import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME, FACE_ZONE_HEIGHT, SAFE } from "./theme";
import { Particles } from "./Particles";
import { FaceZone } from "./FaceZone";

/**
 * Shared layout for all scenes:
 * - Dark background with particles
 * - Face zone placeholder at top
 * - Content area below face zone
 */
export const SceneLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <Particles />
      <FaceZone />
      <AbsoluteFill
        style={{
          top: FACE_ZONE_HEIGHT,
          paddingLeft: SAFE.side,
          paddingRight: SAFE.side,
          paddingBottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
