import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {PhoneMockup} from '../components/PhoneMockup';
import {Eyebrow, Headline, ProgressPill, SceneBackground} from '../components/Shared';
import {colors} from '../theme';

export const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneBackground>
      <div style={{position: 'absolute', inset: '105px 80px'}}>
        <Eyebrow>La invitación</Eyebrow>
        <div style={{marginTop: 20, width: 780}}><Headline size={92}>Todo en un solo lugar.</Headline></div>
        <div style={{position: 'absolute', left: 115, top: 405, width: 690, height: 1080, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(217,74,114,0.16), rgba(200,166,107,0.08) 48%, transparent 72%)'}} />
        <Interactive.Div
          name="Vista previa dinámica"
          style={{
            position: 'absolute',
            top: 365,
            left: 170,
            rotate: interpolate(frame, [0, 120], ['-1.8deg', '1.2deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [0, 24, 100, 120], ['0px 58px', '0px 0px', '0px -20px', '0px -12px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <PhoneMockup
            name="Invitación real navegable"
            width={585}
            slides={[
              {image: 'assets/invitation-cover.png', from: 0, to: 38, panFrom: -15, panTo: -70},
              {image: 'assets/invitation-details.png', from: 34, to: 82, panFrom: -15, panTo: -175},
              {image: 'assets/invitation-rsvp.png', from: 78, to: 120, panFrom: -20, panTo: -125},
            ]}
          />
        </Interactive.Div>
        <div style={{position: 'absolute', left: -10, top: 700}}><ProgressPill label="Fecha" index={1} /></div>
        <div style={{position: 'absolute', right: -12, top: 930}}><ProgressPill label="Ubicación" index={3} /></div>
        <div style={{position: 'absolute', left: -5, top: 1210}}><ProgressPill label="RSVP" index={6} /></div>
        <div style={{position: 'absolute', width: 54, height: 54, borderRadius: '50%', border: `2px solid ${colors.gold}`, right: 45, top: 535, opacity: interpolate(frame, [16, 38], [0, 0.65], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      </div>
    </SceneBackground>
  );
};
