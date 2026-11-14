/* Take-Apart Lab: the worlds inside parts.
 * Tap the magnifying glass on a part to shrink down inside it. Each world is built like a device
 * (parts you can pull off, Power to switch the electricity on) and can hold magnifying glasses of its own:
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

  // =====================================================================  LED chain
  world({
    id: 'led-package', name: 'Inside an LED', zoom: '20×', short: 'LED',
    view: view(0.9, 2.7, 3.6),
    intro: 'We shrank down! This is one LED light, 20 times bigger. Pull the parts off, and tap the magnifying glass on the chip to go even smaller.',
    shellSay: 'This is the inside of one tiny LED light.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'housing', name: 'Plastic box', fixed: true, obj: k.group(k.at(k.rbox(2.8, 0.35, 2.8, k.mat(0xf2f2ee, { roughness: 0.35 }), 0.06), 0, 0.175, 0)), tagAt: [-1.2, 0.5, 1.3],
        say: 'The white plastic box holds all the tiny parts together.',
        learn: ['It is made of tough plastic that does not melt from the heat of the light.', 'Its white color helps bounce light up and out, so less light is wasted.'] });
      add({ id: 'cup', name: 'Shiny cup', fixed: true, obj: k.group(k.at(k.cyl(1.15, 0.55, 0.5, k.mat(0xe6ebf1, { metalness: 0.9, roughness: 0.12, side: T.DoubleSide }), 48, true), 0, 0.6, 0)), tagAt: [1.25, 0.95, 0.6],
        say: 'This shiny cup is a mirror. It bounces light up and out.',
        learn: ['Light from the chip shoots out in every direction. The cup catches the light going sideways and sends it forward.', 'It is coated with silver, because silver reflects almost all of the light that hits it.'] });
      const metal = k.metal(0xd6dbe2, { roughness: 0.25 });
      add({ id: 'leadMinus', name: 'Minus leg', obj: k.group(k.at(k.box(1.5, 0.08, 0.9, metal), -1.25, 0.08, 0), k.at(k.box(0.7, 0.06, 0.7, metal), -0.2, 0.38, 0)), pull: [-1.8, 0, 0.4], tagAt: [-1.9, 0.4, 0],
        say: 'Tiny electrons come into the LED through this minus leg.',
        learn: ['An LED only works one way around. Put it in backwards and nothing happens.', 'The legs are copper with a thin silver coat, so electricity flows easily and they shine.'] });
      add({ id: 'leadPlus', name: 'Plus leg', obj: k.group(k.at(k.box(1.5, 0.08, 0.9, metal), 1.25, 0.08, 0), k.at(k.box(0.4, 0.06, 0.5, metal), 0.45, 0.38, 0)), pull: [1.8, 0, 0.4], tagAt: [1.9, 0.4, 0],
        say: 'The electrons leave through the plus leg and head back to the battery or power board.',
        learn: ['Electricity needs a full loop. In through one leg, through the chip, and out the other.'] });
      const dieMat = k.glow(0x2a3966, 0x4a6bff);
      const die = k.at(k.box(0.36, 0.14, 0.36, dieMat), -0.2, 0.48, 0);
      add({ id: 'die', name: 'LED chip', obj: k.group(die), inside: 'led-die', blockedBy: ['phosphor'], pull: [0, 1.7, 0.7], tagAt: [-0.6, 0.85, 0.5],
        say: 'This tiny square is the LED chip. It is where the light is made!',
        learn: ['When electricity flows through the chip, it glows. It is made of special crystal layers.', 'The real chip is smaller than a grain of sand, about a quarter of a millimeter across.',
          'It is made of a crystal called gallium nitride that gives off blue light when electricity flows through it. Tap the magnifying glass to go inside it!'] });
      add({ id: 'wire', name: 'Gold wire', obj: k.group(k.tube([[-0.2, 0.55, 0], [0.05, 1.0, 0], [0.3, 0.75, 0], [0.45, 0.42, 0]], 0.02, k.metal(GOLD, { roughness: 0.2 }))), blockedBy: ['phosphor'], pull: [0.7, 1.3, 0.5], tagAt: [0.35, 1.2, 0],
        say: 'This gold wire is thinner than a hair. It carries electricity to the top of the chip.',
        learn: ['Gold is used because it never rusts and bends without breaking.', 'A machine attaches it with heat and a buzz of sound vibration, thousands of times an hour.'] });
      const phMat = k.glow(0xf2d33a, 0xfff0a8); phMat.transparent = true; phMat.opacity = 0.72;
      const ph = k.at(k.cyl(1.05, 0.55, 0.32, phMat, 48), 0, 0.64, 0);
      add({ id: 'phosphor', name: 'Yellow coating', obj: k.group(ph), blockedBy: ['lens'], pull: [0, 1.5, -0.6], tagAt: [-1.0, 1.0, -0.4],
        say: 'The yellow coating turns blue light into white light.',
        learn: ['Some blue light passes through. The rest is soaked up by the coating and glows yellow. Blue and yellow light together look white to our eyes.',
          'The coating is a powder called phosphor, mixed into clear rubbery silicone.', 'This trick is how almost every white LED works, in TVs, flashlights and lamps.'] });
      const dome = k.mesh(new T.SphereGeometry(1.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), k.glass(0xeaf6ff, 0.22, { side: T.DoubleSide }));
      dome.position.y = 0.8;
      add({ id: 'lens', name: 'Clear cap', obj: k.group(dome), pull: [0, 2.2, 0], tagAt: [0, 2.15, 0],
        say: 'The clear cap protects the chip and spreads the light.',
        learn: ['It is made of clear silicone, shaped like a dome.', 'The dome bends the light as it leaves, like a magnifying glass, to spread it out wide.'] });
      const flow = k.flow([[-2.1, 0.15, 0], [-0.9, 0.2, 0], [-0.4, 0.42, 0], [-0.2, 0.52, 0], [0.05, 1.0, 0], [0.3, 0.75, 0], [0.5, 0.42, 0], [1.2, 0.18, 0], [2.1, 0.15, 0]], { count: 22, color: BLUE, size: 0.13 });
      const rays = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2, s = 0.55 + (i % 3) * 0.25;
        rays.push(k.flow([[-0.2, 0.55, 0], [-0.2 + Math.cos(a) * s * 2.2, 2.6, Math.sin(a) * s * 2.2]], { count: 3, color: WHITE, size: 0.2, phase: i / 12 }));
      }
      root.add(flow, ...rays);
      return { root, parts, refs: { flow, rays, dieMat: die.material, phMat: ph.material } };
    },
    evaluate(has, on) {
      const loop = has('leadMinus') && has('leadPlus') && has('die') && has('wire');
      return { alive: on && loop, white: has('phosphor'), reason: on && !loop ? "The electricity can't make a loop. Put the missing part back!" : '' };
    },
    apply(out, inst) {
      const r = inst.refs;
      r.dieMat = inst.byId.die.meshes[0].material; r.phMat = inst.byId.phosphor.meshes[0].material;
      r.dieMat.emissiveIntensity = out.alive ? 2.6 : 0;
      r.phMat.emissiveIntensity = out.alive && out.white ? 0.9 : 0;
      show([r.flow], out.alive); show(r.rays, out.alive);
      r.rays.forEach((f) => f.material.color.setHex(out.white ? 0xfff6e0 : 0x5a7bff));
    },
    tick(dt, t, inst, out) { if (out && out.alive) { upd([inst.refs.flow], dt, 0.25); upd(inst.refs.rays, dt, 0.9); } },
  });

  world({
    id: 'led-die', name: 'Inside the LED chip', zoom: '1,000×', short: 'chip',
    view: view(0.75, 2.5, 3.4),
    intro: 'Now we are inside the LED chip, a thousand times bigger! It is a stack of crystal layers. Light is made in the thin glowing layer in the middle.',
    shellSay: 'This is the inside of the LED chip, a stack of crystal layers.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'sapphire', name: 'Sapphire base', fixed: true, obj: k.group(k.at(k.box(3, 0.45, 2, k.glass(0x9fd3ff, 0.55, { depthWrite: true })), 0, 0.225, 0)), tagAt: [-1.2, 0.25, 1.15],
        say: 'The chip grows on a clear crystal called sapphire, the same stuff some jewels are made of.',
        learn: ['Sapphire is very hard and clear, so the light can escape through it.', 'Factories grow the chip on top of it, one super thin layer of atoms at a time.'] });
      add({ id: 'n', name: 'N layer', obj: k.group(k.at(k.box(3, 0.32, 2, k.mat(0x4a6a9a, { roughness: 0.35, metalness: 0.2 })), 0, 0.61, 0)), blockedBy: ['active', 'nPad'], pull: [0, 0, 2.6], tagAt: [1.25, 0.62, 1.1],
        say: 'This layer has extra electrons, tiny bits of electricity, waiting to move.',
        learn: ['It is gallium nitride with a pinch of silicon atoms mixed in. Each silicon atom brings a spare electron.', 'Adding a pinch of other atoms on purpose is called doping. It lets engineers control how electricity flows.'] });
      const actMat = k.glow(0x2a3a8a, 0x4a6bff);
      add({ id: 'active', name: 'Light layer', obj: k.group(k.at(k.box(2.2, 0.08, 2, actMat), -0.4, 0.81, 0)), inside: 'led-atoms', blockedBy: ['p'], pull: [0, 0.9, 2.8], tagAt: [-1.75, 0.82, 1.1],
        say: 'This super thin middle layer is where the light is made!',
        learn: ['Electrons from below meet empty spots, called holes, from above. Every time they meet, a tiny flash of light pops out.',
          'The layer is far thinner than a hair. A little indium is mixed in to make the light blue.',
          'The color depends on how much energy each electron gives up when it drops into a hole. More energy makes bluer light. Tap the magnifying glass to see the atoms!'] });
      add({ id: 'p', name: 'P layer', obj: k.group(k.at(k.box(2.2, 0.24, 2, k.mat(0x8a5a9a, { roughness: 0.35, metalness: 0.2 })), -0.4, 0.97, 0)), blockedBy: ['pPad'], pull: [0, 1.7, 2.3], tagAt: [-1.75, 1.15, 0.9],
        say: 'This layer has empty spots, called holes, where electrons are missing.',
        learn: ['A pinch of magnesium atoms is mixed in. Each one leaves a spot where an electron could fit.', 'Holes act like bubbles in water. When an electron jumps into one, the hole seems to move the other way.'] });
      add({ id: 'pPad', name: 'Plus pad', obj: k.group(k.at(k.box(1.0, 0.06, 0.7, k.metal(GOLD, { roughness: 0.2 })), -0.4, 1.12, 0)), pull: [-0.6, 2.2, 0.4], tagAt: [-0.4, 1.45, 0],
        say: 'The gold plus pad is where the gold wire connects.',
        learn: ['It spreads the electricity across the top so the whole chip glows evenly.'] });
      add({ id: 'nPad', name: 'Minus pad', obj: k.group(k.at(k.box(0.5, 0.06, 0.7, k.metal(GOLD, { roughness: 0.2 })), 1.15, 0.8, 0)), pull: [1.3, 1.7, 0.4], tagAt: [1.15, 1.1, 0],
        say: 'The minus pad lets electrons into the bottom layer.',
        learn: ['The factory etches away a corner of the top layers so this pad can reach the bottom layer.'] });
      const electrons = [-0.6, 0, 0.6].map((z, i) => k.flow([[1.15, 0.78, z], [0.6, 0.62, z], [-0.1, 0.66, z], [-0.4 - i * 0.3, 0.8, z]], { count: 6, color: BLUE, size: 0.12, phase: i * 0.3 }));
      const holes = [-1.2, -0.6, 0, 0.4].map((x, i) => k.flow([[-0.4, 1.12, (i - 1.5) * 0.4], [x, 0.97, (i - 1.5) * 0.4], [x, 0.82, (i - 1.5) * 0.4]], { count: 4, color: PINK, size: 0.12, phase: i * 0.25 }));
      const light = [];
      for (let i = 0; i < 10; i++) { const x = -1.4 + i * 0.22, z = ((i * 7) % 5 - 2) * 0.35; light.push(k.flow([[x, 0.81, z], [x * 1.4, 2.6, z * 1.6]], { count: 3, color: 0x6a86ff, size: 0.2, phase: i / 10 })); }
      root.add(...electrons, ...holes, ...light);
      return { root, parts, refs: { electrons, holes, light } };
    },
    evaluate(has, on) {
      const ok = ['n', 'active', 'p', 'pPad', 'nPad'].every(has);
      return { alive: on && ok, reason: on && !ok ? 'A layer is missing, so no light can be made. Put it back!' : '' };
    },
    apply(out, inst) {
      const r = inst.refs, m = inst.byId.active.meshes[0].material;
      m.emissiveIntensity = out.alive ? 2.2 : 0;
      show(r.electrons, out.alive); show(r.holes, out.alive); show(r.light, out.alive);
    },
    tick(dt, t, inst, out) { if (out && out.alive) { const r = inst.refs; upd(r.electrons, dt, 0.35); upd(r.holes, dt, 0.35); upd(r.light, dt, 0.8); } },
  });

  world({
    id: 'led-atoms', name: 'Atoms making light', zoom: '1,000,000×', short: 'crystal',
    view: view(1.2, 2.7, 2.7),
    intro: 'We are a million times bigger now, down at the atoms! Watch the blue electron drop into the empty hole. Each time it does, a flash of light pops out.',
    shellSay: 'These balls are atoms, the tiny building blocks of everything. Here they are gallium and nitrogen, holding hands in a crystal.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const ga = k.metal(0x9aa4b2, { roughness: 0.3 }), nn = k.mat(0x4a7bff, { roughness: 0.35 }), bond = k.mat(0x5a6378, { roughness: 0.5 });
      const shell = lattice(k, 7, 3, 3, 0.8, 0.3, (i, j, l) => ((i + j + l) % 2 ? { r: 0.16, mat: nn } : { r: 0.26, mat: ga }), bond);
      root.add(shell);
      const pos = shell.userData.pos;
      const gp = pos(1, 2, 2), np = pos(2, 2, 2);
      add({ id: 'gallium', name: 'Gallium atom', fixed: true, obj: k.group(k.at(k.sphere(0.3, k.metal(0xc5ccd6, { roughness: 0.2 }), 24), gp[0], gp[1], gp[2])), tagAt: [gp[0], gp[1] + 0.5, gp[2]],
        say: 'This big ball is a gallium atom.',
        learn: ['Gallium is a soft silvery metal. It can melt in your hand on a warm day!', 'In the LED crystal, gallium atoms hold hands with nitrogen atoms in a neat repeating pattern.',
          'An atom is about a ten billionth of a meter across. Millions of them in a row would just cross a grain of sand.'] });
      add({ id: 'nitrogen', name: 'Nitrogen atom', fixed: true, obj: k.group(k.at(k.sphere(0.2, k.mat(0x6a9bff, { roughness: 0.25 }), 24), np[0], np[1], np[2])), tagAt: [np[0] + 0.3, np[1] + 0.45, np[2]],
        say: 'This small ball is a nitrogen atom. Nitrogen is also most of the air you breathe!',
        learn: ['Here, nitrogen is locked into the crystal with gallium. Together they make gallium nitride.', 'Gallium nitride is very tough, and it can give off blue light, which was very hard to make before it.'] });
      const hp = [0.4, 1.5, 0.4];
      const holeRing = k.torus(0.17, 0.035, k.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }), 24);
      add({ id: 'hole', name: 'Hole', fixed: true, obj: k.group(k.at(holeRing, hp[0], hp[1], hp[2])), tagAt: [hp[0], hp[1] + 0.45, hp[2] + 0.2],
        say: 'This ring is a hole, an empty spot where an electron is missing.',
        learn: ['When an electron drops into a hole, they cancel out, and a flash of light pops out.', 'This is called recombination. Billions of them happen every second inside a glowing LED.'] });
      const eMat = k.glow(0x2a48ff, 0x4f8dff), eBall = k.sphere(0.12, eMat, 18);
      const eInner = k.group(eBall);
      add({ id: 'electron', name: 'Electron', fixed: true, obj: k.group(eInner), tagAt: [2.4, 2.1, 0.6], tag: 'Electron',
        say: 'This glowing dot is an electron, a tiny bit of electricity.',
        learn: ['Electrons are much, much smaller than atoms. Electricity is just lots of electrons moving.', 'This electron has extra energy. When it falls into a hole, it has to let that energy go.', 'The energy comes out as a tiny packet of light called a photon.'] });
      const phMat = k.glow(0x9fc0ff, 0x9fc0ff), phBall = k.sphere(0.1, phMat, 16), phInner = k.group(phBall);
      const wavePts = new Float32Array(60 * 3), waveGeo = new T.BufferGeometry();
      waveGeo.setAttribute('position', new T.BufferAttribute(wavePts, 3));
      const wave = new T.Line(waveGeo, new T.LineBasicMaterial({ color: 0x8fb4ff, toneMapped: false }));
      wave.frustumCulled = false;
      add({ id: 'photon', name: 'Photon', fixed: true, obj: k.group(phInner, wave), tagAt: [hp[0] - 0.9, 3.0, hp[2]], tag: 'Light',
        say: 'This is a photon, one tiny packet of light!',
        learn: ['Light travels in tiny packets. Each one wiggles like a wave as it zooms along.', 'Light is the fastest thing there is. It could zip around the Earth more than 7 times in one second.', 'Blue light wiggles faster than red light. Our eyes see that wiggle speed as color.'] });
      const flash = new T.Sprite(new T.SpriteMaterial({ map: k.dotTex(), color: 0x9fc0ff, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
      flash.position.fromArray(hp); flash.scale.setScalar(0.01); flash.userData.noPick = true;
      root.add(flash);
      const path = new T.CatmullRomCurve3([new T.Vector3(2.6, 0.7, 0.9), new T.Vector3(1.7, 1.1, 0.7), new T.Vector3(1.0, 1.0, 0.5), new T.Vector3(hp[0], hp[1], hp[2])]);
      return { root, shell: [shell], parts, refs: { eInner, phInner, wave, wavePts, waveGeo, flash, path, hp, clock: 0 } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, cyc = 3.2;
      if (out && out.alive) r.clock += dt;
      const c = r.clock % cyc, v = new T.Vector3();
      if (c < 1.6) { r.path.getPointAt(c / 1.6, v); r.eInner.position.copy(v); r.eInner.visible = true; }
      else r.eInner.visible = false;
      const f = c >= 1.6 && c < 2.0 ? 1 - Math.abs(c - 1.8) / 0.2 : 0;
      r.flash.scale.setScalar(0.01 + f * 1.4);
      const pt = c >= 1.6 ? Math.min(1, (c - 1.6) / 1.5) : -1;
      r.phInner.visible = r.wave.visible = pt >= 0;
      if (pt >= 0) {
        const y0 = r.hp[1], y1 = y0 + 2.6 * pt;
        r.phInner.position.set(r.hp[0], y1, r.hp[2]);
        for (let i = 0; i < 60; i++) { const y = y0 + ((y1 - y0) * i) / 59; r.wavePts[i * 3] = r.hp[0] + Math.sin(y * 18) * 0.12; r.wavePts[i * 3 + 1] = y; r.wavePts[i * 3 + 2] = r.hp[2]; }
        r.waveGeo.attributes.position.needsUpdate = true;
      }
    },
  });

  // =====================================================================  chip chain
  world({
    id: 'chip-package', name: 'Inside a chip', zoom: '10×', short: 'chip',
    view: view(0.6, 2.6, 3.5),
    intro: 'This is a computer chip, 10 times bigger. The real chip is the shiny square hiding under the metal lid. Take the lid off!',
    shellSay: 'This is a computer chip, cut open.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const balls = k.group(), sm = k.metal(0xc9ced6, { roughness: 0.3 });
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) balls.add(k.at(k.sphere(0.07, sm, 10), -1.2 + i * 0.343, 0.07, -1.2 + j * 0.343));
      add({ id: 'balls', name: 'Solder balls', obj: balls, pull: [0, 0, 3.0], tagAt: [1.4, 0.1, 1.5],
        say: 'These little silver balls connect the chip to the board.',
        learn: ['They are made of solder, a metal that melts at a low temperature. The factory melts them to stick the chip down.', 'A big processor can have more than a thousand of these tiny balls, each one a separate wire.'] });
      const sub = k.rbox(3, 0.22, 3, k.mat(0x2f6b3a, { roughness: 0.5 }), 0.04);
      const subTop = new T.Mesh(new T.PlaneGeometry(2.9, 2.9), k.mat(0xffffff, { map: k.pcbTexture(3, 3, 9, '#2f6b3a'), roughness: 0.5 }));
      subTop.rotation.x = -Math.PI / 2; subTop.position.y = 0.362;
      add({ id: 'substrate', name: 'Base board', fixed: true, obj: k.group(k.at(sub, 0, 0.25, 0), subTop), tagAt: [-1.3, 0.55, 1.4],
        say: 'This green base spreads out the tiny wires from the chip to the balls.',
        learn: ['The chip has its connections packed super close. The base fans them out wider so they can reach the board.', 'Inside are many thin layers of copper wiring, stacked like a sandwich.'] });
      const dieTex = k.canvasTex(256, 256, (c, w) => {
        const g = c.createLinearGradient(0, 0, w, w); g.addColorStop(0, '#3a2f7a'); g.addColorStop(0.5, '#1f6f8a'); g.addColorStop(1, '#6a2f6a');
        c.fillStyle = g; c.fillRect(0, 0, w, w);
        c.strokeStyle = 'rgba(255,220,160,0.35)'; for (let i = 0; i < w; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
      });
      const die = k.box(1.5, 0.1, 1.5, k.mat(0xffffff, { map: dieTex, metalness: 0.6, roughness: 0.22, emissive: 0x5a7bff, emissiveIntensity: 0 }));
      die.material.userData.selfLit = true;
      add({ id: 'die', name: 'Silicon chip', obj: k.group(k.at(die, 0, 0.41, 0)), inside: 'chip-die', blockedBy: ['paste'], pull: [0, 1.6, 1.3], tagAt: [0.9, 0.75, 0.8],
        say: 'This shiny square is the real chip, made of silicon.',
        learn: ['Silicon comes from sand! It is purified and grown into a giant crystal, then sliced into thin wafers.', 'Each wafer holds hundreds of chips. They are cut apart like cookies on a tray.', 'Tap the magnifying glass to zoom inside the silicon.'] });
      add({ id: 'paste', name: 'Heat paste', obj: k.group(k.at(k.box(1.5, 0.04, 1.5, k.mat(0x9a9ea6, { roughness: 0.9 })), 0, 0.48, 0)), blockedBy: ['lid'], pull: [0, 1.2, -1.4], tagAt: [-0.9, 0.7, -0.6],
        say: 'The gray paste helps heat move from the chip to the lid.',
        learn: ['Tiny air gaps would trap the heat. The paste fills them, so heat flows out easily.'] });
      add({ id: 'lid', name: 'Metal lid', obj: k.group(k.at(k.rbox(2.6, 0.14, 2.6, k.metal(0xc9ced6, { roughness: 0.22 }), 0.05), 0, 0.57, 0)), pull: [0, 2.2, 0], tagAt: [0, 0.95, 0],
        say: 'The metal lid protects the chip and spreads out its heat.',
        learn: ['Metal is great at moving heat. The lid passes the heat on to the heat sink above it.', 'Without the lid, the chip could crack or get too hot.'] });
      const sig = [];
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; sig.push(k.flow([[Math.cos(a) * 1.4, 0.37, Math.sin(a) * 1.4], [Math.cos(a) * 0.6, 0.37, Math.sin(a) * 0.6]], { count: 4, color: 0x58ff9a, size: 0.1, phase: i / 8 })); }
      root.add(...sig);
      return { root, parts, refs: { sig } };
    },
    evaluate(has, on) { const ok = has('die') && has('balls'); return { alive: on && ok, reason: on && !ok ? 'The chip needs its silicon and its little balls to get signals.' : '' }; },
    apply(out, inst) { inst.byId.die.meshes[0].material.emissiveIntensity = out.alive ? 0.35 : 0; show(inst.refs.sig, out.alive); },
    tick(dt, t, inst, out) { if (out && out.alive) upd(inst.refs.sig, dt, 0.6); },
  });

  world({
    id: 'chip-die', name: 'Inside the silicon', zoom: '100×', short: 'silicon',
    view: view(0.4, 2.5, 3.3, -0.4, 0.7),
    intro: 'This is the silicon, 100 times bigger. From up here it looks like a tiny city! Peel off the copper wiring layers to see the neighborhoods underneath.',
    shellSay: 'This is the top of the silicon chip.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'silicon', name: 'Silicon', fixed: true, obj: k.group(k.at(k.box(3.2, 0.12, 3.2, k.metal(0x3a3e5a, { roughness: 0.3 })), 0, 0.06, 0)), tagAt: [-1.4, 0.3, 1.6],
        say: 'This is the silicon chip, 100 times bigger. It looks like a tiny city from above!',
        learn: ['Different areas do different jobs, like neighborhoods in a city.', 'All of it was printed with light, a little like printing a photo, then built up layer by layer.'] });
      const cores = [];
      [[-1.0, -1.0], [0, -1.0], [-1.0, 0], [0, 0]].forEach(([x, z], i) => {
        const m = k.box(0.85, 0.08, 0.85, k.mat(0x5a4bb0, { metalness: 0.5, roughness: 0.3, emissive: 0x8a7bff, emissiveIntensity: 0 }));
        m.material.userData.selfLit = true;
        cores.push(m);
        add({ id: 'core' + i, name: 'Thinking core', obj: k.group(k.at(m, x, 0.16, z)), inside: 'transistor', blockedBy: ['wiring1'], pull: [x * 1.2, 1.4, z * 1.2 + 0.3], tagAt: [x, 0.42, z], tag: 'Core ' + (i + 1),
          say: 'This is a thinking core. It does math super fast.',
          learn: ['A core follows instructions one after another, billions of times every second.', 'Having several cores is like having several workers sharing the job.', 'Each core is built from millions of tiny switches called transistors. Tap the magnifying glass to see one!'] });
      });
      const memTex = k.canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#1f6a52'; c.fillRect(0, 0, w, h); c.fillStyle = '#3fbf8f'; for (let x = 4; x < w; x += 10) for (let y = 4; y < h; y += 10) c.fillRect(x, y, 6, 6); });
      add({ id: 'cache', name: 'Quick memory', obj: k.group(k.at(k.box(1.0, 0.08, 1.9, k.mat(0xffffff, { map: memTex, roughness: 0.4 })), 1.05, 0.16, -0.5)), blockedBy: ['wiring1'], pull: [1.6, 1.4, -0.6], tagAt: [1.05, 0.42, -0.5],
        say: 'This is quick memory, where the cores keep things they need right now.',
        learn: ['It is like a desk next to you instead of a bookshelf across the room.', 'It is made of tiny cells that each hold a one or a zero.'] });
      add({ id: 'gfx', name: 'Picture maker', obj: k.group(k.at(k.box(2.05, 0.08, 0.85, k.mat(0xb05a4b, { metalness: 0.4, roughness: 0.3 })), -0.5, 0.16, 1.05)), blockedBy: ['wiring1'], pull: [-0.6, 1.4, 1.8], tagAt: [-0.5, 0.42, 1.05],
        say: 'This part works out the pictures and menus you see on the screen.',
        learn: ['It does many small math problems at the same time, one for each dot of the picture.'] });
      const wTex = k.canvasTex(256, 256, (c, w) => { c.clearRect(0, 0, w, w); c.strokeStyle = '#e8925a'; c.lineWidth = 3; for (let i = 6; i < w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); } });
      ['wiring1', 'wiring2', 'wiring3'].forEach((id, i) => {
        const mat = k.mat(0xffffff, { map: wTex, transparent: true, opacity: 0.85, metalness: 0.7, roughness: 0.3, side: T.DoubleSide, depthWrite: false });
        const pl = k.mesh(new T.PlaneGeometry(3.1, 3.1), mat);
        pl.rotation.set(-Math.PI / 2, 0, i % 2 ? Math.PI / 2 : 0); pl.position.y = 0.32 + i * 0.12;
        add({ id, name: 'Copper wiring', obj: k.group(pl), blockedBy: i < 2 ? ['wiring' + (i + 2)] : [], pull: [i % 2 ? 3.6 : -3.6, 0.6 + i * 0.4, 0], tagAt: [1.7, 0.4 + i * 0.12, 1.4 - i * 0.2], tag: 'Wiring layer ' + (i + 1),
          say: 'These are layers of super tiny copper wires that connect everything.',
          learn: ['There can be more than ten layers stacked up, like a city with many floors of roads.', 'The thinnest wires are a thousand times thinner than a hair.'] });
      });
      const pulses = [];
      for (let i = 0; i < 6; i++) { const z = -1.2 + i * 0.48; pulses.push(k.flow([[-1.5, 0.27, z], [1.5, 0.27, z]], { count: 3, color: 0x7affd0, size: 0.12, phase: i / 6 })); }
      root.add(...pulses);
      return { root, parts, refs: { pulses, cores } };
    },
    evaluate(has, on) { return { alive: on }; },
    apply(out, inst) { show(inst.refs.pulses, out.alive); },
    tick(dt, t, inst, out) {
      const on = out && out.alive, r = inst.refs;
      if (on) upd(r.pulses, dt, 0.7);
      inst.parts.filter((p) => /^core/.test(p.id)).forEach((p, i) => { p.meshes[0].material.emissiveIntensity = on ? 0.4 + 0.4 * Math.max(0, Math.sin(t * 9 + i * 1.7)) : 0; });
    },
  });

  world({
    id: 'transistor', name: 'One transistor', zoom: '1,000,000×', short: 'transistor',
    view: view(0.8, 2.4, 3.3),
    intro: 'This is one transistor, a million times bigger. It is a tiny switch. Press the power button to switch it on and off, and watch the electrons.',
    shellSay: 'This is one transistor, a tiny electric switch.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'body', name: 'Silicon', fixed: true, obj: k.group(k.at(k.box(3.2, 0.8, 1.8, k.mat(0x7a7f95, { roughness: 0.5 })), 0, 0.4, 0)), inside: 'silicon-atoms', tagAt: [0, 0.3, 1.05],
        say: 'This block is silicon, the stuff computer chips are made of.',
        learn: ['Pure silicon barely lets electricity through. A pinch of other atoms changes that.', 'Tap the magnifying glass to see the silicon atoms.'] });
      add({ id: 'source', name: 'Source', fixed: true, obj: k.group(k.at(k.box(0.85, 0.2, 1.6, k.mat(0x4a7bff, { roughness: 0.4 })), -1.05, 0.81, 0)), tagAt: [-1.05, 1.15, 0.6],
        say: 'The source is where electrons wait to go.',
        learn: ['Extra electrons were added here on purpose, so it is crowded with them.'] });
      add({ id: 'drain', name: 'Drain', fixed: true, obj: k.group(k.at(k.box(0.85, 0.2, 1.6, k.mat(0x4a7bff, { roughness: 0.4 })), 1.05, 0.81, 0)), tagAt: [1.05, 1.15, 0.6],
        say: 'The drain is where the electrons are going.',
        learn: ['Like water down a drain, electrons leave through here when the switch is on.'] });
      add({ id: 'oxide', name: 'Glass layer', obj: k.group(k.at(k.box(1.1, 0.06, 1.6, k.glass(0xd8f0ff, 0.5, { depthWrite: true })), 0, 0.84, 0)), blockedBy: ['gate'], pull: [0, 1.3, 1.5], tagAt: [0, 0.95, 1.0],
        say: 'This super thin glass layer keeps the gate from touching the silicon.',
        learn: ['It is only a few atoms thick. The gate works through it like a magnet through paper, without touching.'] });
      const onTag = k.label('ON = 1', { size: 0.24, bg: 'rgba(30,140,80,0.9)' }), offTag = k.label('OFF = 0', { size: 0.24, bg: 'rgba(140,40,40,0.9)' });
      onTag.position.set(0, 1.7, 0); offTag.position.set(0, 1.7, 0);
      add({ id: 'gate', name: 'Gate', obj: k.group(k.at(k.box(1.1, 0.3, 1.6, k.metal(0xb8bdc4, { roughness: 0.3 })), 0, 1.02, 0), onTag, offTag), pull: [0, 2.0, 0], tagAt: [0.95, 1.35, 0.6],
        say: 'The gate is the switch handle! When the power is on, the gate opens a path for electrons.',
        learn: ['When the gate gets a little push of electricity, it pulls electrons into a thin bridge between the source and the drain.', 'On means one, off means zero. Every picture, game and video is made of huge numbers of these ones and zeros.', 'A modern processor has billions of transistors, each switching on and off billions of times a second.'] });
      const chMat = k.glow(0x1a3a4a, 0x5adcff);
      const channel = k.at(k.box(1.1, 0.04, 1.5, chMat), 0, 0.79, 0); channel.userData.noPick = true;
      root.add(channel);
      const e = [-0.5, 0, 0.5].map((z, i) => k.flow([[-1.35, 0.86, z], [-0.6, 0.8, z], [0.6, 0.8, z], [1.35, 0.86, z]], { count: 7, color: BLUE, size: 0.13, phase: i * 0.33 }));
      root.add(...e);
      return { root, parts, refs: { e, chMat, onTag, offTag } };
    },
    evaluate(has, on) { return { alive: on, channel: on && has('gate') && has('oxide') }; },
    apply(out, inst) {
      const r = inst.refs;
      r.chMat.emissiveIntensity = out.channel ? 1.2 : 0;
      show(r.e, out.channel); r.onTag.visible = !!out.alive; r.offTag.visible = !out.alive;
    },
    tick(dt, t, inst, out) { if (out && out.channel) upd(inst.refs.e, dt, 0.4); },
  });

  world({
    id: 'silicon-atoms', name: 'Silicon atoms', zoom: '100,000,000×', short: 'crystal',
    view: view(1.1, 2.8, 2.8),
    intro: 'We are a hundred million times bigger, down at the silicon atoms! They hold hands in a perfect pattern. Turn the power on to see free electrons wander through.',
    shellSay: 'These are silicon atoms, stacked in a perfect pattern called a crystal.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const si = k.metal(0x8a93a8, { roughness: 0.3 }), bond = k.mat(0x58607a, { roughness: 0.5 });
      const shell = lattice(k, 6, 3, 3, 0.85, 0.3, () => ({ r: 0.22, mat: si }), bond);
      root.add(shell);
      const p = shell.userData.pos(2, 2, 2);
      add({ id: 'si', name: 'Silicon atom', fixed: true, obj: k.group(k.at(k.sphere(0.26, k.metal(0xb7c0d6, { roughness: 0.2 }), 24), p[0], p[1], p[2])), tagAt: [p[0], p[1] + 0.5, p[2]],
        say: 'This is a silicon atom. Each one holds hands with its neighbors.',
        learn: ['Silicon atoms share electrons with their neighbors. The shared electrons are like hands holding the crystal together.',
          'Each silicon atom has 14 electrons. The 4 outer ones do the hand holding.',
          'When a few atoms of something else are mixed in, some electrons get loose and can wander. That is what lets a transistor switch.'] });
      const eInner = k.group(k.sphere(0.11, k.glow(0x2a48ff, 0x4f8dff), 16));
      add({ id: 'electron', name: 'Free electron', fixed: true, obj: k.group(eInner), tagAt: [-2.2, 2.4, 1.0],
        say: 'This is a free electron, wandering through the crystal.',
        learn: ['Most electrons are busy holding atoms together. A free one can move, and moving electrons are electricity.', 'When the gate switch is on, it pulls lots of free electrons into a path, and electricity flows.'] });
      const route = [[-2.4, 0.72, 0.42], [-1.7, 0.72, 0.0], [-1.0, 1.15, 0.42], [-0.3, 0.72, 0.0], [0.4, 1.15, 0.42], [1.1, 0.72, 0.0], [1.8, 1.15, 0.42], [2.5, 0.72, 0.0]];
      const others = [0, 0.33, 0.66].map((ph) => k.flow(route.map((q) => [q[0], q[1], q[2] - 0.85]), { count: 3, color: BLUE, size: 0.15, phase: ph }));
      root.add(...others);
      const path = new T.CatmullRomCurve3(route.map((q) => new T.Vector3(q[0], q[1], q[2])));
      return { root, shell: [shell], parts, refs: { eInner, path, others, clock: 0 } };
    },
    evaluate(has, on) { return { alive: on }; },
    apply(out, inst) { show(inst.refs.others, out.alive); },
    tick(dt, t, inst, out) {
      const r = inst.refs;
      if (out && out.alive) { r.clock += dt; upd(r.others, dt, 0.18); }
      r.eInner.position.copy(r.path.getPointAt((r.clock * 0.18) % 1));
    },
  });

  // =====================================================================  battery
  world({
    id: 'battery-inside', name: 'Inside a battery', zoom: '3×', short: 'battery',
    view: view(1.5, 2.7, 3.6),
    intro: 'This battery is cut open, 3 times bigger. Watch the blue electrons leave the bottom, light the bulb, and come back in the top!',
    shellSay: 'This is a battery, cut open so you can see inside.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'can', name: 'Steel can', obj: cutTube(k, 0.7, 0.74, 2.4, 1.5, k.metal(0xc9ced6, { roughness: 0.3 })), pull: [-2.8, 0, -0.6], tagAt: [-0.85, 2.5, -0.4],
        say: 'The steel can holds everything in. It is also the plus side of the battery!',
        learn: ['The can touches the black powder inside, so it carries the plus side all the way up to the bump on top.', 'It is sealed tight so the paste inside cannot leak out.'] });
      add({ id: 'plusCap', name: 'Plus bump', obj: k.group(k.at(k.cyl(0.24, 0.24, 0.16, k.metal(0xd8dde4, { roughness: 0.2 }), 32), 0, 2.78, 0)), pull: [0, 1.0, 0], tagAt: [0.6, 3.0, 0],
        say: 'The bump on top is the plus end.', learn: ['The electrons travel all the way around the loop and come back in here.'] });
      add({ id: 'minusEnd', name: 'Minus end', fixed: true, obj: k.group(k.at(k.cyl(0.74, 0.74, 0.06, k.metal(0xb8bdc4, { roughness: 0.3 }), 48), 0, 0.27, 0)), tagAt: [0.9, 0.2, 0.6],
        say: 'The flat bottom is the minus end. Electrons leave the battery here.',
        learn: ['Inside, the brass nail connects the zinc paste to this end.'] });
      add({ id: 'cathode', name: 'Black powder', obj: cutTube(k, 0.48, 0.68, 2.1, 1.5, k.mat(0x26262a, { roughness: 0.95 })), blockedBy: ['can'], pull: [2.8, 0, -0.4], tagAt: [-0.7, 2.75, 0.45],
        say: 'This black powder is manganese dioxide. It is hungry for electrons.',
        learn: ['It pulls in electrons from the wire, after they have done their work lighting the bulb.', 'It is packed into a ring that presses against the steel can.', 'It is mixed with carbon powder so electricity can move through it easily.'] });
      add({ id: 'separator', name: 'Paper wall', obj: cutTube(k, 0.45, 0.48, 2.1, 1.5, k.mat(0xe8dcc0, { roughness: 0.9 })), blockedBy: ['cathode'], pull: [-2.2, 0.5, 1.2], tagAt: [-0.3, 2.85, 0.75],
        say: 'This paper wall keeps the two powders from touching.',
        learn: ['If they touched, the battery would use itself up. The paper lets tiny charged bits through, but not the powders.', 'It is soaked in a watery liquid that lets those charged bits travel between the two sides.'] });
      add({ id: 'anode', name: 'Zinc paste', obj: cutTube(k, 0.06, 0.45, 2.1, 1.5, k.mat(0x9a9ea6, { roughness: 0.85 })), inside: 'battery-chemistry', blockedBy: ['separator'], pull: [2.2, 0.5, 1.2], tagAt: [0.55, 1.2, 0.55],
        say: 'This gray paste is full of zinc. Zinc gives away electrons!',
        learn: ['When the loop is closed, zinc atoms let go of electrons. The electrons rush out through the brass nail and the wire.', 'As zinc gives away electrons it slowly turns into zinc oxide. When most of the zinc is used up, the battery is dead.', 'Tap the magnifying glass to watch the zinc atoms.'] });
      add({ id: 'nail', name: 'Brass nail', obj: k.group(k.at(k.cyl(0.05, 0.05, 2.0, k.metal(GOLD, { roughness: 0.25 }), 12), 0, 1.3, 0)), pull: [0, 2.6, 0.6], tagAt: [-0.45, 0.7, 0.3],
        say: 'The brass nail collects electrons from the zinc and sends them down to the minus end.',
        learn: ['Brass is a mix of copper and zinc. It carries electricity well and does not rust.'] });
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0); bulbMat.transparent = true; bulbMat.opacity = 0.85;
      const wirePts = [[0, 0.22, 0.2], [0.9, 0.15, 0.6], [1.7, 0.6, 0.6], [1.8, 2.2, 0.6], [1.6, 3.15, 0.5], [0.8, 3.25, 0.25], [0, 2.9, 0.1]];
      add({ id: 'circuit', name: 'Wire and bulb', obj: k.group(k.tube(wirePts, 0.03, k.mat(0xc0392b, { roughness: 0.5 })), k.at(k.sphere(0.22, bulbMat, 20), 1.8, 2.4, 0.6)), pull: [1.6, 0, 1.4], tagAt: [2.3, 2.8, 0.6],
        say: 'This wire and little bulb make a loop. Electrons flow out of the minus end, through the bulb, and back in the top.',
        learn: ['No loop, no flow. That is why a switch works: it opens and closes the loop.'] });
      const flow = k.flow(wirePts, { count: 22, color: BLUE, size: 0.2 });
      const glowB = halo(k, 1.8, 2.4, 0.6);
      root.add(flow, glowB);
      return { root, parts, refs: { flow, bulbMat, glowB } };
    },
    evaluate(has, on) {
      const ok = ['can', 'plusCap', 'cathode', 'separator', 'anode', 'nail', 'circuit'].every(has);
      return { alive: on && ok, reason: on && !ok ? 'The battery needs all its parts to push the electrons around the loop.' : '' };
    },
    apply(out, inst) { inst.byId.circuit.meshes[1].material.emissiveIntensity = out.alive ? 2.5 : 0; show([inst.refs.flow, inst.refs.glowB], out.alive); },
    tick(dt, t, inst, out) { if (out && out.alive) upd([inst.refs.flow], dt, 0.12); },
  });

  world({
    id: 'battery-chemistry', name: 'Zinc atoms at work', zoom: '1,000,000×', short: 'chemistry',
    view: view(1.2, 2.9, 2.9),
    intro: 'A million times bigger! Gray zinc atoms on the left give away blue electrons. Red bits carry charge through the paper wall from the black powder on the right.',
    shellSay: 'These are atoms inside the battery: zinc on the left, manganese dioxide on the right.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const zn = k.metal(0x9aa0aa, { roughness: 0.35 }), mn = k.mat(0x2a2a30, { roughness: 0.7 });
      const left = lattice(k, 3, 3, 3, 0.62, 0.4, () => ({ r: 0.24, mat: zn }), null); left.position.x = -1.5;
      const right = lattice(k, 3, 3, 3, 0.62, 0.4, (i, j, l) => ((i + j + l) % 2 ? { r: 0.16, mat: k.mat(0xc0392b, { roughness: 0.5 }) } : { r: 0.24, mat: mn }), null); right.position.x = 1.5;
      root.add(left, right);
      add({ id: 'zinc', name: 'Zinc atom', fixed: true, obj: k.group(k.at(k.sphere(0.28, k.metal(0xc5ccd6, { roughness: 0.2 }), 24), -0.88, 1.64, 0.62)), tagAt: [-0.88, 2.15, 0.62],
        say: 'These gray balls are zinc atoms. Each one is ready to give away 2 electrons.',
        learn: ['When a zinc atom gives its electrons away, it joins up with oxygen and becomes zinc oxide.', 'That change is the battery being used up. A dead battery is mostly zinc oxide on this side.'] });
      add({ id: 'mno2', name: 'Manganese dioxide', fixed: true, obj: k.group(k.at(k.sphere(0.27, k.mat(0x3a3a44, { roughness: 0.5 }), 24), 0.88, 1.64, 0.62)), tagAt: [1.1, 2.15, 0.62],
        say: 'The dark balls are manganese dioxide. They catch the electrons when they come back around the loop.',
        learn: ['Catching electrons changes it into a slightly different chemical. Both sides change as the battery works.'] });
      const sepMat = k.mat(0xe8dcc0, { transparent: true, opacity: 0.45, roughness: 0.9, side: T.DoubleSide, depthWrite: false });
      add({ id: 'wall', name: 'Paper wall', fixed: true, obj: k.group(k.at(k.box(0.06, 2.0, 2.0, sepMat), 0, 1.0, 0)), tagAt: [0, 2.3, 0],
        say: 'The paper wall keeps the zinc and the black powder apart, but lets tiny charged bits through.',
        learn: ['The red bits crossing it are called hydroxide. Each is an oxygen and a hydrogen stuck together, carrying an extra electron.', 'Their trip inside balances the electrons going around the outside wire, so the loop keeps going.'] });
      const out1 = [0, 0.33, 0.66].map((ph, i) => k.flow([[-1.5, 1.0 + i * 0.3, 0.3], [-1.2, 2.1, 0.3], [-1.3, 3.0, 0.3]], { count: 4, color: BLUE, size: 0.15, phase: ph }));
      const in1 = [0, 0.5].map((ph) => k.flow([[1.3, 3.0, 0.3], [1.2, 2.1, 0.3], [1.5, 1.2, 0.3]], { count: 4, color: BLUE, size: 0.15, phase: ph }));
      const ions = [0, 0.25, 0.5, 0.75].map((ph, i) => k.flow([[1.1, 0.6 + i * 0.35, -0.3], [0, 0.7 + i * 0.35, -0.3], [-1.0, 0.6 + i * 0.35, -0.3]], { count: 3, color: 0xff5a4a, size: 0.13, phase: ph }));
      const t1 = k.label('Electrons out to the wire', { size: 0.15 }); t1.position.set(-1.3, 3.25, 0.3);
      const t2 = k.label('Back from the wire', { size: 0.15 }); t2.position.set(1.3, 3.25, 0.3);
      root.add(...out1, ...in1, ...ions, t1, t2);
      return { root, shell: [left, right], parts, refs: { flows: out1.concat(in1, ions) } };
    },
    evaluate(has, on) { return { alive: on }; },
    apply(out, inst) { show(inst.refs.flows, out.alive); },
    tick(dt, t, inst, out) { if (out && out.alive) upd(inst.refs.flows, dt, 0.18); },
  });

  // =====================================================================  capacitor
  world({
    id: 'cap-inside', name: 'Inside a capacitor', zoom: '10×', short: 'capacitor',
    view: view(1.4, 2.6, 3.5),
    intro: 'This is a capacitor, 10 times bigger. It is a little tank that fills up with electricity. Turn the power on and watch it fill!',
    shellSay: 'This is a capacitor, opened up.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const can = k.group(
        k.at(k.cyl(0.88, 0.88, 2.5, k.mat(0x1f3c8f, { roughness: 0.35, side: T.DoubleSide }), 48, true), 0, 1.55, 0),
        k.at(k.cyl(0.86, 0.86, 0.04, k.metal(0xc9ced6, { roughness: 0.25 }), 48), 0, 2.8, 0),
        k.at(k.box(1.2, 0.02, 0.05, 0x555555), 0, 2.83, 0), k.at(k.box(0.05, 0.02, 1.2, 0x555555), 0, 2.83, 0),
        k.at(k.box(0.06, 2.3, 0.3, k.mat(0xdfe4ea)), 0.88, 1.55, 0)
      );
      add({ id: 'can', name: 'Metal can', obj: can, pull: [-2.8, 0, 0], tagAt: [-0.9, 3.0, 0],
        say: 'The metal can protects the inside and keeps it sealed.',
        learn: ['The cross on top is a safety vent. If the capacitor ever gets too hot, it opens gently instead of bursting.', 'The light stripe on the side shows which leg is the minus one.'] });
      add({ id: 'seal', name: 'Rubber plug', obj: k.group(k.at(k.cyl(0.84, 0.84, 0.25, k.mat(0x1b1b1b, { roughness: 0.9 }), 48), 0, 0.43, 0)), pull: [2.6, -0.1, 0.8], tagAt: [1.0, 0.45, 0.7],
        say: 'The rubber plug seals the bottom and lets the legs poke through.' });
      const rollTex = k.canvasTex(256, 64, (c, w, h) => { for (let x = 0; x < w; x += 8) { c.fillStyle = (x / 8) % 2 ? '#d9dde4' : '#e8dcc0'; c.fillRect(x, 0, 8, h); } });
      rollTex.wrapS = T.RepeatWrapping; rollTex.repeat.set(4, 1);
      const rollMat = k.mat(0xffffff, { map: rollTex, roughness: 0.4, metalness: 0.4, emissive: 0x58b8ff, emissiveIntensity: 0 });
      rollMat.userData.selfLit = true;
      add({ id: 'roll', name: 'Foil roll', obj: k.group(k.rot(k.at(k.cyl(0.78, 0.78, 2.1, rollMat, 48), 0, 1.6, 0), 0, 0, 0)), inside: 'cap-plates', blockedBy: ['can'], pull: [0, 0, 2.6], tagAt: [0, 2.95, 0.9],
        say: 'Inside is a long strip of metal foil and paper, rolled up tight!',
        learn: ['If you unrolled it, it could be as long as your arm, or even longer.', 'Two foil strips are separated by paper soaked in a special liquid. The foils never touch.', 'Tap the magnifying glass to see how the foils store electricity.'] });
      const legs = k.group(k.at(k.cyl(0.03, 0.03, 0.9, k.metal(0xd6dbe2), 8), -0.3, 0.0, 0), k.at(k.cyl(0.03, 0.03, 0.9, k.metal(0xd6dbe2), 8), 0.3, 0.0, 0));
      add({ id: 'legs', name: 'Legs', obj: legs, pull: [0, 0, 2.2], tagAt: [0.7, -0.1, 0.3],
        say: 'The two legs connect the capacitor to the board. One goes to each foil inside.' });
      const fl = [k.flow([[-0.3, -0.45, 0], [-0.3, 0.6, 0], [-0.3, 1.5, 0.6]], { count: 6, color: BLUE, size: 0.13 }), k.flow([[0.3, 1.5, 0.6], [0.3, 0.6, 0], [0.3, -0.45, 0]], { count: 6, color: BLUE, size: 0.13 })];
      root.add(...fl);
      return { root, parts, refs: { fl, charge: 0 } };
    },
    evaluate(has, on) { const ok = ['roll', 'legs'].every(has); return { alive: on && ok, reason: on && !ok ? 'Without the foil roll and the legs, there is nothing to fill up.' : '' }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      const before = r.charge;
      r.charge = Math.max(0, Math.min(1, r.charge + dt * (on ? 0.35 : -0.6)));
      const moving = Math.abs(r.charge - before) > 1e-4;
      show(r.fl, moving);
      if (moving) upd(r.fl, dt, on ? 0.4 : -0.4);
      const roll = inst.byId.roll;
      if (roll) roll.meshes[0].material.emissiveIntensity = r.charge * 0.6;
    },
  });

  world({
    id: 'cap-plates', name: 'The plates', zoom: '10,000×', short: 'plates',
    view: view(1.1, 2.4, 3.3),
    intro: 'Ten thousand times bigger, this is a tiny piece of the foil roll: two metal plates with a thin layer between them. Turn the power on and watch electrons pile up!',
    shellSay: 'Two plates with a gap between them. That is a capacitor.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const plate = (y) => k.box(2.8, 0.1, 2.0, k.metal(0xd6dbe2, { roughness: 0.25 }));
      const minus = [], plus = [];
      const bottom = k.group(k.at(plate(), 0, 0.55, 0));
      const top = k.group(k.at(plate(), 0, 1.75, 0));
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
        const x = -1.1 + i * 0.44, z = -0.66 + j * 0.44;
        const e = k.at(k.sphere(0.07, k.glow(0x2a48ff, 0x4f8dff), 10), x, 0.66, z); e.material.emissiveIntensity = 1.5; bottom.add(e); minus.push(e);
        const h = k.rot(k.at(k.torus(0.07, 0.02, k.glow(0xff5a4a, 0xff5a4a), 12), x, 1.69, z), Math.PI / 2, 0, 0); h.material.emissiveIntensity = 1.5; top.add(h); plus.push(h);
      }
      add({ id: 'bottom', name: 'Bottom plate', obj: bottom, pull: [0, -0.4, 2.6], tagAt: [-1.6, 0.55, 1.1],
        say: 'Electrons pile up on this plate!',
        learn: ['They cannot cross the gap, so they wait here, like water behind a dam.', 'When something needs a quick burst of power, the electrons rush back around the loop all at once.'] });
      add({ id: 'top', name: 'Top plate', obj: top, pull: [0, 1.4, 1.6], tagAt: [-1.6, 1.95, 1.1],
        say: 'This plate is losing electrons, so it becomes the plus side.',
        learn: ['The power pulls electrons off this plate and pushes them around to the other one.', 'The more electrons move, the more electricity is stored. The red rings show the empty spots left behind.'] });
      const insMat = k.mat(0xe8dcc0, { transparent: true, opacity: 0.35, roughness: 0.9, depthWrite: false });
      add({ id: 'gap', name: 'Insulator layer', obj: k.group(k.at(k.box(2.8, 1.0, 2.0, insMat), 0, 1.15, 0)), blockedBy: ['top'], pull: [3.4, 0.2, 0], tagAt: [1.5, 1.15, 1.1],
        say: 'This layer keeps the plates apart, so electrons cannot jump across.',
        learn: ['If the plates touched, all the stored electricity would rush out at once, with a spark.', 'In real capacitors this layer is incredibly thin, which lets them store even more.'] });
      const field = [];
      for (let i = 0; i < 5; i++) {
        const m = k.at(k.cyl(0.015, 0.015, 1.05, k.mat(0x9fd8ff, { transparent: true, opacity: 0, emissive: 0x9fd8ff, emissiveIntensity: 1, depthWrite: false }), 6), -1.0 + i * 0.5, 1.15, 0.5);
        m.userData.noPick = true; field.push(m); root.add(m);
      }
      const leads = [k.flow([[-2.6, 0.55, 0], [-1.6, 0.55, 0]], { count: 4, color: BLUE, size: 0.13 }), k.flow([[-1.6, 1.75, 0], [-2.6, 1.75, 0]], { count: 4, color: BLUE, size: 0.13 })];
      root.add(...leads);
      return { root, parts, refs: { minus, plus, field, leads, charge: 0 } };
    },
    evaluate(has, on) { const ok = ['bottom', 'top'].every(has); return { alive: on && ok, gap: has('gap') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      const before = r.charge;
      r.charge = on && out.gap ? Math.min(1, r.charge + dt * 0.3) : Math.max(0, r.charge - dt * (out && !out.gap ? 3 : 0.6));
      const n = Math.round(r.charge * r.minus.length);
      r.minus.forEach((m, i) => { m.visible = i < n; });
      r.plus.forEach((m, i) => { m.visible = i < n; });
      r.field.forEach((m) => { m.material.opacity = r.charge * 0.8; });
      const moving = Math.abs(r.charge - before) > 1e-4;
      show(r.leads, moving);
      if (moving) upd(r.leads, dt, r.charge > before ? 0.5 : -0.5);
    },
  });

  // =====================================================================  LCD
  world({
    id: 'lcd-pixel', name: 'One pixel', zoom: '100×', short: 'pixel',
    view: view(1.5, 2.8, 3.6, -0.55, 0.3),
    intro: 'This is one pixel of the screen, 100 times bigger, pulled apart into its layers. White light comes up from the bottom and each layer changes it. Watch the three colors mix!',
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
        learn: ['Light wiggles as it travels. This sheet is like a fence with slots that only lets one direction of wiggle pass.', 'Some sunglasses have this kind of filter too. That is how they cut glare.'] });
      const tft = k.group(plate(1.05, { color: 0xd8f0ff }));
      [-0.8, 0, 0.8].forEach((x) => tft.add(k.at(k.box(0.12, 0.08, 0.12, k.metal(GOLD)), x - 0.25, 1.1, -0.5)));
      add({ id: 'tft', name: 'Switch glass', obj: tft, blockedBy: ['lc'], pull: [3.4, 0, 0], tagAt: [1.75, 1.05, 0.7],
        say: 'This glass has a tiny switch for each color dot.',
        learn: ['Each switch sends just the right amount of electricity to its dot.', 'They are thin film transistors. A 4K TV has about 25 million of them!'] });
      const lc = k.group();
      [-0.8, 0, 0.8].forEach((x) => {
        lc.add(k.at(k.box(0.7, 0.25, 1.2, k.mat(0xbfe8ff, { transparent: true, opacity: 0.35, depthWrite: false })), x, 1.45, 0));
        for (let i = 0; i < 4; i++) lc.add(k.rot(k.at(k.cyl(0.03, 0.03, 0.3, k.mat(0x7fd6ff), 6), x - 0.2 + i * 0.13, 1.45, 0), 0, 0, Math.PI / 2 - i * 0.35));
      });
      add({ id: 'lc', name: 'Liquid crystal', obj: lc, inside: 'liquid-crystal', blockedBy: ['filter'], pull: [-3.4, 0.2, 0.4], tagAt: [-1.75, 1.45, 0.7],
        say: 'The liquid crystal twists the light, a little or a lot.',
        learn: ['With no electricity its molecules twist the light so it can get through. With electricity they straighten up and block it.', 'By setting each dot somewhere in between, the TV makes every shade.', 'Tap the magnifying glass to see the molecules.'] });
      const filter = k.group();
      [[-0.8, 0xff3030], [0, 0x30ff60], [0.8, 0x3060ff]].forEach(([x, c]) => filter.add(k.at(k.box(0.75, 0.06, 1.3, k.mat(c, { transparent: true, opacity: 0.75, roughness: 0.3, emissive: c, emissiveIntensity: 0.25 })), x, 1.85, 0)));
      add({ id: 'filter', name: 'Color filter', obj: filter, blockedBy: ['frontPol'], pull: [3.4, 0.2, 0.4], tagAt: [1.75, 1.85, 0.7],
        say: 'Red, green and blue windows color the light.',
        learn: ['Every color on a TV is a mix of just these three. Red and green light together look yellow!', 'Each little window is called a subpixel. Three of them make one pixel.'] });
      add({ id: 'frontPol', name: 'Front polarizer', obj: k.group(plate(2.25, { map: lines(false), color: 0xdfe6f2 })), pull: [0, 1.6, 0], tagAt: [-1.7, 2.25, 0.7],
        say: 'The last filter, turned the other way, decides how much light gets out.',
        learn: ['Light only gets out if the liquid crystal twisted it to line up with this filter.', 'Without it, you would see the backlight shining but no picture at all.'] });
      const low = [], high = [], cols = [0xff3030, 0x30ff60, 0x3060ff];
      [-0.8, 0, 0.8].forEach((x, i) => {
        low.push(k.flow([[x, 0.3, 0.2], [x, 1.85, 0.2]], { count: 6, color: 0xfff8ee, size: 0.16, phase: i / 3 }));
        high.push(k.flow([[x, 1.9, 0.2], [x, 3.1, 0.2]], { count: 4, color: cols[i], size: 0.2, phase: i / 3 }));
      });
      const mixMat = new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
      const mix = k.at(k.mesh(new T.SphereGeometry(0.28, 24, 16), mixMat), 0, 3.5, 0); mix.userData.noPick = true;
      const mixTag = k.label('The color you see', { size: 0.15 }); mixTag.position.set(0, 3.95, 0);
      root.add(...low, ...high, mix, mixTag);
      return { root, parts, refs: { low, high, mixMat, cols } };
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
    },
  });

  world({
    id: 'liquid-crystal', name: 'Liquid crystal molecules', zoom: '10,000×', short: 'liquid crystal',
    view: view(1.4, 2.5, 3.0),
    intro: 'Ten thousand times bigger! These rods are liquid crystal molecules between two sheets of glass. The power button turns the electricity on and off. Watch them stand up!',
    shellSay: 'Liquid crystal molecules between two sheets of glass.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const glass = (y) => k.box(2.8, 0.08, 2.0, k.glass(0xd8f0ff, 0.35, { depthWrite: true }));
      add({ id: 'glassB', name: 'Bottom glass', obj: k.group(k.at(glass(), 0, 0.3, 0)), pull: [0, -0.2, 2.6], tagAt: [-1.6, 0.3, 1.1],
        say: 'The bottom glass has tiny grooves that line up the first layer of molecules.',
        learn: ['The grooves are made by rubbing a thin coating in one direction, a bit like brushing a cat the same way every time.'] });
      add({ id: 'glassT', name: 'Top glass', obj: k.group(k.at(glass(), 0, 2.5, 0)), pull: [0, 1.6, 0], tagAt: [-1.6, 2.7, 1.1],
        say: 'The top glass has grooves turned a quarter turn the other way. That is what makes the twist.' });
      const rods = [], rodGroup = k.group(), rmat = k.mat(0x7fd6ff, { roughness: 0.3 });
      for (let layer = 0; layer < 6; layer++) for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
        const m = k.cyl(0.05, 0.05, 0.45, rmat, 8);
        m.position.set(-1.0 + i * 0.5, 0.6 + layer * 0.34, -0.55 + j * 0.55);
        rodGroup.add(m);
        rods.push({ m, twist: (layer / 5) * (Math.PI / 2) });
      }
      add({ id: 'rods', name: 'Crystal molecules', fixed: true, obj: rodGroup, tagAt: [1.8, 2.2, 0.9],
        say: 'These rods are liquid crystal molecules. They line up like fish swimming in a school.',
        learn: ['With no electricity, each layer turns a little more than the one below it, making a gentle twist.', 'The twist turns the wiggle of the light a quarter turn, so it can get through the front filter.', 'Add electricity and the molecules stand up straight. The twist is gone, so the light gets blocked. That is how a pixel turns dark.'] });
      const wavePts = new Float32Array(120 * 3), waveGeo = new T.BufferGeometry();
      waveGeo.setAttribute('position', new T.BufferAttribute(wavePts, 3));
      const wave = new T.Line(waveGeo, new T.LineBasicMaterial({ color: 0xffe9a0, toneMapped: false })); wave.frustumCulled = false;
      const outGlowMat = new T.MeshBasicMaterial({ color: 0xfff1c0, transparent: true, opacity: 0, toneMapped: false });
      const outGlow = k.at(k.mesh(new T.PlaneGeometry(2.6, 1.8), outGlowMat), 0, 2.9, 0); outGlow.rotation.x = -Math.PI / 2; outGlow.userData.noPick = true;
      const tag = k.label('Light', { size: 0.16 }); tag.position.set(1.55, 0.2, 1.0);
      root.add(wave, outGlow, tag);
      return { root, parts, refs: { rods, wavePts, waveGeo, outGlowMat, s: 1 } };
    },
    evaluate(has, on) { return { alive: on, volt: on && has('glassT') && has('glassB') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, want = out && out.volt ? 1 : 0;
      r.s += (want - r.s) * Math.min(1, dt * 3);
      const up = new T.Quaternion(), tw = new T.Quaternion(), flat = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 0, 1), Math.PI / 2);
      r.rods.forEach(({ m, twist }) => { tw.setFromAxisAngle(new T.Vector3(0, 1, 0), twist).multiply(flat); m.quaternion.copy(tw).slerp(up, r.s); });
      const pass = 1 - r.s, top = 0.1 + 2.8 * (0.35 + 0.65 * pass);
      for (let i = 0; i < 120; i++) {
        const y = 0.1 + (2.8 * i) / 119, f = Math.min(1, Math.max(0, (y - 0.6) / 1.7)), ang = f * (Math.PI / 2) * pass;
        const amp = y > top ? 0 : 0.28, s = Math.sin(y * 14 - t * 8) * amp;
        r.wavePts[i * 3] = 1.55 + Math.cos(ang) * s; r.wavePts[i * 3 + 1] = y; r.wavePts[i * 3 + 2] = 0.9 + Math.sin(ang) * s;
      }
      r.waveGeo.attributes.position.needsUpdate = true;
      r.outGlowMat.opacity = 0.55 * pass;
    },
  });

  // =====================================================================  speaker
  world({
    id: 'speaker-inside', name: 'Inside a speaker', zoom: '5×', short: 'speaker',
    view: view(1.4, 2.6, 3.6, -1.0, 0.25),
    intro: 'This speaker is cut open, 5 times bigger. Turn on the power and watch the cone shake to make sound waves!',
    shellSay: 'This is a speaker, cut in half.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const Y = 1.4, ts = Math.PI / 2, tl = Math.PI * 1.5;
      const coneGeo = (rt, rb, h) => { const g = new T.CylinderGeometry(rt, rb, h, 48, 1, true, ts, tl); g.rotateX(Math.PI / 2); return g; };
      add({ id: 'frame', name: 'Metal frame', fixed: true, obj: k.group(k.at(k.mesh(coneGeo(1.45, 0.55, 1.0), k.metal(0x5a5f68, { roughness: 0.4, side: T.DoubleSide, transparent: true, opacity: 0.35, depthWrite: false })), 0, Y, 0.25)), tagAt: [-1.5, Y + 1.4, 0.4],
        say: 'The metal frame holds every part in place.' });
      const coneIn = k.group(k.at(k.mesh(coneGeo(1.3, 0.38, 0.7), k.mat(0x2e2a26, { roughness: 0.9, side: T.DoubleSide })), 0, Y, 0.45));
      add({ id: 'cone', name: 'Paper cone', obj: k.group(coneIn), blockedBy: ['dust'], pull: [0, 0, 2.4], tagAt: [1.1, Y + 1.2, 0.9],
        say: 'The paper cone pushes the air back and forth. That is sound!',
        learn: ['Sound is air wiggling. The cone shoves the air, and the air shoves your eardrum.', 'Big slow wiggles sound low, like a drum. Small fast wiggles sound high, like a whistle.', 'The cone is light and stiff, so it can move back and forth hundreds or thousands of times a second.'] });
      const dustIn = k.group(k.at(k.rot(k.mesh(new T.SphereGeometry(0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), k.mat(0x1d1b19, { roughness: 0.8, side: T.DoubleSide })), Math.PI / 2, 0, 0), 0, Y, 0.78));
      add({ id: 'dust', name: 'Dust cap', obj: k.group(dustIn), pull: [0, 0.8, 2.2], tagAt: [0, Y + 0.6, 1.3],
        say: 'The dust cap keeps dust out of the middle of the speaker.' });
      const coilIn = k.group(k.at(k.rot(k.cyl(0.38, 0.38, 0.5, k.metal(0xc8743a, { roughness: 0.35, side: T.DoubleSide }), 32, true), Math.PI / 2, 0, 0), 0, Y, -0.05));
      add({ id: 'coil', name: 'Voice coil', obj: k.group(coilIn), blockedBy: ['spider'], pull: [-2.4, 0.4, 0.8], tagAt: [-0.9, Y + 0.6, -0.1],
        say: 'The voice coil is copper wire wrapped around a tube. Electricity turns it into a magnet!',
        learn: ['When electricity flows through the coil, it becomes a magnet that pushes and pulls against the big magnet.', 'The music signal flips the electricity back and forth, so the coil jumps back and forth with the music.', 'A coil that becomes a magnet is called an electromagnet. Motors work the same way.'] });
      const spider = k.group();
      for (let i = 0; i < 4; i++) spider.add(k.at(k.torus(0.45 + i * 0.09, 0.02, k.mat(0xc9a86a, { roughness: 0.9 }), 40), 0, Y, 0.12));
      add({ id: 'spider', name: 'Springy spider', obj: spider, blockedBy: ['cone'], pull: [2.4, 0.4, 0.8], tagAt: [1.2, Y - 0.4, 0.2],
        say: 'The springy spider holds the coil in the middle and pulls it back.',
        learn: ['It is made of stiff wavy cloth, so it can flex but always springs back to the center.'] });
      add({ id: 'magnet', name: 'Magnet', obj: k.group(k.at(k.rot(k.mesh(new T.CylinderGeometry(0.95, 0.95, 0.4, 48, 1, false, ts, tl), k.mat(0x2a2a2e, { roughness: 0.6 })), Math.PI / 2, 0, 0), 0, Y, -0.55)), pull: [0, -0.2, -2.4], tagAt: [-1.2, Y - 0.9, -0.6],
        say: 'The big magnet never changes. The coil pushes and pulls against it.',
        learn: ['It is usually ferrite, a ceramic magnet made mostly from iron oxide, which is a bit like rust.', 'The magnet makes a strong pull right in the gap where the coil sits.'] });
      add({ id: 'pole', name: 'Metal post', fixed: true, obj: k.group(k.at(k.rot(k.cyl(0.3, 0.3, 0.9, k.metal(0x9aa0aa, { roughness: 0.3 }), 24), Math.PI / 2, 0, 0), 0, Y, -0.35)), tagAt: [0.6, Y - 0.6, -0.4],
        say: 'The metal post guides the magnet power into the gap where the coil sits.' });
      const waves = [0, 1, 2].map(() => { const m = k.torus(1, 0.02, k.mat(0x9fd8ff, { transparent: true, opacity: 0, emissive: 0x9fd8ff, emissiveIntensity: 1, depthWrite: false }), 48); m.position.set(0, Y, 1.0); m.userData.noPick = true; root.add(m); return m; });
      return { root, parts, refs: { coneIn, dustIn, coilIn, waves, Y } };
    },
    evaluate(has, on) { return { alive: on && ['cone', 'coil', 'magnet', 'spider'].every(has), reason: on && !['coil', 'magnet'].every(has) ? 'No coil or no magnet means nothing pushes the cone.' : '' }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      const z = on ? Math.sin(t * 22) * 0.05 + Math.sin(t * 5.5) * 0.04 : 0;
      [r.coneIn, r.dustIn, r.coilIn].forEach((g) => { g.position.z = z; });
      r.waves.forEach((w, i) => {
        const ph = (t * 0.7 + i / 3) % 1;
        w.scale.setScalar(0.4 + ph * 1.8); w.position.z = 1.0 + ph * 1.6;
        w.material.opacity = on ? (1 - ph) * 0.7 : 0;
      });
    },
  });

  // =====================================================================  transformer
  world({
    id: 'transformer-inside', name: 'Inside a transformer', zoom: '10×', short: 'transformer',
    view: view(1.3, 2.7, 3.6),
    intro: 'This is a transformer, 10 times bigger. Electricity in the left coil makes magnetism, the purple dots, flow around the iron. That magnetism makes electricity in the right coil and lights the bulb, without the coils ever touching!',
    shellSay: 'This is a transformer: two coils on an iron ring.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const iron = k.mat(0x6a6f78, { metalness: 0.6, roughness: 0.45 });
      add({ id: 'core', name: 'Iron core', obj: k.group(k.at(k.rbox(0.45, 2.4, 0.7, iron, 0.03), -1.1, 1.3, 0), k.at(k.rbox(0.45, 2.4, 0.7, iron, 0.03), 1.1, 1.3, 0), k.at(k.rbox(2.65, 0.45, 0.7, iron, 0.03), 0, 2.28, 0), k.at(k.rbox(2.65, 0.45, 0.7, iron, 0.03), 0, 0.32, 0)),
        blockedBy: ['primary', 'secondary'], pull: [0, 0, -2.6], tagAt: [0, 2.75, 0],
        say: 'The iron core carries the magnetism from one coil to the other.',
        learn: ['Iron is great at guiding magnetism, the way a pipe guides water.', 'It is made of thin sheets stacked together. Solid iron would waste energy as heat from little swirling currents inside it.'] });
      const coil = (x, turns, r, tube, color) => { const g = k.group(); for (let i = 0; i < turns; i++) g.add(k.rot(k.at(k.torus(r, tube, k.metal(color, { roughness: 0.3 }), 24), x, 0.75 + (1.15 * i) / (turns - 1), 0), Math.PI / 2, 0, 0)); return g; };
      add({ id: 'primary', name: 'Input coil', obj: coil(-1.1, 8, 0.42, 0.05, 0xc8743a), pull: [-2.2, 0, 0.8], tagAt: [-1.85, 1.3, 0.5],
        say: 'Electricity goes round and round this input coil, which turns it into a magnet.',
        learn: ['The electricity keeps flipping direction, so the magnet keeps flipping too.', 'A flipping magnet is the secret. A steady one would not make any electricity in the other coil.', 'Wall electricity in America flips 120 times every second. That is 60 full back and forth cycles.'] });
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0); bulbMat.transparent = true; bulbMat.opacity = 0.85;
      const sec = coil(1.1, 14, 0.4, 0.03, 0xd98a4a);
      sec.add(k.tube([[1.4, 0.75, 0], [2.0, 0.8, 0], [2.1, 2.2, 0], [1.4, 1.9, 0]], 0.02, k.mat(0xc0392b)), k.at(k.sphere(0.22, bulbMat, 20), 2.1, 2.4, 0));
      add({ id: 'secondary', name: 'Output coil', obj: sec, pull: [2.2, 0, 0.8], tagAt: [2.2, 2.85, 0],
        say: 'The flipping magnetism makes electricity flow in this output coil, even though the two coils never touch!',
        learn: ['More turns of wire here means a higher voltage. Fewer turns means lower.', 'A phone charger turns the strong wall electricity down to a gentle one this way.', 'The tube TV flyback has thousands of turns on its output coil, to make thousands of volts.'] });
      const flux = k.flow([[-1.1, 0.32, 0.45], [-1.1, 2.28, 0.45], [1.1, 2.28, 0.45], [1.1, 0.32, 0.45]], { closed: true, count: 18, color: 0xb57bff, size: 0.18 });
      const e1 = k.flow(Array.from({ length: 20 }, (_, i) => [-1.1 + Math.cos(i * 2.5) * 0.47, 0.75 + i * 0.06, Math.sin(i * 2.5) * 0.47]), { count: 10, color: BLUE, size: 0.12 });
      const e2 = k.flow(Array.from({ length: 30 }, (_, i) => [1.1 + Math.cos(i * 3) * 0.44, 0.75 + i * 0.04, Math.sin(i * 3) * 0.44]), { count: 12, color: BLUE, size: 0.11 });
      const glowT = halo(k, 2.1, 2.4, 0);
      root.add(flux, e1, e2, glowT);
      return { root, parts, refs: { flux, e1, e2, glowT } };
    },
    evaluate(has, on) {
      const mag = on && has('primary'), strong = mag && has('core');
      return { alive: on, mag, strong, out: strong && has('secondary') };
    },
    apply(out, inst) {
      const r = inst.refs;
      show([r.e1], out.mag); show([r.flux], out.strong); show([r.e2, r.glowT], out.out);
      if (inst.byId.secondary) inst.byId.secondary.meshes[inst.byId.secondary.meshes.length - 1].material.emissiveIntensity = out.out ? 2.5 : 0;
    },
    tick(dt, t, inst, out) {
      if (!out || !out.alive) return;
      const r = inst.refs, dir = Math.sin(t * 2.2) > 0 ? 1 : -1; // the electricity flips back and forth
      upd([r.e1, r.e2, r.flux], dt, 0.25 * dir);
    },
  });

  // =====================================================================  picture tube
  world({
    id: 'crt-inside', name: 'Inside the picture tube', zoom: '1×', short: 'tube',
    view: view(1.5, 3.1, 3.9, -0.95, 0.3),
    intro: 'This is the picture tube cut open. The electron guns on the left shoot three beams. Magnets bend them to sweep across the screen, line by line, and the screen glows where they hit!',
    shellSay: 'This is the inside of the picture tube.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const Y = 1.5;
      const fg = new T.CylinderGeometry(0.25, 1.55, 3.0, 4, 1, true); fg.rotateY(Math.PI / 4); fg.rotateZ(-Math.PI / 2);
      const glassMat = k.glass(0x9fb8c8, 0.18, { side: T.DoubleSide });
      const funnel = k.at(k.mesh(fg, glassMat), 0.6, Y, 0); funnel.userData.pickThrough = true;
      const neck = k.at(k.rot(k.cyl(0.25, 0.25, 1.6, glassMat, 24, true), 0, 0, Math.PI / 2), -1.7, Y, 0); neck.userData.pickThrough = true;
      add({ id: 'glass', name: 'Glass bottle', fixed: true, obj: k.group(funnel, neck), tagAt: [0, Y + 1.6, 0],
        say: 'The whole tube is a big glass bottle with all the air sucked out.',
        learn: ['Electrons cannot travel far through air, so the air has to go.', 'Outside air presses hard on the empty bottle. That is why the glass is thick and heavy.'] });
      const gun = k.group();
      [0xff4a3d, 0x3ee08f, 0x4aa8ff].forEach((c, i) => gun.add(k.at(k.rot(k.cyl(0.05, 0.05, 0.6, k.metal(c, { roughness: 0.4 }), 12), 0, 0, Math.PI / 2), -2.2, Y + (i - 1) * 0.1, 0)));
      add({ id: 'gun', name: 'Electron guns', obj: gun, pull: [-0.6, 1.4, 0.4], tagAt: [-2.3, Y + 0.45, 0],
        say: 'The electron guns shoot three thin beams of electrons.',
        learn: ['A hot wire boils electrons off, like steam rising from a pot. Metal rings then aim them into thin beams.', 'One beam is for the red dots, one for green, and one for blue.'] });
      add({ id: 'yoke', name: 'Steering coils', obj: k.group(k.at(k.rot(k.torus(0.42, 0.1, k.metal(0xc8743a, { roughness: 0.35 }), 32), 0, Math.PI / 2, 0), -0.95, Y, 0)), pull: [0, -1.1, 1.4], tagAt: [-0.95, Y - 0.75, 0.2],
        say: 'These coils are magnets that bend the beams to sweep across the screen.',
        learn: ['The beams sweep left to right, line by line, top to bottom, like your eyes reading a book.', 'They draw a whole new picture about 30 times a second, so fast that it looks perfectly steady.'] });
      const maskTex = k.canvasTex(128, 128, (c, w) => { c.fillStyle = '#5a5f68'; c.fillRect(0, 0, w, w); c.fillStyle = '#111'; for (let x = 4; x < w; x += 8) for (let y = 4; y < w; y += 8) { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } });
      const mask = k.mesh(new T.PlaneGeometry(2.0, 1.6), k.mat(0xffffff, { map: maskTex, metalness: 0.5, roughness: 0.4, side: T.DoubleSide }));
      mask.rotation.y = -Math.PI / 2; mask.position.set(1.95, Y, 0);
      add({ id: 'mask', name: 'Shadow mask', obj: k.group(mask), inside: 'phosphor-dots', pull: [0, 2.2, 0], tagAt: [1.95, Y + 1.05, 0],
        say: 'The shadow mask is a metal sheet with tiny holes.',
        learn: ['Each hole lets each beam hit only its own color of dot.', 'Tap the magnifying glass to see the dots.'] });
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192;
      const cx = cv.getContext('2d'); cx.fillStyle = '#05080a'; cx.fillRect(0, 0, 256, 192);
      const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
      const scr = k.mesh(new T.PlaneGeometry(2.4, 1.8), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide, toneMapped: false }));
      scr.rotation.y = -Math.PI / 2; scr.position.set(2.15, Y, 0);
      add({ id: 'screen', name: 'Glowing screen', fixed: true, obj: k.group(scr), tagAt: [2.2, Y - 1.15, 0],
        say: 'The inside of the screen is painted with dots that glow when the beams hit them.',
        learn: ['The glowing powder is called phosphor. It glows for just a moment after each hit, so the beam has to keep coming back.'] });
      const beams = [0xff5a4a, 0x5aff8a, 0x5a9bff].map((c) => {
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3));
        const l = new T.Line(g, new T.LineBasicMaterial({ color: c, toneMapped: false })); l.frustumCulled = false; root.add(l); return l;
      });
      return { root, parts, refs: { beams, cv, cx, tex, Y, scan: 0 } };
    },
    evaluate(has, on) { return { alive: on, beam: on && has('gun'), steer: has('yoke'), mask: has('mask') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, Y = r.Y, beam = out && out.beam;
      r.cx.fillStyle = 'rgba(5,8,10,0.18)'; r.cx.fillRect(0, 0, 256, 192);
      let u = 0.5, v = 0.5;
      if (beam && out.steer) { r.scan += dt * 6; const line = Math.floor(r.scan) % 24; u = r.scan % 1; v = (line + 0.5) / 24; }
      const tz = (u - 0.5) * 2.2, ty = Y + (0.5 - v) * 1.6;
      r.beams.forEach((l, i) => {
        l.visible = !!beam;
        const p = l.geometry.attributes.position;
        p.setXYZ(0, -1.9, Y + (i - 1) * 0.1, 0); p.setXYZ(1, 2.12, ty, tz); p.needsUpdate = true;
      });
      if (beam) {
        const px = (tz / 2.4 + 0.5) * 256, py = (0.5 - (ty - Y) / 1.8) * 192;
        const g = r.cx.createRadialGradient(px, py, 0, px, py, out.mask ? 10 : 22);
        g.addColorStop(0, out.mask ? '#fff6e8' : '#ff9adf'); g.addColorStop(1, 'rgba(0,0,0,0)');
        r.cx.fillStyle = g; r.cx.fillRect(px - 24, py - 24, 48, 48);
      }
      r.tex.needsUpdate = true;
    },
  });

  world({
    id: 'phosphor-dots', name: 'Phosphor dots', zoom: '1,000×', short: 'dots',
    view: view(1.3, 2.4, 3.2, -0.6, 0.2),
    intro: 'A thousand times bigger, the screen is made of tiny red, green and blue dots. The three beams pass through a hole in the mask, and each one only lights its own color!',
    shellSay: 'The screen up close: rows of red, green and blue dots.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const dots = [], cols = [0xff3030, 0x30ff60, 0x3060ff], dotGroup = k.group();
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) for (let c = 0; c < 3; c++) {
        const m = k.cyl(0.09, 0.09, 0.04, k.glow(cols[c] & 0x3f3f3f, cols[c]), 16);
        m.rotation.x = Math.PI / 2;
        m.position.set(-1.25 + i * 0.5 + (c === 1 ? 0.12 : c === 2 ? -0.12 : 0), 0.55 + j * 0.5 + (c === 0 ? 0.14 : -0.07), -0.6);
        dotGroup.add(m); dots.push({ m, cell: i * 4 + j, c, glow: 0 });
      }
      root.add(k.at(k.box(3.2, 2.2, 0.06, k.mat(0x0b0e12, { roughness: 0.8 })), 0, 1.3, -0.66));
      root.add(dotGroup);
      add({ id: 'red', name: 'Red dot', fixed: true, obj: k.group(), tagAt: [-1.25, 2.4, -0.55],
        say: 'Red dots glow red when the red beam hits them.', learn: ['Every color is made by lighting the three dots by different amounts. Red and green together look yellow!'] });
      const maskTex = k.canvasTex(256, 192, (c, w, h) => { c.fillStyle = '#6a6f78'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.arc((i + 0.5) * (w / 6.4) + 6, h - (j + 0.5) * (h / 4.4) - 6, 9, 0, 7); c.fill(); } });
      const mask = k.mesh(new T.PlaneGeometry(3.2, 2.2), k.mat(0xffffff, { map: maskTex, transparent: true, alphaTest: 0.5, metalness: 0.5, roughness: 0.4, side: T.DoubleSide }));
      mask.position.set(0, 1.3, 0.3);
      add({ id: 'mask', name: 'Shadow mask', obj: k.group(mask), pull: [0, 2.6, 0.4], tagAt: [1.4, 2.6, 0.3],
        say: 'The mask holes line up so each beam can only reach its own color of dot.',
        learn: ['Without the mask, the red beam could hit a green dot, and the colors would get all mixed up.', 'The mask is made of a special metal that barely grows when it warms up, so the holes stay lined up.'] });
      const beams = [0xff5a4a, 0x5aff8a, 0x5a9bff].map((c) => {
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3));
        const l = new T.Line(g, new T.LineBasicMaterial({ color: c, toneMapped: false })); l.frustumCulled = false; root.add(l); return l;
      });
      return { root, parts, refs: { dots, beams, step: 0 } };
    },
    evaluate(has, on) { return { alive: on, mask: has('mask') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      if (on) r.step += dt * 5;
      const cell = Math.floor(r.step) % 24;
      r.dots.forEach((d) => {
        const hit = on && (out.mask ? d.cell === cell : Math.abs(d.cell - cell) <= 1);
        d.glow = hit ? 1 : Math.max(0, d.glow - dt * 1.8);
        d.m.material.emissiveIntensity = 0.15 + d.glow * 2.5;
      });
      const target = r.dots.find((d) => d.cell === cell && d.c === 0);
      r.beams.forEach((l, i) => {
        l.visible = !!on;
        if (!target) return;
        const p = l.geometry.attributes.position, tp = target.m.position;
        p.setXYZ(0, (i - 1) * 1.2, tp.y + 1.6, 3.2); p.setXYZ(1, tp.x + (i === 1 ? 0.12 : i === 2 ? -0.12 : 0), tp.y + (i === 0 ? 0 : -0.21), -0.58); p.needsUpdate = true;
      });
    },
  });

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
