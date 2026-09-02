import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const sampleRate = 48000;
const duration = 24;
const channels = 2;
const frames = sampleRate * duration;
const bpm = 112;
const beatLength = 60 / bpm;
const chordRoots = [110, 130.81, 98, 146.83];

const clamp = (value) => Math.max(-1, Math.min(1, value));
const ping = (time, at, frequency, decay = 14) => {
  const local = time - at;
  return local >= 0 ? Math.sin(2 * Math.PI * frequency * local) * Math.exp(-local * decay) : 0;
};

const samples = new Float32Array(frames * channels);
let peak = 0;

for (let i = 0; i < frames; i++) {
  const time = i / sampleRate;
  const beatPhase = (time % beatLength) / beatLength;
  const halfBeatPhase = (time % (beatLength / 2)) / (beatLength / 2);
  const root = chordRoots[Math.floor(time / 4) % chordRoots.length];
  const build = 0.56 + Math.min(0.44, time / 18);
  const ending = time > 22.7 ? Math.max(0, (24 - time) / 1.3) : 1;

  const pad =
    Math.sin(2 * Math.PI * root * time) * 0.085 +
    Math.sin(2 * Math.PI * root * 1.5 * time + 0.4) * 0.055 +
    Math.sin(2 * Math.PI * root * 2 * time + 0.8) * 0.035;
  const pulse = Math.sin(2 * Math.PI * (root / 2) * time) * Math.exp(-beatPhase * 5.5) * 0.13;
  const kick = Math.sin(2 * Math.PI * (56 + 26 * (1 - beatPhase)) * time) * Math.exp(-beatPhase * 18) * 0.22;
  const hatNoise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  const hat = hatNoise * Math.exp(-halfBeatPhase * 42) * 0.024 * (time > 1 ? 1 : 0.35);
  const shimmer = Math.sin(2 * Math.PI * root * 4 * time + Math.sin(time * 0.7)) * 0.018;

  const tap = ping(time, 8.1, 1280, 25) * 0.09;
  const transition = [3, 7, 10, 13, 17, 20].reduce((sum, at) => sum + ping(time, at - 0.15, 420, 10) * 0.035, 0);
  const confirm = ping(time, 18.15, 740, 7) * 0.08 + ping(time, 18.27, 1110, 8) * 0.06;
  const share = ping(time, 20.75, 920, 8) * 0.07 + ping(time, 20.88, 1380, 9) * 0.05;

  const mono = (pad + pulse + kick + hat + shimmer + tap + transition + confirm + share) * build * ending;
  const left = clamp(mono + Math.sin(2 * Math.PI * root * 2.01 * time) * 0.012);
  const right = clamp(mono + Math.sin(2 * Math.PI * root * 1.99 * time + 0.3) * 0.012);
  samples[i * 2] = left;
  samples[i * 2 + 1] = right;
  peak = Math.max(peak, Math.abs(left), Math.abs(right));
}

const gain = 0.86 / peak;
const dataSize = frames * channels * 2;
const wav = Buffer.alloc(44 + dataSize);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write('WAVE', 8);
wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(channels, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * channels * 2, 28);
wav.writeUInt16LE(channels * 2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(dataSize, 40);

for (let i = 0; i < samples.length; i++) {
  wav.writeInt16LE(Math.round(clamp(samples[i] * gain) * 32767), 44 + i * 2);
}

const here = dirname(fileURLToPath(import.meta.url));
const output = resolve(here, '../public/audio/papeleta-original.wav');
mkdirSync(dirname(output), {recursive: true});
writeFileSync(output, wav);
console.log(`Soundtrack generated: ${output}`);
