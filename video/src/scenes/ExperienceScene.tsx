import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {PhoneMockup} from '../components/PhoneMockup';
import {ProgressPill, SceneBackground} from '../components/Shared';
import {colors, serif} from '../theme';

export const ExperienceScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneBackground dark>
      <div style={{position: 'absolute', inset: '95px 80px'}}>
        <Interactive.Div
          name="Frase principal"
          style={{
            position: 'absolute',
            top: 20,
            left: 0,
            width: 880,
            color: colors.cream,
            fontFamily: serif,
            fontSize: 104,
            lineHeight: 0.93,
            letterSpacing: -5,
            opacity: interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [0, 24], ['0px 46px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          Menos mensajes.<br /><span style={{color: colors.blush, fontStyle: 'italic'}}>Más evento.</span>
        </Interactive.Div>
        <div style={{position: 'absolute', left: 105, top: 420, width: 710, height: 1200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(243,200,207,0.17), rgba(200,166,107,0.08) 48%, transparent 72%)'}} />
        <Interactive.Div
          name="Experiencia dentro del teléfono"
          style={{
            position: 'absolute',
            top: 435,
            left: 165,
            rotate: interpolate(frame, [0, 120], ['1.5deg', '-1deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [0, 100], ['0px 30px', '0px -22px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <PhoneMockup
            name="Ubicación, momentos y RSVP"
            width={595}
            slides={[
              {image: 'assets/invitation-details.png', from: 0, to: 58, panFrom: -10, panTo: -190},
              {image: 'assets/invitation-rsvp.png', from: 53, to: 120, panFrom: -18, panTo: -155},
            ]}
          />
        </Interactive.Div>
        <div style={{position: 'absolute', left: -18, top: 690}}><ProgressPill label="Ubicación" index={1} /></div>
        <div style={{position: 'absolute', right: -20, top: 980}}><ProgressPill label="Momentos" index={3} /></div>
        <div style={{position: 'absolute', left: -5, top: 1270}}><ProgressPill label="RSVP" index={6} /></div>
      </div>
    </SceneBackground>
  );
};
