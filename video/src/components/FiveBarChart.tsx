import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {colors, sans} from '../theme';

const heights = [0.38, 0.54, 0.68, 0.84, 1];

export const FiveBarChart: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div name="Gráfico animado de 5 barras" style={{position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 16, width: 304, height: 210}}>
      {heights.map((height, index) => (
        <div key={height} style={{width: 48, height: 190, display: 'flex', alignItems: 'flex-end'}}>
          <div
            style={{
              width: '100%',
              height: `${height * 100}%`,
              borderRadius: '24px 24px 10px 10px',
              background: index === 4 ? colors.burgundy : `rgba(217,74,114,${0.35 + index * 0.13})`,
              scale: `1 ${interpolate(frame, [index * 5, index * 5 + 22], [0, 1], {easing: Easing.spring({damping: 18}), extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale'})}`,
              transformOrigin: 'bottom',
            }}
          />
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, bottom: -48, width: 304, fontFamily: sans, fontSize: 18, letterSpacing: 1.5, color: colors.burgundy, fontWeight: 800, whiteSpace: 'nowrap'}}>PLANTILLA · DATOS · LISTO</div>
    </Interactive.Div>
  );
};
