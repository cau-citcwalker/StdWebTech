/* =============================================================
 * FinEdu — 효과음 (Web Audio API)
 *
 * 오디오 파일을 번들하지 않고 즉석에서 짧은 톤을 합성한다.
 * 사용자 설정(`finedu.sound`)으로 끄고 켤 수 있다.
 *
 *   sfx.correct() · sfx.wrong() · sfx.tap() · sfx.win() · sfx.tick()
 *   sfx.setEnabled(true|false) · sfx.isEnabled()
 * ============================================================= */

const LS_KEY = "finedu.sound";

let ctx = null;
function ac() {
  if (ctx === null) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      ctx = null;
    }
  }
  return ctx;
}

/* 단순 ADSR 톤 합성 */
function tone({ freq = 660, dur = 0.16, type = "sine", gain = 0.18, slideTo = null }) {
  const a = ac();
  if (!a) return;
  if (a.state === "suspended") a.resume();

  const now = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo != null) {
    osc.frequency.linearRampToValueAtTime(slideTo, now + dur);
  }
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(g);
  g.connect(a.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

let enabled = (() => {
  const v = localStorage.getItem(LS_KEY);
  return v === null ? true : v === "true";
})();

function setEnabled(on) {
  enabled = !!on;
  localStorage.setItem(LS_KEY, enabled ? "true" : "false");
}

function isEnabled() { return enabled; }

function guard(fn) { return (...args) => { if (enabled) fn(...args); }; }

export const sfx = {
  setEnabled,
  isEnabled,
  tap:    guard(() => tone({ freq: 720, dur: 0.06, type: "triangle", gain: 0.06 })),
  tick:   guard(() => tone({ freq: 980, dur: 0.05, type: "sine",     gain: 0.05 })),
  correct: guard(() => {
    tone({ freq: 660, dur: 0.10, type: "sine", gain: 0.20 });
    setTimeout(() => tone({ freq: 880, dur: 0.14, type: "sine", gain: 0.20 }), 90);
  }),
  wrong:  guard(() => {
    tone({ freq: 220, dur: 0.18, type: "square", gain: 0.10, slideTo: 130 });
  }),
  win:    guard(() => {
    const seq = [523.25, 659.25, 783.99, 1046.5];
    seq.forEach((f, i) => setTimeout(() => {
      tone({ freq: f, dur: 0.16, type: "triangle", gain: 0.16 });
    }, i * 90));
  }),
};
