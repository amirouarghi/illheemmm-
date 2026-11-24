(() => {
  const ns = (window.IlhemGift = window.IlhemGift || {});

  let audioCtx = null;
  let soundEnabled = true;

  function ensure() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playChime(freq, duration = 1.6, volume = 0.045, delay = 0) {
    if (!soundEnabled) return;
    const ac = ensure();
    if (!ac) return;
    const now = ac.currentTime + delay;

    const osc = ac.createOscillator();
    const osc2 = ac.createOscillator();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, now);

    const overtoneGain = ac.createGain();
    overtoneGain.gain.setValueAtTime(0.14, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2100, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    osc2.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  const MELODY_CUES = [
    { t: 0.3, notes: [523.25, 659.25, 783.99, 987.77] },
    { t: 2.2, notes: [587.33, 698.46, 880.0, 1046.5] },
    { t: 4.1, notes: [659.25, 783.99, 987.77, 1174.66] },
    { t: 5.5, notes: [523.25, 659.25, 880.0, 1046.5] },
    { t: 8.5, notes: [440.0, 523.25, 659.25, 783.99] },
    { t: 10.6, notes: [587.33, 783.99, 987.77, 1174.66] },
    { t: 12.2, notes: [659.25, 880.0, 1046.5, 1318.51] },
    { t: 15.6, notes: [523.25, 659.25, 783.99, 1046.5, 1318.51] }
  ];

  let firedCues = new Set();

  function checkCues(t, started) {
    if (!soundEnabled || !started) return;
    for (let i = 0; i < MELODY_CUES.length; i++) {
      const cue = MELODY_CUES[i];
      if (!firedCues.has(i) && t >= cue.t && t < cue.t + 0.35) {
        firedCues.add(i);
        cue.notes.forEach((f, idx) => playChime(f, 1.8, 0.036, idx * 0.14));
      }
    }
  }

  function resetCues() {
    firedCues.clear();
  }

  function syncCuesToTime(targetTime) {
    firedCues = new Set(
      MELODY_CUES.map((c, idx) => (c.t < targetTime ? idx : -1)).filter((i) => i >= 0)
    );
  }

  ns.audio = {
    isEnabled: () => soundEnabled,
    setEnabled: (v) => {
      soundEnabled = Boolean(v);
    },
    ensure,
    playChime,
    checkCues,
    resetCues,
    syncCuesToTime
  };
})();
