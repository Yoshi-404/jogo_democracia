/**
 * DEMOCRACIA FIGHTER - Sintetizador de Áudio Web Audio API (Chiptune 16-Bit)
 * Totalmente autônomo sem dependências externas de áudio.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmPlaying = false;
    this.bgmPaused = false;
    this.bgmInterval = null;
    this.sfxVolume = parseFloat(localStorage.getItem('df_sfx_volume') ?? '0.8');
    this.bgmVolume = parseFloat(localStorage.getItem('df_bgm_volume') ?? '0.6');
    this.sfxGainNode = null;
    this.bgmGainNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.sfxGainNode && this.ctx) {
      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(this.enabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGainNode.connect(this.ctx.destination);
    }
    if (!this.bgmGainNode && this.ctx) {
      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(this.enabled ? this.bgmVolume : 0, this.ctx.currentTime);
      this.bgmGainNode.connect(this.ctx.destination);
    }
  }

  setSFXVolume(percent) {
    this.sfxVolume = Math.max(0, Math.min(1, percent / 100));
    try { localStorage.setItem('df_sfx_volume', this.sfxVolume.toString()); } catch (e) {}
    if (this.sfxGainNode && this.ctx) {
      const targetGain = this.enabled ? this.sfxVolume : 0;
      this.sfxGainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  setBGMVolume(percent) {
    this.bgmVolume = Math.max(0, Math.min(1, percent / 100));
    try { localStorage.setItem('df_bgm_volume', this.bgmVolume.toString()); } catch (e) {}
    if (this.bgmGainNode && this.ctx) {
      const targetGain = (this.enabled && !this.bgmPaused) ? this.bgmVolume : 0;
      this.bgmGainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.sfxGainNode) this.sfxGainNode.gain.setValueAtTime(this.enabled ? this.sfxVolume : 0, now);
      if (this.bgmGainNode) this.bgmGainNode.gain.setValueAtTime(this.enabled ? this.bgmVolume : 0, now);
    }
    if (!this.enabled && this.bgmPlaying) {
      this.stopBGM();
    }
    return this.enabled;
  }

  // Som de Soco (Impacto Rápido)
  playPunch() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // Oscilador de tom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGainNode || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Som de Chute (Impacto Pesado)
  playKick() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Som de Magia / Especial (Onda Vermelha / Vento / etc.)
  playSpecial() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.28);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGainNode || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Som de Super Ataque / Ultra
  playSuper() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // Duplo oscilador épico
    [300, 450, 600].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, now + idx * 0.08 + 0.2);

      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGainNode || this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  // Som de Assist / Apoio Popular (Fanfarra Triunfal de Acordes)
  playAssist() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // Acorde Dó Maior Brilhante C5, E5, G5, C6

    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.4, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGainNode || this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  // Som de Pulo
  playJump() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Som de Nocaute / Inelegível Dramático (Impacto Pesado + Sub-grave + Arcade Stabs)
  playKO() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const dest = this.sfxGainNode || this.ctx.destination;

    // 1. Sub-grave Pesado (Impacto de Peito / Sub-boom)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.9);
    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now);
    subOsc.stop(now + 0.9);

    // 2. Acorde Dramático Retrô Descendente (Sawtooth clássico de fliperama)
    [320, 240, 160].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.28, now + 1.1);

      gain.gain.setValueAtTime(0.4 - (idx * 0.08), now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + idx * 0.04);
      osc.stop(now + 1.1);
    });

    // 3. Ruído de Impacto Seco (Crunch)
    try {
      const bufferSize = this.ctx.sampleRate * 0.08;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.55, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      whiteNoise.connect(noiseGain);
      noiseGain.connect(dest);
      whiteNoise.start(now);
    } catch (_) {}
  }

  // Som de Vitória (Fanfarra)
  playVictory() {
    if (!this.enabled) return;
    this.init();
    const notes = [
      { f: 440, d: 0.15 }, // A4
      { f: 554, d: 0.15 }, // C#5
      { f: 659, d: 0.2 },  // E5
      { f: 880, d: 0.45 }  // A5
    ];
    let curTime = this.ctx.currentTime;

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, curTime);

      gain.gain.setValueAtTime(0.4, curTime);
      gain.gain.exponentialRampToValueAtTime(0.01, curTime + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGainNode || this.ctx.destination);
      osc.start(curTime);
      osc.stop(curTime + n.d);
      curTime += n.d;
    });
  }

  // Som de Menu / Seleção
  playSelect() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Som de Bloqueio / Defesa
  playBlock() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGainNode || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Som de Super Freeze Dramático (Flash de Poder Street Fighter / MvC)
  playSuperFreeze() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // Onda senoidal de impacto grave (sub-bass boom)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGainNode || this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.45);

    // Chime agudo cintilante
    [880, 1174, 1567, 2093].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.04);
      gain.gain.setValueAtTime(0.3, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGainNode || this.ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.3);
    });
  }

  // Som de Impacto de Borda (Wall Bounce)
  playWallBounce() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGainNode || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Trilha Chiptune de Batalha em Loop
  startBGM() {
    if (!this.enabled || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;

    // Sequência de notas do tema de comício/luta 8-bit
    const bassline = [110, 110, 130, 146, 110, 164, 146, 130];
    let step = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.bgmPlaying || !this.enabled) return;
      const now = this.ctx.currentTime;
      const freq = bassline[step % bassline.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);

      osc.connect(gain);
      gain.connect(this.bgmGainNode || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

      step++;
    }, 200);
  }

  pauseBGM() {
    this.bgmPaused = true;
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  resumeBGM() {
    this.bgmPaused = false;
    if (this.bgmGainNode && this.ctx && this.enabled) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  stopBGM() {
    this.bgmPlaying = false;
    this.bgmPaused = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

const AudioPlayer = new SoundSystem();
