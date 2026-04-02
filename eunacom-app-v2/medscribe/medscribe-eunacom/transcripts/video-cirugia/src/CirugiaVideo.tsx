import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2FiebreW } from "./scenes/Scene2FiebreW";
import { Scene3Timing } from "./scenes/Scene3Timing";
import { Scene4Complicaciones } from "./scenes/Scene4Complicaciones";
import { Scene5Comparacion } from "./scenes/Scene5Comparacion";
import { Scene6Eunacom } from "./scenes/Scene6Eunacom";

const T = 12; // transition duration in frames

// Scene durations
const S1 = 160;
const S2 = 200;
const S3 = 185;
const S4 = 200;
const S5 = 165;
const S6 = 260;

export const CirugiaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S1}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S2}>
          <Scene2FiebreW />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S3}>
          <Scene3Timing />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S4}>
          <Scene4Complicaciones />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S5}>
          <Scene5Comparacion />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S6}>
          <Scene6Eunacom />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
