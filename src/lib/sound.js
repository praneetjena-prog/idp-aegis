/**
 * Web Audio API synthesizer for industrial SCADA notifications.
 * Pure native browser audio - zero external audio asset files or network dependencies.
 */

const STORAGE_SOUND_KEY = 'aegis-sound-enabled';

export function isSoundEnabled() {
  if (typeof window === 'undefined') return false;
  const val = window.localStorage.getItem(STORAGE_SOUND_KEY);
  return val === 'true';
}

export function setSoundEnabled(enabled) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_SOUND_KEY, enabled ? 'true' : 'false');
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

/**
 * Pleasant two-tone industrial confirmation chime (520Hz -> 680Hz).
 * Played on Work Order dispatch, acknowledgment, or action success.
 */
export function playDispatchChime() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.35);

    setTimeout(() => ctx.close(), 500);
  } catch (err) {
    console.warn('[AEGIS Audio] Failed to play chime', err);
  }
}

/**
 * Industrial dual-frequency alert pulse (440Hz / 880Hz alert).
 * Played on induced fault or critical threshold breach.
 */
export function playAlertChime() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

    setTimeout(() => ctx.close(), 500);
  } catch (err) {
    console.warn('[AEGIS Audio] Failed to play alert', err);
  }
}
