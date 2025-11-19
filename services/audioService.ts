
let audioCtx: AudioContext | null = null;

const getContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const createOscillator = (ctx: AudioContext, type: OscillatorType, freq: number, startTime: number, duration: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  return { osc, gain };
};

export const playSound = (type: 'shuffle' | 'win' | 'lose' | 'click' | 'start' | 'reveal') => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;

    switch (type) {
      case 'shuffle': {
        // Quick swish sound
        const { osc, gain } = createOscillator(ctx, 'sine', 150, now, 0.1);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'click': {
        // High pitched tick
        const { osc, gain } = createOscillator(ctx, 'triangle', 800, now, 0.05);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'start': {
        // Ready chime
        const { osc, gain } = createOscillator(ctx, 'sine', 440, now, 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);

        const { osc: osc2, gain: gain2 } = createOscillator(ctx, 'sine', 660, now + 0.15, 0.4);
        gain2.gain.setValueAtTime(0.1, now + 0.15);
        gain2.gain.linearRampToValueAtTime(0, now + 0.55);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.55);
        break;
      }
      case 'win': {
        // Major arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((freq, i) => {
          const startTime = now + (i * 0.08);
          const { osc, gain } = createOscillator(ctx, 'square', freq, startTime, 0.1);
          gain.gain.setValueAtTime(0.05, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
          osc.start(startTime);
          osc.stop(startTime + 0.1);
        });
        break;
      }
      case 'lose': {
        // Descending dissonant slide
        const { osc, gain } = createOscillator(ctx, 'sawtooth', 200, now, 0.4);
        osc.frequency.linearRampToValueAtTime(50, now + 0.4);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'reveal': {
        // Small whoosh
        const { osc, gain } = createOscillator(ctx, 'sine', 200, now, 0.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
