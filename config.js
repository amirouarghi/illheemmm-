(() => {
  const ns = (window.IlhemGift = window.IlhemGift || {});

  // Personalize your gift message and signature here
  ns.GIFT_CONFIG = {
    recipientName: "Ilhem",
    finaleTitle: "~  *  For Ilhem  *  ~",
    finaleSubtitle: "every letter of your name grows a garden of purple blooms & happy kitties",
    noteHeading: "To My Dearest Ilhem",
    noteBody:
      "Just like this little world hidden inside your name,\n" +
      "you turn ordinary moments into something bright, colorful, and alive.\n\n" +
      "Here is a bouquet of purple flowers that never fades\n" +
      "and a cozy crowd of kitties—just to bring a huge smile to your face today.",
    noteSignature: "With all my love  <3"
  };

  // Shared math, easing, and HSL color helpers
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0));
    return t * t * (3 - 2 * t);
  };
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeInOutQuart = (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const hsl = (h, s, l, a = 1) =>
    `hsla(${((h % 360) + 360) % 360}, ${s}%, ${l}%, ${a})`;

  ns.utils = {
    clamp,
    lerp,
    smoothstep,
    easeInOutCubic,
    easeInOutQuart,
    easeOutCubic,
    easeOutBack,
    hsl
  };
})();
