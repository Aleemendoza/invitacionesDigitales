import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {staticFile} from 'remotion';
import {ChoiceScene} from './scenes/ChoiceScene';
import {ClosingScene} from './scenes/ClosingScene';
import {CreationScene} from './scenes/CreationScene';
import {ExperienceScene} from './scenes/ExperienceScene';
import {HookScene} from './scenes/HookScene';
import {ProductScene} from './scenes/ProductScene';
import {PublishScene} from './scenes/PublishScene';

export const PapeletaVideo: React.FC = () => (
  <>
    <Audio src={staticFile('audio/papeleta-original.wav')} volume={0.82} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90} name="01 — Hook"><HookScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: 10})} />
      <TransitionSeries.Sequence durationInFrames={120} name="02 — Producto"><ProductScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 10})} />
      <TransitionSeries.Sequence durationInFrames={90} name="03 — Elección"><ChoiceScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={linearTiming({durationInFrames: 10})} />
      <TransitionSeries.Sequence durationInFrames={90} name="04 — Creación"><CreationScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 10})} />
      <TransitionSeries.Sequence durationInFrames={120} name="05 — Experiencia"><ExperienceScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: 10})} />
      <TransitionSeries.Sequence durationInFrames={90} name="06 — Publicación"><PublishScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 10})} />
      <TransitionSeries.Sequence durationInFrames={180} name="07 — Cierre"><ClosingScene /></TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
