import {Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Eyebrow, Headline, SceneBackground} from '../components/Shared';
import {PhoneMockup} from '../components/PhoneMockup';
import {colors, sans} from '../theme';

export const ChoiceScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneBackground>
      <div style={{position: 'absolute', inset: '110px 80px'}}>
        <Eyebrow>Tu estilo</Eyebrow>
        <div style={{marginTop: 24}}><Headline size={104}>Elegí una plantilla.</Headline></div>
        <Interactive.Div
          name="Carrusel de plantillas reales"
          style={{
            position: 'absolute',
            top: 405,
            left: -255,
            width: 1430,
            height: 760,
            borderRadius: 72,
            overflow: 'hidden',
            boxShadow: '0 45px 120px rgba(49,9,21,0.2)',
            rotate: interpolate(frame, [0, 80], ['-2deg', '1deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [0, 75], ['-80px 0px', '65px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <Img src={staticFile('assets/template-cards.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Interactive.Div>
        <Interactive.Div
          name="Plantilla elegida dentro del teléfono"
          style={{
            position: 'absolute',
            left: 225,
            top: 555,
            opacity: interpolate(frame, [34, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            scale: interpolate(frame, [34, 60], [0.82, 1], {easing: Easing.spring({damping: 18}), extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale'}),
            rotate: interpolate(frame, [34, 78], ['3deg', '-1deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <PhoneMockup name="Plantilla aplicada" width={485} slides={[{image: 'assets/invitation-cover.png', from: 0, to: 90, panFrom: -10, panTo: -72}]} />
        </Interactive.Div>
        <Interactive.Div
          name="Hacela tuya"
          style={{
            position: 'absolute',
            bottom: 55,
            right: 0,
            padding: '28px 42px',
            borderRadius: 999,
            color: colors.paper,
            background: colors.burgundy,
            fontFamily: sans,
            fontSize: 44,
            fontWeight: 800,
            opacity: interpolate(frame, [48, 62], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [48, 68], ['60px 0px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          Hacela tuya <span style={{color: colors.blush}}>→</span>
        </Interactive.Div>
      </div>
    </SceneBackground>
  );
};
