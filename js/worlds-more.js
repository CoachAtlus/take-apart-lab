/* More worlds inside parts: the everyday pieces kids pull off most.
 * wire (20x) > copper atoms (100,000,000x), screw, resistor, fuse, magnet, heat sink, switch, circuit board, diode.
 * Uses the helpers shared by js/worlds.js (TAL.wk). */
(function () {
  const T = window.THREE;
  const { world, view, part, upd, show, halo, lattice, BLUE, PINK } = TAL.wk;
  const COPPER = 0xc8743a;
  const helix = (r, y0, y1, turns, n) => Array.from({ length: n }, (_, i) => { const f = i / (n - 1), a = f * turns * Math.PI * 2; return [Math.cos(a) * r, y0 + (y1 - y0) * f, Math.sin(a) * r]; });
  const alongX = (m) => { m.rotation.z = Math.PI / 2; return m; };

  // =====================================================================  wire
  world({
    id: 'wire-inside', name: 'Inside a wire', zoom: '20×', short: 'wire',
    view: view(1.0, 2.7, 3.6),
    intro: 'This is a wire, 20 times bigger, with its coats peeled back. The electricity rides inside the shiny copper strands.',
    shellSay: 'This is a wire, peeled open.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s)), Y = 1.0;
      const strands = k.group(), cu = k.metal(COPPER, { roughness: 0.28 });
      const spots = [[0, 0]].concat(Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2) * 0.19, Math.sin((i / 6) * Math.PI * 2) * 0.19]));
      spots.forEach(([y, z]) => strands.add(k.at(alongX(k.cyl(0.09, 0.09, 4.6, cu, 14)), 0, Y + y, z)));
      add({ id: 'copper', name: 'Copper strands', obj: strands, inside: 'copper-atoms', blockedBy: ['insulation'], pull: [0, 1.4, 1.4], tagAt: [1.9, Y + 0.5, 0],
        say: 'Copper strands carry the electricity!',
        learn: ['Copper lets electricity flow very easily. It is one of the best conductors there is.', 'Many thin strands bend better than one thick one, so the cord does not snap when you wiggle it.', 'Tap the magnifying glass to see the copper atoms.'] });
      add({ id: 'insulation', name: 'Inner coating', obj: k.group(k.at(alongX(k.cyl(0.42, 0.42, 3.4, k.mat(0xc0392b, { roughness: 0.5 }), 32)), -0.6, Y, 0)), blockedBy: ['jacket'], pull: [-1.2, 1.6, -1.2], tagAt: [0.6, Y + 0.65, 0],
        say: 'This colored coating keeps the electricity inside the copper.',
        learn: ['Plastic does not let electricity through, so it is called an insulator.', 'The colors are a code that tells electricians which wire is which.'] });
      add({ id: 'jacket', name: 'Outer jacket', obj: k.group(k.at(alongX(k.cyl(0.56, 0.56, 2.4, k.mat(0x1d1d20, { roughness: 0.7 }), 32)), -1.1, Y, 0)), pull: [-1.6, 2.2, 0], tagAt: [-1.1, Y + 0.85, 0],
        say: 'The tough outer jacket protects the wire from bumps and scrapes.',
        learn: ['It is made of rubbery plastic that bends without cracking.', 'It also keeps out water, which could let electricity leak where it should not.'] });
      const flows = spots.slice(0, 4).map(([y, z], i) => k.flow([[-2.3, Y + y, z + 0.0], [2.3, Y + y, z]], { count: 8, color: BLUE, size: 0.13, phase: i / 4 }));
      root.add(...flows);
      return { root, parts, refs: { flows } };
    },
    evaluate(has, on) { return { alive: on && has('copper') }; },
    apply(out, inst) { show(inst.refs.flows, out.alive); },
    tick(dt, t, inst, out) { if (out && out.alive) upd(inst.refs.flows, dt, 0.12); },
  });

  world({
    id: 'copper-atoms', name: 'Copper atoms', zoom: '100,000,000×', short: 'copper',
    view: view(1.1, 2.8, 2.8),
    intro: 'A hundred million times bigger! In copper, every atom lets one electron go free. The free electrons drift around like a sea. Turn the power on to push them along.',
    shellSay: 'These are copper atoms in a neat crystal pattern.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const shell = lattice(k, 6, 3, 3, 0.85, 0.3, () => ({ r: 0.24, mat: k.metal(COPPER, { roughness: 0.3 }) }), null);
      root.add(shell);
      const p = shell.userData.pos(2, 2, 2);
      add({ id: 'atom', name: 'Copper atom', fixed: true, obj: k.group(k.at(k.sphere(0.28, k.metal(0xe79a5c, { roughness: 0.2 }), 24), p[0], p[1], p[2])), tagAt: [p[0], p[1] + 0.5, p[2]],
        say: 'This is a copper atom. In a metal, atoms share their outer electrons with everyone.',
        learn: ['Each copper atom lets one electron go free. The free electrons drift around like a sea.', 'Push electricity in one end, and the whole sea moves a little, so the push reaches the other end almost right away.',
          'The electrons themselves crawl slower than a snail. It is the push that travels at nearly the speed of light.'] });
      const seas = [];
      for (let i = 0; i < 9; i++) {
        const y = 0.5 + (i % 3) * 0.85, z = -0.85 + Math.floor(i / 3) * 0.85;
        seas.push(k.flow([[-2.5, y, z + 0.4], [-1.2, y + 0.4, z + 0.4], [0, y, z + 0.42], [1.2, y + 0.4, z + 0.4], [2.5, y, z + 0.4]], { count: 5, color: BLUE, size: 0.15, phase: i / 9 }));
      }
      const eInner = k.group(k.sphere(0.11, k.glow(0x2a48ff, 0x4f8dff), 16));
      add({ id: 'electron', name: 'Free electron', fixed: true, obj: k.group(eInner), tagAt: [-2.2, 2.6, 0.6],
        say: 'This is a free electron, drifting through the copper.', learn: ['Moving electrons are electricity. Copper has so many free ones that electricity flows through it easily.'] });
      root.add(...seas);
      const path = new T.CatmullRomCurve3([[-2.5, 1.2, 0.85], [-1.2, 1.6, 0.85], [0, 1.2, 0.87], [1.2, 1.6, 0.85], [2.5, 1.2, 0.85]].map((q) => new T.Vector3(q[0], q[1], q[2])));
      return { root, shell: [shell], parts, refs: { seas, eInner, path, clock: 0 } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      // with power off they jiggle in place; with power on the whole sea drifts along
      if (on) { r.clock += dt; upd(r.seas, dt, 0.05); } else r.seas.forEach((f, i) => f.userData.flow.update(0, 0));
      r.eInner.position.copy(r.path.getPointAt((r.clock * 0.05) % 1)).add(new T.Vector3(Math.sin(t * 9) * 0.05, Math.cos(t * 11) * 0.05, 0));
    },
  });

  // =====================================================================  screw
  world({
    id: 'screw-inside', name: 'How a screw works', zoom: '10×', short: 'screw',
    view: view(1.6, 2.6, 3.2),
    intro: 'This is a screw, 10 times bigger. Its thread is a ramp wrapped around and around. Press power to spin the nut and watch it climb the ramp!',
    shellSay: 'This is a big screw.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const steel = k.metal(0xc3c8cf, { roughness: 0.25 });
      add({ id: 'head', name: 'Head', fixed: true, obj: k.group(k.at(k.cyl(0.8, 0.8, 0.3, steel, 40), 0, 3.15, 0), k.at(k.box(1.2, 0.08, 0.16, 0x2a2a2a), 0, 3.31, 0), k.at(k.box(0.16, 0.08, 1.2, 0x2a2a2a), 0, 3.31, 0)), tagAt: [0, 3.65, 0],
        say: 'The head is where the screwdriver grips.', learn: ['The cross shape lets the screwdriver push and turn at the same time without slipping out.'] });
      add({ id: 'thread', name: 'Thread', fixed: true, obj: k.group(k.at(k.cyl(0.32, 0.32, 2.75, steel, 32), 0, 1.6, 0), k.tube(helix(0.38, 0.35, 2.95, 9, 260), 0.07, steel)), tagAt: [0.75, 2.4, 0.3],
        say: 'The thread is a ramp wrapped around the screw, like a spiral slide.',
        learn: ['Walking up a long gentle ramp is easier than climbing straight up. A screw uses the same trick.', 'Each turn pulls the screw in just a little, so a small twist makes a big squeeze.', 'This idea is called an inclined plane. It is one of the six simple machines.'] });
      add({ id: 'point', name: 'Point', fixed: true, obj: k.group(k.rot(k.at(k.cyl(0.32, 0.02, 0.4, steel, 24), 0, 0.03, 0), 0, 0, 0)), tagAt: [0.6, 0.15, 0.3],
        say: 'The pointy end helps the screw start into the hole.' });
      const nutIn = k.group(k.cyl(0.72, 0.72, 0.36, k.metal(0xa9afb7, { roughness: 0.3 }), 6));
      const nut = k.group(nutIn);
      add({ id: 'nut', name: 'Nut', obj: nut, pull: [2.0, -0.4, 0.4], tagAt: [1.6, 1.0, 0],
        say: 'A nut has a matching ramp inside it. Press power to spin it!',
        learn: ['As it turns, the two ramps slide along each other, and the nut climbs up or down.', 'Nuts and bolts hold things together without glue, so they can come apart again later.'] });
      nutIn.position.y = 0.8;
      return { root, parts, refs: { nutIn, s: 0 } };
    },
    evaluate(has, on) { return { alive: on && has('nut') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs;
      if (out && out.alive) r.s += dt;
      const f = 0.5 - 0.5 * Math.cos(r.s * 0.6); // up and back down
      r.nutIn.position.y = 0.6 + f * 1.9;
      r.nutIn.rotation.y = r.nutIn.position.y * ((Math.PI * 2 * 9) / 2.6);
    },
  });

  // =====================================================================  resistor
  world({
    id: 'resistor-inside', name: 'Inside a resistor', zoom: '20×', short: 'resistor',
    view: view(1.0, 2.7, 3.4),
    intro: 'This is a resistor, 20 times bigger. Peel off its painted coat to see the long spiral path that slows the electricity down.',
    shellSay: 'This is a resistor.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s)), Y = 1.0;
      add({ id: 'core', name: 'Ceramic core', fixed: true, obj: k.group(k.at(alongX(k.cyl(0.35, 0.35, 3.0, k.mat(0xf2efe6, { roughness: 0.6 }), 32)), 0, Y, 0)), tagAt: [-1.0, Y - 0.6, 0.4],
        say: 'The white core is ceramic, like a tiny coffee mug. It holds the spiral and does not burn.' });
      const spiral = helix(0.36, -1.3, 1.3, 7, 220).map(([a, b, c]) => [b, Y + a, c]);
      const filmMat = k.mat(0x2a2a2e, { roughness: 0.6, emissive: 0xff6a2a, emissiveIntensity: 0 }); filmMat.userData.selfLit = true;
      add({ id: 'film', name: 'Carbon spiral', fixed: true, obj: k.group(k.tube(spiral, 0.04, filmMat)), tagAt: [0.5, Y + 0.65, 0.4],
        say: 'A thin spiral of carbon makes the electricity squeeze through a long, narrow path.',
        learn: ['The longer and thinner the path, the more it slows the electricity.', 'Squeezing through makes a little heat. That is why the spiral glows warm.', 'Factories cut the spiral with a laser to get exactly the right amount of slowing.'] });
      const caps = k.group(k.at(alongX(k.cyl(0.42, 0.42, 0.3, k.metal(0xc9ced6), 32)), -1.55, Y, 0), k.at(alongX(k.cyl(0.42, 0.42, 0.3, k.metal(0xc9ced6), 32)), 1.55, Y, 0),
        k.at(alongX(k.cyl(0.04, 0.04, 1.1, k.metal(0xd6dbe2), 8)), -2.25, Y, 0), k.at(alongX(k.cyl(0.04, 0.04, 1.1, k.metal(0xd6dbe2), 8)), 2.25, Y, 0));
      add({ id: 'caps', name: 'Metal caps', fixed: true, obj: caps, tagAt: [1.8, Y + 0.65, 0],
        say: 'Metal caps connect the spiral to the legs.' });
      // bands go around the resistor: canvas width wraps around, height runs along its length
      const coatTex = k.canvasTex(64, 256, (c, w, h) => {
        c.fillStyle = '#d9c39a'; c.fillRect(0, 0, w, h);
        [['#8b4513', 0.2], ['#1b1b1b', 0.33], ['#e67e22', 0.46], ['#d4af37', 0.8]].forEach(([col, y]) => { c.fillStyle = col; c.fillRect(0, y * h, w, h * 0.07); });
      });
      const coat = k.mesh(new T.CylinderGeometry(0.48, 0.48, 2.9, 40, 1, true), k.mat(0xffffff, { map: coatTex, roughness: 0.5, side: T.DoubleSide }));
      coat.rotation.z = Math.PI / 2; coat.rotation.x = Math.PI / 2; coat.position.set(0, Y, 0);
      const coatG = k.group(coat); coat.rotation.set(0, 0, Math.PI / 2);
      add({ id: 'coat', name: 'Painted coat', obj: coatG, pull: [0, 1.6, 1.2], tagAt: [0, Y + 0.85, 0],
        say: 'The painted coat protects the inside. The colored stripes are a code.',
        learn: ['Each color stands for a number. The stripes tell how strongly the resistor slows the electricity.', 'Black is 0, brown is 1, red is 2, orange is 3, all the way up to white for 9.'] });
      const flow = k.flow(spiral, { count: 30, color: BLUE, size: 0.12 });
      root.add(flow);
      return { root, parts, refs: { flow, filmMat } };
    },
    evaluate(has, on) { return { alive: on }; },
    apply(out, inst) { show([inst.refs.flow], out.alive); inst.byId.film.meshes[0].material.emissiveIntensity = out.alive ? 0.7 : 0; },
    tick(dt, t, inst, out) { if (out && out.alive) upd([inst.refs.flow], dt, 0.06); },
  });

  // =====================================================================  fuse
  world({
    id: 'fuse-inside', name: 'Inside a fuse', zoom: '20×', short: 'fuse',
    view: view(1.0, 2.6, 3.2),
    intro: 'This is a fuse, 20 times bigger. Press power to send way too much electricity through it, and watch the thin wire!',
    shellSay: 'This is a fuse.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s)), Y = 1.0;
      add({ id: 'glass', name: 'Glass tube', obj: k.group(k.at(alongX(k.cyl(0.5, 0.5, 2.9, k.glass(0xdff3ff, 0.28, { side: T.DoubleSide }), 40, true)), 0, Y, 0)), pull: [0, 1.7, 0], tagAt: [0, Y + 0.75, 0],
        say: 'The glass tube lets you see if the wire inside has melted.' });
      add({ id: 'caps', name: 'Metal caps', fixed: true, obj: k.group(k.at(alongX(k.cyl(0.56, 0.56, 0.45, k.metal(0xc9ced6), 40)), -1.6, Y, 0), k.at(alongX(k.cyl(0.56, 0.56, 0.45, k.metal(0xc9ced6), 40)), 1.6, Y, 0)), tagAt: [-1.6, Y + 0.85, 0],
        say: 'Metal caps clip into the holder and connect the wire.' });
      const wireMat = k.mat(0xb8bdc4, { metalness: 0.8, roughness: 0.3, emissive: 0xff3a00, emissiveIntensity: 0 }); wireMat.userData.selfLit = true;
      const wire = k.at(alongX(k.cyl(0.03, 0.03, 2.8, wireMat, 8)), 0, Y, 0);
      const stubs = k.group(k.at(alongX(k.cyl(0.03, 0.03, 1.1, k.metal(0x6a6f78), 8)), -0.85, Y, 0), k.at(alongX(k.cyl(0.03, 0.03, 1.1, k.metal(0x6a6f78), 8)), 0.85, Y, 0),
        k.at(k.sphere(0.07, k.metal(0x6a6f78), 10), -0.3, Y, 0), k.at(k.sphere(0.07, k.metal(0x6a6f78), 10), 0.3, Y, 0));
      stubs.visible = false;
      add({ id: 'fuseWire', name: 'Thin wire', fixed: true, obj: k.group(wire, stubs), tagAt: [0.4, Y - 0.6, 0.3],
        say: 'This thin wire is the weak spot, on purpose!',
        learn: ['Electricity heats a wire. Too much electricity heats this thin one until it melts.', 'Melting breaks the loop, so the electricity stops before anything else gets too hot.', 'A melted fuse cannot be fixed. You put in a new one. Circuit breakers in a house do the same job, but you can switch them back on.'] });
      const flow = k.flow([[-2.0, Y, 0], [2.0, Y, 0]], { count: 14, color: BLUE, size: 0.15 });
      const flash = halo(k, 0, Y, 0, 0xffd27a, 2.4);
      root.add(flow, flash);
      return { root, parts, refs: { wire, stubs, wireMat, flow, flash, heat: 0, melted: false, flashT: 0 } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      const mat = inst.byId.fuseWire.meshes[0].material;
      if (!on) { r.heat = 0; r.melted = false; } // power off: a brand new fuse
      if (on && !r.melted) {
        r.heat += dt * 0.4;
        if (r.heat >= 1) { r.melted = true; r.flashT = 0.6; TAL.say('Snap! The wire melted. That broke the loop and stopped the electricity, so nothing else got hurt. Turn the power off to put in a new fuse.'); }
      }
      mat.emissiveIntensity = r.melted ? 0 : Math.max(0, r.heat) * 2.2;
      mat.emissive.setHex(r.heat > 0.7 ? 0xffd27a : 0xff3a00);
      r.wire.visible = !r.melted; r.stubs.visible = r.melted;
      r.flow.visible = on && !r.melted;
      if (r.flow.visible) upd([r.flow], dt, 0.5);
      r.flashT = Math.max(0, r.flashT - dt);
      r.flash.visible = r.flashT > 0; r.flash.scale.setScalar(1 + (0.6 - r.flashT) * 5);
    },
  });

  // =====================================================================  magnet
  world({
    id: 'magnet-inside', name: 'Inside a magnet', zoom: '1,000,000×', short: 'magnet',
    view: view(1.3, 3.0, 3.0),
    intro: 'A million times bigger, a magnet is full of tiny magnets. Press power to switch between lined up and scrambled. Watch the magnetism, the purple dots, appear when they line up!',
    shellSay: 'These arrows are tiny magnets inside the big magnet.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const arrows = [], g = k.group(), am = k.mat(0xb8bdc4, { metalness: 0.6, roughness: 0.3 }), tip = k.mat(0xe0453a, { roughness: 0.4 });
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) for (let l = 0; l < 3; l++) {
        const a = k.group(k.rot(k.cyl(0.05, 0.05, 0.32, am, 8), 0, 0, Math.PI / 2), k.at(k.rot(k.cyl(0, 0.11, 0.2, tip, 10), 0, 0, -Math.PI / 2), 0.26, 0, 0));
        a.position.set(-1.25 + i * 0.5, 0.45 + j * 0.5, -0.5 + l * 0.5);
        const rq = new T.Quaternion().setFromEuler(new T.Euler(Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3));
        arrows.push({ a, rq }); g.add(a);
      }
      root.add(k.at(k.box(3.2, 1.7, 1.7, k.mat(0x9fb4d0, { transparent: true, opacity: 0.08, depthWrite: false })), 0, 0.95, 0));
      root.add(g);
      add({ id: 'tiny', name: 'Tiny magnet', fixed: true, obj: k.group(), tagAt: [-0.25, 2.0, 0.5],
        say: 'Inside a magnet are huge numbers of tiny magnets. When they all point the same way, the whole thing becomes a magnet.',
        learn: ['Each tiny magnet comes from electrons spinning inside the atoms.', 'When they line up, their pulls add together into one big pull.', 'Heat or a hard knock can scramble them again, and the magnet gets weaker.'] });
      add({ id: 'north', name: 'North end', fixed: true, obj: k.group(k.at(k.box(0.06, 1.7, 1.7, k.mat(0xe0453a, { transparent: true, opacity: 0.5 })), 1.63, 0.95, 0)), tagAt: [1.7, 2.0, 0],
        say: 'This is the north end. A north end pulls on a south end, and pushes another north end away.' });
      add({ id: 'south', name: 'South end', fixed: true, obj: k.group(k.at(k.box(0.06, 1.7, 1.7, k.mat(0x2f7de0, { transparent: true, opacity: 0.5 })), -1.63, 0.95, 0)), tagAt: [-1.7, 2.0, 0],
        say: 'This is the south end. The magnetism loops out of the north end and back in here.' });
      const lines = [-0.6, 0, 0.6].map((z, i) => k.flow([[1.65, 1.1, z], [2.5, 2.2, z], [0, 3.2, z], [-2.5, 2.2, z], [-1.65, 1.1, z]], { count: 8, color: 0xb57bff, size: 0.17, phase: i / 3 }));
      root.add(...lines);
      return { root, parts, refs: { arrows, lines, s: 1 } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, want = out && out.alive ? 1 : 0, aligned = new T.Quaternion();
      r.s += (want - r.s) * Math.min(1, dt * 2.5);
      r.arrows.forEach(({ a, rq }) => { a.quaternion.copy(rq).slerp(aligned, r.s); });
      r.lines.forEach((f) => { f.visible = r.s > 0.85; });
      if (r.s > 0.85) upd(r.lines, dt, 0.2);
    },
  });

  // =====================================================================  heat sink
  world({
    id: 'heatsink-inside', name: 'How a heat sink works', zoom: '5×', short: 'heat sink',
    view: view(1.3, 2.6, 3.4),
    intro: 'This is a heat sink, 5 times bigger, sitting on a hot chip. The orange dots are heat. Watch it climb up the metal fins and escape into the air. Then try pulling the fins off!',
    shellSay: 'A heat sink on top of a chip.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const chipMat = k.glow(0x26282d, 0xff5a1a);
      add({ id: 'chip', name: 'Hot chip', fixed: true, obj: k.group(k.at(k.box(1.2, 0.25, 1.2, chipMat), 0, 0.125, 0)), tagAt: [1.2, 0.2, 0.7],
        say: 'The chip gets hot when it works hard, a bit like you do when you run.' });
      add({ id: 'pad', name: 'Heat pad', obj: k.group(k.at(k.box(1.2, 0.06, 1.2, k.mat(0x9aa0aa, { roughness: 0.9 })), 0, 0.28, 0)), blockedBy: ['fins'], pull: [2.2, 0, 0.8], tagAt: [-1.2, 0.3, 0.7],
        say: 'This soft pad helps heat jump from the chip to the metal.', learn: ['Without it, tiny air gaps would trap the heat. Air is bad at moving heat.'] });
      const al = k.metal(0xc9ced6, { roughness: 0.35 }), fins = k.group(k.at(k.box(2.4, 0.2, 1.6, al), 0, 0.41, 0));
      for (let i = 0; i < 9; i++) fins.add(k.at(k.box(0.07, 2.0, 1.6, al), -1.12 + i * 0.28, 1.51, 0));
      add({ id: 'fins', name: 'Metal fins', obj: fins, pull: [0, 2.6, 0], tagAt: [0, 2.85, 0],
        say: 'Thin metal fins give the heat lots of room to escape into the air.',
        learn: ['More fins means more metal touching the air, like spreading out a wet towel so it dries faster.', 'Aluminum is used because it is light and moves heat well.', 'Some heat sinks have a fan blowing air between the fins to carry the heat away faster.'] });
      const heat = [];
      for (let i = 0; i < 9; i++) { const x = -1.12 + i * 0.28; heat.push(k.flow([[0, 0.3, 0.2], [x, 0.5, 0.2], [x, 2.5, 0.2], [x * 1.3, 3.5, 0.2]], { count: 5, color: 0xff8a3a, size: 0.16, phase: i / 9 })); }
      const hot = k.label('Too hot!', { size: 0.3, bg: 'rgba(200,40,30,0.92)' }); hot.position.set(0, 1.0, 0); hot.visible = false;
      root.add(...heat, hot);
      return { root, parts, refs: { heat, hot } };
    },
    evaluate(has, on) { return { alive: on, cool: has('fins') && has('pad') }; },
    apply(out, inst) {
      const r = inst.refs;
      show(r.heat, out.alive && out.cool);
      r.hot.visible = out.alive && !out.cool;
      inst.byId.chip.meshes[0].material.emissiveIntensity = out.alive ? (out.cool ? 0.5 : 2.4) : 0;
    },
    tick(dt, t, inst, out) { if (out && out.alive && out.cool) upd(inst.refs.heat, dt, 0.3); },
  });

  // =====================================================================  switch
  world({
    id: 'switch-inside', name: 'Inside a switch', zoom: '15×', short: 'switch',
    view: view(1.1, 2.6, 3.4),
    intro: 'This is a switch, 15 times bigger. Press the power button to push the switch down, and watch the springy metal arm close the loop and light the bulb!',
    shellSay: 'This is a switch, opened up.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      root.add(k.at(k.rbox(3.2, 0.3, 1.6, k.mat(0x2b2e34, { roughness: 0.6 }), 0.05), 0, 0.15, 0));
      add({ id: 'contact', name: 'Contact', fixed: true, obj: k.group(k.at(k.box(0.5, 0.2, 0.6, k.metal(0xd8c48a, { roughness: 0.25 })), 1.0, 0.4, 0)), tagAt: [1.0, 0.75, 0.5],
        say: 'The contact is the metal spot the arm touches to close the loop.' });
      const armIn = k.group(k.at(k.box(2.2, 0.06, 0.5, k.metal(COPPER, { roughness: 0.3 })), 1.1, 0, 0));
      const arm = k.group(k.at(armIn, -1.1, 0.7, 0));
      arm.add(k.at(k.box(0.3, 0.5, 0.6, k.metal(0xd8c48a)), -1.15, 0.45, 0));
      add({ id: 'arm', name: 'Springy arm', obj: arm, pull: [0, 1.6, 1.2], tagAt: [-0.4, 1.25, 0.4],
        say: 'This springy metal arm swings down to touch the contact.',
        learn: ['When the two metals touch, the loop is closed and electricity flows.', 'When you let go, the arm springs back up and the loop opens again.'] });
      const btnIn = k.group(k.at(k.cyl(0.32, 0.32, 0.5, k.mat(0xe0453a, { roughness: 0.4 }), 24), 0.5, 1.45, 0));
      add({ id: 'button', name: 'Button', obj: k.group(btnIn), pull: [0, 1.6, 0], tagAt: [0.5, 1.95, 0],
        say: 'The button is what your finger pushes.' });
      const springG = k.group(k.tube(helix(0.22, 0.95, 1.2, 4, 80).map(([x, y, z]) => [x + 0.5, y, z]), 0.025, k.metal(0xd7dce2)));
      add({ id: 'spring', name: 'Spring', obj: springG, blockedBy: ['button'], pull: [1.6, 1.0, 0.6], tagAt: [1.25, 1.1, 0],
        say: 'The spring pushes the button back up after you press it.' });
      const bulbMat = k.glow(0xfff6d8, 0xffe9a0); bulbMat.transparent = true; bulbMat.opacity = 0.85;
      const wirePts = [[-1.25, 0.3, 0.3], [-1.6, 0.3, 0.9], [-0.6, 0.3, 1.4], [0.6, 0.6, 1.4], [1.6, 0.3, 0.9], [1.0, 0.35, 0.3]];
      add({ id: 'bulb', name: 'Bulb', fixed: true, obj: k.group(k.tube(wirePts, 0.025, k.mat(0xc0392b)), k.at(k.sphere(0.2, bulbMat, 18), 0.6, 0.85, 1.4)), tagAt: [0.6, 1.3, 1.4],
        say: 'The bulb lights up when the loop is closed.' });
      const flow = k.flow(wirePts, { count: 14, color: BLUE, size: 0.13 });
      const g = halo(k, 0.6, 0.85, 1.4);
      root.add(flow, g);
      return { root, parts, refs: { armIn, btnIn, flow, g, s: 0 } };
    },
    evaluate(has, on) { return { alive: on, closed: on && has('arm') && has('button') }; },
    apply(out, inst) { const b = inst.byId.bulb.meshes[1].material; b.emissiveIntensity = out.closed ? 2.5 : 0; show([inst.refs.flow, inst.refs.g], out.closed); },
    tick(dt, t, inst, out) {
      const r = inst.refs, want = out && out.alive ? 1 : 0;
      r.s += (want - r.s) * Math.min(1, dt * 8);
      r.btnIn.position.y = -0.4 * r.s;
      r.armIn.rotation.z = -0.13 * r.s;
      if (out && out.closed) upd([r.flow], dt, 0.25);
    },
  });

  // =====================================================================  circuit board
  world({
    id: 'pcb-inside', name: 'Inside a circuit board', zoom: '10×', short: 'circuit board',
    view: view(0.9, 2.6, 3.4),
    intro: 'This is a tiny piece of a circuit board, 10 times bigger and pulled apart into layers. The electricity travels on copper roads, and even goes through a tunnel to the other side!',
    shellSay: 'A piece of circuit board, pulled apart into layers.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const traceTex = (col) => k.canvasTex(256, 160, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = col; c.fillRect(10, 60, 190, 26); c.fillRect(176, 60, 26, 90); c.fillRect(30, 10, 22, 140); c.fillRect(110, 110, 140, 18); });
      const layer = (y, map, color, extra) => k.at(k.box(3.0, 0.05, 1.9, k.mat(color, Object.assign({ map, transparent: true, metalness: 0.6, roughness: 0.3, alphaTest: 0.3 }, extra || {}))), 0, y, 0);
      add({ id: 'bottomCu', name: 'Bottom copper', fixed: true, obj: k.group(layer(0.3, traceTex('#ffffff'), COPPER)), tagAt: [-1.7, 0.3, 1.0],
        say: 'More copper roads on the bottom. Big boards can have many layers stacked up.' });
      add({ id: 'core', name: 'Fiberglass', fixed: true, obj: k.group(k.at(k.box(3.0, 0.4, 1.9, k.mat(0xa88a48, { roughness: 0.85 })), 0, 0.68, 0)), tagAt: [-1.7, 0.7, 1.0],
        say: 'The middle is fiberglass, glass threads in hard glue. It is strong and does not let electricity through.' });
      add({ id: 'via', name: 'Via', obj: k.group(k.at(k.cyl(0.08, 0.08, 0.9, k.metal(COPPER, { roughness: 0.3 }), 16), 0.65, 0.72, -0.23)), blockedBy: ['topCu'], pull: [1.8, 0.6, 1.2], tagAt: [1.1, 0.75, -0.2],
        say: 'A via is a tiny copper tunnel that lets electricity go from the top layer to the bottom.', learn: ['The factory drills a hole, then coats the inside of the hole with copper.'] });
      add({ id: 'topCu', name: 'Copper roads', obj: k.group(layer(1.12, traceTex('#ffffff'), COPPER)), blockedBy: ['mask'], pull: [0, 1.3, 1.6], tagAt: [-1.7, 1.15, 1.0],
        say: 'Thin copper roads carry electricity between the parts.',
        learn: ['The roads start as a whole sheet of copper. The extra copper is washed away with chemicals, leaving only the roads.', 'Wide roads carry more electricity, like a wide highway carries more cars.'] });
      add({ id: 'mask', name: 'Green coat', obj: k.group(k.at(k.box(3.0, 0.04, 1.9, k.mat(0x2f8a4a, { transparent: true, opacity: 0.6, roughness: 0.3, depthWrite: false })), 0, 1.45, 0)), pull: [0, 1.8, 0], tagAt: [-1.7, 1.5, 1.0],
        say: 'The green coat protects the copper roads and keeps melted solder where it belongs.', learn: ['Green is just the most common color. Boards can be red, blue, white or black too.'] });
      const route = [[-1.35, 1.16, -0.12], [0.65, 1.16, -0.12], [0.65, 0.34, -0.23], [0.65, 0.34, 0.6], [1.5, 0.34, 0.6]];
      const flow = k.flow(route, { count: 16, color: BLUE, size: 0.14 });
      root.add(flow);
      return { root, parts, refs: { flow } };
    },
    evaluate(has, on) { return { alive: on && has('topCu') && has('via') }; },
    apply(out, inst) { show([inst.refs.flow], out.alive); },
    tick(dt, t, inst, out) { if (out && out.alive) upd([inst.refs.flow], dt, 0.2); },
  });

  // =====================================================================  diode
  world({
    id: 'diode-inside', name: 'Inside a diode', zoom: '1,000×', short: 'diode',
    view: view(0.9, 2.5, 2.5),
    intro: 'This is a diode, a thousand times bigger. Turn on the power. The electricity keeps flipping direction, and the diode only lets it through one way!',
    shellSay: 'This is a diode, a one-way gate for electricity.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      add({ id: 'p', name: 'P side', fixed: true, obj: k.group(k.at(k.box(1.5, 1.2, 1.4, k.mat(0x8a5a9a, { roughness: 0.4 })), -0.85, 0.9, 0)), tagAt: [-0.9, 1.75, 0.5],
        say: 'The P side has empty spots, called holes, where electrons are missing.' });
      add({ id: 'n', name: 'N side', fixed: true, obj: k.group(k.at(k.box(1.5, 1.2, 1.4, k.mat(0x4a6a9a, { roughness: 0.4 })), 0.85, 0.9, 0)), tagAt: [0.9, 1.75, 0.5],
        say: 'The N side has extra electrons, ready to move.' });
      const gapMat = k.mat(0xf2efe6, { transparent: true, opacity: 0.85, emissive: 0xffffff, emissiveIntensity: 0.2 });
      const gap = k.at(k.box(0.2, 1.22, 1.42, gapMat), 0, 0.9, 0);
      add({ id: 'gap', name: 'One-way gate', fixed: true, obj: k.group(gap), tagAt: [0, 2.15, 0.5],
        say: 'The middle is the gate. It lets electricity through one way, but not the other.',
        learn: ['Pushed the forward way, electrons and holes cross the middle and meet.', 'Pushed backward, they get pulled away from the middle, leaving an empty gap that nothing can cross.', 'That empty gap is called the depletion zone. Diodes turn the back-and-forth electricity from the wall into one-way electricity.'] });
      const ef = [-0.4, 0, 0.4].map((z, i) => k.flow([[1.5, 0.7 + i * 0.2, z], [-1.5, 0.7 + i * 0.2, z]], { count: 6, color: BLUE, size: 0.14, phase: i / 3 }));
      const hf = [-0.4, 0, 0.4].map((z, i) => k.flow([[-1.5, 1.1 - i * 0.2, z + 0.15], [1.5, 1.1 - i * 0.2, z + 0.15]], { count: 5, color: PINK, size: 0.13, phase: i / 3 }));
      const fwd = k.label('Forward: it flows!', { size: 0.22, bg: 'rgba(30,140,80,0.9)' }), back = k.label('Backward: blocked', { size: 0.22, bg: 'rgba(160,40,40,0.9)' });
      fwd.position.set(0, 2.6, 0); back.position.set(0, 2.6, 0);
      root.add(...ef, ...hf, fwd, back);
      return { root, parts, refs: { ef, hf, fwd, back, gap, clock: 0 } };
    },
    evaluate(has, on) { return { alive: on }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      if (on) r.clock += dt;
      const forward = on && Math.floor(r.clock / 2.5) % 2 === 0;
      show(r.ef, forward); show(r.hf, forward);
      if (forward) { upd(r.ef, dt, 0.35); upd(r.hf, dt, 0.35); }
      r.fwd.visible = forward; r.back.visible = on && !forward;
      const want = on && !forward ? 0.8 : 0.12, g = inst.byId.gap.meshes[0];
      g.scale.x += (want / 0.2 - g.scale.x) * Math.min(1, dt * 4);
    },
  });

  // Glowing light dots we move by hand (flows can't stop partway, these can).
  const lightDots = (k, root, n, color, size) => Array.from({ length: n }, () => {
    const m = k.mesh(new T.SphereGeometry(size || 0.09, 12, 8), new T.MeshBasicMaterial({ color, toneMapped: false }));
    m.userData.noPick = true; root.add(m); return m;
  });

  // =====================================================================  polarizer
  world({
    id: 'polarizer-inside', name: 'Inside a polarizer', zoom: '10,000×', short: 'polarizer',
    view: view(1.2, 4.3, 5.2, -0.9, 0.3),
    intro: 'This is a polarizer, 10,000 times bigger. Light wiggles as it travels. The blue light wiggles up and down. The yellow light wiggles side to side. Watch which one gets through! Then pull the long chains out and see what happens.',
    shellSay: 'A polarizer sheet, seen from the side, with light going through it.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const chains = k.group(), chainMat = k.mat(0xe8e2f0, { roughness: 0.5 }), iodine = k.mat(0x5a2a7a, { roughness: 0.4 });
      for (let r = 0; r < 9; r++) for (const x of [-0.07, 0.07]) {
        const y = 0.3 + r * 0.24;
        chains.add(k.at(k.rot(k.cyl(0.03, 0.03, 2.1, chainMat, 8), Math.PI / 2, 0, 0), x, y, 0));
        for (let d = 0; d < 7; d++) chains.add(k.at(k.sphere(0.045, iodine, 8), x, y, -0.9 + d * 0.3));
      }
      add({ id: 'chains', name: 'Long chains', obj: chains, blockedBy: ['films'], pull: [0, 0, -3.2], tagAt: [0, 2.55, -1.1],
        say: 'Long plastic chains, all stretched to point the same way, with purple iodine stuck along them.',
        learn: ['Light that wiggles along the chains gets soaked up by them. Light that wiggles across the chains slips through the gaps.', 'Makers stretch the plastic like taffy so every chain lines up. Then they dip it in iodine, which does the soaking up.', 'The light that gets through is called polarized light. Your screen needs two of these sheets, turned different ways, to make a picture.'] });
      const filmMat = k.mat(0xdff3ff, { transparent: true, opacity: 0.3, roughness: 0.2, depthWrite: false });
      add({ id: 'films', name: 'Clear covers', obj: k.group(k.at(k.box(0.06, 2.4, 2.4, filmMat), -0.22, 1.25, 0), k.at(k.box(0.06, 2.4, 2.4, filmMat), 0.22, 1.25, 0)), pull: [0, 3.0, 0], tagAt: [0.25, 2.75, 0.9],
        say: 'Two clear covers keep water and scratches away from the chains.',
        learn: ['The chains are delicate. Water makes them lose their line, and then the filter stops working.', 'One of these is peeled off in the factory so the sheet can be glued onto the glass.'] });
      const inLab = k.label('Light comes in', { size: 0.15 }); inLab.position.set(-2.4, 2.35, 0);
      const outLab = k.label('Light goes out', { size: 0.15 }); outLab.position.set(2.4, 2.35, 0);
      const vDots = lightDots(k, root, 14, 0x6fc8ff, 0.1), hDots = lightDots(k, root, 14, 0xffd23a, 0.1);
      const hStop = k.label('Soaked up!', { size: 0.16, bg: 'rgba(120,60,150,0.9)' }); hStop.position.set(0.5, 0.15, -0.55); hStop.visible = false;
      root.add(inLab, outLab, hStop);
      return { root, parts, refs: { vDots, hDots, hStop, s: 0 } };
    },
    evaluate(has, on) { return { alive: on, filter: has('chains') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive, filt = out && out.filter;
      r.s = (r.s + dt * 0.12) % 1;
      const place = (dots, vertical) => dots.forEach((m, i) => {
        const f = (r.s + i / dots.length) % 1, x = -2.6 + f * 5.2, w = 0.32 * Math.sin(x * 5);
        m.position.set(x, vertical ? 1.25 + w : 1.25, vertical ? 0.55 : -0.55 + w);
        m.visible = on && !(!vertical && filt && x > 0.05);
      });
      place(r.vDots, true); place(r.hDots, false);
      r.hStop.visible = !!(on && filt);
    },
  });

  // =====================================================================  color filter
  world({
    id: 'filter-inside', name: 'Inside the color filter', zoom: '1,000×', short: 'color filter',
    view: view(1.4, 4.2, 5.0, -0.5, 0.35),
    intro: 'This is the color filter, 1,000 times bigger. White light is really red, green and blue light mixed together. Each colored window only lets its own color through. Try pulling a window out!',
    shellSay: 'Three colored windows, one for each color dot.',
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const COLS = [['red', 0xff3030], ['green', 0x30ff60], ['blue', 0x3060ff]], X = [-1.0, 0, 1.0];
      const grid = k.group(), black = k.mat(0x111114, { roughness: 0.8 });
      [-1.5, -0.5, 0.5, 1.5].forEach((x) => grid.add(k.at(k.box(0.12, 0.3, 1.2, black), x, 1.5, 0)));
      add({ id: 'grid', name: 'Black grid', fixed: true, obj: grid, tagAt: [-1.5, 1.95, 0.6],
        say: 'Thin black walls sit between the windows so the colors stay crisp.',
        learn: ['Without them, light would leak from one color into the next and the picture would look washed out.', 'It is called the black matrix. It also soaks up light coming in from the room, so the screen looks darker when it is off.'] });
      COLS.forEach(([nm, c], i) => {
        const win = k.at(k.box(0.88, 0.25, 1.2, k.mat(c, { transparent: true, opacity: 0.8, roughness: 0.3, emissive: c, emissiveIntensity: 0.3 })), X[i], 1.5, 0);
        add({ id: nm, name: nm[0].toUpperCase() + nm.slice(1) + ' window', obj: k.group(win), pull: [X[i] * 1.6, 1.8, 1.2], tagAt: [X[i], 1.9, 0.6],
          say: `This window is full of ${nm} dye. It soaks up the other colors and only lets ${nm} light through.`,
          learn: [`Pull it out and that dot lets all the colors through, so it shines white instead of ${nm}.`, 'The dye is printed on in a very thin layer, thinner than a hair.'] });
      });
      const dots = [];
      X.forEach((x, w) => COLS.forEach(([, c], j) => lightDots(k, root, 4, c, 0.08).forEach((m, n) => dots.push({ m, w, j, x: x - 0.25 + j * 0.25, ph: n / 4 }))));
      const lab = k.label('White light from below', { size: 0.15 }); lab.position.set(0, -0.15, 0.9);
      root.add(lab);
      return { root, parts, refs: { dots, s: 0, ids: COLS.map((c) => c[0]) } };
    },
    evaluate(has, on) { return { alive: on, win: ['red', 'green', 'blue'].map((id) => has(id)) }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, on = out && out.alive;
      r.s = (r.s + dt * 0.25) % 1;
      r.dots.forEach((d) => {
        const f = (r.s + d.ph) % 1, y = f * 3.2;
        d.m.position.set(d.x, y, 0.15);
        const blocked = out && out.win && out.win[d.w] && d.w !== d.j && y > 1.4;
        d.m.visible = !!on && !blocked;
      });
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
