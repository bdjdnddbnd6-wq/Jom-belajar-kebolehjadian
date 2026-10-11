/**
 * Web Audio API Sound Synthesizer
 * 100% offline, zero external dependencies, no copyrighted music.
 * Generates cheerful melodic BGM and realistic educational sound effects.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmTimeoutId: number | null = null;
  private isMuted = false;
  private bgmEnabled = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.09;
      this.bgmGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.28;
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain && this.sfxGain) {
      this.bgmGain.gain.value = muted || !this.bgmEnabled ? 0 : 0.09;
      this.sfxGain.gain.value = muted ? 0 : 0.28;
    }
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (this.bgmGain) {
      this.bgmGain.gain.value = enabled && !this.isMuted ? 0.09 : 0;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  // --- Melodic Original BGM ---
  // Cheerful pentatonic lullaby/schoolyard motif in C major (C4, E4, G4, A4, C5)
  public startBGM() {
    this.init();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.scheduleBgmLoop();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId !== null) {
      window.clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }

  private scheduleBgmLoop() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

    // Friendly 8-measure gentle marimba/chime melody (original composition)
    const notes = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      392.00, 329.63, 440.00, 392.00, // G4, E4, A4, G4
      349.23, 392.00, 440.00, 523.25, // F4, G4, A4, C5
      392.00, 329.63, 293.66, 261.63, // G4, E4, D4, C4
      329.63, 392.00, 523.25, 587.33, // E4, G4, C5, D5
      523.25, 440.00, 392.00, 329.63, // C5, A4, G4, E4
      349.23, 440.00, 392.00, 293.66, // F4, A4, G4, D4
      261.63, 329.63, 392.00, 261.63, // C4, E4, G4, C4
    ];

    const noteDuration = 0.38; // seconds per note
    const now = this.ctx.currentTime + 0.05;

    notes.forEach((freq, index) => {
      if (!this.ctx || !this.bgmGain) return;
      const startTime = now + index * noteDuration;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration * 0.95);

      osc.connect(noteGain);
      noteGain.connect(this.bgmGain);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });

    const totalDurationMs = notes.length * noteDuration * 1000;
    this.bgmTimeoutId = window.setTimeout(() => {
      if (this.isBgmPlaying) {
        this.scheduleBgmLoop();
      }
    }, totalDurationMs - 100);
  }

  // --- Sound Effects (SFX) ---
  private lastCollisionSoundTime = 0;

  public playMarbleCollision(intensity = 0.5) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    if (now - this.lastCollisionSoundTime < 0.045) return;
    this.lastCollisionSoundTime = now;

    const safeIntensity = Math.max(0.1, Math.min(1, intensity));
    const volume = 0.08 + safeIntensity * 0.28;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = 1600 + Math.random() * 650;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.035);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playMarbleDrop(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = (640 + Math.random() * 80) * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    setTimeout(() => {
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.3, t);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, t + 0.08);

      gain2.gain.setValueAtTime(0.2, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      osc2.connect(gain2);
      gain2.connect(this.sfxGain);

      osc2.start(t);
      osc2.stop(t + 0.1);
    }, 60);
  }

  public playMarblePop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.11);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playDiceRoll() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(140 + Math.random() * 180, now);

        gain.gain.setValueAtTime(0.25 - i * 0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.05);
      }, i * 70);
    }
  }

  public playCoinFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1320, now);
    osc.frequency.linearRampToValueAtTime(1760, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playCoinLand() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2480, now);
    osc.frequency.exponentialRampToValueAtTime(1960, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);

    setTimeout(() => {
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2890, t);
      osc2.frequency.exponentialRampToValueAtTime(2200, t + 0.08);

      gain2.gain.setValueAtTime(0.18, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc2.connect(gain2);
      gain2.connect(this.sfxGain);

      osc2.start(t);
      osc2.stop(t + 0.1);
    }, 75);
  }

  public playSpinnerTick(frequency = 600) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playCardFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
      }, idx * 70);
    });
  }

  public playWrong() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [293.66, 261.63]; // D4, C4
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.18);
      }, idx * 110);
    });
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.35 },
      { f: 783.99, d: 0.5 },
    ];

    let delay = 0;
    notes.forEach((item) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + item.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + item.d + 0.05);
      }, delay);
      delay += item.d * 1000 * 0.85;
    });
  }
}

export const soundEngine = new SoundEngine();
