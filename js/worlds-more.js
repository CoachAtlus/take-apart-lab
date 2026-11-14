/* More worlds inside parts: the everyday pieces kids pull off most.
 * wire (20x) > copper atoms (100,000,000x), screw, resistor, fuse, magnet, heat sink, switch, circuit board, diode,
 * polarizer, color filter. Each has one thing to DO (a dial or a pull) and one result to WATCH.
 * Uses the helpers shared by js/worlds.js (TAL.wk). */
(function () {
  const T = window.THREE;
  const { world, view, part, upd, show, halo, lattice, BLUE, PINK } = TAL.wk;
  const COPPER = 0xc8743a;
  const helix = (r, y0, y1, turns, n) => Array.from({ length: n }, (_, i) => { const f = i / (n - 1), a = f * turns * Math.PI * 2; return [Math.cos(a) * r, y0 + (y1 - y0) * f, Math.sin(a) * r]; });
  const alongX = (m) => { m.rotation.z = Math.PI / 2; return m; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (cur, want, dt, rate) => cur + (want - cur) * Math.min(1, dt * rate);
  const stepOf = (inst) => inst.dial || 0;
  const rnd = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  // Canvas texture helpers (worlds.js keeps its own private ones).
  const tex = (k, w, h, draw, rep) => {
    const t = k.canvasTex(w, h, draw);
    if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  };
  const speckle = (c, w, h, n, cols, smin, smax, seed) => {
    const r = rnd(seed || 5);
    for (let i = 0; i < n; i++) { c.fillStyle = cols[(r() * cols.length) | 0]; c.beginPath(); c.arc(r() * w, r() * h, smin + r() * (smax - smin), 0, Math.PI * 2); c.fill(); }
  };
  // Glowing light dots we move by hand (flows can't stop partway, these can).
  const lightDots = (k, root, n, color, size, through) => Array.from({ length: n }, () => {
    const m = k.mesh(new T.SphereGeometry(size || 0.09, 12, 8), new T.MeshBasicMaterial({ color, toneMapped: false, depthTest: !through }));
    if (through) m.renderOrder = 6;
    m.userData.noPick = true; root.add(m); return m;
  });
  // Labels whose words change with the state: build them all, show one.
  const labelSet = (k, root, items, x, y, z, size) => items.map(([txt, bg]) => {
    const l = k.label(txt, { size: size || 0.2, bg }); l.position.set(x, y, z); l.visible = false; root.add(l); return l;
  });
  const pick = (labels, i) => labels.forEach((l, n) => { l.visible = n === i; });
  const GREEN = 'rgba(30,140,80,0.92)', RED = 'rgba(190,45,40,0.92)', ORANGE = 'rgba(200,110,20,0.92)', BLUEBG = 'rgba(30,110,190,0.92)', GREY = 'rgba(70,76,90,0.92)';
  const bulbGlow = (k) => { const m = k.mat(0x504e48, { emissive: 0xffe9a0, emissiveIntensity: 0, transparent: true, opacity: 0.92, roughness: 0.2 }); m.userData.selfLit = true; return m; };

  // =====================================================================  wire
  world({
    id: 'wire-inside', name: 'Inside a wire', zoom: '20×', short: 'wire',
    view: view(1.0, 3.0, 3.8),
    dial: {
      label: 'Wire size',
      steps: [
        { name: 'Thin', v: 0.4, heat: 1, say: 'A thin wire. All that electricity has to squeeze through a tiny space, and the wire gets hot and glows!' },
        { name: 'Medium', v: 0.7, heat: 0.35, say: 'A medium wire. A little warm, but it copes.' },
        { name: 'Thick', v: 1, heat: 0, say: 'A thick wire. The electricity has lots of room, so the wire stays cool.' },
      ],
    },
    intro: 'This is a wire, 20 times bigger, with its coats peeled back. The electricity rides inside the shiny copper strands. Tap Wire size to make the copper thin, medium or thick, and watch which one gets hot!',
    learn: [
      'A wire is like a pipe for electricity. A fat pipe lets lots of water flow easily. A skinny pipe has to squeeze it through.',
      'Squeezing electricity through a thin wire makes friction, and friction makes heat. A thin wire gets hot, and if it gets too hot it glows. A thick wire carries the same electricity and stays cool.',
      'That is why a big TV has a thick power cord, while a tiny gadget can use a hair-thin wire. Electricians pick the wire size to match how much electricity it will carry.',
      'A fuse is a thin wire on purpose. It heats up first and melts, before the other wires can get hurt.',
    ],
    shellSay: 'This is a wire, peeled open.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s)), Y = 1.0;
      const cuTex = tex(k, 64, 128, (c, w, h) => {
        c.fillStyle = '#c8743a'; c.fillRect(0, 0, w, h);
        const r = rnd(3);
        for (let i = 0; i < 40; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,200,150,0.45)' : 'rgba(110,50,20,0.4)'; c.fillRect(r() * w, 0, 1 + r() * 2, h); }
      });
      const cu = k.metal(0xffffff, { map: cuTex, roughness: 0.28, emissive: 0xff4a10, emissiveIntensity: 0 }); cu.userData.selfLit = true;
      const strands = k.group(), sg = k.group(); sg.position.set(0, Y, 0); strands.add(sg);
      const spots = [[0, 0]].concat(Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2) * 0.19, Math.sin((i / 6) * Math.PI * 2) * 0.19]));
      spots.forEach(([y, z]) => sg.add(k.at(alongX(k.cyl(0.09, 0.09, 4.6, cu, 14)), 0, y, z)));
      add({ id: 'copper', name: 'Copper strands', obj: strands, inside: 'copper-atoms', blockedBy: ['insulation'], pull: [0, 1.4, 1.4], tagAt: [1.9, Y + 0.5, 0],
        say: 'Copper strands carry the electricity!',
        learn: ['Copper lets electricity flow very easily. It is one of the best conductors there is.',
          'Think of the copper as a pipe for electricity. A fatter pipe carries more with less fuss. Try the Wire size button!',
          'Many thin strands bend better than one thick one, so the cord does not snap when you wiggle it. It is like a rope made of thread.',
          'Tap Look inside to see the copper atoms.'] });
      add({ id: 'insulation', name: 'Inner coating', obj: k.group(k.at(alongX(k.cyl(0.42, 0.42, 3.4, k.mat(0xc0392b, { roughness: 0.4, metalness: 0.05 }), 32)), -0.6, Y, 0)), blockedBy: ['jacket'], pull: [-1.2, 1.6, -1.2], tagAt: [0.6, Y + 0.65, 0],
        say: 'This colored coating keeps the electricity inside the copper.',
        job: 'It stops the electricity from escaping, and keeps your fingers safe.',
        learn: ['Plastic does not let electricity through, so it is called an insulator. It is like the wall of a water pipe: the water stays inside.',
          'The colors are a code that tells electricians which wire is which.',
          'If this coat cracks, bare copper can touch something it should not, and the electricity takes a shortcut. That is why old, cracked cords get thrown away.'] });
      add({ id: 'jacket', name: 'Outer jacket', obj: k.group(k.at(alongX(k.cyl(0.56, 0.56, 2.4, k.mat(0x1d1d20, { roughness: 0.7 }), 32)), -1.1, Y, 0)), pull: [-1.6, 2.2, 0], tagAt: [-1.1, Y + 0.85, 0],
        say: 'The tough outer jacket protects the wire from bumps and scrapes.',
        job: 'It keeps the wire safe from bumps, scrapes and water.',
        learn: ['It is made of rubbery plastic that bends without cracking.',
          'It also keeps out water, which could let electricity leak where it should not.',
          'A jacket is like a raincoat over a sweater. The sweater keeps you warm, and the raincoat keeps the sweater safe.'] });
      const beads = [];
      spots.forEach(([y, z], row) => lightDots(k, root, 6, BLUE, 0.07, true).forEach((m, n) => beads.push({ m, row, y, z, ph: n / 6 })));
      const lab = labelSet(k, root, [['Thin: squeezed and HOT!', RED], ['Medium: a little warm', ORANGE], ['Thick: stays cool', GREEN], ['No copper, no electricity', GREY]], 0, 2.5, 0, 0.22);
      return { root, parts, refs: { beads, sg, cu, lab, s: 1, heat: 0, clock: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on && has('copper'), size: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, st = inst.def.dial.steps[stepOf(inst)], alive = !!(out && out.alive);
      r.s = ease(r.s, st.v, dt, 5); r.heat = ease(r.heat, alive ? st.heat : 0, dt, 2.5);
      r.sg.scale.set(1, r.s, r.s);
      inst.byId.copper.meshes.forEach((m) => { m.material.emissiveIntensity = r.heat * 1.1; m.material.emissive.setHex(r.heat > 0.7 ? 0xff7a2a : 0xff4a10); });
      if (alive) r.clock += dt * (0.1 + 0.05 * (1 - r.heat));
      r.beads.forEach((b) => {
        b.m.visible = alive;
        b.m.position.set(-2.3 + ((b.ph + r.clock) % 1) * 4.6, 1.0 + b.y * r.s, b.z * r.s);
        b.m.scale.setScalar(1 + (1 - r.s) * 0.6);
      });
      pick(r.lab, !alive ? 3 : stepOf(inst));
    },
  });

  world({
    id: 'copper-atoms', name: 'Copper atoms', zoom: '100,000,000×', short: 'copper',
    view: view(1.1, 3.0, 3.6),
    dial: {
      label: 'Push',
      steps: [
        { name: 'Off', v: 0, say: 'No push. The free electrons just wander around with nowhere in particular to go. The bulb is off.' },
        { name: 'Gentle', v: 0.5, say: 'A gentle push. The whole sea of electrons drifts along slowly. The bulb glows a little.' },
        { name: 'Strong', v: 1, say: 'A strong push! The electrons drift faster and more of them pass by each second. The bulb is bright.' },
      ],
    },
    intro: 'A hundred million times bigger! In copper, every atom lets one electron go free. The free electrons drift around like a sea. Tap Push to give them no push, a gentle push, or a strong one, and watch the bulb.',
    learn: [
      'The copper atoms stay in neat rows. The free electrons wander between them like water in a sea.',
      'Push with a battery and the whole sea shifts one way. The harder the push, the more electricity flows, and the brighter the bulb.',
      'Each electron only drifts slowly, slower than a snail. But the push passes from one electron to the next almost as fast as light, like a line of dominoes falling.',
    ],
    shellSay: 'These are copper atoms in a neat crystal pattern.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const cuTex = tex(k, 128, 128, (c, w, h) => { c.fillStyle = '#c8743a'; c.fillRect(0, 0, w, h); speckle(c, w, h, 70, ['rgba(255,210,160,0.5)', 'rgba(120,60,25,0.35)'], 2, 7, 9); });
      const shell = lattice(k, 6, 3, 3, 0.85, 0.3, () => ({ r: 0.24, mat: k.metal(0xffffff, { map: cuTex, roughness: 0.3 }) }), null);
      root.add(shell);
      const p = shell.userData.pos(2, 2, 2);
      add({ id: 'atom', name: 'Copper atom', fixed: true, obj: k.group(k.at(k.sphere(0.28, k.metal(0xe79a5c, { roughness: 0.2 }), 24), p[0], p[1], p[2])), tagAt: [p[0], p[1] + 0.5, p[2]],
        say: 'This is a copper atom. In a metal, atoms share their outer electrons with everyone.',
        learn: ['Each copper atom lets one electron go free. The free electrons drift around like a sea.',
          'The atoms stay in place, like the sand at the bottom of the sea. Only the free electrons move.',
          'Push electricity in one end, and the whole sea moves a little, so the push reaches the other end almost right away.'] });
      const seas = [];
      for (let i = 0; i < 9; i++) {
        const y = 0.5 + (i % 3) * 0.85, z = -0.85 + Math.floor(i / 3) * 0.85;
        seas.push(k.flow([[-2.5, y, z + 0.4], [-1.2, y + 0.4, z + 0.4], [0, y, z + 0.42], [1.2, y + 0.4, z + 0.4], [2.5, y, z + 0.4]], { count: 5, color: BLUE, size: 0.15, phase: i / 9 }));
      }
      const eInner = k.group(k.sphere(0.11, k.glow(0x2a48ff, 0x4f8dff), 16));
      add({ id: 'electron', name: 'Free electron', fixed: true, obj: k.group(eInner), tagAt: [-2.2, 2.6, 0.6],
        say: 'This is a free electron, drifting through the copper.',
        learn: ['Moving electrons are electricity. Copper has so many free ones that electricity flows through it easily.',
          'A free electron bumps and wiggles between the atoms, like a kid in a crowded sea of kids. A push makes the whole crowd drift one way.',
          'Rubber and plastic hold on to their electrons tightly. Nothing is free to move, so electricity cannot flow. That is why they make good coats for wires.'] });
      root.add(...seas);
      // the bulb at the end of the wire: the result to watch
      const bm = bulbGlow(k), bulb = k.at(k.sphere(0.32, bm, 24), 3.3, 1.4, 0), hl = halo(k, 3.3, 1.4, 0, 0xffe27a, 2.2); hl.visible = true; hl.material.opacity = 0;
      root.add(bulb, k.at(k.cyl(0.12, 0.16, 0.22, k.metal(0x9aa0aa), 16), 3.3, 1.05, 0), hl);
      const lab = labelSet(k, root, [['No push: bulb off', GREY], ['Gentle push: bulb glows', ORANGE], ['Strong push: bulb bright!', GREEN]], 3.0, 0.45, 0, 0.18);
      const wl = k.label('What you see', { size: 0.17 }); wl.position.set(3.3, 2.1, 0); root.add(wl);
      const path = new T.CatmullRomCurve3([[-2.5, 1.2, 0.85], [-1.2, 1.6, 0.85], [0, 1.2, 0.87], [1.2, 1.6, 0.85], [2.5, 1.2, 0.85]].map((q) => new T.Vector3(q[0], q[1], q[2])));
      return { root, shell: [shell], parts, refs: { seas, eInner, path, clock: 0, bm, hl, lab, lv: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on, push: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, v = inst.def.dial.steps[stepOf(inst)].v;
      r.lv = ease(r.lv, v, dt, 4);
      r.clock += dt * r.lv;
      if (v > 0 || r.lv > 0.02) upd(r.seas, dt, 0.05 * r.lv);
      const jig = 0.05 * (1 - r.lv * 0.6);
      r.eInner.position.copy(r.path.getPointAt((r.clock * 0.05) % 1)).add(new T.Vector3(Math.sin(t * 9) * jig, Math.cos(t * 11) * jig, 0));
      r.bm.emissiveIntensity = r.lv * 2.6; r.hl.material.opacity = r.lv; r.hl.scale.setScalar(1.2 + r.lv * 1.4);
      pick(r.lab, stepOf(inst));
    },
  });

  // =====================================================================  screw
  world({
    id: 'screw-inside', name: 'How a screw works', zoom: '10×', short: 'screw',
    view: view(1.6, 3.0, 3.6),
    dial: {
      label: 'Turn the nut',
      steps: [
        { name: 'Tighten', dir: 1, say: 'Turning the nut tighter. It climbs the ramp, and the boards get squeezed together!' },
        { name: 'Loosen', dir: -1, say: 'Turning the nut the other way. It slides back down the ramp, and the squeeze lets go.' },
      ],
    },
    intro: 'This is a screw, 10 times bigger, holding two boards. Its thread is a ramp wrapped around and around. Tap Turn the nut to tighten it and squeeze the boards, or loosen it and let them go.',
    learn: [
      'A screw is a ramp wrapped around a stick, like a spiral slide.',
      'Walking up a long, gentle ramp is easier than climbing straight up. A screw does the same thing: each turn moves it only a tiny bit, so a small twist makes a big squeeze.',
      'This idea is called an inclined plane. It is one of the six simple machines.',
    ],
    shellSay: 'This is a big screw.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const steelTex = tex(k, 64, 128, (c, w, h) => { c.fillStyle = '#c3c8cf'; c.fillRect(0, 0, w, h); const r = rnd(2); for (let i = 0; i < 50; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(90,100,110,0.25)'; c.fillRect(0, r() * h, w, 1 + r() * 2); } });
      const steel = k.metal(0xffffff, { map: steelTex, roughness: 0.25 });
      const woodTex = tex(k, 256, 64, (c, w, h) => { c.fillStyle = '#c99a5b'; c.fillRect(0, 0, w, h); const r = rnd(8); for (let i = 0; i < 28; i++) { c.strokeStyle = r() < 0.5 ? 'rgba(120,75,35,0.4)' : 'rgba(235,190,120,0.4)'; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(0, r() * h); c.bezierCurveTo(w * 0.3, r() * h, w * 0.6, r() * h, w, r() * h); c.stroke(); } });
      const wood = k.mat(0xffffff, { map: woodTex, roughness: 0.8 });
      add({ id: 'head', name: 'Head', fixed: true, obj: k.group(k.at(k.cyl(0.8, 0.8, 0.3, steel, 40), 0, 3.15, 0), k.at(k.box(1.2, 0.08, 0.16, 0x2a2a2a), 0, 3.31, 0), k.at(k.box(0.16, 0.08, 1.2, 0x2a2a2a), 0, 3.31, 0)), tagAt: [0, 3.65, 0],
        say: 'The head is where the screwdriver grips.',
        learn: ['The cross shape lets the screwdriver push and turn at the same time without slipping out.',
          'The head is wider than the hole, so it works like a hat that stops the screw from sliding all the way through the boards.',
          'Heads come in many shapes: cross, slot, star, hex. Each one fits a matching screwdriver, like a key in a lock.'] });
      add({ id: 'thread', name: 'Thread', fixed: true, obj: k.group(k.at(k.cyl(0.32, 0.32, 2.75, steel, 32), 0, 1.6, 0), k.tube(helix(0.38, 0.35, 2.95, 9, 260), 0.07, steel)), tagAt: [0.75, 2.4, 0.3],
        say: 'The thread is a ramp wrapped around the screw, like a spiral slide.',
        learn: ['Walking up a long gentle ramp is easier than climbing straight up. A screw uses the same trick.',
          'Each turn pulls the screw in just a little, so a small twist makes a big squeeze.',
          'This idea is called an inclined plane. It is one of the six simple machines.'] });
      add({ id: 'point', name: 'Point', fixed: true, obj: k.group(k.rot(k.at(k.cyl(0.32, 0.02, 0.4, steel, 24), 0, 0.03, 0), 0, 0, 0)), tagAt: [0.6, 0.15, 0.3],
        say: 'The pointy end helps the screw start into the hole.',
        learn: ['A point is small, so all the push is on one tiny spot and it digs in easily. It is like poking with a pencil tip instead of your whole hand.',
          'Once the point gets going, the thread takes over and pulls the screw in by itself as you turn.',
          'Some screws have a sharper point that drills its own hole in wood or metal.'] });
      const nutIn = k.group(k.cyl(0.95, 0.95, 0.4, k.metal(0xa9afb7, { roughness: 0.3 }), 6));
      const nut = k.group(nutIn);
      add({ id: 'nut', name: 'Nut', obj: nut, pull: [2.4, -0.4, 0.4], tagAt: [1.6, 0.7, 0.8],
        say: 'A nut has a matching ramp inside it. Tap Turn the nut to spin it!',
        breaks: 'With the nut gone, nothing holds the lower board. It slides right off the screw!',
        learn: ['As it turns, the two ramps slide along each other, and the nut climbs up or down.',
          'Nuts and bolts hold things together without glue, so they can come apart again later.',
          'The six flat sides are for a wrench to grab. A round nut would be slippery, like trying to turn a ball.'] });
      nutIn.position.y = 0.9;
      const board = (y) => k.at(k.box(1.9, 0.3, 1.5, wood), 0, y, 0);
      add({ id: 'boardTop', name: 'Top board', fixed: true, obj: k.group(board(2.85)), tagAt: [1.7, 3.0, 0.5],
        say: 'Two boards, held together by the screw. The head pushes down on this one.',
        learn: ['The screw goes through a hole in both boards. The head holds the top one down.',
          'The screw only needs to squeeze. It does not need glue or nails.',
          'Squeeze the boards hard enough and friction keeps them from sliding apart, like two hands pressed palm to palm.'] });
      const lowBoard = k.group(board(0));
      add({ id: 'boardLow', name: 'Lower board', fixed: true, obj: k.group(lowBoard), tagAt: [1.7, 2.0, 0.6],
        say: 'The nut pushes this board up against the top one. The tighter the nut, the harder they squeeze.',
        learn: ['When the nut is loose, this board rattles and can slide away.',
          'Tight, it is pressed up against the other board and cannot move.',
          'Builders squeeze boards together this way for decks, bikes and chairs.'] });
      const lab = labelSet(k, root, [['Loose: the boards rattle', RED], ['Turning...', ORANGE], ['Tight! The boards are squeezed', GREEN], ['No nut: the board fell off!', RED]], -2.2, 0.5, 0.8, 0.2);
      return { root, parts, refs: { nutIn, lowBoard, lab, pos: 0.9, by: 1.25, vy: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on && has('nut'), dir: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, dir = inst.def.dial.steps[stepOf(inst)].dir, hasNut = !!(out && out.alive), TIGHT = 2.2, LOOSE = 0.8;
      if (hasNut) {
        r.pos = clamp(r.pos + dir * dt * 0.55, LOOSE, TIGHT);
        r.nutIn.visible = true;
        r.by = r.pos + 0.35; r.vy = 0;
      } else {
        r.vy += 9 * dt; r.by = Math.max(0.3, r.by - r.vy * dt);
        if (r.by === 0.3) r.vy = 0;
      }
      r.nutIn.position.y = r.pos;
      r.nutIn.rotation.y = r.pos * ((Math.PI * 2 * 9) / 2.6);
      const loose = hasNut && r.pos < 1.4;
      r.lowBoard.position.y = r.by + (loose ? Math.sin(t * 14) * 0.015 : 0);
      r.lowBoard.rotation.z = loose ? Math.sin(t * 11) * 0.02 : 0;
      pick(r.lab, !hasNut ? 3 : r.pos >= TIGHT - 0.02 ? 2 : r.pos <= LOOSE + 0.1 ? 0 : 1);
    },
  });

  // =====================================================================  resistor
  const BANDS = [['#8b4513', '#1b1b1b', '#8b4513'], ['#8b4513', '#1b1b1b', '#d63a2a'], ['#8b4513', '#1b1b1b', '#e67e22']];
  world({
    id: 'resistor-inside', name: 'Inside a resistor', zoom: '20×', short: 'resistor',
    view: view(1.0, 3.5, 4.2),
    dial: {
      label: 'Stripes',
      steps: [
        { name: 'Weak', v: 1, say: 'Brown, black, brown. That code means 100 ohms, a small squeeze. Lots of electricity gets through, so the bulb is bright.' },
        { name: 'Medium', v: 0.4, say: 'Brown, black, red. That code means 1,000 ohms, a bigger squeeze. Less electricity gets through, so the bulb is dimmer.' },
        { name: 'Strong', v: 0.1, say: 'Brown, black, orange. That code means 10,000 ohms, a huge squeeze. Only a little electricity gets through, so the bulb is very dim.' },
      ],
    },
    intro: 'This is a resistor, 20 times bigger. It slows electricity down so the bulb does not get too much. Tap Stripes to pick a different color code and watch the bulb get brighter or dimmer.',
    learn: [
      'A resistor is like a narrow gap in a hallway. The narrower it is, the fewer kids can squeeze through at once.',
      'The colored stripes are a code for how narrow the gap is. Each color is a number, and the last big stripe says how many zeros to add. Brown, black, brown is 100. Brown, black, red is 1,000.',
      'The strength is measured in ohms. More ohms means more squeeze and less electricity. That is how a TV gives each part just the right amount.',
    ],
    shellSay: 'This is a resistor.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s)), Y = 1.0;
      const ceramic = tex(k, 128, 128, (c, w, h) => { c.fillStyle = '#efeadc'; c.fillRect(0, 0, w, h); speckle(c, w, h, 160, ['rgba(190,180,160,0.5)', 'rgba(255,255,250,0.7)', 'rgba(150,140,120,0.3)'], 0.8, 2.6, 4); }, [3, 1]);
      add({ id: 'core', name: 'Ceramic core', fixed: true, obj: k.group(k.at(alongX(k.cyl(0.35, 0.35, 3.0, k.mat(0xffffff, { map: ceramic, roughness: 0.65 }), 32)), 0, Y, 0)), tagAt: [-1.0, Y - 0.65, 0.4],
        say: 'The white core is ceramic, like a tiny coffee mug. It holds the spiral and does not burn.',
        learn: ['Ceramic is baked clay. It does not melt or burn at the heat a resistor makes.',
          'It does not let electricity through either, so the electricity has to follow the spiral wrapped around it, not shortcut through the middle.',
          'Ceramic is also a good place to hold heat for a moment, so the spiral does not change temperature too quickly.'] });
      const spiral = helix(0.36, -1.3, 1.3, 7, 220).map(([a, b, c]) => [b, Y + a, c]);
      const carbon = tex(k, 64, 64, (c, w, h) => { c.fillStyle = '#26272b'; c.fillRect(0, 0, w, h); speckle(c, w, h, 120, ['#3c3e44', '#17181b', '#4c4f57'], 0.6, 1.8, 6); }, [8, 1]);
      const filmMat = k.mat(0xffffff, { map: carbon, roughness: 0.35, metalness: 0.3, emissive: 0xff6a2a, emissiveIntensity: 0 }); filmMat.userData.selfLit = true;
      add({ id: 'film', name: 'Carbon spiral', fixed: true, obj: k.group(k.tube(spiral, 0.04, filmMat)), tagAt: [0.5, Y + 0.7, 0.4],
        say: 'A thin spiral of carbon makes the electricity squeeze through a long, narrow path.',
        learn: ['The longer and thinner the path, the more it slows the electricity.',
          'Squeezing through makes a little heat. That is why the spiral glows warm.',
          'Carbon is the same stuff as pencil lead. It lets electricity through, but not as easily as copper does.',
          'Factories cut the spiral with a laser to get exactly the right amount of slowing.'] });
      const capM = k.metal(0xc9ced6);
      const caps = k.group(k.at(alongX(k.cyl(0.42, 0.42, 0.3, capM, 32)), -1.55, Y, 0), k.at(alongX(k.cyl(0.42, 0.42, 0.3, capM, 32)), 1.55, Y, 0),
        k.at(alongX(k.cyl(0.04, 0.04, 1.1, k.metal(0xd6dbe2), 8)), -2.25, Y, 0), k.at(alongX(k.cyl(0.04, 0.04, 1.1, k.metal(0xd6dbe2), 8)), 2.25, Y, 0));
      add({ id: 'caps', name: 'Metal caps', fixed: true, obj: caps, tagAt: [1.9, Y + 0.7, 0],
        say: 'Metal caps connect the spiral to the legs.',
        learn: ['Each cap squeezes tightly on one end of the spiral, so the electricity can step from the leg onto the carbon.',
          'The legs are made of metal that bends and can be soldered to a circuit board.',
          'Think of the caps as doors where the electricity enters and leaves the narrow hallway.'] });
      // stripes go around the resistor: canvas width wraps around, height runs along its length
      const paint = (c, w, h, set) => {
        c.fillStyle = '#d9c39a'; c.fillRect(0, 0, w, h);
        speckle(c, w, h, 90, ['rgba(255,240,210,0.35)', 'rgba(150,120,70,0.3)'], 0.6, 1.8, 11);
        [[set[0], 0.2], [set[1], 0.33], [set[2], 0.46], ['#d4af37', 0.8]].forEach(([col, y]) => { c.fillStyle = col; c.fillRect(0, y * h, w, h * 0.07); });
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(w * 0.18, 0, w * 0.1, h);
      };
      const coatTex = k.canvasTex(64, 256, (c, w, h) => paint(c, w, h, BANDS[0]));
      const coat = k.mesh(new T.CylinderGeometry(0.48, 0.48, 2.9, 40, 1, true), k.mat(0xffffff, { map: coatTex, roughness: 0.45, side: T.DoubleSide }));
      coat.position.set(0, Y, 0);
      const coatG = k.group(coat); coat.rotation.set(0, 0, Math.PI / 2);
      add({ id: 'coat', name: 'Painted coat', obj: coatG, pull: [0, 1.6, 1.2], tagAt: [0, Y + 0.95, 0],
        say: 'The painted coat protects the inside. The colored stripes are a code.',
        job: 'The stripes tell you which resistor it is, and the paint protects the carbon. It works without it.',
        learn: ['Each color stands for a number. The stripes tell how strongly the resistor slows the electricity.',
          'Black is 0, brown is 1, red is 2, orange is 3, all the way up to white for 9.',
          'The gold stripe is how exact the number is. Gold means it could be off by about 5 out of every 100.',
          'It is like a name tag. A real resistor is so tiny that printing numbers on it would be too hard to read.'] });
      const flow = k.flow(spiral, { count: 30, color: BLUE, size: 0.12 });
      // battery on the left, bulb on the right
      const bm = bulbGlow(k), hl = halo(k, 3.7, Y, 0, 0xffe27a, 2.2); hl.visible = true; hl.material.opacity = 0;
      const wireM = k.metal(0xd6dbe2);
      root.add(flow, k.at(k.sphere(0.34, bm, 24), 3.7, Y, 0), hl, k.at(alongX(k.cyl(0.04, 0.04, 0.6, wireM, 8)), 3.1, Y, 0),
        k.at(k.box(0.7, 0.5, 0.5, k.mat(0x2a6fb8, { roughness: 0.4 })), -3.7, Y, 0), k.at(alongX(k.cyl(0.04, 0.04, 0.55, wireM, 8)), -3.1, Y, 0));
      const lab = labelSet(k, root, [['What you see: bright!', GREEN], ['What you see: dim', ORANGE], ['What you see: very dim', RED]], 3.7, Y + 0.85, 0, 0.19);
      const bl = k.label('Battery', { size: 0.16 }); bl.position.set(-3.7, Y + 0.6, 0); root.add(bl);
      return { root, parts, refs: { flow, filmMat, bm, hl, lab, coatTex, paint, shown: -1, lv: 1 } };
    },
    evaluate(has, on, inst) { return { alive: on, band: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, i = stepOf(inst), v = inst.def.dial.steps[i].v;
      if (r.shown !== i) { r.shown = i; const cv = r.coatTex.image; r.paint(cv.getContext('2d'), cv.width, cv.height, BANDS[i]); r.coatTex.needsUpdate = true; }
      r.lv = ease(r.lv, v, dt, 4);
      inst.byId.film.meshes.forEach((m) => { m.material.emissiveIntensity = 0.2 + r.lv * 0.9; });
      r.bm.emissiveIntensity = r.lv * 2.6; r.hl.material.opacity = Math.min(1, r.lv * 1.2); r.hl.scale.setScalar(1 + r.lv * 1.5);
      r.flow.visible = true; upd([r.flow], dt, 0.02 + r.lv * 0.1);
      pick(r.lab, i);
    },
  });

  // =====================================================================  fuse
  world({
    id: 'fuse-inside', name: 'Inside a fuse', zoom: '20×', short: 'fuse',
    view: view(1.1, 3.3, 4.0),
    dial: {
      label: 'Electricity',
      steps: [
        { name: 'Normal', say: 'Normal electricity. The thin wire stays cool and the little TV works fine.' },
        { name: 'Almost too much', say: 'Almost too much. The thin wire glows warm, but it holds. This is the edge of the safe zone.' },
        { name: 'Too much', say: 'Way too much electricity! Watch the thin wire heat up. It is the weak spot on purpose.' },
        { name: 'Too much, no fuse', say: 'Same too much electricity, but this time with a thick wire instead of a fuse. Nothing weak to melt. Watch the TV!' },
      ],
    },
    intro: 'This is a fuse, 20 times bigger, protecting a little TV. Tap Electricity to turn it up. Is there a safe zone? What happens at the melt point? Then try it with no fuse at all.',
    learn: [
      'A fuse is a safety guard. It is the weak link in the chain, so it breaks first and keeps everything else safe.',
      'Electricity heats a wire. A little is fine. Too much heats the thin fuse wire until it melts, and that breaks the loop so the electricity stops.',
      'Without the fuse, the too-much electricity would keep going and heat up the TV instead, and could even start a fire. A fuse costs a few cents. A TV costs a lot more.',
      'A melted fuse cannot be fixed. You put in a new one. Circuit breakers in a house do the same job, but you can switch them back on.',
    ],
    shellSay: 'This is a fuse.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s)), Y = 1.0;
      const glassTex = tex(k, 128, 64, (c, w, h) => {
        c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(210,235,250,0.18)'; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(w * 0.18, 0, w * 0.05, h); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(w * 0.26, 0, w * 0.02, h);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(w * 0.7, 0, w * 0.03, h);
      });
      const gmat = k.mat(0xffffff, { map: glassTex, transparent: true, opacity: 0.8, roughness: 0.05, metalness: 0.2, depthWrite: false, side: T.DoubleSide });
      add({ id: 'glass', name: 'Glass tube', obj: k.group(k.at(alongX(k.cyl(0.5, 0.5, 2.9, gmat, 40, true)), 0, Y, 0)), pull: [0, 1.7, 0], tagAt: [0, Y + 0.85, 0],
        say: 'The glass tube holds the wire in place, and lets you see if the wire has melted.',
        job: 'It keeps the thin wire straight and lets you see if it melted. The wire still works without it.',
        learn: ['Glass does not let electricity through, and it does not melt at the heat of the wire. So the fuse can melt safely inside.',
          'You can look through the glass to check if the thin wire is broken. A broken wire means the fuse did its job.',
          'The glass also keeps the little bit of melted metal from splashing out onto things nearby.'] });
      const capMat = k.metal(0xc9ced6);
      add({ id: 'caps', name: 'Metal caps', fixed: true, obj: k.group(k.at(alongX(k.cyl(0.56, 0.56, 0.45, capMat, 40)), -1.6, Y, 0), k.at(alongX(k.cyl(0.56, 0.56, 0.45, capMat, 40)), 1.6, Y, 0)), tagAt: [-1.6, Y + 0.95, 0],
        say: 'Metal caps clip into the holder and connect the wire.',
        learn: ['Each cap holds one end of the thin wire, and clips into the fuse holder so electricity can come in one side and out the other.',
          'The caps are metal so electricity flows through them easily. Only the thin wire in the middle is meant to be weak.',
          'The caps stay cool even when the wire melts, so you can see where the fuse is meant to break.'] });
      const wireMat = k.mat(0xb8bdc4, { metalness: 0.8, roughness: 0.3, emissive: 0xff3a00, emissiveIntensity: 0 }); wireMat.userData.selfLit = true;
      const wire = k.at(alongX(k.cyl(0.03, 0.03, 2.8, wireMat, 8)), 0, Y, 0);
      const stubs = k.group(k.at(alongX(k.cyl(0.03, 0.03, 1.1, k.metal(0x6a6f78), 8)), -0.85, Y, 0), k.at(alongX(k.cyl(0.03, 0.03, 1.1, k.metal(0x6a6f78), 8)), 0.85, Y, 0),
        k.at(k.sphere(0.07, k.metal(0x6a6f78), 10), -0.3, Y, 0), k.at(k.sphere(0.07, k.metal(0x6a6f78), 10), 0.3, Y, 0));
      stubs.visible = false;
      const bar = k.at(alongX(k.cyl(0.12, 0.12, 2.8, k.metal(COPPER, { roughness: 0.3 }), 14)), 0, Y, 0); bar.visible = false;
      add({ id: 'fuseWire', name: 'Thin wire', fixed: true, obj: k.group(wire, stubs, bar), tagAt: [0.4, Y - 0.65, 0.3],
        say: 'This thin wire is the weak spot, on purpose!',
        learn: ['Electricity heats a wire. Too much electricity heats this thin one until it melts.',
          'Melting breaks the loop, so the electricity stops before anything else gets too hot. Think of it as the weakest link in a chain.',
          'The wire is made of a metal that melts at just the right heat. A bit thinner, or a different metal, makes a different fuse.',
          'Fuses are rated in amps, which says how much electricity they allow. A 5 amp fuse melts when much more than 5 amps flows for long enough.'] });
      // the little TV the fuse protects
      const screenTex = tex(k, 128, 96, (c, w, h) => {
        const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ec6ff'); g.addColorStop(1, '#bfe9ff'); c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(w * 0.78, h * 0.28, 12, 0, 7); c.fill();
        c.fillStyle = '#4caf50'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, h * 0.7); c.quadraticCurveTo(w * 0.4, h * 0.45, w, h * 0.8); c.lineTo(w, h); c.fill();
      });
      const scr = new T.MeshBasicMaterial({ map: screenTex, toneMapped: false });
      const screen = k.mesh(new T.PlaneGeometry(1.15, 0.85), scr); screen.position.set(3.7, 1.3, 0.28); screen.userData.noPick = true;
      add({ id: 'tv', name: 'Little TV', fixed: true, obj: k.group(k.at(k.rbox(1.4, 1.1, 0.5, k.mat(0x2b2e34, { roughness: 0.5 }), 0.06), 3.7, 1.3, 0), k.at(k.box(0.7, 0.1, 0.4, k.mat(0x2b2e34)), 3.7, 0.7, 0)), tagAt: [3.7, 2.15, 0],
        say: 'This little TV is what the fuse protects.',
        learn: ['Parts inside a TV can only take so much electricity. Too much and they overheat and break.',
          'The fuse is cheap and easy to replace. The TV is not. So the fuse is built to give up first.',
          'Almost everything that plugs into a wall has a fuse or a circuit breaker somewhere to guard it.'] });
      const smoke = lightDots(k, root, 6, 0x888c94, 0.12); smoke.forEach((m) => { m.visible = false; });
      const flow = k.flow([[-2.9, Y, 0], [2.9, Y, 0]], { count: 16, color: BLUE, size: 0.15 });
      const flash = halo(k, 0, Y, 0, 0xffd27a, 2.4);
      const wallBox = k.at(k.box(0.6, 0.6, 0.6, k.mat(0x6a6f78, { roughness: 0.5 })), -3.6, Y, 0);
      const wl = k.label('Wall power', { size: 0.17 }); wl.position.set(-3.6, Y + 0.65, 0);
      const wm = k.metal(0xd6dbe2);
      root.add(flow, flash, screen, ...smoke, wallBox, wl, k.at(alongX(k.cyl(0.04, 0.04, 0.9, wm, 8)), -2.5, Y, 0), k.at(alongX(k.cyl(0.04, 0.04, 1.1, wm, 8)), 2.65, Y, 0));
      const lab = labelSet(k, root, [['Safe: the fuse stays cool', GREEN], ['Warm, but the fuse holds', ORANGE], ['Too much! The wire is heating up', RED], ['Snap! The fuse melted. The TV is safe', GREEN], ['No fuse: the TV burns!', RED]], 0, 2.55, 0, 0.21);
      return { root, parts, refs: { wire, stubs, bar, wireMat, flow, flash, scr, screen, smoke, lab, heat: 0, tvHeat: 0, melted: false, flashT: 0, last: -1, said: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on, step: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, st = stepOf(inst);
      if (r.last !== st) { r.last = st; r.heat = 0; r.melted = false; r.tvHeat = 0; r.said = 0; }
      if (st === 0) r.heat = ease(r.heat, 0, dt, 2);
      else if (st === 1) r.heat = ease(r.heat, 0.55, dt, 1.2);
      else if (st === 2 && !r.melted) {
        r.heat += dt * 0.4;
        if (r.heat >= 1) { r.melted = true; r.flashT = 0.6; TAL.say('Snap! The thin wire melted. That broke the loop and stopped the electricity, so nothing else got hurt. The TV is safe.'); }
      }
      const noFuse = st === 3;
      if (noFuse) { r.tvHeat = Math.min(1, r.tvHeat + dt * 0.35); if (r.tvHeat >= 1 && !r.said) { r.said = 1; TAL.say('Oh no! With no fuse, all that electricity went into the TV. It overheated and broke. That is why we use fuses.'); } }
      const mat = inst.byId.fuseWire.meshes[0].material;
      mat.emissiveIntensity = r.melted ? 0 : r.heat * 2.2; mat.emissive.setHex(r.heat > 0.7 ? 0xffd27a : 0xff3a00);
      r.wire.visible = !r.melted && !noFuse; r.stubs.visible = r.melted && !noFuse; r.bar.visible = noFuse;
      const broken = noFuse && r.tvHeat >= 1;
      const tvOn = !r.melted && !broken;
      r.scr.color.setScalar(tvOn ? 1 : 0.04);
      if (noFuse && r.tvHeat > 0.3 && !broken) r.scr.color.setRGB(1, 1 - r.tvHeat, 1 - r.tvHeat);
      if (broken) r.scr.color.setRGB(0.18, 0.05, 0.03);
      const flowOn = tvOn && st !== 3 ? true : noFuse && !broken;
      r.flow.visible = flowOn; if (flowOn) upd([r.flow], dt, st === 0 ? 0.15 : st === 1 ? 0.3 : 0.55);
      r.smoke.forEach((m, i) => { m.visible = broken; if (broken) { const f = ((t * 0.5 + i / 6) % 1); m.position.set(3.7 + Math.sin(t * 2 + i * 2) * 0.3, 1.9 + f * 1.1, 0.1); m.scale.setScalar(0.5 + f * 0.7); } });
      r.flashT = Math.max(0, r.flashT - dt);
      r.flash.visible = r.flashT > 0; r.flash.scale.setScalar(1 + (0.6 - r.flashT) * 5);
      pick(r.lab, st === 0 ? 0 : st === 1 ? 1 : st === 2 ? (r.melted ? 3 : 2) : 4);
    },
  });

  // =====================================================================  magnet
  world({
    id: 'magnet-inside', name: 'Inside a magnet', zoom: '1,000,000×', short: 'magnet',
    view: view(1.3, 3.8, 3.8),
    dial: {
      label: 'Magnet',
      steps: [
        { name: 'Cool', v: 1, say: 'Cool and calm. All the tiny magnets point the same way, so the magnet is strong and the paper clip sticks.' },
        { name: 'Warm', v: 0.7, say: 'Warmed up. The tiny magnets jiggle and some turn away. The magnet gets weaker and the clip slips down.' },
        { name: 'Hot', v: 0.08, say: 'Very hot! The tiny magnets jiggle so much they point every which way. The magnet is almost gone and the clip falls.' },
        { name: 'Knock', v: 0.45, say: 'Bonk! A hard knock jolts the tiny magnets out of line. The magnet is weaker.' },
      ],
    },
    intro: 'A million times bigger, a magnet is full of tiny magnets. Tap the Magnet button to warm it up, heat it, or knock it. Watch the tiny magnets scramble, the strength meter drop, and the paper clip fall!',
    learn: [
      'A magnet is a crowd of tiny magnets all pointing the same way, like a school of fish swimming together.',
      'Heat makes the tiny magnets jiggle faster. Enough jiggling and they point every which way, and their pulls cancel out. A hard knock can jolt them out of line too.',
      'Scientists call each lined-up patch a domain. Every magnet material has a temperature where it loses its magnetism, called the Curie temperature.',
    ],
    shellSay: 'These arrows are tiny magnets inside the big magnet.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const arrows = [], g = k.group(), am = k.mat(0xb8bdc4, { metalness: 0.6, roughness: 0.3 }), tip = k.mat(0xe0453a, { roughness: 0.4 }), rr = rnd(21);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) for (let l = 0; l < 3; l++) {
        const a = k.group(k.rot(k.cyl(0.05, 0.05, 0.32, am, 8), 0, 0, Math.PI / 2), k.at(k.rot(k.cyl(0, 0.11, 0.2, tip, 10), 0, 0, -Math.PI / 2), 0.26, 0, 0));
        a.position.set(-1.25 + i * 0.5, 0.45 + j * 0.5, -0.5 + l * 0.5);
        const rq = new T.Quaternion().setFromEuler(new T.Euler(rr() * 6.3, rr() * 6.3, rr() * 6.3));
        arrows.push({ a, rq, bx: a.position.x, by: a.position.y, bz: a.position.z, n: rr(), ph: rr() * 6.3 }); g.add(a);
      }
      const shellMat = k.mat(0x9fb4d0, { transparent: true, opacity: 0.08, depthWrite: false });
      root.add(k.at(k.box(3.2, 1.7, 1.7, shellMat), 0, 0.95, 0));
      const shake = k.group(g); root.add(shake);
      add({ id: 'tiny', name: 'Tiny magnet', fixed: true, obj: k.group(), tagAt: [-0.25, 2.0, 0.5],
        say: 'Inside a magnet are huge numbers of tiny magnets. When they all point the same way, the whole thing becomes a magnet.',
        learn: ['Each tiny magnet comes from electrons spinning inside the atoms.',
          'When they line up, their pulls add together into one big pull, like a team all pulling the same rope.',
          'Heat or a hard knock can scramble them again, and the magnet gets weaker.'] });
      add({ id: 'north', name: 'North end', fixed: true, obj: k.group(k.at(k.box(0.06, 1.7, 1.7, k.mat(0xe0453a, { transparent: true, opacity: 0.5 })), 1.63, 0.95, 0)), tagAt: [1.7, 2.0, 0],
        say: 'This is the north end. A north end pulls on a south end, and pushes another north end away.',
        learn: ['Opposite ends attract and the same ends repel. Try two fridge magnets and see.',
          'The magnetism loops out of the north end, curves around, and goes back in at the south end.',
          'You can never cut off a north end by itself. Cut a magnet in half and each piece grows a new north and south.'] });
      add({ id: 'south', name: 'South end', fixed: true, obj: k.group(k.at(k.box(0.06, 1.7, 1.7, k.mat(0x2f7de0, { transparent: true, opacity: 0.5 })), -1.63, 0.95, 0)), tagAt: [-1.7, 2.0, 0],
        say: 'This is the south end. The magnetism loops out of the north end and back in here.',
        learn: ['A magnet always has two ends. South is the other end, where the magnetism comes back in.',
          'A compass needle is a tiny magnet. Its north end points toward the Earth\'s north, because the Earth is a giant magnet too.',
          'The purple dots show the loop, called the magnetic field. It reaches out into the air around the magnet, even though you cannot see it.'] });
      // the paper clip: held by a strong magnet, slips and falls as the magnet weakens
      const clipG = k.group(k.rot(k.torus(0.2, 0.025, k.metal(0xd5d9df, { roughness: 0.2 }), 24), 0, Math.PI / 2, 0), k.at(k.rot(k.torus(0.2, 0.025, k.metal(0xd5d9df, { roughness: 0.2 }), 24), 0, Math.PI / 2, 0), 0, -0.22, 0));
      clipG.position.set(1.95, 1.0, 0);
      add({ id: 'clip', name: 'Paper clip', fixed: true, obj: k.group(clipG), tagAt: [2.7, 1.65, 0.3],
        say: 'A steel paper clip. A strong magnet holds it. As the magnet gets weaker, the clip slips off.',
        learn: ['Steel has iron in it, so magnets pull on it.',
          'The pull gets weaker the farther away the clip is, and weaker still when the magnet is scrambled.',
          'Test a fridge magnet this way: how many paper clips can it hold in a chain? More clips means a stronger magnet.'] });
      const lines = [-0.6, 0, 0.6].map((z, i) => k.flow([[1.65, 1.1, z], [2.5, 2.2, z], [0, 3.2, z], [-2.5, 2.2, z], [-1.65, 1.1, z]], { count: 8, color: 0xb57bff, size: 0.17, phase: i / 3 }));
      root.add(...lines);
      // strength meter on the left
      const frame = k.at(k.box(0.5, 2.15, 0.1, k.mat(0x2a2d36, { roughness: 0.5 })), -3.2, 1.05, -0.2);
      const fill = k.mesh(new T.BoxGeometry(0.34, 2.0, 0.3), k.mat(0x8f4fe8, { emissive: 0x5a22b0, emissiveIntensity: 0.4 })); fill.userData.noPick = true;
      const ml = k.label('Strength', { size: 0.2 }); ml.position.set(-3.2, 2.5, 0);
      const words = labelSet(k, root, [['Strong!', GREEN], ['Weaker', ORANGE], ['Almost gone', RED]], -3.2, -0.15, 0, 0.2);
      root.add(frame, fill, ml);
      return { root, parts, refs: { arrows, lines, shake, clipG, fill, shellMat, words, s: 1, last: -1, knockT: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on, step: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, st = stepOf(inst), v = inst.def.dial.steps[st].v;
      if (r.last !== st) { if (st === 3) r.knockT = 0.6; r.last = st; }
      r.s = ease(r.s, v, dt, 2);
      const s = r.s, jig = (1 - s) * 0.035 * (st === 3 ? 0.3 : 1);
      const aligned = new T.Quaternion();
      r.arrows.forEach(({ a, rq, bx, by, bz, n, ph }) => {
        a.quaternion.copy(rq).slerp(aligned, clamp(s * 1.5 - n * 0.5, 0, 1));
        a.position.set(bx + Math.sin(t * 17 + ph) * jig, by + Math.cos(t * 13 + ph) * jig, bz + Math.sin(t * 15 + ph * 2) * jig);
      });
      r.knockT = Math.max(0, r.knockT - dt);
      r.shake.position.x = Math.sin(t * 70) * 0.08 * (r.knockT / 0.6);
      const hot = st === 2 ? 1 : st === 1 ? 0.45 : 0;
      r.shellMat.color.setHex(0x9fb4d0).lerp(new T.Color(0xff6a2a), hot * 0.9); r.shellMat.opacity = 0.08 + hot * 0.14;
      const lv = r.s > 0.85;
      r.lines.forEach((f) => { f.visible = lv; });
      if (lv) upd(r.lines, dt, 0.2);
      // paper clip: stuck, hanging, then on the table
      const stick = clamp((s - 0.3) / 0.6, 0, 1);
      r.clipG.position.set(1.95 + (1 - stick) * 0.25, 0.06 + 0.2 + stick * 0.8, 0);
      r.clipG.rotation.z = (1 - stick) * 1.2;
      r.fill.scale.y = Math.max(0.03, s); r.fill.position.set(-3.2, 0.05 + s, 0);
      pick(r.words, s > 0.8 ? 0 : s > 0.3 ? 1 : 2);
    },
  });

  // =====================================================================  heat sink
  world({
    id: 'heatsink-inside', name: 'How a heat sink works', zoom: '5×', short: 'heat sink',
    view: view(1.3, 3.4, 4.0),
    dial: {
      label: 'Workload',
      steps: [
        { name: 'Resting', v: 0.15, say: 'The chip is resting. It makes only a little heat.' },
        { name: 'Working', v: 0.5, say: 'The chip is working. It makes more heat.' },
        { name: 'Hard work', v: 1, say: 'The chip is working as hard as it can. It makes lots of heat! Can the fins keep up?' },
      ],
    },
    intro: 'This is a heat sink, 5 times bigger, sitting on a hot chip. The orange dots are heat climbing up the fins. Tap Workload to make the chip work harder. Then try pulling the fins off and working it hard!',
    learn: [
      'Chips get hot when they work hard, a bit like you do when you run. A heat sink is like a big cooling fan blade, but with no moving parts.',
      'Heat moves from the chip into the metal, up through the fins, and into the air. More fins means more metal touching the air, so heat escapes faster.',
      'Without a heat sink, the chip keeps getting hotter. Chips have a safety switch: when they get too hot, they shut themselves off, so the picture goes black.',
    ],
    shellSay: 'A heat sink on top of a chip.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const siliconTex = tex(k, 128, 128, (c, w, h) => { c.fillStyle = '#2a2c32'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,130,150,0.3)'; for (let i = 0; i < w; i += 12) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } });
      const chipMat = k.mat(0xffffff, { map: siliconTex, emissive: 0xff5a1a, emissiveIntensity: 0, roughness: 0.4 }); chipMat.userData.selfLit = true;
      add({ id: 'chip', name: 'Hot chip', fixed: true, obj: k.group(k.at(k.box(1.2, 0.25, 1.2, chipMat), 0, 0.125, 0)), tagAt: [1.2, 0.2, 0.7],
        say: 'The chip gets hot when it works hard, a bit like you do when you run.',
        learn: ['Every tiny switch inside the chip makes a little bit of heat each time it flips. Billions of switches add up.',
          'The chip wants to stay cool. When it gets too hot it can slow down, and if it gets much hotter, it can break for good.',
          'So chips have a built-in thermometer. If it gets too hot, the chip shuts itself off to stay safe.'] });
      add({ id: 'pad', name: 'Heat pad', obj: k.group(k.at(k.box(1.2, 0.06, 1.2, k.mat(0x9aa0aa, { roughness: 0.9 })), 0, 0.28, 0)), blockedBy: ['fins'], pull: [2.2, 0, 0.8], tagAt: [-1.2, 0.3, 0.7],
        say: 'This soft pad helps heat jump from the chip to the metal.',
        breaks: 'Without the pad, tiny air gaps trap the heat, and the chip runs hotter.',
        learn: ['Without it, tiny air gaps would trap the heat. Air is bad at moving heat.',
          'The pad is soft, so it squishes into every little dip between the chip and the metal and fills the gaps.',
          'Think of it like a wet sponge between two cups, so the water, or here the heat, can pass straight across.'] });
      const alTex = tex(k, 64, 128, (c, w, h) => { c.fillStyle = '#c9ced6'; c.fillRect(0, 0, w, h); const r = rnd(6); for (let i = 0; i < 40; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(110,120,135,0.3)'; c.fillRect(0, r() * h, w, 1 + r() * 2); } });
      const al = k.metal(0xffffff, { map: alTex, roughness: 0.35 }), fins = k.group(k.at(k.box(2.4, 0.2, 1.6, al), 0, 0.41, 0));
      for (let i = 0; i < 9; i++) fins.add(k.at(k.box(0.07, 2.0, 1.6, al), -1.12 + i * 0.28, 1.51, 0));
      add({ id: 'fins', name: 'Metal fins', obj: fins, pull: [0, 2.6, 0], tagAt: [0, 2.85, 0],
        say: 'Thin metal fins give the heat lots of room to escape into the air.',
        breaks: 'With no fins, the heat has nowhere to go. Try the Workload button and watch the chip!',
        learn: ['More fins means more metal touching the air, like spreading out a wet towel so it dries faster.',
          'Aluminum is used because it is light and moves heat well.',
          'Some heat sinks have a fan blowing air between the fins to carry the heat away faster.'] });
      const heat = [];
      for (let i = 0; i < 9; i++) { const x = -1.12 + i * 0.28; heat.push(k.flow([[0, 0.3, 0.2], [x, 0.5, 0.2], [x, 2.5, 0.2], [x * 1.3, 3.5, 0.2]], { count: 5, color: 0xff8a3a, size: 0.24, phase: i / 9 })); }
      const trapped = k.flow([[-0.4, 0.4, 0.2], [0, 0.9, 0.2], [0.4, 0.4, 0.2], [0, 0.35, 0.2]], { count: 6, color: 0xff8a3a, size: 0.18, closed: true });
      // what you'd see: a little picture that goes black when the chip shuts off
      const scrTex = tex(k, 128, 96, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ec6ff'); g.addColorStop(1, '#bfe9ff'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#4caf50'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, h * 0.7); c.quadraticCurveTo(w * 0.4, h * 0.45, w, h * 0.8); c.lineTo(w, h); c.fill(); });
      const scr = new T.MeshBasicMaterial({ map: scrTex, toneMapped: false });
      const screen = k.mesh(new T.PlaneGeometry(1.2, 0.9), scr); screen.position.set(3.1, 1.4, 0.2); screen.userData.noPick = true;
      const pl = k.label('What you see', { size: 0.18 }); pl.position.set(3.1, 2.2, 0);
      const chipHalo = halo(k, 0, 0.25, 0.7, 0xff6a2a, 2.2); root.add(chipHalo);
      root.add(...heat, trapped, k.at(k.rbox(1.45, 1.15, 0.35, k.mat(0x2b2e34, { roughness: 0.5 }), 0.05), 3.1, 1.4, 0), screen, pl);
      // thermometer on the left
      const frame = k.at(k.box(0.5, 2.15, 0.1, k.mat(0x2a2d36, { roughness: 0.5 })), -3.0, 1.1, -0.2);
      const fill = k.mesh(new T.BoxGeometry(0.34, 2.0, 0.3), new T.MeshBasicMaterial({ color: 0x3ec46d, toneMapped: false })); fill.userData.noPick = true;
      const tl = k.label('Heat', { size: 0.2 }); tl.position.set(-3.0, 2.4, 0);
      root.add(frame, fill, tl);
      const lab = labelSet(k, root, [['Cool and happy', GREEN], ['Getting warm', ORANGE], ['Very hot!', RED], ['Too hot: the chip shut off!', RED]], 0, -0.4, 1.0, 0.21);
      return { root, parts, refs: { heat, trapped, chipHalo, scr, fill, lab, T: 0, off: false, said: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on, fins: has('fins'), pad: has('pad'), load: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, v = inst.def.dial.steps[stepOf(inst)].v;
      const fins = o.fins !== false, pad = o.pad !== false, cool = fins && pad ? 0.9 : fins ? 0.35 : pad ? 0.15 : 0.1;
      const load = r.off ? 0 : v;
      r.T = clamp(r.T + (0.4 * load - cool * r.T) * dt, 0, 1.2);
      if (!r.off && r.T >= 0.95) { r.off = true; if (!r.said) { r.said = 1; TAL.say('The chip got too hot, so it shut itself off to stay safe. The picture went black! It will restart when it cools down.'); } }
      if (r.off && r.T < 0.45) { r.off = false; r.said = 0; }
      const Tn = clamp(r.T, 0, 1);
      inst.byId.chip.meshes.forEach((m) => { m.material.emissiveIntensity = Tn * 2.6; });
      r.chipHalo.visible = Tn > 0.1; r.chipHalo.material.opacity = Tn; r.chipHalo.scale.setScalar(1.2 + Tn * 1.6);
      r.scr.color.setScalar(r.off ? 0.03 : 1);
      r.fill.scale.y = Math.max(0.03, Tn); r.fill.position.set(-3.0, 0.1 + Tn, 0);
      r.fill.material.color.setHex(0x3ec46d).lerp(new T.Color(0xe0302a), clamp((Tn - 0.25) / 0.6, 0, 1));
      const flowOn = fins && Tn > 0.08;
      r.heat.forEach((f) => { f.visible = flowOn; }); if (flowOn) upd(r.heat, dt, 0.1 + Tn * 0.35);
      r.trapped.visible = !fins && Tn > 0.08; if (r.trapped.visible) upd([r.trapped], dt, 0.15 + Tn * 0.4);
      pick(r.lab, r.off ? 3 : Tn > 0.6 ? 2 : Tn > 0.3 ? 1 : 0);
    },
  });

  // =====================================================================  switch
  world({
    id: 'switch-inside', name: 'Inside a switch', zoom: '15×', short: 'switch',
    view: view(1.1, 3.0, 3.8),
    dial: {
      label: 'Finger',
      steps: [
        { name: 'Up', down: false, say: 'Finger up. The arm springs up, the loop is open, and the bulb is off.' },
        { name: 'Pressing', down: true, say: 'Pressing! The arm swings down and touches the contact. The loop is closed and the bulb lights up!' },
      ],
    },
    intro: 'This is a switch, 15 times bigger. Tap Finger to press the button down, and watch the springy metal arm close the loop and light the bulb. Tap again to let go and watch the little spark when the arm lifts off!',
    learn: [
      'A switch is a drawbridge for electricity. Bridge down, the electricity can cross. Bridge up, it is stuck on the other side.',
      'Pressing the button pushes the arm down onto the contact, which closes the loop. Letting go lets the spring lift the arm, which opens the loop again.',
      'When the arm lifts away, electricity tries to jump the tiny gap for a moment and makes a small spark. In a big switch, the spark can wear the metal over time.',
    ],
    shellSay: 'This is a switch, opened up.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      root.add(k.at(k.rbox(3.2, 0.3, 1.6, k.mat(0x2b2e34, { roughness: 0.6 }), 0.05), 0, 0.15, 0));
      add({ id: 'contact', name: 'Contact', fixed: true, obj: k.group(k.at(k.box(0.5, 0.2, 0.6, k.metal(0xd8c48a, { roughness: 0.25 })), 1.0, 0.4, 0)), tagAt: [1.0, 0.75, 0.5],
        say: 'The contact is the metal spot the arm touches to close the loop.',
        learn: ['Contacts are made of metal that does not rust easily, and that lets electricity through well.',
          'Many are plated with a thin layer of gold or silver, so they stay shiny and work for a long time.',
          'The arm and the contact are like the two sides of a drawbridge. They only work when they touch.'] });
      const armIn = k.group(k.at(k.box(2.2, 0.06, 0.5, k.metal(COPPER, { roughness: 0.3 })), 1.1, 0, 0));
      const arm = k.group(k.at(armIn, -1.1, 0.7, 0));
      arm.add(k.at(k.box(0.3, 0.5, 0.6, k.metal(0xd8c48a)), -1.15, 0.45, 0));
      add({ id: 'arm', name: 'Springy arm', obj: arm, pull: [0, 1.6, 1.2], tagAt: [-0.4, 1.25, 0.4],
        say: 'This springy metal arm swings down to touch the contact.',
        learn: ['When the two metals touch, the loop is closed and electricity flows.',
          'When you let go, the arm springs back up and the loop opens again.',
          'The arm is the drawbridge itself. Down means the way is clear for electricity to cross.'] });
      const btnIn = k.group(k.at(k.cyl(0.32, 0.32, 0.5, k.mat(0xe0453a, { roughness: 0.4 }), 24), 0.5, 1.45, 0));
      add({ id: 'button', name: 'Button', obj: k.group(btnIn), pull: [0, 1.6, 0], tagAt: [0.5, 1.95, 0],
        say: 'The button is what your finger pushes.',
        breaks: 'With no button, nothing can push the arm down. The loop stays open and the bulb stays off.',
        learn: ['It is wide and bright so a finger can find it and push it easily.',
          'Pushing it presses down on the arm, like pushing on the end of a drawbridge to lower it.',
          'On many switches the button clicks, so you can feel and hear that the loop closed.'] });
      const springG = k.group(k.tube(helix(0.22, 0.95, 1.2, 4, 80).map(([x, y, z]) => [x + 0.5, y, z]), 0.025, k.metal(0xd7dce2)));
      add({ id: 'spring', name: 'Spring', obj: springG, pull: [1.6, 1.0, 0.6], tagAt: [1.25, 1.1, 0],
        say: 'The spring pushes the button back up after you press it.',
        breaks: 'Now nothing pushes the button back up. Press it, and it stays stuck down with the bulb on!',
        breaksAlways: true,
        learn: ['A spring squishes when pushed and bounces back when you let go.',
          'It stores the push like a coiled-up kid ready to jump, then gives it back when released.',
          'That is why most switches pop up by themselves. Some switches, like a wall light switch, have a catch that holds them down instead.'] });
      const bulbMat = bulbGlow(k);
      const wirePts = [[-1.25, 0.3, 0.3], [-1.6, 0.3, 0.9], [-0.6, 0.3, 1.4], [0.6, 0.6, 1.4], [1.6, 0.3, 0.9], [1.0, 0.35, 0.3]];
      add({ id: 'bulb', name: 'Bulb', fixed: true, obj: k.group(k.tube(wirePts, 0.025, k.mat(0xc0392b)), k.at(k.sphere(0.2, bulbMat, 18), 0.6, 0.85, 1.4)), tagAt: [0.6, 1.3, 1.4],
        say: 'The bulb lights up when the loop is closed.',
        learn: ['A bulb needs electricity to flow through it. A closed loop lets electricity flow around and through the bulb.',
          'With the loop open, the electricity has nowhere to go, so the bulb stays dark.',
          'The wire has to make a full circle, out of the battery side, through the bulb, and back. That is why we call it a circuit, which means circle.'] });
      const flow = k.flow(wirePts, { count: 14, color: BLUE, size: 0.13 });
      const g = halo(k, 0.6, 0.85, 1.4);
      // the little spark when the contact opens
      const sparks = lightDots(k, root, 8, 0xffd27a, 0.05).map((m) => { m.visible = false; return { m, vx: 0, vy: 0, vz: 0 }; });
      const sparkHalo = halo(k, 1.0, 0.55, 0, 0xffb84a, 0.9);
      const sparkLab = k.label('Spark!', { size: 0.2, bg: 'rgba(200,110,20,0.92)' }); sparkLab.position.set(1.95, 0.95, 0); sparkLab.visible = false;
      root.add(flow, g, sparkHalo, sparkLab);
      const lab = labelSet(k, root, [['Finger up: loop open, bulb off', GREY], ['Pressing: loop closed, bulb on!', GREEN], ['Stuck down! The spring is gone', RED]], 0, 2.55, 0.4, 0.21);
      return { root, parts, refs: { armIn, btnIn, flow, g, bulbMat, sparks, sparkHalo, sparkLab, lab, s: 0, latched: false, was: false, sparkT: 0, tt: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on, spring: has('spring'), arm: has('arm'), button: has('button'), finger: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, press = inst.def.dial.steps[stepOf(inst)].down && o.button !== false;
      if (o.spring === false) { if (press) r.latched = true; } else r.latched = false;
      const eff = (press || r.latched) && o.button !== false, closed = eff && o.arm !== false;
      if (r.was && !eff) { // contact just opened
        if (r.bulbWasOn) {
          r.sparkT = 0.5; r.sparkLab.visible = true;
          r.sparks.forEach((s, i) => { s.vx = 0.6 + Math.random() * 1.2; s.vy = 0.6 + Math.random() * 1.5; s.vz = (Math.random() - 0.5) * 1.2; s.m.position.set(1.0, 0.55, 0); });
        }
      }
      r.was = eff; r.bulbWasOn = closed;
      r.s = ease(r.s, eff ? 1 : 0, dt, 9);
      r.btnIn.position.y = -0.4 * r.s;
      r.armIn.rotation.z = -0.13 * r.s;
      inst.byId.bulb.meshes.forEach((m) => { if (m.material.userData.selfLit) m.material.emissiveIntensity = closed ? 2.6 : 0; });
      show([r.flow, r.g], closed); if (closed) upd([r.flow], dt, 0.25);
      r.sparkT = Math.max(0, r.sparkT - dt);
      r.sparks.forEach((s) => { s.m.visible = r.sparkT > 0; s.vy -= 6 * dt; s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; s.m.position.z += s.vz * dt; });
      r.sparkHalo.visible = r.sparkT > 0; r.sparkHalo.scale.setScalar(0.5 + r.sparkT * 2);
      if (r.sparkT <= 0) r.sparkLab.visible = false;
      pick(r.lab, r.latched && !press ? 2 : eff ? 1 : 0);
    },
  });

  // =====================================================================  circuit board
  world({
    id: 'pcb-inside', name: 'Inside a circuit board', zoom: '10×', short: 'circuit board',
    view: view(0.9, 3.9, 4.4),
    intro: 'This is a tiny piece of a circuit board, 10 times bigger and pulled apart into layers. Press Power to send electricity down the copper road to the light. Then take off the green coat and a road, and watch the light go out!',
    learn: [
      'A circuit board is a city map for electricity. Copper roads connect the parts, and electricity can only go where there is a road.',
      'The roads are copper stuck to a fiberglass board. A green coat covers them, and tiny tunnels called vias carry electricity from one layer to the next.',
      'Cut a road and the electricity cannot cross, just like a washed-out bridge. That is how a single broken trace can stop a whole phone or TV.',
    ],
    shellSay: 'A piece of circuit board, pulled apart into layers.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      // copper roads, drawn as copper-colored shapes with a bright edge and round pads
      const copperTex = k.canvasTex(512, 320, (c, w, h) => {
        c.clearRect(0, 0, w, h);
        const bar = (x, y, ww, hh) => { const g = c.createLinearGradient(0, y, 0, y + hh); g.addColorStop(0, '#e49a5e'); g.addColorStop(0.5, '#c8743a'); g.addColorStop(1, '#a45a28'); c.fillStyle = g; c.fillRect(x, y, ww, hh); c.fillStyle = 'rgba(255,225,190,0.55)'; c.fillRect(x, y + 2, ww, 2); };
        bar(20, 120, 380, 52); bar(352, 120, 52, 180); bar(60, 20, 44, 280); bar(220, 220, 280, 36);
        c.fillStyle = '#e8b27c'; [[40, 146], [378, 296], [82, 38], [490, 238]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 22, 0, 7); c.fill(); });
      });
      const layer = (y, map, extra) => k.at(k.box(3.0, 0.05, 1.9, k.mat(0xffffff, Object.assign({ map, transparent: true, metalness: 0.6, roughness: 0.3, alphaTest: 0.3 }, extra || {}))), 0, y, 0);
      add({ id: 'bottomCu', name: 'Bottom copper', fixed: true, obj: k.group(layer(0.3, copperTex)), tagAt: [-1.7, 0.3, 1.0],
        say: 'More copper roads on the bottom. Big boards can have many layers stacked up.',
        learn: ['Using both sides doubles the room for roads, like building a city with a second floor of streets.',
          'Phones and computers have boards with many layers, sometimes a dozen or more, glued together like a sandwich.',
          'The layers talk to each other through vias, which are like elevators between the floors.'] });
      const weave = tex(k, 128, 128, (c, w, h) => { c.fillStyle = '#b89a54'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(110,85,35,0.5)'; c.lineWidth = 3; for (let i = 0; i < w; i += 10) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } c.strokeStyle = 'rgba(240,215,150,0.4)'; c.lineWidth = 1; for (let i = 5; i < w; i += 10) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }, [3, 2]);
      add({ id: 'core', name: 'Fiberglass', fixed: true, obj: k.group(k.at(k.box(3.0, 0.4, 1.9, k.mat(0xffffff, { map: weave, roughness: 0.85 })), 0, 0.68, 0)), tagAt: [-1.7, 0.7, 1.0],
        say: 'The middle is fiberglass, glass threads in hard glue. It is strong and does not let electricity through.',
        learn: ['Fiberglass is woven glass threads soaked in hard resin. It is strong, and it will not bend or melt easily.',
          'It does not let electricity through, so the top roads and bottom roads stay apart unless a via connects them.',
          'It is like the ground a city sits on: flat, steady, and the roads are built on top of it.'] });
      add({ id: 'via', name: 'Via', obj: k.group(k.at(k.cyl(0.08, 0.08, 0.9, k.metal(COPPER, { roughness: 0.3 }), 16), 0.65, 0.72, -0.23)), blockedBy: ['topCu'], pull: [1.8, 0.6, 1.2], tagAt: [1.1, 0.75, -0.2],
        say: 'A via is a tiny copper tunnel that lets electricity go from the top layer to the bottom.',
        breaks: 'Without the via, the electricity cannot get down to the bottom road, so the light goes out.',
        learn: ['The factory drills a hole, then coats the inside of the hole with copper.',
          'A via is like an elevator shaft connecting two floors of roads.',
          'A phone board can have thousands of vias, and the tiniest are about as thin as a hair.'] });
      add({ id: 'topCu', name: 'Copper roads', obj: k.group(layer(1.12, copperTex)), blockedBy: ['mask'], pull: [0, 1.3, 1.6], tagAt: [-1.7, 1.15, 1.0],
        say: 'Thin copper roads carry electricity between the parts.',
        breaks: 'With the copper road gone, the electricity has no way to travel. The light goes out!',
        learn: ['The roads start as a whole sheet of copper. The extra copper is washed away with chemicals, leaving only the roads.',
          'Wide roads carry more electricity, like a wide highway carries more cars.',
          'Copper roads are very thin, thinner than a sheet of paper, and still carry a lot of electricity.'] });
      const rr = rnd(15);
      const maskTex = tex(k, 512, 320, (c, w, h) => {
        c.fillStyle = '#1d6e3a'; c.fillRect(0, 0, w, h);
        speckle(c, w, h, 500, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.07)', 'rgba(110,200,140,0.06)'], 1, 4, 12);
        c.fillStyle = 'rgba(120,210,150,0.22)'; // copper bumps under the coat
        c.fillRect(20, 120, 380, 52); c.fillRect(352, 120, 52, 180); c.fillRect(60, 20, 44, 280); c.fillRect(220, 220, 280, 36);
        c.fillStyle = '#e8b27c'; [[40, 146], [378, 296], [82, 38], [490, 238]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 18, 0, 7); c.fill(); });
        c.fillStyle = 'rgba(255,255,255,0.92)'; c.font = '700 22px monospace';
        [['R12', 150, 108], ['C7', 260, 106], ['U3', 120, 290], ['D1', 430, 190], ['+', 18, 112], ['REV A', 400, 40]].forEach(([s, x, y]) => c.fillText(s, x, y));
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2.5; c.strokeRect(140, 110, 64, 26); c.strokeRect(245, 108, 36, 22); c.beginPath(); c.arc(430, 210, 10, 0, 7); c.stroke();
      });
      add({ id: 'mask', name: 'Green coat', obj: k.group(k.at(k.box(3.0, 0.04, 1.9, k.mat(0xffffff, { map: maskTex, transparent: true, opacity: 0.82, roughness: 0.3, depthWrite: false })), 0, 1.45, 0)), pull: [0, 1.8, 0], tagAt: [-1.7, 1.5, 1.0],
        say: 'The green coat protects the copper roads and keeps melted solder where it belongs.',
        job: 'It protects the copper from scratches and from stray solder. The electricity does not need it.',
        learn: ['Green is just the most common color. Boards can be red, blue, white or black too.',
          'It is called solder mask. It is like paint on a road that keeps the lanes apart, so a drop of hot metal does not connect two roads by accident.',
          'The white letters printed on top are called silkscreen. They tell the people who build and repair it which part goes where.'] });
      // power in on the left, light on the right
      const route = [[-2.55, 1.16, -0.12], [-1.35, 1.16, -0.12], [0.65, 1.16, -0.12], [0.65, 0.34, -0.23], [0.65, 0.34, 0.6], [1.5, 0.34, 0.6], [2.2, 0.34, 0.6]];
      const flow = k.flow(route, { count: 18, color: BLUE, size: 0.14 });
      const lampMat = bulbGlow(k);
      add({ id: 'lamp', name: 'Light', fixed: true, obj: k.group(k.at(k.cyl(0.16, 0.2, 0.18, k.metal(0x9aa0aa), 16), 2.2, 0.34, 0.6), k.at(k.sphere(0.22, lampMat, 20), 2.2, 0.55, 0.6)), tagAt: [2.2, 0.98, 0.6],
        say: 'This light only glows when electricity makes the whole trip along the roads.',
        learn: ['A light is the end of the road. It turns the electricity that arrives into glow.',
          'If any road along the way is broken, nothing arrives, and the light stays dark.',
          'That is how you can tell where a board is broken: follow the roads until the light goes out.'] });
      const lampHalo = halo(k, 2.2, 0.55, 0.6, 0xffe27a, 1.6);
      const pw = k.at(k.box(0.5, 0.4, 0.5, k.mat(0x2a6fb8, { roughness: 0.4 })), -2.8, 1.16, -0.12), pl = k.label('Power', { size: 0.17 }); pl.position.set(-2.8, 2.1, -0.12);
      const lab = labelSet(k, root, [['Light on! The road is whole', GREEN], ['Road cut: the light is out', RED], ['No power: the light is off', GREY]], 2.2, -0.2, 0.6, 0.2);
      root.add(flow, lampHalo, pw, pl);
      return { root, parts, refs: { flow, lampMat, lampHalo, lab } };
    },
    evaluate(has, on) { return { alive: on && has('topCu') && has('via'), cut: on && !(has('topCu') && has('via')) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, on = !!o.alive;
      inst.byId.lamp.meshes.forEach((m) => { if (m.material.userData.selfLit) m.material.emissiveIntensity = on ? 2.6 : 0; }); show([r.flow, r.lampHalo], on);
      if (on) upd([r.flow], dt, 0.2);
      pick(r.lab, on ? 0 : o.cut ? 1 : 2);
    },
  });

  // =====================================================================  diode
  world({
    id: 'diode-inside', name: 'Inside a diode', zoom: '1,000×', short: 'diode',
    view: view(0.9, 3.4, 3.4),
    dial: {
      label: 'Battery',
      steps: [
        { name: 'Forward', fwd: true, say: 'The battery is forward. Electrons and holes rush toward the middle and cross. The one-way door is open and the bulb lights up!' },
        { name: 'Flipped', fwd: false, say: 'The battery is flipped! Electrons and holes get pulled away from the middle, leaving an empty gap. The door is shut and the bulb stays dark.' },
      ],
    },
    intro: 'This is a diode, a thousand times bigger, in a loop with a battery and a bulb. Tap Battery to flip the battery around. The diode only lets electricity through one way!',
    learn: [
      'A diode is a one-way door for electricity. It lets electricity through one way and blocks it the other way.',
      'Inside, one side has extra electrons and the other side has spots where electrons are missing, called holes. Push the right way and they meet in the middle and the electricity crosses.',
      'Push the wrong way and they get pulled apart, leaving an empty gap in the middle that nothing can cross.',
      'The charger for your gadgets uses diodes to turn the back-and-forth electricity from the wall into one-way electricity.',
    ],
    shellSay: 'This is a diode, a one-way gate for electricity.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'p', name: 'P side', fixed: true, obj: k.group(k.at(k.box(1.5, 1.2, 1.4, k.mat(0x8a5a9a, { roughness: 0.4 })), -0.85, 0.9, 0)), tagAt: [-0.9, 1.75, 0.5],
        say: 'The P side has empty spots, called holes, where electrons are missing.',
        learn: ['P stands for positive. A hole is a spot where an electron could be, but is not, like an empty seat in a row.',
          'Electrons nearby can hop into a hole, which leaves a new hole behind. So the holes seem to move the other way.',
          'The P side is made by adding a pinch of a different atom to silicon, a trick called doping.'] });
      add({ id: 'n', name: 'N side', fixed: true, obj: k.group(k.at(k.box(1.5, 1.2, 1.4, k.mat(0x4a6a9a, { roughness: 0.4 })), 0.85, 0.9, 0)), tagAt: [0.9, 1.75, 0.5],
        say: 'The N side has extra electrons, ready to move.',
        learn: ['N stands for negative, because electrons have a negative charge.',
          'The extra electrons are free to wander, like kids with room to run.',
          'The N side is also made by adding a pinch of a different atom to silicon.'] });
      const gapMat = k.mat(0xf2efe6, { transparent: true, opacity: 0.85, emissive: 0xffffff, emissiveIntensity: 0.2 });
      const gap = k.at(k.box(0.2, 1.22, 1.42, gapMat), 0, 0.9, 0);
      add({ id: 'gap', name: 'One-way gate', fixed: true, obj: k.group(gap), tagAt: [0, 2.15, 0.5],
        say: 'The middle is the gate. It lets electricity through one way, but not the other.',
        learn: ['Pushed the forward way, electrons and holes cross the middle and meet.',
          'Pushed backward, they get pulled away from the middle, leaving an empty gap that nothing can cross.',
          'That empty gap is called the depletion zone. Diodes turn the back-and-forth electricity from the wall into one-way electricity.'] });
      const ef = [-0.4, 0, 0.4].map((z, i) => k.flow([[1.5, 0.7 + i * 0.2, z], [-1.5, 0.7 + i * 0.2, z]], { count: 6, color: BLUE, size: 0.14, phase: i / 3 }));
      const hf = [-0.4, 0, 0.4].map((z, i) => k.flow([[-1.5, 1.1 - i * 0.2, z + 0.15], [1.5, 1.1 - i * 0.2, z + 0.15]], { count: 5, color: PINK, size: 0.13, phase: i / 3 }));
      // when flipped, the carriers sit at the far edges
      const edgeE = lightDots(k, root, 6, BLUE, 0.07, true), edgeH = lightDots(k, root, 6, PINK, 0.07, true);
      edgeE.forEach((m, i) => { m.position.set(1.4 - (i % 2) * 0.12, 0.5 + (i % 3) * 0.3, -0.4 + Math.floor(i / 3) * 0.8); });
      edgeH.forEach((m, i) => { m.position.set(-1.4 + (i % 2) * 0.12, 0.5 + (i % 3) * 0.3, -0.4 + Math.floor(i / 3) * 0.8); });
      // the loop: battery in front (plus and minus swap sides when flipped), bulb on the right
      const batt = k.at(k.rbox(1.4, 0.4, 0.5, k.mat(0x3a3f4a, { roughness: 0.4 }), 0.05), 0, 0.2, 1.5);
      const pl = (txt, bg, x) => { const l = k.label(txt, { size: 0.28, bg }); l.position.set(x, 0.68, 1.5); l.visible = false; root.add(l); return l; };
      const plusL = pl('+', 'rgba(200,50,40,0.95)', -0.45), minusR = pl('-', 'rgba(40,90,200,0.95)', 0.45), plusR = pl('+', 'rgba(200,50,40,0.95)', 0.45), minusL = pl('-', 'rgba(40,90,200,0.95)', -0.45);
      const bm = bulbGlow(k), hl = halo(k, 2.7, 0.9, 0, 0xffe27a, 2.0);
      const bl = k.label('Bulb', { size: 0.17 }); bl.position.set(2.7, 0.38, 0);
      const bt = k.label('Battery', { size: 0.17 }); bt.position.set(0, -0.1, 1.5);
      const wm = k.metal(0xd6dbe2);
      root.add(batt, bl, bt, k.at(k.sphere(0.3, bm, 24), 2.7, 0.9, 0), hl, k.at(k.cyl(0.1, 0.14, 0.2, wm, 16), 2.7, 0.55, 0), k.at(alongX(k.cyl(0.035, 0.035, 0.7, wm, 8)), 2.2, 0.9, 0), ...ef, ...hf);
      const fwd = k.label('Forward: it flows!', { size: 0.22, bg: GREEN }), back = k.label('Backward: blocked', { size: 0.22, bg: RED });
      fwd.position.set(0, 2.65, 0); back.position.set(0, 2.65, 0);
      root.add(fwd, back);
      return { root, parts, refs: { ef, hf, fwd, back, gap, edgeE, edgeH, plusL, minusR, plusR, minusL, bm, hl, clock: 0, lv: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on, fwd: stepOf(inst) === 0 }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, forward = !!(out && out.alive && out.fwd), flipped = !forward;
      show(r.ef, forward); show(r.hf, forward);
      if (forward) { upd(r.ef, dt, 0.35); upd(r.hf, dt, 0.35); }
      r.edgeE.forEach((m) => { m.visible = flipped; }); r.edgeH.forEach((m) => { m.visible = flipped; });
      r.fwd.visible = forward; r.back.visible = flipped;
      show([r.plusL, r.minusR], forward); show([r.plusR, r.minusL], flipped);
      r.lv = ease(r.lv, forward ? 1 : 0, dt, 6);
      r.bm.emissiveIntensity = r.lv * 2.6; r.hl.visible = r.lv > 0.05; r.hl.scale.setScalar(0.8 + r.lv * 1.3);
      const want = flipped ? 0.8 : 0.12, g = inst.byId.gap.meshes[0];
      g.scale.x += (want / 0.2 - g.scale.x) * Math.min(1, dt * 4);
    },
  });

  // =====================================================================  polarizer
  const CY = 1.55; // the centre of the sheet
  world({
    id: 'polarizer-inside', name: 'Inside a polarizer', zoom: '10,000×', short: 'polarizer',
    view: view(CY, 3.8, 4.6, -0.75, 0.3),
    dial: {
      label: 'Turn the sheet',
      steps: [
        { name: '0°', a: 0, say: 'The sheet is turned to zero. The chains lie side to side. The blue light gets through. The yellow light is soaked up. You see blue.' },
        { name: '45°', a: Math.PI / 4, say: 'The sheet is turned halfway. Both lights get through, but only about half of each. You see a pale mix.' },
        { name: '90°', a: Math.PI / 2, say: 'The sheet is turned a quarter turn. Now the blue is soaked up and the yellow gets through. That is the sunglasses trick: turn them and the glare blocks or shows.' },
      ],
    },
    intro: 'This is a polarizer, 10,000 times bigger. Light wiggles as it travels, like a jump rope you shake. The blue rope shakes up and down. The yellow rope shakes side to side. The long chains in the sheet soak up light that wiggles the same way they lie. Tap Turn the sheet to turn it, and watch which color you see!',
    learn: [
      'Think of the sheet as a fence with long slots. A rope shaken the same way as the slots slips through. A rope shaken the other way gets blocked by the fence.',
      'The long chains soak up light that wiggles along them, like a sponge soaking up water. Turn the sheet, and the chains turn too, so a different light gets soaked up.',
      'Polarized sunglasses use the same trick. Glare bouncing off water mostly wiggles side to side. Turn the sunglasses so the chains soak it up, and the glare goes away.',
    ],
    shellSay: 'A polarizer sheet, seen from the side, with two kinds of light going through it.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const chains = k.group(), rot = k.group(), chainMat = k.mat(0xe8e2f0, { roughness: 0.5 }), iodine = k.mat(0x5a2a7a, { roughness: 0.4 });
      rot.position.set(0, CY, 0); chains.add(rot);
      for (let rw = 0; rw < 9; rw++) for (const x of [-0.07, 0.07]) {
        const y = (rw - 4) * 0.24;
        rot.add(k.at(k.rot(k.cyl(0.03, 0.03, 2.1, chainMat, 8), Math.PI / 2, 0, 0), x, y, 0));
        for (let d = 0; d < 7; d++) rot.add(k.at(k.sphere(0.045, iodine, 8), x, y, -0.9 + d * 0.3));
      }
      add({ id: 'chains', name: 'Long chains', obj: chains, pull: [0, 0, -3.4], tagAt: [-0.1, CY + 1.65, -1.0],
        say: 'These long chains all lie side to side. Light that wiggles the same way they lie gets soaked up. Pull them out to see what happens!',
        learn: ['Think of each chain as a long sponge lying sideways. The yellow rope wiggles along the sponge, so the sponge soaks it up. The blue rope wiggles across it, so it only brushes past and slips through. The colors are just so you can tell the two ropes apart: it is the way the light wiggles that matters, not its color.',
          'The chains are plastic, stretched like taffy so they all line up the same way. Then they are dipped in iodine, the purple dots. The iodine is what does the soaking.',
          'The light that comes out wiggles only one way. That is called polarized light. A TV has two of these sheets, turned different ways, with the liquid crystal in between deciding how much light makes it through both.',
          'Polarized sunglasses use the same trick. Glare bouncing off water mostly wiggles side to side, so the sunglasses soak it up.'] });
      const filmMat = k.mat(0xdff3ff, { transparent: true, opacity: 0.22, roughness: 0.2, depthWrite: false });
      add({ id: 'films', name: 'Clear covers', obj: k.group(k.at(alongX(k.cyl(1.4, 1.4, 0.06, filmMat, 48)), -0.22, CY, 0), k.at(alongX(k.cyl(1.4, 1.4, 0.06, filmMat, 48)), 0.22, CY, 0)), pull: [0, 3.0, 0], tagAt: [0.25, CY - 1.55, 0.9],
        say: 'Two clear covers keep water and scratches away from the chains. They do not change the light.',
        job: 'They only guard the chains from water and scratches. The light still gets sorted without them.',
        learn: ['The chains are delicate. Water makes them lose their line, and then the filter stops working.',
          'One cover is glued right onto the TV glass.',
          'The covers are like the glass over a picture frame. They keep the picture safe but are not the picture.'] });
      // two "ropes" of light, drawn as beads so you can see the wiggle
      const N = 56, X0 = -2.8, X1 = 2.8;
      const vBeads = lightDots(k, root, N, 0x6fc8ff, 0.065), hBeads = lightDots(k, root, N, 0xffd23a, 0.065);
      const lab = (txt, x, y, z, bg) => { const l = k.label(txt, { size: 0.16, bg }); l.position.set(x, y, z); root.add(l); return l; };
      lab('Blue light wiggles up and down', -2.0, CY + 1.05, 0.6, 'rgba(30,110,190,0.92)');
      lab('Yellow light wiggles side to side', -2.0, CY - 1.1, -0.6, 'rgba(170,120,0,0.92)');
      const soakB = lab('Soaked up!', 0.9, CY + 0.7, 0.6, 'rgba(120,60,150,0.92)'), soakY = lab('Soaked up!', 0.9, CY - 0.7, -0.6, 'rgba(120,60,150,0.92)');
      // what you would see: a patch of the mixed color
      const sw = new T.Sprite(new T.SpriteMaterial({ color: 0xffffff, toneMapped: false })); sw.scale.set(1.2, 1.2, 1); sw.position.set(3.6, CY, 0); sw.userData.noPick = true;
      const fr = new T.Sprite(new T.SpriteMaterial({ color: 0x555a66, toneMapped: false })); fr.scale.set(1.34, 1.34, 1); fr.position.set(3.6, CY, -0.02); fr.userData.noPick = true;
      const sl = k.label('What you see', { size: 0.17 }); sl.position.set(3.6, CY + 0.95, 0);
      const state = labelSet(k, root, [['Blue passes', 'rgba(30,110,190,0.92)'], ['Half of each', GREY], ['Yellow passes', 'rgba(170,120,0,0.92)'], ['No sheet: both pass', GREEN]], 3.6, CY - 0.95, 0, 0.18);
      root.add(fr, sw, sl);
      return { root, parts, refs: { vBeads, hBeads, soakB, soakY, sw, rot, state, N, X0, X1, th: 0 } };
    },
    evaluate(has, on, inst) { return { alive: on, filter: has('chains'), turn: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, filt = !!(out && out.filter), a = inst.def.dial.steps[stepOf(inst)].a;
      r.th = ease(r.th, a, dt, 4);
      const th = r.th;
      r.rot.rotation.x = -th;
      // light that comes out wiggles across the chains; keep only the part of each wiggle that lines up with that
      const px = -Math.sin(th), py = Math.cos(th); // across-the-chains direction in (z, y)
      const aB = py, aY = px; // dot products with blue (0,1) and yellow (1,0)
      const rope = (beads, ez, ey, zc, gain) => beads.forEach((m, i) => {
        const x = r.X0 + (r.X1 - r.X0) * (i / (r.N - 1)), w = 0.3 * Math.sin(x * 4.5 - t * 6);
        let dz = ez * w, dy = ey * w;
        if (filt && x > 0.1) { dz = px * gain * w; dy = py * gain * w; }
        m.position.set(x, CY + dy, zc + dz);
        m.visible = !(filt && x > 0.1 && Math.abs(gain) < 0.12);
      });
      rope(r.vBeads, 0, 1, 0.6, aB); rope(r.hBeads, 1, 0, -0.6, aY);
      const Ib = filt ? aB * aB : 1, Iy = filt ? aY * aY : 1;
      r.soakB.visible = filt && Ib < 0.25; r.soakY.visible = filt && Iy < 0.25;
      const c = new T.Color(0x000000);
      c.r = clamp(0.44 * Ib + 1.0 * Iy, 0, 1); c.g = clamp(0.78 * Ib + 0.82 * Iy, 0, 1); c.b = clamp(1.0 * Ib + 0.23 * Iy, 0, 1);
      r.sw.material.color.copy(c);
      pick(r.state, !filt ? 3 : stepOf(inst));
    },
  });

  // =====================================================================  color filter
  const MIXES = [
    { name: 'White', rgb: [1, 1, 1], say: 'Red, green and blue all at full. Together they look white!' },
    { name: 'Yellow', rgb: [1, 1, 0], say: 'Red and green on, blue off. Red light plus green light looks yellow!' },
    { name: 'Orange', rgb: [1, 0.5, 0], say: 'Full red, half green, no blue. That mix looks orange!' },
    { name: 'Purple', rgb: [1, 0, 1], say: 'Red and blue on, green off. Red light plus blue light looks purple!' },
    { name: 'Cyan', rgb: [0, 1, 1], say: 'Green and blue on, red off. Green light plus blue light looks blue-green, called cyan.' },
  ];
  world({
    id: 'filter-inside', name: 'Inside the color filter', zoom: '1,000×', short: 'color filter',
    view: view(1.4, 3.8, 4.5, -0.5, 0.32),
    dial: { label: 'Mix', steps: MIXES.map((m) => ({ name: m.name, rgb: m.rgb, say: m.say })) },
    intro: 'This is the color filter, 1,000 times bigger. A screen can make white light by mixing red, green and blue light. Each colored window only lets its own color through. Tap Mix to turn the three colors up and down, and see what color you get. Try pulling a window out!',
    learn: [
      'Every color on the screen is a mix of just three lights: red, green and blue. It is like having three paint pots and mixing them.',
      'Each pixel has three little windows, one for each color. The TV lets more or less light through each window. Red and green together look yellow. All three together look white.',
      'Your eye sees the tiny windows blended together, because they are too small to tell apart. That is how a TV makes millions of colors from three.',
    ],
    shellSay: 'Three colored windows, one for each color dot.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const COLS = [['red', 0xff3030, [1, 0.19, 0.19]], ['green', 0x30ff60, [0.19, 1, 0.38]], ['blue', 0x3060ff, [0.19, 0.38, 1]]], X = [-1.0, 0, 1.0];
      const grid = k.group(), blackTex = tex(k, 64, 64, (c, w, h) => { c.fillStyle = '#111114'; c.fillRect(0, 0, w, h); speckle(c, w, h, 60, ['#1b1b20', '#0a0a0c'], 0.5, 1.5, 3); }), black = k.mat(0xffffff, { map: blackTex, roughness: 0.8 });
      [-1.5, -0.5, 0.5, 1.5].forEach((x) => grid.add(k.at(k.box(0.12, 0.3, 1.2, black), x, 1.5, 0)));
      add({ id: 'grid', name: 'Black grid', fixed: true, obj: grid, tagAt: [1.9, 1.05, 0.7],
        say: 'Thin black walls sit between the windows so the colors stay crisp.',
        learn: ['Without them, light would leak from one color into the next and the picture would look washed out.',
          'It is called the black matrix. It also soaks up light coming in from the room, so the screen looks darker when it is off.',
          'It is like the walls between rooms in a house. Each window gets its own room, so the colors do not spill into each other.'] });
      COLS.forEach(([nm, c], i) => {
        const dye = tex(k, 64, 64, (cx, w, h) => { cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, w, h); speckle(cx, w, h, 50, ['rgba(255,255,255,0.35)', 'rgba(0,0,0,0.12)'], 0.8, 2.2, 20 + i); });
        const win = k.at(k.box(0.88, 0.25, 1.2, k.mat(c, { map: dye, transparent: true, opacity: 0.8, roughness: 0.3, emissive: c, emissiveIntensity: 0.3 })), X[i], 1.5, 0);
        add({ id: nm, name: nm[0].toUpperCase() + nm.slice(1) + ' window', obj: k.group(win), pull: [X[i] * 1.6, 1.8, 1.2], tagAt: [X[i], 2.3, 0.6],
          say: `This window is full of ${nm} dye. It soaks up the other colors and only lets ${nm} light through.`,
          breaks: `Without the ${nm} window, that dot lets every color through and shines white instead of ${nm}. Watch the color you see change!`,
          learn: [`Pull it out and that dot lets all the colors through, so it shines white instead of ${nm}.`,
            'The dye is printed on in a very thin layer, thinner than a hair.',
            'It works like a sunglasses lens in one color. A red lens lets red light through and soaks up the rest.'] });
      });
      const dots = [];
      X.forEach((x, w) => COLS.forEach(([, c], j) => lightDots(k, root, 4, c, 0.08).forEach((m, n) => dots.push({ m, w, j, n, x: x - 0.25 + j * 0.25, ph: n / 4 }))));
      const lab = k.label('White light from below', { size: 0.17 }); lab.position.set(0, -0.2, 0.9);
      // what you see (right) and how much of each color (left)
      const sw = new T.Sprite(new T.SpriteMaterial({ color: 0xffffff, toneMapped: false })); sw.scale.set(1.3, 1.3, 1); sw.position.set(3.2, 1.6, 0); sw.userData.noPick = true;
      const fr = new T.Sprite(new T.SpriteMaterial({ color: 0x555a66, toneMapped: false })); fr.scale.set(1.46, 1.46, 1); fr.position.set(3.2, 1.6, -0.02); fr.userData.noPick = true;
      const sl = k.label('What you see', { size: 0.18 }); sl.position.set(3.2, 2.55, 0);
      const bars = COLS.map(([, c], i) => { const b = k.mesh(new T.BoxGeometry(0.34, 1.6, 0.34), new T.MeshBasicMaterial({ color: c, toneMapped: false })); b.userData.noPick = true; b.position.set(-4.0 + i * 0.6, 0.8, 0); root.add(b); return b; });
      const bl = k.label('How much of each', { size: 0.17 }); bl.position.set(-3.4, 2.1, 0);
      const names = k.label('R    G    B', { size: 0.15 }); names.position.set(-3.4, -0.2, 0);
      root.add(lab, fr, sw, sl, bl, names);
      return { root, parts, refs: { dots, bars, sw, lv: [1, 1, 1], s: 0, cols: COLS.map((c) => c[2]) } };
    },
    evaluate(has, on, inst) { return { alive: on, win: ['red', 'green', 'blue'].map((id) => has(id)), mix: stepOf(inst) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive, rgb = MIXES[stepOf(inst)].rgb, win = (out && out.win) || [true, true, true];
      for (let i = 0; i < 3; i++) r.lv[i] = ease(r.lv[i], rgb[i], dt, 4);
      r.s = (r.s + dt * 0.25) % 1;
      r.dots.forEach((d) => {
        const f = (r.s + d.ph) % 1, y = f * 3.2, past = y > 1.4;
        d.m.position.set(d.x, y, 0.15);
        const pass = !past || ((!win[d.w] || d.w === d.j) && d.n / 4 < rgb[d.w] - 1e-3);
        d.m.visible = !!on && pass;
      });
      r.bars.forEach((b, i) => { b.scale.y = Math.max(0.03, r.lv[i]); b.position.y = 0.8 * Math.max(0.03, r.lv[i]); });
      // mix: a window with its dye gives its own color, a missing window gives plain white
      const c = [0, 0, 0];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c[j] += r.lv[i] * (win[i] ? (j === i ? 1 : 0) : 1);
      r.sw.material.color.setRGB(clamp(c[0], 0, 1), clamp(c[1], 0, 1), clamp(c[2], 0, 1));
      if (!on) r.sw.material.color.setRGB(0.05, 0.05, 0.06);
    },
  });

  // =====================================================================  which parts open into these worlds
  Object.assign(TAL.insideByName, {
    'Front polarizer': 'polarizer-inside', 'Back polarizer': 'polarizer-inside', 'Polarizer': 'polarizer-inside', 'Color filter': 'filter-inside',
    'Power cord': 'wire-inside', 'HDMI cable': 'wire-inside', 'Picture cable': 'wire-inside', 'Power wires': 'wire-inside', 'Speaker wire': 'wire-inside',
    'High-voltage wire': 'wire-inside', 'Ribbon cable': 'wire-inside', 'Gold wire': 'wire-inside', 'Wire and bulb': 'wire-inside', 'Copper strands': 'copper-atoms',
    'Screw': 'screw-inside', 'Resistor': 'resistor-inside', 'Fuse': 'fuse-inside', 'Magnet': 'magnet-inside', 'Heat sink': 'heatsink-inside',
    'Switch': 'switch-inside', 'Power button': 'switch-inside', 'Button cap': 'switch-inside', 'Switch contact': 'switch-inside',
    'Main board': 'pcb-inside', 'Power board': 'pcb-inside', 'T-con board': 'pcb-inside', 'Main circuit board': 'pcb-inside', 'LED strip': 'pcb-inside', 'Base board': 'pcb-inside',
    'Diode': 'diode-inside', 'Bridge rectifier': 'diode-inside',
    'Coil': 'transformer-inside', 'Up-and-down coil': 'crt-inside', 'Side-to-side coil': 'crt-inside', 'Deflection yoke': 'crt-inside', 'Red gun': 'crt-inside', 'Green gun': 'crt-inside', 'Blue gun': 'crt-inside',
    'Power switch': 'transistor', 'Power transistor': 'transistor', 'Voice coil': 'transformer-inside',
  });
})();
