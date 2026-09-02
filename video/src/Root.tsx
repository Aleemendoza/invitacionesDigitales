import {Composition, Folder} from 'remotion';
import {PapeletaVideo} from './PapeletaVideo';
import {HookScene} from './scenes/HookScene';
import {ProductScene} from './scenes/ProductScene';
import {ChoiceScene} from './scenes/ChoiceScene';
import {CreationScene} from './scenes/CreationScene';
import {ExperienceScene} from './scenes/ExperienceScene';
import {PublishScene} from './scenes/PublishScene';
import {ClosingScene} from './scenes/ClosingScene';

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Papeleta-escenas">
      <Composition id="Hook" component={HookScene} durationInFrames={90} fps={30} width={1080} height={1920} />
      <Composition id="Product" component={ProductScene} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="Choice" component={ChoiceScene} durationInFrames={90} fps={30} width={1080} height={1920} />
      <Composition id="Creation" component={CreationScene} durationInFrames={90} fps={30} width={1080} height={1920} />
      <Composition id="Experience" component={ExperienceScene} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="Publish" component={PublishScene} durationInFrames={90} fps={30} width={1080} height={1920} />
      <Composition id="Closing" component={ClosingScene} durationInFrames={180} fps={30} width={1080} height={1920} />
    </Folder>
    <Composition
      id="PapeletaLaunch"
      component={PapeletaVideo}
      durationInFrames={720}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
