import React from "react";
import { FACE_ZONE_HEIGHT, SAFE } from "./theme";

/**
 * Placeholder for the face overlay area.
 * Shows a subtle dashed circle where the face cam will be composited.
 */
export const FaceZone: React.FC<{ opacity?: number }> = ({
  opacity = 0.12,
}) => {
  const circleSize = 180;
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + 20,
        left: 0,
        right: 0,
        height: FACE_ZONE_HEIGHT - SAFE.top,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          border: `2px dashed rgba(255,255,255,${opacity})`,
        }}
      />
    </div>
  );
};
