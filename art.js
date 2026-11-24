(() => {
  const ns = (window.IlhemGift = window.IlhemGift || {});
  const { clamp, lerp } = ns.utils;

  const NAME_CELL_W = 11.4;
  const NAME_CELL_H = 19.2;

  const ILHEM_ART = [
    ".---.   .--.   .--.                                                     ",
    "( * )   |  |   |  |                                                     ",
    " `-'    |  |   |  |                                                     ",
    ".---.   |  |   |  | .------.      .-------.    .--. .-----. .-----.     ",
    "|   |   |  |   |  |'  ____  \\    /   ___   \\   |   \\' ___ \\'  ___  \\    ",
    "|   |   |  |   |  |  /    \\  \\  |   (___)   |  |  |  /   \\ V /   \\  \\   ",
    "|   |   |  |   |  | /      |  | |   _______/   |  | /   |  |     |  |   ",
    "|   |   |  |   |  |        |  | |  |           |  |     |  |     |  |   ",
    "|   |   |  |   |  |        |  |  \\  \\______.   |  |     |  |     |  |   ",
    "`---'   `--'   `--'        `--'   `--------'   `--'     `--'     `--'   "
  ];

  const NAME_ROWS = ILHEM_ART.length;
  const NAME_COLS = Math.max(...ILHEM_ART.map((l) => l.length));
  const NAME_CX = (NAME_COLS - 1) / 2;
  const NAME_CY = (NAME_ROWS - 1) / 2;

  // Center of the 'h' arch (zoom target)
  const ARCH_X = (22.5 - NAME_CX) * NAME_CELL_W;
  const ARCH_Y = (7.4 - NAME_CY) * NAME_CELL_H;

  const BQ_CELL_W = 1.45;
  const BQ_CELL_H = 2.25;
  const VASE_TOP_Y = 9;

  const nameGlyphs = [];
  for (let r = 0; r < NAME_ROWS; r++) {
    const line = ILHEM_ART[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === " ") continue;
      const wx = (c - NAME_CX) * NAME_CELL_W;
      const wy = (r - NAME_CY) * NAME_CELL_H;
      nameGlyphs.push({
        r,
        c,
        ch,
        wx,
        wy,
        isStarDot: r === 1 && c === 2,
        progressX: c / NAME_COLS,
        driftAngle: Math.atan2(wy - ARCH_Y, wx - ARCH_X),
        seed: Math.sin(r * 19.1 + c * 37.3) * 0.5 + 0.5
      });
    }
  }

  const nameOrbiters = Array.from({ length: 68 }, (_, i) => ({
    angle: (i / 68) * Math.PI * 2,
    rx: 435 + ((i * 29) % 130),
    ry: 138 + ((i * 23) % 68),
    speed: (i % 2 === 0 ? 1 : -1) * (0.14 + (i % 5) * 0.045),
    ch: ["*", "+", ".", "~", "o", "'"][i % 6],
    hue: [275, 290, 315, 260, 338, 46][i % 6],
    phase: i * 0.9
  }));

  const zoomVortexParticles = Array.from({ length: 76 }, (_, i) => ({
    angle: (i / 76) * Math.PI * 2 + (i % 4) * 0.2,
    radius: 0.12 + ((i * 0.17) % 0.88),
    speed: 0.72 + (i % 5) * 0.25,
    ch: ["*", "~", "+", ".", "o", "/"][i % 6],
    hue: [278, 295, 318, 262, 150, 48][i % 6]
  }));

  const HERO_LEAF_ART = [
    "        /|        ",
    "       / |        ",
    "     .'  | '.     ",
    "    / \\  | / \\    ",
    "   / . \\.|/ . \\   ",
    "  ;  \\   |   / ;  ",
    " ; .  \\  |  / . ; ",
    " |  \\  \\ | / /  | ",
    " ;   \\  \\|/ /   ; ",
    "  ;   \\  | /   ;  ",
    "   \\   \\ |/   /   ",
    "    '.  \\|  .'    ",
    "      '._|_.'     "
  ];

  const heroLeafCells = [];
  {
    const rows = HERO_LEAF_ART.length;
    const cols = HERO_LEAF_ART[0].length;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = HERO_LEAF_ART[r][c];
        if (ch === " ") continue;
        const dx = c - cx;
        const dy = r - cy;
        heroLeafCells.push({
          dx,
          dy,
          ch,
          isVein: Math.abs(dx) < 1.1 || ((ch === "\\" || ch === "/") && Math.abs(dx) < 3.5),
          isDew: r === 4 && c === 12,
          distFromCenter: Math.hypot(dx / 8, dy / 6),
          revealAt: clamp((1 - r / rows) * 0.45 + (Math.abs(dx) / 14) * 0.55, 0, 1)
        });
      }
    }
  }

  const VASE_ART = [
    "    .================.    ",
    "   (~~~~~~~~~~~~~~~~~~)   ",
    "    \\  .-.  ()  .-.  /    ",
    "     ) '._.-''-._.' (     ",
    "    /  .::::::::::.  \\    ",
    "   /  :~~~::~~::~~~:  \\   ",
    "  |  |    | || |    |  |  ",
    "  |  |    \\ || /    |  |  ",
    "  |   \\    \\||/    /   |  ",
    "   \\   \\    ||    /   /   ",
    "    \\   `---||---'   /    ",
    "     '._____||_____.'     ",
    "      (____________)      "
  ];

  const vaseCells = [];
  {
    const rows = VASE_ART.length;
    const cols = VASE_ART[0].length;
    const cx = (cols - 1) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = VASE_ART[r][c];
        if (ch === " ") continue;
        const bqX = c - cx;
        const bqY = VASE_TOP_Y + r;
        const isRibbon = (r === 2 || r === 3) && Math.abs(bqX) <= 7.5;
        vaseCells.push({
          bqX,
          bqY,
          ch,
          isRim: r === 0,
          isWater: ch === "~",
          isRibbon,
          isHighlight: !isRibbon && c < 7 && (ch === "(" || ch === "/" || ch === "|" || ch === "\\"),
          isInnerStem:
            r >= 6 && r <= 11 && Math.abs(bqX) <= 3 && (ch === "|" || ch === "\\" || ch === "/"),
          isShimmer: ch === ":" || ch === ".",
          rowNorm: r / (rows - 1),
          colNorm: c / (cols - 1)
        });
      }
    }
  }

  const FLOWER_TEMPLATES = {
    royalPeony: {
      art: [
        "    _..---.._    ",
        "  .' / .-. \\ '.  ",
        " /  ( ( @ ) )  \\ ",
        "|  ( \\ `-' / )  |",
        " \\  '. ___ .'  / ",
        "  '.  `---'  .'  ",
        "    `--...--'    "
      ],
      colorFn: (ch, dx, dy, dist) => {
        if (ch === "@" || (ch === "`" && Math.abs(dx) < 2)) return { h: 48, s: 100, l: 78 };
        if (dist < 0.45) return { h: 300, s: 95, l: 76 };
        if (dist < 0.78) return { h: 282, s: 90, l: 66 };
        return { h: 268, s: 88, l: 55 };
      }
    },
    lavenderTulip: {
      art: [
        "  /\\ /\\ /\\  ",
        " /  V  V  \\ ",
        "|  ( ** )  |",
        " \\  \\  /  / ",
        "  '. \\/ .'  ",
        "    `--'    "
      ],
      colorFn: (ch, dx, dy) => {
        if (ch === "*") return { h: 52, s: 100, l: 78 };
        if (dy < 0) return { h: 276, s: 94, l: 82 };
        if (dy < 1.2) return { h: 270, s: 88, l: 67 };
        return { h: 262, s: 84, l: 55 };
      }
    },
    amethystStar: {
      art: [
        "   \\  |  /   ",
        " '. \\ | / .' ",
        "-- ( (@) ) --",
        " .' / | \\ '. ",
        "   /  |  \\   "
      ],
      colorFn: (ch, dx, dy, dist) => {
        if (ch === "@") return { h: 48, s: 100, l: 78 };
        if (dist < 0.5) return { h: 294, s: 96, l: 76 };
        return { h: 274, s: 92, l: 70 };
      }
    },
    sunburst: {
      art: [
        "   \\  |  /   ",
        " '. \\ | / .' ",
        "-- ( (@) ) --",
        " .' / | \\ '. ",
        "   /  |  \\   "
      ],
      colorFn: (ch, dx, dy, dist) => {
        if (ch === "@") return { h: 318, s: 92, l: 65 };
        if (dist < 0.5) return { h: 46, s: 100, l: 70 };
        return { h: 50, s: 98, l: 76 };
      }
    },
    orchid: {
      art: [
        "  .---.  ",
        " ( \\*/ ) ",
        "( * @ * )",
        " ( / \\ ) ",
        "  `---'  "
      ],
      colorFn: (ch) => {
        if (ch === "@") return { h: 48, s: 100, l: 78 };
        if (ch === "*") return { h: 296, s: 100, l: 84 };
        return { h: 286, s: 92, l: 68 };
      }
    },
    rosePink: {
      art: [
        "  .---.  ",
        " ( \\*/ ) ",
        "( * @ * )",
        " ( / \\ ) ",
        "  `---'  "
      ],
      colorFn: (ch) => {
        if (ch === "@") return { h: 48, s: 100, l: 78 };
        if (ch === "*") return { h: 325, s: 100, l: 84 };
        return { h: 332, s: 94, l: 68 };
      }
    },
    periwinkle: {
      art: [
        "  .---.  ",
        " ( \\*/ ) ",
        "( * @ * )",
        " ( / \\ ) ",
        "  `---'  "
      ],
      colorFn: (ch) => {
        if (ch === "@") return { h: 52, s: 100, l: 78 };
        if (ch === "*") return { h: 245, s: 98, l: 84 };
        return { h: 252, s: 90, l: 72 };
      }
    },
    lilacSpray: {
      art: [
        " .*. ",
        "*(o)*",
        " '*' "
      ],
      colorFn: (ch) => {
        if (ch === "o") return { h: 48, s: 96, l: 86 };
        return { h: 282, s: 88, l: 86 };
      }
    }
  };

  const FLOWERS = [
    { type: "royalPeony", sx: 0, sy: VASE_TOP_Y + 2, cx: 0.4, cy: -4, tx: 0, ty: -16, stemStart: 8.6, stemDur: 2.1, bloomStart: 10.5, bloomDur: 1.8, isCenterHero: true, swayAmp: 0.55, swayPhase: 0.0 },
    { type: "amethystStar", sx: -1.5, sy: VASE_TOP_Y + 2, cx: -8, cy: -2, tx: -16, ty: -15, stemStart: 8.9, stemDur: 2.0, bloomStart: 11.0, bloomDur: 1.5, sideLeaf: { t: 0.58, dir: -1 }, swayAmp: 0.85, swayPhase: 1.1 },
    { type: "lavenderTulip", sx: 1.5, sy: VASE_TOP_Y + 2, cx: 8, cy: -3, tx: 16, ty: -15, stemStart: 9.0, stemDur: 2.0, bloomStart: 11.2, bloomDur: 1.5, sideLeaf: { t: 0.56, dir: 1 }, swayAmp: 0.85, swayPhase: 2.2 },
    { type: "lavenderTulip", sx: -1, sy: VASE_TOP_Y + 2, cx: -5, cy: -8, tx: -9, ty: -23.5, stemStart: 9.2, stemDur: 2.1, bloomStart: 11.6, bloomDur: 1.4, swayAmp: 1.0, swayPhase: 0.7 },
    { type: "sunburst", sx: 1, sy: VASE_TOP_Y + 2, cx: 5, cy: -8, tx: 9.5, ty: -23.5, stemStart: 9.3, stemDur: 2.1, bloomStart: 11.8, bloomDur: 1.4, swayAmp: 1.0, swayPhase: 3.1 },
    { type: "orchid", sx: -2.2, sy: VASE_TOP_Y + 2, cx: -14, cy: 2, tx: -23, ty: -6.5, stemStart: 9.5, stemDur: 1.9, bloomStart: 12.1, bloomDur: 1.3, sideLeaf: { t: 0.48, dir: -1 }, swayAmp: 1.05, swayPhase: 4.0 },
    { type: "periwinkle", sx: 2.2, sy: VASE_TOP_Y + 2, cx: 14, cy: 2, tx: 23, ty: -6.5, stemStart: 9.6, stemDur: 1.9, bloomStart: 12.3, bloomDur: 1.3, sideLeaf: { t: 0.48, dir: 1 }, swayAmp: 1.05, swayPhase: 1.9 },
    { type: "periwinkle", sx: -2.5, sy: VASE_TOP_Y + 2, cx: -12, cy: 6, tx: -18, ty: 3, stemStart: 9.8, stemDur: 1.7, bloomStart: 12.7, bloomDur: 1.2, swayAmp: 0.75, swayPhase: 2.7 },
    { type: "rosePink", sx: 2.5, sy: VASE_TOP_Y + 2, cx: 12, cy: 6, tx: 18, ty: 3, stemStart: 9.9, stemDur: 1.7, bloomStart: 12.9, bloomDur: 1.2, swayAmp: 0.75, swayPhase: 4.8 },
    { type: "rosePink", sx: -0.8, sy: VASE_TOP_Y + 2, cx: -7, cy: 1, tx: -10.5, ty: -6.5, stemStart: 10.0, stemDur: 1.8, bloomStart: 13.1, bloomDur: 1.2, swayAmp: 0.65, swayPhase: 3.4 },
    { type: "orchid", sx: 0.8, sy: VASE_TOP_Y + 2, cx: 7, cy: 1, tx: 10.5, ty: -6.5, stemStart: 10.1, stemDur: 1.8, bloomStart: 13.3, bloomDur: 1.2, swayAmp: 0.65, swayPhase: 5.1 },
    { type: "amethystStar", sx: 0, sy: VASE_TOP_Y + 2, cx: 0.5, cy: -14, tx: 0.2, ty: -27, stemStart: 10.2, stemDur: 2.1, bloomStart: 13.5, bloomDur: 1.3, swayAmp: 1.15, swayPhase: 1.4 },
    { type: "lilacSpray", sx: -1.8, sy: VASE_TOP_Y + 2, cx: -14, cy: -5, tx: -24, ty: -15.5, stemStart: 10.4, stemDur: 1.9, bloomStart: 13.7, bloomDur: 1.0, swayAmp: 1.2, swayPhase: 2.5 },
    { type: "lilacSpray", sx: 1.8, sy: VASE_TOP_Y + 2, cx: 14, cy: -5, tx: 24, ty: -15.5, stemStart: 10.5, stemDur: 1.9, bloomStart: 13.9, bloomDur: 1.0, swayAmp: 1.2, swayPhase: 4.3 },
    { type: "lilacSpray", sx: -0.6, sy: VASE_TOP_Y + 2, cx: -5, cy: -10, tx: -16, ty: -23, stemStart: 10.6, stemDur: 1.9, bloomStart: 14.1, bloomDur: 1.0, swayAmp: 1.15, swayPhase: 0.3 },
    { type: "lilacSpray", sx: 0.6, sy: VASE_TOP_Y + 2, cx: 5, cy: -10, tx: 16, ty: -23, stemStart: 10.7, stemDur: 1.9, bloomStart: 14.2, bloomDur: 1.0, swayAmp: 1.15, swayPhase: 3.6 },
    { type: "lilacSpray", sx: 0.5, sy: VASE_TOP_Y + 2, cx: 6, cy: -1, tx: 11, ty: 4.5, stemStart: 10.8, stemDur: 1.6, bloomStart: 14.4, bloomDur: 1.0, swayAmp: 0.8, swayPhase: 1.6 },
    { type: "lilacSpray", sx: -0.5, sy: VASE_TOP_Y + 2, cx: -6, cy: -1, tx: -11, ty: 4.5, stemStart: 10.9, stemDur: 1.6, bloomStart: 14.5, bloomDur: 1.0, swayAmp: 0.8, swayPhase: 3.8 }
  ];

  function quadBezier(p0, p1, p2, t) {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
    };
  }

  function quadTangent(p0, p1, p2, t) {
    return {
      x: 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
      y: 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
    };
  }

  const SMALL_LEAF_LEFT = [" .-'/", "(__/ "];
  const SMALL_LEAF_RIGHT = ["\\`-. ", " \\__)"];

  for (const fl of FLOWERS) {
    const p0 = { x: fl.sx, y: fl.sy };
    const p1 = { x: fl.cx, y: fl.cy };
    const p2 = { x: fl.tx, y: fl.ty };

    const stemMap = new Map();
    const steps = 65;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = quadBezier(p0, p1, p2, t);
      const tan = quadTangent(p0, p1, p2, t);
      const gx = Math.round(pt.x);
      const gy = Math.round(pt.y);
      if (fl.isCenterHero && Math.abs(gx) <= 3 && gy >= -5 && gy <= 5) continue;
      const key = `${gx},${gy}`;
      if (!stemMap.has(key)) {
        let ch = "|";
        if (tan.y < 0) {
          if (tan.x > Math.abs(tan.y) * 0.38) ch = "/";
          else if (tan.x < -Math.abs(tan.y) * 0.38) ch = "\\";
        }
        stemMap.set(key, {
          gx,
          gy,
          t,
          ch,
          hue: lerp(142, 160, t),
          light: lerp(42, 58, t)
        });
      }
    }
    fl.stemCells = Array.from(stemMap.values());

    fl.leafCells = [];
    if (fl.sideLeaf) {
      const pt = quadBezier(p0, p1, p2, fl.sideLeaf.t);
      const art = fl.sideLeaf.dir < 0 ? SMALL_LEAF_LEFT : SMALL_LEAF_RIGHT;
      for (let r = 0; r < art.length; r++) {
        for (let c = 0; c < art[r].length; c++) {
          const ch = art[r][c];
          if (ch === " ") continue;
          const ox = fl.sideLeaf.dir < 0 ? c - art[r].length : c + 1;
          fl.leafCells.push({
            gx: Math.round(pt.x) + ox,
            gy: Math.round(pt.y) + r - 1,
            ch,
            t: fl.sideLeaf.t,
            hue: 145 + c * 3,
            light: 54 + (r === 0 ? 10 : 0)
          });
        }
      }
    }

    const tpl = FLOWER_TEMPLATES[fl.type];
    const rows = tpl.art.length;
    const cols = tpl.art[0].length;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const maxR = Math.hypot(cx, cy) || 1;
    fl.blossomCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = tpl.art[r][c];
        if (ch === " ") continue;
        const dx = c - cx;
        const dy = r - cy;
        const dist = Math.hypot(dx / (cx || 1), dy / (cy || 1));
        const col = tpl.colorFn(ch, dx, dy, Math.min(1, dist));
        fl.blossomCells.push({
          dx,
          dy,
          ch,
          dist: clamp(Math.hypot(dx, dy) / maxR, 0, 1),
          h: col.h,
          s: col.s,
          l: col.l
        });
      }
    }
  }

  const BUTTERFLIES = [
    { cx: -14, cy: -20, rx: 10, ry: 5, speed: 0.75, hue: 288, phase: 0.4, appearAt: 12.8 },
    { cx: 14, cy: -18, rx: 11, ry: 6, speed: 0.65, hue: 332, phase: 2.8, appearAt: 13.6 }
  ];

  ns.art = {
    NAME_CELL_W,
    NAME_CELL_H,
    ARCH_X,
    ARCH_Y,
    BQ_CELL_W,
    BQ_CELL_H,
    VASE_TOP_Y,
    nameGlyphs,
    nameOrbiters,
    zoomVortexParticles,
    heroLeafCells,
    vaseCells,
    FLOWERS,
    BUTTERFLIES
  };
})();
