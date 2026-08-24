import { Composition } from "remotion";
import { CirugiaVideo } from "./CirugiaVideo";

// Total: 160+200+185+200+165+260 - 5*12 = 1170 - 60 = 1110 frames = 37s
export const RemotionRoot = () => {
  return (
    <Composition
      id="CirugiaVideo"
      component={CirugiaVideo}
      durationInFrames={1110}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
