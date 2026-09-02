import {Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FiveBarChart} from '../components/FiveBarChart';
import {PhoneMockup} from '../components/PhoneMockup';
import {Eyebrow, Headline, SceneBackground} from '../components/Shared';
import {colors, sans} from '../theme';

export const CreationScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneBackground>
      <div style={{position: 'absolute', inset: '110px 80px'}}>
        <Eyebrow>Simple de crear</Eyebrow>
        <div style={{marginTop: 24}}><Headline size={112}>Cargá los datos.</Headline></div>
        <Interactive.Div
          name="Proceso real de creación"
          style={{
            position: 'absolute',
            top: 390,
            left: -35,
            width: 990,
            height: 590,
            overflow: 'hidden',
            borderRadius: 54,
            background: colors.paper,
            boxShadow: '0 45px 120px rgba(49,9,21,0.18)',
            rotate: '-1.5deg',
            opacity: interpolate(frame, [4, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [4, 30], ['0px 60px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <Img src={staticFile('assets/creation-plan.png')} style={{width: 1270, height: 598, objectFit: 'cover', objectPosition: 'left top'}} />
        </Interactive.Div>
        <Interactive.Div
          name="Vista previa en vivo"
          style={{
            position: 'absolute',
            right: 45,
            top: 740,
            rotate: interpolate(frame, [16, 80], ['4deg', '0deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            opacity: interpolate(frame, [14, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [14, 36], ['80px 55px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <PhoneMockup name="Preview de la invitación" width={430} slides={[{image: 'assets/invitation-cover.png', from: 0, to: 90, panFrom: -10, panTo: -80}]} />
        </Interactive.Div>
        <div style={{position: 'absolute', left: 25, top: 1115}}><FiveBarChart /></div>
        <Interactive.Div
          name="Mensaje de facilidad"
          style={{
            position: 'absolute',
            left: 20,
            top: 1450,
            width: 500,
            color: colors.ink,
            fontFamily: sans,
            fontSize: 38,
            lineHeight: 1.18,
            fontWeight: 650,
            opacity: interpolate(frame, [38, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          Elegís. Completás.<br /><span style={{color: colors.burgundy, fontWeight: 850}}>Y ya se siente tuyo.</span>
        </Interactive.Div>
      </div>
    </SceneBackground>
  );
};
