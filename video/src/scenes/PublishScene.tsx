import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {PhoneMockup} from '../components/PhoneMockup';
import {Eyebrow, Headline, SceneBackground} from '../components/Shared';
import {colors, sans} from '../theme';

const channels = [
  {label: 'WhatsApp', side: 'left', top: 735, color: '#3DBE70'},
  {label: 'Instagram', side: 'right', top: 990, color: '#D94A72'},
  {label: 'Copiar link', side: 'left', top: 1245, color: '#C8A66B'},
];

export const PublishScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneBackground>
      <div style={{position: 'absolute', inset: '105px 80px'}}>
        <Eyebrow>Lista para todos</Eyebrow>
        <div style={{marginTop: 20}}><Headline size={101}>Publicá y compartí.</Headline></div>
        <Interactive.Div
          name="Invitación publicada centrada"
          style={{
            position: 'absolute',
            top: 370,
            left: 190,
            rotate: interpolate(frame, [0, 90], ['-2deg', '1deg'], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            translate: interpolate(frame, [0, 24, 90], ['0px 55px', '0px 0px', '0px -18px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          <PhoneMockup name="Invitación terminada" width={540} slides={[{image: 'assets/invitation-cover.png', from: 0, to: 90, panFrom: -10, panTo: -105}]} />
        </Interactive.Div>
        {channels.map((channel, index) => (
          <Interactive.Div
            key={channel.label}
            name={`Compartir — ${channel.label}`}
            style={{
              position: 'absolute',
              left: channel.side === 'left' ? -22 : undefined,
              right: channel.side === 'right' ? -20 : undefined,
              top: channel.top,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 22px',
              borderRadius: 999,
              background: 'rgba(255,253,252,0.96)',
              border: '1px solid rgba(91,20,41,0.1)',
              boxShadow: '0 22px 60px rgba(49,9,21,0.18)',
              fontFamily: sans,
              fontSize: 25,
              color: colors.burgundy,
              fontWeight: 800,
              opacity: interpolate(frame, [18 + index * 13, 30 + index * 13], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              translate: interpolate(frame, [18 + index * 13, 40 + index * 13], [channel.side === 'left' ? '-85px 0px' : '85px 0px', '0px 0px'], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            <span style={{width: 20, height: 20, borderRadius: channel.label === 'Copiar link' ? 6 : '50%', background: channel.color}} />
            {channel.label}
          </Interactive.Div>
        ))}
      </div>
    </SceneBackground>
  );
};
