import {Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PhoneMockup} from '../components/PhoneMockup';
import {SceneBackground} from '../components/Shared';
import {colors, sans, serif} from '../theme';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneBackground>
      <div style={{position: 'absolute', inset: '105px 80px'}}>
        <Interactive.Div
          name="Fragmentos de preparativos"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 920,
            height: 420,
            opacity: interpolate(frame, [0, 6, 28, 40], [0, 1, 1, 0.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {[0, 1, 2].map((index) => (
            <div key={index} style={{position: 'absolute', left: index * 295, top: index === 1 ? 0 : 68, width: 275, height: 335, borderRadius: 42, overflow: 'hidden', rotate: `${[-7, 2, 7][index]}deg`, boxShadow: '0 24px 70px rgba(49,9,21,0.16)'}}>
              <Img src={staticFile('assets/template-cards.png')} style={{height: 360, width: 517, objectFit: 'cover', objectPosition: `${[7, 50, 96][index]}% center`, translate: index === 0 ? '0 0' : index === 1 ? '-120px 0' : '-240px 0'}} />
            </div>
          ))}
        </Interactive.Div>

        <div style={{position: 'absolute', top: 370, left: -30, width: 560}}>
          <div style={{fontFamily: sans, fontSize: 24, fontWeight: 800, letterSpacing: 6, color: colors.coral, marginBottom: 28}}>PAPELETA · INVITACIONES DIGITALES</div>
          <Interactive.Div
            name="Hook principal"
            style={{
              fontFamily: serif,
              fontSize: 94,
              lineHeight: 0.98,
              letterSpacing: -4,
              color: colors.ink,
              opacity: interpolate(frame, [8, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              translate: interpolate(frame, [8, 28], ['0px 50px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            Tu <span style={{color: colors.burgundy, fontStyle: 'italic'}}>evento</span> empieza<br />antes de que<br />llegue el día.
          </Interactive.Div>
        </div>

        <Interactive.Div
          name="Smartphone — invitación real"
          style={{
            position: 'absolute',
            top: 900,
            right: -10,
            rotate: interpolate(frame, [18, 48], ['5deg', '1deg'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [14, 45], ['180px 90px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <PhoneMockup
            name="Invitación real de bienvenida"
            width={470}
            slides={[{image: 'assets/invitation-cover.png', from: 0, to: 90, panFrom: -8, panTo: -92}]}
          />
        </Interactive.Div>
      </div>
    </SceneBackground>
  );
};
