/* Toaster: hot wires, a lever that stays down, a timer and a spring that pops the toast. Beginner 7 pieces, Medium 22, Advanced 55.
 * Power = push the lever down. The wires glow over a few seconds, the slice browns (the browning dial picks how dark),
 * then the timer lets go and the spring pops it up. The cycle repeats while the power is on.
 * Also registers one inside world: 'heating-wire' (nichrome atoms jiggling and glowing, with an Electricity dial). */
(function () {
  const T = window.THREE;
  const { world, view, part, halo } = TAL.wk;
  const TIMES = '×';
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const tmpA = new T.Color(), tmpB = new T.Color();
  // red hot color for a heat level 0..1 (dull red, then orange, then yellow-orange)
  function hotColor(out, h) {
    out.setHex(0x300200).lerp(tmpA.setHex(0xd80600), clamp01(h * 1.7 - 0.1)).lerp(tmpB.setHex(0xff2400), clamp01((h - 0.6) * 2.5));
    return out;
  }

  // =====================================================================  world: inside a heating wire
  world({
    id: 'heating-wire', name: 'Inside a heating wire', zoom: '100,000,000' + TIMES, short: 'heating wire',
    view: view(1.3, 3.7, 5.4, -0.4, 0.3),
    dial: {
      label: 'Electricity',
      steps: [
        { name: 'None', level: 0, say: 'No electricity. The electrons sit still and the atoms are calm. The wire is cold.' },
        { name: 'Some', level: 0.55, say: 'Some electricity. The electrons push through and bump the atoms. The atoms jiggle and the wire warms up and starts to glow a dull red.' },
        { name: 'A lot', level: 1, say: 'A lot of electricity! Lots of bumping, so the atoms jiggle hard. The wire gets so hot it glows bright orange, just like in a toaster.' },
      ],
    },
    intro: 'We shrank down inside a toaster wire, a hundred million times bigger! The balls are metal atoms and the little blue lights are electrons. Tap the Electricity button to push more electrons through. Watch the atoms jiggle and glow, and look at the wire on the right.',
    shellSay: 'A piece of toaster wire, with the atoms inside it.',
    learn: [
      'The wire is made of metal atoms in neat rows. Electrons squeeze through between them, like people squeezing through a crowd.',
      'The electrons keep bumping into the atoms. Each bump makes an atom jiggle a little more. Jiggling atoms are what we call heat.',
      'This wire is nichrome, mostly nickel with some chromium mixed in. It pushes back hard on the electrons, so it gets very hot, and it does not wear out quickly even when it glows.',
      'Anything hot enough gives off light. Jiggling atoms glow dull red first, then orange. A copper cord stays cool because electrons slide through it easily, so there is not much bumping.',
    ],
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const NX = 6, NY = 3, NZ = 3, G = 0.62, YC = 1.17;
      const atoms = [], ag = k.group();
      for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) for (let l = 0; l < NZ; l++) {
        const cr = (i + 2 * j + 3 * l) % 5 === 0;
        const m = k.sphere(cr ? 0.16 : 0.18, k.glow(cr ? 0x6f8fc0 : 0xc3c8d0, 0xff2a00), 16);
        const x = (i - 2.5) * G, y = 0.55 + j * G, z = (l - 1) * G;
        m.position.set(x, y, z); ag.add(m);
        atoms.push({ m, base: cr ? 0x6f8fc0 : 0xc3c8d0, x, y, z, ph: ((i * 7 + j * 13 + l * 3) % 17) * 0.37 });
      }
      add({ id: 'atoms', name: 'Metal atoms', fixed: true, obj: ag, tagAt: [-1.6, 2.5, 0.8],
        say: 'These are the metal atoms. They are packed in neat rows, like marbles in a box.',
        learn: ['Most of the balls are nickel atoms, and the blue-gray ones are chromium. Together they make the metal nichrome.',
          'When electrons push through, they keep bumping into the atoms. Every bump makes the atoms jiggle, and jiggling is heat.',
          'Nichrome is picked because it pushes back hard on the electrons, so it gets very hot, and because it does not burn up quickly, even when it is red hot.',
          'Copper lets electrons slide through easily, so a copper cord stays cool. A heating wire is the opposite on purpose.'] });
      const eg = k.group(), electrons = [], eMat = () => { const m = k.glow(0x2a48ff, 0x4f8dff); m.emissiveIntensity = 1.6; return m; };
      [[0.86, -0.31], [0.86, 0.31], [1.48, -0.31], [1.48, 0.31], [1.17, -0.31], [1.17, 0.31]].forEach(([y, z], i) => {
        const m = k.sphere(0.12, eMat(), 12); eg.add(m); electrons.push({ m, y, z, ph: i / 6 });
      });
      add({ id: 'electrons', name: 'Electrons', obj: eg, pull: [0, 2.2, 2.0], tagAt: [-2.6, 1.9, 0.3],
        say: 'These little blue lights are electrons. Moving electrons are electricity!',
        breaks: 'No moving electrons means no electricity, so there is no heat. The wire stays cold.',
        learn: ['They are like tiny people squeezing through a crowd of big atoms.',
          'Electrons are much, much smaller than atoms. Electricity is a stream of them all moving the same way.',
          'The more you push, the more of them flow each second. That flow is called current, and a bigger current means more bumping and more heat.'] });
      const coatMat = k.mat(0x9aa3ad, { transparent: true, opacity: 0.2, roughness: 0.2, metalness: 0.6, depthWrite: false, side: T.DoubleSide });
      const coat = k.at(k.rot(k.cyl(1.2, 1.2, 3.9, coatMat, 28, true), 0, 0, Math.PI / 2), 0, YC, 0);
      coat.userData.pickThrough = true;
      add({ id: 'coat', name: 'Oxide skin', obj: k.group(coat), pull: [0, 2.0, 1.8], tagAt: [1.6, 2.5, 0.4],
        say: 'The outside of the wire has a very thin skin that guards the hot metal from the air.',
        breaks: 'Without its skin, air touches the hot metal and slowly burns it away. The wire would not last long!', breaksAlways: true,
        learn: ['The skin is like a raincoat. It keeps the air from reaching the metal under it.',
          'When nichrome gets hot, the chromium on the outside joins with oxygen from the air and makes a thin, hard layer called chromium oxide.',
          'That layer keeps more air out, which is the main reason nichrome wire can glow hot again and again without wearing away.'] });
      // what you would see: a short piece of the wire
      const resMat = k.glow(0x6b6b72, 0xff5a10);
      const res = k.at(k.rot(k.cyl(0.17, 0.17, 1.4, resMat, 16), 0, 0, Math.PI / 2), 3.4, YC, 0);
      res.userData.noPick = true; root.add(res);
      const aura = halo(k, 3.4, YC, 0.1, 0xff2a00, 2.6); root.add(aura);
      const lab = (txt, x, y, z, bg) => { const l = k.label(txt, { size: 0.16, bg }); l.position.set(x, y, z); root.add(l); return l; };
      lab('What you see', 3.4, 2.1, 0, 'rgba(60,60,70,0.92)');
      const cold = lab('Cold wire', 3.4, 0.3, 0, 'rgba(70,70,80,0.92)');
      const warm = lab('Warm, a dull red glow', 3.4, 0.3, 0, 'rgba(170,70,20,0.92)');
      const hot = lab('Glowing hot!', 3.4, 0.3, 0, 'rgba(200,80,10,0.92)');
      const bump = lab('Electrons bump the atoms', -0.4, -0.15, 0.9, 'rgba(30,70,190,0.92)');
      const jig = lab('Jiggling atoms are heat', 0.0, 3.0, 0.9, 'rgba(200,80,10,0.92)');
      return { root, parts, refs: { atoms, electrons, resMat, res, aura, cold, warm, hot, bump, jig, cur: 0, heat: 0, clock: 0 } };
    },
    evaluate(has, on) { return { alive: on, push: has('electrons'), coat: has('coat') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, lvl = inst.def.dial.steps[inst.dial || 0].level;
      const want = out && out.alive && out.push ? lvl : 0;
      r.cur += (want - r.cur) * Math.min(1, dt * 2.2);
      r.heat += (r.cur - r.heat) * Math.min(1, dt * 0.8);
      r.clock += dt * (0.03 + 0.3 * r.cur);
      const h = r.heat, jit = 0.012 + 0.1 * h;
      const col = hotColor(new T.Color(), h);
      r.atoms.forEach((a) => {
        a.m.position.set(a.x + jit * Math.sin(t * (17 + a.ph) + a.ph * 5), a.y + jit * Math.sin(t * (19 + a.ph * 0.7) + a.ph * 3), a.z + jit * Math.sin(t * (15 + a.ph) + a.ph * 7));
        const mt = a.m.material; mt.emissive.copy(col); mt.emissiveIntensity = h * 1.5; mt.color.setHex(a.base).lerp(tmpA.setHex(0x40100a), h * 0.8);
      });
      r.electrons.forEach((e) => {
        const f = (e.ph + r.clock) % 1, x = -2.5 + 5.0 * f;
        const bumpy = 0.04 + 0.12 * r.cur;
        e.m.position.set(x, e.y + bumpy * Math.sin(x * 7 + e.ph * 9), e.z + bumpy * Math.sin(x * 5 + e.ph * 11));
      });
      r.resMat.emissive.copy(col); r.resMat.emissiveIntensity = h * 1.7;
      r.resMat.color.setHex(0x6b6b72).lerp(tmpA.setHex(0x4a1606), clamp01(h));
      r.aura.visible = h > 0.2; r.aura.material.opacity = 0.7 * h * h; r.aura.scale.setScalar(1.8 + 1.4 * h);
      const on = !!(out && out.alive);
      r.cold.visible = on && h < 0.12; r.warm.visible = on && h >= 0.12 && h < 0.6; r.hot.visible = on && h >= 0.6;
      r.bump.visible = on && r.cur > 0.15; r.jig.visible = on && h > 0.25;
    },
  });

  Object.assign(TAL.insideByName, { 'Heating wires': 'heating-wire', 'Switch contacts': 'switch-inside' });
  TAL.introMore = TAL.introMore || {};
  TAL.introMore.toaster = [
    'A toaster is a pair of tiny, safe campfires. Electricity heats thin wires until they glow, and the glow browns the bread.',
    'The lever pushes the bread down and closes a switch. A timer counts, and when the time is up it lets go, and a spring pops the toast back up.',
    'The wires are a metal called nichrome, wound on cards of mica. Both can get very hot without burning. The browning dial sets how long the timer waits.',
  ];

  // =====================================================================  the toaster
  const rr = (p, w, h, r) => {
    const x = -w / 2, y = -h / 2;
    p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    p.lineTo(x + w, y + h - r); p.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    p.lineTo(x + r, y + h); p.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    p.lineTo(x, y + r); p.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return p;
  };
  const helixY = (cx, cz, y0, h, r, turns, n) => Array.from({ length: n || 60 }, (_, i) => { const f = i / ((n || 60) - 1), a = f * turns * Math.PI * 2; return [cx + Math.cos(a) * r, y0 + h * f, cz + Math.sin(a) * r]; });
  const DUR = [4.4, 6.6, 9.0];          // seconds for Light / Medium / Dark
  const SET_NAMES = ['Light', 'Medium', 'Dark'];
  const SET_SAY = ['Light toast. The timer lets go sooner.', 'Medium toast. Just right.', 'Dark toast. The timer waits longer.'];
  // bread color for a brown level (0 pale, 0.4 light, 0.7 golden, 1 dark, 1.4+ burnt)
  const STOPS = [[0, 0xf1dfb4], [0.4, 0xe3bd78], [0.7, 0xbd7d33], [1.0, 0x7a4418], [1.45, 0x1c120d]];
  function breadColor(out, b, crust) {
    let i = 0; while (i < STOPS.length - 2 && b > STOPS[i + 1][0]) i++;
    const a = STOPS[i], c = STOPS[i + 1], f = clamp01((b - a[0]) / (c[0] - a[0]));
    out.setHex(a[1]).lerp(tmpA.setHex(c[1]), f);
    if (crust) out.multiplyScalar(0.82);
    return out;
  }

  // inside views for the small electronic and metal parts (the worlds live in worlds.js / worlds-more.js)
  Object.assign(TAL.insideByName, {
    'Thermal fuse': 'fuse-inside', 'Timing capacitor': 'cap-inside', 'Timing resistor': 'resistor-inside', 'Dropping resistor': 'resistor-inside',
    'Rectifier diode': 'diode-inside', 'Control transistor': 'transistor', 'Timer': 'pcb-inside', 'Lead wires': 'wire-inside',
    'Terminal screw': 'screw-inside', 'Moving contact blade': 'switch-inside',
  });

  TAL.registerDevice({
    id: 'toaster',
    name: 'Toaster',
    short: 'toaster',
    subtitle: 'Glowing wires that make toast',
    powerSound: 'click',
    channels: false,
    view: { target: [-0.6, 1.5, 0], radius: 3.6, explodedRadius: 7.0, explodedY: 2.0, yaw: -0.3, pitch: 0.3, shadow: [6, 3] },
    intro: 'This is a toaster. Press the green power button to push the lever down. The wires glow and the toast turns brown! Tap the dial to pick how dark.',
    shellSay: "That's the shiny body of the toaster. The front is clear so you can see inside. Try the X-ray button too!",
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button. It pushes the lever down. Watch the wires glow and the toast turn brown!", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['tray'], say: 'Slide out the crumb tray at the bottom. Does the toaster still work?', nudge: 'Pull out the crumb tray.' },
      { do: 'remove', ids: ['sc1', 'sc2', 'sc3', 'sc4'], levels: [2, 3], say: 'Twist out the screws on top.', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['top'], levels: [2, 3], say: 'Lift off the top cover so you can see inside.', nudge: 'Pull off the top cover.' },
      { do: 'remove', ids: ['spring'], say: 'Pull out the shiny spring. Watch what the toast does when the timer finishes!', nudge: 'Pull out the spring.' },
      { do: 'remove', ids: ['wires'], say: 'Now pull out the heating wires. What happens to the glow?', nudge: 'Pull out the glowing wires.' },
      { do: 'remove', ids: ['fuse'], levels: [2, 3], say: 'Find the little safety fuse and pull it out. What happens?', nudge: 'Pull out the glowing fuse.' },
      { do: 'remove', ids: ['cord'], say: 'Last one. Pull out the power cord!', nudge: 'Pull out the power cord.' },
      { do: 'end', say: 'A toaster needs electricity, hot wires, a lever that stays down, a timer and a spring. Put them all back and press power again!' },
    ],

    build(k) {
      const root = k.group();
      const parts = [];
      const add = (s) => { parts.push(s); return s; };
      const sub = (parentObj, parentId, spec) => { parentObj.add(spec.obj); spec.parent = parentId; return add(spec); };
      const chrome = () => k.metal(0xc9ced6, { roughness: 0.2, metalness: 0.95 });
      const steel = (c) => k.metal(c || 0xb3b9c1, { roughness: 0.3 });
      const brass = k.metal(0xd8b45a, { roughness: 0.28 });
      const dark = (c) => k.mat(c || 0x1d1e22, { roughness: 0.55 });
      const rubber = () => k.mat(0x2a2b2f, { roughness: 0.9 });
      // a lying (axial) cylinder: axis 'x' or 'z'
      const lie = (axis, r, len, m, x, y, z, seg) => { const c = k.cyl(r, r, len, m, seg || 12); if (axis === 'x') c.rotation.z = Math.PI / 2; else c.rotation.x = Math.PI / 2; return k.at(c, x, y, z); };
      // a tiny screw (head up, +Y)
      const miniScrew = (x, y, z) => k.at(k.group(k.at(k.cyl(0.05, 0.05, 0.03, steel(0xb08a3a), 12), 0, 0.015, 0), k.at(k.box(0.07, 0.01, 0.015, 0x2a2a2a), 0, 0.032, 0), k.at(k.cyl(0.02, 0.015, 0.12, steel(0xb08a3a), 8), 0, -0.06, 0)), x, y, z);

      // ---- shell: floor, ends, back, and a clear front so you can see in
      const wall = () => k.metal(0xcfd3d9, { roughness: 0.35, metalness: 0.6 });
      const glass = k.glass(0xeef5fa, 0.08, { side: T.DoubleSide });
      const front = k.at(k.box(3.8, 1.6, 0.03, glass), 0, 1.1, 0.84);
      front.userData.pickThrough = true;
      const shell = k.group(
        k.at(k.box(0.1, 1.6, 1.7, wall()), -1.9, 1.1, 0),
        k.at(k.box(0.1, 1.6, 1.7, wall()), 1.9, 1.1, 0),
        k.at(k.box(3.9, 1.6, 0.08, wall()), 0, 1.1, -0.81),
        front,
        k.at(k.box(3.9, 0.1, 0.06, wall()), 0, 0.37, 0.84)
      );
      root.add(shell);
      const slot = k.at(k.box(0.03, 0.95, 0.1, dark()), 1.955, 1.1, 0);
      slot.userData.noPick = true; root.add(slot);

      // ---- power state shown on the wires: glow sprites and a warm light
      const glowF = halo(k, 0, 1.18, 0.45, 0xff2a00, 3.2), glowB = halo(k, 0, 1.18, -0.45, 0xff2a00, 3.2);
      root.add(glowF, glowB);
      const warmLight = new T.PointLight(0xff4a10, 0, 5); warmLight.position.set(0, 1.2, 0); root.add(warmLight);
      const burnt = k.label('Burnt toast!', { size: 0.2, bg: 'rgba(60,40,30,0.92)' }); burnt.position.set(0, 3.5, 0); burnt.visible = false; root.add(burnt);

      // ---- crumb tray
      const tray = k.group(k.at(k.box(3.7, 0.04, 1.6, steel(0x585d66)), 0, 0.3, 0), k.at(k.box(1.0, 0.1, 0.06, chrome()), 0, 0.31, 0.86));
      for (let i = 0; i < 14; i++) tray.add(k.at(k.box(0.05 + (i % 3) * 0.02, 0.02, 0.05, k.mat(0x7a5a30, { roughness: 0.9 })), -1.6 + ((i * 37) % 32) * 0.1, 0.325, -0.65 + ((i * 53) % 13) * 0.1));
      root.add(tray);
      add({ id: 'tray', name: 'Crumb tray', obj: tray, pull: [0, -0.4, 2.6], face: [0, 0, 1], focusRadius: 1.8,
        say: 'The crumb tray slides out. It catches crumbs that fall off the toast.',
        job: 'It catches crumbs so they do not pile up near the hot wires.',
        learn: ['Think of it as a little basket under the toaster that catches whatever falls.',
          'Crumbs piling up near hot wires can smoke, and could even catch fire. That is why you empty the tray every so often.',
          'You slide it out and shake it over the bin. It is thin metal, so it can take the heat.'] });

      // ---- rubber feet (four)
      [[-1.7, 0.6], [1.7, 0.6], [-1.7, -0.6], [1.7, -0.6]].forEach(([x, z], i) => {
        const g = k.group(k.at(k.cyl(0.14, 0.16, 0.2, rubber(), 14), x, 0.1, z));
        root.add(g);
        add({ id: 'ft' + (i + 1), name: 'Rubber foot', obj: g, pull: [x * 0.7, -0.9, z * 2.4], level: 3, face: [0, -1, 0], focusRadius: 0.5,
          say: 'A rubber foot keeps the toaster from sliding and keeps the heat off the table.', job: 'It grips the table and keeps the toaster steady.',
          learn: ['It is like a little shoe for the toaster.',
            'Rubber grips better than metal, so the toaster does not slide when you push the lever down.',
            'The gap the feet make also lets air flow under the toaster, and keeps the hot floor of the toaster off the table.'] });
      });

      // ---- heating wires (front element) + back element, mica cards, end terminals
      const wireMat = k.glow(0x6b6b72, 0xff5a10);
      const zig = (z) => {
        const pts = [];
        for (let i = 0; i < 11; i++) { const y = 0.62 + i * 0.115, d = i % 2 ? -1 : 1; pts.push([-1.12 * d, y, z], [0, y, z], [1.12 * d, y, z]); }
        return k.tube(pts, 0.02, wireMat);
      };
      const wireF = zig(0.37), wireF2 = zig(0.31), wireB = zig(-0.37), wireB2 = zig(-0.31);
      const wires = k.group(wireF, wireF2);
      root.add(wires);
      add({ id: 'wires', name: 'Heating wires', obj: wires, pull: [-1.5, 1.9, 2.0], blockedBy: ['top'], face: [0, 0, 1], focusRadius: 1.9,
        say: 'These thin wires get red hot and toast the bread. They are like two tiny campfires!',
        breaks: 'No hot wires, no toast! Nothing glows and the bread stays pale.', symptom: 'The lever goes down, but nothing glows and the toast stays pale.',
        learn: ['The glowing wires are like two tiny campfires, one on each side of the bread.',
          'They are made of nichrome, a mix of nickel and chromium. Electricity has a hard time squeezing through it, and that makes it hot. Tap Look inside to shrink down inside!',
          'Most of the heat from a red hot wire travels as invisible infrared light. It warms the surface of the bread and browns it.',
          'Nichrome is used because it can glow hot again and again without wearing away fast. A thin skin of chromium oxide forms on it and protects it.'] });
      sub(wires, 'wires', { id: 'wiresB', name: 'Heating wires (back)', obj: k.group(wireB, wireB2), pull: [-1.5, 2.0, -2.0], level: 3, blockedBy: ['top'], face: [0, 0, -1], focusRadius: 1.9,
        say: 'This is the second set of heating wires. It toasts the other side of the bread.',
        breaks: 'One side of the toast stays pale, and the other side browns slowly.',
        learn: ['Two campfires, one on each side, so both sides of the bread get brown.',
          'A toaster slot has a heating element on each side of the bread. They glow together so the slice browns evenly.',
          'Each element is a long thin ribbon of nichrome wound back and forth around a mica card, so a lot of hot wire fits in a small space.'] });
      const micaTex = k.canvasTex(256, 128, (c, w, h) => {
        c.fillStyle = '#dcc690'; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${150 + (i * 7) % 60},${120 + (i * 11) % 50},60,0.18)`; c.fillRect((i * 37) % w, 0, 2 + (i % 4), h); }
        c.fillStyle = 'rgba(90,70,40,0.5)'; [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
      });
      const micaMat = () => k.mat(0xffffff, { map: micaTex, transparent: true, opacity: 0.35, roughness: 0.8, depthWrite: false });
      const micaF = k.group(k.at(k.box(2.6, 1.4, 0.025, micaMat()), 0, 1.18, 0.34));
      sub(wires, 'wires', { id: 'mica', name: 'Mica cards', obj: micaF, pull: [-0.4, 2.2, 2.5], level: 2, face: [0, 0, 1], focusRadius: 1.9,
        say: 'The wires are wrapped around flat cards made of mica, a shiny rock that does not burn.',
        breaks: 'The hot wires have nothing to hold them, so they would flop around. That is not safe!',
        learn: ['Think of the card like the spool that thread wraps around. It holds the wire in place.',
          'Mica is a rock that splits into thin shiny sheets. It can get very hot without burning or melting.',
          'It also does not carry electricity, so the wire\'s electricity cannot leak into the case. Mica has been used in toasters and hair dryers for a long time.'] });
      sub(micaF, 'mica', { id: 'micaB', name: 'Mica card (back)', obj: k.group(k.at(k.box(2.6, 1.4, 0.025, micaMat()), 0, 1.18, -0.34)), pull: [-0.4, 2.3, -2.5], level: 3, face: [0, 0, -1], focusRadius: 1.9,
        say: 'The back mica card holds the wires on the far side of the bread.',
        breaks: 'The back wires have nothing to hold them, so that side stops toasting.',
        learn: ['It is the spool for the second set of wire.',
          'Each side of the slot has its own card, so the bread sits between two hot walls.',
          'Mica is used because it stays strong and does not carry electricity even when it is glowing hot nearby.'] });
      const crimpMat = () => k.metal(0xc8a050, { roughness: 0.3 });
      const crimp = (id, parentId, parentObj, z, pullV) => sub(parentObj, parentId, { id, name: 'Crimp terminal', obj: k.group(k.at(k.box(0.12, 0.07, 0.05, crimpMat()), -1.17, 0.58, z), k.at(k.box(0.07, 0.03, 0.04, crimpMat()), -1.25, 0.58, z)), pull: pullV, level: 3, face: [0, 0, z > 0 ? 1 : -1], focusRadius: 0.5,
        say: 'A little metal clip squeezed onto the end of the heating wire. The electricity goes in through it.',
        breaks: 'The heating wire gets no electricity, so that side stays cold.',
        learn: ['It is like a plug on the end of the heating wire.',
          'A crimp terminal is squeezed tight onto the wire with a tool, so the join is strong and touches the metal well.',
          'Solder does not stick well to nichrome and would melt in that heat, so a squeezed metal clip is a common way to join it.'] });
      crimp('crF', 'wires', wires, 0.37, [-1.6, 0.4, 1.4]);
      // the back crimp rides inside the back wires; create it after them
      const wiresBObj = parts.find((p) => p.id === 'wiresB').obj;
      crimp('crB', 'wiresB', wiresBObj, -0.37, [-1.6, 0.4, -1.4]);

      // ---- guard wires (front) + back
      const guardRods = (z) => {
        const g = k.group();
        for (let i = 0; i < 13; i++) g.add(k.at(k.cyl(0.01, 0.01, 1.3, steel(0xcfd5dc), 6), -1.2 + i * 0.2, 1.2, z));
        [0.7, 1.2, 1.7].forEach((y) => g.add(k.at(k.rot(k.cyl(0.012, 0.012, 2.4, steel(0xcfd5dc), 6), 0, 0, Math.PI / 2), 0, y, z)));
        return g;
      };
      const guard = guardRods(0.2);
      add({ id: 'guard', name: 'Guard wires', obj: guard, pull: [1.0, 2.0, 2.1], level: 2, blockedBy: ['top'], face: [0, 0, 1], focusRadius: 1.9,
        say: 'These thin steel rods keep the bread away from the hot wires.', job: 'They keep the bread from touching the hot wires.',
        learn: ['They are like a fence between the bread and the fire.',
          'If bread touched the hot wires, it could burn and make smoke. The fence keeps a small gap.',
          'They are thin so that the heat still reaches the bread easily.'] });
      sub(guard, 'guard', { id: 'guardB', name: 'Guard wires (back)', obj: guardRods(-0.2), pull: [1.0, 2.1, -2.1], level: 3, face: [0, 0, -1], focusRadius: 1.9,
        say: 'The same kind of steel fence on the other side of the bread.', job: 'It keeps the bread off the hot wires on the back side.',
        learn: ['A second fence, so the bread has a fence on both sides.',
          'The slice sits between the two fences, with a small gap to each hot wire.',
          'Bread can wiggle or lean as it toasts, so both sides need a guard.'] });

      // ---- element frames (two end plates that the mica cards slide into) + rivets
      const frame = (id, name, sx, pullV) => {
        const g = k.group(k.at(k.box(0.04, 1.3, 0.72, steel(0x9aa1ab)), sx * 1.36, 1.18, -0.02), k.at(k.box(0.14, 0.03, 0.72, steel(0x9aa1ab)), sx * 1.31, 0.54, -0.02), k.at(k.box(0.14, 0.03, 0.72, steel(0x9aa1ab)), sx * 1.31, 1.82, -0.02));
        root.add(g);
        add({ id, name, obj: g, pull: pullV, level: 2, blockedBy: ['top'], face: [sx, 0, 0], focusRadius: 1.0,
          say: 'A frame of thin steel stands at the end of the slot and holds the mica cards upright.', job: 'It holds the mica cards in place.',
          learn: ['It is like the frame around a picture.',
            'The mica cards are fragile, so the metal frame keeps them straight and gives them something to stand on.',
            'The frame is bent from a flat sheet of steel, which is cheap and strong and does not mind the heat.'] });
        [0.78, 1.55].forEach((y, i) => {
          sub(g, id, { id: id + 'r' + (i + 1), name: 'Frame rivet', obj: k.group(k.at(k.cyl(0.05, 0.05, 0.03, steel(0x9ea3ab), 12), sx * 1.395, y, -0.02), k.at(k.cyl(0.02, 0.02, 0.1, steel(0x9ea3ab), 8), sx * 1.34, y, -0.02)), pull: [sx * 0.7, 0.4 + i * 0.5, (i ? -1 : 1) * 1.2], level: 3,  focusRadius: 0.4,
            say: 'A rivet is a metal pin that holds two metal pieces together, squashed flat on the ends.', job: 'It holds the frame together.',
            learn: ['It is like a staple that is squashed flat, so it cannot fall out.',
              'A rivet goes through a hole in both pieces, then its end is flattened. Nothing to twist and nothing to come loose.',
              'Rivets are cheap and quick for a factory to use. A repair person drills them out to take a frame apart.'] });
        });
      };
      frame('frameL', 'Element frame (left)', -1, [-1.5, 1.0, 1.6]);
      frame('frameR', 'Element frame (right)', 1, [1.5, 1.0, 1.6]);

      // ---- rack (carriage) with the bread on it
      const moverR = k.group();
      [-1.12, 1.12].forEach((x) => moverR.add(k.at(k.box(0.05, 1.3, 0.28, steel(0x9aa1ab)), x, 1.15, 0)));
      const rack = k.group(moverR);
      root.add(rack);
      add({ id: 'rack', name: 'Bread rack', obj: rack, pull: [0.6, 2.0, 1.4], level: 2, blockedBy: ['top'], reach: [], face: [0, 0, 1], focusRadius: 1.9,
        say: 'The bread rack holds the bread and slides up and down, like an elevator for toast.',
        breaks: 'The bread has nothing to sit on, so it does not toast right!',
        learn: ['It is like a little elevator that carries the bread down and up.',
          'The lever is joined to the rack. Push the lever down and the rack goes down into the slot between the hot wires.',
          'A spring pulls the rack back up. A latch holds it down while the toast cooks.'] });
      const cradle = k.group(k.at(k.box(2.3, 0.04, 0.28, steel(0x9aa1ab)), 0, 0.5, 0));
      sub(moverR, 'rack', { id: 'cradle', name: 'Bread cradle', obj: cradle, pull: [0, -1.0, 2.0], level: 3, face: [0, 0, 1], focusRadius: 1.4,
        say: 'The cradle is the little shelf at the bottom of the rack. The bread sits on it.',
        breaks: 'The bread has no shelf to sit on, so it falls down and does not toast.',
        learn: ['It is like the seat of a swing for the bread.',
          'The bread rests on the cradle while the rack lowers it between the hot wires and lifts it out again.',
          'It is made of thin metal so crumbs fall through it into the crumb tray.'] });
      const crumbMat = k.mat(0xf1dfb4, { roughness: 0.9 }), crustMat = k.mat(0xc79a5a, { roughness: 0.8 });
      const bs = new T.Shape();
      bs.moveTo(-1.0, 0.55); bs.lineTo(1.0, 0.55); bs.lineTo(1.0, 1.55); bs.bezierCurveTo(1.18, 1.85, 0.95, 2.05, 0.6, 2.05);
      bs.lineTo(-0.6, 2.05); bs.bezierCurveTo(-0.95, 2.05, -1.18, 1.85, -1.0, 1.55); bs.lineTo(-1.0, 0.55);
      const bg = new T.ExtrudeGeometry(bs, { depth: 0.14, bevelEnabled: false, curveSegments: 12 });
      bg.translate(0, -1.3, -0.07);
      const crust = k.at(k.mesh(bg, crustMat), 0, 1.3, 0);
      const crumb = k.at(k.mesh(bg, crumbMat), 0, 1.3, 0); crumb.scale.set(0.91, 0.92, 1.25);
      const bread = k.group(crust, crumb);
      sub(moverR, 'rack', { id: 'bread', name: 'Bread slice', obj: bread, pull: [0, 2.0, 1.2], level: 2, face: [0, 0, 1], focusRadius: 1.6,
        say: 'This is a slice of bread. The hot wires turn it into toast!',
        breaks: 'No bread, no toast! The wires would just glow in an empty toaster.',
        learn: ['Toast is bread that got a tan from the wires.',
          'When bread gets hot, its sugars and its proteins change. They turn brown and taste different. That change is called the Maillard reaction.',
          'Toast longer and the brown turns black, because the bread is burning into carbon. That is why the timer matters.'] });

      // ---- lever (+ knob) and the cancel button
      const moverL = k.group(k.at(k.box(0.35, 0.1, 0.14, steel(0x6b7078)), 2.12, 1.5, 0), k.at(k.box(0.12, 0.14, 0.2, steel(0x6b7078)), 1.93, 1.5, 0));
      const lever = k.group(moverL);
      root.add(lever);
      add({ id: 'lever', name: 'Lever', obj: lever, pull: [1.6, 0.4, 1.7], face: [1, 0, 0], focusRadius: 1.0,
        say: 'The lever pushes the toast down to start toasting. It is a long handle, like on a water pump.',
        breaks: 'No lever, no way to push the bread down! Nothing starts.', symptom: 'I cannot push the bread down. Nothing starts.',
        learn: ['A long handle makes a small push into a big job, like a water pump handle.',
          'Pushing it down lowers the bread rack and closes a switch, so electricity can reach the wires.',
          'A latch clicks and holds it down while the toast cooks. When the timer is done, the latch lets go and the spring pops the lever and toast back up.'] });
      sub(moverL, 'lever', { id: 'knob', name: 'Lever knob', obj: k.group(k.at(k.sphere(0.17, dark(0x2a2b30), 18), 2.4, 1.5, 0)), pull: [0.7, 0.6, 0.6], level: 3, face: [1, 0, 0], focusRadius: 0.6,
        say: 'The knob is the part your hand holds.', job: 'It gives your hand something nice to hold and keeps your fingers off the metal lever.',
        learn: ['It is like the handle of a spoon.', 'It is made of plastic, which does not carry heat easily, so it stays comfortable to hold.', 'A round shape fits a hand or a little thumb in any direction.'] });
      const cancel = k.group(k.at(k.box(0.1, 0.16, 0.16, k.mat(0x2a2b30, { roughness: 0.5 })), 2.0, 1.82, 0.5), k.at(k.box(0.02, 0.1, 0.1, k.mat(0xd8483a, { roughness: 0.5 })), 2.07, 1.82, 0.5));
      root.add(cancel);
      add({ id: 'cancel', name: 'Cancel button', obj: cancel, pull: [1.4, 0.8, 1.4], level: 2, face: [1, 0, 0], focusRadius: 0.6,
        say: 'Push the cancel button and the toast pops up early. It is the stop button.',
        job: 'It lets you stop the toast early, before the timer is done.',
        learn: ['It is like the stop button on a music player.',
          'Pushing it moves the latch so the lever lets go. Then the spring pops the toast up, even though the timer is not finished.',
          'It is a small safety part too. If the toast starts to smoke you can stop it right away.'] });

      // ---- spring
      const springS = k.group(k.tube(helixY(0, 0, 0, 0.72, 0.1, 9), 0.015, steel(0xd7dce2)));
      springS.position.set(1.62, 0.45, -0.05);
      const spring = k.group(springS);
      root.add(spring);
      add({ id: 'spring', name: 'Spring', obj: spring, pull: [1.2, 1.5, 1.8], face: [1, 0, 0], focusRadius: 1.0,
        say: 'The spring pops the toast up when the lever lets go. It works like a jack in the box!',
        breaks: 'Without the spring, the toast does not pop up. It just stays down inside!', symptom: 'The toast cooks, but it never pops up.',
        learn: ['A spring always wants to bounce back, like the spring in a jack in the box.',
          'Pushing the lever down stretches the spring. When the latch lets go, the spring snaps back and lifts the rack and the toast.',
          'The spring is strong enough to throw the toast up a little, which is why a toaster toast can really jump.'] });

      // ---- timer: a small circuit board with a few parts, and the browning pot
      const board = k.at(k.box(0.56, 0.5, 0.03, k.mat(0xffffff, { map: k.pcbTexture(0.56, 0.5, 11, '#2f7d4a'), roughness: 0.6 })), 1.6, 1.27, 0.38);
      const timer = k.group(board);
      root.add(timer);
      add({ id: 'timer', name: 'Timer', obj: timer, pull: [1.7, 1.3, 1.9], face: [0, 0, 1], focusRadius: 0.9,
        say: 'The timer is a tiny circuit board. It decides when the toast is done, like an egg timer.',
        breaks: 'Nothing tells the toaster when to stop, so the toast keeps cooking and burns!', symptom: 'The toast keeps cooking and goes black.',
        learn: ['It is like an egg timer in the kitchen. When the time is up, it lets go.',
          'The browning dial sets how long it waits. Dark toast means a longer wait.',
          'Many toasters use a tiny circuit that counts by slowly filling up a capacitor. Some older ones use clockwork, or a strip of two metals that bends when warm. They all do the same job: they say when.'] });
      const capBody = k.group(lie('z', 0.07, 0.2, k.mat(0x1b3d7a, { roughness: 0.5 }), 1.42, 1.43, 0.5, 16), lie('z', 0.068, 0.012, steel(0xc7ccd3), 1.42, 1.43, 0.605, 16), k.at(k.box(0.025, 0.012, 0.19, k.mat(0xe8e8e8)), 1.42 - 0.07, 1.43, 0.5));
      sub(timer, 'timer', { id: 'tcap', name: 'Timing capacitor', obj: capBody, pull: [-0.6, 1.0, 1.4], level: 3, focusRadius: 0.5,
        say: 'This little can stores a bit of electricity, like a tiny water tank filling up. The timer counts while it fills.',
        breaks: 'The timer cannot count, so it never says stop. The toast keeps cooking!',
        symptom: 'The toast keeps cooking and never pops up on its own.',
        learn: ['It is like a small bucket that fills with water drip by drip. When it is full, time is up.',
          'The capacitor charges slowly through a resistor. When the voltage across it reaches a set level, a transistor switches on and tells the magnet to let go.',
          'A bigger capacitor, or a bigger resistor, fills more slowly, so the timer waits longer. That is how the dial changes the time.'] });
      const bands = [0x7a3a10, 0x111111, 0xd49a1a].map((c, i) => lie('x', 0.0245, 0.012, k.mat(c), 1.58 + i * 0.03, 1.46, 0.43, 10));
      sub(timer, 'timer', { id: 'tres', name: 'Timing resistor', obj: k.group(lie('x', 0.022, 0.13, k.mat(0xd9b27c, { roughness: 0.7 }), 1.62, 1.46, 0.43, 10), ...bands, lie('x', 0.006, 0.26, steel(0xcfd5dc), 1.62, 1.46, 0.43, 6)), pull: [0.5, 1.2, 1.4], level: 3, focusRadius: 0.4,
        say: 'A resistor is a tiny part that slows the electricity down, like a narrow bit of pipe.',
        breaks: 'The timer cannot fill its capacitor the right way, so it never says stop. The toast keeps cooking!',
        learn: ['It is like a narrow bit of pipe that lets the water drip slowly.',
          'The resistor limits how fast the capacitor charges. The colored stripes on it are a code that tells you how big the resistance is.',
          'Resistance is measured in ohms. A bigger resistance means a slower charge, so a longer wait before the toast pops.'] });
      sub(timer, 'timer', { id: 'xstr', name: 'Control transistor', obj: k.group(k.at(k.box(0.09, 0.1, 0.05, dark(0x151518)), 1.76, 1.2, 0.43), lie('z', 0.006, 0.12, steel(0xcfd5dc), 1.735, 1.2, 0.4, 6), lie('z', 0.006, 0.12, steel(0xcfd5dc), 1.76, 1.2, 0.4, 6), lie('z', 0.006, 0.12, steel(0xcfd5dc), 1.785, 1.2, 0.4, 6)), pull: [1.0, 0.8, 1.4], level: 3, focusRadius: 0.4,
        say: 'A transistor is a tiny switch with no moving parts. The timer uses it to tell the magnet to let go.',
        breaks: 'Nothing tells the magnet to let go, so the toast never pops up on its own!',
        learn: ['It is like a light switch that a very small amount of electricity can flip.',
          'When the capacitor is full enough, a small current reaches the transistor. It switches on and cuts off the electricity to the magnet.',
          'A transistor has three legs. One small signal on one leg controls a big flow between the other two. Tap Look inside to see one up close.'] });
      const potBody = k.group(k.at(k.box(0.17, 0.15, 0.1, k.mat(0x2b4a8a, { roughness: 0.6 })), 1.45, 1.1, 0.45), lie('z', 0.035, 0.36, steel(0xd0d5dc), 1.45, 1.05, 0.68, 10));
      sub(timer, 'timer', { id: 'pot', name: 'Browning pot', obj: potBody, pull: [-0.4, -0.3, 1.9], level: 3, focusRadius: 0.5,
        say: 'The browning dial turns this little part. It is a resistor you can change by turning, a potentiometer.',
        breaks: 'The dial is not joined to the timer any more, so the timer cannot count properly. The toast burns!',
        learn: ['It is like a faucet you can turn to make the drip faster or slower.',
          'Turning the dial moves a little slider along a strip of resistance. More resistance makes the capacitor charge slower, so the toast cooks longer.',
          'This is the same kind of part as the volume knob on an old radio.'] });

      // ---- latch: electromagnet, catch, catch spring, rectifier diode, dropping resistor
      const latch = k.group(lie('z', 0.2, 0.36, k.metal(0xc8743a, { roughness: 0.4 }), 1.6, 0.8, -0.4, 18));
      root.add(latch);
      add({ id: 'latch', name: 'Latch magnet', obj: latch, level: 2, pull: [1.4, 1.2, -1.6], face: [0, 0, 1], focusRadius: 0.9,
        say: 'This magnet clicks and holds the lever down while the toast cooks. Like a magnet holds a note on the fridge.',
        breaks: 'Nothing holds the lever down, so the toast pops right back up!', symptom: 'The lever will not stay down. The toast pops right back up.',
        learn: ['A magnet holding a note on the fridge holds the lever the same way.',
          'It is a coil of copper wire. When electricity flows through it, it becomes a magnet, called an electromagnet. When the electricity stops, it lets go.',
          'In many toasters, the timer cuts the electricity to this magnet and the spring pops the toast up.'] });
      sub(latch, 'latch', { id: 'catch', name: 'Latch catch', obj: k.group(k.at(k.box(0.5, 0.08, 0.1, steel(0x6b7078)), 1.6, 0.8, -0.15)), pull: [0.4, 0.4, 1.4], level: 3, focusRadius: 0.5,
        say: 'This steel hook is what the magnet grabs. It catches the lever and holds it down.',
        breaks: 'The magnet has nothing to grab, so the lever cannot stay down. The toast pops right back up!',
        learn: ['It is like the hook that holds a door shut.',
          'The lever hooks onto the catch. The magnet pulls the catch tight and keeps it there, so the lever cannot rise.',
          'When the magnet lets go, the catch swings free and the lever is released.'] });
      const latchSpr = k.group(k.tube(helixY(1.85, -0.15, 0.7, 0.1, 0.03, 5, 20), 0.008, steel(0xd7dce2)));
      sub(latch, 'latch', { id: 'lspr', name: 'Catch spring', obj: latchSpr, pull: [1.2, 0.2, 0.6], level: 3, focusRadius: 0.4,
        say: 'A very small spring pulls the catch back when the magnet lets go.',
        breaks: 'The catch does not let go when the timer is done, so the toast stays down and keeps cooking!',
        learn: ['It is like the little spring in a ballpoint pen.',
          'The magnet pulls the catch against this spring. When the magnet switches off, the spring pulls the catch back.',
          'Without it, the catch could stay stuck in place and keep the lever down.'] });
      const diode = k.group(lie('x', 0.03, 0.14, dark(0x151518), 1.6, 0.98, -0.66, 12), lie('x', 0.0315, 0.02, steel(0xd7dce2), 1.55, 0.98, -0.66, 12), lie('x', 0.006, 0.3, steel(0xcfd5dc), 1.6, 0.98, -0.66, 6));
      sub(latch, 'latch', { id: 'diode', name: 'Rectifier diode', obj: diode, pull: [1.2, 1.0, -1.0], level: 3, focusRadius: 0.4,
        say: 'A diode is a one-way gate for electricity. It lets electricity go one way only.',
        breaks: 'The magnet cannot get the steady, one-way electricity it needs, so it cannot hold the lever. The toast pops right back up!',
        symptom: 'The lever clicks down, but pops back up right away.',
        learn: ['It is like a turnstile that only turns one way.',
          'Wall electricity swings back and forth. The magnet works better on steady one-way electricity, so a diode blocks the backward swings.',
          'A diode is made from two kinds of silicon touching. Tap Look inside to see how the one-way gate works.'] });
      const dres = k.group(k.at(k.box(0.26, 0.08, 0.08, k.mat(0xe9e3d2, { roughness: 0.7 })), 1.6, 0.72, -0.66), lie('x', 0.006, 0.4, steel(0xcfd5dc), 1.6, 0.72, -0.66, 6));
      sub(latch, 'latch', { id: 'dres', name: 'Dropping resistor', obj: dres, pull: [1.0, 0.2, -1.0], level: 3, focusRadius: 0.4,
        say: 'This sturdy resistor holds back some of the wall electricity, so the small parts get a gentler push.',
        breaks: 'The little parts would get the wrong amount of electricity, and the magnet cannot hold the lever. The toast pops right back up!',
        learn: ['It is like a big valve that lets only a small trickle through.',
          'Wall power is much too strong for a little magnet and a tiny timer. A resistor in the way uses up most of the push as a bit of heat.',
          'It is white and chunky so it can handle that heat without burning.'] });

      // ---- main switch contacts (fixed + moving blade + spring), closed by the lever
      const cTop = k.at(k.box(0.5, 0.03, 0.12, brass), 1.5, 0.56, 0.45);
      const contacts = k.group(k.at(k.box(0.5, 0.03, 0.12, brass), 1.5, 0.5, 0.45));
      root.add(contacts);
      add({ id: 'contacts', name: 'Switch contacts', obj: contacts, level: 2, pull: [1.2, 0.2, 1.8], face: [0, 0, 1], focusRadius: 0.8,
        say: 'These two metal pieces touch when the lever goes down. Then electricity can flow to the wires.',
        breaks: 'They never touch, so electricity cannot reach the wires!', symptom: 'The lever goes down, but the wires never get any electricity.',
        learn: ['They are like a drawbridge. Down, and the electricity can cross. Up, and it cannot.',
          'Pushing the lever down presses one metal piece onto the other. That closes the loop, just like in a flashlight switch.',
          'Brass and similar metals are used because they carry electricity well and do not wear out when they click again and again. Tap Look inside to see how a switch works.'] });
      sub(contacts, 'contacts', { id: 'blade', name: 'Moving contact blade', obj: k.group(cTop), pull: [0.6, 1.0, 1.6], level: 3, focusRadius: 0.5,
        say: 'This springy brass blade moves down and touches the other piece when the lever goes down.',
        breaks: 'The blade never touches, so electricity cannot reach the wires!',
        learn: ['It is the other half of the drawbridge: the part that swings down.',
          'The lever pushes the blade onto the fixed piece. When they touch, the circuit is closed and current flows.',
          'Each time the toast pops up, the blade lifts off again and the wires go cold.'] });
      const cSpr = k.group(k.tube(helixY(0, 0, 0, 0.12, 0.04, 5, 20), 0.008, steel(0xd7dce2)));
      cSpr.position.set(1.66, 0.58, 0.45);
      sub(contacts, 'contacts', { id: 'cspring', name: 'Contact spring', obj: k.group(cSpr), pull: [1.0, 0.6, 1.4], level: 3, focusRadius: 0.4,
        say: 'A small spring presses the two metal pieces together so they touch firmly.',
        breaks: 'The two pieces do not press together well, so electricity cannot get through to the wires!',
        learn: ['It is like a thumb pressing two papers together.',
          'A firm squeeze keeps the metal touching all over, so the electricity passes easily and does not make sparks.',
          'A weak or missing spring makes a poor connection that heats up, which is why contacts have one.'] });

      // ---- browning dial
      const dialKnob = k.group(k.at(k.rot(k.cyl(0.22, 0.22, 0.16, dark(0x2a2b30), 24), Math.PI / 2, 0, 0), 0, 0, 0.08), k.at(k.box(0.05, 0.16, 0.02), 0, 0.1, 0.17));
      dialKnob.children[1].material = k.mat(0xffd23a, { roughness: 0.5 });
      dialKnob.position.set(1.45, 1.05, 0.92);
      const dial = k.group(k.at(k.rot(k.cyl(0.34, 0.34, 0.03, chrome(), 24), Math.PI / 2, 0, 0), 1.45, 1.05, 0.88), dialKnob);
      root.add(dial);
      add({ id: 'dial', name: 'Browning dial', obj: dial, fixed: true, face: [0, 0, 1], focusRadius: 0.9,
        onTap: (inst) => { const r = inst.refs; r.setting = (r.setting + 1) % 3; TAL.say(SET_SAY[r.setting]); },
        say: 'This is the browning dial. Tap it to pick light, medium or dark toast!',
        learn: ['It tells the timer how long to cook. A bigger setting means more time.',
          'On a real toaster the dial turns a part inside that sets how long the timer waits before it lets go.',
          'Different bread wants different settings. Thick bread, or bread from the freezer, often needs a longer time.'] });
      const setLabels = SET_NAMES.map((n) => { const l = k.label(n, { size: 0.15, bg: 'rgba(60,60,70,0.92)' }); l.position.set(1.45, 1.62, 0.95); l.visible = n === 'Medium'; root.add(l); return l; });

      // ---- thermal fuse (safety), in line with the power
      const fuse = k.group(lie('x', 0.055, 0.3, k.mat(0xe6e0d0, { roughness: 0.5 }), -0.75, 0.5, -0.6, 14), lie('x', 0.058, 0.05, brass, -0.93, 0.5, -0.6, 14), lie('x', 0.058, 0.05, brass, -0.57, 0.5, -0.6, 14), lie('x', 0.008, 0.55, steel(0xcfd5dc), -0.75, 0.5, -0.6, 6));
      root.add(fuse);
      add({ id: 'fuse', name: 'Thermal fuse', obj: fuse, level: 2, pull: [-1.0, 1.2, -1.6], face: [0, 0, 1], focusRadius: 0.6,
        say: 'This is a safety fuse. If the toaster ever gets much too hot, it melts and cuts the electricity off.',
        breaks: 'With the fuse gone there is a gap in the path, so no electricity gets through. Nothing works!',
        symptom: 'The cord is plugged in, but the whole toaster is dead.',
        learn: ['It is like a weak link in a chain that breaks first, so nothing else gets hurt.',
          'A thermal fuse has a bit of metal inside that melts at a set temperature. Once it melts, the path is open and the toaster cannot heat up any more.',
          'It works only once. If it blows, the toaster needs a new one, because something got too hot. Tap Look inside to watch a fuse melt.'] });

      // ---- slot cover (top plate) + screws
      const topShape = rr(new T.Shape(), 3.9, 1.7, 0.25); topShape.holes.push(rr(new T.Path(), 2.7, 0.46, 0.2));
      const topMesh = k.mesh(new T.ExtrudeGeometry(topShape, { depth: 0.07, bevelEnabled: false, curveSegments: 10 }), chrome());
      topMesh.rotation.x = -Math.PI / 2; topMesh.position.y = 1.9;
      const top = k.group(topMesh);
      root.add(top);
      const scIds = [];
      [[-1.7, 0.6], [1.7, 0.6], [-1.7, -0.6], [1.7, -0.6]].forEach(([x, z], i) => {
        const s = k.at(k.screw(0x9ea3ab, 0.3), x, 1.97, z);
        root.add(s); scIds.push('sc' + (i + 1));
        add({ id: 'sc' + (i + 1), name: 'Screw', kind: 'screw', obj: s, pull: [0, 0.9, 0], level: i < 2 ? 2 : 3, fuse: 'top', focusRadius: 0.5,
          say: 'A screw! Lefty loosey, righty tighty.', job: 'It holds the top cover on tight.',
          learn: ['A screw is like a little ramp wrapped around a stick. Twisting it pulls the cover tight.',
            'The ramp is called a thread. Turn one way to pull the screw in, the other way to let it out.',
            'Screws are handy for toasters because a repair person can open it again, which glue would not allow.'] });
      });
      add({ id: 'top', name: 'Slot cover', obj: top, xray: true, level: 2, pull: [0, 2.3, 0.8], blockedBy: scIds, face: [0, 1, 0], focusRadius: 2.2,
        say: 'The top cover has the slot where the bread goes in. It also keeps fingers away from the hot wires.',
        job: 'It lets the bread in and keeps fingers out.',
        learn: ['It is like a lid with a mail slot, just for bread.',
          'It is shiny metal that does not burn. Heat from inside warms it a little, but it is made to take that.',
          'The slot is narrow so that bread fits, but a hand does not.'] });

      // ---- power cord (+ strain relief, plug with two prongs), terminal block with two screws, lead wires
      const cordPts = [[-1.6, 0.6, -0.5], [-1.95, 0.55, -0.55], [-2.5, 0.35, -0.5], [-3.1, 0.1, 0.0], [-3.5, 0.07, 0.6]];
      const cord = k.group(k.tube(cordPts, 0.06, dark(0x1a1a1d)));
      root.add(cord);
      add({ id: 'cord', name: 'Power cord', obj: cord, pull: [-0.8, 0.8, 2.0], noSpark: true, face: [0, 0, 1], focusRadius: 2.0,
        say: 'The power cord brings electricity from the wall into the toaster.',
        breaks: 'No cord, no electricity. Nothing happens at all!', symptom: 'Nothing happens at all, even when I push the lever.',
        learn: ['It is like a long straw for electricity, from the wall to the toaster.',
          'Copper wires inside carry the electricity. Plastic around them keeps it from leaking out.',
          'A toaster uses a lot of electricity to get hot, so its cord has thick copper wires. Tap Look inside to see inside a wire.'] });
      sub(cord, 'cord', { id: 'relief', name: 'Strain relief', obj: k.group(k.at(k.rot(k.cyl(0.11, 0.09, 0.4, k.mat(0x151518, { roughness: 0.7 }), 14), 0, 0, Math.PI / 2), -2.15, 0.53, -0.53)), pull: [-0.9, 0.9, 0.4], level: 2, face: [0, 0, 1], focusRadius: 0.6,
        say: 'The thick rubber collar keeps the cord from bending sharply where it goes into the toaster.', job: 'It protects the cord where it bends the most.',
        learn: ['It is like a stiff sleeve on a bent arm.',
          'Cords wear out where they bend again and again. The collar spreads the bend over a longer piece so the wires inside do not snap.',
          'Frayed cords are dangerous, so this little piece is a safety part.'] });
      const plugG = k.group(k.at(k.box(0.35, 0.22, 0.5, dark(0x151515)), -3.55, 0.12, 0.85));
      sub(cord, 'cord', { id: 'plug', name: 'Plug', obj: plugG, pull: [-1.6, 0.3, 1.6], level: 3, face: [0, 0, 1], focusRadius: 0.8,
        say: 'The plug goes into the wall. Its plastic body keeps your fingers away from the metal pins.',
        breaks: 'There is no plug, so no electricity comes in from the wall!',
        learn: ['It is like the key that fits the wall socket.',
          'The plug holds two metal prongs at the right distance apart so they slide into the wall socket and touch the power inside.',
          'The plastic body is thick and tough so you can pull it out safely. Always pull on the plug, never on the cord.'] });
      [-3.65, -3.45].forEach((x, i) => {
        sub(plugG, 'plug', { id: 'pr' + (i + 1), name: 'Plug prong', obj: k.group(k.at(k.box(0.04, 0.03, 0.25, brass), x, 0.12, 1.2)), pull: [(i ? 0.6 : -0.6), 0.5, 1.3], level: 3, face: [0, 0, 1], focusRadius: 0.4,
          say: 'A metal prong. It slides into the wall and brings electricity in.',
          breaks: 'One of the metal pins is gone, so electricity cannot flow around the loop. Nothing works!',
          learn: ['It is like a little metal tongue that touches the wall power.',
            'The electricity needs two paths, one in and one back out. That is why a plug has two prongs.',
            'Brass is used because it carries electricity well and does not rust.'] });
      });
      const leads = k.group(
        k.tube([[-1.17, 0.58, 0.37], [-1.25, 0.42, 0.3], [-1.45, 0.42, -0.3], [-1.6, 0.62, -0.5]], 0.025, k.mat(0xe8e2d0, { roughness: 0.8 })),
        k.tube([[-1.17, 0.58, -0.37], [-1.3, 0.5, -0.45], [-1.6, 0.66, -0.5]], 0.025, k.mat(0xc9d2da, { roughness: 0.8 })));
      root.add(leads);
      add({ id: 'leads', name: 'Lead wires', obj: leads, level: 3, pull: [-1.0, 0.3, 1.8], face: [0, 0, 1], focusRadius: 0.9,
        say: 'These wires, covered in a heat-proof sleeve, carry electricity from the terminal block to the heating wires.',
        breaks: 'The heating wires get no electricity, so nothing glows and the bread stays pale!',
        learn: ['They are like thin garden hoses that bring the water to the sprinklers.',
          'The sleeve is a woven cover that does not melt, because these wires sit close to the very hot heating wires.',
          'Copper inside carries the electricity easily, so the lead wires stay cool while the heating wires glow.'] });
      const tb = k.group(k.at(k.box(0.5, 0.25, 0.3, k.mat(0xe8e4dc, { roughness: 0.6 })), -1.6, 0.55, -0.5));
      root.add(tb);
      add({ id: 'terminal', name: 'Terminal block', obj: tb, level: 2, pull: [-1.0, 1.0, -1.4], face: [0, 0, 1], focusRadius: 0.7,
        say: "This little block is where the cord's wires join the toaster's wires.",
        breaks: 'The cord is not joined to anything inside, so no electricity reaches the wires!',
        learn: ['It is like a train station where wires change trains.',
          'Each brass screw squeezes a wire against a metal part. The block is ceramic or tough plastic, so electricity cannot jump to the case.',
          'Because it is held tight by screws, it is a safer join than just twisting wires together.'] });
      [-1.7, -1.5].forEach((x, i) => {
        sub(tb, 'terminal', { id: 'tsc' + (i + 1), name: 'Terminal screw', kind: 'screw', obj: miniScrew(x, 0.68, -0.5), pull: [i ? 0.3 : -0.3, 0.8, 0], level: 3, focusRadius: 0.4,
          say: 'A little brass screw. It squeezes a wire tight against the metal inside the block.',
          breaks: 'One wire comes loose from the block, so the loop is open and no electricity flows!',
          learn: ['It is like a tiny clamp holding a wire.',
            'Turning the screw squeezes the wire against a metal strip. A tight squeeze means a good connection.',
            'A loose screw makes a poor connection that can heat up, so these screws are checked in a repair.'] });
      });

      return { root, shell: [shell], parts, refs: {
        wmF: [wireF, wireF2], wmB: [wireB, wireB2], glowF, glowB, warmLight, burnt, moverR, moverL, springS, cTop, cSpr, dialKnob, setLabels,
        breadMeshes: [crust, crumb], setting: 1,
        S: { phase: 'idle', t: 0, hF: 0, hB: 0, heat: 0, brown: 0, carr: 0, said: 0 },
      } };
    },

    evaluate(has, on) {
      const power = has('cord') && has('plug') && has('pr1') && has('pr2') && has('terminal') && has('tsc1') && has('tsc2') && has('fuse');
      const latched = has('latch') && has('catch') && has('diode') && has('dres');
      const closed = has('contacts') && has('blade') && has('cspring');
      const alive = on && power && has('lever') && latched && closed;
      const feed = has('leads');
      const heatF = feed && has('wires') && has('mica') && has('crF');
      const heatB = feed && has('wires') && has('wiresB') && has('mica') && has('micaB') && has('crB');
      const timed = has('timer') && has('tcap') && has('tres') && has('pot') && has('xstr');
      const released = has('lspr');
      const toast = has('bread') && has('rack') && has('cradle');
      const spring = has('spring');
      let reason = '';
      if (on) {
        reason = !has('cord') ? 'The toaster is not plugged in, so nothing happens!'
          : !(has('plug') && has('pr1') && has('pr2')) ? 'The plug is broken, so no electricity comes in from the wall!'
          : !has('fuse') ? 'The safety fuse is gone, so there is a gap and no electricity gets through!'
          : !(has('terminal') && has('tsc1') && has('tsc2')) ? 'The cord is not joined to anything inside, so no electricity gets in!'
          : !has('lever') ? 'There is no lever to push the bread down.'
          : !latched ? 'Nothing holds the lever down, so the toast would pop right back up!'
          : !closed ? 'The switch never closes, so electricity cannot reach the wires!'
          : !(heatF || heatB) ? 'The lever went down, but the heating wires are not working, so nothing gets hot!'
          : !(heatF && heatB) ? 'Only one side of the toaster is heating, so only one side of the toast browns.'
          : !timed ? 'Nothing tells the toaster to stop. Watch the toast!'
          : !released ? 'The catch will not let go, so the toast cannot pop up!'
          : !spring ? 'There is no spring, so the toast will not pop up.'
          : '';
      }
      return { alive, reason, heatF, heatB, timed, released, toast, spring };
    },

    tick(dt, t, inst, out, on) {
      const r = inst.refs, S = r.S, o = out || {}, alive = !!o.alive;
      const mission = TAL.app && TAL.app.mission && !TAL.app.mission.fixedPart;
      const dur = DUR[r.setting];
      if (!alive) S.phase = 'idle';
      else if (S.phase === 'idle') { S.phase = 'toast'; S.t = 0; S.said = 0; if (S.carr < 0.5) S.brown = 0; }
      if (S.phase === 'toast') {
        S.t += dt;
        if (o.timed && o.released && S.t >= dur) { S.phase = 'popped'; S.t = 0; }
      } else if (S.phase === 'popped') {
        S.t += dt;
        if (S.t > 3 && S.carr < 0.06) S.phase = 'idle';
        if (!o.spring && !(S.said & 1) && S.t > 0.6 && !mission) { S.said |= 1; TAL.say('Ding! The timer let go. But there is no spring, so the toast just sits there!'); }
      }
      // the rack and lever
      const goal = S.phase === 'toast' ? 1 : o.spring ? 0 : S.carr;
      S.carr += (goal - S.carr) * Math.min(1, dt * (goal > S.carr ? 7 : 9));
      r.moverR.position.y = (1 - S.carr) * 0.95;
      r.moverL.position.y = -0.8 * S.carr;
      r.springS.scale.y = 1 + 0.5 * S.carr;
      r.cTop.position.y = -0.03 * S.carr;
      r.cSpr.scale.y = 1 - 0.3 * S.carr;
      // the heat and the browning (each side of the slot has its own element)
      const toasting = S.phase === 'toast';
      const fOn = toasting && o.heatF, bOn = toasting && o.heatB;
      S.hF += ((fOn ? 1 : 0) - S.hF) * Math.min(1, dt * (fOn ? 0.95 : 1.6));
      S.hB += ((bOn ? 1 : 0) - S.hB) * Math.min(1, dt * (bOn ? 0.95 : 1.6));
      S.heat = (S.hF + S.hB) / 2;
      if (o.toast && S.carr > 0.7 && S.heat > 0.25) S.brown += dt * 0.125 * S.heat;
      const colF = hotColor(new T.Color(), S.hF), colB = hotColor(new T.Color(), S.hB);
      r.wmF.forEach((m) => { const mt = m.material; mt.emissive.copy(colF); mt.emissiveIntensity = S.hF * 1.7; mt.color.setHex(0x6b6b72).lerp(tmpA.setHex(0x4a1606), clamp01(S.hF)); });
      r.wmB.forEach((m) => { const mt = m.material; mt.emissive.copy(colB); mt.emissiveIntensity = S.hB * 1.7; mt.color.setHex(0x6b6b72).lerp(tmpA.setHex(0x4a1606), clamp01(S.hB)); });
      r.glowF.visible = S.hF > 0.08; r.glowF.material.opacity = 0.16 * S.hF * S.hF;
      r.glowB.visible = S.hB > 0.08; r.glowB.material.opacity = 0.16 * S.hB * S.hB;
      r.warmLight.intensity = S.heat * 0.9;
      breadColor(tmpB.set(0), S.brown, false); r.breadMeshes[1].material.color.copy(tmpB);
      breadColor(tmpB, S.brown, true); r.breadMeshes[0].material.color.copy(tmpB);
      r.burnt.visible = S.brown > 1.25;
      if (S.brown > 1.2 && !(o.timed && o.released) && !(S.said & 2) && !mission) { S.said |= 2; TAL.say('Uh oh! Nothing is telling the toaster to stop, and the toast is burning! Turn the power off.'); }
      // the dial
      const goalA = [0.9, 0, -0.9][r.setting];
      r.dialKnob.rotation.z += (goalA - r.dialKnob.rotation.z) * Math.min(1, dt * 10);
      r.setLabels.forEach((l, i) => { l.visible = i === r.setting; });
    },
  });
})();
