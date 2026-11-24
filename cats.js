(() => {
  const ns = (window.IlhemGift = window.IlhemGift || {});
  const { hsl } = ns.utils;

  const CAT_TEMPLATES = {
    sittingLeft: {
      rows: [
        "  /\\_/\\  ",
        " ( o.o ) ",
        "  > ^ <  ",
        " /  *  \\ ",
        "(|     |)",
        " `--\"--' "
      ],
      eyeRow: 1,
      eyeCols: [3, 5],
      tailAnchor: { dx: -4.5, dy: 2.0, dir: -1 }
    },
    sittingRight: {
      rows: [
        "  /\\_/\\  ",
        " ( ^.^ ) ",
        " /  ~  \\ ",
        "(|     |)",
        " `-u-u-' "
      ],
      eyeRow: 1,
      eyeCols: [3, 5],
      tailAnchor: { dx: 4.5, dy: 1.5, dir: 1 }
    },
    curiousTall: {
      rows: [
        " /\\___/\\ ",
        "(  o o  )",
        "(  =^=  )",
        " (     ) ",
        " (_____) "
      ],
      eyeRow: 1,
      eyeCols: [3, 5],
      tailAnchor: { dx: 4.5, dy: 2.0, dir: 1 }
    },
    tinyKitten: {
      rows: [
        " /\\_/\\ ",
        "( ^w^ )",
        "(>   <)",
        " `---' "
      ],
      eyeRow: 1,
      eyeCols: [2, 4],
      tailAnchor: { dx: -3.5, dy: 1.2, dir: -1 }
    },
    sleepingCurl: {
      rows: [
        "  /\\_/\\   ",
        " ( -.- )_ ",
        "(___(__)~~"
      ],
      eyeRow: 1,
      eyeCols: [3, 5],
      isSleeper: true
    }
  };

  const GARDEN_CATS = [
    { tpl: "sittingLeft", bqX: -20.5, bqY: 18.5, appearAt: 11.4, hue: 276, sat: 84, light: 84, eyeHue: 50, noseHue: 332, phase: 0.2, petTimer: 0, screenX: 0, screenY: 0 },
    { tpl: "sittingRight", bqX: 20.5, bqY: 19.0, appearAt: 11.9, hue: 295, sat: 80, light: 82, eyeHue: 175, noseHue: 335, phase: 1.4, petTimer: 0, screenX: 0, screenY: 0 },
    { tpl: "tinyKitten", bqX: -14.2, bqY: 21.6, appearAt: 12.6, hue: 324, sat: 86, light: 85, eyeHue: 48, noseHue: 342, phase: 2.5, petTimer: 0, screenX: 0, screenY: 0 },
    { tpl: "tinyKitten", bqX: 14.2, bqY: 21.6, appearAt: 13.0, hue: 256, sat: 84, light: 84, eyeHue: 52, noseHue: 330, phase: 3.7, petTimer: 0, screenX: 0, screenY: 0 },
    { tpl: "curiousTall", bqX: 31.5, bqY: 19.2, appearAt: 13.5, hue: 282, sat: 88, light: 80, eyeHue: 54, noseHue: 338, phase: 4.4, petTimer: 0, screenX: 0, screenY: 0 },
    { tpl: "sleepingCurl", bqX: -31.5, bqY: 20.6, appearAt: 14.0, hue: 268, sat: 78, light: 82, eyeHue: 290, noseHue: 335, phase: 5.2, petTimer: 0, screenX: 0, screenY: 0 }
  ];

  function drawAsciiCat(ctx, catDef, centerX, centerY, fontPx, t, alpha, scaleX = 1, scaleY = 1) {
    const tpl = CAT_TEMPLATES[catDef.tpl];
    if (!tpl || alpha <= 0.01) return;

    catDef.screenX = centerX;
    catDef.screenY = centerY;

    const rows = tpl.rows.length;
    const cols = tpl.rows[0].length;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;

    const blinkCycle = (t + catDef.phase) % 3.4;
    const isBlinking = blinkCycle > 3.12;
    const isHappySquint =
      catDef.petTimer > 0 || (!tpl.isSleeper && (t + catDef.phase) % 7.2 > 5.4);

    const petBounce = catDef.petTimer > 0 ? Math.sin(catDef.petTimer * Math.PI * 3) * 0.65 : 0;
    const purrBounce = Math.sin(t * 2.8 + catDef.phase) * 0.14 - Math.abs(petBounce);
    const earTwitch = Math.sin(t * 5.2 + catDef.phase * 2) > 0.94 ? -0.18 : 0;

    const monoFont = '"Cascadia Code", "Fira Code", "Consolas", monospace';
    ctx.save();
    ctx.font = `700 ${fontPx.toFixed(1)}px ${monoFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let r = 0; r < rows; r++) {
      const line = tpl.rows[r];
      for (let c = 0; c < line.length; c++) {
        let ch = line[c];
        if (ch === " ") continue;

        if (r === tpl.eyeRow && tpl.eyeCols.includes(c)) {
          if (isHappySquint) ch = "^";
          else if (isBlinking) ch = "-";
        }

        const dx = (c - cx) * scaleX;
        const dy = (r - cy + (r === 0 ? earTwitch : 0) + (r < rows - 1 ? purrBounce : 0)) * scaleY;

        let h = catDef.hue + (r / rows) * 14;
        let s = catDef.sat;
        let l = catDef.light;

        if (r === tpl.eyeRow && tpl.eyeCols.includes(c)) {
          h = catDef.eyeHue;
          s = 100;
          l = 80;
        } else if ((r === 2 && (ch === "^" || ch === "~")) || (r === 3 && ch === "*")) {
          h = catDef.noseHue;
          s = 96;
          l = 76;
        }

        ctx.shadowColor = hsl(h, 92, 68, alpha * 0.45);
        ctx.shadowBlur = Math.min(10, fontPx * 0.44);
        ctx.fillStyle = hsl(h, s, l, alpha);
        ctx.fillText(ch, centerX + dx, centerY + dy);
      }
    }

    if (tpl.tailAnchor) {
      const wagSpeed = catDef.petTimer > 0 ? 11.0 : 4.2;
      const wag = Math.sin(t * wagSpeed + catDef.phase);
      const dir = tpl.tailAnchor.dir;
      const t1x = centerX + (tpl.tailAnchor.dx + wag * 0.35 * dir) * scaleX;
      const t1y = centerY + (tpl.tailAnchor.dy - Math.abs(wag) * 0.3) * scaleY;
      const t2x = centerX + (tpl.tailAnchor.dx + (1.1 + wag * 0.55) * dir) * scaleX;
      const t2y = centerY + (tpl.tailAnchor.dy - 0.9 - wag * 0.35) * scaleY;

      ctx.fillStyle = hsl(catDef.hue + 10, catDef.sat, catDef.light + 4, alpha);
      ctx.fillText(dir < 0 ? (wag > 0 ? "(" : "\\") : (wag > 0 ? ")" : "/"), t1x, t1y);
      ctx.fillText("~", t2x, t2y);
    }

    if (tpl.isSleeper && catDef.petTimer <= 0) {
      for (let z = 0; z < 3; z++) {
        const prog = (t * 0.45 + z * 0.33 + catDef.phase) % 1;
        const zx = centerX + (1.5 + Math.sin(prog * 5 + z) * 0.8 + prog * 1.4) * scaleX;
        const zy = centerY + (-1.8 - prog * 3.8) * scaleY;
        const za = Math.sin(prog * Math.PI) * alpha * 0.88;
        ctx.font = `700 ${(fontPx * 0.78).toFixed(1)}px ${monoFont}`;
        ctx.fillStyle = hsl(278, 92, 84, za);
        ctx.fillText(z % 2 === 0 ? "z" : "Z", zx, zy);
      }
    } else {
      const hProg = (t * 0.38 + catDef.phase * 0.7) % 1;
      const hx = centerX + Math.sin(hProg * 4 + catDef.phase) * 1.1 * scaleX;
      const hy = centerY + (-2.8 - hProg * 4.2) * scaleY;
      const ha = Math.sin(hProg * Math.PI) * alpha * 0.92;
      ctx.font = `700 ${(fontPx * 0.76).toFixed(1)}px ${monoFont}`;
      ctx.fillStyle = hsl(328 + Math.sin(t + catDef.phase) * 20, 96, 80, ha);
      ctx.fillText("<3", hx, hy);
    }

    ctx.restore();
  }

  ns.cats = {
    GARDEN_CATS,
    drawAsciiCat
  };
})();
