import {Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, sans, serif} from '../theme';

const celebrationParticles = [
  {left: 8, top: 17, color: '#D94A72', rotate: -18, delay: 0},
  {left: 18, top: 72, color: '#C8A66B', rotate: 24, delay: 9},
  {left: 31, top: 10, color: '#F3C8CF', rotate: 52, delay: 18},
  {left: 44, top: 82, color: '#D94A72', rotate: -35, delay: 5},
  {left: 57, top: 15, color: '#C8A66B', rotate: 12, delay: 14},
  {left: 69, top: 74, color: '#F3C8CF', rotate: 63, delay: 2},
  {left: 82, top: 23, color: '#D94A72', rotate: -55, delay: 22},
  {left: 93, top: 67, color: '#C8A66B', rotate: 31, delay: 11},
];

export const EventAtmosphere: React.FC<{dark?: boolean}> = ({dark = false}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -120, bottom: 210, width: 390, height: 390, borderRadius: '50%', background: dark ? 'rgba(217,74,114,0.18)' : 'rgba(200,166,107,0.18)', filter: 'blur(75px)'}} />
      <div style={{position: 'absolute', right: -100, top: 260, width: 330, height: 330, borderRadius: '50%', background: dark ? 'rgba(200,166,107,0.16)' : 'rgba(217,74,114,0.13)', filter: 'blur(70px)'}} />
      {celebrationParticles.map((particle, index) => (
        <div
          key={`${particle.left}-${particle.top}`}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: index % 3 === 0 ? 12 : 9,
            height: index % 2 === 0 ? 34 : 22,
            borderRadius: 5,
            background: particle.color,
            opacity: interpolate(frame, [particle.delay, particle.delay + 12, particle.delay + 72, particle.delay + 92], [0, 0.78, 0.58, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [particle.delay, particle.delay + 92], ['0px 35px', `${index % 2 === 0 ? 28 : -24}px -105px`], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            rotate: `${particle.rotate + frame * (index % 2 === 0 ? 0.7 : -0.6)}deg`,
          }}
        />
      ))}
    </div>
  );
};

export const Headline: React.FC<{children: React.ReactNode; light?: boolean; size?: number; name?: string}> = ({children, light = false, size = 94, name = 'Titular'}) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name={name}
      style={{
        color: light ? colors.cream : colors.ink,
        fontFamily: serif,
        fontSize: size,
        lineHeight: 0.96,
        letterSpacing: -3,
        opacity: interpolate(frame, [2, 20], [0, 1], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        translate: interpolate(frame, [2, 24], ['0px 36px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
      }}
    >
      {children}
    </Interactive.Div>
  );
};

export const Eyebrow: React.FC<{children: React.ReactNode; light?: boolean}> = ({children, light = false}) => (
  <Interactive.Div
    name="Antetítulo"
    style={{
      color: light ? colors.blush : colors.burgundy,
      fontFamily: sans,
      fontSize: 25,
      fontWeight: 800,
      letterSpacing: 6,
      textTransform: 'uppercase',
    }}
  >
    {children}
  </Interactive.Div>
);

export const SceneBackground: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark = false}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: dark
          ? 'radial-gradient(circle at 78% 16%, #852744 0, #5B1429 31%, #310915 100%)'
          : 'radial-gradient(circle at 20% 12%, #fffaf5 0, #f7f1e9 48%, #eadbd4 100%)',
      }}
    >
      <div style={{position: 'absolute', width: 700, height: 700, borderRadius: '50%', filter: 'blur(90px)', opacity: 0.2, background: dark ? colors.coral : colors.blush, right: -280, top: -250, translate: interpolate(frame, [0, durationInFrames], ['0px 0px', '-80px 90px'])}} />
      <EventAtmosphere dark={dark} />
      {children}
    </div>
  );
};

export const ProgressPill: React.FC<{label: string; index: number}> = ({label, index}) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name={`Función — ${label}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '20px 28px',
        borderRadius: 999,
        background: 'rgba(255,253,252,0.92)',
        boxShadow: '0 18px 50px rgba(49,9,21,0.12)',
        color: colors.burgundy,
        fontFamily: sans,
        fontSize: 30,
        fontWeight: 750,
        opacity: interpolate(frame, [index * 10, index * 10 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        translate: interpolate(frame, [index * 10, index * 10 + 18], ['50px 0px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
      }}
    >
      <span style={{width: 16, height: 16, borderRadius: '50%', background: index === 1 ? colors.gold : colors.coral}} />
      {label}
    </Interactive.Div>
  );
};
