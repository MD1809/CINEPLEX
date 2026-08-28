// Web Audio API Synthesizer for instant ticket scan feedback

class AudioFeedback {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * 1. Vé hợp lệ: Một tiếng "Bíp" ngắn, âm sắc trong và cao (Short, High-pitch Beep)
   */
  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // Nốt A6 - Trong và cao

      // Attack & decay nhanh (120ms) tạo tiếng "Bíp" đanh, dứt khoát
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {
      console.error('Audio feedback error', e);
    }
  }

  /**
   * 2. Vé đã qua sử dụng: Còi trầm ngắt quãng 2 hồi (Double Low Warning Tone)
   */
  playWarning() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Hồi 1 (0.00s -> 0.13s)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(260, now); // Âm trầm C4

      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Hồi 2 (0.20s -> 0.35s)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(220, now + 0.20); // Âm trầm A3

      gain2.gain.setValueAtTime(0.001, now + 0.19);
      gain2.gain.setValueAtTime(0.28, now + 0.20);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.20);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.error('Audio feedback error', e);
    }
  }

  /**
   * 3. Vé không hợp lệ: Tiếng "Tút" kéo dài (Error Long Tone)
   */
  playError() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now); // Âm trầm F#3 kéo dài

      // Tiếng tút đều kéo dài ~0.65 giây
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
      gain.gain.setValueAtTime(0.3, now + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {
      console.error('Audio feedback error', e);
    }
  }
}

export const audioFeedback = new AudioFeedback();
