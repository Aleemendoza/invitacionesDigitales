import {Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PhoneMockup} from '../components/PhoneMockup';
import {SceneBackground} from '../components/Shared';
import {colors, sans, serif} from '../theme';

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneBackground dark>
      <div style={{position: 'absolute', inset: '95px 80px'}}>
        <Interactive.Div
          name="Smartphone final"
          style={{
            position: 'absolute',
            top: 90,
            right: -20,
            rotate: interpolate(frame, [0, 150], ['3deg', '-1deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            opacity: interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <PhoneMockup name="Invitación terminada" width={430} slides={[{image: 'assets/invitation-cover.png', from: 0, to: 180, panFrom: -10, panTo: -110}]} />
        </Interactive.Div>

        <Interactive.Div
          name="Mensaje de cierre"
          style={{
            position: 'absolute',
            top: 185,
            left: 0,
            width: 470,
            color: colors.cream,
            fontFamily: serif,
            fontSize: 76,
            lineHeight: 0.97,
            letterSpacing: -4,
            opacity: interpolate(frame, [10, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [10, 36], ['0px 45px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          Tu evento merece<br />una invitación<br /><span style={{color: colors.blush, fontStyle: 'italic'}}>a la altura.</span>
        </Interactive.Div>

        <Interactive.Div
          name="Logo oficial recortado de captura"
          style={{position: 'absolute', left: 0, top: 1010, width: 360, height: 105, overflow: 'hidden', background: colors.cream, borderRadius: 18, opacity: interpolate(frame, [58, 74], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}
        >
          <Img src={staticFile('assets/creation-plan.png')} style={{position: 'absolute', width: 1837, height: 863, left: -60, top: -5, objectFit: 'cover'}} />
        </Interactive.Div>

        <Interactive.Div
          name="Claim de marca"
          style={{position: 'absolute', top: 1150, left: 0, width: 650, fontFamily: sans, fontSize: 34, lineHeight: 1.25, color: colors.cream, opacity: interpolate(frame, [68, 84], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}
        >
          Invitaciones digitales<br />para momentos reales.
        </Interactive.Div>

        <Interactive.Div
          name="CTA"
          style={{
            position: 'absolute',
            left: 0,
            bottom: 145,
            minWidth: 520,
            padding: '30px 46px',
            borderRadius: 999,
            background: colors.cream,
            color: colors.burgundy,
            fontFamily: sans,
            fontSize: 42,
            fontWeight: 850,
            textAlign: 'center',
            boxShadow: '0 20px 65px rgba(0,0,0,0.2)',
            opacity: interpolate(frame, [82, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            scale: interpolate(frame, [82, 110], [0.92, 1], {easing: Easing.spring({damping: 18}), extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale'}),
          }}
        >
          Creá la tuya <span style={{color: colors.coral}}>→</span>
        </Interactive.Div>
        <div style={{position: 'absolute', bottom: 62, left: 0, color: colors.blush, fontFamily: sans, fontSize: 33, fontWeight: 800, letterSpacing: 2}}>papeleta.com.ar</div>
      </div>
    </SceneBackground>
  );
};
