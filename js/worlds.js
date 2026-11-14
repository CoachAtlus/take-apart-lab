/* Take-Apart Lab: the worlds inside parts.
 * Tap Look inside on a part to shrink down inside it. Each world is built like a device
 * (parts you can pull off, Power or a dial to change the electricity) and can hold more Look inside parts of its own:
 *   LED light > LED (20x) > LED chip (1,000x) > atoms making light (1,000,000x)
 *   chip > chip package (10x) > the silicon (100x) > one transistor (1,000,000x) > silicon atoms (100,000,000x)
 *   battery (3x) > zinc atoms at work (1,000,000x);  capacitor (10x) > the plates (10,000x)
 *   LCD panel > one pixel (100x) > liquid crystal (10,000x);  speaker (5x);  transformer (10x)
 *   picture tube (1x) > phosphor dots (1,000x)
 * A part's `fixed: true` means it doesn't come off; touching it explains it. `learn` holds the deeper levels. */
(function () {
  const T = window.THREE;
  const world = (def) => TAL.registerWorld(Object.assign({ powerSound: 'click', startOn: true, channels: false, short: 'thing' }, def));
  const view = (y, r, ex, yaw, pitch) => ({ target: [0, y, 0], radius: r, explodedRadius: ex || r * 1.3, explodedY: y, yaw: yaw == null ? -0.5 : yaw, pitch: pitch == null ? 0.35 : pitch });
  // Parts here are groups at the origin with their meshes placed in world-space; a name tag rides along.
  function part(k, root, spec) {
    root.add(spec.obj);
    if (spec.tag !== false) {
      const l = k.label(spec.tag || spec.name, { size: spec.tagSize || 0.17 });
      l.position.fromArray(spec.tagAt || [0, 1, 0]);
      spec.obj.add(l);
    }
    return spec;
  }
  const halo = (k, x, y, z, color, size) => {
    const h = new T.Sprite(new T.SpriteMaterial({ map: k.dotTex(), color: color || 0xffe9a0, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
    h.position.set(x, y, z); h.scale.setScalar(size || 1.4); h.userData.noPick = true; h.visible = false;
    return h;
  };
  const upd = (flows, dt, speed) => flows.forEach((f) => f.userData.flow.update(dt, speed));
  const show = (objs, on) => objs.forEach((o) => { o.visible = !!on; });
  const glowOn = (meshes, i) => meshes.forEach((m) => { m.material.emissiveIntensity = i; });
  const BLUE = 0x4f8dff, PINK = 0xff6fb5, WHITE = 0xffffff, GOLD = 0xe2b24a;
  // A lattice of atoms with bonds. kind(i, j, l) -> { r, mat }.
  function lattice(k, nx, ny, nz, gap, y0, kind, bondMat) {
    const g = k.group(), pos = (i, j, l) => [(i - (nx - 1) / 2) * gap, y0 + j * gap, (l - (nz - 1) / 2) * gap];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let l = 0; l < nz; l++) {
      const kd = kind(i, j, l), p = pos(i, j, l);
      g.add(k.at(k.sphere(kd.r, kd.mat, 18), p[0], p[1], p[2]));
      if (bondMat) {
        if (i < nx - 1) g.add(k.rot(k.at(k.cyl(0.035, 0.035, gap, bondMat, 6), p[0] + gap / 2, p[1], p[2]), 0, 0, Math.PI / 2));
        if (j < ny - 1) g.add(k.at(k.cyl(0.035, 0.035, gap, bondMat, 6), p[0], p[1] + gap / 2, p[2]));
        if (l < nz - 1) g.add(k.rot(k.at(k.cyl(0.035, 0.035, gap, bondMat, 6), p[0], p[1], p[2] + gap / 2), Math.PI / 2, 0, 0));
      }
    }
    g.userData.pos = pos;
    return g;
  }
  // A tube cut open on one quarter so you can see inside: rings, side walls, cut faces.
  function cutTube(k, rIn, rOut, h, y, mat) {
    const g = k.group(), ts = Math.PI / 2, tl = Math.PI * 1.5, side = mat.clone(); side.side = T.DoubleSide;
    g.add(k.at(k.mesh(new T.CylinderGeometry(rOut, rOut, h, 48, 1, true, ts, tl), side), 0, y, 0));
    if (rIn > 0) g.add(k.at(k.mesh(new T.CylinderGeometry(rIn, rIn, h, 48, 1, true, ts, tl), side), 0, y, 0));
    [y + h / 2, y - h / 2].forEach((yy) => g.add(k.at(k.rot(k.mesh(new T.RingGeometry(Math.max(rIn, 0.001), rOut, 48, 1, ts - Math.PI / 2, tl), side), -Math.PI / 2, 0, 0), 0, yy, 0)));
    [0, Math.PI / 2].forEach((a) => {
      const w = rOut - rIn, pl = k.mesh(new T.PlaneGeometry(w, h), side);
      pl.position.set(Math.sin(a) * (rIn + w / 2), y, Math.cos(a) * (rIn + w / 2));
      pl.rotation.y = a + Math.PI / 2;
      g.add(pl);
    });
    return g;
  }

  // ---- shared bits for the experiments
  // Grainy textures so powder looks like powder, paste like paste, paper like paper.
  const grainTex = (k, base, flecks, n, size, repeat) => {
    const tex = k.canvasTex(256, 256, (c, w) => {
      c.fillStyle = base; c.fillRect(0, 0, w, w);
      for (let i = 0; i < n; i++) {
        c.fillStyle = flecks[(Math.random() * flecks.length) | 0];
        const s = size * (0.4 + Math.random());
        c.beginPath(); c.arc(Math.random() * w, Math.random() * w, s, 0, Math.PI * 2); c.fill();
      }
    });
    tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(repeat[0], repeat[1]);
    return tex;
  };
  const fiberTex = (k, base, rep) => {
    const tex = k.canvasTex(256, 256, (c, w) => {
      c.fillStyle = base || '#efe4c8'; c.fillRect(0, 0, w, w);
      for (let i = 0; i < 260; i++) {
        c.strokeStyle = Math.random() < 0.5 ? 'rgba(170,150,110,0.35)' : 'rgba(255,255,245,0.5)'; c.lineWidth = 1 + Math.random();
        const x = Math.random() * w, y = Math.random() * w, a = Math.random() * Math.PI, l = 8 + Math.random() * 22;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
      }
    });
    tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(rep || 2, rep || 2);
    return tex;
  };
  // Silicon looks like a mirror with a rainbow sheen, because its thin layers bend light.
  const siliconTex = (k, grid) => k.canvasTex(256, 256, (c, w) => {
    const g = c.createLinearGradient(0, 0, w, w);
    ['#2b2466', '#2f5fb0', '#2fa6a6', '#7cc65a', '#d1a63a', '#c0507a', '#5a2f9a'].forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col));
    c.fillStyle = g; c.fillRect(0, 0, w, w);
    c.globalAlpha = 0.18; c.fillStyle = '#fff'; for (let i = -w; i < w * 2; i += 22) { c.save(); c.translate(i, 0); c.rotate(-0.6); c.fillRect(0, 0, 7, w * 2); c.restore(); }
    c.globalAlpha = 1;
    if (grid) { c.strokeStyle = 'rgba(255,235,190,0.22)'; c.lineWidth = 1; for (let i = 0; i < w; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }
  });
  // A sign you can rewrite while it runs: the text and color change with the experiment.
  function live(k, size, w) {
    const cv = document.createElement('canvas'); cv.width = w && w < 400 ? w : 1100; cv.height = 70;
    const x = cv.getContext('2d'), tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false }));
    sp.scale.set((size * cv.width) / cv.height, size, 1); sp.renderOrder = 20; sp.userData.noPick = true;
    let last = '';
    sp.userData.set = (txt, bg) => {
      if (txt + '|' + bg === last) return; last = txt + '|' + bg;
      x.clearRect(0, 0, cv.width, cv.height);
      let fs = 46; x.font = `800 ${fs}px "Baloo 2", "Trebuchet MS", sans-serif`;
      while (x.measureText(txt).width > cv.width - 70 && fs > 20) { fs -= 2; x.font = `800 ${fs}px "Baloo 2", "Trebuchet MS", sans-serif`; }
      const pw = Math.min(cv.width, x.measureText(txt).width + 50), px = (cv.width - pw) / 2;
      x.fillStyle = bg || 'rgba(16,22,35,0.88)'; x.beginPath();
      if (x.roundRect) x.roundRect(px, 0, pw, cv.height, 35); else x.rect(px, 0, pw, cv.height);
      x.fill();
      x.fillStyle = '#fff8ea'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, cv.width / 2, cv.height / 2 + 3);
      tex.needsUpdate = true;
    };
    return sp;
  }
  // A tall bar that fills up: gauge.userData.set(0..1, color)
  function gauge(k, name, h) {
    const g = k.group(), bg = k.at(k.box(0.24, h, 0.06, k.mat(0x202430, { roughness: 0.8 })), 0, h / 2, 0);
    const fm = new T.MeshBasicMaterial({ color: 0x3ee08f, toneMapped: false }), fill = k.mesh(new T.BoxGeometry(0.18, h - 0.06, 0.08), fm);
    const lab = k.label(name, { size: 0.16 }); lab.position.set(0, h + 0.2, 0);
    g.add(bg, fill, lab);
    g.traverse((o) => { o.userData.noPick = true; });
    g.userData.set = (f, hex) => {
      f = Math.max(0, Math.min(1, f));
      fill.scale.y = Math.max(0.001, f); fill.position.y = 0.03 + ((h - 0.06) * f) / 2;
      if (hex != null) fm.color.setHex(hex);
    };
    g.userData.set(0);
    return g;
  }
  // A glowing beam from point a to point b (a thin cylinder you re-aim every frame).
  const Yaxis = new T.Vector3(0, 1, 0);
  function beamMesh(k, color, r, opacity) {
    const m = k.mesh(new T.CylinderGeometry(r, r, 1, 8, 1, true), new T.MeshBasicMaterial({ color, transparent: true, opacity: opacity == null ? 0.8 : opacity, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false, side: T.DoubleSide }));
    m.userData.noPick = true; m.frustumCulled = false;
    return m;
  }
  function aim(m, a, b) {
    const d = new T.Vector3().subVectors(b, a), len = d.length();
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Yaxis, d.normalize()); m.scale.set(1, Math.max(len, 0.001), 1);
  }
  // LED worlds share this: how bright, and the burn-out rule (too much for a moment and the chip dies until you turn the electricity Off).
  function ledPower(r, dt, level, ok) {
    if (level === 0) { r.burnt = false; r.hot = 0; }
    if (ok && level > 1 && !r.burnt) { r.hot += dt; if (r.hot > 1.8) { r.burnt = true; TAL.say('Pop! That was too much electricity. The chip burned out. Turn the electricity Off to get a fresh one.'); } }
    else if (level <= 1) r.hot = Math.max(0, r.hot - dt);
    if (!ok || r.burnt) return 0;
    return level > 1 ? 1.25 : level;
  }
  const LED_DIAL = {
    label: 'Electricity',
    steps: [
      { name: 'Off', level: 0, say: 'No electricity, so the LED is dark.' },
      { name: 'A little', level: 0.35, say: 'A little electricity. The LED glows softly.' },
      { name: 'Just right', level: 0.7, say: 'Just the right amount. The LED shines bright and stays cool enough!' },
      { name: 'Too much', level: 1.4, say: 'Way too much electricity! Watch the chip. It is getting too hot.' },
    ],
  };
  const ledGauge = (g, b) => g.userData.set(Math.min(1, b), b > 1 ? 0xff5a4a : b > 0.6 ? 0x3ee08f : 0xffc23a);

  // =====================================================================  LED chain
  world({
    id: 'led-package', name: 'Inside an LED', zoom: '20×', short: 'LED',
    view: view(0.9, 2.9, 3.8),
    dial: LED_DIAL,
    intro: 'We shrank down! This is one LED light, 20 times bigger. Tap the Electricity button to give it none, a little, just right, or too much. Watch the glow and the Light bar. Then pull the parts off, and tap Look inside on the chip to go even smaller.',
    learn: [
      'An LED makes light when electricity goes through a tiny chip in the middle. The two metal legs bring the electricity in and out. The shiny cup bounces the light up, and the clear cap spreads it out.',
      'More electricity makes more light, up to a point. Too much makes the chip too hot, and it burns out. That is why a real LED always has something small next to it, like a resistor, to hold the electricity back.',
      'The chip really makes blue light. The yellow coating soaks up some of the blue and glows yellow. Blue and yellow together look white. Pull the yellow coating off and the light turns blue!',
    ],
    shellSay: 'This is the inside of one tiny LED light.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'housing', name: 'Plastic box', fixed: true, obj: k.group(k.at(k.rbox(2.8, 0.35, 2.8, k.mat(0xf2f2ee, { roughness: 0.35 }), 0.06), 0, 0.175, 0)), tagAt: [-1.2, 0.5, 1.3],
        say: 'The white plastic box is a little bowl. It holds all the tiny parts together.',
        learn: ['It is made of tough plastic that does not melt from the heat of the light.', 'Its white color helps bounce light up and out, so less light is wasted.', 'The bowl is molded around the two metal legs, so they stay put.'] });
      add({ id: 'cup', name: 'Shiny cup', fixed: true, obj: k.group(k.at(k.cyl(1.15, 0.55, 0.5, k.mat(0xe6ebf1, { metalness: 0.9, roughness: 0.12, side: T.DoubleSide }), 48, true), 0, 0.6, 0)), tagAt: [1.25, 0.95, 0.6],
        say: 'This shiny cup is a mirror. It bounces light up and out, like the back of a flashlight.',
        learn: ['Light from the chip shoots out in every direction. The cup catches the light going sideways and sends it forward.', 'It is coated with silver, because silver reflects almost all of the light that hits it.', 'Without a mirror, more of the light would get lost inside the box.'] });
      const metal = k.metal(0xd6dbe2, { roughness: 0.25 });
      add({ id: 'leadMinus', name: 'Minus leg', obj: k.group(k.at(k.box(1.5, 0.08, 0.9, metal), -1.25, 0.08, 0), k.at(k.box(0.7, 0.06, 0.7, metal), -0.2, 0.38, 0)), pull: [-1.8, 0, 0.4], tagAt: [-1.9, 0.4, 0],
        say: 'Tiny electrons come into the LED through this minus leg. It is the door in.',
        learn: ['Electricity needs a road in and a road out. This leg is the way in.', 'An LED only works one way around. Put it in backwards and nothing happens.', 'The legs are usually copper with a thin silver coat, so electricity flows easily and they shine.'] });
      add({ id: 'leadPlus', name: 'Plus leg', obj: k.group(k.at(k.box(1.5, 0.08, 0.9, metal), 1.25, 0.08, 0), k.at(k.box(0.4, 0.06, 0.5, metal), 0.45, 0.38, 0)), pull: [1.8, 0, 0.4], tagAt: [1.9, 0.4, 0],
        say: 'The electrons leave through the plus leg, the door out, and head back to the battery or power board.',
        learn: ['Electricity needs a full loop, like a race track. In through one leg, through the chip, and out the other.', 'If either leg is missing, the track is broken and the LED goes dark. Try it!', 'The plus leg is the one that connects to the plus side of the power.'] });
      const dieMat = k.glow(0x2a3966, 0x4a6bff);
      const die = k.at(k.box(0.36, 0.14, 0.36, dieMat), -0.2, 0.48, 0);
      add({ id: 'die', name: 'LED chip', obj: k.group(die), inside: 'led-die', blockedBy: ['phosphor'], pull: [0, 1.7, 0.7], tagAt: [-0.6, 0.85, 0.5],
        say: 'This tiny square is the LED chip. It is where the light is made!',
        learn: ['It is like a tiny sandwich of crystal layers. When electricity goes through, the middle layer glows.', 'The real chip is about as small as a grain of sand, about a quarter of a millimeter across.',
          'It is made of a crystal called gallium nitride that gives off blue light when electricity flows through it.', 'Turn the Electricity button up and watch it glow brighter. Too much makes it too hot and it burns out. Tap Look inside to go inside it!'] });
      add({ id: 'wire', name: 'Gold wire', obj: k.group(k.tube([[-0.2, 0.55, 0], [0.05, 1.0, 0], [0.3, 0.75, 0], [0.45, 0.42, 0]], 0.02, k.metal(GOLD, { roughness: 0.2 }))), blockedBy: ['phosphor'], pull: [0.7, 1.3, 0.5], tagAt: [0.35, 1.2, 0],
        say: 'This gold wire is thinner than a hair. It is a tiny bridge that carries electricity to the top of the chip.',
        learn: ['Think of it as the thinnest road in the world, just for electrons.', 'Gold is used because it never rusts and bends without breaking.', 'A machine attaches it with heat and a buzz of sound vibration, thousands of times an hour.'] });
      const phMat = k.glow(0xf2d33a, 0xfff0a8); phMat.transparent = true; phMat.opacity = 0.72;
      const ph = k.at(k.cyl(1.05, 0.55, 0.32, phMat, 48), 0, 0.64, 0);
      add({ id: 'phosphor', name: 'Yellow coating', obj: k.group(ph), blockedBy: ['lens'], pull: [0, 1.5, -0.6], tagAt: [-1.0, 1.0, -0.4],
        breaks: 'Now the light is only blue. The yellow coating was turning it white.', breaksAlways: true,
        say: 'The yellow coating is like yellow paint for light. It turns blue light into white light.',
        learn: ['Some blue light passes through. The rest is soaked up by the coating and glows yellow. Blue and yellow light together look white to our eyes.',
          'The coating is a powder called phosphor, mixed into clear rubbery silicone.', 'This trick is how almost every white LED works, in TVs, flashlights and lamps.'] });
      const dome = k.mesh(new T.SphereGeometry(1.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), k.glass(0xeaf6ff, 0.22, { side: T.DoubleSide }));
      dome.position.y = 0.8;
      add({ id: 'lens', name: 'Clear cap', obj: k.group(dome), pull: [0, 2.2, 0], tagAt: [0, 2.15, 0],
        breaks: 'Now the light squirts out in a narrow beam instead of spreading wide.', breaksAlways: true,
        job: 'The clear cap protects the chip from dust and bumps, and spreads the light.',
        say: 'The clear cap protects the chip and spreads the light, like a little glass bead.',
        learn: ['It is made of clear silicone, shaped like a dome.', 'The dome bends the light as it leaves, a bit like a glass marble, to spread it out wide.', 'It also keeps dust and water away from the tiny chip and the gold wire.'] });
      const flow = k.flow([[-2.1, 0.15, 0], [-0.9, 0.2, 0], [-0.4, 0.42, 0], [-0.2, 0.52, 0], [0.05, 1.0, 0], [0.3, 0.75, 0], [0.5, 0.42, 0], [1.2, 0.18, 0], [2.1, 0.15, 0]], { count: 22, color: BLUE, size: 0.13 });
      const rayGroup = k.group(), rays = [];
      rayGroup.position.set(-0.2, 0, 0);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2, s = 0.55 + (i % 3) * 0.25;
        rays.push(k.flow([[0, 0.55, 0], [Math.cos(a) * s * 2.2, 2.6, Math.sin(a) * s * 2.2]], { count: 3, color: WHITE, size: 0.2, phase: i / 12 }));
      }
      rayGroup.add(...rays);
      const bar = gauge(k, 'Light', 1.4); bar.position.set(2.5, 0.15, -1.1);
      const sign = live(k, 0.2, 700); sign.position.set(0, 2.45, 0.4);
      root.add(flow, rayGroup, bar, sign);
      return { root, parts, refs: { flow, rays, rayGroup, bar, sign, spread: 1, hot: 0, burnt: false } };
    },
    evaluate(has, on) {
      const loop = has('leadMinus') && has('leadPlus') && has('die') && has('wire');
      return { alive: on && loop, white: has('phosphor'), cap: has('lens'), reason: on && !loop ? "The electricity can't make a loop. Put the missing part back!" : '' };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0];
      const b = ledPower(r, dt, d.level, !!o.alive);
      const dm = inst.byId.die.meshes[0].material, pm = inst.byId.phosphor.meshes[0].material;
      dm.emissiveIntensity = 2.6 * Math.min(b, 1.2); dm.color.setHex(r.burnt ? 0x1a1410 : 0x2a3966);
      pm.emissiveIntensity = o.white ? 0.9 * Math.min(b, 1.2) : 0;
      const on = b > 0.02;
      show([r.flow], on); show(r.rays, on);
      if (on) { upd([r.flow], dt, 0.05 + 0.3 * b); upd(r.rays, dt, 0.2 + 0.8 * b); }
      const cols = new T.Color(o.white ? 0xfff6e0 : 0x5a7bff).multiplyScalar(Math.min(b, 1));
      r.rays.forEach((f) => f.material.color.copy(cols));
      r.spread += ((o.cap === false ? 0.4 : 1) - r.spread) * Math.min(1, dt * 4);
      r.rayGroup.scale.set(r.spread, 1, r.spread);
      ledGauge(r.bar, b);
      const s = !o.alive ? ['The loop is broken, so no light', 'rgba(170,120,0,0.92)'] : r.burnt ? ['Burned out! Turn the electricity Off for a fresh chip', 'rgba(200,40,30,0.92)'] : d.level === 0 ? ['Off: no electricity, so no light', 'rgba(60,60,70,0.92)'] : d.level > 1 ? ['Too much! It is getting too hot...', 'rgba(220,90,20,0.92)'] : d.level < 0.5 ? ['A little electricity: a soft glow', 'rgba(30,140,80,0.92)'] : ['Just right: bright light', 'rgba(30,140,80,0.92)'];
      r.sign.userData.set(s[0], s[1]);
    },
  });

  world({
    id: 'led-die', name: 'Inside the LED chip', zoom: '1,000×', short: 'chip',
    view: view(0.75, 2.6, 3.4),
    dial: LED_DIAL,
    intro: 'Now we are inside the LED chip, a thousand times bigger! It is a stack of crystal layers. Tap the Electricity button and watch the blue electrons and pink holes rush toward the thin glowing layer in the middle. The more of them that meet, the more light!',
    learn: [
      'The blue dots are electrons from the bottom layer. The pink dots are holes, empty spots, from the top layer. They run toward each other and meet in the thin glowing layer.',
      'Every time an electron meets a hole, a tiny flash of light pops out. More electricity means more meetings every second, so the chip is brighter.',
      'Too much electricity makes the chip very hot, and the crystal can be damaged. That is what happens when you turn the button to Too much.',
    ],
    shellSay: 'This is the inside of the LED chip, a stack of crystal layers.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'sapphire', name: 'Sapphire base', fixed: true, obj: k.group(k.at(k.box(3, 0.45, 2, k.glass(0x9fd3ff, 0.55, { depthWrite: true })), 0, 0.225, 0)), tagAt: [-1.2, 0.25, 1.15],
        say: 'The chip grows on a clear crystal called sapphire, the same stuff some jewels are made of. It is like a clear glass tray.',
        learn: ['Sapphire is very hard and clear, so the light can escape through it.', 'Factories grow the chip on top of it, one super thin layer of atoms at a time.', 'The tray only holds the layers. It does not make any light itself.'] });
      add({ id: 'n', name: 'N layer', obj: k.group(k.at(k.box(3, 0.32, 2, k.mat(0x4a6a9a, { roughness: 0.35, metalness: 0.2 })), 0, 0.61, 0)), blockedBy: ['active', 'nPad'], pull: [0, 0, 2.6], tagAt: [1.25, 0.62, 1.1],
        say: 'This layer has extra electrons, tiny bits of electricity, waiting to move. It is like a playground full of kids who want to run.',
        learn: ['It is gallium nitride with a pinch of silicon atoms mixed in. Each silicon atom brings a spare electron.', 'Adding a pinch of other atoms on purpose is called doping. It lets engineers control how electricity flows.', 'The N stands for negative, because electrons have a tiny negative charge.'] });
      const actMat = k.glow(0x2a3a8a, 0x4a6bff);
      add({ id: 'active', name: 'Light layer', obj: k.group(k.at(k.box(2.2, 0.08, 2, actMat), -0.4, 0.81, 0)), inside: 'led-atoms', blockedBy: ['p'], pull: [0, 0.9, 2.8], tagAt: [-1.75, 0.82, 1.1],
        say: 'This super thin middle layer is where the light is made! It is the place where the electrons meet the holes.',
        learn: ['Electrons from below meet empty spots, called holes, from above. Every time they meet, a tiny flash of light pops out, like a camera flash.',
          'The layer is far thinner than a hair. A little indium is mixed in to make the light blue.',
          'The color depends on how much energy each electron gives up when it drops into a hole. More energy makes bluer light.', 'Tap Look inside to see the atoms!'] });
      add({ id: 'p', name: 'P layer', obj: k.group(k.at(k.box(2.2, 0.24, 2, k.mat(0x8a5a9a, { roughness: 0.35, metalness: 0.2 })), -0.4, 0.97, 0)), blockedBy: ['pPad'], pull: [0, 1.7, 2.3], tagAt: [-1.75, 1.15, 0.9],
        say: 'This layer has empty spots, called holes, where electrons are missing. It is like a game of musical chairs with lots of empty chairs.',
        learn: ['A pinch of magnesium atoms is mixed in. Each one leaves an empty chair where an electron could sit.', 'When an electron jumps into an empty chair, the empty chair seems to move the other way.', 'The P stands for positive, because a missing electron acts like a tiny plus charge.'] });
      add({ id: 'pPad', name: 'Plus pad', obj: k.group(k.at(k.box(1.0, 0.06, 0.7, k.metal(GOLD, { roughness: 0.2 })), -0.4, 1.12, 0)), pull: [-0.6, 2.2, 0.4], tagAt: [-0.4, 1.45, 0],
        say: 'The gold plus pad is the front door where the gold wire connects.',
        learn: ['It spreads the electricity across the top so the whole chip glows evenly.', 'It is gold because gold does not rust and carries electricity well.', 'Without it the wire has nothing to touch, so the top layer gets no electricity.'] });
      add({ id: 'nPad', name: 'Minus pad', obj: k.group(k.at(k.box(0.5, 0.06, 0.7, k.metal(GOLD, { roughness: 0.2 })), 1.15, 0.8, 0)), pull: [1.3, 1.7, 0.4], tagAt: [1.15, 1.1, 0],
        say: 'The minus pad is the back door. It lets electrons into the bottom layer.',
        learn: ['The factory etches away a corner of the top layers so this pad can reach the bottom layer.', 'It is gold too, so it never rusts.', 'Without it the electrons have no way in, and no light is made.'] });
      const electrons = [-0.6, 0, 0.6].map((z, i) => k.flow([[1.15, 0.78, z], [0.6, 0.62, z], [-0.1, 0.66, z], [-0.4 - i * 0.3, 0.8, z]], { count: 6, color: BLUE, size: 0.2, phase: i * 0.3 }));
      const holes = [-1.2, -0.6, 0, 0.4].map((x, i) => k.flow([[-0.4, 1.12, (i - 1.5) * 0.4], [x, 0.97, (i - 1.5) * 0.4], [x, 0.82, (i - 1.5) * 0.4]], { count: 4, color: PINK, size: 0.2, phase: i * 0.25 }));
      const light = [];
      for (let i = 0; i < 10; i++) { const x = -1.4 + i * 0.22, z = ((i * 7) % 5 - 2) * 0.35; light.push(k.flow([[x, 0.81, z], [x * 1.4, 2.6, z * 1.6]], { count: 3, color: 0x6a86ff, size: 0.3, phase: i / 10 })); }
      const bar = gauge(k, 'Light', 1.4); bar.position.set(2.45, 0.1, -0.6);
      const sign = live(k, 0.2, 700); sign.position.set(0, 2.2, 0.4);
      root.add(...electrons, ...holes, ...light, bar, sign);
      return { root, parts, refs: { electrons, holes, light, bar, sign, hot: 0, burnt: false } };
    },
    evaluate(has, on) {
      const ok = ['n', 'active', 'p', 'pPad', 'nPad'].every(has);
      return { alive: on && ok, reason: on && !ok ? 'A layer is missing, so no light can be made. Put it back!' : '' };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0];
      const b = ledPower(r, dt, d.level, !!o.alive);
      const m = inst.byId.active.meshes[0].material;
      m.emissiveIntensity = 2.2 * Math.min(b, 1.25); m.color.setHex(r.burnt ? 0x1a1410 : 0x2a3a8a);
      const on = b > 0.02;
      show(r.electrons, on); show(r.holes, on); show(r.light, on);
      if (on) { upd(r.electrons, dt, 0.1 + 0.5 * b); upd(r.holes, dt, 0.1 + 0.5 * b); upd(r.light, dt, 0.2 + 0.9 * b); }
      r.light.forEach((f) => f.material.color.setHex(0x6a86ff).multiplyScalar(Math.min(b, 1)));
      ledGauge(r.bar, b);
      const s = !o.alive ? ['A layer is missing: no light', 'rgba(170,120,0,0.92)'] : r.burnt ? ['Burned out! Turn the electricity Off for a fresh chip', 'rgba(200,40,30,0.92)'] : d.level === 0 ? ['Off: nothing is moving, so no light', 'rgba(60,60,70,0.92)'] : d.level > 1 ? ['Too much! The chip is getting too hot...', 'rgba(220,90,20,0.92)'] : d.level < 0.5 ? ['A few meetings: a soft glow', 'rgba(30,140,80,0.92)'] : ['Lots of meetings: bright light', 'rgba(30,140,80,0.92)'];
      r.sign.userData.set(s[0], s[1]);
    },
  });

  world({
    id: 'led-atoms', name: 'Atoms making light', zoom: '1,000,000×', short: 'crystal',
    view: view(1.25, 2.9, 3.4),
    dial: {
      label: 'Electrons',
      steps: [
        { name: 'None coming', level: 0, say: 'No electrons are coming, so nothing meets the hole and no light is made.' },
        { name: 'A few', level: 0.6, say: 'A few electrons at a time. Each one that drops into the hole makes one flash of light.' },
        { name: 'Lots', level: 2.2, say: 'Lots of electrons! They drop into holes again and again, so there are many more flashes. That is a brighter LED.' },
      ],
    },
    intro: 'We are a million times bigger now, down at the atoms! Watch the blue electron drop into the empty hole. Each time it does, a flash of light pops out. Tap the Electrons button to send none, a few, or lots, and count the flashes.',
    learn: [
      'The big silver balls are gallium atoms and the small blue ones are nitrogen. The ring is a hole, an empty spot. The glowing dot is an electron that wants to fall into it.',
      'When the electron drops into the hole, it has extra energy to give up. It lets go of it as one packet of light, called a photon. That is the flash you see.',
      'More electrons coming in means more drops into holes every second, so more flashes. Your eyes see all those flashes at once as one steady light.',
    ],
    shellSay: 'These balls are atoms, the tiny building blocks of everything. Here they are gallium and nitrogen, holding hands in a crystal.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const ga = k.metal(0x9aa4b2, { roughness: 0.3 }), nn = k.mat(0x4a7bff, { roughness: 0.35 }), bond = k.mat(0x5a6378, { roughness: 0.5 });
      const shell = lattice(k, 7, 3, 3, 0.8, 0.3, (i, j, l) => ((i + j + l) % 2 ? { r: 0.16, mat: nn } : { r: 0.26, mat: ga }), bond);
      root.add(shell);
      const pos = shell.userData.pos;
      const gp = pos(1, 2, 2), np = pos(2, 2, 2);
      add({ id: 'gallium', name: 'Gallium atom', fixed: true, obj: k.group(k.at(k.sphere(0.3, k.metal(0xc5ccd6, { roughness: 0.2 }), 24), gp[0], gp[1], gp[2])), tagAt: [gp[0], gp[1] + 0.5, gp[2]],
        say: 'This big ball is a gallium atom. It is like a big building block.',
        learn: ['Gallium is a soft silvery metal. It can melt in your hand on a warm day!', 'In the LED crystal, gallium atoms hold hands with nitrogen atoms in a neat repeating pattern.',
          'An atom is about a ten billionth of a meter across. Millions of them in a row would just cross a grain of sand.'] });
      add({ id: 'nitrogen', name: 'Nitrogen atom', fixed: true, obj: k.group(k.at(k.sphere(0.2, k.mat(0x6a9bff, { roughness: 0.25 }), 24), np[0], np[1], np[2])), tagAt: [np[0] + 0.3, np[1] + 0.45, np[2]],
        say: 'This small ball is a nitrogen atom, a small building block. Nitrogen is also most of the air you breathe!',
        learn: ['Here, nitrogen is locked into the crystal with gallium. Together they make gallium nitride.', 'Gallium nitride is very tough, and it can give off blue light, which was very hard to make before it.', 'The blue LED won a Nobel Prize, because blue light made bright white LED bulbs possible.'] });
      const hp = [0.4, 1.5, 0.4];
      const holeRing = k.torus(0.17, 0.035, k.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }), 24);
      add({ id: 'hole', name: 'Hole', fixed: true, obj: k.group(k.at(holeRing, hp[0], hp[1], hp[2])), tagAt: [hp[0], hp[1] + 0.45, hp[2] + 0.2],
        say: 'This ring is a hole, an empty seat where an electron is missing.',
        learn: ['When an electron drops into a hole, they cancel out, and a flash of light pops out.', 'This is called recombination. Billions of them happen every second inside a glowing LED.', 'It is like the last chair in musical chairs: when the electron sits down, the empty seat is gone.'] });
      const eMat = k.glow(0x2a48ff, 0x4f8dff), eBall = k.sphere(0.12, eMat, 18);
      const eInner = k.group(eBall);
      add({ id: 'electron', name: 'Electron', fixed: true, obj: k.group(eInner), tagAt: [2.4, 2.1, 0.6], tag: 'Electron',
        say: 'This glowing dot is an electron, a tiny bit of electricity. It is like a little ball rolling downhill.',
        learn: ['Electrons are much, much smaller than atoms. Electricity is just lots of electrons moving.', 'This electron has extra energy. When it falls into a hole, it has to let that energy go, like a ball giving up its height at the bottom of the hill.', 'The energy comes out as a tiny packet of light called a photon.'] });
      const phMat = k.glow(0x9fc0ff, 0x9fc0ff), phBall = k.sphere(0.1, phMat, 16), phInner = k.group(phBall);
      const wavePts = new Float32Array(60 * 3), waveGeo = new T.BufferGeometry();
      waveGeo.setAttribute('position', new T.BufferAttribute(wavePts, 3));
      const wave = new T.Line(waveGeo, new T.LineBasicMaterial({ color: 0x8fb4ff, toneMapped: false }));
      wave.frustumCulled = false;
      add({ id: 'photon', name: 'Photon', fixed: true, obj: k.group(phInner, wave), tagAt: [hp[0] - 0.9, 3.0, hp[2]], tag: 'Light',
        say: 'This is a photon, one tiny packet of light! It wiggles like a wave as it zooms along.',
        learn: ['Light travels in tiny packets. Each one wiggles like a wave as it zooms along.', 'Light is the fastest thing there is. It could zip around the Earth more than 7 times in one second.', 'Blue light wiggles faster than red light. Our eyes see that wiggle speed as color.'] });
      const flash = new T.Sprite(new T.SpriteMaterial({ map: k.dotTex(), color: 0x9fc0ff, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
      flash.position.fromArray(hp); flash.scale.setScalar(0.01); flash.userData.noPick = true;
      const path = new T.CatmullRomCurve3([new T.Vector3(2.6, 0.7, 0.9), new T.Vector3(1.7, 1.1, 0.7), new T.Vector3(1.0, 1.0, 0.5), new T.Vector3(hp[0], hp[1], hp[2])]);
      const bar = gauge(k, 'Flashes', 1.3); bar.position.set(-3.0, 0.2, 0.6);
      const count = live(k, 0.19, 520); count.position.set(0, 3.35, 0.5);
      root.add(flash, bar, count);
      return { root, shell: [shell], parts, refs: { eInner, phInner, wave, wavePts, waveGeo, flash, path, hp, bar, count, rate: 0, clock: 0 } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, cyc = 3.2, d = inst.def.dial.steps[inst.dial || 0];
      if (out && out.alive) r.clock += dt * d.level;
      r.rate += (d.level - r.rate) * Math.min(1, dt * 3);
      const c = r.clock % cyc, v = new T.Vector3(), idle = d.level === 0;
      if (idle) { r.eInner.position.set(2.6, 0.7 + Math.sin(t * 2) * 0.05, 0.9); r.eInner.visible = true; }
      else if (c < 1.6) { r.path.getPointAt(c / 1.6, v); r.eInner.position.copy(v); r.eInner.visible = true; }
      else r.eInner.visible = false;
      const f = !idle && c >= 1.6 && c < 2.0 ? 1 - Math.abs(c - 1.8) / 0.2 : 0;
      r.flash.scale.setScalar(0.01 + f * 1.4);
      const pt = !idle && c >= 1.6 ? Math.min(1, (c - 1.6) / 1.5) : -1;
      r.phInner.visible = r.wave.visible = pt >= 0;
      if (pt >= 0) {
        const y0 = r.hp[1], y1 = y0 + 2.6 * pt;
        r.phInner.position.set(r.hp[0], y1, r.hp[2]);
        for (let i = 0; i < 60; i++) { const y = y0 + ((y1 - y0) * i) / 59; r.wavePts[i * 3] = r.hp[0] + Math.sin(y * 18) * 0.12; r.wavePts[i * 3 + 1] = y; r.wavePts[i * 3 + 2] = r.hp[2]; }
        r.waveGeo.attributes.position.needsUpdate = true;
      }
      r.bar.userData.set(r.rate / 2.2, 0x6a9bff);
      r.count.userData.set('Flashes of light so far: ' + Math.floor((r.clock + 1.6) / cyc), idle ? 'rgba(60,60,70,0.92)' : 'rgba(30,110,190,0.92)');
    },
  });

  // =====================================================================  chip chain
  world({
    id: 'chip-package', name: 'Inside a chip', zoom: '10×', short: 'chip',
    view: view(0.7, 2.9, 3.6),
    dial: {
      label: 'Work',
      steps: [
        { name: 'Resting', level: 0.25, say: 'The chip is resting. It does very little work, so it makes very little heat.' },
        { name: 'Busy', level: 0.55, say: 'The chip is busy, so it makes more heat. Watch the Heat bar.' },
        { name: 'Flat out', level: 1, say: 'The chip is working as hard as it can! That makes lots of heat. Does the heat have a way out?' },
      ],
    },
    intro: 'This is a computer chip, 10 times bigger. The real chip is the shiny square hiding under the metal lid. Tap the Work button to make it rest or work hard, and watch the Heat bar. Then take the lid and the heat paste off and see what happens!',
    learn: [
      'A working chip makes heat, like your body does when you run. The heat has to get out. It goes from the chip, through the gray paste, into the metal lid, and up to a heat sink.',
      'The gray paste fills tiny gaps that would trap the heat. Without the paste, or without the lid, the heat stays in the chip and the Heat bar climbs.',
      'Real chips protect themselves. When they get too hot they slow down on purpose to cool off. That is what happens here when the bar reaches the top.',
    ],
    shellSay: 'This is a computer chip, cut open.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const balls = k.group(), sm = k.metal(0xc9ced6, { roughness: 0.3 });
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) balls.add(k.at(k.sphere(0.07, sm, 10), -1.2 + i * 0.343, 0.07, -1.2 + j * 0.343));
      add({ id: 'balls', name: 'Solder balls', obj: balls, pull: [0, 0, 3.0], tagAt: [1.4, 0.1, 1.5],
        say: 'These little silver balls are tiny feet. They connect the chip to the board.',
        learn: ['They are made of solder, a metal that melts at a low temperature. The factory melts them to stick the chip down.', 'A big processor can have more than a thousand of these tiny balls, each one a separate wire.', 'If a ball does not touch the board, that wire is cut, and the chip may not work.'] });
      const sub = k.rbox(3, 0.22, 3, k.mat(0x2f6b3a, { roughness: 0.5 }), 0.04);
      const subTop = new T.Mesh(new T.PlaneGeometry(2.9, 2.9), k.mat(0xffffff, { map: k.pcbTexture(3, 3, 9, '#2f6b3a'), roughness: 0.5 }));
      subTop.rotation.x = -Math.PI / 2; subTop.position.y = 0.362;
      add({ id: 'substrate', name: 'Base board', fixed: true, obj: k.group(k.at(sub, 0, 0.25, 0), subTop), tagAt: [-1.3, 0.55, 1.4],
        say: 'This green base is like a funnel for wires. It spreads the tiny wires from the chip out to the balls.',
        learn: ['The chip has its connections packed super close. The base fans them out wider so they can reach the board.', 'Inside are many thin layers of copper wiring, stacked like a sandwich.', 'The green is a coating that protects the copper wires.'] });
      const dieTex = siliconTex(k, true);
      const die = k.box(1.5, 0.1, 1.5, k.mat(0xffffff, { map: dieTex, metalness: 0.6, roughness: 0.22, emissive: 0x5a7bff, emissiveIntensity: 0 }));
      die.material.userData.selfLit = true;
      add({ id: 'die', name: 'Silicon chip', obj: k.group(k.at(die, 0, 0.41, 0)), inside: 'chip-die', blockedBy: ['paste'], pull: [0, 1.6, 1.3], tagAt: [0.9, 0.75, 0.8],
        say: 'This shiny square is the real chip, made of silicon. It is a tiny city of switches.',
        learn: ['Silicon comes from sand! It is purified and grown into a giant crystal, then sliced into thin wafers.', 'Each wafer holds hundreds of chips. They are cut apart like cookies on a tray.', 'The rainbow shine is real. The thin layers on top bend light into colors, like a soap bubble.', 'Tap Look inside to zoom inside the silicon.'] });
      add({ id: 'paste', name: 'Heat paste', obj: k.group(k.at(k.box(1.5, 0.04, 1.5, k.mat(0x9a9ea6, { roughness: 0.9 })), 0, 0.48, 0)), blockedBy: ['lid'], pull: [0, 1.2, -1.4], tagAt: [-0.9, 0.7, -0.6],
        breaks: 'Now tiny air gaps trap the heat. Watch the Heat bar climb!', breaksAlways: true,
        say: 'The gray paste is like butter on toast. It fills every tiny gap so heat can move from the chip to the lid.',
        learn: ['Tiny air gaps would trap the heat. The paste fills them, so heat flows out easily.', 'Air is a poor carrier of heat. The paste carries it much better.', 'Without paste the chip gets hotter. If it gets too hot, it slows itself down to cool off.'] });
      add({ id: 'lid', name: 'Metal lid', obj: k.group(k.at(k.rbox(2.6, 0.14, 2.6, k.metal(0xc9ced6, { roughness: 0.22 }), 0.05), 0, 0.57, 0)), pull: [0, 2.2, 0], tagAt: [0, 0.95, 0],
        breaks: 'With no lid, nothing spreads the heat out. Watch the Heat bar climb!', breaksAlways: true,
        say: 'The metal lid is a shield for the chip, and a big flat plate that spreads out its heat.',
        learn: ['Metal is great at moving heat. The lid passes the heat on to the heat sink above it.', 'Without the lid, the chip could crack or get too hot.', 'The silicon is thin and fragile. The lid also keeps fingers and tools from bumping it.'] });
      const sig = [];
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; sig.push(k.flow([[Math.cos(a) * 1.4, 0.37, Math.sin(a) * 1.4], [Math.cos(a) * 0.6, 0.37, Math.sin(a) * 0.6]], { count: 4, color: 0x58ff9a, size: 0.1, phase: i / 8 })); }
      const hotLong = [], hotShort = [];
      [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(([x, z], i) => {
        hotLong.push(k.flow([[x, 0.47, z], [x, 1.5, z]], { count: 4, color: 0xff8a3a, size: 0.17, phase: i / 4 }));
        hotShort.push(k.flow([[x, 0.47, z], [x * 1.4, 0.9, z * 1.4]], { count: 3, color: 0xff6a3a, size: 0.14, phase: i / 4 }));
      });
      const bar = gauge(k, 'Heat', 1.5); bar.position.set(2.45, 0.0, -0.9);
      const sign = live(k, 0.2, 760); sign.position.set(0, 2.2, 0.4);
      const path = live(k, 0.17, 760); path.position.set(0, 1.8, 0.4);
      root.add(...sig, ...hotLong, ...hotShort, bar, sign, path);
      return { root, parts, refs: { sig, hotLong, hotShort, bar, sign, path, heat: 0, throttled: false, hotC: new T.Color(0xff6a20), coolC: new T.Color(0x5a7bff) } };
    },
    evaluate(has, on) {
      const ok = has('die') && has('balls');
      return { alive: on && ok, lid: has('lid'), paste: has('paste'), reason: on && !ok ? 'The chip needs its silicon and its little balls to get signals.' : '' };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0];
      const cool = o.lid && o.paste ? 1 : o.lid === false && o.paste ? 0.6 : o.lid === false ? 0.3 : 0.55;
      if (r.heat >= 1) r.throttled = true; else if (r.heat < 0.8) r.throttled = false;
      const work = o.alive ? d.level * (r.throttled ? 0.4 : 1) : 0;
      r.heat = Math.max(0, Math.min(1.25, r.heat + (0.5 * work - 0.7 * cool * r.heat) * dt));
      const T1 = Math.min(1, r.heat);
      const dm = inst.byId.die.meshes[0].material;
      dm.emissive.copy(r.coolC).lerp(r.hotC, T1); dm.emissiveIntensity = o.alive ? 0.35 + 1.1 * T1 : 0.1 * T1;
      show(r.sig, !!o.alive); if (o.alive) upd(r.sig, dt, 0.1 + 0.7 * work);
      const good = o.lid && o.paste;
      show(r.hotLong, good && T1 > 0.12); show(r.hotShort, !good && T1 > 0.12);
      if (T1 > 0.12) { upd(r.hotLong, dt, 0.1 + 0.6 * T1); upd(r.hotShort, dt, 0.05 + 0.2 * T1); }
      r.bar.userData.set(T1, T1 > 0.85 ? 0xff5a4a : T1 > 0.55 ? 0xffc23a : 0x3ee08f);
      const s = !o.alive ? ['The chip is not working', 'rgba(170,120,0,0.92)'] : r.throttled ? ['Too hot! The chip slows down to cool off', 'rgba(200,40,30,0.92)'] : T1 > 0.75 ? ['Very hot! Almost too hot...', 'rgba(220,90,20,0.92)'] : T1 > 0.4 ? ['Getting warm', 'rgba(170,120,0,0.92)'] : ['Cool and happy', 'rgba(30,140,80,0.92)'];
      r.sign.userData.set(s[0], s[1]);
      r.path.userData.set(good ? 'Heat path: chip, paste, lid. The heat gets out!' : o.lid === false && o.paste ? 'No lid: nothing spreads the heat' : o.lid === false ? 'No lid, no paste: the heat is stuck in the chip' : 'No paste: air gaps trap the heat', good ? 'rgba(30,110,190,0.92)' : 'rgba(150,60,30,0.92)');
    },
  });

  world({
    id: 'chip-die', name: 'Inside the silicon', zoom: '100×', short: 'silicon',
    view: view(0.45, 3.3, 4.0, -0.4, 0.75),
    intro: 'This is the silicon, 100 times bigger. From up here it looks like a tiny city! The picture on the left is made by the chip. Pull a thinking core off and watch the picture get slow and choppy. Then try the quick memory, the picture maker, and the copper wiring.',
    learn: [
      'The four purple squares are thinking cores. They do the math that makes the picture move. The more cores working, the faster the picture runs. Pull one off to switch it off!',
      'The green block is quick memory, a desk right next to the cores. Without it the cores have to wait for slower memory far away, so everything slows down. The red block is the picture maker. Without it the screen has nothing to show.',
      'The copper wiring is the roads between all the blocks. Each layer you take off is fewer roads, so messages get through slower. With all three off, nothing can talk at all.',
    ],
    shellSay: 'This is the top of the silicon chip.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'silicon', name: 'Silicon', fixed: true, obj: k.group(k.at(k.box(3.2, 0.12, 3.2, k.mat(0xffffff, { map: siliconTex(k, true), metalness: 0.55, roughness: 0.25 })), 0, 0.06, 0)), tagAt: [-1.4, 0.3, 1.75],
        say: 'This is the silicon chip, 100 times bigger. It looks like a tiny city from above!',
        learn: ['Different areas do different jobs, like neighborhoods in a city.', 'All of it was printed with light, a little like printing a photo, then built up layer by layer.', 'The rainbow shine comes from the thin layers on top, which bend light into colors like a soap bubble.'] });
      const cores = [];
      [[-1.0, -1.0], [0, -1.0], [-1.0, 0], [0, 0]].forEach(([x, z], i) => {
        const m = k.box(0.85, 0.08, 0.85, k.mat(0x5a4bb0, { metalness: 0.5, roughness: 0.3, emissive: 0x8a7bff, emissiveIntensity: 0 }));
        m.material.userData.selfLit = true;
        cores.push(m);
        add({ id: 'core' + i, name: 'Thinking core', obj: k.group(k.at(m, x, 0.16, z)), inside: 'transistor', pull: [x * 1.2, 1.4, z * 1.2 + 0.3], tagAt: [x, 0.42, z], tag: 'Core ' + (i + 1),
          breaks: 'That core is switched off. The picture slows down, because there are fewer workers.', breaksAlways: true,
          say: 'This is a thinking core. It does math super fast, like a worker at a desk.',
          learn: ['A core follows instructions one after another, billions of times every second.', 'Having several cores is like having several workers sharing the job. Pull one off and the others have to do more.', 'Each core is built from millions of tiny switches called transistors. Tap Look inside to see one!'] });
      });
      const memTex = k.canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#1f6a52'; c.fillRect(0, 0, w, h); c.fillStyle = '#3fbf8f'; for (let x = 4; x < w; x += 10) for (let y = 4; y < h; y += 10) c.fillRect(x, y, 6, 6); });
      add({ id: 'cache', name: 'Quick memory', obj: k.group(k.at(k.box(1.0, 0.08, 1.9, k.mat(0xffffff, { map: memTex, roughness: 0.4 })), 1.05, 0.16, -0.5)), pull: [1.6, 1.4, -0.6], tagAt: [1.05, 0.42, -0.5],
        breaks: 'Now the cores have to wait for slow memory far away. Everything slows down.', breaksAlways: true,
        say: 'This is quick memory. It is like a desk right next to you instead of a bookshelf across the room.',
        learn: ['It is where the cores keep the things they need right now.', 'It is made of tiny cells that each hold a one or a zero.', 'Fetching from far away memory can take many times longer. That is why this small desk makes such a big difference.'] });
      add({ id: 'gfx', name: 'Picture maker', obj: k.group(k.at(k.box(2.05, 0.08, 0.85, k.mat(0xb05a4b, { metalness: 0.4, roughness: 0.3 })), -0.5, 0.16, 1.05)), pull: [-0.6, 1.4, 1.8], tagAt: [-0.5, 0.42, 1.05],
        breaks: 'The picture maker is gone, so the screen has nothing to show. Just snow!', breaksAlways: true,
        say: 'This part works out the pictures and menus you see on the screen. It is like a team of painters.',
        learn: ['It does many small math problems at the same time, one for each dot of the picture.', 'Each painter only does one tiny dot, but thousands of painters work together, so a whole picture is ready many times a second.', 'Games and videos need a lot of these painters.'] });
      // the wiring: translucent sheets you tap through, with a copper frame at the edge that you grab
      const wTex = k.canvasTex(256, 256, (c, w) => { c.clearRect(0, 0, w, w); c.strokeStyle = '#e8925a'; c.lineWidth = 3; for (let i = 6; i < w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); } });
      const frameMat = k.metal(0xe8925a, { roughness: 0.3 });
      ['wiring1', 'wiring2', 'wiring3'].forEach((id, i) => {
        const mat = k.mat(0xffffff, { map: wTex, transparent: true, opacity: 0.55, metalness: 0.7, roughness: 0.3, side: T.DoubleSide, depthWrite: false });
        const pl = k.mesh(new T.PlaneGeometry(3.1, 3.1), mat);
        pl.rotation.set(-Math.PI / 2, 0, i % 2 ? Math.PI / 2 : 0); pl.position.y = 0.32 + i * 0.12; pl.userData.pickThrough = true;
        const y = pl.position.y, e = 1.55;
        const edge = k.group(k.at(k.box(3.2, 0.05, 0.16, frameMat), 0, y, e), k.at(k.box(3.2, 0.05, 0.16, frameMat), 0, y, -e), k.at(k.box(0.16, 0.05, 3.2, frameMat), e, y, 0), k.at(k.box(0.16, 0.05, 3.2, frameMat), -e, y, 0));
        add({ id, name: 'Copper wiring', obj: k.group(pl, edge), blockedBy: i < 2 ? ['wiring' + (i + 2)] : [], pull: [i % 2 ? 3.6 : -3.6, 0.6 + i * 0.4, 0], tagAt: [-2.15, 0.3 + i * 0.12, -1.4 + i * 1.1], tag: 'Wires ' + (i + 1), tagSize: 0.17,
          breaks: 'A layer of roads is gone. Messages take longer to get around, so the chip slows down.', breaksAlways: true,
          say: 'These are layers of super tiny copper wires that connect everything. They are like roads in a city. Grab the copper edge to pull one off.',
          learn: ['There can be more than ten layers stacked up, like a city with many floors of roads.', 'The thinnest wires are a thousand times thinner than a hair.', 'With fewer roads, the messages between blocks have to wait in traffic. With no roads at all, the blocks cannot talk and nothing works.'] });
      });
      const pulses = [];
      for (let i = 0; i < 6; i++) { const z = -1.2 + i * 0.48; pulses.push(k.flow([[-1.5, 0.27, z], [1.5, 0.27, z]], { count: 3, color: 0x7affd0, size: 0.12, phase: i / 6 })); }
      // the picture the chip is making
      const cv = document.createElement('canvas'); cv.width = 192; cv.height = 144;
      const cx = cv.getContext('2d'), tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
      const pic = new T.Sprite(new T.SpriteMaterial({ map: tex, toneMapped: false })); pic.scale.set(1.5, 1.125, 1); pic.position.set(3.0, 1.0, -0.2); pic.userData.noPick = true;
      const pframe = new T.Sprite(new T.SpriteMaterial({ color: 0x555a66, toneMapped: false })); pframe.scale.set(1.62, 1.245, 1); pframe.position.set(3.0, 1.0, -0.22); pframe.userData.noPick = true;
      const ptag = k.label('The picture it makes', { size: 0.17 }); ptag.position.set(3.0, 1.8, -0.2);
      const speed = live(k, 0.17, 640); speed.position.set(3.0, 0.15, -0.2);
      const bar = gauge(k, 'Speed', 1.3); bar.position.set(2.05, 0.3, -0.2);
      root.add(...pulses, pframe, pic, ptag, speed, bar);
      return { root, parts, refs: { pulses, cores, cv, cx, tex, speed, bar, frame: 0, acc: 0, mode: '', s: 0 } };
    },
    evaluate(has, on) {
      const cores = [0, 1, 2, 3].filter((i) => has('core' + i)).length, wires = ['wiring1', 'wiring2', 'wiring3'].filter(has).length;
      return { alive: on, cores, cache: has('cache'), gfx: has('gfx'), wires };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, on = !!o.alive;
      const target = on ? (o.cores / 4) * (o.cache ? 1 : 0.5) * (o.wires / 3) : 0;
      r.s += (target - r.s) * Math.min(1, dt * 4);
      show(r.pulses, on && o.wires > 0); if (on) upd(r.pulses, dt, 0.7 * r.s + 0.02);
      inst.parts.filter((p) => /^core/.test(p.id)).forEach((p, i) => { p.meshes[0].material.emissiveIntensity = on ? 0.4 + 0.4 * Math.max(0, Math.sin(t * (3 + 8 * r.s) + i * 1.7)) : 0; });
      // the picture: one frame at a time, as fast as the chip can go
      const x = r.cx, W = 192, H = 144;
      const mode = !on ? 'off' : !o.gfx ? 'snow' : r.s < 0.02 ? 'stopped' : 'run';
      if (mode === 'run') r.acc += dt * 20 * r.s;
      let draw = mode !== r.mode; r.mode = mode;
      while (r.acc >= 1) { r.acc -= 1; r.frame++; draw = true; }
      if (draw || mode === 'snow') {
        if (mode === 'snow') { for (let i = 0; i < 60; i++) { const g = (Math.random() * 255) | 0; x.fillStyle = `rgb(${g},${g},${g})`; x.fillRect(((i * 37 + (t * 997) | 0) % W), (Math.random() * H) | 0, 24, 6); } x.fillStyle = 'rgba(0,0,0,0.6)'; x.fillRect(30, 56, 132, 32); x.fillStyle = '#fff'; x.font = '800 22px sans-serif'; x.textAlign = 'center'; x.fillText('No picture', 96, 80); }
        else if (mode === 'off') { x.fillStyle = '#0a0c10'; x.fillRect(0, 0, W, H); }
        else {
          const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7cc4ff'); g.addColorStop(1, '#d6efff'); x.fillStyle = g; x.fillRect(0, 0, W, H);
          x.fillStyle = '#5cb85c'; x.fillRect(0, H - 30, W, 30);
          x.fillStyle = '#ffd23a'; x.beginPath(); x.arc(160, 28, 14, 0, 7); x.fill();
          const f = r.frame, bx = 16 + (Math.abs(((f * 4) % 320) - 160) / 160) * (W - 32), by = H - 40 - Math.abs(Math.sin(f * 0.16)) * 70;
          x.fillStyle = '#ff4a3d'; x.beginPath(); x.arc(bx, by, 12, 0, 7); x.fill();
          if (mode === 'stopped') { x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.font = '800 24px sans-serif'; x.textAlign = 'center'; x.fillText('Frozen!', 96, 80); }
        }
        r.tex.needsUpdate = true;
      }
      r.bar.userData.set(r.s, r.s > 0.7 ? 0x3ee08f : r.s > 0.3 ? 0xffc23a : 0xff5a4a);
      const txt = !on ? 'Off' : r.s < 0.02 ? 'Stopped! The chip cannot work' : r.s > 0.85 ? 'Fast and smooth: ' + o.cores + (o.cores === 1 ? ' core' : ' cores') + ' working' : r.s > 0.45 ? 'Slower and choppy: ' + o.cores + (o.cores === 1 ? ' core' : ' cores') + ' working' : 'Very slow: ' + o.cores + (o.cores === 1 ? ' core' : ' cores') + ' working';
      r.speed.userData.set(txt, !on ? 'rgba(60,60,70,0.92)' : r.s < 0.02 ? 'rgba(200,40,30,0.92)' : r.s > 0.85 ? 'rgba(30,140,80,0.92)' : 'rgba(170,120,0,0.92)');
    },
  });

  world({
    id: 'transistor', name: 'One transistor', zoom: '1,000,000×', short: 'transistor',
    view: view(0.85, 2.5, 3.3),
    dial: {
      label: 'Gate push',
      steps: [
        { name: 'None', level: 0, say: 'No push on the gate. The path is shut, so no electrons get through. The answer is 0.' },
        { name: 'A little', level: 0.3, say: 'A little push, but not enough! The gate has to push hard enough before the path opens. Still shut. The answer is 0.' },
        { name: 'Enough', level: 0.7, say: 'Enough push! The path opens and electrons flow. The answer is 1.' },
        { name: 'Full', level: 1, say: 'A full push. The path is wide open and lots of electrons flow. The answer is 1.' },
      ],
    },
    intro: 'This is one transistor, a million times bigger. It is a tiny switch with no moving parts. Tap the Gate push button and watch the gate open a path for the electrons. Electricity flowing means 1, no flow means 0.',
    learn: [
      'The gate is like a door handle that works without touching. A push of electricity on the gate pulls electrons together into a thin path between the source and the drain.',
      'A tiny push is not enough. The gate has to push past a certain point before the path opens, like a door that only opens once you push hard enough.',
      'Electricity flowing means 1 and no flow means 0. Every picture, game and video is made of huge numbers of these ones and zeros. A modern processor has billions of transistors, and the fastest can switch on and off billions of times a second.',
    ],
    shellSay: 'This is one transistor, a tiny electric switch.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'body', name: 'Silicon', fixed: true, obj: k.group(k.at(k.box(3.2, 0.8, 1.8, k.mat(0x8a8a9c, { map: siliconTex(k, false), metalness: 0.4, roughness: 0.4, transparent: true, opacity: 0.42, depthWrite: false })), 0, 0.4, 0)), inside: 'silicon-atoms', tagAt: [0, 0.3, 1.05],
        say: 'This block is silicon, the stuff computer chips are made of. It is like a sandpit that can be dry or wet.',
        learn: ['Pure silicon barely lets electricity through. A pinch of other atoms changes that.', 'It is the base the whole switch is built on.', 'Tap Look inside to see the silicon atoms.'] });
      add({ id: 'source', name: 'Source', fixed: true, obj: k.group(k.at(k.box(0.85, 0.2, 1.6, k.mat(0x4a7bff, { roughness: 0.4 })), -1.05, 0.81, 0)), tagAt: [-1.05, 1.15, 0.6],
        say: 'The source is where electrons wait to go, like kids waiting at a gate.',
        learn: ['Extra electrons were added here on purpose, so it is crowded with them.', 'It is called the source because the electrons start here.', 'When the gate is open, the electrons stream out of here toward the drain.'] });
      add({ id: 'drain', name: 'Drain', fixed: true, obj: k.group(k.at(k.box(0.85, 0.2, 1.6, k.mat(0x4a7bff, { roughness: 0.4 })), 1.05, 0.81, 0)), tagAt: [1.05, 1.15, 0.6],
        say: 'The drain is where the electrons are going, like water going down a drain.',
        learn: ['Like water down a drain, electrons leave through here when the switch is on.', 'It is built just like the source, with extra electrons added on purpose.', 'Whatever is connected to the drain sees the answer: electrons arriving means 1.'] });
      add({ id: 'oxide', name: 'Glass layer', obj: k.group(k.at(k.box(1.1, 0.06, 1.6, k.glass(0xd8f0ff, 0.5, { depthWrite: false })), 0, 0.84, 0)), blockedBy: ['gate'], pull: [0, 1.3, 1.5], tagAt: [0, 0.95, 1.0],
        breaks: 'Without the glass layer the gate cannot push on the path properly. The switch stays shut.', breaksAlways: true,
        say: 'This super thin glass layer keeps the gate from touching the silicon, like a sheet of plastic wrap.',
        learn: ['It is only a few atoms thick. The gate works through it like a magnet through paper, without touching.', 'Because the gate does not touch, almost no electricity leaks into it, so the switch uses very little power.', 'For many years it was a kind of glass called silicon dioxide, silicon and oxygen, like sand. Newer chips use other special materials too.'] });
      add({ id: 'gate', name: 'Gate', obj: k.group(k.at(k.box(1.1, 0.3, 1.6, k.metal(0xb8bdc4, { roughness: 0.3, transparent: true, opacity: 0.5, depthWrite: false })), 0, 1.02, 0)), pull: [0, 2.0, 0], tagAt: [0.95, 1.35, 0.6],
        breaks: 'The gate is gone, so there is no switch handle. The path can never open. It stays at 0.', breaksAlways: true,
        say: 'The gate is the switch handle! A push on the gate opens a path for electrons.',
        learn: ['When the gate gets a little push of electricity, it pulls electrons into a thin bridge between the source and the drain.', 'On means one, off means zero. Every picture, game and video is made of huge numbers of these ones and zeros.', 'A modern processor has billions of transistors, and the fastest can switch on and off billions of times a second.'] });
      const chMat = k.glow(0x1a3a4a, 0x5adcff);
      const channel = k.at(k.box(1.1, 0.04, 1.5, chMat), 0, 0.72, 0); channel.userData.noPick = true;
      const e = [-0.5, 0, 0.5].map((z, i) => k.flow([[-1.35, 0.86, z], [-0.6, 0.72, z], [0.6, 0.72, z], [1.35, 0.86, z]], { count: 7, color: 0x8fd8ff, size: 0.22, phase: i * 0.33 }));
      const wait = [-0.5, 0, 0.5].map((z, i) => k.flow([[-1.35, 0.98, z], [-0.75, 0.98, z]], { count: 3, color: 0x8fd8ff, size: 0.2, phase: i * 0.3 }));
      [...e, ...wait].forEach((f) => { f.material.depthTest = false; f.renderOrder = 15; });
      const push = k.flow([[0, 2.9, -0.2], [0, 1.4, -0.2]], { count: 5, color: 0xffd23a, size: 0.17 });
      const bar = gauge(k, 'Gate push', 1.3); bar.position.set(-2.55, 0.2, 0.5);
      const bit = live(k, 0.42, 220); bit.position.set(2.3, 1.5, 0.3);
      const sign = live(k, 0.19, 700); sign.position.set(0, 2.35, 0.3);
      root.add(channel, ...e, ...wait, push, bar, bit, sign);
      return { root, parts, refs: { e, wait, push, chMat, channel, bar, bit, sign, open: 0 } };
    },
    evaluate(has, on) { return { alive: on, channel: on && has('gate') && has('oxide'), gate: has('gate') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0];
      const want = o.channel && d.level >= 0.5 ? d.level : 0;
      r.open += (want - r.open) * Math.min(1, dt * 5);
      const isOpen = want > 0;
      r.chMat.emissiveIntensity = 1.6 * r.open; r.channel.scale.y = 0.6 + 2.4 * r.open;
      show(r.e, r.open > 0.05); if (r.open > 0.05) upd(r.e, dt, 0.1 + 0.4 * r.open);
      show(r.wait, !isOpen && !!o.alive); if (!isOpen) upd(r.wait, dt, 0.04);
      show([r.push], o.gate && d.level > 0); if (o.gate && d.level > 0) upd([r.push], dt, 0.2 + 0.5 * d.level);
      r.bar.userData.set(d.level, d.level >= 0.5 ? 0x3ee08f : d.level > 0 ? 0xffc23a : 0x555a66);
      r.bit.userData.set(isOpen ? '1' : '0', isOpen ? 'rgba(30,140,80,0.95)' : 'rgba(140,40,40,0.95)');
      const s = !o.gate ? ['No gate: the path can never open', 'rgba(200,40,30,0.92)'] : !o.channel ? ['No glass layer: the gate cannot push on the path', 'rgba(200,40,30,0.92)'] : isOpen ? ['ON = 1: the path is open, electrons flow', 'rgba(30,140,80,0.92)'] : d.level > 0 ? ['Not enough push yet: still OFF = 0', 'rgba(170,120,0,0.92)'] : ['OFF = 0: the path is shut, electrons wait', 'rgba(140,40,40,0.92)'];
      r.sign.userData.set(s[0], s[1]);
    },
  });

  world({
    id: 'silicon-atoms', name: 'Silicon atoms', zoom: '100,000,000×', short: 'crystal',
    view: view(1.1, 2.8, 2.8),
    dial: {
      label: 'Push',
      steps: [
        { name: 'None', level: 0, say: 'No push. The free electrons just wiggle in place. Nothing flows.' },
        { name: 'Gentle', level: 0.4, say: 'A gentle push. The free electrons drift along slowly. That is a small trickle of electricity.' },
        { name: 'Strong', level: 1, say: 'A strong push! The free electrons rush along. That is a big flow of electricity.' },
      ],
    },
    intro: 'We are a hundred million times bigger, down at the silicon atoms! They hold hands in a perfect pattern. Tap the Push button to push on the free electrons and watch them flow through the crystal.',
    learn: [
      'The big gray balls are silicon atoms holding hands in a neat pattern called a crystal. The glowing blue dots are free electrons. They are not holding hands with anyone, so they can move.',
      'Electricity is just free electrons all moving the same way. With no push they wiggle around in every direction and go nowhere. A push on the crystal makes them all drift the same way. A stronger push makes them flow faster.',
      'Pure silicon has almost no free electrons. Mixing in a pinch of other atoms adds some. That is how engineers decide how well a crystal carries electricity, and how a transistor can be switched.',
    ],
    shellSay: 'These are silicon atoms, stacked in a perfect pattern called a crystal.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const si = k.metal(0x8a93a8, { roughness: 0.3 }), bond = k.mat(0x58607a, { roughness: 0.5 });
      const shell = lattice(k, 6, 3, 3, 0.85, 0.3, () => ({ r: 0.22, mat: si }), bond);
      root.add(shell);
      const p = shell.userData.pos(2, 2, 2);
      add({ id: 'si', name: 'Silicon atom', fixed: true, obj: k.group(k.at(k.sphere(0.26, k.metal(0xb7c0d6, { roughness: 0.2 }), 24), p[0], p[1], p[2])), tagAt: [p[0], p[1] + 0.5, p[2]],
        say: 'This is a silicon atom. Each one holds hands with its neighbors, like kids in a long line.',
        learn: ['Silicon atoms share electrons with their neighbors. The shared electrons are like hands holding the crystal together.',
          'Each silicon atom has 14 electrons. The 4 outer ones do the hand holding.',
          'When a few atoms of something else are mixed in, some electrons get loose and can wander. That is what lets a transistor switch.'] });
      const eInner = k.group(k.sphere(0.11, k.glow(0x2a48ff, 0x4f8dff), 16));
      add({ id: 'electron', name: 'Free electron', fixed: true, obj: k.group(eInner), tagAt: [-2.2, 2.4, 1.0],
        say: 'This is a free electron, wandering through the crystal. It is like a kid who let go of the line and can run around.',
        learn: ['Most electrons are busy holding atoms together. A free one can move, and moving electrons are electricity.', 'When the gate switch is on, it pulls lots of free electrons into a path, and electricity flows.', 'Free electrons bump into atoms as they go. That bumping is why wires and chips warm up.'] });
      const route = [[-2.4, 0.72, 0.42], [-1.7, 0.72, 0.0], [-1.0, 1.15, 0.42], [-0.3, 0.72, 0.0], [0.4, 1.15, 0.42], [1.1, 0.72, 0.0], [1.8, 1.15, 0.42], [2.5, 0.72, 0.0]];
      const others = [0, 0.33, 0.66].map((ph) => k.flow(route.map((q) => [q[0], q[1], q[2] - 0.85]), { count: 3, color: BLUE, size: 0.15, phase: ph }));
      const path = new T.CatmullRomCurve3(route.map((q) => new T.Vector3(q[0], q[1], q[2])));
      const bar = gauge(k, 'Flow', 1.3); bar.position.set(-3.0, 0.3, 0.6);
      const sign = live(k, 0.19, 700); sign.position.set(0, 2.75, 0.3);
      root.add(...others, bar, sign);
      return { root, shell: [shell], parts, refs: { eInner, path, others, bar, sign, clock: 0, s: 0 } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, d = inst.def.dial.steps[inst.dial || 0], on = !!(out && out.alive);
      r.s += ((on ? d.level : 0) - r.s) * Math.min(1, dt * 3);
      r.clock += dt * 0.18 * r.s;
      show(r.others, r.s > 0.03); upd(r.others, dt, 0.18 * r.s);
      const base = r.path.getPointAt(r.clock % 1);
      const wig = 1 - r.s;
      r.eInner.position.set(base.x + Math.sin(t * 9) * 0.07 * wig, base.y + Math.cos(t * 11) * 0.07 * wig, base.z + Math.sin(t * 7) * 0.07 * wig);
      r.bar.userData.set(r.s, 0x6a9bff);
      r.sign.userData.set(d.level === 0 ? 'No push: electrons just wiggle in place' : d.level < 0.7 ? 'Gentle push: a small trickle of electricity' : 'Strong push: a big flow of electricity', d.level === 0 ? 'rgba(60,60,70,0.92)' : 'rgba(30,110,190,0.92)');
    },
  });

  // =====================================================================  battery


  world({
    id: 'battery-inside', name: 'Inside a battery', zoom: '3×', short: 'battery',
    view: view(1.45, 3.4, 4.1, -0.6, 0.32),
    intro: 'This battery is cut open, 3 times bigger. The gray paste in the middle has extra electrons it wants to give away. The black powder around the outside wants them. The paper wall between them won\'t let the electrons cross. So they take the long way: out the bottom, through the bulb, and back in the top. That trip lights the bulb!',
    learn: [
      'Follow the blue dots. They go from the zinc paste into the brass nail, down to the flat minus end, along the wire, through the bulb, in at the plus bump, down the steel can, and into the black powder.',
      'Inside, the red dots cross the paper wall the other way. They are tiny charged bits that keep both sides balanced, so the electrons can keep on flowing.',
      'Every electron that leaves uses up a little zinc. Watch the Zinc left meter. When the zinc is all used up, there is nothing left to give, and the battery is dead.',
      'This kind of battery is called alkaline. It can\'t be recharged. Rechargeable batteries use chemicals that can be pushed back the other way.',
    ],
    shellSay: 'This is a battery, cut open so you can see inside.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'can', name: 'Steel can', obj: cutTube(k, 0.7, 0.74, 2.4, 1.5, k.metal(0xc9ced6, { roughness: 0.3 })), pull: [-2.8, 0, -0.6], tagAt: [-0.95, 2.2, -0.5],
        say: 'The steel can holds everything in. It is also the plus side of the battery!',
        learn: ['The can presses against the black powder, so it carries the plus side all the way up to the bump on top.', 'It is sealed tight so the paste inside can\'t leak out.'] });
      add({ id: 'plusCap', name: 'Plus bump', obj: k.group(k.at(k.cyl(0.24, 0.24, 0.16, k.metal(0xd8dde4, { roughness: 0.2 }), 32), 0, 2.78, 0)), pull: [0, 1.0, 0], tagAt: [0.15, 3.15, 0.2],
        say: 'The bump on top is the plus end. Electrons come back in here after their trip.' });
      add({ id: 'minusEnd', name: 'Minus end', fixed: true, obj: k.group(k.at(k.cyl(0.74, 0.74, 0.06, k.metal(0xb8bdc4, { roughness: 0.3 }), 48), 0, 0.27, 0)), tagAt: [-0.9, 0.15, 0.5],
        say: 'The flat bottom is the minus end. Electrons leave the battery here.',
        learn: ['Inside, the brass nail connects the zinc paste to this end.'] });
      const powder = grainTex(k, '#141416', ['#232327', '#2e2e33', '#0a0a0b', '#3b3b40'], 2600, 2.2, [3, 2]);
      add({ id: 'cathode', name: 'Black powder', obj: cutTube(k, 0.48, 0.68, 2.1, 1.5, k.mat(0xffffff, { map: powder, bumpMap: powder, bumpScale: 0.05, roughness: 1, metalness: 0, envMapIntensity: 0.25 })), blockedBy: ['can'], pull: [2.8, 0, -0.4], tagAt: [0.62, 2.25, 0.25],
        say: 'This black powder is manganese dioxide. It is hungry for electrons!',
        learn: ['It is packed into a ring pressed against the steel can.', 'It catches the electrons when they come back from their trip around the wire.', 'It is mixed with carbon, like pencil lead, so electricity can move through it easily.'] });
      add({ id: 'separator', name: 'Paper wall', obj: cutTube(k, 0.45, 0.48, 2.1, 1.5, k.mat(0xffffff, { map: fiberTex(k), roughness: 0.95 })), blockedBy: ['cathode'], pull: [-2.2, 0.5, 1.2], tagAt: [0.3, 1.75, 0.55],
        say: 'This paper wall keeps the zinc paste and the black powder from touching. That is what makes the electrons take the long way.',
        learn: ['If the two sides touched, the electrons would just jump across inside, and the battery would use itself up without lighting anything.', 'The paper is soaked in a watery liquid. Tiny charged bits can swim through it, but the powders can\'t.'] });
      const paste = grainTex(k, '#4f555d', ['#a9b0b9', '#cfd5dc', '#3f444a', '#7d848d'], 1800, 1.6, [3, 2]);
      add({ id: 'anode', name: 'Zinc paste', obj: cutTube(k, 0.06, 0.45, 2.1, 1.5, k.mat(0xffffff, { map: paste, roughness: 0.6, metalness: 0.2, emissive: 0xffffff, emissiveIntensity: 0 })), inside: 'battery-chemistry', blockedBy: ['separator'], pull: [2.2, 0.5, 1.2], tagAt: [0.3, 1.0, 0.25],
        say: 'This gray paste is full of tiny bits of zinc metal. Zinc gives away electrons!',
        learn: ['When the loop is closed, zinc lets go of electrons. They rush out through the brass nail and the wire.', 'As zinc gives away electrons it turns into zinc oxide, a white powder. Watch the paste get paler as the battery runs.', 'Tap Look inside to watch the zinc atoms do it.'] });
      add({ id: 'nail', name: 'Brass nail', obj: k.group(k.at(k.cyl(0.05, 0.05, 2.0, k.metal(GOLD, { roughness: 0.25 }), 12), 0, 1.3, 0)), pull: [0, 2.6, 0.6], tagAt: [-0.35, 0.6, 0.35],
        say: 'The brass nail collects electrons from the zinc and sends them down to the minus end.',
        learn: ['Brass is a mix of copper and zinc. It carries electricity well and doesn\'t rust.'] });
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0); bulbMat.transparent = true; bulbMat.opacity = 0.85;
      const wirePts = [[0, 0.22, 0.2], [0.9, 0.15, 0.9], [1.7, 0.6, 0.9], [1.8, 2.2, 0.9], [1.6, 3.15, 0.6], [0.8, 3.25, 0.25], [0, 2.9, 0.1]];
      add({ id: 'circuit', name: 'Wire and bulb', obj: k.group(k.tube(wirePts, 0.03, k.mat(0xc0392b, { roughness: 0.5 })), k.at(k.sphere(0.22, bulbMat, 20), 1.8, 2.4, 0.9)), pull: [1.6, 0, 1.4], tagAt: [2.3, 2.85, 0.9],
        say: 'This wire and little bulb make a loop from the minus end back to the plus end.',
        learn: ['No loop, no flow. That is why a switch works: it opens and closes the loop.', 'Pull the wire off and watch: the electrons stop, inside and out.'] });
      // electrons outside, and their trip inside: paste -> nail -> bottom; top -> can -> powder; ions across the paper
      const flow = k.flow(wirePts, { count: 22, color: BLUE, size: 0.2 });
      const inner = [];
      [0.85, 1.45, 2.05].forEach((y, i) => inner.push(k.flow([[0.42, y, 0.06], [0.08, y - 0.1, 0.06], [0.08, 0.36, 0.06]], { count: 5, color: BLUE, size: 0.14, phase: i / 3 })));
      [0.9, 1.5, 2.1].forEach((y, i) => inner.push(k.flow([[0.18, 2.88, 0.06], [0.72, 2.66, 0.06], [0.72, y, 0.06], [0.53, y, 0.06]], { count: 5, color: BLUE, size: 0.14, phase: i / 3 })));
      const ions = [0.8, 1.2, 1.6, 2.0, 2.4].map((y, i) => k.flow([[0.06, y, 0.64], [0.06, y, 0.32]], { count: 2, color: 0xff5a4a, size: 0.12, phase: i / 5 }));
      const glowB = halo(k, 1.8, 2.4, 0.9);
      // Zinc left meter
      const meter = k.group(), bg = k.at(k.box(0.26, 1.6, 0.06, k.mat(0x202430, { roughness: 0.8 })), 0, 0.8, 0);
      const fillMat = new T.MeshBasicMaterial({ color: 0x3ee08f, toneMapped: false }), fill = k.mesh(new T.BoxGeometry(0.2, 1.54, 0.08), fillMat);
      fill.position.y = 0.8; meter.add(bg, fill); meter.position.set(-1.45, 0.5, 0.4);
      meter.traverse((o) => { o.userData.noPick = true; });
      const mLab = k.label('Zinc left', { size: 0.15 }); mLab.position.set(-1.45, 2.55, 0.4);
      const dead = k.label('Battery dead! Power off and on for a new one', { size: 0.15, bg: 'rgba(200,40,30,0.92)' }); dead.position.set(0, 3.55, 0); dead.visible = false;
      root.add(flow, ...inner, ...ions, glowB, meter, mLab, dead);
      return { root, parts, refs: { flow, inner, ions, bulbMat, glowB, fill, fillMat, dead, zinc: 1, wasOn: false, told: false } };
    },
    evaluate(has, on) {
      const ok = ['can', 'plusCap', 'cathode', 'separator', 'anode', 'nail', 'circuit'].every(has);
      return { alive: on && ok, reason: on && !ok ? 'The battery needs all its parts to push the electrons around the loop.' : '' };
    },
    apply(out, inst) { const r = inst.refs; show([r.flow, r.glowB, ...r.inner, ...r.ions], out.alive && r.zinc > 0); },
    tick(dt, t, inst, out, on) {
      const r = inst.refs;
      if (on && !r.wasOn && r.zinc <= 0) { r.zinc = 1; r.told = false; TAL.say('A fresh battery, full of zinc! Off we go.'); }
      r.wasOn = !!on;
      const running = !!(out && out.alive) && r.zinc > 0;
      if (running) {
        r.zinc = Math.max(0, r.zinc - dt / 50);
        upd([r.flow], dt, 0.12); upd(r.inner, dt, 0.25); upd(r.ions, dt, 0.18);
        if (r.zinc <= 0 && !r.told) { r.told = true; TAL.say('The zinc is all used up. There are no more electrons to give, so the battery is dead! The bulb goes out.'); }
      }
      show([r.flow, r.glowB, ...r.inner, ...r.ions], running);
      inst.byId.circuit.meshes[1].material.emissiveIntensity = running ? 2.5 : 0;
      r.fill.scale.y = Math.max(0.001, r.zinc); r.fill.position.y = 0.03 + 0.77 * r.zinc;
      r.fillMat.color.setHex(r.zinc > 0.5 ? 0x3ee08f : r.zinc > 0.2 ? 0xffc23a : 0xff5a4a);
      r.dead.visible = r.zinc <= 0;
      inst.byId.anode.meshes.forEach((m) => { m.material.emissiveIntensity = 0.55 * (1 - r.zinc); });
    },
  });

  world({
    id: 'battery-chemistry', name: 'Zinc atoms at work', zoom: '1,000,000×', short: 'chemistry',
    view: view(1.5, 4.4, 4.8, 0, 0.22),
    intro: 'A million times bigger! Silver zinc atoms on the left, black powder molecules on the right, and the paper wall between. Watch it happen one step at a time: the sign at the top tells you each step.',
    learn: [
      '1. A zinc atom lets go of 2 blue electrons. 2. They travel around the outside wire and light the bulb. 3. A black powder molecule on the other side catches them.',
      '4. Catching electrons makes the black powder molecule spit out a charged bit called hydroxide: a red oxygen and a white hydrogen stuck together. It swims through the paper wall. 5. It grabs the zinc atom, which becomes zinc oxide, the white ball. That zinc is used up.',
      'The electrons go one way around the outside, and the hydroxide goes the other way through the inside. That is a full loop, and it keeps going until every zinc atom has turned white.',
    ],
    shellSay: 'These are atoms inside the battery: zinc on the left, black powder on the right.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const zn = k.metal(0xc5ccd6, { roughness: 0.22 });
      const left = lattice(k, 3, 3, 3, 0.58, 0.45, () => ({ r: 0.24, mat: zn }), null); left.position.x = -1.5;
      // manganese dioxide: a dark manganese atom with two red oxygens
      const right = k.group(), mnMat = k.mat(0x1e1b1c, { roughness: 0.55 }), oMat = k.mat(0xe0453a, { roughness: 0.45 });
      const mols = [];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let l = 0; l < 3; l++) {
        const g = k.group(k.sphere(0.2, mnMat, 18), k.at(k.sphere(0.11, oMat, 12), 0.2, 0.08, 0), k.at(k.sphere(0.11, oMat, 12), -0.2, -0.08, 0));
        g.position.set(1.5 + (i - 1) * 0.58, 0.45 + j * 0.58, (l - 1) * 0.58); g.rotation.y = (i + j + l) * 0.9;
        right.add(g); if (l === 2) mols.push(g);
      }
      const front = left.children.filter((m, idx) => idx % 3 === 2).sort((a, b) => b.position.x - a.position.x || b.position.y - a.position.y);
      root.add(left, right);
      add({ id: 'zinc', name: 'Zinc atom', fixed: true, obj: k.group(), tagAt: [-1.5, 2.15, 0.9],
        say: 'These silver balls are zinc atoms. Each one is ready to give away 2 electrons.',
        learn: ['Giving away electrons is what makes the electricity. The zinc is the fuel.', 'After it gives them away, the zinc atom joins up with hydroxide and turns into zinc oxide, the white ball. A dead battery is full of zinc oxide.'] });
      add({ id: 'mno2', name: 'Black powder', fixed: true, obj: k.group(), tagAt: [1.5, 2.15, 0.9],
        say: 'Each of these is a black powder molecule: a dark manganese atom holding two red oxygen atoms. Its name is manganese dioxide.',
        learn: ['It catches the electrons when they come back around the wire.', 'Catching them makes it push out hydroxide, the little red and white pair that swims across to the zinc.'] });
      const sepMat = k.mat(0xefe4c8, { transparent: true, opacity: 0.4, roughness: 0.9, side: T.DoubleSide, depthWrite: false });
      add({ id: 'wall', name: 'Paper wall', fixed: true, obj: k.group(k.at(k.box(0.06, 1.9, 1.9, sepMat), 0, 1.03, 0)), tagAt: [0, 2.2, 0.95],
        say: 'The paper wall keeps the zinc and the black powder apart. Electrons can\'t cross it, but hydroxide can swim through.',
        learn: ['Because electrons can\'t cross here, they have to go the long way around the outside wire. That trip is the electricity we use.'] });
      // the outside wire, arching over the top, with a bulb
      const arch = [[-1.5, 2.1, 0.6], [-1.5, 3.1, 0.6], [-0.7, 3.65, 0.6], [0, 3.75, 0.6], [0.7, 3.65, 0.6], [1.5, 3.1, 0.6], [1.5, 2.1, 0.6]];
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0);
      add({ id: 'wire', name: 'Outside wire', fixed: true, obj: k.group(k.tube(arch, 0.035, k.mat(0xc0392b, { roughness: 0.5 })), k.at(k.sphere(0.2, bulbMat, 18), 0, 3.75, 0.6)), tagAt: [0.75, 4.05, 0.6],
        say: 'This is the wire and bulb outside the battery. The electrons light the bulb on their way around.' });
      const glowB = halo(k, 0, 3.75, 0.6, 0xffe9a0, 1.2);
      const dot = (r, c) => { const m = k.mesh(new T.SphereGeometry(r, 12, 8), new T.MeshBasicMaterial({ color: c, toneMapped: false })); m.userData.noPick = true; m.visible = false; return m; };
      const e1 = dot(0.13, 0x4fb6ff), e2 = dot(0.13, 0x4fb6ff);
      const oh = k.group(k.sphere(0.16, k.mat(0xe0453a, { emissive: 0xe0453a, emissiveIntensity: 0.5 }), 14), k.at(k.sphere(0.1, k.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.4 }), 12), 0.19, 0.07, 0)); oh.visible = false; oh.traverse((o) => { o.userData.noPick = true; });
      const steps = ['1. Zinc lets go of 2 electrons', '2. They zip around the wire and light the bulb', '3. The black powder catches them', '4. Hydroxide swims through the paper wall', '5. Zinc + hydroxide = zinc oxide. Used up!', 'All the zinc is used up. The battery is dead!', 'Power is off: no loop, so nothing happens'].map((s, i) => {
        const l = k.label(s, { size: 0.17, bg: i >= 5 ? 'rgba(200,40,30,0.92)' : 'rgba(30,110,190,0.92)' }); l.position.set(0, 4.35, 0.6); l.visible = false; return l;
      });
      const leg1 = k.label('Blue dot = electron', { size: 0.16 }); leg1.position.set(-1.6, -0.15, 1.1);
      const leg2 = k.label('Red + white = hydroxide', { size: 0.16 }); leg2.position.set(1.6, -0.15, 1.1);
      root.add(glowB, e1, e2, oh, ...steps, leg1, leg2);
      return { root, shell: [left, right], parts, refs: { front, mols, e1, e2, oh, steps, glowB, bulbMat, arch, t: 0, idx: 0, cloned: false } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = !!(out && out.alive), V = T.Vector3;
      if (!r.cloned) { r.cloned = true; r.front.forEach((m) => { m.material = m.material.clone(); }); r.mols.forEach((g) => { g.children[0].material = g.children[0].material.clone(); }); }
      const showStep = (i) => r.steps.forEach((l, n) => { l.visible = n === i; });
      const hide = () => { r.e1.visible = r.e2.visible = r.oh.visible = false; r.glowB.visible = false; r.bulbMat.emissiveIntensity = 0; };
      if (!on) { hide(); showStep(6); return; }
      const CYC = 6.5, n = r.front.length;
      if (r.idx >= n) {
        hide(); showStep(5); r.t += dt;
        if (r.t > 4) { r.t = 0; r.idx = 0; r.front.forEach((m) => { m.material.color.setHex(0xc5ccd6); m.material.emissive.setHex(0x000000); m.material.metalness = 0.8; m.scale.setScalar(1); }); }
        return;
      }
      r.t += dt;
      const z = r.front[r.idx], zp = new V(), mol = r.mols[r.idx % r.mols.length], mp = new V();
      z.getWorldPosition(zp); mol.getWorldPosition(mp); inst.root.worldToLocal(zp); inst.root.worldToLocal(mp);
      const along = (pts, f) => { const segs = pts.length - 1, x = Math.min(segs - 1e-6, f * segs), i = Math.floor(x), u = x - i; return new V().fromArray(pts[i]).lerp(new V().fromArray(pts[i + 1]), u); };
      const s = r.t, lerp = (a, b, f) => a.clone().lerp(b, Math.min(1, Math.max(0, f)));
      const start = new V().fromArray(r.arch[0]), end = new V().fromArray(r.arch[r.arch.length - 1]);
      let lit = false;
      z.material.emissive.setHex(s < 1.3 ? 0x335577 : 0x000000);
      mol.children[0].material.emissive.setHex(s > 3.3 && s < 4.0 ? 0x553300 : 0x000000);
      if (s < 1.3) { showStep(0); const f = s / 1.3; r.e1.position.copy(lerp(zp, start, f)).y += 0.1; r.e2.position.copy(lerp(zp, start, f)).y -= 0.1; r.e1.visible = r.e2.visible = true; r.oh.visible = false; }
      else if (s < 3.3) { showStep(1); const f = (s - 1.3) / 2; r.e1.position.copy(along(r.arch, f)); r.e2.position.copy(along(r.arch, Math.max(0, f - 0.06))); r.e1.visible = r.e2.visible = true; lit = true; }
      else if (s < 4.0) { showStep(2); const f = (s - 3.3) / 0.7; r.e1.position.copy(lerp(end, mp, f)); r.e2.position.copy(lerp(end, mp, f - 0.15)); r.e1.visible = r.e2.visible = f < 1; }
      else if (s < 5.6) { showStep(3); r.e1.visible = r.e2.visible = false; const f = (s - 4.0) / 1.6; r.oh.position.copy(lerp(mp, zp, f)); r.oh.visible = true; }
      else { showStep(4); r.oh.visible = false; const f = (s - 5.6) / 0.9; z.material.color.copy(new T.Color(0xc5ccd6).lerp(new T.Color(0xffffff), f)); z.material.metalness = 0.8 * (1 - f); z.scale.setScalar(1 + 0.15 * f); }
      r.glowB.visible = lit; r.bulbMat.emissiveIntensity = lit ? 2.4 : 0;
      if (s >= CYC) { r.t = 0; z.material.color.setHex(0xffffff); z.material.metalness = 0; r.idx++; }
    },
  });

  // =====================================================================  capacitor
  const CAP_DIAL = {
    label: 'Power',
    steps: [
      { name: 'On', level: 1, say: 'The power is on. Electrons flow in and pile up inside, filling the capacitor like a water tank. The bulb stays dark for now.' },
      { name: 'Off', level: 0, say: 'The power is off! The capacitor lets its stored electricity out through the bulb, so the bulb lights up. Then the tank runs out, and the bulb fades.' },
    ],
  };
  // a straight rod between two points (wires and bus bars)
  function rod(k, a, b, mat, r) {
    const m = k.mesh(new T.CylinderGeometry(r || 0.03, r || 0.03, 1, 8), mat); m.userData.noPick = true;
    aim(m, new T.Vector3(...a), new T.Vector3(...b));
    return m;
  }
  // the dim/bright state of a wire branch
  const branchColor = (mats, on) => mats.forEach((m) => m.color.setHex(on ? 0xc0392b : 0x4a4d55));

  world({
    id: 'cap-inside', name: 'Inside a capacitor', zoom: '10×', short: 'capacitor',
    view: view(1.95, 4.0, 4.8),
    dial: CAP_DIAL,
    intro: 'This is a capacitor, 10 times bigger. It is a little tank that fills up with electricity. Tap the Power button. With the power on, watch the Charge bar fill up. Then switch the power off and watch the bulb light from the stored electricity!',
    learn: [
      'A capacitor is like a water tower. The power fills it up, and then it holds the water until somebody needs some. Here it holds electrons, not water.',
      'When the power is on, electrons pile up on one foil and leave the other. The two foils never touch, so the electrons stay stored. When the power goes off, they rush out through the bulb. Fast, and then it is empty.',
      'Unlike a battery, a capacitor does not make electricity. It only holds what you put in, and it gives it back very quickly. TVs use them to smooth out bumpy electricity and to give a quick burst when it is needed.',
    ],
    shellSay: 'This is a capacitor, opened up.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const can = k.group(
        k.at(k.cyl(0.88, 0.88, 2.5, k.mat(0x1f3c8f, { roughness: 0.35, side: T.DoubleSide }), 48, true), 0, 1.55, 0),
        k.at(k.cyl(0.86, 0.86, 0.04, k.metal(0xc9ced6, { roughness: 0.25 }), 48), 0, 2.8, 0),
        k.at(k.box(1.2, 0.02, 0.05, 0x555555), 0, 2.83, 0), k.at(k.box(0.05, 0.02, 1.2, 0x555555), 0, 2.83, 0),
        k.at(k.box(0.06, 2.3, 0.3, k.mat(0xdfe4ea)), 0.88, 1.55, 0)
      );
      add({ id: 'can', name: 'Metal can', obj: can, pull: [-2.8, 0, 0], tagAt: [-0.95, 3.05, 0],
        job: 'The can protects the foil roll and keeps the special liquid sealed in.',
        say: 'The metal can protects the inside and keeps it sealed, like a tin lunch box.',
        learn: ['The cross on top is a safety vent. If the capacitor ever gets too hot, it opens gently instead of bursting.', 'The light stripe on the side shows which leg is the minus one.', 'Inside the can, the foil roll is soaked in a special liquid that helps it hold electricity.'] });
      const plug = grainTex(k, '#17171a', ['#26262a', '#0c0c0e', '#303034'], 900, 1.6, [2, 1]);
      add({ id: 'seal', name: 'Rubber plug', obj: k.group(k.at(k.cyl(0.84, 0.84, 0.25, k.mat(0xffffff, { map: plug, roughness: 0.95 }), 48), 0, 0.43, 0)), pull: [2.6, -0.1, 0.8], tagAt: [1.45, 0.75, 0.6],
        job: 'The rubber plug seals the bottom so the liquid cannot leak, and holds the legs in place.',
        say: 'The rubber plug is like a cork. It seals the bottom and lets the legs poke through.',
        learn: ['It is rubber, so it can squeeze tight around the legs.', 'A good seal keeps the special liquid inside from drying out. Capacitors slowly wear out when that liquid dries.', 'A worn out capacitor sometimes bulges at the top or the bottom. Repair people look for that.'] });
      // the foil roll: bright metal foil and paper
      const foilTex = k.canvasTex(256, 256, (c, w) => {
        c.fillStyle = '#cdd2d9'; c.fillRect(0, 0, w, w);
        for (let i = 0; i < 700; i++) { c.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(110,120,135,0.35)'; c.lineWidth = 1; const y = Math.random() * w; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + (Math.random() - 0.5) * 5); c.stroke(); }
        c.fillStyle = 'rgba(233,221,189,0.85)'; c.fillRect(0, w * 0.46, w, w * 0.08);
      });
      foilTex.wrapS = T.RepeatWrapping; foilTex.repeat.set(2, 1);
      const spiral = k.canvasTex(256, 256, (c, w) => {
        c.fillStyle = '#8a7a58'; c.fillRect(0, 0, w, w);
        const b = 1.9, mid = w / 2;
        [['#d3d8df', 0], ['#e9ddbd', Math.PI]].forEach(([col, off]) => {
          c.strokeStyle = col; c.lineWidth = b * Math.PI * 0.95; c.lineCap = 'butt'; c.beginPath();
          for (let a = 0; a < Math.PI * 2 * 20; a += 0.06) { const rr = b * (a + off), px = mid + Math.cos(a) * rr, py = mid + Math.sin(a) * rr; if (a === 0) c.moveTo(px, py); else c.lineTo(px, py); }
          c.stroke();
        });
        c.globalCompositeOperation = 'destination-in'; c.beginPath(); c.arc(mid, mid, mid - 1, 0, 7); c.fill();
      });
      const mk = (map) => k.mat(0xffffff, { map, roughness: 0.4, metalness: 0.4, emissive: 0x58b8ff, emissiveIntensity: 0, transparent: map === spiral });
      const rollG = k.group(k.at(k.cyl(0.78, 0.78, 2.1, mk(foilTex), 48, true), 0, 1.6, 0));
      const cap1 = k.at(k.rot(k.mesh(new T.CircleGeometry(0.78, 48), mk(spiral)), -Math.PI / 2, 0, 0), 0, 2.652, 0), cap2 = k.at(k.rot(k.mesh(new T.CircleGeometry(0.78, 48), mk(spiral)), Math.PI / 2, 0, 0), 0, 0.548, 0);
      rollG.add(cap1, cap2);
      rollG.children.forEach((m) => { m.material.userData.selfLit = true; });
      add({ id: 'roll', name: 'Foil roll', obj: rollG, inside: 'cap-plates', blockedBy: ['can'], pull: [0, 0, 2.6], tagAt: [0, 2.95, 0.9],
        say: 'Inside is a long strip of metal foil and paper, rolled up tight! The roll is like a water tower that stores electricity.',
        learn: ['If you unrolled it, it could be as long as your arm, or even longer.', 'Two foil strips are separated by paper soaked in a special liquid. The foils never touch.', 'Rolling it up fits a lot of foil into a small can. More foil means more room to store electricity.', 'Tap Look inside to see how the foils store electricity.'] });
      const legs = k.group(k.at(k.cyl(0.03, 0.03, 0.9, k.metal(0xd6dbe2), 8), -0.3, 0.0, 0), k.at(k.cyl(0.03, 0.03, 0.9, k.metal(0xd6dbe2), 8), 0.3, 0.0, 0));
      add({ id: 'legs', name: 'Legs', obj: legs, pull: [0, 0, 2.2], tagAt: [0.75, -0.2, 0.3],
        say: 'The two legs are like pipes. They connect the capacitor to the board. One goes to each foil inside.',
        learn: ['Electrons come in one leg and go out the other. They can never cross the paper between the foils.', 'The shorter leg is usually the minus one, next to the stripe on the can.', 'Without the legs, nothing can get into the foils, so the tank can never fill up.'] });
      // the little circuit beside it (lifted so it sits above the table): power on the left, bulb on the right
      const L = 1.0;
      parts.forEach((p) => { p.obj.position.y += L; });
      const wm = k.mat(0xc0392b, { roughness: 0.5 }), wp = [k.mat(0xc0392b, { roughness: 0.5 }), k.mat(0xc0392b, { roughness: 0.5 })], wb = [k.mat(0xc0392b, { roughness: 0.5 }), k.mat(0xc0392b, { roughness: 0.5 })];
      const TOP = 0.52, BOT = 0.08, Z = -0.4, LEG = -0.45 + L, XB = -1.75, XL = 1.75, MID = (TOP + BOT) / 2;
      root.add(rod(k, [0.3, LEG, 0], [0.3, TOP, Z], wm), rod(k, [-0.3, LEG, 0], [-0.3, BOT, Z], wm), rod(k, [XB, TOP, Z], [XL, TOP, Z], wm), rod(k, [XB, BOT, Z], [XL, BOT, Z], wm),
        rod(k, [XB, TOP, Z], [XB, MID + 0.12, Z], wp[0]), rod(k, [XB, BOT, Z], [XB, MID - 0.12, Z], wp[1]), rod(k, [XL, TOP, Z], [XL, MID + 0.15, Z], wb[0]), rod(k, [XL, BOT, Z], [XL, MID - 0.15, Z], wb[1]));
      const batMat = k.mat(0x2f9e5a, { roughness: 0.5 });
      const bat = k.at(k.box(0.34, 0.24, 0.3, batMat), XB, MID, Z); bat.userData.noPick = true;
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0); bulbMat.transparent = true; bulbMat.opacity = 0.85;
      const bulb = k.at(k.sphere(0.17, bulbMat, 20), XL, MID, Z); bulb.userData.noPick = true;
      const glowB = halo(k, XL, MID, Z, 0xffe9a0, 1.5);
      const batLab = k.label('Power', { size: 0.16 }); batLab.position.set(XB, TOP + 0.35, Z);
      const bulbLab = k.label('Bulb', { size: 0.16 }); bulbLab.position.set(XL, TOP + 0.35, Z);
      const fl = [k.flow([[-0.3, LEG, 0], [-0.3, 1.6 + L, 0], [-0.3, 2.5 + L, 0.6]], { count: 6, color: BLUE, size: 0.13 }), k.flow([[0.3, 2.5 + L, 0.6], [0.3, 1.6 + L, 0], [0.3, LEG, 0]], { count: 6, color: BLUE, size: 0.13 })];
      const chg = [k.flow([[XB, BOT, Z], [-0.3, BOT, Z], [-0.3, LEG, 0]], { count: 6, color: BLUE, size: 0.13 }), k.flow([[0.3, LEG, 0], [0.3, TOP, Z], [XB, TOP, Z]], { count: 6, color: BLUE, size: 0.13 })];
      const dis = [k.flow([[-0.3, LEG, 0], [-0.3, BOT, Z], [XL, BOT, Z], [XL, MID - 0.15, Z]], { count: 7, color: BLUE, size: 0.13 }), k.flow([[XL, MID + 0.15, Z], [XL, TOP, Z], [0.3, TOP, Z], [0.3, LEG, 0]], { count: 7, color: BLUE, size: 0.13 })];
      const bar = gauge(k, 'Charge', 1.6); bar.position.set(-2.7, 0.15, 0.2);
      const sign = live(k, 0.2, 780); sign.position.set(0, 4.5, 0.4);
      root.add(bat, bulb, glowB, batLab, bulbLab, ...fl, ...chg, ...dis, bar, sign);
      return { root, parts, refs: { fl, chg, dis, wp, wb, bulbMat, glowB, bar, sign, charge: 0 } };
    },
    evaluate(has, on) { const ok = ['roll', 'legs'].every(has); return { alive: on && ok, reason: on && !ok ? 'Without the foil roll and the legs, there is nothing to fill up.' : '' }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0], ok = !!o.alive, charging = d.level > 0;
      const before = r.charge;
      if (!ok) r.charge = Math.max(0, r.charge - dt * 0.5);
      else if (charging) r.charge = Math.min(1, r.charge + dt * 0.25);
      else r.charge = Math.max(0, r.charge - dt * (0.1 + 0.3 * r.charge));
      const moving = ok && Math.abs(r.charge - before) > 1e-4, filling = moving && charging, emptying = moving && !charging;
      show(r.fl, moving); show(r.chg, filling); show(r.dis, emptying);
      if (moving) { const sp = charging ? 0.4 : -0.1 - 0.5 * r.charge; upd(r.fl, dt, sp); upd(r.chg, dt, 0.4); upd(r.dis, dt, 0.1 + 0.5 * r.charge); }
      branchColor(r.wp, charging); branchColor(r.wb, !charging);
      const lit = emptying ? Math.sqrt(r.charge) : 0;
      r.bulbMat.emissiveIntensity = 2.6 * lit; r.glowB.visible = lit > 0.05; r.glowB.scale.setScalar(0.6 + 1.2 * lit);
      const roll = inst.byId.roll; if (roll) roll.meshes.forEach((m) => { m.material.emissiveIntensity = r.charge * 0.7; });
      r.bar.userData.set(r.charge, charging ? 0x3ee08f : 0xffc23a);
      const s = !ok ? ['The tank is missing a part, so it cannot fill', 'rgba(170,120,0,0.92)'] : charging ? (r.charge > 0.98 ? ['Full! It is holding all it can', 'rgba(30,140,80,0.92)'] : ['Power on: the tank is filling up', 'rgba(30,110,190,0.92)']) : (r.charge > 0.02 ? ['Power off: the stored electricity lights the bulb!', 'rgba(220,150,20,0.95)'] : ['Empty! The bulb went out', 'rgba(60,60,70,0.92)']);
      r.sign.userData.set(s[0], s[1]);
    },
  });

  world({
    id: 'cap-plates', name: 'The plates', zoom: '10,000×', short: 'plates',
    view: view(1.15, 2.9, 3.6),
    dial: CAP_DIAL,
    intro: 'Ten thousand times bigger, this is a tiny piece of the foil roll: two metal plates with a thin layer between them. Tap the Power button. With the power on, watch electrons pile up on the bottom plate. Switch it off and they rush back out through the bulb!',
    learn: [
      'Think of a dam. With the power on, electrons pile up behind the bottom plate like water behind a dam. They cannot cross the gap, so they wait there.',
      'The top plate loses electrons and the bottom plate gains them. That difference is the stored electricity. The purple lines are the invisible push between the plates, called an electric field.',
      'When the power goes off, the dam opens. The electrons rush around the loop and light the bulb. If the plates ever touched, they would all rush across at once with a spark. That is why the layer in between matters.',
    ],
    shellSay: 'Two plates with a gap between them. That is a capacitor.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const plate = () => k.box(2.8, 0.1, 2.0, k.metal(0xd6dbe2, { roughness: 0.25 }));
      const minus = [], plus = [];
      const bottom = k.group(k.at(plate(), 0, 0.55, 0));
      const top = k.group(k.at(plate(), 0, 1.75, 0));
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
        const x = -1.1 + i * 0.44, z = -0.66 + j * 0.44;
        const e = k.at(k.sphere(0.07, k.glow(0x2a48ff, 0x4f8dff), 10), x, 0.66, z); e.material.emissiveIntensity = 1.5; bottom.add(e); minus.push(e);
        const h = k.rot(k.at(k.torus(0.07, 0.02, k.glow(0xff5a4a, 0xff5a4a), 12), x, 1.69, z), Math.PI / 2, 0, 0); h.material.emissiveIntensity = 1.5; top.add(h); plus.push(h);
      }
      add({ id: 'bottom', name: 'Bottom plate', obj: bottom, pull: [0, -0.4, 2.6], tagAt: [-1.6, 0.55, 1.1],
        say: 'Electrons pile up on this plate, like water behind a dam!',
        learn: ['They cannot cross the gap, so they wait here, like water behind a dam.', 'When something needs a quick burst of power, the electrons rush back around the loop all at once.', 'The more electrons it can hold, the more electricity the capacitor stores.'] });
      add({ id: 'top', name: 'Top plate', obj: top, pull: [0, 1.4, 1.6], tagAt: [-1.6, 1.95, 1.1],
        say: 'This plate is losing electrons, so it becomes the plus side. The red rings are the empty spots.',
        learn: ['The power pulls electrons off this plate and pushes them around to the other one.', 'The more electrons move, the more electricity is stored. The red rings show the empty spots left behind.', 'Each electron on the bottom plate is paired with one empty spot on the top plate. That pairing is what is stored.'] });
      const insMat = k.mat(0xffffff, { map: fiberTex(k, '#e8dcc0', 2), transparent: true, opacity: 0.4, roughness: 0.9, depthWrite: false });
      add({ id: 'gap', name: 'Insulator layer', obj: k.group(k.at(k.box(2.8, 1.0, 2.0, insMat), 0, 1.15, 0)), blockedBy: ['top'], pull: [3.4, 0.2, 0], tagAt: [0.6, 1.15, 1.2],
        breaks: 'The plates touch now! All the stored electricity rushes across at once, and nothing is stored.', breaksAlways: true,
        say: 'This layer keeps the plates apart, like a wall in the middle of the dam, so electrons cannot jump across.',
        learn: ['If the plates touched, all the stored electricity would rush out at once, with a spark.', 'In real capacitors this layer is incredibly thin, which lets them store even more.', 'Here it is paper, soaked in a special liquid. Paper is an insulator, which means electrons cannot move through it.'] });
      const field = [];
      for (let i = 0; i < 5; i++) {
        const m = k.at(k.cyl(0.015, 0.015, 1.05, k.mat(0x9fd8ff, { transparent: true, opacity: 0, emissive: 0x9fd8ff, emissiveIntensity: 1, depthWrite: false }), 6), -1.0 + i * 0.5, 1.15, 0.5);
        m.userData.noPick = true; field.push(m); root.add(m);
      }
      const wm = k.mat(0xc0392b, { roughness: 0.5 }), wp = [k.mat(0xc0392b, { roughness: 0.5 }), k.mat(0xc0392b, { roughness: 0.5 })], wb = [k.mat(0xc0392b, { roughness: 0.5 }), k.mat(0xc0392b, { roughness: 0.5 })];
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0); bulbMat.transparent = true; bulbMat.opacity = 0.85;
      root.add(rod(k, [-2.2, 0.55, 0], [-1.4, 0.55, 0], wp[0]), rod(k, [-2.2, 1.75, 0], [-1.4, 1.75, 0], wp[1]), rod(k, [1.4, 0.55, 0], [2.3, 0.55, 0], wb[0]), rod(k, [1.4, 1.75, 0], [2.3, 1.75, 0], wb[1]));
      const bat = k.at(k.box(0.3, 0.5, 0.3, k.mat(0x2f9e5a, { roughness: 0.5 })), -2.2, 1.15, 0); bat.userData.noPick = true;
      const bulb = k.at(k.sphere(0.22, bulbMat, 20), 2.3, 1.15, 0); bulb.userData.noPick = true;
      root.add(rod(k, [-2.2, 0.55, 0], [-2.2, 0.9, 0], wm), rod(k, [-2.2, 1.4, 0], [-2.2, 1.75, 0], wm), rod(k, [2.3, 0.55, 0], [2.3, 0.93, 0], wm), rod(k, [2.3, 1.37, 0], [2.3, 1.75, 0], wm));
      const glowB = halo(k, 2.3, 1.15, 0, 0xffe9a0, 1.5);
      const batLab = k.label('Power', { size: 0.15 }); batLab.position.set(-2.2, 0.2, 0);
      const bulbLab = k.label('Bulb', { size: 0.15 }); bulbLab.position.set(2.3, 0.2, 0);
      const leads = [k.flow([[-2.2, 0.55, 0], [-1.6, 0.55, 0]], { count: 4, color: BLUE, size: 0.13 }), k.flow([[-1.6, 1.75, 0], [-2.2, 1.75, 0]], { count: 4, color: BLUE, size: 0.13 })];
      const dis = [k.flow([[1.4, 0.55, 0], [2.3, 0.55, 0], [2.3, 0.7, 0]], { count: 4, color: BLUE, size: 0.13 }), k.flow([[2.3, 1.6, 0], [2.3, 1.75, 0], [1.4, 1.75, 0]], { count: 4, color: BLUE, size: 0.13 })];
      const count = live(k, 0.19, 640); count.position.set(0, 2.45, 0.5);
      const bar = gauge(k, 'Charge', 1.5); bar.position.set(-3.0, 0.2, 0.2);
      root.add(...leads, ...dis, bat, bulb, glowB, batLab, bulbLab, count, bar);
      return { root, parts, refs: { minus, plus, field, leads, dis, wp, wb, bulbMat, glowB, count, bar, charge: 0 } };
    },
    evaluate(has, on) { const ok = ['bottom', 'top'].every(has); return { alive: on && ok, gap: has('gap') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0], charging = d.level > 0;
      const before = r.charge;
      if (!o.alive) r.charge = Math.max(0, r.charge - dt * 3);
      else if (!o.gap) r.charge = Math.max(0, r.charge - dt * 3);
      else if (charging) r.charge = Math.min(1, r.charge + dt * 0.3);
      else r.charge = Math.max(0, r.charge - dt * (0.1 + 0.3 * r.charge));
      const n = Math.round(r.charge * r.minus.length);
      r.minus.forEach((m, i) => { m.visible = i < n; });
      r.plus.forEach((m, i) => { m.visible = i < n; });
      r.field.forEach((m) => { m.material.opacity = r.charge * 0.8; });
      const moving = Math.abs(r.charge - before) > 1e-4, filling = moving && o.alive && o.gap && charging, emptying = moving && o.alive && o.gap && !charging;
      show(r.leads, filling); show(r.dis, emptying);
      if (filling) upd(r.leads, dt, 0.5);
      if (emptying) upd(r.dis, dt, 0.1 + 0.5 * r.charge);
      branchColor(r.wp, charging); branchColor(r.wb, !charging);
      const lit = emptying ? Math.sqrt(r.charge) : 0;
      r.bulbMat.emissiveIntensity = 2.6 * lit; r.glowB.visible = lit > 0.05; r.glowB.scale.setScalar(0.6 + 1.2 * lit);
      r.bar.userData.set(r.charge, charging ? 0x3ee08f : 0xffc23a);
      r.count.userData.set('Electrons stored: ' + n + ' of ' + r.minus.length, !o.gap ? 'rgba(200,40,30,0.92)' : charging ? 'rgba(30,110,190,0.92)' : 'rgba(220,150,20,0.95)');
    },
  });

  // =====================================================================  LCD
  world({
    id: 'lcd-pixel', name: 'One pixel', zoom: '100×', short: 'pixel',
    view: view(1.6, 3.4, 4.2, -0.4, 0.3),
    intro: 'This is one pixel of the screen, 100 times bigger, pulled apart into its layers. White light comes up from the bottom and each layer changes it. The square on the right shows what you would see. Pull a layer off and watch what happens to it!',
    shellSay: 'This is one pixel, stretched apart so you can see every layer.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const lines = (vert) => k.canvasTex(128, 128, (c, w) => { c.fillStyle = 'rgba(160,170,190,0.5)'; for (let i = 0; i < w; i += 8) { if (vert) c.fillRect(i, 0, 3, w); else c.fillRect(0, i, w, 3); } });
      const plate = (y, mo) => k.at(k.box(2.6, 0.06, 1.4, k.mat(mo.color || 0xffffff, Object.assign({ transparent: true, opacity: 0.55, roughness: 0.3, depthWrite: false }, mo))), 0, y, 0);
      const blMat = k.glow(0xf4f7ff, 0xffffff); blMat.emissiveIntensity = 1;
      add({ id: 'backlight', name: 'Backlight', fixed: true, obj: k.group(k.at(k.box(2.6, 0.08, 1.4, blMat), 0, 0.2, 0)), tagAt: [-1.7, 0.2, 0.7],
        say: 'White light shines up from the LED lights behind the screen.' });
      add({ id: 'rearPol', name: 'Back polarizer', obj: k.group(plate(0.65, { map: lines(true), color: 0xdfe6f2 })), blockedBy: ['tft'], pull: [-3.4, 0, 0], tagAt: [-1.7, 0.65, 0.7],
        say: 'This filter only lets light wiggling one way through.',
        breaks: 'Now the light wiggles every which way, and the liquid crystal cannot control it. The pixel is stuck bright white. No picture!',
        learn: ['Light wiggles as it travels. This sheet is like a fence with slots that only lets one direction of wiggle pass.', 'Some sunglasses have this kind of filter too. That is how they cut glare.'] });
      const tft = k.group(plate(1.05, { color: 0xd8f0ff }));
      [-0.8, 0, 0.8].forEach((x) => tft.add(k.at(k.box(0.12, 0.08, 0.12, k.metal(GOLD)), x - 0.25, 1.1, -0.5)));
      add({ id: 'tft', name: 'Switch glass', obj: tft, blockedBy: ['lc'], pull: [3.4, 0, 0], tagAt: [1.75, 1.05, 0.7],
        say: 'This glass has a tiny switch for each color dot.',
        breaks: 'No switches, so nothing tells the dots how bright to be. Stuck white. No picture!',
        learn: ['Each switch sends just the right amount of electricity to its dot.', 'They are thin film transistors. A 4K TV has about 25 million of them!'] });
      const lc = k.group();
      [-0.8, 0, 0.8].forEach((x) => {
        lc.add(k.at(k.box(0.7, 0.25, 1.2, k.mat(0xbfe8ff, { transparent: true, opacity: 0.35, depthWrite: false })), x, 1.45, 0));
        for (let i = 0; i < 4; i++) lc.add(k.rot(k.at(k.cyl(0.03, 0.03, 0.3, k.mat(0x7fd6ff), 6), x - 0.2 + i * 0.13, 1.45, 0), 0, 0, Math.PI / 2 - i * 0.35));
      });
      add({ id: 'lc', name: 'Liquid crystal', obj: lc, inside: 'liquid-crystal', blockedBy: ['filter'], pull: [-3.4, 0.2, 0.4], tagAt: [-1.75, 1.45, 0.7],
        say: 'The liquid crystal twists the light, a little or a lot.',
        breaks: 'Nothing is left to turn the light, so every dot looks the same. Stuck white. No picture!',
        learn: ['With no electricity its molecules twist the light so it can get through. With electricity they straighten up and block it.', 'By setting each dot somewhere in between, the TV makes every shade.', 'Tap Look inside to see the molecules.'] });
      const filter = k.group();
      [[-0.8, 0xff3030], [0, 0x30ff60], [0.8, 0x3060ff]].forEach(([x, c]) => filter.add(k.at(k.box(0.75, 0.06, 1.3, k.mat(c, { transparent: true, opacity: 0.75, roughness: 0.3, emissive: c, emissiveIntensity: 0.25 })), x, 1.85, 0)));
      add({ id: 'filter', name: 'Color filter', obj: filter, blockedBy: ['frontPol'], pull: [3.4, 0.2, 0.4], tagAt: [1.75, 1.85, 0.7],
        say: 'Red, green and blue windows color the light.',
        breaks: 'No more colors! The picture is only black, white and grey.',
        learn: ['Every color on a TV is a mix of just these three. Red and green light together look yellow!', 'Each little window is called a subpixel. Three of them make one pixel.'] });
      add({ id: 'frontPol', name: 'Front polarizer', obj: k.group(plate(2.25, { map: lines(false), color: 0xdfe6f2 })), pull: [-3.2, 0.9, -0.6], tagAt: [-1.7, 2.25, 0.7],
        say: 'The last filter, turned the other way, decides how much light gets out.',
        breaks: 'Now nothing stops the light. Every dot shines at full blast, so the pixel is stuck bright white. No picture!',
        learn: ['Light only gets out if the liquid crystal twisted it to line up with this filter.', 'Without it, you would see the backlight shining but no picture at all.'] });
      const low = [], high = [], cols = [0xff3030, 0x30ff60, 0x3060ff];
      [-0.8, 0, 0.8].forEach((x, i) => {
        low.push(k.flow([[x, 0.3, 0.2], [x, 1.85, 0.2]], { count: 6, color: 0xfff8ee, size: 0.16, phase: i / 3 }));
        high.push(k.flow([[x, 1.9, 0.2], [x, 3.1, 0.2]], { count: 4, color: cols[i], size: 0.2, phase: i / 3 }));
      });
      // what you'd see: one pixel, as a square, plus a sign saying what's going on
      const mixMat = new T.SpriteMaterial({ color: 0xffffff, toneMapped: false });
      const mix = new T.Sprite(mixMat); mix.scale.set(0.9, 0.9, 1); mix.position.set(2.55, 2.0, -0.2); mix.userData.noPick = true;
      const frame = new T.Sprite(new T.SpriteMaterial({ color: 0x555a66, toneMapped: false })); frame.scale.set(1.03, 1.03, 1); frame.position.set(2.55, 2.0, -0.22); frame.userData.noPick = true;
      const mixTag = k.label('What you see', { size: 0.15 }); mixTag.position.set(2.55, 2.65, -0.2);
      const status = [['A picture: the color keeps changing', 'rgba(30,140,80,0.92)'], ['Stuck bright white: no picture!', 'rgba(200,40,30,0.92)'], ['No colors: only black, white and grey', 'rgba(170,120,0,0.92)'], ['Power is off', 'rgba(60,60,70,0.92)']]
        .map(([txt, bg]) => { const l = k.label(txt, { size: 0.15, bg }); l.position.set(2.55, 1.3, -0.2); l.visible = false; return l; });
      root.add(...low, ...high, frame, mix, mixTag, ...status);
      return { root, parts, refs: { low, high, mixMat, cols, status } };
    },
    evaluate(has, on) {
      return { alive: on, block: has('rearPol') && has('frontPol') && has('lc') && has('tft'), color: has('filter') };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      show(r.low, on); show(r.high, on);
      const lvl = [0, 1, 2].map((i) => (out && out.block ? 0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.1) : 1));
      if (on) { upd(r.low, dt, 0.5); upd(r.high, dt, 0.5); }
      r.high.forEach((f, i) => { const c = new T.Color(out && out.color ? r.cols[i] : 0xffffff).multiplyScalar(lvl[i]); f.material.color.copy(c); });
      const mixC = out && out.color ? new T.Color(lvl[0], lvl[1], lvl[2]) : new T.Color(1, 1, 1).multiplyScalar((lvl[0] + lvl[1] + lvl[2]) / 3);
      r.mixMat.color.copy(on ? mixC : new T.Color(0.08, 0.08, 0.1));
      const st = !on ? 3 : !(out && out.block) ? 1 : !(out && out.color) ? 2 : 0;
      r.status.forEach((l, i) => { l.visible = i === st; });
    },
  });

  world({
    id: 'liquid-crystal', name: 'Liquid crystal molecules', zoom: '10,000×', short: 'liquid crystal',
    view: view(1.15, 3.5, 4.1, -0.45, 0.26),
    dial: {
      label: 'Electricity',
      steps: [
        { name: 'Off', level: 0, say: 'No electricity. The molecules twist like a staircase, the light twists with them and gets out. The pixel is bright!' },
        { name: 'Some', level: 0.5, say: 'A little electricity. The molecules tip part way up, so the light only twists part way, and only some of it gets out. The pixel is grey.' },
        { name: 'Full', level: 1, say: 'Full electricity! The molecules stand straight up. The light can\'t twist, so the front filter soaks it up. The pixel is dark.' },
      ],
    },
    intro: 'Ten thousand times bigger! These rods are liquid crystal molecules between two sheets of glass. Tap the Electricity button to give them none, some, or a lot. Watch the molecules, the yellow light, and the pixel on the right that shows what you would see.',
    shellSay: 'Liquid crystal molecules between two sheets of glass.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const glass = () => k.box(2.8, 0.08, 2.0, k.glass(0xd8f0ff, 0.35, { depthWrite: true }));
      const itoMat = (c) => k.mat(c, { transparent: true, opacity: 0.35, roughness: 0.3, depthWrite: false });
      add({ id: 'glassB', name: 'Bottom glass', obj: k.group(k.at(glass(), 0, 0.3, 0), k.at(k.box(2.8, 0.02, 2.0, itoMat(0x4a8cff)), 0, 0.355, 0)), pull: [0, -0.2, 2.6], tagAt: [-1.6, 0.3, 1.1],
        say: 'The bottom glass has a see-through wire layer and tiny grooves that line up the first layer of molecules.',
        learn: ['The grooves are made by rubbing a thin coating in one direction, a bit like brushing a cat the same way every time.', 'The wire layer is so thin that light goes right through it, but electricity can still flow in it. It is made of indium tin oxide.', 'Below this glass is the back filter. It makes the light coming in wiggle just one way, side to side, before it reaches the molecules.'] });
      add({ id: 'glassT', name: 'Top glass', obj: k.group(k.at(glass(), 0, 2.5, 0), k.at(k.box(2.8, 0.02, 2.0, itoMat(0xff5a4a)), 0, 2.445, 0)), blockedBy: ['frontF'], pull: [0, 1.9, -1.2], tagAt: [-1.6, 2.6, 1.1],
        say: 'The top glass has its own see-through wire layer, and grooves turned a quarter turn the other way. That is what makes the twist.' });
      const stripes = k.canvasTex(128, 128, (c, w) => { c.fillStyle = 'rgba(160,170,190,0.55)'; for (let i = 0; i < w; i += 10) c.fillRect(0, i, w, 4); });
      add({ id: 'frontF', name: 'Front filter', obj: k.group(k.at(k.box(2.8, 0.05, 2.0, k.mat(0xdfe6f2, { map: stripes, transparent: true, opacity: 0.55, roughness: 0.3, depthWrite: false })), 0, 2.85, 0)), pull: [0, 1.4, 2.0], tagAt: [1.7, 2.95, -0.9],
        say: 'This is the front filter, a polarizer. It only lets out light that wiggles front to back. Pull it off and see what the pixel does!',
        breaks: 'Without the front filter, all the light gets out no matter what the molecules do. The pixel is stuck bright.',
        learn: ['The light came in wiggling side to side. It only gets out here if the molecules turned its wiggle a quarter turn.', 'So the molecules don\'t make light or block light themselves. They only turn the wiggle. The two filters do the rest.'] });
      // molecules: two halves each, which pick up a little minus and a little plus when the electricity is on
      const rods = [], rodGroup = k.group(), rmat = k.mat(0x7fd6ff, { roughness: 0.3 });
      for (let layer = 0; layer < 6; layer++) for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
        const m = k.group(k.at(k.cyl(0.05, 0.05, 0.22, rmat, 8), 0, 0.11, 0), k.at(k.cyl(0.05, 0.05, 0.22, rmat, 8), 0, -0.11, 0));
        m.position.set(-1.0 + i * 0.5, 0.6 + layer * 0.34, -0.55 + j * 0.55);
        rodGroup.add(m);
        rods.push({ m, twist: (layer / 5) * (Math.PI / 2), rate: 1.1 + Math.random() * 1.2, v: 0 });
      }
      add({ id: 'rods', name: 'Crystal molecules', fixed: true, obj: rodGroup, tagAt: [-0.2, 2.25, 1.0],
        say: 'These rods are liquid crystal molecules. They are a liquid, so they can turn, but they like to line up together, like fish swimming in a school.',
        learn: ['With no electricity, the grooves on the glass line up the molecules touching them. The bottom and top grooves point different ways, so the molecules in between make a slow quarter turn, like a spiral staircase. The light\'s wiggle follows the staircase around.',
          'Turn on the electricity. The top wire layer fills up with plus charge and the bottom one with minus charge. That makes an invisible push, called an electric field, straight up and down: the purple dots.',
          'The push tugs on the tiny electrons inside each molecule. The end nearest the plus layer gets a little bit minus, and the other end a little bit plus: the blue and red halves. The field pulls those ends opposite ways, so the molecule swings upright, like a compass needle swinging to point north.',
          'Standing up, the molecules can\'t turn the light\'s wiggle, so the front filter soaks it up and the pixel goes dark. A little electricity tips them only part way, which makes grey. Each pixel on a TV gets its own amount, many times a second. That is how a picture moves.'] });
      // the light: a rope of beads climbing through, its wiggle turning with the molecules
      const N = 70, beads = [];
      for (let i = 0; i < N; i++) { const b = k.mesh(new T.SphereGeometry(0.05, 10, 8), new T.MeshBasicMaterial({ color: 0xffe066, toneMapped: false })); b.userData.noPick = true; beads.push(b); root.add(b); }
      const lightLab = k.label('Light', { size: 0.15, bg: 'rgba(170,120,0,0.92)' }); lightLab.position.set(2.05, 0.35, 1.0);
      // what you'd see: one pixel, as bright as the light that gets out
      const pixMat = new T.SpriteMaterial({ color: 0xffffff, toneMapped: false });
      const pix = new T.Sprite(pixMat); pix.scale.set(1.0, 1.0, 1); pix.position.set(2.75, 1.7, -0.3); pix.userData.noPick = true;
      const frame = new T.Sprite(new T.SpriteMaterial({ color: 0x555a66, toneMapped: false })); frame.scale.set(1.14, 1.14, 1); frame.position.set(2.75, 1.7, -0.32); frame.userData.noPick = true;
      const pixLab = k.label('What you see', { size: 0.16 }); pixLab.position.set(2.75, 2.45, -0.3);
      // the electric field: purple dots streaming from the + layer to the - layer
      const field = [-1.3, -0.65, 0, 0.65, 1.3].map((x, i) => k.flow([[x, 2.42, -1.0], [x, 0.38, -1.0]], { count: 5, color: 0xc77dff, size: 0.2, phase: i / 5 }));
      const plus = k.label('+  +  +  plus  +  +  +', { size: 0.14, bg: 'rgba(200,50,40,0.9)' }); plus.position.set(-0.6, 2.62, -1.05);
      const minus = k.label('-  -  -  minus  -  -  -', { size: 0.14, bg: 'rgba(40,90,200,0.9)' }); minus.position.set(-0.6, 0.05, -1.05);
      root.add(lightLab, frame, pix, pixLab, ...field, plus, minus);
      return { root, parts, refs: { rods, beads, pixMat, s: 0, field, plus, minus, base: new T.Color(0x7fd6ff) } };
    },
    evaluate(has, on) { return { alive: on, wires: has('glassT') && has('glassB'), filt: has('frontF') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, d = inst.def.dial.steps[inst.dial || 0];
      const want = out && out.alive && out.wires ? d.level : 0;
      r.s += (want - r.s) * Math.min(1, dt * 1.6);
      if (!r.halves) { r.halves = []; r.rods.forEach(({ m }) => { r.halves.push([m.children[0], -1], [m.children[1], 1]); }); }
      const up = new T.Quaternion(), tw = new T.Quaternion(), flat = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 0, 1), Math.PI / 2);
      r.rods.forEach((rod) => {
        rod.v += (want - rod.v) * Math.min(1, dt * rod.rate);
        tw.setFromAxisAngle(new T.Vector3(0, 1, 0), rod.twist).multiply(flat); rod.m.quaternion.copy(tw).slerp(up, rod.v);
      });
      const red = new T.Color(0xff3a2a), blue = new T.Color(0x2a6cff);
      r.halves.forEach(([h, sign]) => { h.material.color.copy(r.base).lerp(sign > 0 ? red : blue, r.s); });
      const fieldOn = r.s > 0.08;
      r.field.forEach((f) => { f.visible = fieldOn; }); if (fieldOn) upd(r.field, dt, 0.3 + 0.5 * r.s);
      r.plus.visible = r.minus.visible = fieldOn;
      // light: wiggle starts side to side (along x); the staircase turns it toward front-to-back (z)
      const turn = (Math.PI / 2) * (1 - r.s), filt = !(out && out.filt === false);
      const passAmp = filt ? Math.sin(turn) : 1, outAng = filt ? Math.PI / 2 : turn;
      r.beads.forEach((b, i) => {
        const y = 0.0 + (3.6 * i) / (r.beads.length - 1);
        let ang, amp = 0.28;
        if (y < 0.6) ang = 0;
        else if (y < 2.3) ang = turn * ((y - 0.6) / 1.7);
        else if (y < 2.85) ang = turn;
        else { ang = outAng; amp = 0.28 * passAmp; }
        const w = Math.sin(y * 9 - t * 7) * amp;
        b.position.set(1.65 + Math.cos(ang) * w, y, 0.95 + Math.sin(ang) * w);
        b.visible = !(y >= 2.85 && passAmp < 0.12);
      });
      const bright = filt ? Math.sin(turn) ** 2 : 1;
      r.pixMat.color.setScalar(0.05 + 0.95 * bright);
    },
  });

  // =====================================================================  speaker
  const SPK = [
    { name: 'Off', f: 0, amp: 0, say: 'The speaker is quiet. The cone is not moving, so there is no sound.' },
    { name: 'Deep, soft', f: 2.2, amp: 0.04, say: 'A deep, soft sound. The cone wiggles slowly and only a little. We are showing it slowed down so you can see it.' },
    { name: 'Deep, loud', f: 2.2, amp: 0.12, say: 'A deep, loud sound. The cone still wiggles slowly, but much farther. Farther means louder!' },
    { name: 'High, soft', f: 7, amp: 0.04, say: 'A high, soft sound. The cone wiggles fast but only a little. Fast means a higher sound!' },
    { name: 'High, loud', f: 7, amp: 0.12, say: 'A high, loud sound. The cone wiggles fast and far. Slow it down in your mind, because a real cone does this hundreds of times a second!' },
  ];
  world({
    id: 'speaker-inside', name: 'Inside a speaker', zoom: '5×', short: 'speaker',
    view: view(1.4, 2.9, 3.9, -1.0, 0.25),
    dial: { label: 'Sound', steps: SPK },
    intro: 'This speaker is cut open, 5 times bigger. Tap the Sound button to pick a deep or high sound, soft or loud, and watch the cone and the sound waves. Slow wiggles make deep sounds. Fast wiggles make high sounds. Big, far wiggles make loud sounds!',
    learn: [
      'Sound is air wiggling. The cone wiggles back and forth and shoves the air, and the air shoves your eardrum. How fast it wiggles is the pitch, and how far it wiggles is the loudness.',
      'The voice coil is pushed and pulled by the big magnet. The music signal flips the electricity in the coil back and forth, so the coil, and the cone stuck to it, jump back and forth with the music.',
      'Here the cone is slowed way down so your eyes can follow it. A real cone moves many hundreds of times every second for ordinary sounds. The waves are so quick you cannot see them, but you can hear them.',
    ],
    shellSay: 'This is a speaker, cut in half.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const Y = 1.4, ts = Math.PI / 2, tl = Math.PI * 1.5;
      const coneGeo = (rt, rb, h) => { const g = new T.CylinderGeometry(rt, rb, h, 48, 1, true, ts, tl); g.rotateX(Math.PI / 2); return g; };
      add({ id: 'frame', name: 'Metal frame', fixed: true, obj: k.group(k.at(k.mesh(coneGeo(1.45, 0.55, 1.0), k.metal(0x5a5f68, { roughness: 0.4, side: T.DoubleSide, transparent: true, opacity: 0.35, depthWrite: false })), 0, Y, 0.25)), tagAt: [-1.55, Y + 1.45, 0.4],
        say: 'The metal frame is like a skeleton. It holds every part in place.',
        learn: ['It is the basket the other parts hang from.', 'It is stiff steel or aluminum, so it does not wobble when the cone shakes.', 'It has big openings, so air can move behind the cone as well as in front.'] });
      const paper = fiberTex(k, '#d4c29a', 3);
      const rubber = grainTex(k, '#1c1a19', ['#2b2928', '#0e0d0c', '#363433'], 700, 1.5, [8, 1]);
      const coneIn = k.group(k.at(k.mesh(coneGeo(1.3, 0.38, 0.7), k.mat(0xffffff, { map: paper, roughness: 0.95, side: T.DoubleSide })), 0, Y, 0.45),
        k.at(k.mesh(new T.TorusGeometry(1.3, 0.075, 10, 48, Math.PI * 1.5), k.mat(0xffffff, { map: rubber, roughness: 0.9 })), 0, Y, 0.8));
      add({ id: 'cone', name: 'Paper cone', obj: k.group(coneIn), blockedBy: ['dust'], pull: [0, 0, 2.4], tagAt: [1.15, Y + 1.25, 0.9],
        say: 'The paper cone is like a big hand that pushes the air back and forth. That is sound!',
        learn: ['Sound is air wiggling. The cone shoves the air, and the air shoves your eardrum.', 'Slow wiggles sound low, like a drum. Fast wiggles sound high, like a whistle.', 'The cone is light and stiff, so it can move back and forth hundreds or thousands of times a second.', 'The dark ring around the edge is a rubber surround. It lets the cone move in and out while keeping it centered.'] });
      const dustIn = k.group(k.at(k.rot(k.mesh(new T.SphereGeometry(0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), k.mat(0x1d1b19, { roughness: 0.8, side: T.DoubleSide })), Math.PI / 2, 0, 0), 0, Y, 0.78));
      add({ id: 'dust', name: 'Dust cap', obj: k.group(dustIn), pull: [0, 0.8, 2.2], tagAt: [0, Y + 0.65, 1.3],
        job: 'The dust cap keeps dust out of the gap around the coil, so the coil never gets stuck.',
        say: 'The dust cap is like a little hat. It keeps dust out of the middle of the speaker.',
        learn: ['It sits over the middle of the cone.', 'A bit of grit stuck in the tiny gap around the coil could make the speaker buzz or scrape.', 'The cap moves in and out together with the cone.'] });
      const coilIn = k.group(k.at(k.rot(k.cyl(0.38, 0.38, 0.5, k.metal(0xc8743a, { roughness: 0.35, side: T.DoubleSide }), 32, true), Math.PI / 2, 0, 0), 0, Y, -0.05));
      add({ id: 'coil', name: 'Voice coil', obj: k.group(coilIn), blockedBy: ['spider'], pull: [-2.4, 0.4, 0.8], tagAt: [-0.95, Y + 0.65, -0.1],
        say: 'The voice coil is copper wire wrapped around a tube. Electricity turns it into a magnet!',
        learn: ['When electricity flows through the coil, it becomes a magnet that pushes and pulls against the big magnet.', 'The music signal flips the electricity back and forth, so the coil jumps back and forth with the music.', 'A coil that becomes a magnet is called an electromagnet. Motors work the same way.'] });
      const spider = k.group();
      for (let i = 0; i < 4; i++) spider.add(k.at(k.torus(0.45 + i * 0.09, 0.02, k.mat(0xc9a86a, { roughness: 0.9 }), 40), 0, Y, 0.12));
      add({ id: 'spider', name: 'Springy spider', obj: spider, blockedBy: ['cone'], pull: [2.4, 0.4, 0.8], tagAt: [1.65, Y - 0.05, 0.3],
        say: 'The springy spider is like a trampoline. It holds the coil in the middle and pulls it back.',
        learn: ['It is made of stiff wavy cloth, so it can flex but always springs back to the center.', 'It is not a real spider. It got its name from its web-like rings.', 'Without it the coil would rub on the magnet and the cone would sag.'] });
      add({ id: 'magnet', name: 'Magnet', obj: k.group(k.at(k.rot(k.mesh(new T.CylinderGeometry(0.95, 0.95, 0.4, 48, 1, false, ts, tl), k.mat(0x2a2a2e, { roughness: 0.6 })), Math.PI / 2, 0, 0), 0, Y, -0.55)), pull: [0, -0.2, -2.4], tagAt: [-1.3, Y - 0.95, -0.6],
        say: 'The big magnet never changes. The coil pushes and pulls against it, like two kids leaning on each other.',
        learn: ['It is usually ferrite, a ceramic magnet made mostly from iron oxide, which is a bit like rust.', 'The magnet makes a strong pull right in the gap where the coil sits.', 'A magnet gets its pull from tiny areas inside it that all point the same way.'] });
      add({ id: 'pole', name: 'Metal post', fixed: true, obj: k.group(k.at(k.rot(k.cyl(0.3, 0.3, 0.9, k.metal(0x9aa0aa, { roughness: 0.3 }), 24), Math.PI / 2, 0, 0), 0, Y, -0.35)), tagAt: [0.35, Y - 1.2, -0.5],
        say: 'The metal post guides the magnet power into the gap where the coil sits, like water squeezed through a narrow pipe.',
        learn: ['The magnet pull gets squeezed through the post and the ring around it.', 'That makes the pull very strong in the narrow gap where the coil moves.', 'The coil slides up and down around the post without touching it.'] });
      const N = 6;
      const waves = []; for (let i = 0; i < N; i++) { const m = k.torus(1, 0.02, k.mat(0x9fd8ff, { transparent: true, opacity: 0, emissive: 0x9fd8ff, emissiveIntensity: 1, depthWrite: false }), 48); m.position.set(0, Y, 1.0); m.userData.noPick = true; root.add(m); waves.push(m); }
      const bP = gauge(k, 'Pitch', 1.2), bL = gauge(k, 'Loudness', 1.2); bP.position.set(1.2, 0.1, -1.9); bL.position.set(1.8, 0.1, -1.9);
      const sign = live(k, 0.2, 860); sign.position.set(0, 3.25, 0.6);
      root.add(bP, bL, sign);
      return { root, parts, refs: { coneIn, dustIn, coilIn, waves, Y, bP, bL, sign, phase: 0, amp: 0, f: 0 } };
    },
    evaluate(has, on) { return { alive: on && ['cone', 'coil', 'magnet', 'spider'].every(has), reason: on && !['coil', 'magnet'].every(has) ? 'No coil or no magnet means nothing pushes the cone.' : '' }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0], N = r.waves.length;
      const ok = !!o.alive;
      r.f += ((ok ? d.f : 0) - r.f) * Math.min(1, dt * 4); r.amp += ((ok ? d.amp : 0) - r.amp) * Math.min(1, dt * 4);
      r.phase += dt * Math.PI * 2 * r.f;
      const z = Math.sin(r.phase) * r.amp;
      [r.coneIn, r.dustIn, r.coilIn].forEach((g) => { g.position.z = z; });
      const hi = d.f > 4, sf = hi ? 1 : 2, loud = Math.min(1, r.amp / 0.12);
      r.waves.forEach((w, i) => {
        const ph = (t * 0.55 + (i / N) * sf) % 1;
        w.scale.setScalar(0.4 + ph * 1.9); w.position.z = 1.0 + ph * 1.7;
        w.material.opacity = loud * (1 - ph) * 0.8;
      });
      r.bP.userData.set(r.f / 7, 0x6a9bff); r.bL.userData.set(loud, 0xff9a3a);
      const txt = !ok ? 'No sound: a part is missing' : d.f === 0 ? 'Off: the cone is not moving' : (hi ? 'Fast' : 'Slow') + ', ' + (d.amp > 0.08 ? 'far' : 'short') + ' wiggle = a ' + (hi ? 'high' : 'deep') + ', ' + (d.amp > 0.08 ? 'loud' : 'soft') + ' sound';
      r.sign.userData.set(txt, !ok ? 'rgba(170,120,0,0.92)' : d.f === 0 ? 'rgba(60,60,70,0.92)' : 'rgba(30,110,190,0.92)');
    },
  });

  // =====================================================================  transformer
  const XF = [
    { name: 'Same turns', n: 8, br: 0.6, say: 'The output coil has the same number of turns as the input coil. The bulb gets a medium push, so it glows medium.' },
    { name: 'Many turns', n: 16, br: 1, say: 'Many turns on the output coil! More turns give a bigger push of electricity, so the bulb gets brighter.' },
    { name: 'Few turns', n: 4, br: 0.28, say: 'Few turns on the output coil. A smaller push of electricity, so the bulb is dim.' },
  ];
  world({
    id: 'transformer-inside', name: 'Inside a transformer', zoom: '10×', short: 'transformer',
    view: view(1.3, 2.9, 3.8),
    dial: { label: 'Output coil', steps: XF },
    intro: 'This is a transformer, 10 times bigger. Electricity in the left coil makes magnetism, the purple dots, flow around the iron. That makes electricity in the right coil and lights the bulb, without the coils ever touching! Tap the Output coil button to change how many turns the right coil has, and watch the bulb.',
    learn: [
      'The right coil catches the magnetism and turns it back into electricity. The more turns of wire it has, the bigger the push of electricity it makes. A bigger push lights the bulb brighter.',
      'Fewer turns than the input coil gives a smaller push. A phone charger works this way: it turns the strong wall electricity down to a gentle one.',
      'It only works because the electricity in the input coil keeps flipping direction. A flipping magnet makes electricity in the other coil. A steady magnet would not.',
    ],
    shellSay: 'This is a transformer: two coils on an iron ring.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const iron = k.mat(0x6a6f78, { metalness: 0.6, roughness: 0.45 });
      add({ id: 'core', name: 'Iron core', obj: k.group(k.at(k.rbox(0.45, 2.4, 0.7, iron, 0.03), -1.1, 1.3, 0), k.at(k.rbox(0.45, 2.4, 0.7, iron, 0.03), 1.1, 1.3, 0), k.at(k.rbox(2.65, 0.45, 0.7, iron, 0.03), 0, 2.28, 0), k.at(k.rbox(2.65, 0.45, 0.7, iron, 0.03), 0, 0.32, 0)),
        blockedBy: ['primary', 'secondary'], pull: [0, 0, -2.6], tagAt: [0, 2.7, 0],
        breaks: 'With no iron, the magnetism spreads out everywhere and barely reaches the other coil. The bulb goes out.', breaksAlways: true,
        say: 'The iron core carries the magnetism from one coil to the other, like a pipe carries water.',
        learn: ['Iron is great at guiding magnetism, the way a pipe guides water.', 'It is made of thin sheets stacked together. Solid iron would waste energy as heat from little swirling currents inside it.', 'Without the core, most of the magnetism spreads out into the air and never reaches the second coil.'] });
      const coil = (x, turns, r, tube, color) => { const g = k.group(); for (let i = 0; i < turns; i++) g.add(k.rot(k.at(k.torus(r, tube, k.metal(color, { roughness: 0.3 }), 24), x, 0.75 + (1.15 * i) / (turns - 1), 0), Math.PI / 2, 0, 0)); return g; };
      add({ id: 'primary', name: 'Input coil', obj: coil(-1.1, 8, 0.42, 0.05, 0xc8743a), pull: [-2.2, 0, 0.8], tagAt: [-1.9, 1.3, 0.5],
        say: 'Electricity goes round and round this input coil, which turns it into a magnet. It has 8 turns.',
        learn: ['The electricity keeps flipping direction, so the magnet keeps flipping too.', 'A flipping magnet is the secret. A steady one would not make any electricity in the other coil.', 'Wall electricity in America flips 120 times every second. That is 60 full back and forth cycles.'] });
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0); bulbMat.transparent = true; bulbMat.opacity = 0.85;
      const sec = k.group(), rings = [];
      for (let i = 0; i < 16; i++) { const m = k.rot(k.at(k.torus(0.4, 0.03, k.metal(0xd98a4a, { roughness: 0.3 }), 24), 1.1, 0.75, 0), Math.PI / 2, 0, 0); rings.push(m); sec.add(m); }
      sec.add(k.tube([[1.4, 0.75, 0], [2.0, 0.8, 0], [2.1, 2.2, 0], [1.4, 1.9, 0]], 0.02, k.mat(0xc0392b)), k.at(k.sphere(0.22, bulbMat, 20), 2.1, 2.4, 0));
      add({ id: 'secondary', name: 'Output coil', obj: sec, pull: [2.2, 0, 0.8], tagAt: [1.7, 0.2, 0.7],
        say: 'The flipping magnetism makes electricity flow in this output coil, even though the two coils never touch!',
        learn: ['More turns of wire here means a higher voltage, a bigger push. Fewer turns means a smaller push.', 'A phone charger turns the strong wall electricity down to a gentle one this way.', 'The tube TV flyback has thousands of turns on its output coil, to make thousands of volts.', 'Tap the Output coil button to change the turns and watch the bulb.'] });
      const flux = k.flow([[-1.1, 0.32, 0.45], [-1.1, 2.28, 0.45], [1.1, 2.28, 0.45], [1.1, 0.32, 0.45]], { closed: true, count: 18, color: 0xb57bff, size: 0.18 });
      const e1 = k.flow(Array.from({ length: 20 }, (_, i) => [-1.1 + Math.cos(i * 2.5) * 0.47, 0.75 + i * 0.06, Math.sin(i * 2.5) * 0.47]), { count: 10, color: BLUE, size: 0.12 });
      const e2 = k.flow(Array.from({ length: 30 }, (_, i) => [1.1 + Math.cos(i * 3) * 0.44, 0.75 + i * 0.04, Math.sin(i * 3) * 0.44]), { count: 12, color: BLUE, size: 0.11 });
      const glowT = halo(k, 2.1, 2.4, 0);
      const bar = gauge(k, 'Output push', 1.4); bar.position.set(-2.95, 0.2, 0.4);
      const sign = live(k, 0.2, 800); sign.position.set(0, 3.2, 0.5);
      root.add(flux, e1, e2, glowT, bar, sign);
      return { root, parts, refs: { flux, e1, e2, glowT, rings, bar, sign, n: 0, br: 0 } };
    },
    evaluate(has, on) {
      const mag = on && has('primary'), strong = mag && has('core');
      return { alive: on, mag, strong, out: strong && has('secondary') };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, d = inst.def.dial.steps[inst.dial || 0];
      if (r.n !== d.n) { r.n = d.n; r.rings.forEach((m, i) => { m.visible = i < d.n; m.position.y = 0.75 + (1.15 * i) / (d.n - 1); }); }
      show([r.e1], o.mag); show([r.flux], o.strong); show([r.e2, r.glowT], o.out);
      const sec = inst.byId.secondary;
      r.br += ((o.out ? d.br : 0) - r.br) * Math.min(1, dt * 4);
      if (sec) sec.meshes[sec.meshes.length - 1].material.emissiveIntensity = 2.6 * r.br;
      r.glowT.scale.setScalar(0.5 + 1.5 * r.br);
      r.bar.userData.set(r.br, r.br > 0.7 ? 0x3ee08f : 0xffc23a);
      const s = !o.alive ? ['Off', 'rgba(60,60,70,0.92)'] : !o.mag ? ['No input coil: no magnetism', 'rgba(200,40,30,0.92)'] : !o.strong ? ['No iron core: the magnetism spreads out and is lost', 'rgba(200,40,30,0.92)'] : !o.out ? ['No output coil: nothing to catch the magnetism', 'rgba(200,40,30,0.92)'] : ['Output coil has ' + d.n + ' turns, input has 8: ' + (d.n > 8 ? 'a big push, a bright bulb' : d.n < 8 ? 'a small push, a dim bulb' : 'a medium push, a medium bulb'), 'rgba(30,110,190,0.92)'];
      r.sign.userData.set(s[0], s[1]);
      if (!o.alive) return;
      const dir = Math.sin(t * 2.2) > 0 ? 1 : -1; // the electricity flips back and forth
      upd([r.e1, r.flux], dt, 0.25 * dir); upd([r.e2], dt, (0.1 + 0.2 * d.br) * dir);
    },
  });

  // =====================================================================  picture tube
  const BEAM = [
    { name: 'Auto sweep', say: 'Auto sweep. The beam sweeps the whole screen by itself, line by line, like a real TV.' },
    { name: 'Top left', u: 0.15, v: 0.15, say: 'You steer the beam to the top left corner. It draws a line as it goes!' },
    { name: 'Top', u: 0.5, v: 0.15, say: 'Now the top middle.' },
    { name: 'Top right', u: 0.85, v: 0.15, say: 'Top right corner.' },
    { name: 'Right', u: 0.85, v: 0.5, say: 'Down the right side.' },
    { name: 'Bottom right', u: 0.85, v: 0.85, say: 'Bottom right corner.' },
    { name: 'Bottom', u: 0.5, v: 0.85, say: 'Bottom middle.' },
    { name: 'Bottom left', u: 0.15, v: 0.85, say: 'Bottom left corner.' },
    { name: 'Left', u: 0.15, v: 0.5, say: 'Up the left side. You drew a square!' },
    { name: 'Middle', u: 0.5, v: 0.5, say: 'The middle of the screen.' },
  ];
  world({
    id: 'crt-inside', name: 'Inside the picture tube', zoom: '1×', short: 'tube',
    view: view(1.4, 2.8, 3.6, -0.95, 0.3),
    dial: { label: 'Beam', steps: BEAM },
    intro: 'This is the picture tube cut open. The electron guns on the left shoot three beams. Magnets bend them to sweep across the screen, and the screen glows where they hit! Tap the Beam button to steer the beam yourself and draw on the screen. Tap through the steps to draw a square. Go back to Auto sweep to see how the TV does it.',
    learn: [
      'The electron guns on the left shoot three beams, one for red, one for green and one for blue. The steering coils are magnets that bend the beams up, down, left and right.',
      'A real TV does not stop. The beam sweeps across the screen, line by line, top to bottom, and the screen glows wherever it hits. It draws a whole new picture about 30 times a second, so fast that it looks steady.',
      'Pull the steering coils off and the beam goes straight, so it only lights one spot in the middle. Pull the shadow mask off and the colors smear.',
    ],
    shellSay: 'This is the inside of the picture tube.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const Y = 1.5;
      const fg = new T.CylinderGeometry(0.25, 1.55, 3.0, 4, 1, true); fg.rotateY(Math.PI / 4); fg.rotateZ(-Math.PI / 2);
      const glassMat = k.glass(0xa8c8dc, 0.3, { side: T.DoubleSide, emissive: 0x5a8aa8, emissiveIntensity: 0.5 });
      const funnel = k.at(k.mesh(fg, glassMat), 0.6, Y, 0); funnel.userData.pickThrough = true;
      const edges = new T.LineSegments(new T.EdgesGeometry(fg), new T.LineBasicMaterial({ color: 0xbfe6ff, toneMapped: false })); funnel.add(edges);
      const neck = k.at(k.rot(k.cyl(0.25, 0.25, 1.6, glassMat, 24, true), 0, 0, Math.PI / 2), -1.7, Y, 0); neck.userData.pickThrough = true;
      add({ id: 'glass', name: 'Glass bottle', fixed: true, obj: k.group(funnel, neck), tagAt: [0, Y + 1.6, 0],
        say: 'The whole tube is a big glass bottle with all the air sucked out.',
        learn: ['Electrons cannot travel far through air, so the air has to go.', 'Outside air presses hard on the empty bottle. That is why the glass is thick and heavy.', 'If a tube cracks, the air rushes in with a bang, so old tubes are handled with great care.'] });
      const gun = k.group();
      [0xff4a3d, 0x3ee08f, 0x4aa8ff].forEach((c, i) => gun.add(k.at(k.rot(k.cyl(0.05, 0.05, 0.6, k.metal(c, { roughness: 0.4 }), 12), 0, 0, Math.PI / 2), -2.2, Y + (i - 1) * 0.1, 0)));
      gun.add(k.at(k.sphere(0.07, k.glow(0x5a2a10, 0xff8a3a), 12), -2.55, Y, 0));
      add({ id: 'gun', name: 'Electron guns', obj: gun, pull: [-0.6, 1.4, 0.4], tagAt: [-2.35, Y + 0.5, 0],
        breaks: 'No guns, so no beams. The screen stays dark!', breaksAlways: true,
        say: 'The electron guns shoot three thin beams of electrons, like three tiny water pistols.',
        learn: ['A hot wire boils electrons off, like steam rising from a pot. Metal rings then aim them into thin beams.', 'One beam is for the red dots, one for green, and one for blue.', 'Without the guns there are no beams, so nothing makes the screen glow.'] });
      add({ id: 'yoke', name: 'Steering coils', obj: k.group(k.at(k.rot(k.torus(0.42, 0.1, k.metal(0xc8743a, { roughness: 0.35 }), 32), 0, Math.PI / 2, 0), -0.95, Y, 0)), pull: [0, -1.1, 1.4], tagAt: [-0.95, Y - 0.8, 0.2],
        breaks: 'No steering coils, so the beam goes straight. It only lights one spot in the middle!', breaksAlways: true,
        say: 'These coils are magnets that bend the beams, like a hand steering a flashlight.',
        learn: ['The beams sweep left to right, line by line, top to bottom, like your eyes reading a book.', 'They draw a whole new picture about 30 times a second, so fast that it looks perfectly steady.', 'Magnets can push an electron sideways without touching it. Bend it a little and it lands in a different place.'] });
      const maskTex = k.canvasTex(128, 128, (c, w) => { c.fillStyle = '#5a5f68'; c.fillRect(0, 0, w, w); c.fillStyle = '#111'; for (let x = 4; x < w; x += 8) for (let y = 4; y < w; y += 8) { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } });
      const mask = k.mesh(new T.PlaneGeometry(2.0, 1.6), k.mat(0xffffff, { map: maskTex, metalness: 0.5, roughness: 0.4, side: T.DoubleSide, transparent: true, opacity: 0.4, depthWrite: false }));
      mask.rotation.y = -Math.PI / 2; mask.position.set(1.95, Y, 0);
      add({ id: 'mask', name: 'Shadow mask', obj: k.group(mask), inside: 'phosphor-dots', pull: [0, 2.2, 0], tagAt: [1.95, Y + 1.05, 0],
        breaks: 'Without the mask, the beams can hit the wrong dots, and the colors smear. See the big pink blob?', breaksAlways: true,
        say: 'The shadow mask is a metal sheet with tiny holes, like a very fine strainer.',
        learn: ['Each hole lets each beam hit only its own color of dot.', 'Without the mask, a beam can hit the wrong dots and the colors smear.', 'Tap Look inside to see the dots.'] });
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192;
      const cx = cv.getContext('2d'); cx.fillStyle = '#10303f'; cx.fillRect(0, 0, 256, 192);
      const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
      const scr = k.mesh(new T.PlaneGeometry(2.4, 1.8), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide, toneMapped: false }));
      scr.rotation.y = -Math.PI / 2; scr.position.set(2.15, Y, 0);
      const bz = k.metal(0x7a8088, { roughness: 0.4 });
      const bezel = [k.at(k.box(0.08, 0.1, 2.6, bz), 2.17, Y + 0.95, 0), k.at(k.box(0.08, 0.1, 2.6, bz), 2.17, Y - 0.95, 0), k.at(k.box(0.08, 2.0, 0.1, bz), 2.17, Y, 1.25), k.at(k.box(0.08, 2.0, 0.1, bz), 2.17, Y, -1.25)];
      add({ id: 'screen', name: 'Glowing screen', fixed: true, obj: k.group(scr, ...bezel), tagAt: [2.25, Y - 1.2, 0],
        say: 'The inside of the screen is painted with dots that glow when the beams hit them, like glow-in-the-dark paint.',
        learn: ['The glowing powder is called phosphor. It glows for just a moment after each hit, so the beam has to keep coming back.', 'Different powders glow red, green and blue. Together they make every color.', 'Tap Look inside on the shadow mask to see the dots up close.'] });
      const beams = [0xff2a1a, 0x1aff4a, 0x2a5aff].map((c) => { const b = beamMesh(k, c, 0.03, 0.8); root.add(b); return b; });
      const spot = halo(k, 2.0, Y, 0, 0xfff3d0, 0.6);
      const sign = live(k, 0.2, 800); sign.position.set(0, 3.3, 0.2);
      root.add(spot, sign);
      return { root, parts, refs: { beams, spot, sign, cv, cx, tex, Y, scan: 0, cu: 0.5, cv2: 0.5, pu: null, pv: null, prevStep: -1 } };
    },
    evaluate(has, on) { return { alive: on, beam: on && has('gun'), steer: has('yoke'), mask: has('mask') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, Y = r.Y, o = out || {}, beam = !!o.beam, step = inst.dial || 0, d = inst.def.dial.steps[step], auto = step === 0;
      if (step !== r.prevStep) { if (auto || r.prevStep === 0) { r.cx.fillStyle = '#10303f'; r.cx.fillRect(0, 0, 256, 192); r.pu = null; } r.prevStep = step; }
      const fade = 1 - Math.exp(-dt * (auto ? 2.2 : 0.45));
      r.cx.fillStyle = `rgba(16,48,63,${fade})`; r.cx.fillRect(0, 0, 256, 192);
      let u = 0.5, v = 0.5;
      if (beam && o.steer) {
        if (auto) { r.scan += dt * 7; const line = Math.floor(r.scan) % 24; u = r.scan % 1; v = (line + 0.5) / 24; r.cu = u; r.cv2 = v; }
        else { const dx = d.u - r.cu, dy = d.v - r.cv2, dist = Math.hypot(dx, dy), mv = Math.min(dist, dt * 1.5); if (dist > 1e-4) { r.cu += (dx / dist) * mv; r.cv2 += (dy / dist) * mv; } u = r.cu; v = r.cv2; }
      }
      const tz = (u - 0.5) * 2.2, ty = Y + (0.5 - v) * 1.6;
      r.beams.forEach((b, i) => { b.visible = beam; if (beam) aim(b, new T.Vector3(-2.5, Y + (i - 1) * 0.1, 0), new T.Vector3(2.12, ty, tz)); });
      r.spot.visible = beam; r.spot.position.set(2.0, ty, tz);
      if (beam) {
        const px = (tz / 2.4 + 0.5) * 256, py = (0.5 - (ty - Y) / 1.8) * 192, wide = !o.mask;
        const cx = r.cx, col = wide ? '#ff9adf' : '#eafff0';
        if (r.pu != null && Math.hypot(px - r.pu, py - r.pv) < 40) { cx.strokeStyle = col; cx.lineWidth = wide ? 14 : 5; cx.lineCap = 'round'; cx.shadowColor = col; cx.shadowBlur = 10; cx.beginPath(); cx.moveTo(r.pu, r.pv); cx.lineTo(px, py); cx.stroke(); cx.shadowBlur = 0; }
        const g = cx.createRadialGradient(px, py, 0, px, py, wide ? 22 : 11);
        g.addColorStop(0, wide ? '#ffc6ee' : '#ffffff'); g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g; cx.fillRect(px - 24, py - 24, 48, 48);
        r.pu = px; r.pv = py;
      } else r.pu = null;
      r.tex.needsUpdate = true;
      const s = !o.alive ? ['Off', 'rgba(60,60,70,0.92)'] : !beam ? ['No electron guns: no beams, a dark screen', 'rgba(200,40,30,0.92)'] : !o.steer ? ['No steering coils: the beam only hits the middle', 'rgba(200,40,30,0.92)'] : auto ? ['Auto sweep: the beam draws line by line', 'rgba(30,110,190,0.92)'] : ['You are steering the beam: ' + d.name, 'rgba(30,140,80,0.92)'];
      r.sign.userData.set(s[0], s[1]);
    },
  });

  world({
    id: 'phosphor-dots', name: 'Phosphor dots', zoom: '1,000×', short: 'dots',
    view: view(1.3, 2.7, 3.4, -0.6, 0.2),
    dial: {
      label: 'Beams',
      steps: [
        { name: 'All three', on: [1, 1, 1], say: 'All three beams are on. The red, green and blue dots all glow together, and together they look white.' },
        { name: 'Red', on: [1, 0, 0], say: 'Only the red beam. Only the red dots glow, so it looks red.' },
        { name: 'Green', on: [0, 1, 0], say: 'Only the green beam. Only the green dots glow, so it looks green.' },
        { name: 'Blue', on: [0, 0, 1], say: 'Only the blue beam. Only the blue dots glow, so it looks blue.' },
        { name: 'Red + green', on: [1, 1, 0], say: 'Red and green together make yellow! Your eyes mix the two glowing dots.' },
        { name: 'Red + blue', on: [1, 0, 1], say: 'Red and blue together make pink and purple.' },
        { name: 'Green + blue', on: [0, 1, 1], say: 'Green and blue together make a bright blue-green, called cyan.' },
      ],
    },
    intro: 'A thousand times bigger, the screen is made of tiny red, green and blue dots. The three beams pass through a hole in the mask, and each one only lights its own color! Tap the Beams button to switch beams on and off, and see what color you get on the right.',
    learn: [
      'Each beam goes through a hole in the mask and hits only its own color of dot. The red beam only lights red dots, green only green, and blue only blue.',
      'Your eyes cannot see each tiny dot. They blur the three dots together into one color. Red and green dots glowing together look yellow. All three together look white.',
      'The beams jump from hole to hole, over the whole screen, dozens of times a second. Each dot glows only for a moment, so the beam has to keep coming back.',
    ],
    shellSay: 'The screen up close: rows of red, green and blue dots.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const cols = [0xff3030, 0x30ff60, 0x3060ff], dots = [], groups = [k.group(), k.group(), k.group()];
      const cen = (i, j) => [-1.25 + i * 0.5, 0.55 + j * 0.5];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) for (let c = 0; c < 3; c++) {
        const m = k.cyl(0.09, 0.09, 0.04, k.glow(cols[c] & 0x3f3f3f, cols[c]), 16);
        m.rotation.x = Math.PI / 2;
        const [cx, cy] = cen(i, j);
        m.position.set(cx + (c === 1 ? 0.12 : c === 2 ? -0.12 : 0), cy + (c === 0 ? 0.14 : -0.07), -0.6);
        groups[c].add(m); dots.push({ m, cell: i * 4 + j, c, glow: 0, i, j });
      }
      root.add(k.at(k.box(3.2, 2.2, 0.06, k.mat(0x0b0e12, { roughness: 0.8 })), 0, 1.3, -0.66));
      const names = ['Red dot', 'Green dot', 'Blue dot'], ids = ['red', 'green', 'blue'];
      const says = ['Red dots glow red when the red beam hits them.', 'Green dots glow green when the green beam hits them.', 'Blue dots glow blue when the blue beam hits them.'];
      const learns = [
        ['Every color is made by lighting the three dots by different amounts. Red and green together look yellow!', 'The red dot is covered in a powder that glows red when electrons hit it.', 'The dots are so small that your eyes cannot pick out a single one. They blur together into one color.'],
        ['Green dots are the easiest for our eyes to see, so green does a lot of the work in the picture.', 'The green dot is covered in a powder that glows green when electrons hit it.', 'Each dot glows for only a moment, then fades, so the beam has to keep coming back.'],
        ['Blue is the last of the three. Red, green and blue are the only colors a TV needs.', 'The blue dot is covered in a powder that glows blue when electrons hit it.', 'Mix all three at once and your eyes see white.'],
      ];
      groups.forEach((g, c) => add({ id: ids[c], name: names[c], fixed: true, obj: g, tagAt: [-1.15 + c * 1.15, 2.6, -0.5], say: says[c], learn: learns[c] }));
      // the mask: holes line up with each group of three dots; you grab its metal frame
      const maskTex = k.canvasTex(256, 192, (c, w, h) => {
        c.fillStyle = '#6a6f78'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const [x, y] = cen(i, j); c.beginPath(); c.arc(((x + 1.6) / 3.2) * w, ((2.4 - y) / 2.2) * h, 12, 0, 7); c.fill(); }
      });
      const mask = k.mesh(new T.PlaneGeometry(3.2, 2.2), k.mat(0xffffff, { map: maskTex, transparent: true, alphaTest: 0.5, metalness: 0.5, roughness: 0.4, side: T.DoubleSide }));
      mask.position.set(0, 1.3, 0.3); mask.userData.pickThrough = true;
      const fm = k.metal(0x8a8f98, { roughness: 0.4 });
      const frame = k.group(k.at(k.box(3.3, 0.1, 0.06, fm), 0, 2.4, 0.3), k.at(k.box(3.3, 0.1, 0.06, fm), 0, 0.2, 0.3), k.at(k.box(0.1, 2.3, 0.06, fm), 1.6, 1.3, 0.3), k.at(k.box(0.1, 2.3, 0.06, fm), -1.6, 1.3, 0.3));
      add({ id: 'mask', name: 'Shadow mask', obj: k.group(mask, frame), pull: [0, 2.6, 0.4], tagAt: [-1.75, 0.12, 0.35],
        breaks: 'Without the mask, the beams are not sorted. They hit the wrong dots too, so the colors smear.', breaksAlways: true,
        say: 'The mask holes line up so each beam can only reach its own color of dot, like a strainer that sorts the beams.',
        learn: ['Without the mask, the red beam could hit a green dot, and the colors would get all mixed up.', 'The mask is made of a special metal that barely grows when it warms up, so the holes stay lined up.', 'Each hole sits in front of one red, one green and one blue dot. The three beams cross in the hole and spread out again on the other side.'] });
      const beams = [0xff2a1a, 0x1aff4a, 0x2a5aff].map((c) => { const b = beamMesh(k, c, 0.03, 0.5); root.add(b); return b; });
      const halos = cols.map((c) => { const h = halo(k, 0, 0, -0.5, c, 0.7); root.add(h); return h; });
      const mixMat = new T.SpriteMaterial({ color: 0xffffff, toneMapped: false });
      const mix = new T.Sprite(mixMat); mix.scale.set(0.9, 0.9, 1); mix.position.set(2.5, 1.6, -0.3); mix.userData.noPick = true;
      const mframe = new T.Sprite(new T.SpriteMaterial({ color: 0x555a66, toneMapped: false })); mframe.scale.set(1.03, 1.03, 1); mframe.position.set(2.5, 1.6, -0.32); mframe.userData.noPick = true;
      const mixTag = k.label('What you see', { size: 0.17 }); mixTag.position.set(2.5, 2.25, -0.3);
      const sign = live(k, 0.2, 760); sign.position.set(0, 3.0, 0.3);
      root.add(mframe, mix, mixTag, sign);
      return { root, parts, refs: { dots, beams, halos, mixMat, sign, cen, cols, step: 0 } };
    },
    evaluate(has, on) { return { alive: on, mask: has('mask') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, on = !!o.alive, d = inst.def.dial.steps[inst.dial || 0], V = T.Vector3;
      if (on) r.step += dt * 3.2;
      const cell = Math.floor(r.step) % 24, ci = Math.floor(cell / 4), cj = cell % 4;
      r.dots.forEach((q) => {
        const hit = on && d.on[q.c] && (o.mask ? q.cell === cell : Math.abs(q.cell - cell) <= 1);
        q.glow = hit ? 1 : Math.max(0, q.glow - dt * 1.8);
        q.m.material.emissiveIntensity = 0.15 + q.glow * 2.6;
      });
      const H = r.cen(ci, cj), H3 = new V(H[0], H[1], 0.3);
      r.beams.forEach((b, c) => {
        const q = r.dots.find((x) => x.cell === cell && x.c === c), D = new V(q.m.position.x, q.m.position.y, -0.58);
        const S = D.clone().add(H3.clone().sub(D).multiplyScalar(4.3));
        const show1 = on && !!d.on[c];
        b.visible = show1; r.halos[c].visible = show1;
        if (show1) { aim(b, S, D); b.scale.x = o.mask ? 1 : 2.6; b.scale.z = o.mask ? 1 : 2.6; r.halos[c].position.set(D.x, D.y, -0.5); r.halos[c].scale.setScalar(o.mask ? 0.7 : 1.3); }
      });
      const mixC = new T.Color(d.on[0], d.on[1], d.on[2]);
      if (!o.mask) mixC.lerp(new T.Color(1, 1, 1), 0.45);
      r.mixMat.color.copy(on ? mixC : new T.Color(0.08, 0.08, 0.1));
      r.sign.userData.set(!on ? 'Off' : !o.mask ? 'No mask: the beams hit wrong dots too, so the colors smear' : 'Beams on: ' + d.name + '. Each beam lights only its own dots.', !on ? 'rgba(60,60,70,0.92)' : !o.mask ? 'rgba(170,120,0,0.92)' : 'rgba(30,110,190,0.92)');
    },
  });


  // shared with js/worlds-more.js
  TAL.wk = { world, view, part, upd, show, glowOn, halo, lattice, cutTube, BLUE, PINK, WHITE, GOLD };

  // =====================================================================  which parts open into which world
  Object.assign(TAL.insideByName, {
    'LED light': 'led-package', 'LED bulb': 'led-package', 'LED chip': 'led-die',
    'Processor chip': 'chip-package', 'Memory chip': 'chip-package', 'Storage chip': 'chip-package', 'Timing chip': 'chip-package', 'Color chip': 'chip-package',
    'Sound chip': 'chip-package', 'LED driver chip': 'chip-package', 'Power control chip': 'chip-package', 'Power chip': 'chip-package', 'Settings memory': 'chip-package', 'Driver chip': 'chip-package',
    'Big capacitor': 'cap-inside', 'Small capacitor': 'cap-inside', 'Safety capacitor': 'cap-inside',
    'Battery': 'battery-inside',
    'LCD panel': 'lcd-pixel', 'Pixel switches': 'lcd-pixel', 'Color filter': 'lcd-pixel', 'Front polarizer': 'lcd-pixel', 'Back polarizer': 'lcd-pixel', 'Liquid crystal': 'liquid-crystal',
    'Left speaker': 'speaker-inside', 'Right speaker': 'speaker-inside', 'Speaker': 'speaker-inside', 'Speaker cone': 'speaker-inside',
    'Transformer': 'transformer-inside', 'Flyback transformer': 'transformer-inside',
    'Picture tube': 'crt-inside', 'Electron gun': 'crt-inside',
  });
})();

