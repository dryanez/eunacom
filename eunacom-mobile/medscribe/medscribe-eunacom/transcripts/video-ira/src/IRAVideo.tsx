import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Clinica } from "./scenes/Scene2Clinica";
import { Scene3Diagnostico } from "./scenes/Scene3Diagnostico";
import { Scene4Tratamiento } from "./scenes/Scene4Tratamiento";
import { Scene5Virus } from "./scenes/Scene5Virus";
import { Scene6Eunacom } from "./scenes/Scene6Eunacom";

const T = 12; // transition duration in frames

// Scene durations (total with transitions = 1110 frames = 37s)
const S1 = 160;
const S2 = 185;
const S3 = 185;
const S4 = 185;
const S5 = 165;
const S6 = 230;

export const IRAVideo: React.FC = () => {
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
          <Scene2Clinica />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S3}>
          <Scene3Diagnostico />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S4}>
          <Scene4Tratamiento />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={S5}>
          <Scene5Virus />
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
