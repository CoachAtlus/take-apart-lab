/* Take-Apart Lab: engine (v2).
 * Devices live in js/devices/*.js and call TAL.registerDevice({...}). See README.md for the format.
 * Uses three.js r128 as a plain global (THREE), so it runs from file:// with no build step. */
(function () {
  'use strict';
  const THREE = window.THREE;
  const TAL = (window.TAL = window.TAL || {});
  TAL.devices = TAL.devices || [];
  TAL.registerDevice = (d) => TAL.devices.push(d);
  // Worlds: zoomed-in scenes inside a part (an LED, a chip, a battery...). Same format as a device.
  TAL.worlds = TAL.worlds || {};
  TAL.registerWorld = (d) => { TAL.worlds[d.id] = d; };
  TAL.insideByName = TAL.insideByName || {}; // part name -> world id

  // ---------------------------------------------------------------- utils
  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
  };
  const lower = (n) => (/^[A-Z]{2}/.test(n) ? n : n.charAt(0).toLowerCase() + n.slice(1));
  const uniq = (a) => [...new Set(a)];
  function nameList(parts) {
    const counts = new Map();
    parts.forEach((p) => counts.set(p.name, (counts.get(p.name) || 0) + 1));
    const items = [...counts].map(([n, c]) => (c > 1 ? `${c} ${lower(n)}${n.endsWith('s') ? '' : 's'}` : lower(n)));
    return items.length > 1 ? items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1] : items[0];
  }

  // ---------------------------------------------------------------- kit (building blocks for devices)
  function makeKit() {
    const k = { THREE, rng };
    const asMat = (m) => (m && m.isMaterial ? m : k.mat(m === undefined ? 0x888888 : m));
    k.mat = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0.05 }, o || {}));
    k.metal = (color, o) => k.mat(color, Object.assign({ metalness: 0.8, roughness: 0.32 }, o || {}));
    k.glass = (color, opacity, o) =>
      k.mat(color, Object.assign({ transparent: true, opacity: opacity == null ? 0.35 : opacity, roughness: 0.08, metalness: 0.2, depthWrite: false }, o || {}));
    // A material whose glow the device controls (LEDs, bulbs). Hover highlight leaves it alone.
    k.glow = (color, emissive) => {
      const m = k.mat(color, { emissive: emissive == null ? color : emissive, emissiveIntensity: 0 });
      m.userData.selfLit = true;
      return m;
    };
    k.mesh = (geo, m) => new THREE.Mesh(geo, asMat(m));
    k.box = (w, h, d, m) => k.mesh(new THREE.BoxGeometry(w, h, d), m);
    k.cyl = (rt, rb, h, m, seg, open) => k.mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 24, 1, !!open), m);
    k.sphere = (r, m, seg) => k.mesh(new THREE.SphereGeometry(r, seg || 20, Math.max(8, ((seg || 20) * 0.75) | 0)), m);
    k.torus = (R, r, m, seg) => k.mesh(new THREE.TorusGeometry(R, r, 10, seg || 32), m);
    k.plane = (w, h, m) => k.mesh(new THREE.PlaneGeometry(w, h), m);
    k.group = (...kids) => { const g = new THREE.Group(); kids.forEach((c) => c && g.add(c)); return g; };
    k.at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
    k.rot = (o, x, y, z) => { o.rotation.set(x || 0, y || 0, z || 0); return o; };
    k.tube = (pts, r, m, closed) => {
      const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
      return k.mesh(new THREE.TubeGeometry(c, Math.max(24, pts.length * 12), r, 10, !!closed), m);
    };
    k.canvasTex = (pxW, pxH, draw) => {
      const cv = document.createElement('canvas');
      cv.width = pxW; cv.height = pxH;
      draw(cv.getContext('2d'), pxW, pxH);
      const tex = new THREE.CanvasTexture(cv);
      tex.encoding = THREE.sRGBEncoding;
      return tex;
    };
    // Circuit board lying in the XZ plane, parts on top (+Y). Rotate the returned group to stand it up.
    k.board = (w, d, opts) => {
      opts = opts || {};
      const r = rng(opts.seed || 7);
      const g = k.group(k.box(w, 0.05, d, k.mat(opts.color || 0x2f7d4a, { roughness: 0.7 })));
      const n = opts.count == null ? Math.round(w * d * 12) : opts.count;
      const capColors = [0x2a4fbf, 0x1d1d1d, 0x7a3fb0, 0x2e8b57, 0x1b6fa8];
      for (let i = 0; i < n; i++) {
        const x = (r() - 0.5) * (w - 0.18), z = (r() - 0.5) * (d - 0.18), kind = r();
        let p;
        if (kind < 0.28) { const s = 0.12 + r() * 0.22; p = k.box(s, 0.05, s * (0.6 + r() * 0.6), 0x18181b); p.position.y = 0.05; }
        else if (kind < 0.58) { const rr = 0.03 + r() * 0.06, hh = 0.08 + r() * 0.22; p = k.cyl(rr, rr, hh, capColors[(r() * capColors.length) | 0], 14); p.position.y = 0.025 + hh / 2; }
        else if (kind < 0.85) { p = k.cyl(0.018, 0.018, 0.13, 0xd9b38c, 8); p.rotation.set(0, r() * Math.PI, Math.PI / 2); p.position.y = 0.05; }
        else { p = k.box(0.05, 0.12, 0.05, 0xc8c8c8); p.position.y = 0.085; }
        p.position.x = x; p.position.z = z;
        g.add(p);
      }
      return g;
    };
    // Printed-circuit look: copper traces, pads and white labels, drawn on a canvas.
    k.pcbTexture = (w, h, seed, base) => k.canvasTex(512, Math.max(64, Math.round((512 * h) / w)), (c, W, H) => {
      const r = rng(seed || 1);
      c.fillStyle = base || '#2f7d4a'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(214,170,80,0.55)'; c.lineCap = 'round';
      for (let i = 0; i < 70; i++) {
        c.lineWidth = 1.5 + r() * 3;
        let x = r() * W, y = r() * H;
        c.beginPath(); c.moveTo(x, y);
        for (let s = 0; s < 4; s++) { if (r() < 0.5) x += (r() - 0.5) * 160; else y += (r() - 0.5) * 120; c.lineTo(x, y); }
        c.stroke();
      }
      c.fillStyle = 'rgba(230,200,120,0.85)';
      for (let i = 0; i < 90; i++) { c.beginPath(); c.arc(r() * W, r() * H, 2 + r() * 3, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.font = '600 14px monospace';
      const tags = ['C', 'R', 'U', 'L', 'Q', 'D', 'J'];
      for (let i = 0; i < 22; i++) c.fillText(tags[(r() * tags.length) | 0] + ((r() * 90) | 0), r() * (W - 30), 14 + r() * (H - 16));
    });
    // Screw pointing along +Y (head at the top). Rotate it so +Y points out of the surface.
    k.screw = (color, shaftLen) => {
      const m = k.metal(color || 0xc3c7cf), L = shaftLen || 0.3;
      const head = k.at(k.cyl(0.12, 0.12, 0.06, m, 18), 0, 0.03, 0);
      const slot = k.at(k.box(0.17, 0.02, 0.035, 0x2a2a2a), 0, 0.062, 0);
      const slot2 = k.rot(k.at(k.box(0.17, 0.02, 0.035, 0x2a2a2a), 0, 0.062, 0), 0, Math.PI / 2, 0);
      const shaft = k.at(k.cyl(0.045, 0.03, L, m, 10), 0, -L / 2, 0);
      return k.group(head, slot, slot2, shaft);
    };
    // Flat picture made by drawing on a canvas: stickers, labels.
    k.decal = (w, h, draw, px) => {
      px = px || 256;
      const tex = k.canvasTex(px, Math.round((px * h) / w), draw);
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), k.mat(0xffffff, { map: tex, roughness: 0.7 }));
    };
    // A live TV screen. The engine draws the show onto it every frame.
    k.screen = (w, h, pxW, pxH, bulge) => {
      const canvas = document.createElement('canvas'); canvas.width = pxW; canvas.height = pxH;
      const buf = document.createElement('canvas'); buf.width = pxW; buf.height = pxH;
      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      const geo = new THREE.PlaneGeometry(w, h, bulge ? 16 : 1, bulge ? 12 : 1);
      if (bulge) {
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i) / (w / 2), y = pos.getY(i) / (h / 2);
          pos.setZ(i, bulge * (1 - (x * x + y * y) / 2));
        }
        geo.computeVertexNormals();
      }
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      return { mesh, canvas, buf, ctx: canvas.getContext('2d'), bctx: buf.getContext('2d'), tex, w: pxW, h: pxH };
    };
    // Same size as k.box, with softened edges.
    k.rbox = (w, h, d, m, r) => {
      r = Math.max(0.002, Math.min(r == null ? 0.03 : r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002));
      const sh = new THREE.Shape(), hw = w / 2 - r, hh = h / 2 - r;
      sh.moveTo(-hw, -hh); sh.lineTo(hw, -hh); sh.lineTo(hw, hh); sh.lineTo(-hw, hh); sh.lineTo(-hw, -hh);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 3, curveSegments: 1 });
      geo.center();
      return k.mesh(geo, m);
    };
    k.woodTex = () => woodTexture();
    let dot = null;
    k.dotTex = () => dot || (dot = softDot());
    // A floating name tag that always faces you (used in the zoomed-in worlds).
    k.label = (text, o) => {
      o = o || {};
      const fs = 46, pad = 20, cv = document.createElement('canvas'), x = cv.getContext('2d');
      const font = `800 ${fs}px "Baloo 2", "Trebuchet MS", sans-serif`;
      x.font = font;
      cv.width = Math.ceil(x.measureText(text).width) + pad * 2; cv.height = Math.round(fs * 1.5);
      x.font = font;
      x.fillStyle = o.bg || 'rgba(16,22,35,0.82)'; roundRect(x, 0, 0, cv.width, cv.height, cv.height / 2); x.fill();
      x.fillStyle = o.color || '#fff8ea'; x.textBaseline = 'middle'; x.fillText(text, pad, cv.height / 2 + 3);
      const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false }));
      const hgt = o.size || 0.2;
      sp.scale.set((hgt * cv.width) / cv.height, hgt, 1);
      sp.renderOrder = 20; sp.userData.noPick = true;
      return sp;
    };
    // Glowing dots that travel along a path: electrons, light, magnetism. obj.userData.flow.update(dt, speed).
    k.flow = (pts, o) => {
      o = o || {};
      const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2])), !!o.closed);
      const n = o.count || 16, pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ size: o.size || 0.14, map: k.dotTex(), color: o.color == null ? 0x58b8ff : o.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
      const ptsObj = new THREE.Points(geo, mat);
      ptsObj.frustumCulled = false; ptsObj.userData.noPick = true;
      const v = new THREE.Vector3();
      let phase = o.phase || 0;
      ptsObj.userData.flow = {
        curve,
        update(dt, speed) {
          phase = (phase + dt * (speed == null ? 0.15 : speed)) % 1;
          if (phase < 0) phase += 1;
          for (let i = 0; i < n; i++) { curve.getPointAt(((i / n) + phase) % 1, v); pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z; }
          geo.attributes.position.needsUpdate = true;
        },
      };
      ptsObj.userData.flow.update(0, 0);
      return ptsObj;
    };
    return k;
  }

  // ---------------------------------------------------------------- sound (all synthesized, no files)
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const SONGS = [
    { wave: 'square', mel: [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74], bass: [48, 0, 55, 0, 50, 0, 57, 0, 48, 0, 55, 0, 43, 0, 47, 0] },
    { wave: 'triangle', mel: [67, 0, 71, 74, 72, 0, 69, 67, 64, 0, 67, 71, 69, 0, 0, 0], bass: [43, 0, 0, 0, 45, 0, 0, 0, 40, 0, 0, 0, 45, 0, 0, 0] },
    { wave: 'sawtooth', mel: [60, 67, 72, 67, 63, 70, 75, 70, 58, 65, 70, 65, 62, 69, 74, 77], bass: [36, 0, 36, 0, 39, 0, 39, 0, 34, 0, 34, 0, 38, 0, 38, 0] },
    { tone: 1000 },
  ];
  const Sound = {
    ctx: null, muted: store.get('tal-muted', false), showOn: false, song: 0, step: 0, pending: null,
    // Called on every tap. iPads start audio "suspended" and only let a tap wake it; they can also
    // suspend it again (another app, the screen locking), so this keeps trying.
    unlock() {
      try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) { /* older iPadOS */ }
      if (!this.ctx) this.init();
      if (!this.ctx) return;
      if (this.ctx.state !== 'running') { try { const p = this.ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ } }
      if (!this.primed) {
        this.primed = true;
        try { const s = this.ctx.createBufferSource(); s.buffer = this.ctx.createBuffer(1, 1, 22050); s.connect(this.ctx.destination); s.start(0); } catch (e) { this.primed = false; }
      }
    },
    init() {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      let ctx;
      try { ctx = new C(); } catch (e) { return; }
      this.ctx = ctx;
      const g = (v, to) => { const n = ctx.createGain(); n.gain.value = v; if (to) n.connect(to); return n; };
      this.master = g(this.muted ? 0 : 0.85, ctx.destination);
      this.sfx = g(0.55, this.master);
      this.tvVol = g(1, this.master);
      const merger = ctx.createChannelMerger(2);
      merger.connect(this.tvVol);
      this.gL = g(1); this.gR = g(1);
      this.gL.connect(merger, 0, 0); this.gR.connect(merger, 0, 1);
      this.mono = g(1); this.mono.connect(this.gL); this.mono.connect(this.gR);
      this.music = g(0, this.mono); this.hiss = g(0, this.mono); this.toneG = g(0, this.mono);
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
      src.connect(hp); hp.connect(this.hiss); src.start();
      const tone = ctx.createOscillator(); tone.frequency.value = 1000; tone.connect(this.toneG); tone.start();
      this.nextNote = ctx.currentTime + 0.1;
      setInterval(() => this.schedule(), 50);
      if (this.pending) this.setTV(this.pending);
    },
    setTV(s) {
      s = s || {};
      this.pending = s;
      if (!this.ctx) return;
      const t = this.ctx.currentTime, song = SONGS[s.song || 0] || SONGS[0];
      this.song = s.song || 0;
      this.showOn = !!s.show && !song.tone;
      this.music.gain.setTargetAtTime(this.showOn ? 0.12 : 0, t, 0.04);
      this.toneG.gain.setTargetAtTime(s.show && song.tone ? 0.03 : 0, t, 0.04);
      this.hiss.gain.setTargetAtTime(s.hiss ? 0.08 : 0, t, 0.04);
      this.gL.gain.setTargetAtTime(s.left === false ? 0 : 1, t, 0.03);
      this.gR.gain.setTargetAtTime(s.right === false ? 0 : 1, t, 0.03);
    },
    duck(on) { if (this.ctx) this.tvVol.gain.setTargetAtTime(on ? 0.25 : 1, this.ctx.currentTime, 0.1); },
    setMuted(m) {
      this.muted = m; store.set('tal-muted', m);
      if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.03);
    },
    schedule() {
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;
      if (this.nextNote < ctx.currentTime - 0.3) this.nextNote = ctx.currentTime + 0.05;
      const stepDur = 60 / 132 / 2;
      while (this.nextNote < ctx.currentTime + 0.2) {
        if (this.showOn) {
          const song = SONGS[this.song] || SONGS[0], i = this.step % 16;
          if (song.mel[i]) this.note(mtof(song.mel[i]), this.nextNote, stepDur * 0.9, song.wave, 0.5);
          if (song.bass[i]) this.note(mtof(song.bass[i]), this.nextNote, stepDur * 1.8, 'triangle', 0.7);
        }
        this.nextNote += stepDur;
        this.step++;
      }
    },
    note(f, t, dur, type, vol) {
      const ctx = this.ctx, o = ctx.createOscillator(), e = ctx.createGain();
      o.type = type; o.frequency.value = f;
      e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(e); e.connect(this.music); o.start(t); o.stop(t + dur + 0.02);
    },
    blip(f0, f1, dur, type, vol, delay) {
      if (!this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime + (delay || 0);
      const o = ctx.createOscillator(), e = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(vol || 0.4, t + 0.008);
      e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(e); e.connect(this.sfx); o.start(t); o.stop(t + dur + 0.03);
    },
    noise(dur, vol, freq, delay, type) {
      if (!this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime + (delay || 0);
      const s = ctx.createBufferSource(); s.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = 0.8;
      const e = ctx.createGain();
      e.gain.setValueAtTime(vol, t);
      e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(e); e.connect(this.sfx);
      s.start(t, Math.random()); s.stop(t + dur + 0.02);
    },
    pop() { this.blip(320, 880, 0.14, 'sine', 0.5); },
    tick() { this.blip(1800, 1700, 0.02, 'square', 0.06); },
    snap() { this.blip(1500, 600, 0.06, 'square', 0.18); this.noise(0.04, 0.3, 3000); },
    boing() { this.blip(500, 260, 0.18, 'sine', 0.3); },
    bonk() { this.blip(200, 110, 0.22, 'sine', 0.6); this.blip(160, 90, 0.2, 'sine', 0.4, 0.12); },
    unscrew() { for (let i = 0; i < 6; i++) this.blip(2600 - i * 120, 2200 - i * 100, 0.025, 'square', 0.1, i * 0.08); },
    zap() { this.noise(0.4, 0.9, 2500); this.blip(120, 60, 0.35, 'sawtooth', 0.35); this.blip(2400, 300, 0.25, 'square', 0.12, 0.05); },
    crtOn() { this.blip(90, 40, 0.5, 'sine', 0.8); this.blip(60, 58, 0.9, 'sawtooth', 0.15, 0.05); this.noise(0.5, 0.15, 400, 0.05, 'lowpass'); },
    flatOn() { this.blip(660, 660, 0.18, 'sine', 0.3); this.blip(990, 990, 0.3, 'sine', 0.3, 0.12); },
    click() { this.blip(2200, 1400, 0.03, 'square', 0.2); this.noise(0.03, 0.3, 4000); },
    whoosh() { this.noise(0.35, 0.25, 900, 0, 'bandpass'); this.blip(300, 700, 0.3, 'sine', 0.12); },
    off() { this.blip(520, 110, 0.3, 'sine', 0.35); },
    fanfare() {
      [72, 76, 79, 84].forEach((m, i) => this.blip(mtof(m), mtof(m), 0.16, 'square', 0.18, i * 0.12));
      [72, 76, 79, 84].forEach((m) => this.blip(mtof(m), mtof(m), 0.7, 'triangle', 0.15, 0.5));
    },
  };

  // ---------------------------------------------------------------- voice (Sparky) + caption
  // Sparky speaks from recorded clips (voice/*.mp3, listed in voice/manifest.js) and falls back to the
  // browser's speech voice for any line without a clip. Clips play through one <audio> element, which
  // iPads allow (even in silent mode) once the first tap has unlocked it.
  const hashText = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  let silentUrl = null;
  function silentWav() {
    if (silentUrl) return silentUrl;
    const n = 400, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    let bin = '';
    new Uint8Array(buf).forEach((b) => { bin += String.fromCharCode(b); });
    return (silentUrl = 'data:audio/wav;base64,' + btoa(bin));
  }
  const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Every fixed line the engine itself speaks (listed so recorded clips can be made later if wanted).
  const SAFETY = 'And remember: only take apart real things with a grown-up!';
  const ENGINE_LINES = [
    SAFETY, "It's stuck! Take off the glowing part first.", 'Wait! Take the glowing part off first, then this can go back in.',
    'You found it! That part was broken.', 'Tap it to put in a brand new one!', 'A brand new part!',
    'Now put the other parts back and turn it on to test it.', 'Now turn it on to test it!',
    "It's back in. Everything works again!", 'Click! It goes back in.', "You fixed it! It works again. You're a real fix-it engineer!",
    'Nothing happened!', 'Turn it on first, then you can change the channel!', 'The channel knob is missing! Put it back to change the channel.',
    'Kaboom! You took the whole thing apart!', 'Tap any piece to hear what it does.', 'All back together!', 'All back together! Press power to see if it works.',
    'Uh oh, this one is broken!', 'Can you find the broken part?', 'Tap the burnt part to put in a new one!',
    "Look for the smoke! You'll need to take some parts off to reach it.", "Look for the smoke! That's the broken part.",
    "Let's look closer!", 'Pull its pieces off with your finger. Drag on the board to flip it around.', 'Pull its pieces off with your finger!',
    "You found every kind of part! You're a real engineer!", "That's the case. It holds everything together.",
    "It's on the back. Tap the turn around button!", 'I can talk again!',
    "Hi! I'm Sparky. If you can hear me, we're ready to take things apart!",
  ];
  const DEPTH = ['For kids', 'How it works', "How it's built", 'The science', 'Deep dive'];
  const Caption = {
    timer: 0, learn: null, part: null,
    init() {
      this.el = $('#caption'); this.txt = $('#capText'); this.more = $('#capMore'); this.depth = $('#capDepth'); this.look = $('#capLook');
      this.more.addEventListener('click', () => this.deeper());
      this.look.addEventListener('click', () => { if (this.part) diveInto(this.part); });
      $('#sparky').addEventListener('click', () => { Sound.unlock(); Voice.repeat(); });
    },
    // more: one extra line (string), or { levels, i } to step deeper one tap at a time
    show(text, more) {
      // Look inside belongs to the part Sparky is talking about. A new line about something
      // else (a blocked part, a put-back, a hint) drops it, so the button never points elsewhere.
      if (text !== this.partText) this.part = null;
      this.txt.textContent = text;
      if (typeof more === 'string') more = { levels: [more], i: 0 };
      this.learn = more && more.levels && more.levels.length ? more : null;
      this.refresh();
      this.el.classList.add('show');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => { if (!Voice.talking) this.el.classList.remove('show'); }, Math.max(8000, text.split(' ').length * 450 + 6000));
    },
    setPart(p) { this.part = p || null; this.partText = this.txt.textContent; this.refresh(); },
    refresh() {
      const L = this.learn;
      this.more.hidden = !(L && L.i < L.levels.length);
      if (L) {
        const total = Math.min(5, L.levels.length + 1), at = Math.min(5, L.i + 1);
        this.depth.hidden = false;
        this.depth.innerHTML = '';
        for (let i = 1; i <= total; i++) { const d = document.createElement('i'); if (i <= at) d.className = 'on'; this.depth.append(d); }
        const lab = document.createElement('span'); lab.textContent = DEPTH[at - 1]; this.depth.append(lab);
      } else this.depth.hidden = true;
      this.look.hidden = !(this.part && insideOf(this.part) && App.inst && App.inst.parts.indexOf(this.part) >= 0);
    },
    deeper() {
      const L = this.learn;
      if (!L || L.i >= L.levels.length) return;
      const t = L.levels[L.i];
      L.i++;
      Voice.say(t, L);
    },
  };
  const Voice = {
    on: store.get('tal-voice', true), talking: false, queue: [], cur: null, item: null, el: null, unlocked: false, ttsVoice: null, u: null, last: null, cancelledAt: 0,
    clip(text) { const m = window.TAL_VOICE, h = hashText(text); return m && m.clips && m.clips[h] ? (m.base || 'voice/') + h + '.mp3' : null; },
    ensureEl() {
      if (this.el) return this.el;
      const el = (this.el = new Audio());
      el.preload = 'auto';
      el.setAttribute('playsinline', '');
      el.addEventListener('ended', () => { if (this.cur) this.next(); });
      el.addEventListener('error', () => { if (this.cur) this.next(); });
      return el;
    },
    // Call inside a tap. iPads only let speech and audio start from a tap; after that they keep working.
    unlock() {
      if (this.unlocked) return;
      this.unlocked = true;
      const ss = window.speechSynthesis;
      if (ss && typeof window.SpeechSynthesisUtterance !== 'undefined' && !ss.speaking && !ss.pending) {
        try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; ss.speak(u); } catch (e) { /* ignore */ }
      }
      if (window.TAL_VOICE) {
        try {
          const el = this.ensureEl();
          el.src = silentWav();
          const p = el.play();
          if (p && p.catch) p.catch(() => {});
        } catch (e) { /* ignore */ }
      }
    },
    // caption text, "tell me more" text, wait for the current line?, what to actually say (a line or a list of lines)
    say(text, more, queue, spoken) {
      if (!text) return;
      const item = { text, more, segs: [].concat(spoken || text).filter(Boolean) };
      this.last = item;
      if (queue && this.talking) { this.queue.push(item); return; }
      this.stop();
      this.play(item);
    },
    repeat() { if (this.last) { const l = this.last; this.stop(); this.play(l); } },
    play(item) {
      this.item = item;
      Caption.show(item.text, item.more);
      if (!this.on) return;
      const urls = item.segs.map((s) => this.clip(s));
      if (urls.length && urls.every(Boolean)) { this.cur = urls; this.setTalking(true); this.next(); }
      else this.speakTTS(item.segs.join(' '));
    },
    next() {
      if (this.cur && this.cur.length) {
        const el = this.ensureEl();
        el.src = this.cur.shift();
        this.unlocked = true;
        let p = null;
        try { p = el.play(); } catch (e) { p = Promise.reject(e); }
        if (p && p.catch) p.catch(() => { if (this.cur) { this.cur = null; this.speakTTS(this.item.segs.join(' ')); } });
        return;
      }
      this.cur = null;
      if (this.queue.length) { this.play(this.queue.shift()); return; }
      this.setTalking(false);
    },
    pickTTS() {
      const ss = window.speechSynthesis;
      if (!ss) return;
      const vs = ss.getVoices();
      const pref = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Ava', 'Microsoft Zira', 'Karen', 'Moira', 'Daniel'];
      for (const n of pref) { const v = vs.find((x) => x.name.indexOf(n) >= 0 && /^en/i.test(x.lang)); if (v) { this.ttsVoice = v; return; } }
      this.ttsVoice = vs.find((v) => /^en[-_]US/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
    },
    speakTTS(text) {
      const ss = window.speechSynthesis;
      if (!ss || typeof window.SpeechSynthesisUtterance === 'undefined') { this.cur = null; this.next(); return; }
      try {
        const u = new SpeechSynthesisUtterance(text);
        if (!this.ttsVoice) this.pickTTS();
        if (this.ttsVoice) u.voice = this.ttsVoice;
        u.lang = (this.ttsVoice && this.ttsVoice.lang) || 'en-US';
        u.rate = 0.92; u.pitch = 1.15;
        u.onend = u.onerror = () => { if (this.u === u) { this.u = null; this.next(); } };
        this.u = u; // keep a reference: some browsers drop events for collected utterances
        this.setTalking(true);
        const go = () => { ss.speak(u); if (ss.paused) ss.resume(); };
        // Desktop Chrome sometimes drops a line spoken right after cancel(), so it waits a beat there.
        // iPads must speak immediately, inside the tap, or they may stay silent.
        if (!IS_IOS && performance.now() - this.cancelledAt < 120) setTimeout(go, 90); else go();
      } catch (e) { this.setTalking(false); }
    },
    stop() {
      this.queue = []; this.cur = null; this.u = null;
      if (this.el) { try { this.el.pause(); } catch (e) { /* ignore */ } }
      try { if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) { window.speechSynthesis.cancel(); this.cancelledAt = performance.now(); } } catch (e) { /* ignore */ }
      this.setTalking(false);
    },
    setTalking(on) {
      if (this.talking === on) return;
      this.talking = on;
      $('#caption').classList.toggle('talking', on);
      Sound.duck(on);
    },
    busy() { return this.talking; },
  };

  // ---------------------------------------------------------------- screen shows
  function circle(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  function bounce(v, max) { const m = v % (2 * max); return m < max ? m : 2 * max - m; }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function chSunny(c, W, H, t) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3fb7ff'); g.addColorStop(1, '#c8f2ff');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sx = W * 0.8, sy = H * 0.22, r = H * 0.1;
    c.save(); c.translate(sx, sy); c.rotate(t * 0.6); c.fillStyle = '#ffcf33';
    for (let i = 0; i < 10; i++) { c.rotate(Math.PI / 5); c.fillRect(r * 1.2, -r * 0.08, r * 0.55, r * 0.16); }
    c.restore();
    circle(c, sx, sy, r, '#ffd84a');
    circle(c, sx - r * 0.35, sy - r * 0.15, r * 0.1, '#5a3b00'); circle(c, sx + r * 0.35, sy - r * 0.15, r * 0.1, '#5a3b00');
    c.strokeStyle = '#5a3b00'; c.lineWidth = r * 0.09; c.beginPath(); c.arc(sx, sy + r * 0.05, r * 0.45, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    for (let i = 0; i < 3; i++) {
      const x = ((t * (18 + i * 9) + i * W * 0.45) % (W + 160)) - 80, y = H * (0.12 + i * 0.1);
      c.fillStyle = 'rgba(255,255,255,0.95)';
      [[0, 0, 1], [0.9, 0.15, 0.8], [-0.9, 0.15, 0.75], [0.3, -0.35, 0.8]].forEach(([dx, dy, s]) => {
        c.beginPath(); c.arc(x + dx * H * 0.06, y + dy * H * 0.06, H * 0.055 * s, 0, 7); c.fill();
      });
    }
    c.fillStyle = '#5cc85a'; c.beginPath(); c.ellipse(W * 0.25, H * 1.05, W * 0.55, H * 0.36, 0, 0, 7); c.fill();
    c.fillStyle = '#3fae49'; c.beginPath(); c.ellipse(W * 0.85, H * 1.1, W * 0.5, H * 0.4, 0, 0, 7); c.fill();
    const bx = W * 0.5 + Math.sin(t * 1.1) * W * 0.3, ph = Math.abs(Math.sin(t * 3.2)), br = H * 0.075;
    const by = H * 0.8 - br - ph * H * 0.38, squash = ph < 0.12 ? 1 - (0.12 - ph) * 2 : 1;
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(bx, H * 0.8, br * (1.2 - ph * 0.5), br * 0.25, 0, 0, 7); c.fill();
    c.save(); c.translate(bx, by + br * (1 - squash)); c.scale(1 / squash, squash); c.rotate(t * 3);
    circle(c, 0, 0, br, '#ff4b3e'); c.fillStyle = '#fff'; c.fillRect(-br, -br * 0.18, br * 2, br * 0.36);
    c.restore();
  }
  function chFish(c, W, H, t) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b8fd6'); g.addColorStop(1, '#0a3d7a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < 4; i++) {
      const x = W * (0.15 + i * 0.25) + Math.sin(t * 0.5 + i) * 20;
      c.beginPath(); c.moveTo(x - 20, 0); c.lineTo(x + 20, 0); c.lineTo(x + 60, H); c.lineTo(x - 10, H); c.fill();
    }
    c.fillStyle = '#e8c77e'; c.fillRect(0, H * 0.86, W, H * 0.14);
    c.strokeStyle = '#2fbf6a'; c.lineWidth = W * 0.012; c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const x0 = W * (0.08 + i * 0.17);
      c.beginPath(); c.moveTo(x0, H * 0.9);
      for (let s = 1; s <= 6; s++) c.lineTo(x0 + Math.sin(t * 1.5 + s * 0.7 + i) * W * 0.02, H * 0.9 - s * H * 0.07);
      c.stroke();
    }
    [['#ff8a00', 0.35, 1, 0], ['#ffd400', 0.55, -1, 2], ['#ff4fa3', 0.7, 1, 4]].forEach(([col, yy, dir, off], i) => {
      const s = H * 0.07, span = W + s * 6;
      const x = dir > 0 ? ((t * 50 + off * 120) % span) - s * 3 : W + s * 3 - ((t * 40 + off * 120) % span);
      const y = H * yy + Math.sin(t * 2 + i) * H * 0.03;
      c.save(); c.translate(x, y); c.scale(dir, 1);
      c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, s * 1.4, s, 0, 0, 7); c.fill();
      const w = Math.sin(t * 10 + i) * s * 0.3;
      c.beginPath(); c.moveTo(-s * 1.2, 0); c.lineTo(-s * 2.3, -s * 0.8 + w); c.lineTo(-s * 2.3, s * 0.8 + w); c.closePath(); c.fill();
      circle(c, s * 0.7, -s * 0.25, s * 0.22, '#fff'); circle(c, s * 0.76, -s * 0.25, s * 0.11, '#111');
      c.restore();
    });
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const x = W * ((i * 0.137) % 1) + Math.sin(t * 2 + i) * 6, y = H - ((t * 40 + i * 47) % (H * 1.1));
      c.beginPath(); c.arc(x, y, 3 + (i % 3) * 2, 0, 7); c.stroke();
    }
  }
  const STARS = (() => { const r = rng(42); return Array.from({ length: 90 }, () => [r(), r()]); })();
  function chSpace(c, W, H, t) {
    c.fillStyle = '#05061a'; c.fillRect(0, 0, W, H);
    STARS.forEach(([x, y], i) => { const tw = 0.5 + 0.5 * Math.sin(t * 3 + i); c.fillStyle = `rgba(255,255,255,${0.3 + tw * 0.7})`; c.fillRect(x * W, y * H, 2, 2); });
    const px = W * 0.75, py = H * 0.72, pr = H * 0.2;
    c.save(); c.beginPath(); c.arc(px, py, pr, 0, 7); c.clip();
    c.fillStyle = '#ff9f43'; c.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    c.fillStyle = '#e8772a'; for (let i = -2; i <= 2; i++) c.fillRect(px - pr, py + i * pr * 0.35, pr * 2, pr * 0.12);
    c.restore();
    c.strokeStyle = '#ffe0a3'; c.lineWidth = H * 0.02; c.beginPath(); c.ellipse(px, py, pr * 1.6, pr * 0.4, -0.3, 0, 7); c.stroke();
    const x = ((t * 70) % (W + 200)) - 100, y = H * 0.35 + Math.sin(t * 1.5) * H * 0.08, s = H * 0.06;
    c.save(); c.translate(x, y); c.rotate(Math.cos(t * 1.5) * 0.15);
    const fl = s * (1.2 + Math.random() * 0.6);
    c.fillStyle = Math.sin(t * 30) > 0 ? '#ffcf33' : '#ff6b2b';
    c.beginPath(); c.moveTo(-s * 1.4, -s * 0.35); c.lineTo(-s * 1.4 - fl, 0); c.lineTo(-s * 1.4, s * 0.35); c.fill();
    c.fillStyle = '#e8413b';
    c.beginPath(); c.moveTo(-s * 1.1, -s * 0.4); c.lineTo(-s * 1.6, -s * 1.0); c.lineTo(-s * 0.5, -s * 0.4); c.fill();
    c.beginPath(); c.moveTo(-s * 1.1, s * 0.4); c.lineTo(-s * 1.6, s * 1.0); c.lineTo(-s * 0.5, s * 0.4); c.fill();
    c.fillStyle = '#f4f6fb'; c.beginPath(); c.ellipse(0, 0, s * 1.6, s * 0.6, 0, 0, 7); c.fill();
    c.fillStyle = '#e8413b'; c.beginPath(); c.moveTo(s * 1.2, -s * 0.42); c.quadraticCurveTo(s * 2.1, 0, s * 1.2, s * 0.42); c.fill();
    circle(c, s * 0.3, 0, s * 0.28, '#3aa0ff');
    c.restore();
  }
  function chBars(c, W, H) {
    const top = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
    const mid = ['#0000c0', '#131313', '#c000c0', '#131313', '#00c0c0', '#131313', '#c0c0c0'];
    const bw = W / 7;
    top.forEach((col, i) => { c.fillStyle = col; c.fillRect(i * bw, 0, bw + 1, H * 0.7); });
    mid.forEach((col, i) => { c.fillStyle = col; c.fillRect(i * bw, H * 0.7, bw + 1, H * 0.08); });
    ['#00214c', '#ffffff', '#32006a', '#131313'].forEach((col, i) => { c.fillStyle = col; c.fillRect((i * W) / 4, H * 0.78, W / 4 + 1, H * 0.22); });
  }
  const CHANNELS = [
    { name: 'Sunny Hill', draw: chSunny },
    { name: 'Fish Tank', draw: chFish },
    { name: 'Rocket Ride', draw: chSpace },
    { name: 'Color Bars', draw: chBars },
  ];
  function drawNoSignal(c, W, H, t) {
    c.fillStyle = '#060a24'; c.fillRect(0, 0, W, H);
    const bw = W * 0.38, bh = H * 0.17, x = bounce(t * 70, W - bw), y = bounce(t * 50, H - bh);
    const hue = ((Math.floor((t * 70) / (W - bw)) + Math.floor((t * 50) / (H - bh))) * 67) % 360;
    c.fillStyle = `hsl(${hue},80%,60%)`; roundRect(c, x, y, bw, bh, bh * 0.25); c.fill();
    c.fillStyle = '#060a24'; c.font = `800 ${Math.round(bh * 0.5)}px "Baloo 2", "Trebuchet MS", sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NO SIGNAL', x + bw / 2, y + bh / 2 + 2);
  }
  let snowC, snowX, snowImg;
  function drawSnow(c, W, H) {
    if (!snowC) { snowC = document.createElement('canvas'); snowC.width = 160; snowC.height = 120; snowX = snowC.getContext('2d'); snowImg = snowX.createImageData(160, 120); }
    const d = snowImg.data;
    for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    snowX.putImageData(snowImg, 0, 0);
    c.imageSmoothingEnabled = false; c.drawImage(snowC, 0, 0, W, H); c.imageSmoothingEnabled = true;
  }
  function glitch(c, W, H, t) {
    const r = rng(Math.floor(t * 8) + 1);
    for (let i = 0; i < 6; i++) { const y = r() * H, h = 6 + r() * H * 0.08, dx = (r() - 0.5) * W * 0.3; c.drawImage(c.canvas, 0, y, W, h, dx, y, W, h); }
    const cols = ['#ff00ff', '#00ffff', '#ffff00', '#ffffff', '#00ff00'];
    for (let i = 0; i < 16; i++) { c.fillStyle = cols[(r() * cols.length) | 0]; c.globalAlpha = 0.75; c.fillRect(r() * W, 0, 2 + r() * 8, H); }
    c.globalAlpha = 1;
  }
  function hotspots(c, W, H) {
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    for (let row = 0; row < 5; row++) for (let col = 0; col < 10; col++) {
      const x = ((col + 0.5) * W) / 10, y = ((row + 0.5) * H) / 5, rad = W / 14;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(255,255,240,0.65)'); g.addColorStop(1, 'rgba(255,255,240,0)');
      c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    c.globalCompositeOperation = 'source-over';
  }
  const OFF_CRT = '#27302b';
  let blurC = null;
  function drawContent(c, W, H, scr, t, channel, crt) {
    const m = scr.mode;
    if (m === 'off') { c.fillStyle = crt ? OFF_CRT : '#0b0d12'; c.fillRect(0, 0, W, H); return; }
    if (m === 'black') { c.fillStyle = crt ? '#101412' : scr.lit ? '#16181d' : '#050608'; c.fillRect(0, 0, W, H); }
    else if (m === 'dot') {
      c.fillStyle = '#101412'; c.fillRect(0, 0, W, H);
      const r = H * 0.035 * (1 + 0.15 * Math.sin(t * 20));
      const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r * 3);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, 'rgba(220,255,240,0.9)'); g.addColorStop(1, 'rgba(120,255,200,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      return;
    }
    else if (m === 'line' || m === 'vline') {
      c.fillStyle = '#101412'; c.fillRect(0, 0, W, H);
      const across = m === 'line';
      const g = across ? c.createLinearGradient(0, H / 2 - 9, 0, H / 2 + 9) : c.createLinearGradient(W / 2 - 9, 0, W / 2 + 9, 0);
      g.addColorStop(0, 'rgba(200,255,230,0)'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, 'rgba(200,255,230,0)');
      c.fillStyle = g;
      if (across) c.fillRect(W * 0.04, H / 2 - 9, W * 0.92, 18); else c.fillRect(W / 2 - 9, H * 0.04, 18, H * 0.92);
      return;
    }
    else if (m === 'snow') drawSnow(c, W, H);
    else if (m === 'nosignal') drawNoSignal(c, W, H, t);
    else if (m === 'white') { c.fillStyle = '#f2f6ff'; c.fillRect(0, 0, W, H); }
    else (CHANNELS[channel] || CHANNELS[0]).draw(c, W, H, t);
    if (scr.glitch) glitch(c, W, H, t);
    if (scr.blur) {
      if (!blurC) blurC = document.createElement('canvas');
      blurC.width = Math.max(8, Math.round(W / 8)); blurC.height = Math.max(6, Math.round(H / 8));
      blurC.getContext('2d').drawImage(c.canvas, 0, 0, blurC.width, blurC.height);
      c.imageSmoothingEnabled = true; c.drawImage(blurC, 0, 0, W, H);
    }
    if (scr.tint) { c.globalCompositeOperation = 'multiply'; c.fillStyle = scr.tint; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
    if (scr.blotch) {
      c.globalCompositeOperation = 'color';
      [[0.2, 0.25, '#ff00aa'], [0.8, 0.3, '#00ff66'], [0.3, 0.8, '#ffaa00'], [0.75, 0.78, '#3355ff']].forEach(([x, y, col], i) => {
        const r = W * 0.32, cx = W * x + Math.sin(t * 0.4 + i) * 10, cy = H * y, g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalAlpha = 0.6; c.fillStyle = g; c.fillRect(0, 0, W, H);
      });
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    if (scr.gray) { c.globalCompositeOperation = 'saturation'; c.fillStyle = '#808080'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
    if (scr.invert) { c.globalCompositeOperation = 'difference'; c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
    if (scr.deadCols) {
      const n = scr.colCount || 4, cw = W / n;
      scr.deadCols.forEach((i) => {
        c.fillStyle = '#050608'; c.fillRect(i * cw, 0, cw + 1, H);
        c.fillStyle = 'rgba(120,120,255,0.5)'; for (let x = 0; x < cw; x += 9) c.fillRect(i * cw + x, 0, 1, H);
      });
    }
    if (scr.hotspots) hotspots(c, W, H);
    if (scr.darkRows) {
      const n = scr.rowCount || 5, rh = H / n;
      scr.darkRows.forEach((i) => { c.fillStyle = 'rgba(0,0,0,0.9)'; c.fillRect(0, H - (i + 1) * rh, W, rh + 1); });
    }
    if (scr.dim != null && scr.dim < 1) { c.fillStyle = `rgba(0,0,0,${1 - scr.dim})`; c.fillRect(0, 0, W, H); }
  }
  let scanPattern = null;
  function crtOverlay(c, W, H, lit) {
    if (lit) {
      if (!scanPattern) { const p = document.createElement('canvas'); p.width = 1; p.height = 3; const x = p.getContext('2d'); x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(0, 2, 1, 1); scanPattern = c.createPattern(p, 'repeat'); }
      c.fillStyle = scanPattern; c.fillRect(0, 0, W, H);
    }
    const v = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, W * 0.6, H * 0.6);
    g.addColorStop(0, 'rgba(255,255,255,0.13)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  function renderScreen(inst, out, t) {
    const S = inst.screen;
    if (!S) return;
    const sp = inst.def.screenPart && inst.byId[inst.def.screenPart];
    let scr = (out && out.screen) || { mode: 'off' };
    if (sp && sp.t > 0.02) scr = { mode: 'off' };
    const crt = inst.def.screenStyle === 'crt', W = S.w, H = S.h, c = S.ctx, b = S.bctx;
    drawContent(b, W, H, scr, t, App.channel, crt);
    if (inst.osd && t < inst.osd.until && scr.mode !== 'off' && scr.mode !== 'black') {
      b.font = `800 ${Math.round(H * 0.11)}px "Baloo 2", "Trebuchet MS", sans-serif`;
      b.textAlign = 'right'; b.textBaseline = 'top';
      b.fillStyle = 'rgba(0,0,0,0.6)'; b.fillText(inst.osd.text, W * 0.94 + 3, H * 0.06 + 3);
      b.fillStyle = crt ? '#59ff8a' : '#ffffff'; b.fillText(inst.osd.text, W * 0.94, H * 0.06);
    }
    const A = crt && inst.anim;
    if (A) {
      const k = t - A.t0;
      c.fillStyle = OFF_CRT; c.fillRect(0, 0, W, H);
      if (A.type === 'on') {
        if (k > 0.6) inst.anim = null;
        const sy = clamp((k - 0.08) / 0.4, 0.01, 1);
        c.drawImage(S.buf, 0, (H / 2) * (1 - sy), W, H * sy);
        c.fillStyle = `rgba(230,255,245,${Math.max(0, 1 - k / 0.5) * 0.85})`;
        c.fillRect(0, (H / 2) * (1 - sy), W, H * sy);
      } else {
        if (k > 0.9) inst.anim = null;
        if (k < 0.3) {
          const sy = k < 0.12 ? 1 - (k / 0.12) * 0.985 : 0.015, sx = k < 0.12 ? 1 : 1 - ((k - 0.12) / 0.18) * 0.97;
          const w = Math.max(W * sx, H * 0.02), h = Math.max(H * sy, H * 0.015);
          c.fillStyle = 'rgba(235,255,245,1)'; c.fillRect(W / 2 - w / 2, H / 2 - h / 2, w, h);
        } else {
          const a = Math.max(0, 1 - (k - 0.3) / 0.6), r = H * 0.05;
          const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r);
          g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(200,255,230,0)');
          c.fillStyle = g; c.fillRect(0, 0, W, H);
        }
      }
    } else c.drawImage(S.buf, 0, 0);
    if (crt) crtOverlay(c, W, H, scr.mode !== 'off');
    S.tex.needsUpdate = true;
  }

  // ---------------------------------------------------------------- particles
  function softDot() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const x = cv.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  }
  class Particles {
    constructor(n, size, o, tex) {
      this.n = n; this.o = o; this.i = 0;
      this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3); this.base = new Float32Array(n * 3);
      this.vel = new Float32Array(n * 3); this.life = new Float32Array(n); this.max = new Float32Array(n);
      for (let i = 0; i < n; i++) this.pos[i * 3 + 1] = -999;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
      this.geo = geo;
      this.points = new THREE.Points(geo, new THREE.PointsMaterial({
        size, map: tex, vertexColors: true, transparent: true, depthWrite: false, opacity: o.opacity || 1,
        blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending, sizeAttenuation: true,
      }));
      this.points.frustumCulled = false;
    }
    emit(p, count, e) {
      const c = new THREE.Color();
      for (let k = 0; k < count; k++) {
        const i = this.i; this.i = (this.i + 1) % this.n;
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), sp = e.speed * (0.4 + Math.random() * 0.6);
        this.pos[i * 3] = p.x + (Math.random() - 0.5) * (e.spread || 0);
        this.pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * (e.spread || 0);
        this.pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * (e.spread || 0);
        this.vel[i * 3] = Math.sin(ph) * Math.cos(th) * sp;
        this.vel[i * 3 + 1] = Math.abs(Math.cos(ph)) * sp * (e.upBias || 0.5) + (e.up || 0);
        this.vel[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * sp;
        c.set(e.colors[(Math.random() * e.colors.length) | 0]);
        this.base[i * 3] = this.col[i * 3] = c.r; this.base[i * 3 + 1] = this.col[i * 3 + 1] = c.g; this.base[i * 3 + 2] = this.col[i * 3 + 2] = c.b;
        this.life[i] = this.max[i] = e.life * (0.6 + Math.random() * 0.4);
      }
    }
    update(dt) {
      const o = this.o;
      for (let i = 0; i < this.n; i++) {
        if (this.life[i] <= 0) continue;
        this.life[i] -= dt;
        if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -999; continue; }
        this.vel[i * 3 + 1] -= o.gravity * dt;
        const dr = 1 - (o.drag || 0) * dt;
        this.vel[i * 3] *= dr; this.vel[i * 3 + 1] *= dr; this.vel[i * 3 + 2] *= dr;
        this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
        if (o.fade) { const f = this.life[i] / this.max[i]; this.col[i * 3] = this.base[i * 3] * f; this.col[i * 3 + 1] = this.base[i * 3 + 1] * f; this.col[i * 3 + 2] = this.base[i * 3 + 2] * f; }
      }
      this.geo.attributes.position.needsUpdate = true;
      this.geo.attributes.color.needsUpdate = true;
    }
  }

  // ---------------------------------------------------------------- device instances
  // Parts can nest: a part with `parent` lives inside its parent's object and can come off
  // once the parent is reachable (or already pulled out).
  // Levels: a part with `level` above the chosen one isn't separate. If it names `fuse`, it rides along
  // inside that part; if it's nested in a parent, it stays part of the parent; otherwise it's scenery.
  function instantiate(def, kit, level) {
    const L = level || 3;
    const built = def.build(kit);
    built.root.updateMatrixWorld(true);
    const specById = {};
    built.parts.forEach((p) => { specById[p.id] = p; });
    built.parts.forEach((p) => { if ((p.level || 1) > L && p.fuse && specById[p.fuse]) specById[p.fuse].obj.attach(p.obj); });
    built.parts = built.parts.filter((p) => (p.level || 1) <= L);
    const inst = { def, level: L, root: built.root, parts: [], byId: {}, screen: built.screen || null, refs: built.refs || {}, shell: [], anim: null, osd: null };
    (built.shell || []).forEach((o) => o.traverse((m) => {
      if (!m.isMesh) return;
      m.material = m.material.clone();
      m.userData.shell = true;
      inst.shell.push(m);
    }));
    const objs = new Set(built.parts.map((p) => p.obj));
    built.parts.forEach((p, i) => {
      const part = Object.assign({ blockedBy: [], pull: [0, 0, -2], kind: 'part' }, p);
      part.index = i;
      part.home = part.obj.position.clone();
      part.homeQuat = part.obj.quaternion.clone();
      part.pullV = new THREE.Vector3().fromArray(part.pull);
      part.axisOut = new THREE.Vector3(0, 1, 0).applyQuaternion(part.homeQuat);
      part.face = new THREE.Vector3().fromArray(p.face || [0, 0, 1]).applyQuaternion(part.homeQuat).normalize();
      part.t = 0; part.target = 0; part.shake = 0; part.pulse = 0; part.smoke = false; part.smokeT = 0; part.glowNow = -1;
      part.spinQ = new THREE.Quaternion(); part.spinYaw = 0; part.spinPitch = 0;
      part.kids = [];
      part.meshes = [];
      const collect = (o) => {
        if (o !== part.obj && objs.has(o)) return;
        if (o.isMesh) {
          o.material = o.material.clone();
          if (o.material.emissive) o.material.userData.e0 = o.material.emissive.getHex();
          o.userData.part = part;
          part.meshes.push(o);
        }
        o.children.forEach(collect);
      };
      collect(part.obj);
      // the part's visual center (its group's origin can sit far away from the piece itself)
      part.center = new THREE.Vector3();
      if (part.meshes.length) {
        const box = new THREE.Box3();
        part.meshes.forEach((m) => box.expandByObject(m));
        part.obj.worldToLocal(box.getCenter(part.center));
      } else {
        const lab = part.obj.children.find((c) => c.isSprite);
        if (lab) part.center.copy(lab.position).y -= 0.4;
      }
      inst.parts.push(part);
      inst.byId[part.id] = part;
    });
    inst.parts.forEach((p) => { p.worldId = def.id; p.hasInside = !!insideOf(p); });
    inst.parts.forEach((p) => {
      if (!p.parent) return;
      const par = inst.byId[p.parent];
      if (par) par.kids.push(p); else p.parent = null;
    });
    return inst;
  }
  function disposeTree(o) {
    o.traverse((m) => {
      if (m.geometry) m.geometry.dispose();
      if (m.material) { if (m.material.map) m.material.map.dispose(); m.material.dispose(); }
    });
  }
  function brokenId() { const M = App.mission; return M && !M.fixedPart ? M.broken : null; }
  function evaluate(inst, on, opts) {
    const ideal = opts && opts.ideal, broken = ideal ? null : brokenId();
    const has = (id) => { const p = inst.byId[id]; if (!p || ideal) return true; return p.target === 0 && id !== broken; };
    const out = inst.def.evaluate(has, on, inst) || {};
    out.alive = !!out.alive;
    out.screen = out.screen || { mode: 'off' };
    out.sound = out.sound || {};
    return out;
  }
  const sig = (o) => JSON.stringify(o);

  // ---------------------------------------------------------------- app state
  const LEVELS = [{ n: 1, name: 'Beginner' }, { n: 2, name: 'Medium' }, { n: 3, name: 'Advanced' }];
  const App = {
    inst: null, on: false, out: null, channel: 0, xray: false, focus: null,
    yaw: 0, yawT: 0, pitch: 0.2, pitchT: 0.2, zoom: 1, zoomT: 1, R: 4, lift: 0,
    time: 0, lastScreen: 0, hovered: null, seq: 0, mission: null, lastAlive: false,
    found: {}, wins: store.get('tal-wins', {}), lastShell: -10, lastAct: 0, stack: [], diving: null, level: 1, shadowT: 0,
  };
  TAL.app = App;
  let renderer, scene, camera, turntable, raycaster, kit, sparks, smoke, confetti, dotTex, shadowTex, table, stage, bgDevice, bgWorld, thumbEnv;
  const GLOW = new THREE.Color(0xffc23a), LOOK_GLOW = new THREE.Color(0x2f7de0);
  const tmpC = new THREE.Color(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), Y_AXIS = new THREE.Vector3(0, 1, 0), IDENT = new THREE.Quaternion();
  const tgt = new THREE.Vector3(0, 2, 0);

  const byId = (id) => App.inst.byId[id];
  const isOut = (p) => p.target === 1;
  // In-place parts that stop `p` from coming out: its own blockers, plus, while its parent is still
  // in the device, whatever blocks reaching the parent's pieces (`reach`, e.g. the back cover;
  // defaults to the parent's own blockers).
  function reachBlockers(p, isIn) {
    let list = [];
    for (let c = p; c.parent;) {
      const par = byId(c.parent);
      if (!par || !isIn(par)) break;
      list = list.concat((par.reach || par.blockedBy).map(byId).filter((b) => b && isIn(b)));
      c = par;
    }
    return list;
  }
  function blockersOf(p, isIn) {
    isIn = isIn || ((q) => q.target === 0);
    return uniq(p.blockedBy.map(byId).filter((b) => b && isIn(b)).concat(reachBlockers(p, isIn)));
  }
  const putBlockers = (p) => blockersOf(p);
  const inSubtree = (p, root) => { for (let q = p; q; q = q.parent ? byId(q.parent) : null) if (q === root) return true; return false; };

  function refresh() {
    const inst = App.inst;
    const out = evaluate(inst, App.on);
    out.sound = Object.assign({ song: App.channel }, out.sound);
    if (inst.def.screenStyle === 'crt') {
      if (App.lastAlive && !out.alive) inst.anim = { type: 'off', t0: App.time };
      if (!App.lastAlive && out.alive) inst.anim = { type: 'on', t0: App.time };
    }
    App.lastAlive = out.alive;
    App.out = out;
    Sound.setTV(out.alive ? out.sound : {});
    if (inst.def.apply) inst.def.apply(out, inst, App.on);
    updateUI();
    return out;
  }
  function worldPos(p) { return p.center ? p.obj.localToWorld(p.center.clone()) : p.obj.getWorldPosition(new THREE.Vector3()); }
  function sparkAt(p) {
    const w = worldPos(p);
    sparks.emit(w, 46, { speed: 4, upBias: 1, up: 1.5, life: 0.7, colors: ['#fff6b0', '#ffc23a', '#ff7b2b', '#ffffff'], spread: 0.3 });
    smoke.emit(w, 8, { speed: 0.5, up: 0.6, life: 1.6, colors: ['#9aa0a6', '#7c838a', '#b5bac0'], spread: 0.4 });
  }
  function confettiBurst() {
    const at = App.focus ? worldPos(App.focus) : new THREE.Vector3(0, App.inst.def.view.target[1] + 1.5, 0);
    confetti.emit(at, 220, { speed: 7, upBias: 1.4, up: 3, life: 3, colors: ['#ff5b4f', '#ffc23a', '#3ee08f', '#58b8ff', '#c77dff', '#ffffff'], spread: 1 });
  }
  function discover(p) {
    const id = App.inst.def.id;
    const set = App.found[id] || (App.found[id] = new Set(store.get('tal-found-' + id, [])));
    if (set.has(p.name)) return;
    set.add(p.name);
    store.set('tal-found-' + id, [...set]);
    const total = new Set(App.inst.parts.map((q) => q.name)).size;
    if (set.size === total) {
      Voice.say(`You found every kind of part in the ${App.inst.def.short}! You're a real engineer!`, null, true, "You found every kind of part! You're a real engineer!");
      setTimeout(() => { if (App.inst) { confettiBurst(); Sound.fanfare(); } }, 1200);
    }
  }
  function scorch(p, on) {
    p.scorched = on;
    p.meshes.forEach((m) => {
      const mat = m.material;
      if (!mat.color) return;
      if (mat.userData.c0 == null) mat.userData.c0 = mat.color.getHex();
      mat.color.setHex(mat.userData.c0);
      if (on) mat.color.multiplyScalar(0.25).lerp(tmpC.set(0x2a1408), 0.35);
    });
  }
  function blocked(p, blockers, putting) {
    p.shake = 0.5;
    blockers.forEach((b) => { b.pulse = 1.8; });
    Sound.bonk();
    const names = nameList(blockers);
    Voice.say(putting ? `Wait! Take off the ${names} first, then it can go back in.` : `It's stuck! Take off the ${names} first.`, null, false,
      putting ? 'Wait! Take the glowing part off first, then this can go back in.' : "It's stuck! Take off the glowing part first.");
  }
  // Deeper explanations: the part's own `learn`, else js/learn.js by name, else its one `fact`.
  function learnFor(p) {
    const lv = (p.learn && p.learn.length ? p.learn : null) || (TAL.learn && TAL.learn[p.name]) || (p.fact ? [p.fact] : []);
    return lv.length ? { levels: lv, i: 0 } : null;
  }
  // Fixed parts (in the zoomed-in worlds) don't come off; touching them explains them.
  function explain(p) {
    p.pulse = 1.2;
    discover(p);
    Sound.click();
    Voice.say(p.say, learnFor(p));
    Caption.setPart(p);
  }
  function tryRemove(p, o) {
    if (p.fixed) { if (!(o && o.quiet)) explain(p); return false; }
    const blockers = blockersOf(p);
    if (blockers.length) { if (!(o && o.quiet)) blocked(p, blockers, false); return false; }
    removePart(p, o);
    return true;
  }
  function removePart(p, o) {
    o = o || {};
    const before = evaluate(App.inst, App.on);
    p.target = 1; p.shake = 0; p.pulse = 0; p.manual = false;
    discover(p);
    if (p.kind === 'screw') Sound.unscrew(); else Sound.pop();
    refresh();
    const changed = sig(before) !== sig(evaluate(App.inst, App.on));
    const M = App.mission;
    if (M && M.broken === p.id && !M.found) {
      M.found = true; p.smoke = false;
      scorch(p, true);
      Voice.say(`You found it! The ${lower(p.name)} was broken. Tap it to put in a brand new one!`, null, false, ['You found it! That part was broken.', 'Tap it to put in a brand new one!']);
      Sound.fanfare();
      updateMissionUI();
      return;
    }
    const zapped = changed && before.alive && !p.noSpark;
    if (zapped) { sparkAt(p); Sound.zap(); }
    if (!o.quiet) {
      const showBreak = p.breaks && before.alive && (changed || p.breaksAlways);
      Voice.say(showBreak ? `${p.say} ${p.breaks}` : p.say, learnFor(p), false, showBreak ? [p.say, p.breaks] : p.say);
      Caption.setPart(p);
    }
    if (!o.noGuide) Guide.advance();
  }
  // Put a part back, and quietly put back anything that came off it.
  function restoreKids(p) {
    p.kids.forEach((c) => {
      const M = App.mission;
      if (M && M.broken === c.id && M.found && !M.fixedPart) return; // the burnt part stays out until it's replaced
      c.target = 0; c.manual = false;
      restoreKids(c);
    });
  }
  function putBack(p, o) {
    o = o || {};
    const blockers = putBlockers(p);
    if (blockers.length) { if (!o.quiet) blocked(p, blockers, true); return false; }
    const before = evaluate(App.inst, App.on);
    if (App.focus === p) exitFocus();
    p.target = 0; p.manual = false;
    restoreKids(p);
    Sound.snap();
    const M = App.mission;
    if (M && M.broken === p.id && M.found && !M.fixedPart) {
      scorch(p, false);
      M.fixedPart = true;
      refresh();
      if (!checkMission()) {
        const others = App.inst.parts.some(isOut);
        const rest = others ? 'Now put the other parts back and turn it on to test it.' : App.on ? '' : 'Now turn it on to test it!';
        Voice.say(`A brand new ${lower(p.name)}! ${rest}`, null, false, ['A brand new part!', rest]);
      }
      updateMissionUI();
      return true;
    }
    const after = refresh();
    if (checkMission()) return true;
    if (!o.quiet) {
      const ideal = sig(evaluate(App.inst, true, { ideal: true }));
      if (App.on && sig(after) === ideal && sig(before) !== ideal) { Voice.say(`${p.name} is back in. Everything works again!`, null, false, "It's back in. Everything works again!"); Sound.fanfare(); }
      else Voice.say(`${p.name} goes back in. Click!`, null, false, 'Click! It goes back in.');
    }
    if (!o.noGuide) Guide.advance();
    return true;
  }
  function checkMission() {
    const M = App.mission;
    if (!M || !M.fixedPart || !App.on) return false;
    if (sig(evaluate(App.inst, true)) !== sig(evaluate(App.inst, true, { ideal: true }))) return false;
    const def = App.inst.def;
    App.mission = null;
    App.wins[def.id] = (App.wins[def.id] || 0) + 1;
    store.set('tal-wins', App.wins);
    Sound.fanfare();
    confettiBurst();
    Voice.say(`You fixed it! The ${def.short} works again. You're a real fix-it engineer!`, null, false, "You fixed it! It works again. You're a real fix-it engineer!");
    updateMissionUI(); updateUI();
    return true;
  }
  function powerSound(def) { if (def.powerSound === 'crt') Sound.crtOn(); else if (def.powerSound === 'click') Sound.click(); else Sound.flatOn(); }
  function togglePower() {
    if (!App.inst) return;
    App.on = !App.on;
    const out = refresh();
    const def = App.inst.def, inMission = App.mission && !App.mission.fixedPart;
    if (App.on) {
      if (!out.alive) { Sound.click(); const why = inMission ? '' : out.reason || ''; Voice.say(`Nothing happened! ${why}`, null, false, ['Nothing happened!', why]); }
      else { powerSound(def); if (out.reason && !inMission) Voice.say(out.reason); }
      checkMission();
    } else Sound.off();
    Guide.advance();
  }
  function nextChannel() {
    const inst = App.inst;
    if (!inst || !inst.def.channels) return;
    const knob = inst.def.channelPart && inst.byId[inst.def.channelPart];
    if (knob && knob.target === 1) { Sound.bonk(); knob.pulse = 1.5; Voice.say('The channel knob is missing! Put it back to change the channel.'); return; }
    App.channel = (App.channel + 1) % CHANNELS.length;
    inst.osd = { text: `CH ${App.channel + 1}`, until: App.time + 1.8 };
    Sound.click();
    const out = refresh();
    if (!App.on) Voice.say('Turn it on first, then you can change the channel!');
    else if (out.alive && out.screen.mode === 'picture') Caption.show(`Channel ${App.channel + 1}: ${CHANNELS[App.channel].name}`);
  }
  function explodeAll() {
    const inst = App.inst, token = ++App.seq;
    exitFocus();
    if (!inst.parts.some((p) => p.target === 0 && !p.fixed)) return fixAll();
    const removed = new Set(inst.parts.filter(isOut).map((p) => p.id)), order = [];
    const isIn = (q) => !removed.has(q.id);
    let progress = true;
    while (progress) {
      progress = false;
      for (const p of inst.parts) if (!p.fixed && !removed.has(p.id) && blockersOf(p, isIn).length === 0) { order.push(p); removed.add(p.id); progress = true; }
    }
    const gap = clamp(5500 / Math.max(1, order.length), 28, 170);
    order.forEach((p, i) => setTimeout(() => { if (token === App.seq && p.target === 0) removePart(p, { quiet: true, noGuide: true }); }, i * gap));
    setTimeout(() => { if (token === App.seq) { Voice.say(`Kaboom! You took the whole ${inst.def.short} apart! That's ${inst.parts.length} pieces! Tap any piece to hear what it does.`, null, false, ['Kaboom! You took the whole thing apart!', 'Tap any piece to hear what it does.']); Guide.advance(false); updateUI(); } }, order.length * gap + 400);
  }
  function fixAll(silent) {
    const inst = App.inst, token = ++App.seq;
    exitFocus();
    const depth = {};
    const d = (p) => {
      if (depth[p.id] != null) return depth[p.id];
      depth[p.id] = 0;
      let v = p.blockedBy.length ? 1 + Math.max(...p.blockedBy.map((b) => d(byId(b)))) : 0;
      if (p.parent) v = Math.max(v, d(byId(p.parent)) + 1);
      return (depth[p.id] = v);
    };
    const order = inst.parts.filter(isOut).sort((a, b) => d(b) - d(a));
    const gap = clamp(4500 / Math.max(1, order.length), 22, 150);
    order.forEach((p, i) => setTimeout(() => { if (token === App.seq && p.target === 1) putBack(p, { quiet: true, noGuide: true }); }, i * gap));
    if (!silent) setTimeout(() => { if (token === App.seq) { Voice.say(App.on ? 'All back together!' : 'All back together! Press power to see if it works.'); updateUI(); } }, order.length * gap + 400);
  }
  function startMission() {
    const inst = App.inst;
    if (App.mission) return stopMission();
    const cands = inst.parts.filter((p) => p.symptom);
    if (!cands.length) return;
    App.seq++;
    exitFocus();
    inst.parts.forEach((p) => { p.target = 0; p.manual = false; p.smoke = false; p.pulse = 0; if (p.scorched) scorch(p, false); });
    let pick = cands[(Math.random() * cands.length) | 0];
    if (cands.length > 1 && App.lastBroken === pick.id) pick = cands[(cands.indexOf(pick) + 1) % cands.length];
    App.lastBroken = pick.id;
    App.mission = { broken: pick.id, found: false, fixedPart: false };
    App.on = true;
    App.lastAlive = false;
    refresh();
    powerSound(inst.def);
    Voice.say(`Uh oh, this ${inst.def.short} is broken! ${pick.symptom} Can you find the broken part?`, null, false, ['Uh oh, this one is broken!', pick.symptom, 'Can you find the broken part?']);
    updateMissionUI();
  }
  function stopMission() {
    const M = App.mission;
    if (!M) return;
    const p = byId(M.broken);
    p.smoke = false; scorch(p, false);
    App.mission = null;
    refresh();
    updateMissionUI();
    Caption.show('Mission stopped. You can start a new one any time.');
  }
  function hint() {
    const M = App.mission;
    if (!M) return;
    const p = byId(M.broken);
    if (M.found) { p.pulse = 2.5; Voice.say(`Tap the burnt ${lower(p.name)} to put in a new one!`, null, false, 'Tap the burnt part to put in a new one!'); return; }
    p.smoke = true; p.pulse = 3;
    const blockers = blockersOf(p);
    Voice.say(blockers.length ? `Look for the smoke! You'll need to take off the ${nameList(blockers.slice(0, 3))} to reach it.` : "Look for the smoke! That's the broken part.", null, false,
      blockers.length ? "Look for the smoke! You'll need to take some parts off to reach it." : "Look for the smoke! That's the broken part.");
  }
  function setXray(on) {
    App.xray = on;
    const inst = App.inst, ms = inst.shell.slice();
    inst.parts.filter((p) => p.xray).forEach((p) => ms.push(...p.meshes));
    ms.forEach((m) => {
      const mat = m.material;
      if (!mat.userData.x0) mat.userData.x0 = { t: mat.transparent, o: mat.opacity, d: mat.depthWrite };
      const s = mat.userData.x0;
      mat.transparent = on ? true : s.t;
      mat.opacity = on ? Math.min(s.o, 0.13) : s.o;
      mat.depthWrite = on ? false : s.d;
      mat.needsUpdate = true;
    });
    updateUI();
  }
  // ---- look closer at a pulled-out part that has its own pieces
  function enterFocus(p) {
    App.focus = p;
    p.spinYaw = 0; p.spinPitch = 0;
    App.zoomT = 1;
    $('#focusBar').hidden = false;
    $('#focusName').textContent = p.name;
    Sound.whoosh();
    Voice.say(`Let's look closer at the ${lower(p.name)}! Pull its pieces off with your finger. Drag on the board to flip it around.`, null, false, ["Let's look closer!", 'Pull its pieces off with your finger. Drag on the board to flip it around.']);
    updateUI();
    Guide.advance();
  }
  function exitFocus() {
    if (!App.focus) return;
    App.focus = null;
    $('#focusBar').hidden = true;
    App.zoomT = 1;
    updateUI();
  }

  // ---------------------------------------------------------------- the guide (Sparky tells you what to do next)
  const Guide = {
    on: store.get('tal-guide', true), i: 0, steps: null, target: null, needTurn: false, lastVis: 0, announced: -1,
    // Keep only the steps that fit this level: drop pieces that aren't separate here, and steps left with nothing to do.
    reset(inst) {
      const act = (id) => !!inst.byId[id];
      const steps = (inst.def.guide || [])
        .filter((s) => !s.levels || s.levels.indexOf(inst.level) >= 0)
        .map((s) => (s.ids ? Object.assign({}, s, { ids: s.ids.filter(act) }) : s))
        .filter((s) => (!s.ids || s.ids.length) && (s.do !== 'focus' || (act(s.id) && inst.byId[s.id].kids.length)));
      this.steps = steps.length ? steps : null;
      this.i = 0; this.target = null; this.announced = -1; this.needTurn = false;
    },
    done(s) {
      const inst = App.inst;
      if (!inst) return false;
      switch (s.do) {
        case 'power': return App.on;
        case 'remove': return s.ids.every((id) => byId(id).target === 1);
        case 'removeAny': return s.ids.some((id) => byId(id).target === 1);
        case 'turn': return s.side === 'back' ? Math.cos(App.yawT) < -0.3 : Math.cos(App.yawT) > 0.3;
        case 'focus': return !!App.focus && App.focus.id === s.id;
        case 'exitFocus': return !App.focus;
        default: return false;
      }
    },
    advance(speak) {
      if (!App.inst || !this.steps) return;
      while (this.i < this.steps.length && this.steps[this.i].do !== 'end' && this.done(this.steps[this.i])) this.i++;
      const s = this.steps[this.i];
      if (!s) { this.target = null; return; }
      if (this.announced !== this.i) {
        this.announced = this.i;
        if (this.on && speak !== false) Voice.say(s.say, null, true);
        if (s.do === 'end') { this.i = this.steps.length; this.target = null; return; }
      }
      this.pickTarget();
    },
    current() { return this.steps && this.steps[this.i]; },
    pickTarget() {
      const s = this.current();
      this.target = null;
      if (!s) return;
      if (s.do === 'power') this.target = { el: '#btnPower', label: 'Tap!' };
      else if (s.do === 'turn') this.target = { el: '#btnTurn', label: 'Tap!' };
      else if (s.do === 'exitFocus') this.target = { el: '#btnFocusDone', label: 'Tap!' };
      else if (s.do === 'focus') { const p = byId(s.id); this.target = p.target === 1 ? { part: p, label: 'Tap!' } : { part: p, label: 'Pull!', drag: true }; }
      else {
        let p = s.ids.map(byId).find((q) => q.target === 0 && !blockersOf(q).length) || s.ids.map(byId).find((q) => q.target === 0);
        for (let n = 0; p && n < 6; n++) { const b = blockersOf(p); if (!b.length) break; p = b.find((q) => !blockersOf(q).length) || b[0]; }
        if (p) this.target = { part: p, label: p.kind === 'screw' ? 'Twist!' : 'Pull!', drag: true };
      }
    },
    tick() {
      if (!App.inst || !this.steps) return;
      const s = this.current();
      if (s && s.do === 'turn' && this.done(s)) this.advance();
      if (this.target && this.target.part && App.time - this.lastVis > 0.4) {
        this.lastVis = App.time;
        if (this.target.part.target === 1 && this.target.drag) this.pickTarget();
        this.needTurn = !!(this.target && this.target.part && !App.focus && hiddenOnFarSide(this.target.part));
      }
      if (this.on && s && App.time - App.lastAct > 16 && !Voice.busy()) {
        App.lastAct = App.time;
        Voice.say(this.needTurn ? 'It\'s on the back. Tap the turn around button!' : s.nudge || s.say);
      }
    },
  };
  function hiddenOnFarSide(p) {
    const w = worldPos(p), from = camera.position.clone(), d = w.clone().sub(from), dist = d.length();
    raycaster.set(from, d.normalize());
    const hits = raycaster.intersectObject(App.inst.root, true);
    for (const h of hits) {
      const m = h.object;
      if (!m.visible || m.userData.noPick || m.userData.pickThrough || !m.isMesh) continue;
      if (App.xray && (m.userData.shell || (m.userData.part && m.userData.part.xray))) continue;
      if (m.userData.part && inSubtree(m.userData.part, p)) return false;
      if (h.distance < dist - 0.2) {
        const local = App.inst.root.worldToLocal(w.clone());
        const cam = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, -App.yaw);
        return local.x * cam.x + local.z * cam.z < 0.05;
      }
      return false;
    }
    return false;
  }
  function placeHand() {
    const hand = $('#hand');
    const T = Guide.on && Guide.target;
    if (!T || !App.inst) { hand.hidden = true; return; }
    let x, y, angle = null, label = T.label;
    const useTurn = Guide.needTurn && T.part;
    if (T.el || useTurn) {
      const el = $(useTurn ? '#btnTurn' : T.el);
      if (!el || el.hidden || !el.offsetParent) { hand.hidden = true; return; }
      const r = (el.querySelector('.ic') || el).getBoundingClientRect();
      x = r.left + r.width / 2; y = r.top + r.height / 2;
      if (useTurn) label = 'Turn!';
    } else {
      const p = T.part, s = toScreen(worldPos(p));
      x = s.x; y = s.y;
      if (T.drag) { const d = pullScreenDir(p); if (Math.hypot(d.x, d.y) > 20) angle = Math.atan2(d.y, d.x); }
    }
    hand.hidden = false;
    hand.classList.toggle('above', !!(T.el || useTurn));
    hand.style.transform = `translate(${x}px, ${y}px)`;
    const arrow = hand.querySelector('.arrow');
    arrow.hidden = angle == null;
    if (angle != null) arrow.style.transform = `rotate(${angle}rad)`;
    hand.querySelector('.hand-label').textContent = label;
  }

  // ---------------------------------------------------------------- picking + input
  function toScreen(v) {
    const p = v.clone().project(camera), r = renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
  }
  function pullScreenDir(p) {
    const par = p.obj.parent;
    const a = par.localToWorld(p.home.clone());
    const b = par.localToWorld(p.kind === 'screw' ? p.home.clone().addScaledVector(p.axisOut, 1) : p.home.clone().add(p.pullV));
    const sa = toScreen(a), sb = toScreen(b);
    return { x: sb.x - sa.x, y: sb.y - sa.y };
  }
  function pick(x, y) {
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(App.inst.root, true);
    let ghostPart = null;
    for (const h of hits) {
      const m = h.object;
      if (!m.visible || m.userData.noPick || !m.isMesh) continue;
      const part = m.userData.part;
      if (App.focus && (!part || !inSubtree(part, App.focus))) continue;
      const ghost = m.userData.pickThrough || (App.xray && (m.userData.shell || (part && part.xray && part.target === 0)));
      if (ghost) { if (!ghostPart && part) ghostPart = part; continue; }
      if (m.userData.shell) return { shell: true };
      if (part) return { part };
    }
    return ghostPart ? { part: ghostPart } : null;
  }
  function onTap(x, y) {
    if (!App.inst) return;
    const hit = pick(x, y);
    if (!hit) return;
    if (hit.shell) {
      if (App.time - App.lastShell > 4) { App.lastShell = App.time; Voice.say(App.inst.def.shellSay || "That's the case. It holds everything together."); }
      return;
    }
    const p = hit.part;
    if (App.lookMode && p.hasInside) { diveInto(p); return; }
    if (App.focus && p === App.focus) { Voice.say(`${p.say} Pull its pieces off with your finger!`, learnFor(p), false, [p.say, 'Pull its pieces off with your finger!']); Caption.setPart(p); return; }
    if (p.fixed) { explain(p); return; }
    if (p.target === 0) tryRemove(p);
    else if (p.kids.length && !App.focus) enterFocus(p);
    else putBack(p);
  }
  function setupInput(canvas) {
    const pointers = new Map();
    let pinch = null, multi = false, drag = null;
    canvas.addEventListener('pointerdown', (e) => {
      Sound.unlock();
      App.lastAct = App.time;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: 0 });
      if (pointers.size === 1 && App.inst) {
        const hit = pick(e.clientX, e.clientY);
        drag = { mode: null, part: hit && hit.part ? hit.part : null, prog: 0 };
      }
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: App.zoomT };
        multi = true;
        if (drag && drag.mode === 'pull' && drag.part) { drag.part.manual = false; }
        drag = null;
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      const p = pointers.get(e.pointerId);
      if (!p) {
        if (e.pointerType === 'mouse' && App.inst) hover(e.clientX, e.clientY);
        return;
      }
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      p.moved = Math.max(p.moved, Math.hypot(p.x - p.sx, p.y - p.sy));
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        App.zoomT = clamp((pinch.z * pinch.d) / Math.max(1, d), 0.25, 1.8);
        return;
      }
      if (pointers.size !== 1 || p.moved < 8 || !drag) return;
      if (!drag.mode) {
        let part = drag.part;
        if (part && part.target === 0 && !part.fixed) {
          let bl = blockersOf(part);
          // Little fingers grab whatever is under them: if that piece is stuck, pull the thing in its way instead.
          if (bl.length) {
            const free = bl.filter((b) => !b.fixed && !blockersOf(b).length);
            const gp = Guide.on && Guide.target && Guide.target.part;
            const swap = free.find((b) => b === gp) || free[0];
            if (swap) { part = drag.part = swap; bl = []; }
          }
          if (bl.length) { blocked(part, bl, false); drag.mode = App.focus ? 'spin' : 'rotate'; }
          else {
            const dir = pullScreenDir(part), len = Math.hypot(dir.x, dir.y);
            drag.mode = 'pull';
            drag.dir = len > 22 ? { x: dir.x / len, y: dir.y / len } : null;
            drag.th = len > 22 ? clamp(len * 0.7, 70, 150) : 90;
            part.manual = true;
            setTip(null);
          }
        } else if (part && part.target === 1 && !part.fixed && part.t > 0.95 && !(App.focus && part === App.focus)) {
          drag.mode = 'move';
          setTip(null);
        } else drag.mode = App.focus ? 'spin' : 'rotate';
      }
      if (drag.mode === 'move') {
        movePart(drag, p.x, p.y);
        return;
      }
      if (drag.mode === 'pull') {
        const part = drag.part, ddx = p.x - p.sx, ddy = p.y - p.sy;
        // Any direction works for little fingers; the part's own direction just works faster.
        const along = Math.max(drag.dir ? ddx * drag.dir.x + ddy * drag.dir.y : 0, Math.hypot(ddx, ddy) * 0.6);
        const prog = clamp(along / drag.th, 0, 1);
        if (Math.floor(prog * 6) > Math.floor(drag.prog * 6) && part.kind === 'screw') Sound.tick();
        drag.prog = prog;
        part.t = prog * 0.92;
        if (prog >= 1) { drag.mode = 'done'; removePart(part); }
      } else if (drag.mode === 'spin' && App.focus) {
        App.focus.spinYaw += dx * 0.012;
        App.focus.spinPitch = clamp(App.focus.spinPitch + dy * 0.01, -1.4, 1.4);
      } else if (drag.mode === 'rotate') {
        App.yawT += dx * 0.009;
        App.pitchT = clamp(App.pitchT + dy * 0.006, -1.05, 1.4);
        setTip(null);
      }
    });
    const end = (e) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (drag && drag.mode === 'pull') {
        const part = drag.part;
        if (drag.prog > 0.3) removePart(part);
        else { part.manual = false; Sound.boing(); }
        drag.mode = 'done';
      }
      if (e.type === 'pointerup' && !multi && p.moved < 10 && performance.now() - p.t < 650) onTap(e.clientX, e.clientY);
      if (pointers.size === 0) { multi = false; drag = null; }
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', () => { if (!pointers.size) { App.hovered = null; setTip(null); } });
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); App.zoomT = clamp(App.zoomT * Math.exp(e.deltaY * 0.0012), 0.25, 1.8); }, { passive: false });
    // iPad: stop the page itself from zooming or showing callouts
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((t) => document.addEventListener(t, (e) => e.preventDefault()));
    document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('contextmenu', (e) => { if (e.target === canvas) e.preventDefault(); });
  }
  // Slide a pulled-out piece across a plane facing the camera, never below the tabletop.
  function movePart(drag, x, y) {
    const part = drag.part, wp = worldPos(part);
    const r = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
    if (!drag.plane) drag.plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), wp);
    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(drag.plane, hit)) return;
    if (!drag.grab) { drag.grab = hit.clone().sub(wp); return; }
    const want = hit.sub(drag.grab);
    want.y = Math.max(want.y, 0.12);
    const local = part.obj.parent.worldToLocal(want);
    local.sub(part.center.clone().applyQuaternion(part.obj.quaternion)).sub(part.home);
    if (part.kind === 'screw') local.addScaledVector(part.axisOut, -0.35);
    part.pullV.copy(local);
    part.moved = true;
    Caption.setPart(part);
  }
  function hover(x, y) {
    const hit = pick(x, y);
    const p = hit && hit.part ? hit.part : null;
    App.hovered = p;
    renderer.domElement.style.cursor = p ? 'pointer' : 'grab';
    if (p) setTip(p.name, (p.fixed ? 'Tap to learn about it' : p.target === 0 ? 'Drag or tap to pull it out' : p.kids.length && !App.focus ? 'Tap to look closer, drag to move' : 'Tap to put it back, drag to move') + (p.hasInside ? '. Has an inside view!' : ''), x, y);
    else setTip(null);
  }
  function setTip(name, sub, x, y) {
    const tip = $('#tip');
    if (!name) { tip.hidden = true; return; }
    tip.hidden = false;
    tip.innerHTML = '';
    const b = document.createElement('b'); b.textContent = name;
    const s = document.createElement('span'); s.textContent = sub;
    tip.append(b, s);
    tip.style.left = Math.min(x + 18, innerWidth - 220) + 'px';
    tip.style.top = y + 18 + 'px';
  }

  // ---------------------------------------------------------------- UI
  function updateUI() {
    const inst = App.inst;
    if (!inst) return;
    $('#btnPower').classList.toggle('on', App.on);
    const anyIn = inst.parts.some((p) => p.target === 0 && !p.fixed);
    $('#btnApart .lb').textContent = anyIn ? 'Take apart' : 'Put back';
    $('#btnApart').classList.toggle('active', !anyIn);
    $('#btnXray').classList.toggle('active', App.xray);
    $('#btnMission').classList.toggle('active', !!App.mission);
    $('#btnLook').hidden = !inst.parts.some((p) => p.hasInside);
    $('#btnSound').classList.toggle('off', Sound.muted);
    $('#btnVoice').classList.toggle('off', !Voice.on);
    $('#btnGuide').classList.toggle('off', !Guide.on);
    $('#btnGuide').hidden = !inst.def.guide;
    const movable = inst.parts.filter((p) => !p.fixed), out = movable.filter(isOut).length;
    $('#foundN').textContent = `${out} of ${movable.length}`;
    $('#foundBar').style.width = (movable.length ? Math.round((out / movable.length) * 100) : 0) + '%';
    $('#found').hidden = !movable.length;
    const w = App.wins[inst.def.id] || 0;
    $('#fixes').hidden = !w;
    $('#fixesN').textContent = w;
  }
  function updateMissionUI() {
    const M = App.mission, el = $('#mission');
    el.hidden = !M;
    if (!M) return;
    const p = byId(M.broken);
    $('#missionText').textContent = M.fixedPart
      ? 'New part is in! Put everything back and turn it on.'
      : M.found ? 'You found it! Tap the burnt part to put in a new one.' : `${p.symptom} Find the broken part.`;
  }
  // ---- devices, and the worlds inside their parts: a stack (device > LED > LED chip > atoms)
  function disposeStack() { App.stack.forEach((st) => disposeTree(st.inst.root)); App.stack = []; }
  function loadInst(def, level, world) {
    setLookMode(false);
    const inst = instantiate(def, kit, level);
    if (!world) {
      const sh = def.view.shadow || [5, 4];
      const blob = new THREE.Mesh(new THREE.PlaneGeometry(sh[0] * 1.6, sh[1] * 1.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.4 }));
      blob.rotation.x = -Math.PI / 2; blob.position.y = 0.01; blob.userData.noPick = true;
      inst.root.add(blob);
    }
    prepShadows(inst.root);
    turntable.add(inst.root);
    Object.assign(App, { inst, on: !!world && def.startOn !== false, channel: 0, mission: null, lastAlive: false, hovered: null, xray: false, focus: null, lastAct: App.time });
    $('#focusBar').hidden = true;
    const v = def.view;
    App.yaw = App.yawT = v.yaw || 0;
    App.pitch = App.pitchT = v.pitch == null ? 0.2 : v.pitch;
    App.zoom = App.zoomT = 1;
    tgt.set(0, v.target[1], 0);
    setWorldLook(world);
    Guide.reset(inst);
    refresh();
    $('#home').hidden = true; $('#hud-top').hidden = false; $('#tools').hidden = false; $('#zoomCtl').hidden = false;
    $('#btnChannel').hidden = !def.channels;
    $('#btnMission').hidden = world || !inst.parts.some((p) => p.symptom);
    updateMissionUI();
    updateCrumbs();
    return inst;
  }
  function openDevice(def, level) {
    level = level || store.get('tal-level-' + def.id, 1);
    store.set('tal-level-' + def.id, level);
    App.seq++;
    Voice.stop();
    if (App.inst) { turntable.remove(App.inst.root); disposeTree(App.inst.root); }
    disposeStack();
    App.diving = null; $('#zoomFx').className = '';
    App.level = level;
    loadInst(def, level, false);
    App.R = def.view.radius;
    Caption.setPart(null);
    const first = !store.get('tal-safety', false);
    store.set('tal-safety', true);
    Voice.say(def.intro + (first ? ' ' + SAFETY : ''), null, false, first ? [def.intro, SAFETY] : def.intro);
    Guide.advance();
    try { history.replaceState(null, '', '#' + def.id); } catch (e) { /* ignore */ }
  }
  function insideOf(p) {
    const id = p && (p.inside || TAL.insideByName[p.name]);
    if (!id || !TAL.worlds[id]) return null;
    // A part named like the thing it sits inside ("Color filter" inside the pixel) must not
    // open the world you're already in, or any world above you: that's a loop, not a dive.
    if (id === p.worldId || App.stack.some((st) => st.inst.def.id === id)) return null;
    return id;
  }
  // Fly into a part, then open the world inside it.
  function diveInto(p) {
    const id = insideOf(p);
    if (!id || App.diving || !App.inst) return;
    App.seq++;
    Voice.stop();
    setTip(null);
    App.diving = { p, def: TAL.worlds[id] };
    setLookMode(false);
    Sound.whoosh();
    $('#zoomFx').className = 'in';
    setTimeout(() => {
      const d = App.diving;
      if (!d || !App.inst) return;
      App.stack.push({ inst: App.inst, on: App.on, channel: App.channel, yaw: App.yawT, pitch: App.pitchT, zoom: App.zoomT, xray: App.xray, mission: App.mission,
        focus: App.focus, guide: { steps: Guide.steps, i: Guide.i, announced: Guide.announced }, crumb: d.p.name, R: App.R, part: d.p });
      turntable.remove(App.inst.root);
      App.diving = null;
      loadInst(d.def, 3, true);
      App.R = d.def.view.radius * 0.12; // start up close, then fly out
      $('#zoomFx').className = 'out';
      Caption.setPart(null);
      Voice.say(d.def.intro, d.def.learn ? { levels: d.def.learn, i: 0 } : null);
    }, 620);
  }
  function goBack() {
    setLookMode(false);
    if (!App.stack.length) { goHome(); return; }
    App.seq++;
    Voice.stop();
    setTip(null);
    turntable.remove(App.inst.root);
    disposeTree(App.inst.root);
    const st = App.stack.pop();
    turntable.add(st.inst.root);
    Object.assign(App, { inst: st.inst, on: st.on, channel: st.channel, mission: st.mission, xray: st.xray, focus: null, hovered: null, lastAct: App.time });
    App.yaw = App.yawT = st.yaw; App.pitch = App.pitchT = st.pitch; App.zoom = App.zoomT = st.zoom;
    App.R = st.R * 0.3;
    Guide.steps = st.guide.steps; Guide.i = st.guide.i; Guide.announced = st.guide.announced; Guide.target = null; Guide.pickTarget();
    setWorldLook(App.stack.length > 0);
    App.lastAlive = evaluate(App.inst, App.on).alive;
    refresh();
    if (st.focus && st.focus.target === 1) { App.focus = st.focus; $('#focusBar').hidden = false; $('#focusName').textContent = st.focus.name; }
    else $('#focusBar').hidden = true;
    $('#btnChannel').hidden = !App.inst.def.channels;
    $('#btnMission').hidden = App.stack.length > 0 || !App.inst.parts.some((p) => p.symptom);
    updateMissionUI();
    updateCrumbs();
    Caption.setPart(st.part);
    $('#zoomFx').className = 'back';
    setTimeout(() => { if ($('#zoomFx').className === 'back') $('#zoomFx').className = ''; }, 450);
    Sound.whoosh();
    Caption.show(`Back out to the ${lower(App.stack.length ? st.crumb : App.inst.def.name)}.`);
  }
  function updateCrumbs() {
    if (!App.inst) return;
    const rootDef = App.stack.length ? App.stack[0].inst.def : App.inst.def;
    const trail = [rootDef.name].concat(App.stack.map((st) => st.crumb));
    const el = $('#devName');
    el.innerHTML = '';
    trail.forEach((t, i) => {
      if (i) { const sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = '\u203A'; el.append(sep); }
      const sp = document.createElement('span'); sp.textContent = t;
      if (i < trail.length - 1) sp.className = 'up';
      el.append(sp);
    });
    const lv = $('#devLevel');
    if (App.stack.length) { lv.textContent = App.inst.def.zoom + ' bigger'; lv.dataset.level = 'z'; }
    else { lv.textContent = LEVELS[(App.level || 1) - 1].name; lv.dataset.level = App.level || 1; }
    $('#btnHome .lbl').textContent = App.stack.length ? 'Back' : 'Devices';
  }
  function goHome() {
    App.seq++;
    Voice.stop();
    Sound.setTV({});
    if (App.inst) { turntable.remove(App.inst.root); disposeTree(App.inst.root); }
    disposeStack();
    App.inst = null; App.mission = null; App.focus = null; App.diving = null;
    Guide.target = null;
    Caption.setPart(null);
    setWorldLook(false);
    $('#zoomFx').className = '';
    $('#home').hidden = false; $('#hud-top').hidden = true; $('#tools').hidden = true; $('#mission').hidden = true; $('#focusBar').hidden = true; $('#hand').hidden = true; $('#lookBadge').hidden = true; $('#zoomCtl').hidden = true;
    $('#caption').classList.remove('show');
    setTip(null);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
  }
  // Bigger pieces cast soft shadows; everything catches them.
  function prepShadows(root) {
    root.traverse((m) => {
      if (!m.isMesh) return;
      m.receiveShadow = true;
      const g = m.geometry;
      if (!g.boundingSphere) g.computeBoundingSphere();
      const sc = Math.max(m.scale.x, m.scale.y, m.scale.z);
      m.castShadow = !m.material.transparent && !m.userData.noPick && g.boundingSphere.radius * sc > 0.07;
    });
  }
  function setWorldLook(world) {
    if (!scene) return;
    table.visible = !world;
    stage.visible = !!world;
    scene.background = world ? bgWorld : bgDevice;
    scene.fog.color.set(world ? 0x050a14 : 0x141a27);
  }
  function addLights(sc, shadows) {
    sc.add(new THREE.HemisphereLight(0xdfe8ff, 0x3a2a1f, 0.5));
    const key = new THREE.DirectionalLight(0xfff1e0, 1.2);
    key.position.set(5, 10, 7);
    sc.add(key);
    if (shadows) {
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      const c = key.shadow.camera;
      c.left = -11; c.right = 11; c.top = 11; c.bottom = -11; c.near = 1; c.far = 40;
      key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
    }
    const back = new THREE.DirectionalLight(0xcfe0ff, 0.55); back.position.set(-6, 5, -7); sc.add(back);
    const side = new THREE.DirectionalLight(0xffffff, 0.22); side.position.set(8, 2, -2); sc.add(side);
    const under = new THREE.DirectionalLight(0xffe2c4, 0.3); under.position.set(0, -6, 3); sc.add(under); // so the bottom isn't black when you look from below
  }
  // A soft "photo studio" for reflections on metal, glass and plastic.
  function studioEnv(r) {
    const pm = new THREE.PMREMGenerator(r);
    const s2 = new THREE.Scene();
    s2.add(new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x2c3344, side: THREE.BackSide })));
    const panel = (w, h, x, y, z, rx, ry, c) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s2.add(m);
    };
    panel(9, 4, 0, 5.9, 0, Math.PI / 2, 0, 0xffffff);
    panel(5, 7, -9.9, 2, 1, 0, Math.PI / 2, 0xfff0dc);
    panel(5, 7, 9.9, 2, -2, 0, -Math.PI / 2, 0xd6e4ff);
    panel(12, 3, 0, -2, -9.9, 0, 0, 0x7a5a3c);
    panel(6, 4, 0, 3, 9.9, 0, Math.PI, 0x9fb2d0);
    const env = pm.fromScene(s2, 0.04).texture;
    pm.dispose();
    return env;
  }
  function gradientTex(top, bottom) {
    const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256;
    const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    x.fillStyle = g; x.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    return t;
  }
  function makeStage() {
    const grid = kit.canvasTex(512, 512, (c, w) => {
      c.fillStyle = '#0a1424'; c.fillRect(0, 0, w, w);
      c.strokeStyle = 'rgba(88,184,255,0.28)'; c.lineWidth = 2;
      for (let i = 0; i <= 16; i++) { const v = (i * w) / 16; c.beginPath(); c.moveTo(v, 0); c.lineTo(v, w); c.stroke(); c.beginPath(); c.moveTo(0, v); c.lineTo(w, v); c.stroke(); }
    });
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.6, 0.16, 72), new THREE.MeshStandardMaterial({ map: grid, roughness: 0.45, metalness: 0.3 }));
    disc.position.y = -0.08; disc.receiveShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.45, 0.045, 10, 96), new THREE.MeshBasicMaterial({ color: 0x58b8ff, toneMapped: false }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.01;
    g.add(disc, ring);
    g.visible = false;
    return g;
  }
  function frameDistance(R, cam) {
    const vf = THREE.MathUtils.degToRad(cam.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    return R / Math.sin(Math.min(vf, hf) / 2);
  }
  function makeThumb(def, r) {
    const sc = new THREE.Scene();
    addLights(sc);
    if (thumbEnv) sc.environment = thumbEnv;
    const inst = instantiate(def, kit, 1);
    sc.add(inst.root);
    inst.root.rotation.y = def.view.yaw || 0;
    const out = evaluate(inst, true, { ideal: true });
    if (inst.screen) renderScreen(inst, out, 1.3);
    if (def.apply) def.apply(out, inst, true);
    const cam = new THREE.PerspectiveCamera(36, 4 / 3, 0.1, 100);
    const d = frameDistance(def.view.radius * 0.95, cam), p = def.view.pitch == null ? 0.2 : def.view.pitch;
    cam.position.set(0, def.view.target[1] + d * Math.sin(p), d * Math.cos(p));
    cam.lookAt(0, def.view.target[1], 0);
    r.render(sc, cam);
    const url = r.domElement.toDataURL('image/png');
    disposeTree(inst.root);
    return url;
  }
  function buildHome() {
    const grid = $('#cards');
    grid.innerHTML = '';
    let tr = null;
    try {
      tr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      tr.setPixelRatio(1); tr.setSize(480, 360, false); tr.outputEncoding = THREE.sRGBEncoding;
      tr.toneMapping = THREE.ACESFilmicToneMapping; tr.toneMappingExposure = 1.1;
      thumbEnv = studioEnv(tr);
    } catch (e) { tr = null; }
    TAL.devices.forEach((def) => {
      const card = document.createElement('div');
      card.className = 'card';
      const pic = document.createElement('button'); pic.type = 'button'; pic.className = 'card-pic'; pic.setAttribute('aria-label', 'Open the ' + def.name);
      const img = document.createElement('img'); img.alt = '';
      pic.append(img);
      pic.addEventListener('click', () => openDevice(def));
      const n = document.createElement('span'); n.className = 'card-name'; n.textContent = def.name;
      const s = document.createElement('span'); s.className = 'card-sub'; s.textContent = def.subtitle || '';
      // piece counts per level, read straight from the device's part list
      const built = def.build(kit);
      const counts = LEVELS.map((l) => built.parts.filter((p) => (p.level || 1) <= l.n).length);
      disposeTree(built.root);
      const row = document.createElement('div'); row.className = 'levels';
      LEVELS.forEach((l, i) => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'lvl'; btn.dataset.level = l.n;
        const stars = document.createElement('span'); stars.className = 'stars'; stars.textContent = '★'.repeat(l.n);
        const nm = document.createElement('b'); nm.textContent = l.name;
        const ct = document.createElement('span'); ct.className = 'count'; ct.textContent = counts[i] + ' pieces';
        btn.append(stars, nm, ct);
        btn.addEventListener('click', () => openDevice(def, l.n));
        row.append(btn);
      });
      card.append(pic, n, s, row);
      grid.appendChild(card);
      if (tr) { try { img.src = makeThumb(def, tr); } catch (e) { /* thumbnail optional */ } }
    });
    if (tr) { if (thumbEnv) thumbEnv.dispose(); thumbEnv = null; tr.dispose(); if (tr.forceContextLoss) tr.forceContextLoss(); }
  }
  function woodTexture() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 512;
    const x = cv.getContext('2d'); x.fillStyle = '#a06d3d'; x.fillRect(0, 0, 512, 512);
    const r = rng(3);
    for (let i = 0; i < 80; i++) {
      x.strokeStyle = `rgba(${(60 + r() * 40) | 0},${(32 + r() * 20) | 0},14,${0.12 + r() * 0.25})`;
      x.lineWidth = 1 + r() * 3;
      x.beginPath();
      const y = r() * 512;
      x.moveTo(0, y);
      for (let s = 0; s <= 8; s++) x.lineTo(s * 64, y + Math.sin(s * 0.9 + i) * 6 * r());
      x.stroke();
    }
    const t = new THREE.CanvasTexture(cv);
    t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2);
    return t;
  }
  function shadowTexture() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const x = cv.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  }
  function wireButtons() {
    // Wake up sound on every touch, before any button handles it (iPad needs this).
    const wake = () => { Sound.unlock(); Voice.unlock(); };
    ['touchend', 'pointerup', 'click', 'keydown'].forEach((t) => document.addEventListener(t, wake, true));
    const on = (id, fn) => $(id).addEventListener('click', () => { Sound.unlock(); App.lastAct = App.time; fn(); });
    on('#btnSoundCheck', () => {
      Sound.fanfare();
      Voice.say("Hi! I'm Sparky. If you can hear me, we're ready to take things apart!");
      $('#soundHelp').hidden = false;
    });
    on('#btnHome', goBack);
    on('#lookBadge', () => { if (Caption.part) diveInto(Caption.part); });
    on('#btnPower', togglePower);
    on('#btnChannel', nextChannel);
    on('#btnTurn', () => { App.yawT += Math.PI; Sound.whoosh(); });
    on('#btnXray', () => { setXray(!App.xray); Sound.click(); if (App.xray) Caption.show('X-ray vision! Now you can see inside the case.'); });
    on('#btnApart', explodeAll);
    on('#btnLook', toggleLookMode);
    on('#btnZoomIn', () => { App.zoomT = clamp(App.zoomT * 0.7, 0.25, 1.8); });
    on('#btnZoomOut', () => { App.zoomT = clamp(App.zoomT / 0.7, 0.25, 1.8); });
    on('#btnZoomReset', () => {
      if (!App.inst) return;
      const v = App.inst.def.view;
      App.zoomT = 1; App.yawT = v.yaw || 0; App.pitchT = v.pitch == null ? 0.2 : v.pitch;
      Caption.setPart(null);
    });
    on('#btnHelp', () => { $('#helpCard').hidden = false; });
    on('#btnHelpClose', () => { $('#helpCard').hidden = true; });
    on('#btnMission', startMission);
    on('#btnHint', hint);
    on('#btnStop', stopMission);
    on('#btnFocusBack', () => { const p = App.focus; if (p) putBack(p); });
    on('#btnFocusDone', () => { exitFocus(); Guide.advance(); });
    on('#btnSound', () => { Sound.setMuted(!Sound.muted); updateUI(); });
    on('#btnVoice', () => { Voice.on = !Voice.on; store.set('tal-voice', Voice.on); if (!Voice.on) Voice.stop(); else Voice.say('I can talk again!'); updateUI(); });
    on('#btnGuide', () => {
      Guide.on = !Guide.on; store.set('tal-guide', Guide.on);
      if (Guide.on) { Guide.announced = -1; Guide.advance(); } else Caption.show('Okay! You explore on your own. Tap the hand button if you want my help again.');
      updateUI();
    });
    document.addEventListener('keydown', (e) => {
      if (!App.inst || e.target.closest('input,textarea')) return;
      if (e.key === 'p') togglePower();
      else if (e.key === 'c') nextChannel();
      else if (e.key === 'x') setXray(!App.xray);
      else if (e.key === 'Escape') { if (App.focus) exitFocus(); else goBack(); }
    });
    // iOS only allows sound after a touch; unlock on the very first one anywhere.
    const firstTouch = () => { Sound.unlock(); document.removeEventListener('touchend', firstTouch); document.removeEventListener('click', firstTouch); };
    document.addEventListener('touchend', firstTouch);
    document.addEventListener('click', firstTouch);
  }

  // ---------------------------------------------------------------- main loop
  const camLocal = new THREE.Vector3(), faceQ = new THREE.Quaternion(), pitchAxis = new THREE.Vector3();
  function loop(now) {
    requestAnimationFrame(loop);
    const t = now / 1000, dt = Math.min(0.05, App.time ? t - App.time : 0.016);
    App.time = t;
    const inst = App.inst;
    if (!inst) { renderer.shadowMap.needsUpdate = true; renderer.render(scene, camera); return; }
    const v = inst.def.view;
    const k6 = Math.min(1, dt * 6), k3 = Math.min(1, dt * 3);
    App.yaw += (App.yawT - App.yaw) * k6;
    App.pitch += (App.pitchT - App.pitch) * k6;
    App.zoom += (App.zoomT - App.zoom) * k6;
    turntable.rotation.y = App.yaw;
    turntable.updateMatrixWorld(true);
    let wantR, wantLift;
    if (App.diving) {
      // flying into a part: aim at it and rush in
      tgt.lerp(worldPos(App.diving.p), Math.min(1, dt * 8));
      wantR = 0.05;
      wantLift = 0;
    } else if (App.focus) {
      const w = worldPos(App.focus);
      tgt.lerp(w, k3);
      wantR = (App.focus.focusRadius || 1.4) * App.zoom;
      wantLift = 0;
    } else {
      const outFrac = inst.parts.reduce((s, p) => s + p.t, 0) / inst.parts.length;
      const f = Math.min(1, outFrac * 1.8);
      const center = new THREE.Vector3(0, lerp(v.target[1], v.explodedY || v.target[1], f), 0);
      // zoomed in? lean toward the last piece you touched
      const zp = Caption.part && inst.parts.indexOf(Caption.part) >= 0 ? Caption.part : null;
      const lean = zp ? clamp((1 - App.zoom) / 0.55, 0, 1) : 0;
      if (lean > 0) center.lerp(worldPos(zp), lean);
      tgt.lerp(center, k3);
      wantR = lerp(v.radius, v.explodedRadius || v.radius * 1.5, f) * App.zoom;
      wantLift = wantR * 0.22 * (1 - lean);
    }
    const kR = App.diving ? Math.min(1, dt * 5) : k3;
    App.R += (wantR - App.R) * kR;
    App.lift += (wantLift - App.lift) * kR;
    const dist = frameDistance(App.R, camera);
    camera.position.set(tgt.x, tgt.y + App.lift + dist * Math.sin(App.pitch), tgt.z + dist * Math.cos(App.pitch));
    camera.lookAt(tgt.x, tgt.y + App.lift, tgt.z);
    camLocal.set(0, Math.sin(App.pitch), Math.cos(App.pitch)).applyAxisAngle(Y_AXIS, -App.yaw).normalize();
    // the table (or the stage) fades away when you look from underneath
    const tableWant = clamp((camera.position.y - 0.1) / 1.4, 0.06, 1);
    [table, stage].forEach((o) => o.traverse((m) => {
      if (!m.material) return;
      m.material.transparent = true;
      m.material.opacity += (tableWant - m.material.opacity) * k6;
      m.material.depthWrite = m.material.opacity > 0.9;
    }));
    let moving = App.diving || App.focus || Math.abs(App.yawT - App.yaw) > 0.002 || Math.abs(App.pitchT - App.pitch) > 0.002 || !!inst.def.tick;

    const guidePart = Guide.on && Guide.target && Guide.target.part;
    for (const p of inst.parts) {
      if (p.manual || p.t !== p.target || p.shake > 0) moving = true;
      if (!p.manual && p.t !== p.target) {
        const dur = p.kind === 'screw' ? 0.95 : 0.65;
        p.t = clamp(p.t + (p.target > p.t ? 1 : -1) * (dt / dur), 0, 1);
      }
      // spin: a focused part turns to face you, and your finger can flip it
      if (p === App.focus) {
        faceQ.setFromUnitVectors(p.face, camLocal);
        pitchAxis.crossVectors(Y_AXIS, camLocal).normalize();
        tmpQ.setFromAxisAngle(Y_AXIS, p.spinYaw).multiply(tmpQ2.setFromAxisAngle(pitchAxis, p.spinPitch)).multiply(faceQ);
        p.spinQ.slerp(tmpQ, k6);
      } else if (p.spinQ.w < 0.99999) p.spinQ.slerp(IDENT, k6);
      const o = p.obj;
      if (p.kind === 'screw') {
        const a = clamp(p.t / 0.45, 0, 1), b = clamp((p.t - 0.45) / 0.55, 0, 1);
        o.position.copy(p.home).addScaledVector(p.axisOut, 0.35 * a).addScaledVector(p.pullV, ease(b));
        o.quaternion.copy(p.spinQ).multiply(p.homeQuat).multiply(tmpQ2.setFromAxisAngle(Y_AXIS, -a * Math.PI * 6));
      } else {
        o.position.copy(p.home).addScaledVector(p.pullV, p.manual ? p.t : ease(p.t));
        o.quaternion.copy(p.spinQ).multiply(p.homeQuat);
      }
      if (p.t === 1 && p !== App.focus && !(App.focus && inSubtree(p, App.focus))) o.position.y += Math.sin(t * 1.6 + p.index) * 0.03;
      if (p.shake > 0) { p.shake -= dt; o.position.x += Math.sin(t * 70) * 0.05 * (p.shake / 0.5); }
      if (p.pulse > 0) p.pulse -= dt;
      const glow = (p === App.hovered ? 0.4 : 0) + (p.pulse > 0 ? (0.5 + 0.5 * Math.sin(t * 12)) * 0.7 : 0) + (p === guidePart ? (0.5 + 0.5 * Math.sin(t * 5)) * 0.55 : 0);
      const lg = App.lookMode && p.hasInside ? 0.45 + 0.3 * Math.sin(t * 4) : 0;
      if (Math.abs(glow - p.glowNow) > 0.01 || Math.abs(lg - (p.lgNow || 0)) > 0.01) {
        p.glowNow = glow; p.lgNow = lg;
        p.meshes.forEach((m) => {
          const mat = m.material;
          if (!mat.emissive || mat.userData.selfLit) return;
          mat.emissive.setHex(mat.userData.e0 || 0).lerp(LOOK_GLOW, Math.min(1, lg)).lerp(GLOW, Math.min(1, glow));
        });
      }
      if (p.smoke) {
        p.smokeT -= dt;
        if (p.smokeT <= 0) { p.smokeT = 0.12; smoke.emit(worldPos(p), 1, { speed: 0.3, up: 0.9, life: 2.2, colors: ['#8e949b', '#6f757c', '#a9aeb4'], spread: 0.25 }); }
      }
    }
    if (inst.refs.knob) {
      const kt = -App.channel * (Math.PI / 3);
      inst.refs.knob.rotation.z += (kt - inst.refs.knob.rotation.z) * k6;
    }
    sparks.update(dt); smoke.update(dt); confetti.update(dt);
    if (inst.screen && t - App.lastScreen > 1 / 30) { renderScreen(inst, App.out, t); App.lastScreen = t; }
    if (inst.def.tick) inst.def.tick(dt, t, inst, App.out, App.on);
    // shadows: redraw every frame while things move, otherwise a few times a second
    App.shadowT -= dt;
    if (moving || App.shadowT <= 0) { renderer.shadowMap.needsUpdate = true; App.shadowT = 0.15; }
    renderer.render(scene, camera);
    Guide.tick();
    placeHand();
    placeLook();
    placeLookTags();
    autoQuality(dt);
  }
  // The magnifying glass floats over the last part you touched, if there's a world inside it.
  function setLookMode(on) {
    App.lookMode = !!on;
    $('#btnLook').classList.toggle('active', App.lookMode);
    if (!App.lookMode) $('#lookTags').innerHTML = '';
  }
  function toggleLookMode() {
    if (!App.inst) return;
    const kinds = new Set(App.inst.parts.filter((p) => p.hasInside).map((p) => p.name));
    if (App.lookMode) { setLookMode(false); Caption.show('Look inside is off.'); return; }
    if (!kinds.size) { Voice.say('Nothing here has an inside view yet. Try another part!'); return; }
    setLookMode(true);
    Sound.whoosh();
    Voice.say(`Everything glowing blue has an inside! There are ${kinds.size} kinds here. Tap one to shrink down inside it.`, null, false,
      'Everything glowing blue has an inside! Tap one to shrink down inside it.');
  }
  // In look-inside mode, one tag per kind of part (the nearest one you can see), so it never gets crowded.
  function placeLookTags() {
    const box = $('#lookTags');
    if (!App.lookMode || !App.inst || App.diving) { if (box.childElementCount) box.innerHTML = ''; return; }
    App.lookTagT = (App.lookTagT || 0) - 1;
    const best = new Map();
    App.inst.parts.forEach((p) => {
      if (!p.hasInside) return;
      const w = worldPos(p), sc = toScreen(w);
      if (sc.x < 20 || sc.y < 80 || sc.x > innerWidth - 20 || sc.y > innerHeight - 110) return;
      const d = w.distanceTo(camera.position), cur = best.get(p.name);
      if (!cur || d < cur.d) best.set(p.name, { p, d, sc });
    });
    const list = [...best.values()].sort((a, b) => a.d - b.d).slice(0, 10);
    // nudge tags up so they don't sit on top of each other
    const placed = [];
    list.forEach((it) => {
      let y = it.sc.y;
      for (let n = 0; n < 8 && placed.some((q) => Math.abs(q.x - it.sc.x) < 120 && Math.abs(q.y - y) < 32); n++) y -= 34;
      it.sc = { x: it.sc.x, y };
      placed.push(it.sc);
    });
    while (box.childElementCount < list.length) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'lookTag';
      b.addEventListener('click', () => { if (b._part) diveInto(b._part); });
      box.appendChild(b);
    }
    while (box.childElementCount > list.length) box.lastChild.remove();
    list.forEach((it, i) => {
      const b = box.children[i];
      if (b._part !== it.p) { b._part = it.p; b.textContent = it.p.name; }
      b.style.transform = `translate(${Math.round(it.sc.x)}px, ${Math.round(it.sc.y)}px) translate(-50%, -130%)`;
    });
  }
  function placeLook() {
    const b = $('#lookBadge'), p = Caption.part;
    if (!p || App.diving || App.lookMode || !App.inst || App.inst.parts.indexOf(p) < 0 || !insideOf(p)) { b.hidden = true; return; }
    const sc = toScreen(worldPos(p));
    if (sc.x < 0 || sc.y < 0 || sc.x > innerWidth || sc.y > innerHeight) { b.hidden = true; return; }
    b.hidden = false;
    b.style.transform = `translate(${Math.min(innerWidth - 150, sc.x + 18)}px, ${Math.max(70, sc.y - 64)}px)`;
  }
  function autoQuality(dt) {
    const q = App.quality || (App.quality = { t: 0, n: 0, done: false });
    if (q.done || !App.inst || App.diving) return;
    q.t += dt; q.n++;
    if (q.t < 4) return;
    q.done = true;
    const fps = q.n / q.t;
    if (fps < 40) {
      renderer.shadowMap.enabled = false;
      renderer.setPixelRatio(Math.min(1.25, window.devicePixelRatio || 1));
      resize();
      scene.traverse((m) => { if (m.material) m.material.needsUpdate = true; });
    }
    App.fps = Math.round(fps);
  }
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / Math.max(1, innerHeight);
    camera.updateProjectionMatrix();
  }
  function boot() {
    const canvas = $('#gl');
    if (!canvas) return; // e.g. tools/lines.html loads the engine only to list Sparky's lines
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch (e) {
      $('#home .lede').textContent = 'This browser cannot show 3D. Try Chrome, Edge or Safari.';
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    kit = makeKit();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161c2a);
    scene.fog = new THREE.Fog(0x161c2a, 26, 60);
    camera = new THREE.PerspectiveCamera(36, 1, 0.05, 200);
    raycaster = new THREE.Raycaster();
    raycaster.camera = camera;
    addLights(scene, true);
    scene.environment = studioEnv(renderer);
    bgDevice = gradientTex('#222c40', '#0e121b');
    bgWorld = gradientTex('#0d2340', '#020509');
    scene.background = bgDevice;
    table = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 0.4, 72), new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.62, transparent: true }));
    table.position.y = -0.2;
    table.receiveShadow = true;
    stage = makeStage();
    turntable = new THREE.Group();
    scene.add(turntable);
    turntable.add(table, stage);
    dotTex = softDot(); shadowTex = shadowTexture();
    sparks = new Particles(500, 0.13, { gravity: 9, additive: true, fade: true, drag: 0.5 }, dotTex);
    smoke = new Particles(300, 0.8, { gravity: -0.4, drag: 1.2, opacity: 0.4 }, dotTex);
    confetti = new Particles(500, 0.2, { gravity: 5, drag: 0.9 }, dotTex);
    scene.add(sparks.points, smoke.points, confetti.points);
    resize();
    addEventListener('resize', resize);
    setupInput(canvas);
    Caption.init();
    wireButtons();
    if (window.speechSynthesis) { Voice.pickTTS(); window.speechSynthesis.onvoiceschanged = () => Voice.pickTTS(); }
    buildHome();
    camera.position.set(0, 6, 18); camera.lookAt(0, 2, 0);
    requestAnimationFrame(loop);
    const want = location.hash.slice(1);
    const def = want && TAL.devices.find((d) => d.id === want);
    if (def) openDevice(def);
    // Offline play once installed on an iPad home screen (skipped where service workers aren't allowed).
    try {
      if ('serviceWorker' in navigator && location.protocol === 'https:' && /github\.io$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
    } catch (e) { /* ignore */ }
  }
  // Test hooks. tapPart() taps where a part shows on screen, so it goes through real picking.
  // Every line Sparky can say, with its clip name. tools/lines.html prints this for tools/make_voice.py.
  TAL.voiceLines = function () {
    const set = new Set(ENGINE_LINES), add = (s) => { if (s) set.add(s); };
    const k = makeKit();
    TAL.devices.forEach((def) => {
      add(def.intro); add(def.shellSay);
      (def.guide || []).forEach((s) => { add(s.say); add(s.nudge); });
      const built = def.build(k);
      built.parts.forEach((p) => { add(p.say); add(p.breaks); add(p.fact); add(p.symptom); });
      const probe = (missing) => { try { const r = def.evaluate((id) => !missing.has(id), true, { refs: built.refs }); add(r && r.reason); } catch (e) { /* ignore */ } };
      probe(new Set());
      built.parts.forEach((p) => probe(new Set([p.id])));
      disposeTree(built.root);
    });
    return [...set].map((t) => ({ h: hashText(t), t }));
  };
  TAL.say = (text) => Voice.say(text);
  TAL.debug = {
    openDevice: (id, level) => openDevice(TAL.devices.find((d) => d.id === id), level), togglePower,
    voice: () => ({ clips: window.TAL_VOICE ? Object.keys(window.TAL_VOICE.clips).length : 0, talking: Voice.talking, src: Voice.el && Voice.el.src.slice(-20), unlocked: Voice.unlocked, ctx: Sound.ctx && Sound.ctx.state }), explodeAll, fixAll, startMission, nextChannel, setXray, hint,
    enterFocus: (id) => enterFocus(byId(id)), exitFocus,
    pull: (id) => tryRemove(byId(id)),
    dive: (id) => diveInto(byId(id)), back: () => goBack(), touch: (id) => { const p = byId(id); Voice.say(p.say, learnFor(p)); Caption.setPart(p); },
    deeper: () => { Caption.deeper(); return $('#capText').textContent; },
    crumbs: () => $('#devName').textContent + ' [' + $('#devLevel').textContent + ']',
    tapPart(id) {
      const s = toScreen(worldPos(byId(id)));
      const hit = pick(s.x, s.y);
      onTap(s.x, s.y);
      return { hit: hit ? (hit.shell ? 'shell' : hit.part.id) : null, caption: $('#capText').textContent };
    },
    screenOf: (id) => toScreen(worldPos(byId(id))),
    pickAt: (x, y) => { const h = pick(x, y); return h ? (h.shell ? 'shell' : h.part.id) : null; },
    guide: () => ({ i: Guide.i, step: Guide.current() && Guide.current().do, target: Guide.target && (Guide.target.el || Guide.target.part.id), needTurn: Guide.needTurn }),
    state: () => ({ on: App.on, out: App.out, mission: App.mission, focus: App.focus && App.focus.id, outParts: App.inst.parts.filter(isOut).map((p) => p.id) }),
  };
  if (document.readyState === 'complete') setTimeout(boot, 0);
  else addEventListener('load', boot);
})();
