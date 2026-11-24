(() => {
  const ns = (window.IlhemGift = window.IlhemGift || {});
  const { GIFT_CONFIG, utils, audio, art, cats } = ns;
  const {
    clamp,
    lerp,
    smoothstep,
    easeInOutCubic,
    easeInOutQuart,
    easeOutCubic,
    easeOutBack,
    hsl
  } = utils;

  // Populate modal text from config
  document.getElementById("noteTitle").textContent = GIFT_CONFIG.noteHeading;
  document.getElementById("noteBody").textContent = GIFT_CONFIG.noteBody;
  document.getElementById("noteSign").textContent = GIFT_CONFIG.noteSignature;

  // DOM References
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  const introOverlay = document.getElementById("introOverlay");
  const btnOpenGift = document.getElementById("btnOpenGift");
  const hud = document.getElementById("hud");
  const btnPlayPause = document.getElementById("btnPlayPause");
  const btnReplay = document.getElementById("btnReplay");
  const btnSound = document.getElementById("btnSound");
  const btnNote = document.getElementById("btnNote");
  const noteModal = document.getElementById("noteModal");
  const btnCloseNote = document.getElementById("btnCloseNote");
  const stagePills = Array.from(document.querySelectorAll(".stage-pill"));
  const topLabel = document.getElementById("topLabel");

  // Ambient stardust & falling petals
  const ambientFireflies = Array.from({ length: 90 }, (_, i) => ({
    x: Math.sin(i * 73.1) * 0.5 * 1.1,
    y: Math.cos(i * 41.7) * 0.5 * 1.1,
    vx: Math.sin(i * 19.3) * 0.015,
    vy: -0.013 - (i % 5) * 0.005,
    ch: ["*", ".", "+", "'", "o", "~"][i % 6],
    hue: [272, 285, 298, 325, 258, 48][i % 6],
    phase: i * 1.17,
    size: 10 + (i % 4) * 2.5
  }));

  const driftingPetals = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 0.137) % 1,
    y: (i * 0.293) % 1,
    speedY: 0.032 + (i % 5) * 0.009,
    swayFreq: 1.2 + (i % 4) * 0.4,
    swayAmp: 0.025 + (i % 3) * 0.01,
    ch: ["*", ",", "'", "~", "."][i % 5],
    hue: [278, 292, 315, 332, 265][i % 5],
    phase: i * 1.7
  }));

  const cursorSparks = [];
  function spawnBurst(x, y, count = 10, includeHearts = false) {
    const glyphs = includeHearts ? ["<3", "*", "+", "~", "o"] : ["*", ".", "+", "~", "o"];
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const spd = 25 + Math.random() * 55;
      cursorSparks.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 24,
        life: 1.0 + Math.random() * 0.35,
        ch: glyphs[Math.floor(Math.random() * glyphs.length)],
        hue: [276, 294, 322, 340, 48][Math.floor(Math.random() * 5)]
      });
    }
  }

  let started = false;
  let animTime = 0;
  let isPlaying = false;
  let lastTs = performance.now();
  let notePulsed = false;

  window.addEventListener("pointermove", (e) => {
    if (!started || Math.random() > 0.45) return;
    cursorSparks.push({
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 38,
      vy: -20 - Math.random() * 32,
      life: 1.0,
      ch: ["*", ".", "+", "~", "<3"][Math.floor(Math.random() * 5)],
      hue: [275, 292, 315, 335, 48][Math.floor(Math.random() * 5)]
    });
  });

  canvas.addEventListener("pointerdown", (e) => {
    if (!started) return;
    let hitCat = false;
    for (const cat of cats.GARDEN_CATS) {
      if (animTime < cat.appearAt) continue;
      const dist = Math.hypot(e.clientX - cat.screenX, e.clientY - cat.screenY);
      if (dist < 46) {
        cat.petTimer = 1.4;
        hitCat = true;
        spawnBurst(cat.screenX, cat.screenY - 12, 12, true);
        audio.playChime(987.77, 1.1, 0.04, 0);
        audio.playChime(1318.51, 1.2, 0.035, 0.08);
      }
    }
    if (!hitCat) {
      spawnBurst(e.clientX, e.clientY, 8, false);
      audio.playChime(659.25 + Math.random() * 350, 0.9, 0.025, 0);
    }
  });

  btnOpenGift.addEventListener("click", () => {
    if (started) return;
    started = true;
    isPlaying = true;
    animTime = 0;
    audio.resetCues();
    audio.ensure();
    introOverlay.classList.add("hidden");
    hud.classList.remove("hidden");
  });

  btnPlayPause.addEventListener("click", () => {
    isPlaying = !isPlaying;
    btnPlayPause.textContent = isPlaying ? "Pause" : "Play";
    btnPlayPause.classList.toggle("active", !isPlaying);
  });

  btnReplay.addEventListener("click", () => {
    animTime = 0;
    audio.resetCues();
    isPlaying = true;
    notePulsed = false;
    btnNote.classList.remove("pulse-note");
    btnPlayPause.textContent = "Pause";
    btnPlayPause.classList.remove("active");
  });

  btnSound.addEventListener("click", () => {
    const next = !audio.isEnabled();
    audio.setEnabled(next);
    btnSound.textContent = next ? "Sound: On" : "Sound: Off";
    btnSound.classList.toggle("active", next);
    if (next) {
      audio.ensure();
      audio.playChime(783.99, 1.0, 0.04, 0);
    }
  });

  btnNote.addEventListener("click", () => {
    noteModal.classList.add("open");
    noteModal.setAttribute("aria-hidden", "false");
    btnNote.classList.remove("pulse-note");
    audio.playChime(783.99, 1.5, 0.035, 0);
    audio.playChime(1046.5, 1.6, 0.035, 0.12);
  });

  btnCloseNote.addEventListener("click", () => {
    noteModal.classList.remove("open");
    noteModal.setAttribute("aria-hidden", "true");
  });

  noteModal.addEventListener("click", (e) => {
    if (e.target === noteModal) {
      noteModal.classList.remove("open");
      noteModal.setAttribute("aria-hidden", "true");
    }
  });

  stagePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const target = parseFloat(pill.dataset.time);
      if (!Number.isNaN(target)) {
        animTime = target;
        audio.syncCuesToTime(target);
      }
    });
  });

  function updateHud(t) {
    let activeIdx = 0;
    if (t >= 15.5) activeIdx = 3;
    else if (t >= 8.0) activeIdx = 2;
    else if (t >= 3.8) activeIdx = 1;

    stagePills.forEach((p, idx) => p.classList.toggle("current", idx === activeIdx));

    if (!started) topLabel.textContent = "a surprise for ilhem";
    else if (t < 3.8) topLabel.textContent = "for ilhem";
    else if (t < 7.8) topLabel.textContent = "look inside your name";
    else if (t < 15.8) topLabel.textContent = "blooming in purple for you";
    else {
      topLabel.textContent = "for ilhem · tap any kitty";
      if (!notePulsed) {
        notePulsed = true;
        btnNote.classList.add("pulse-note");
      }
    }
  }

  function getCamera(t) {
    const zoomInT = easeInOutQuart(smoothstep(3.8, 6.8, t));
    const pullBackT = easeInOutCubic(smoothstep(7.8, 10.8, t));

    const z1 = 1.0;
    const z2 = 9.4;
    const z3 = 4.45;

    const zoom =
      t < 7.8 ? z1 * Math.pow(z2 / z1, zoomInT) : z2 * Math.pow(z3 / z2, pullBackT);

    const targetLeafX = art.ARCH_X;
    const targetLeafY = art.ARCH_Y;
    const targetBouquetX = art.ARCH_X;
    const targetBouquetY = art.ARCH_Y - 1.5;

    let cx = lerp(0, targetLeafX, zoomInT);
    let cy = lerp(0, targetLeafY, zoomInT);

    if (t >= 7.8) {
      cx = lerp(targetLeafX, targetBouquetX, pullBackT);
      cy = lerp(targetLeafY, targetBouquetY, pullBackT);
    }

    return { cx, cy, zoom };
  }

  let viewW = window.innerWidth;
  let viewH = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function render(now) {
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    if (started && isPlaying) {
      animTime += dt;
      audio.checkCues(animTime, started);
    }
    for (const cat of cats.GARDEN_CATS) {
      if (cat.petTimer > 0) cat.petTimer = Math.max(0, cat.petTimer - dt);
    }

    const t = animTime;
    const bgTime = now / 1000;
    updateHud(t);

    const fitScale = clamp(Math.min(viewW / 940, viewH / 650), 0.42, 1.48);
    const cam = getCamera(t);
    const totalScale = cam.zoom * fitScale;

    const toScreenX = (wx) => viewW * 0.5 + (wx - cam.cx) * totalScale;
    const toScreenY = (wy) => viewH * 0.5 + (wy - cam.cy) * totalScale;

    ctx.clearRect(0, 0, viewW, viewH);

    // Animated Purple Aurora Nebula Glow
    const auroraShiftX = Math.sin(bgTime * 0.45) * viewW * 0.08;
    const auroraShiftY = Math.cos(bgTime * 0.38) * viewH * 0.06;
    const glowX = toScreenX(art.ARCH_X) + auroraShiftX * 0.25;
    const glowY = toScreenY(art.ARCH_Y - (t > 8 ? 6 : 0)) + auroraShiftY * 0.25;
    const glowR = Math.max(viewW, viewH) * (t > 8 ? 0.54 : 0.46);
    const bgGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowR);
    if (t < 4.5) {
      bgGrad.addColorStop(0, "rgba(185, 85, 255, 0.24)");
      bgGrad.addColorStop(0.45, "rgba(255, 80, 175, 0.11)");
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else if (t < 8.4) {
      bgGrad.addColorStop(0, "rgba(145, 75, 255, 0.22)");
      bgGrad.addColorStop(0.4, "rgba(65, 235, 165, 0.12)");
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else {
      bgGrad.addColorStop(0, "rgba(195, 95, 255, 0.24)");
      bgGrad.addColorStop(0.48, "rgba(115, 45, 215, 0.13)");
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const monoFont = '"Cascadia Code", "Fira Code", "Consolas", monospace';

    // LAYER A: Purple Stardust
    ctx.save();
    for (const f of ambientFireflies) {
      const px = ((f.x + 0.5 + bgTime * f.vx) % 1 + 1) % 1;
      const py = ((f.y + 0.5 + bgTime * f.vy) % 1 + 1) % 1;
      const sx = px * viewW;
      const sy = py * viewH;
      const twinkle = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(bgTime * 2.6 + f.phase));
      ctx.font = `${f.size}px ${monoFont}`;
      ctx.fillStyle = hsl(f.hue + Math.sin(bgTime + f.phase) * 14, 90, 78, twinkle * 0.72);
      ctx.fillText(f.ch, sx, sy);
    }
    ctx.restore();

    if (!started) {
      requestAnimationFrame(render);
      return;
    }

    // LAYER B: ACT I - "ILHEM" WITH SHIMMER SWEEP & 2 NAME KITTIES
    const nameAlphaGlobal = 1 - smoothstep(4.2, 5.75, t);
    if (nameAlphaGlobal > 0.01) {
      const fontSize = Math.max(4, 17.8 * totalScale);
      ctx.save();

      const auraAppear = smoothstep(0.4, 2.0, t) * nameAlphaGlobal;
      if (auraAppear > 0.01) {
        ctx.font = `600 ${(fontSize * 0.8).toFixed(1)}px ${monoFont}`;
        for (const o of art.nameOrbiters) {
          const ang = o.angle + t * o.speed;
          const sx = toScreenX(Math.cos(ang) * o.rx);
          const sy = toScreenY(Math.sin(ang) * o.ry);
          if (sx < -40 || sx > viewW + 40 || sy < -40 || sy > viewH + 40) continue;
          const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.8 + o.phase));
          ctx.fillStyle = hsl(o.hue, 94, 78, auraAppear * pulse * 0.8);
          ctx.fillText(o.ch, sx, sy);
        }
      }

      ctx.font = `700 ${fontSize.toFixed(1)}px ${monoFont}`;
      const dissolve = smoothstep(4.2, 5.75, t);
      const sweepPos = clamp((t - 2.05) / 1.15, -0.2, 1.2);
      for (const g of art.nameGlyphs) {
        const revealStart = 0.2 + g.progressX * 1.7;
        const charReveal = easeOutCubic(smoothstep(revealStart, revealStart + 0.42, t));
        if (charReveal <= 0.01) continue;

        const enterOffsetY = (1 - charReveal) * 14;
        const idleFloat = Math.sin(t * 2.5 + g.progressX * 6.0) * 2.2 * (1 - dissolve);
        const scatterDist = dissolve * (20 + g.seed * 48);
        const wx = g.wx + Math.cos(g.driftAngle) * scatterDist;
        const wy = g.wy + enterOffsetY + idleFloat + Math.sin(g.driftAngle) * scatterDist;

        const sx = toScreenX(wx);
        const sy = toScreenY(wy);
        if (
          sx < -fontSize * 2 ||
          sx > viewW + fontSize * 2 ||
          sy < -fontSize * 2 ||
          sy > viewH + fontSize * 2
        ) {
          continue;
        }

        const wave = Math.sin(g.progressX * 6.5 - t * 2.6 + g.r * 0.35);
        const beam = Math.exp(-Math.pow((g.progressX - sweepPos) * 9, 2));
        let hue = 272 + g.progressX * 58 + wave * 16;
        const sat = 94;
        let light = 72 + wave * 9 + beam * 18;

        if (g.isStarDot) {
          hue = 48 + Math.sin(t * 3.5) * 12;
          light = 84;
        }

        const alpha = charReveal * nameAlphaGlobal;
        ctx.shadowColor = hsl(hue, 98, 70, alpha * (0.65 + beam * 0.35));
        ctx.shadowBlur = Math.min(24, fontSize * (0.72 + beam * 0.45));
        ctx.fillStyle = hsl(hue, sat, light, alpha);
        ctx.fillText(g.ch, sx, sy);
      }

      const nameCatAlpha = smoothstep(1.3, 2.2, t) * nameAlphaGlobal;
      if (nameCatAlpha > 0.01) {
        const catFont = fontSize * 0.85;
        const catStepX = art.NAME_CELL_W * totalScale * 0.92;
        const catStepY = art.NAME_CELL_H * totalScale * 0.78;
        cats.drawAsciiCat(
          ctx,
          { tpl: "sittingLeft", hue: 280, sat: 86, light: 84, eyeHue: 50, noseHue: 332, phase: 0.5, petTimer: 0 },
          toScreenX(-465),
          toScreenY(35),
          catFont,
          t,
          nameCatAlpha,
          catStepX,
          catStepY
        );
        cats.drawAsciiCat(
          ctx,
          { tpl: "tinyKitten", hue: 315, sat: 88, light: 85, eyeHue: 50, noseHue: 335, phase: 2.1, petTimer: 0 },
          toScreenX(455),
          toScreenY(48),
          catFont,
          t,
          nameCatAlpha,
          catStepX,
          catStepY
        );
      }

      const subAlpha = smoothstep(1.8, 2.7, t) * (1 - smoothstep(3.8, 4.5, t));
      if (subAlpha > 0.01) {
        ctx.shadowBlur = 0;
        ctx.font = `500 ${(13.5 * fitScale).toFixed(1)}px ${monoFont}`;
        ctx.fillStyle = hsl(288, 88, 86, subAlpha * 0.9);
        ctx.fillText("·  look closely inside the middle of your name  ·", toScreenX(0), toScreenY(138));
      }

      ctx.restore();
    }

    // LAYER B2: ZOOM PULSE RING + VORTEX TUNNEL
    const pulseRing = smoothstep(3.2, 3.9, t) * (1 - smoothstep(4.2, 4.9, t));
    if (pulseRing > 0.01) {
      ctx.save();
      const rx = toScreenX(art.ARCH_X);
      const ry = toScreenY(art.ARCH_Y);
      const rad = smoothstep(3.2, 4.9, t) * 85 * totalScale;
      ctx.strokeStyle = hsl(288, 95, 78, pulseRing * 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const vortexAlpha = smoothstep(3.8, 4.6, t) * (1 - smoothstep(5.8, 6.7, t));
    if (vortexAlpha > 0.01) {
      ctx.save();
      const cxScreen = toScreenX(art.ARCH_X);
      const cyScreen = toScreenY(art.ARCH_Y);
      const maxDim = Math.max(viewW, viewH) * 0.65;
      for (const vp of art.zoomVortexParticles) {
        const rProg = (vp.radius + t * vp.speed) % 1;
        const ang = vp.angle + t * 2.2 + rProg * 2.4;
        const dist = rProg * maxDim;
        const sx = cxScreen + Math.cos(ang) * dist;
        const sy = cyScreen + Math.sin(ang) * dist;
        const fade = Math.sin(rProg * Math.PI) * vortexAlpha;
        ctx.font = `700 ${(10 + rProg * 14).toFixed(1)}px ${monoFont}`;
        ctx.fillStyle = hsl(vp.hue, 94, 78, fade * 0.8);
        ctx.fillText(vp.ch, sx, sy);
      }
      ctx.restore();
    }

    // LAYER C: TINY EMERALD-VIOLET BUD INSIDE 'h'
    const budAppear = smoothstep(1.7, 2.8, t);
    const budFade = 1 - smoothstep(4.6, 5.8, t);
    const budAlpha = budAppear * budFade;
    if (budAlpha > 0.01) {
      ctx.save();
      const pulse = 1 + 0.18 * Math.sin(t * 5.2);
      const budSize = Math.max(8, 16 * totalScale * pulse);
      const sx = toScreenX(art.ARCH_X);
      const sy = toScreenY(art.ARCH_Y);
      ctx.font = `700 ${budSize.toFixed(1)}px ${monoFont}`;
      ctx.shadowColor = "rgba(180, 120, 255, 0.92)";
      ctx.shadowBlur = Math.min(26, budSize * 0.95);
      ctx.fillStyle = hsl(148, 92, 68, budAlpha);
      ctx.fillText("*", sx, sy);
      ctx.font = `700 ${(budSize * 0.72).toFixed(1)}px ${monoFont}`;
      ctx.fillStyle = hsl(288, 100, 82, budAlpha * 0.92);
      ctx.fillText("o", sx, sy - budSize * 0.55);
      ctx.restore();
    }

    // LAYER D: BOUQUET SPACE
    const bqFontSize = 2.15 * art.BQ_CELL_W * totalScale;
    const bqToWorldX = (bqX) => art.ARCH_X + bqX * art.BQ_CELL_W;
    const bqToWorldY = (bqY) => art.ARCH_Y + bqY * art.BQ_CELL_H;
    const breezeStrength = smoothstep(6.2, 9.0, t);

    // D1. HERO LEAF
    const leafProgress = smoothstep(4.7, 6.75, t);
    if (leafProgress > 0.01) {
      ctx.save();
      const leafFont = Math.max(3, bqFontSize * 1.15);
      ctx.font = `600 ${leafFont.toFixed(1)}px ${monoFont}`;
      const swayX = Math.sin(t * 1.65) * 0.45 * breezeStrength;

      for (const lc of art.heroLeafCells) {
        const cellFade = easeOutCubic(
          smoothstep(lc.revealAt * 0.72, lc.revealAt * 0.72 + 0.28, leafProgress)
        );
        if (cellFade <= 0.01) continue;

        const curlOffset = (1 - cellFade) * (lc.dx * -0.35);
        const wx = bqToWorldX(lc.dx + curlOffset + swayX * (1 - (lc.dy + 6) / 14));
        const wy = bqToWorldY(lc.dy);
        const sx = toScreenX(wx);
        const sy = toScreenY(wy);

        let h, s, l;
        if (lc.isDew) {
          const sparkle = 0.5 + 0.5 * Math.sin(t * 4.5);
          h = lerp(282, 185, sparkle);
          s = 100;
          l = 84;
        } else if (lc.isVein) {
          h = 102 + Math.sin(t * 2 + lc.dy * 0.3) * 8;
          s = 92;
          l = 68;
        } else {
          h = lerp(140, 156, lc.distFromCenter);
          s = lerp(86, 78, lc.distFromCenter);
          l = lerp(62, 42, lc.distFromCenter);
        }

        ctx.shadowColor = hsl(h, 90, 58, cellFade * 0.45);
        ctx.shadowBlur = Math.min(12, leafFont * 0.45);
        ctx.fillStyle = hsl(h, s, l, cellFade);
        ctx.fillText(lc.ch, sx, sy);
      }
      ctx.restore();
    }

    // D1.5 MOONLIT PURPLE GARDEN FLOOR
    const floorFade = smoothstep(8.6, 11.2, t);
    if (floorFade > 0.01) {
      ctx.save();
      const floorFont = Math.max(3, bqFontSize * 0.95);
      ctx.font = `500 ${floorFont.toFixed(1)}px ${monoFont}`;
      const floorChars = ["~", ".", "*", "-", "~", "."];
      for (let gx = -38; gx <= 38; gx += 2) {
        const sx = toScreenX(bqToWorldX(gx));
        const sy = toScreenY(bqToWorldY(23.7));
        const edgeFade = 1 - smoothstep(26, 39, Math.abs(gx));
        const twinkle = 0.55 + 0.45 * Math.sin(t * 2.0 + gx * 0.4);
        ctx.fillStyle = hsl(
          276 + Math.sin(gx * 0.2) * 18,
          78,
          72,
          floorFade * edgeFade * twinkle * 0.58
        );
        ctx.fillText(floorChars[Math.abs(gx) % floorChars.length], sx, sy);
      }
      ctx.restore();
    }

    // D2. IRIDESCENT PURPLE-CRYSTAL VASE WITH SILK BOW
    const vaseProgress = smoothstep(8.2, 10.6, t);
    if (vaseProgress > 0.01) {
      ctx.save();
      const vaseFont = Math.max(3, bqFontSize * 1.12);
      ctx.font = `600 ${vaseFont.toFixed(1)}px ${monoFont}`;

      for (const vc of art.vaseCells) {
        const rowOrder = 1 - vc.rowNorm;
        const cellFade = easeOutCubic(
          smoothstep(rowOrder * 0.72, rowOrder * 0.72 + 0.28, vaseProgress)
        );
        if (cellFade <= 0.01) continue;

        let ch = vc.ch;
        let h = 272;
        let s = 86;
        let l = 68;

        if (vc.isWater) {
          const wave = Math.sin(t * 3.4 + vc.bqX * 0.7 + vc.bqY);
          ch = wave > 0.25 ? "~" : wave < -0.5 ? "-" : "~";
          h = 258 + wave * 18;
          s = 92;
          l = 70 + wave * 8;
        } else if (vc.isRibbon) {
          h = 335 + Math.sin(t * 2 + vc.bqX * 0.3) * 12;
          s = 94;
          l = 78;
        } else if (vc.isRim) {
          h = 295 + vc.colNorm * 45;
          s = 88;
          l = 80;
        } else if (vc.isInnerStem) {
          h = 148;
          s = 78;
          l = 48;
        } else if (vc.isHighlight) {
          h = 285;
          s = 96;
          l = 84;
        } else if (vc.isShimmer) {
          const shimmer = 0.5 + 0.5 * Math.sin(t * 2.8 + vc.bqX * 0.4 + vc.bqY * 0.5);
          h = lerp(266, 305, vc.colNorm);
          s = 84;
          l = 56 + shimmer * 20;
        } else {
          h = lerp(265, 295, vc.colNorm);
          s = 86;
          l = 66;
        }

        const sx = toScreenX(bqToWorldX(vc.bqX));
        const sy = toScreenY(bqToWorldY(vc.bqY));
        ctx.shadowColor = hsl(h, 92, 66, cellFade * 0.42);
        ctx.shadowBlur = Math.min(11, vaseFont * 0.42);
        ctx.fillStyle = hsl(h, s, l, cellFade);
        ctx.fillText(ch, sx, sy);
      }
      ctx.restore();
    }

    // D3. STEMS, FOLIAGE & 18 BLOSSOMS
    if (t >= 8.5) {
      ctx.save();
      const bqFont = Math.max(3, bqFontSize * 1.12);
      ctx.font = `600 ${bqFont.toFixed(1)}px ${monoFont}`;

      for (const fl of art.FLOWERS) {
        const stemProg = easeOutCubic(smoothstep(fl.stemStart, fl.stemStart + fl.stemDur, t));
        if (stemProg <= 0.01) continue;

        const sway = Math.sin(t * 1.65 + fl.swayPhase) * fl.swayAmp * breezeStrength;

        for (const sc of fl.stemCells) {
          if (sc.t > stemProg) continue;
          const fade = smoothstep(sc.t, sc.t + 0.08, stemProg);
          const tipSway = sway * Math.pow(sc.t, 1.4);
          const sx = toScreenX(bqToWorldX(sc.gx + tipSway));
          const sy = toScreenY(bqToWorldY(sc.gy));
          ctx.shadowBlur = 0;
          ctx.fillStyle = hsl(sc.hue, 80, sc.light, fade);
          ctx.fillText(sc.ch, sx, sy);
        }

        for (const sl of fl.leafCells) {
          if (stemProg < sl.t + 0.1) continue;
          const lFade = easeOutBack(clamp((stemProg - (sl.t + 0.1)) / 0.25));
          const tipSway = sway * Math.pow(sl.t, 1.4);
          const sx = toScreenX(bqToWorldX(sl.gx + tipSway));
          const sy = toScreenY(bqToWorldY(sl.gy));
          ctx.fillStyle = hsl(sl.hue, 85, sl.light, clamp(lFade));
          ctx.fillText(sl.ch, sx, sy);
        }
      }

      for (const fl of art.FLOWERS) {
        const rawBloom = clamp((t - fl.bloomStart) / fl.bloomDur);
        if (rawBloom <= 0.005) continue;

        const sway = Math.sin(t * 1.65 + fl.swayPhase) * fl.swayAmp * breezeStrength;
        const bobY = Math.cos(t * 1.9 + fl.swayPhase) * 0.24 * breezeStrength;
        const openEase = easeOutBack(rawBloom);
        const petalScale = lerp(0.28, 1.0, clamp(openEase, 0, 1.08));

        const centerX = fl.tx + sway;
        const centerY = fl.ty + bobY;

        const haloX = toScreenX(bqToWorldX(centerX));
        const haloY = toScreenY(bqToWorldY(centerY));
        const haloR = bqFont * (fl.type === "royalPeony" ? 5.2 : 3.4);
        const firstCol = fl.blossomCells[0];
        if (firstCol) {
          const halo = ctx.createRadialGradient(haloX, haloY, 0, haloX, haloY, haloR);
          halo.addColorStop(0, hsl(firstCol.h, 96, 68, rawBloom * 0.22));
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = halo;
          ctx.fillRect(haloX - haloR, haloY - haloR, haloR * 2, haloR * 2);
        }

        ctx.font = `700 ${bqFont.toFixed(1)}px ${monoFont}`;
        for (const bc of fl.blossomCells) {
          const cellReveal = clamp((rawBloom - bc.dist * 0.45) / 0.55);
          if (cellReveal <= 0.01) continue;

          const bx = centerX + bc.dx * petalScale;
          const by = centerY + bc.dy * petalScale;
          const sx = toScreenX(bqToWorldX(bx));
          const sy = toScreenY(bqToWorldY(by));

          const shimmer = Math.sin(t * 2.6 + fl.swayPhase + bc.dx * 0.5) * 6;
          ctx.shadowColor = hsl(bc.h, bc.s, bc.l, cellReveal * 0.56);
          ctx.shadowBlur = Math.min(13, bqFont * 0.52);
          ctx.fillStyle = hsl(bc.h, bc.s, bc.l + shimmer, easeOutCubic(cellReveal));
          ctx.fillText(bc.ch, sx, sy);
        }
      }
      ctx.restore();
    }

    // D4. 6 ANIMATED INTERACTIVE CATS AROUND THE VASE
    if (t >= 11.2) {
      const catFont = Math.max(3, bqFontSize * 1.1);
      const stepX = art.BQ_CELL_W * totalScale;
      const stepY = art.BQ_CELL_H * totalScale;
      for (const cat of cats.GARDEN_CATS) {
        const catProg = smoothstep(cat.appearAt, cat.appearAt + 0.9, t);
        if (catProg <= 0.01) continue;
        const popY = (1 - easeOutBack(catProg)) * 3.5;
        cats.drawAsciiCat(
          ctx,
          cat,
          toScreenX(bqToWorldX(cat.bqX)),
          toScreenY(bqToWorldY(cat.bqY + popY)),
          catFont,
          t,
          catProg,
          stepX,
          stepY
        );
      }
    }

    // D4.5 FLUTTERING ASCII BUTTERFLIES
    ctx.save();
    for (const bf of art.BUTTERFLIES) {
      const bfAlpha = smoothstep(bf.appearAt, bf.appearAt + 1.2, t);
      if (bfAlpha <= 0.01) continue;
      const bx = bf.cx + Math.cos(t * bf.speed + bf.phase) * bf.rx;
      const by = bf.cy + Math.sin(t * bf.speed * 1.7 + bf.phase) * bf.ry;
      const flap = Math.sin(t * 14 + bf.phase) > 0;
      const wingGlyph = flap ? "~*~" : "\\*/";
      const bfFont = Math.max(8, bqFontSize * 1.15);
      ctx.font = `700 ${bfFont.toFixed(1)}px ${monoFont}`;
      ctx.shadowColor = hsl(bf.hue, 98, 72, bfAlpha * 0.7);
      ctx.shadowBlur = 12;
      ctx.fillStyle = hsl(bf.hue, 96, 82, bfAlpha);
      ctx.fillText(wingGlyph, toScreenX(bqToWorldX(bx)), toScreenY(bqToWorldY(by)));
    }
    ctx.restore();

    // D5. GENTLE FALLING PURPLE PETALS
    const petalLayerAlpha = smoothstep(11.0, 14.0, t);
    if (petalLayerAlpha > 0.01) {
      ctx.save();
      ctx.font = `600 13px ${monoFont}`;
      for (const p of driftingPetals) {
        const py = (p.y + t * p.speedY) % 1;
        const px = ((p.x + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp) % 1 + 1) % 1;
        const alpha = Math.sin(py * Math.PI) * petalLayerAlpha * 0.7;
        ctx.fillStyle = hsl(p.hue, 92, 78, alpha);
        ctx.fillText(p.ch, px * viewW, py * viewH);
      }
      ctx.restore();
    }

    // LAYER E: FINALE DEDICATION UNDER THE VASE
    const finaleAlpha = smoothstep(15.2, 16.8, t);
    if (finaleAlpha > 0.01) {
      ctx.save();
      const msgY = toScreenY(bqToWorldY(26.6));
      const msgX = toScreenX(bqToWorldX(0));
      const titleSize = Math.max(13, 18.5 * fitScale);
      const subSize = Math.max(10, 12.5 * fitScale);

      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(215, 115, 255, 0.75)";
      ctx.shadowBlur = 16;
      ctx.font = `700 ${titleSize.toFixed(1)}px ${monoFont}`;
      ctx.fillStyle = hsl(288 + Math.sin(t * 1.6) * 18, 94, 83, finaleAlpha);
      ctx.fillText(GIFT_CONFIG.finaleTitle, msgX, msgY);

      ctx.shadowBlur = 0;
      ctx.font = `400 ${subSize.toFixed(1)}px ${monoFont}`;
      ctx.fillStyle = hsl(295, 78, 89, finaleAlpha * 0.9);
      ctx.fillText(GIFT_CONFIG.finaleSubtitle, msgX, msgY + titleSize * 1.45);
      ctx.restore();
    }

    // LAYER F: INTERACTIVE SPARKLES & HEART BURSTS
    if (cursorSparks.length > 0) {
      ctx.save();
      ctx.font = `700 13px ${monoFont}`;
      for (let i = cursorSparks.length - 1; i >= 0; i--) {
        const s = cursorSparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 22 * dt;
        s.life -= dt * 1.05;
        if (s.life <= 0) {
          cursorSparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = hsl(s.hue, 96, 82, clamp(s.life) * 0.92);
        ctx.fillText(s.ch, s.x, s.y);
      }
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
