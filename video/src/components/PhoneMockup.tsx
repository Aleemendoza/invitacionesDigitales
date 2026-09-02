import {Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame} from 'remotion';

type PhoneSlide = {
  image: string;
  from: number;
  to: number;
  panFrom?: number;
  panTo?: number;
};

type PhoneMockupProps = {
  image?: string;
  slides?: PhoneSlide[];
  name: string;
  width?: number;
  pan?: number;
};

export const PhoneMockup: React.FC<PhoneMockupProps> = ({image, slides, name, width = 610, pan = 0}) => {
  const frame = useCurrentFrame();
  const height = width * 1.98;
  const visibleSlides = slides ?? [{image: image ?? 'assets/invitation-cover.png', from: 0, to: 1000, panFrom: 0, panTo: pan}];

  return (
    <Interactive.Div
      name={name}
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: width * 0.14,
        padding: width * 0.025,
        background: 'linear-gradient(145deg, #3b3235, #100c0e 48%, #74676d)',
        boxShadow: '0 48px 110px rgba(45, 11, 23, 0.28), inset 0 0 0 2px rgba(255,255,255,0.22)',
        scale: interpolate(frame, [0, 24], [0.91, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          output: 'perceptual-scale',
        }),
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.115, overflow: 'hidden', background: '#142f32'}}>
        {visibleSlides.map((slide, index) => (
          <Img
            key={`${slide.image}-${slide.from}`}
            name={`${name} — pantalla ${index + 1}`}
            src={staticFile(slide.image)}
            style={{
              position: 'absolute',
              left: '-10%',
              width: '120%',
              height: '120%',
              objectFit: 'cover',
              objectPosition: 'center top',
              top: interpolate(frame, [slide.from, slide.to], [slide.panFrom ?? -18, slide.panTo ?? -145], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              opacity: interpolate(
                frame,
                slide.from === 0 ? [0, Math.max(1, slide.to - 7), slide.to] : [slide.from - 7, slide.from, Math.max(slide.from + 1, slide.to - 7), slide.to],
                slide.from === 0 ? [1, 1, index === visibleSlides.length - 1 ? 1 : 0] : [0, 1, 1, index === visibleSlides.length - 1 ? 1 : 0],
                {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                },
              ),
              scale: interpolate(frame, [slide.from, slide.to], [1.015, 1.055], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                output: 'perceptual-scale',
              }),
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '61%',
            width: 76,
            height: 76,
            marginLeft: -38,
            marginTop: -38,
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.95)',
            background: 'rgba(217,74,114,0.38)',
            opacity: interpolate(frame, [34, 38, 48, 53, 72, 76, 86, 91], [0, 1, 0.6, 0, 0, 1, 0.6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            scale: interpolate(frame, [34, 50, 72, 88], [0.55, 1.45, 0.55, 1.45], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale'}),
          }}
        />
        <div style={{position: 'absolute', right: 12, top: '38%', width: 5, height: 150, borderRadius: 99, background: 'rgba(255,255,255,0.28)'}}>
          <div style={{width: 5, height: 52, borderRadius: 99, background: '#fff', translate: `0 ${interpolate(frame, [0, 100], [0, 90], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px`}} />
        </div>
        <div style={{position: 'absolute', top: 17, left: '50%', translate: '-50% 0', width: width * 0.28, height: width * 0.055, borderRadius: 99, background: '#120d0f'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: width * 0.115, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12)', pointerEvents: 'none'}} />
      </div>
    </Interactive.Div>
  );
};
