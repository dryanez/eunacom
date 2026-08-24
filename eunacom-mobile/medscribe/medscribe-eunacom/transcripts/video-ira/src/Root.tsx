import { Composition } from "remotion";
import { IRAVideo } from "./IRAVideo";

// Total: 160+185+185+185+165+230 - 5*12 = 1110 - 60 = 1050 content frames
// With transitions: 1110 frames = 37s
export const RemotionRoot = () => {
  return (
    <Composition
      id="IRAVideo"
      component={IRAVideo}
      durationInFrames={1110}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
