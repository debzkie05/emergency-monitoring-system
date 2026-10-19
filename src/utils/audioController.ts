import { Platform } from 'react-native';

export type AudioState = 'not_started' | 'active' | 'blocked' | 'unavailable';

class WebAudioController {
  private ctx: any | null = null;
  private masterGain: any | null = null;
  private currentSirenInterval: any | null = null;
  private currentSirenOsc: any | null = null;
  private currentSirenGain: any | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private state: AudioState = 'not_started';
  private currentPlayingId: string | null = null;
  private playedOnceSet: Set<string> = new Set();
  private stateListeners: Set<(state: AudioState) => void> = new Set();

  constructor() {
    if (Platform.OS !== 'web') {
      this.state = 'unavailable';
    }
  }

  public subscribe(callback: (state: AudioState) => void) {
    this.stateListeners.add(callback);
    callback(this.state);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  private notify() {
    this.stateListeners.forEach((cb) => cb(this.state));
  }

  public getState(): AudioState {
    return this.state;
  }

  public isSoundPlaying(incidentId?: string): boolean {
    if (this.state !== 'active' || this.isMuted) return false;
    if (incidentId) {
      return this.currentPlayingId === incidentId;
    }
    return this.currentPlayingId !== null;
  }

  public getActiveIncidentId(): string | null {
    if (this.state !== 'active' || this.isMuted) return null;
    return this.currentPlayingId;
  }

  public hasPlayedOnce(incidentId: string): boolean {
    return this.playedOnceSet.has(incidentId);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, now);
    }
    if (muted) {
      // If muted, pause or stop active oscillator
      this.stopCurrentOsc();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.volume, now);
    }
  }

  public async startMonitoring(): Promise<AudioState> {
    if (Platform.OS !== 'web') {
      this.state = 'unavailable';
      this.notify();
      return this.state;
    }

    try {
      const AudioCtxClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        this.state = 'unavailable';
        this.notify();
        return this.state;
      }

      if (!this.ctx) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (this.ctx.state === 'running') {
        this.state = 'active';
      } else {
        this.state = 'blocked';
      }
    } catch {
      this.state = 'blocked';
    }

    this.notify();
    return this.state;
  }

  public stopAll() {
    this.stopCurrentOsc();
    this.currentPlayingId = null;
  }

  private stopCurrentOsc() {
    if (this.currentSirenInterval) {
      clearInterval(this.currentSirenInterval);
      this.currentSirenInterval = null;
    }
    if (this.currentSirenOsc) {
      try {
        this.currentSirenOsc.stop();
        this.currentSirenOsc.disconnect();
      } catch {
        // Ignored
      }
      this.currentSirenOsc = null;
    }
    if (this.currentSirenGain) {
      try {
        this.currentSirenGain.disconnect();
      } catch {
        // Ignored
      }
      this.currentSirenGain = null;
    }
  }

  /**
   * Play the two-tone alternating siren for a critical alert.
   * Continues looping until stopAll() or another incident takes over.
   */
  public playCriticalSiren(incidentId: string) {
    if (this.state !== 'active' || this.isMuted || !this.ctx || !this.masterGain) {
      return;
    }

    // If already playing for this exact incident, don't restart
    if (this.currentPlayingId === incidentId && this.currentSirenOsc) {
      return;
    }

    this.stopCurrentOsc();
    this.currentPlayingId = incidentId;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      const freqLow = 650;
      const freqHigh = 920;
      let toggle = false;

      osc.frequency.setValueAtTime(freqLow, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.currentSirenOsc = osc;
      this.currentSirenGain = gain;

      this.currentSirenInterval = setInterval(() => {
        if (!this.ctx || !this.currentSirenOsc) return;
        toggle = !toggle;
        const targetFreq = toggle ? freqHigh : freqLow;
        this.currentSirenOsc.frequency.cancelScheduledValues(this.ctx.currentTime);
        this.currentSirenOsc.frequency.linearRampToValueAtTime(
          targetFreq,
          this.ctx.currentTime + 0.12
        );
      }, 350);
    } catch {
      // Audio playback failure handled safely
    }
  }

  /**
   * Play 3 distinct beeps for High severity.
   * Plays once per incident.
   */
  public playHighBeeps(incidentId: string) {
    if (
      this.state !== 'active' ||
      this.isMuted ||
      !this.ctx ||
      !this.masterGain ||
      this.playedOnceSet.has(incidentId)
    ) {
      return;
    }

    this.stopCurrentOsc();
    this.currentPlayingId = incidentId;
    this.playedOnceSet.add(incidentId);

    const now = this.ctx.currentTime;
    const beepDuration = 0.12;
    const pauseDuration = 0.08;
    const freq = 880;

    for (let i = 0; i < 3; i++) {
      const startTime = now + i * (beepDuration + pauseDuration);
      const stopTime = startTime + beepDuration;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.setValueAtTime(0, stopTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(stopTime);
    }

    setTimeout(() => {
      if (this.currentPlayingId === incidentId) {
        this.currentPlayingId = null;
      }
    }, (3 * (beepDuration + pauseDuration) + 0.1) * 1000);
  }

  /**
   * Play 1 soft chime for Moderate severity.
   * Plays once per incident.
   */
  public playModerateChime(incidentId: string) {
    if (
      this.state !== 'active' ||
      this.isMuted ||
      !this.ctx ||
      !this.masterGain ||
      this.playedOnceSet.has(incidentId)
    ) {
      return;
    }

    this.stopCurrentOsc();
    this.currentPlayingId = incidentId;
    this.playedOnceSet.add(incidentId);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.9);

    setTimeout(() => {
      if (this.currentPlayingId === incidentId) {
        this.currentPlayingId = null;
      }
    }, 1000);
  }

  /**
   * Test sound button playback.
   */
  public playTestSound() {
    if (this.state !== 'active' || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.linearRampToValueAtTime(659.25, now + 0.2); // E5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const audioController = new WebAudioController();
