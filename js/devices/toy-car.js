/* Toy car with an electric motor and gears. Beginner 7 pieces, Medium 22, Advanced 58.
 * Power spins the motor, the small gear drives the big gear (slower), the back wheels turn and a road scrolls by.
 * Pull a gear: the motor still spins but the wheels do not. Pull the tires: the wheels spin but slip.
 * Also registers one inside world: "Inside the motor". Needs js/worlds.js (TAL.wk). */
(function () {
  const T = window.THREE;
  const wk = TAL.wk;
  const TAU = Math.PI * 2;

  // =====================================================================  inside the motor
  wk.world({
    id: 'motor-inside', name: 'Inside the motor', zoom: '5×', short: 'motor',
    view: wk.view(1.5, 4.3, 5.8, -0.5, 0.3),
    dial: {
      label: 'Speed',
      steps: [
        { name: 'Off', level: 0, say: 'No electricity. The coil is just a coil of wire, not a magnet, so nothing pushes it. It sits still.' },
        { name: 'Slow', level: 0.45, say: 'A little electricity. The coil is a weak magnet, so it gets a gentle push and spins slowly.' },
        { name: 'Fast', level: 1, say: 'Lots of electricity! The coil is a strong magnet, so the big magnets push it hard and it spins fast. Watch the red and blue ends swap every half turn!' },
      ],
    },
    intro: 'We shrank down into the motor! Tap the Speed button for off, slow or fast. When electricity flows, the coil turns into a magnet, and the big magnets push it round and round. Watch the red and blue ends swap each half turn.',
    shellSay: 'This is the inside of a little electric motor.',
    learn: [
      'A motor is a coil of wire between two magnets. Electricity makes the coil a magnet, and magnets push and pull each other, so the coil turns.',
      'Keeping it turning takes a trick. Every half turn, the commutator flips the electricity round, so the coil\'s red and blue ends swap. That keeps the push going the same way instead of stopping.',
      'More electricity makes the coil a stronger magnet, so it spins faster. The spin comes out the end of the axle, and in the toy car it goes to the gears.',
    ],
    build(k) {
      const Y0 = 1.5;
      const root = k.group(), parts = [], add = (s) => parts.push(wk.part(k, root, s));
      const spinners = [];
      const spinner = (z) => { const g = k.at(k.group(), 0, Y0, z || 0); spinners.push(g); return g; };
      const arc = (a0, a1, rIn, rOut, depth, mat) => {
        const s = new T.Shape(); s.absarc(0, 0, rOut, a0, a1, false); s.absarc(0, 0, rIn, a1, a0, true);
        const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 16 }); g.translate(0, 0, -depth / 2);
        return k.mesh(g, mat);
      };
      const iron = k.metal(0x8a919b, { roughness: 0.4 });
      const copperTex = k.canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#c8743a'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(90,40,10,0.55)'; for (let i = 0; i < h; i += 6) c.fillRect(0, i, w, 2); });
      const copper = k.mat(0xffffff, { map: copperTex, roughness: 0.4, metalness: 0.5 });
      // magnets
      add({ id: 'magN', name: 'Magnet', tag: 'North magnet', obj: k.group(k.at(arc(Math.PI * 0.75, Math.PI * 1.25, 1.0, 1.4, 1.3, k.mat(0xe0453a, { roughness: 0.4 })), 0, Y0, 0)), pull: [-2.8, 0.5, 0.4], tagAt: [-1.8, Y0 + 0.95, 0.5],
        say: 'This magnet pulls and pushes the coil. Its red side is the north side.',
        breaks: 'Without both magnets the coil has nothing to push against, so it does not spin.',
        learn: ['A north side pulls on a south side and pushes away another north side. The coil gets pulled and pushed by both magnets at once.', 'These are permanent magnets, so they keep their magnetism without any electricity.', 'Tap Look inside to see the tiny magnets that make a magnet.'] });
      add({ id: 'magS', name: 'Magnet', tag: 'South magnet', obj: k.group(k.at(arc(-Math.PI * 0.25, Math.PI * 0.25, 1.0, 1.4, 1.3, k.mat(0x2f7de0, { roughness: 0.4 })), 0, Y0, 0)), pull: [2.8, 0.5, 0.4], tagAt: [1.8, Y0 + 0.95, 0.5],
        say: 'This is the other magnet. Its blue side is the south side.',
        breaks: 'Without both magnets the coil has nothing to push against, so it does not spin.',
        learn: ['Magnetism loops from the north side to the south side. The purple dots show the way, right through the spinning coil.', 'Putting the two magnets on opposite sides makes a strong push across the gap where the coil spins.', 'Tap Look inside to see the tiny magnets that make a magnet.'] });
      // the spinner: iron core with end blocks, and the coil
      const topEnd = k.mesh(new T.BoxGeometry(0.62, 0.14, 0.95), k.mat(0x8a919b, { roughness: 0.4 })); topEnd.position.y = 0.93;
      const botEnd = k.mesh(new T.BoxGeometry(0.62, 0.14, 0.95), k.mat(0x8a919b, { roughness: 0.4 })); botEnd.position.y = -0.93;
      const coreSp = spinner(0); coreSp.add(k.mesh(new T.BoxGeometry(0.5, 1.8, 0.85), iron), topEnd, botEnd);
      add({ id: 'core', name: 'Iron core', fixed: true, obj: k.group(coreSp), tagAt: [0.9, Y0 + 1.15, 0.3],
        say: 'The iron core is the middle of the spinner. It makes the coil\'s magnet stronger.',
        learn: ['Wrapping wire round a piece of iron makes a much stronger magnet than wire alone.', 'Iron is easy to magnetize, so the core joins in with the coil\'s magnetism and adds its own.', 'The ends of the core are the two poles of the coil magnet. They swap colors each half turn.'] });
      const coilSp = spinner(0);
      coilSp.add(k.at(k.mesh(new T.BoxGeometry(0.9, 0.55, 1.1), copper), 0, 0.42, 0), k.at(k.mesh(new T.BoxGeometry(0.9, 0.55, 1.1), copper), 0, -0.42, 0));
      add({ id: 'coil', name: 'Copper coil', obj: k.group(coilSp), pull: [0, 2.3, -0.9], tagAt: [-0.95, Y0 + 0.5, 0.7],
        say: 'The copper wire is wound round and round. When electricity flows through it, the coil becomes a magnet.',
        breaks: 'No coil means nothing turns into a magnet, so nothing spins.',
        learn: ['Any wire with electricity flowing in it is a weak magnet. Winding it into a coil makes all the little pushes add up.', 'The more times the wire goes round, and the more electricity flows, the stronger the magnet.', 'The same trick is used in speakers, doorbells and the big motors that drive trains.'] });
      // axle, commutator, brushes
      add({ id: 'axle', name: 'Axle', fixed: true, obj: k.group(k.at(k.rot(k.cyl(0.07, 0.07, 3.0, k.metal(0xc9ced6, { roughness: 0.25 }), 16), Math.PI / 2, 0, 0), 0, Y0, 0.35)), tagAt: [0, Y0 - 0.5, -0.9],
        say: 'The axle is the rod the spinner turns on. It sticks out of the motor to turn something, like a gear.',
        learn: ['Everything that spins in the motor is fixed to this rod, so they all turn together.', 'One end sticks out of the motor. In the toy car, a small gear is fixed there.', 'It spins on tiny bearings so it turns freely.'] });
      const commSp = spinner(1.0);
      const half = (a) => k.rot(k.mesh(new T.CylinderGeometry(0.3, 0.3, 0.4, 24, 1, false, a, Math.PI - 0.3), copper), Math.PI / 2, 0, 0);
      commSp.add(half(0.15), half(Math.PI + 0.15));
      add({ id: 'comm', name: 'Commutator', obj: k.group(commSp), blockedBy: ['brushes'], pull: [0, 1.9, 1.2], tagAt: [0.65, Y0 + 0.5, 1.2],
        say: 'The commutator is a clever switch on the spinner. Every half turn it flips the electricity round.',
        breaks: 'No flipping! The coil gets pushed once, swings a little, and then just sits there.',
        learn: ['It is two copper halves with a tiny gap between them. The brushes touch one half, then the other, as it turns.', 'Flipping the electricity flips the coil\'s magnet, so the red and blue ends swap just as they pass the big magnets. That is why it keeps going round.', 'Without it, the coil would line up with the magnets and stop, like a compass needle.'] });
      const brushMat = k.mat(0x2a2a2e, { roughness: 0.8 });
      add({ id: 'brushes', name: 'Brushes', obj: k.group(k.at(k.box(0.2, 0.14, 0.3, brushMat), -0.42, Y0, 1.0), k.at(k.box(0.2, 0.14, 0.3, brushMat), 0.42, Y0, 1.0),
        k.at(k.box(0.12, 0.04, 0.2, k.metal(0xd8c48a)), -0.58, Y0, 1.0), k.at(k.box(0.12, 0.04, 0.2, k.metal(0xd8c48a)), 0.58, Y0, 1.0)), pull: [0, 1.9, 0.8], tagAt: [0, Y0 + 0.55, 1.5],
        say: 'The brushes are little blocks that touch the spinner and carry electricity into it.',
        breaks: 'Without the brushes no electricity reaches the coil, so it does not spin.',
        learn: ['They are often made of graphite, which is slippery and carries electricity, or of springy metal. They rub on the spinning commutator without wearing it out fast.', 'A little spring presses each brush so it keeps touching even when the commutator wobbles.', 'Brushes slowly wear away. That is one reason small motors do not last forever.'] });
      // wires and battery
      const wireMat = k.mat(0xc0392b, { roughness: 0.5 }), blackMat = k.mat(0x1d1d20, { roughness: 0.5 });
      add({ id: 'wires', name: 'Wires', obj: k.group(
        k.tube([[-0.5, Y0, 1.0], [-0.85, Y0 - 0.5, 1.4], [-0.85, 0.8, 1.9], [-0.5, 0.55, 1.9]], 0.03, blackMat),
        k.tube([[0.5, Y0, 1.0], [0.85, Y0 - 0.5, 1.4], [0.85, 0.8, 1.9], [0.5, 0.55, 1.9]], 0.03, wireMat)), pull: [0, -0.6, 1.6], tagAt: [1.1, 1.0, 1.6],
        say: 'Wires are roads for electricity. They carry it from the battery to the brushes.',
        breaks: 'The roads are cut, so no electricity reaches the brushes.',
        learn: ['Electricity goes out one wire, through the brushes and the coil, and comes back by the other wire.', 'A complete loop is needed. Cut it anywhere and everything stops.', 'Tap Look inside to see inside a wire.'] });
      const batMat = k.mat(0x2a5fb0, { roughness: 0.4 });
      add({ id: 'battery', name: 'Battery', fixed: true, obj: k.group(k.at(k.rot(k.cyl(0.2, 0.2, 0.9, batMat, 20), 0, 0, Math.PI / 2), 0, 0.55, 1.9), k.at(k.rot(k.cyl(0.07, 0.07, 0.06, k.metal(0xc9ced6), 12), 0, 0, Math.PI / 2), 0.48, 0.55, 1.9)), tagAt: [0, 0.95, 1.9],
        say: 'The battery pushes the electricity round the loop.',
        learn: ['A battery stores energy in chemicals and lets it out as electricity.', 'It pushes electrons out of one end and takes them back at the other.', 'Tap Look inside to see what is in a battery.'] });
      // the flowing dots and the field
      const loop = [[0.5, 0.55, 1.9], [0.85, 0.8, 1.9], [0.85, Y0 - 0.5, 1.4], [0.5, Y0, 1.0], [0.0, Y0 + 0.5, 0.2], [0.0, Y0 - 0.5, 0.2], [-0.5, Y0, 1.0], [-0.85, Y0 - 0.5, 1.4], [-0.85, 0.8, 1.9], [-0.5, 0.55, 1.9], [0, 0.55, 1.9]];
      const current = k.flow(loop, { count: 16, color: 0x58b8ff, size: 0.16, closed: true }); current.visible = false;
      const field = [-0.4, 0, 0.4].map((z, i) => k.flow([[-0.98, Y0 + 0.1 * (i - 1), z], [0, Y0 + 0.1 * (i - 1), z], [0.98, Y0 + 0.1 * (i - 1), z]], { count: 5, color: 0xc77dff, size: 0.18, phase: i / 3 }));
      root.add(current, ...field);
      // result: how fast it spins
      const fr = k.at(k.box(0.5, 2.2, 0.16, k.mat(0x2a3040)), -3.1, Y0, 0.2); fr.userData.noPick = true;
      const fill = k.at(k.box(0.34, 2.0, 0.06, new T.MeshBasicMaterial({ color: 0x34d27b, toneMapped: false })), -3.1, Y0 - 1.0, 0.3);
      fill.geometry.translate(0, 1.0, 0); fill.scale.y = 0.001; fill.userData.noPick = true;
      const lab = k.label('Spin speed', { size: 0.2 }); lab.position.set(-3.1, Y0 + 1.45, 0.2);
      root.add(fr, fill, lab);
      return { root, parts, refs: { spinners, topEnd, botEnd, current, field, fill, a: 0, w: 0 } };
    },
    evaluate(has, on) {
      return { alive: on, spin: on && has('magN') && has('magS') && has('coil') && has('brushes') && has('wires'), comm: has('comm') };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs, level = inst.def.dial.steps[inst.dial || 0].level, o = out || {};
      const power = !!o.spin && level > 0;
      const run = power && o.comm;
      r.w += ((run ? level * 7 : 0) - r.w) * Math.min(1, dt * 2.5);
      if (power && !o.comm) {
        const eq = Math.round((r.a - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2 + Math.sin(t * 9) * 0.1 * level;
        r.a += (eq - r.a) * Math.min(1, dt * 4);
      } else r.a += r.w * dt;
      r.spinners.forEach((g) => { g.rotation.z = r.a; });
      // the coil's two ends are magnets: red and blue, swapping each half turn when the commutator is working
      const pol = !power ? 0 : o.comm ? (Math.sin(r.a) >= 0 ? 1 : -1) : 1;
      const set = (m, c) => m.material.color.setHex(c);
      set(r.topEnd, pol === 0 ? 0x8a919b : pol > 0 ? 0xe0453a : 0x2f7de0);
      set(r.botEnd, pol === 0 ? 0x8a919b : pol > 0 ? 0x2f7de0 : 0xe0453a);
      r.current.visible = power;
      if (power) r.current.userData.flow.update(dt, 0.12 + 0.3 * level);
      r.field.forEach((f) => f.userData.flow.update(dt, 0.12));
      r.fill.scale.y = Math.max(0.001, Math.min(1, Math.abs(r.w) / 7));
    },
  });


  // =====================================================================  the toy car
  const AY = 0.47, PY = 0.62, GZ = 0, WZ = 1.03, TIRE_R = 0.47;
  const BIG = { x: -1.0, y: AY, r: 0.4, n: 16 }, SMALL = { x: -0.64, y: 0.9, r: 0.16, n: 8 };
  const MX = SMALL.x, MY = SMALL.y;                       // the motor's axle line (runs along z)
  const MOTOR_SPIN = ['armature', 'coil1', 'coil2', 'coil3', 'commutator', 'shaft'];
  const SCREW_LEARN = ['A screw has a spiral thread that bites into the plastic, so it cannot slip out.', 'A turning screw is a ramp wrapped round a rod. A little turning moves it a tiny bit with a lot of grip.', 'Tap Look inside to see how a screw works.'];

  TAL.registerDevice({
    id: 'toy-car',
    name: 'Toy Car',
    short: 'toy car',
    subtitle: 'A motor, gears and wheels',
    powerSound: 'click',
    channels: false,
    view: { target: [0, 0.9, 0], radius: 4.5, explodedRadius: 6.4, explodedY: 1.8, yaw: -0.65, pitch: 0.3, shadow: [8, 4] },
    intro: 'This is a toy car. A little motor spins gears, and the gears turn the back wheels. Press power and watch the gears and wheels go!',
    shellSay: 'That is the road under the car.',
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button and watch the car go.", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['screw1', 'screw2', 'screw3', 'screw4'], levels: [3], say: 'The body shell is held on by four screws. Pull each screw out.', nudge: 'Pull out a screw.' },
      { do: 'remove', ids: ['body'], say: 'Lift off the red body shell so we can see inside. Watch the gears turn!', nudge: 'Drag the red body shell off.' },
      { do: 'remove', ids: ['gearbox'], levels: [1], say: 'Now pull out the gearbox. What happens to the wheels?', nudge: 'Pull out the gearbox.' },
      { do: 'removeAny', ids: ['smallGear', 'bigGear'], levels: [2, 3], say: 'Pull out one of the gears. The motor still spins, but what happens to the wheels?', nudge: 'Pull out a gear.' },
      { do: 'removeAny', ids: ['tireBL', 'tireBR'], levels: [3], say: 'Peel a tire off a back wheel. Press power again. Does the car still go?', nudge: 'Pull a tire off a back wheel.' },
      { do: 'remove', ids: ['endCap'], levels: [2, 3], say: 'Now the motor. Pull off its back cap.', nudge: 'Pull off the motor back cap.' },
      { do: 'remove', ids: ['armature'], levels: [2, 3], say: 'Slide out the spinning part of the motor. It is called the armature.', nudge: 'Pull out the armature.' },
      { do: 'remove', ids: ['battery'], say: 'Last one: pull out the battery pack. Can the motor spin without it?', nudge: 'Pull out the battery pack.' },
      { do: 'end', say: 'The batteries, motor, gears and wheels all work as a team. Put them back and drive again!' },
    ],

    build(k) {
      const root = k.group();
      const parts = [];
      const part = (id, name, obj, o) => { const s = Object.assign({ id, name, obj }, o); parts.push(s); return s; };
      const kid = (parentObj, parentId, id, name, obj, o) => { parentObj.add(obj); return part(id, name, obj, Object.assign({ parent: parentId }, o)); };
      const plastic = (c, o) => k.mat(c, Object.assign({ roughness: 0.5 }, o || {}));
      const alongZ = (m) => k.rot(m, Math.PI / 2, 0, 0);
      const alongX = (m) => k.rot(m, 0, 0, Math.PI / 2);
      const spinners = {};
      const steel = k.metal(0xc3c7cf, { roughness: 0.3 }), brass = k.metal(0xd8c48a), copperM = k.metal(0xc8743a, { roughness: 0.4 }), iron = k.metal(0x8a919b, { roughness: 0.4 });
      const darkP = plastic(0x2a2d33);
      const helix = (x0, len, cy, cz, r, turns) => {
        const pts = [], n = turns * 8;
        for (let i = 0; i <= n; i++) { const t = i / n, a = t * turns * TAU; pts.push([x0 + len * t, cy + r * Math.cos(a), cz + r * Math.sin(a)]); }
        return k.tube(pts, 0.011, steel);
      };
      const screwAt = (parentObj, parentId, id, x, y, z, rotX, o) => {
        const sc = k.screw(0xc3c7cf, 0.2); sc.scale.setScalar(0.6); sc.position.set(x, y, z); if (rotX) sc.rotation.x = rotX;
        return kid(parentObj, parentId, id, 'Screw', sc, Object.assign({ level: 3, kind: 'screw', pull: [0, 0.8, 0], inside: 'screw-inside', learn: SCREW_LEARN }, o));
      };

      // ---- road (scenery): dashed lines scroll under the car
      const roadTex = k.canvasTex(256, 128, (c, w, h) => {
        c.fillStyle = '#3d4048'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#f5f1d8'; c.fillRect(8, h / 2 - 5, 96, 10);
        c.fillStyle = '#d8d8d8'; c.fillRect(0, 6, w, 5); c.fillRect(0, h - 11, w, 5);
        c.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 160; i++) c.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      });
      roadTex.wrapS = roadTex.wrapT = T.RepeatWrapping; roadTex.repeat.set(4, 1);
      const road = k.mesh(new T.PlaneGeometry(10.4, 3.4), new T.MeshStandardMaterial({ map: roadTex, roughness: 0.9 }));
      road.rotation.x = -Math.PI / 2; road.position.set(0, 0.012, 0); road.userData.noPick = true; root.add(road);

      // ---- gear builder: a disc with teeth and a colored dot, spinning inside its own group
      const gear = (cfg, bodyColor, dotColor, id) => {
        const g = k.group();
        const mat = k.metal(bodyColor, { roughness: 0.35 });
        g.add(alongZ(k.cyl(cfg.r, cfg.r, 0.12, mat, 36)));
        for (let i = 0; i < cfg.n; i++) {
          const a = (i / cfg.n) * TAU;
          g.add(k.rot(k.at(k.box(0.09, (TAU * cfg.r) / cfg.n * 0.5, 0.12, mat), Math.cos(a) * (cfg.r + 0.035), Math.sin(a) * (cfg.r + 0.035), 0), 0, 0, a));
        }
        g.add(k.at(k.box(cfg.r * 0.3, cfg.r * 0.3, 0.14, k.mat(dotColor, { roughness: 0.5 })), cfg.r * 0.55, 0, 0));
        g.add(alongZ(k.cyl(cfg.r * 0.2, cfg.r * 0.2, 0.16, k.mat(0x2a2a2e), 14)));
        const sp = k.at(k.group(g), cfg.x, cfg.y, GZ); spinners[id] = sp;
        return k.group(sp);
      };

      // ================= body shell (+ 4 screws, headlight lenses, window)
      const red = k.mat(0xc8281f, { roughness: 0.35, metalness: 0.15 });
      const body = k.group(
        k.at(k.rbox(3.4, 0.5, 1.6, red, 0.12), 0, 1.0, 0),
        k.at(k.rbox(1.7, 0.07, 1.5, red, 0.03), -0.2, 1.72, 0));
      root.add(body);
      part('body', 'Body shell', body, { xray: true, pull: [0, 2.6, 0], face: [0, 1, 0], blockedBy: ['screw1', 'screw2', 'screw3', 'screw4'], reach: [],
        say: 'The body shell is the car\'s colorful coat. It covers everything inside.',
        job: 'It makes the toy look like a car, and keeps fingers away from the gears.',
        learn: ['The shell is molded plastic or metal made light, so the little motor does not have to push much weight.', 'It keeps little fingers and dirt out of the gears and wires.', 'On a toy the shape is mostly for looks. Real cars are shaped to slip through the air.'] });
      [[1.3, 0.45], [1.3, -0.45], [-1.4, 0.45], [-1.4, -0.45]].forEach(([x, z], i) => {
        screwAt(body, 'body', 'screw' + (i + 1), x, 1.25, z, 0, { say: 'A screw holds the body shell on.', job: 'It holds the body shell on tight.', focusRadius: 0.5 });
      });
      const lens = (z, id) => kid(body, 'body', id, 'Headlight lens', k.at(k.sphere(0.1, k.mat(0xfff0b0, { roughness: 0.2 }), 14), 1.7, 1.02, z), { level: 3, pull: [1.2, 0.4, z * 1.4], focusRadius: 0.5,
        say: 'The headlight is clear yellow plastic. It looks like a lamp, but nothing inside glows.', job: 'It makes the toy look like a real car. It does not make light.',
        learn: ['On a real car, a bulb or an LED sits behind a clear cover and lights the road.', 'On this toy the cover is only a bit of yellow plastic, like a window with no lamp behind it.', 'Toy makers add small details like this so the toy looks like the real thing.'] });
      lens(0.45, 'lensL'); lens(-0.45, 'lensR');
      const winObj = k.group(k.at(k.rbox(1.5, 0.46, 1.4, k.glass(0xa8d8ff, 0.4, { roughness: 0.1 }), 0.05), -0.2, 1.46, 0));
      kid(body, 'body', 'window', 'Window', winObj, { level: 3, pull: [0, 1.2, 0], focusRadius: 1.0,
        say: 'The window is clear plastic, so you can peek inside the car.', job: 'It lets you see in, and keeps dust out of the car.',
        learn: ['A window is clear plastic that lets light through but keeps dust and fingers out.', 'It is a separate clear piece that fits into a hole in the body, because the red plastic cannot be seen through.', 'Clear plastic is used instead of glass because it is light and does not shatter when the toy is dropped.'] });

      // ================= chassis (+ 2 bumpers, 4 axle clips)
      const rail = (z) => k.at(k.box(3.1, 0.1, 0.1, plastic(0x3a3f47)), 0, PY, z);
      const chassis = k.group(rail(0.5), rail(-0.5), k.at(k.box(1.7, 0.1, 1.1, plastic(0x3a3f47)), 0.7, PY, 0));
      root.add(chassis);
      part('chassis', 'Chassis', chassis, { blockedBy: ['battery', 'motor', 'gearbox', 'frontAxle', 'backAxle'], reach: [], pull: [0, 1.9, -2.6],
        say: 'The chassis is the car\'s backbone. Everything else is fastened onto it.',
        job: 'It is the frame that all the other parts are fastened to.',
        learn: ['"Chassis" is a fancy word for the frame. It holds the motor, the batteries and the wheels in the right places.', 'On a toy it is a flat piece of plastic. Real cars have strong steel frames because the whole car and its passengers sit on it.', 'Everything that has to work together is lined up on it, like the motor and the gears.'] });
      const bumper = (sx, id, name, word) => kid(chassis, 'chassis', id, name, k.group(k.at(k.rbox(0.18, 0.16, 1.4, plastic(0x2a2d33), 0.04), sx * 1.72, 0.7, 0), k.at(k.box(0.2, 0.04, 1.0, plastic(0x6a717b)), sx * 1.72, 0.7, 0)), { level: 2, pull: [sx * 1.4, 0.2, 0], face: [sx, 0, 0], focusRadius: 1.0,
        say: 'The ' + word + ' bumper is the car\'s tough edge. It takes the knocks when the car runs into things.', job: 'It protects the ' + word + ' of the car when it bumps into things.',
        learn: ['A bumper is the first thing to hit a wall, so it takes the knock instead of the parts inside.', 'On a toy it is a bar of tough plastic across the end. It spreads the bump out so nothing small snaps off.', 'Real cars have bumpers for the same reason, and some are built to squash a little on purpose.'] });
      bumper(1, 'bumperF', 'Front bumper', 'front'); bumper(-1, 'bumperB', 'Rear bumper', 'back');
      [[1.0, 0.5], [1.0, -0.5], [-1.0, 0.5], [-1.0, -0.5]].forEach(([x, z], i) => {
        kid(chassis, 'chassis', 'clip' + (i + 1), 'Axle clip', k.group(k.at(k.box(0.16, 0.12, 0.1, plastic(0x2a2d33)), x, 0.55, z), k.at(k.box(0.16, 0.04, 0.1, plastic(0x2a2d33)), x, 0.4, z)), { level: 3, pull: [Math.sign(x) * 0.4, -0.5, Math.sign(z) * 0.9], focusRadius: 0.5,
          say: 'A clip holds the axle in place, but lets it spin.', job: 'It keeps the axle snug so the wheels roll straight.',
          learn: ['A clip is a little hook of plastic that the axle sits in, like a hand holding a rod.', 'The rod can spin inside it, but it cannot slide out the side. The inside is smooth so the spin does not rub much.', 'Toy makers like clips because the axle just snaps in, with no screws.'] });
      });

      // ================= battery pack (+ door, door screw, 2 batteries, link strap, 2 springs, 2 tabs)
      const trayMat = plastic(0x1f2227);
      const battery = k.group(
        k.at(k.box(1.2, 0.03, 0.6, trayMat), 0.6, 0.7, 0),
        k.at(k.box(1.2, 0.36, 0.03, trayMat), 0.6, 0.86, 0.29), k.at(k.box(1.2, 0.36, 0.03, trayMat), 0.6, 0.86, -0.29),
        k.at(k.box(0.03, 0.36, 0.6, trayMat), 0.015, 0.86, 0), k.at(k.box(0.03, 0.36, 0.6, trayMat), 1.185, 0.86, 0),
        k.at(k.box(0.04, 0.36, 0.04, trayMat), 0.6, 0.86, 0));
      root.add(battery);
      part('battery', 'Battery pack', battery, { blockedBy: ['body'], pull: [1.8, 1.6, -2.0],
        say: 'The battery pack holds the batteries. It is like a lunchbox of electricity.',
        breaks: 'No batteries, so the motor gets nothing. The car does not go!', symptom: 'The car will not go at all.',
        learn: ['Batteries store energy in chemicals. When the switch is on, they push electricity round a loop through the motor.', 'A pack holds several batteries side by side so their pushes add up. More push makes the motor spin faster.', 'The pack is a holder with a metal tab or spring at each end. Take the door off and the batteries lift out.'] });
      const doorMat = k.mat(0xd8342c, { roughness: 0.5 });
      const door = k.group(k.at(k.box(1.16, 0.03, 0.58, doorMat), 0.6, 1.065, 0), k.at(k.box(0.5, 0.02, 0.3, k.mat(0xf5f1d8)), 0.6, 1.085, 0));
      kid(battery, 'battery', 'batDoor', 'Battery door', door, { level: 2, blockedBy: ['doorScrew'], reach: [], pull: [0, 1.4, 0.7], face: [0, 1, 0], focusRadius: 0.9,
        say: 'The battery door is a little lid. Take it off and the batteries are right there.', job: 'It keeps the batteries in, and keeps little fingers and dirt out.',
        learn: ['It covers the batteries like the lid on a lunchbox, so they cannot fall out when the car bumps along.', 'Most toys fasten it with a screw, so a small child cannot open it and reach the batteries.', 'Putting it back snugly also keeps dust off the metal contacts inside.'] });
      screwAt(door, 'batDoor', 'doorScrew', 0.6, 1.08, 0, 0, { say: 'A little screw keeps the battery door shut.', job: 'It stops the door popping open, so small hands cannot get to the batteries.', pull: [0, 0.8, 0], focusRadius: 0.5 });
      const cell = (z, plusRight, id, n) => {
        const g = k.group(
          k.at(alongX(k.cyl(0.125, 0.125, 0.96, k.mat(0x2a5fb0, { roughness: 0.4 }), 20)), 0.6, 0.86, z),
          k.at(alongX(k.cyl(0.126, 0.126, 0.1, k.mat(0x1d1d20, { roughness: 0.5 }), 20)), plusRight ? 1.0 : 0.2, 0.86, z),
          k.at(alongX(k.cyl(0.045, 0.045, 0.06, steel, 10)), plusRight ? 1.11 : 0.09, 0.86, z));
        return kid(battery, 'battery', id, 'Battery', g, { level: 2, blockedBy: ['batDoor'], pull: [0, 1.0, z * 4.5], focusRadius: 0.7, inside: 'battery-inside',
          say: 'A battery is a little tank of stored energy. It gives the motor a push.',
          breaks: 'One battery is gone, so the loop is broken and no electricity flows. The car does not go!', symptom: n === 1 ? 'The car does nothing, even with the switch on.' : 'The car will not go at all.',
          learn: ['Inside, chemicals store energy. When the loop is complete, they push electricity out of one end and round to the other.', 'Like water in a tank, the energy pushes when there is a complete loop for it to flow round. Two tanks joined end to end push twice as hard.', 'An AA battery gives 1.5 volts of push. Two joined end to end give 3 volts, which is plenty for a small motor.'] });
      };
      cell(0.15, true, 'bat1', 1); cell(-0.15, false, 'bat2', 2);
      const contactLearn = (a, b) => [a, b, 'Dirt or rust on a contact can stop the flow, which is a common reason a toy stops working.'];
      kid(battery, 'battery', 'strap', 'Link strap', k.group(k.at(k.box(0.02, 0.2, 0.5, steel), 0.04, 0.86, 0)), { level: 3, blockedBy: ['batDoor'], pull: [-0.9, 0.7, 0], focusRadius: 0.6,
        say: 'The metal strap joins the two batteries so electricity can run from one to the next.', breaks: 'The batteries are not joined, so electricity cannot get from one to the other. The car does not go!',
        learn: ['The strap is a little bridge. It lets the electricity walk from one battery over to the other.', 'It joins the end of one battery to the opposite end of the other, so the two work in a line and their pushes add up.', 'It is a flat strip of springy metal, often steel with a thin coat so it does not rust.'] });
      const spring = (x, z, id, symptom) => kid(battery, 'battery', id, 'Contact spring', k.group(helix(x, 0.07, 0.86, z, 0.045, 3)), { level: 3, blockedBy: ['batDoor'], pull: [Math.sign(0.6 - x) * -0.8, 0.5, Math.sign(z) * 0.6], focusRadius: 0.5, symptom,
        say: 'The spring pushes on the end of a battery so it always touches.', breaks: 'The battery is not touching anything, so no electricity flows. The car does not go!',
        learn: contactLearn('A spring is a bouncy coil of metal. It pushes on the battery like a little hand, so the battery always touches.', 'Batteries are not all exactly the same length, and the car bumps about. The spring takes up the slack so the touch never breaks.') });
      spring(0.05, 0.15, 'springL', 'The car only goes when I wiggle the batteries.'); spring(1.09, -0.15, 'springR');
      const tab = (x, z, id) => kid(battery, 'battery', id, 'Contact tab', k.group(k.at(k.box(0.025, 0.14, 0.12, steel), x, 0.86, z)), { level: 3, blockedBy: ['batDoor'], pull: [Math.sign(0.6 - x) * -0.8, 0.5, Math.sign(z) * 0.6], focusRadius: 0.5,
        say: 'This flat metal tab touches the other end of a battery.', breaks: 'The battery end is not touching anything, so no electricity flows. The car does not go!',
        learn: contactLearn('It is a small flat plate of metal that a battery end rests against. Where metal touches metal, electricity can cross.', 'A battery is held snug between a tab on one end and a spring on the other, so both ends keep touching.') });
      tab(0.08, -0.15, 'tabL'); tab(1.16, 0.15, 'tabR');

      // ================= motor (+ end cap, 2 brushes, armature [3 coils, commutator, shaft], 2 magnets)
      const can = k.mesh(new T.CylinderGeometry(0.22, 0.22, 0.75, 28, 1, true), k.metal(0xb8bdc4, { roughness: 0.3, side: T.DoubleSide }));
      can.rotation.x = Math.PI / 2;
      const motor = k.group(k.at(can, MX, MY, -0.475), k.at(alongZ(k.cyl(0.22, 0.22, 0.04, brass, 28)), MX, MY, -0.14), k.at(alongZ(k.cyl(0.07, 0.07, 0.06, steel, 14)), MX, MY, -0.11));
      root.add(motor);
      part('motor', 'Electric motor', motor, { xray: true, blockedBy: ['body', 'gearbox'], reach: ['body'], pull: [-2.6, 2.6, -1.6], face: [0, 0, -1], focusRadius: 1.0, inside: 'motor-inside',
        say: 'The motor is the car\'s muscle. Electricity makes its little shaft spin round and round.',
        breaks: 'No motor, so nothing spins. The car does not go.', symptom: 'The car will not go at all.',
        learn: ['Inside are magnets and a coil of wire. Electricity in the coil turns it into a magnet, and the other magnets push it round.', 'A small motor spins fast but with little force. That is why gears come next: they turn the fast spin into slower, stronger turning.', 'Take off the back cap and the spinning part slides out of the metal can. Tap Look inside to see how it works.'] });
      const endCap = k.group(k.at(alongZ(k.cyl(0.215, 0.215, 0.07, darkP, 28)), MX, MY, -0.885), k.at(k.box(0.05, 0.13, 0.03, brass), MX - 0.09, MY, -0.94), k.at(k.box(0.05, 0.13, 0.03, brass), MX + 0.09, MY, -0.94));
      kid(motor, 'motor', 'endCap', 'Motor end cap', endCap, { level: 2, pull: [0, 0.3, -1.3], face: [0, 0, -1], focusRadius: 0.7,
        say: 'The end cap is the lid on the back of the motor. The two little brushes are fixed to it.',
        breaks: 'No cap, so the brushes are gone and no electricity reaches the spinning part. The motor stops!', symptom: 'The motor is silent and the car does not go.',
        learn: ['It closes the back of the motor like the lid on a jar, and holds the brushes in place.', 'It is plastic, so electricity cannot leak across it, with two little metal tabs where the wires are soldered on.', 'Taking it off is how you get the spinning part out. The magnets stay behind, glued inside the can.'] });
      const brush = (sx, id) => kid(endCap, 'endCap', id, 'Motor brush', k.group(k.at(k.box(0.025, 0.05, 0.14, steel), MX + sx * 0.085, MY, -0.78), k.at(k.box(0.04, 0.07, 0.04, darkP), MX + sx * 0.105, MY, -0.84)), { level: 3, pull: [sx * 0.6, 0.4, -0.3], focusRadius: 0.5, inside: 'motor-inside',
        say: 'A brush is a little metal strip that rubs on the spinning part to hand it electricity.', breaks: 'No brush, so no electricity reaches the coils. The motor stops!', symptom: id === 'brushA' ? 'The motor makes no sound and the car does not go.' : undefined,
        learn: ['It brushes against the spinning part the way a paintbrush strokes a wall, always sliding and touching.', 'In small toy motors, brushes are springy metal strips. Each one touches one side of the commutator and carries electricity in.', 'Brushes slowly wear away from the rubbing, which is one reason small motors do not last forever.'] });
      brush(1, 'brushA'); brush(-1, 'brushB');
      // the armature: iron core with three arms (the part's own mesh); coils, commutator and shaft ride on it
      const armG = k.at(k.group(), MX, MY, -0.45); spinners.armature = armG;
      armG.add(alongZ(k.cyl(0.045, 0.045, 0.3, iron, 12)));
      for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; armG.add(k.rot(k.at(k.box(0.1, 0.05, 0.3, iron), Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0), 0, 0, a)); }
      const armObj = k.group(armG);
      kid(motor, 'motor', 'armature', 'Armature', armObj, { level: 2, blockedBy: ['endCap', 'smallGear'], reach: ['endCap', 'smallGear'], pull: [0.4, 0.8, -2.3], face: [0, 0, -1], focusRadius: 0.8, inside: 'motor-inside',
        say: 'The armature is the spinning part of the motor. It has three copper coils on an iron core.',
        breaks: 'Without the spinning part, nothing can turn. The car does not go!',
        learn: ['It is the merry-go-round of the motor. When electricity flows, its coils turn into magnets and it spins between the big magnets.', 'The core is a stack of thin iron sheets. Three coils of copper wire wrap round its three arms, and the commutator and shaft sit on the same rod.', 'Everything on it spins together. With three coils there is always a push, so the motor can start from any position.'] });
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU, sp = k.at(k.group(), MX, MY, -0.45); spinners['coil' + (i + 1)] = sp;
        sp.add(k.rot(k.at(k.box(0.09, 0.1, 0.34, copperM), Math.cos(a) * 0.095, Math.sin(a) * 0.095, 0), 0, 0, a));
        kid(armObj, 'armature', 'coil' + (i + 1), 'Motor coil', k.group(sp), { level: 3, pull: [Math.cos(a + 0.5) * 0.9, Math.sin(a + 0.5) * 0.9, 0], focusRadius: 0.5, inside: 'wire-inside',
          say: 'A coil is copper wire wound round and round. With electricity in it, it becomes a magnet.', breaks: 'A coil is missing, so the spinner jerks and gets stuck. The car does not go!', symptom: i === 0 ? 'The motor jerks and gets stuck.' : undefined,
          learn: ['It is a long thin copper wire wound round and round, like thread on a spool. Electricity makes it a magnet.', 'The wire has a thin coat of enamel, so each turn does not touch the next. More turns make a stronger magnet.', 'The three coils take turns being pushed by the big magnets, so the spinner keeps going round.'] });
      }
      const csp = k.at(k.group(), MX, MY, -0.76); spinners.commutator = csp;
      for (let i = 0; i < 3; i++) csp.add(k.rot(k.mesh(new T.CylinderGeometry(0.07, 0.07, 0.12, 10, 1, false, (i / 3) * TAU, TAU / 3 - 0.25), copperM), Math.PI / 2, 0, 0));
      kid(armObj, 'armature', 'commutator', 'Commutator', k.group(csp), { level: 3, pull: [0, 0.7, -0.5], focusRadius: 0.5, inside: 'motor-inside',
        say: 'The commutator is a tiny switch on the shaft. It flips the electricity round as it spins.', breaks: 'No flipping! The coils get one push, swing a little, and then just sit there.', symptom: 'The motor twitches and then stops.',
        learn: ['It is a ring of copper pieces with tiny gaps. The brushes touch one piece, then the next, as it turns.', 'Passing the electricity to the right coil at the right moment keeps the pushes going the same way. Here there are three copper pieces, one for each coil.', 'Without it, the coils would line up with the magnets and stop, like a compass needle.'] });
      const ssp = k.at(k.group(), MX, MY, -0.35); spinners.shaft = ssp;
      ssp.add(alongZ(k.cyl(0.03, 0.03, 0.9, steel, 10)));
      kid(armObj, 'armature', 'shaft', 'Motor shaft', k.group(ssp), { level: 3, pull: [0, -0.8, 0.8], focusRadius: 0.6,
        say: 'The shaft is the steel rod the spinner turns on. The small gear sits on its end.', breaks: 'The motor spins, but the shaft is gone, so the gear gets no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['It is a steel rod through the middle of the spinner, like the stick of a spinning top. Everything that spins in the motor sits on it.', 'One end sticks out of the motor and carries the small gear, so the spin goes on to the gears.', 'The rod turns in small bearings at each end, so it spins freely with very little rubbing.'] });
      const arcMag = (a0, a1, c) => { const s = new T.Shape(); s.absarc(0, 0, 0.2, a0, a1, false); s.absarc(0, 0, 0.16, a1, a0, true); const g = new T.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, -0.25); return k.mesh(g, k.mat(c, { roughness: 0.4 })); };
      const magnet = (a0, a1, c, id, side, symptom) => kid(motor, 'motor', id, 'Motor magnet', k.group(k.at(arcMag(a0, a1, c), MX, MY, -0.5)), { level: 3, blockedBy: ['armature'], pull: [side * 1.0, 0.2, 0], focusRadius: 0.6, inside: 'magnet-inside', symptom,
        say: 'This curved magnet sits inside the motor can. It pushes and pulls on the spinning coils.', breaks: 'A magnet is missing, so the coils have little to push against. The motor is too weak to move the car.',
        learn: ['A coil with electricity in it is a magnet, and it needs another magnet to push against. These two curved magnets do that job.', 'They are glued inside the metal can, one on each side, so the north side of one faces the south side of the other.', 'The steel can also carries the magnetism from one magnet round to the other, which makes the push stronger.'] });
      magnet(Math.PI * 0.7, Math.PI * 1.3, 0xe0453a, 'magN', -1, 'The motor is too weak and the car does not go.'); magnet(-Math.PI * 0.3, Math.PI * 0.3, 0x2f7de0, 'magS', 1);

      // ================= gearbox (+ small gear, big gear, 2 screws)
      const gearbox = k.group(k.at(k.box(1.5, 1.3, 0.05), -0.85, 0.72, -0.1));
      gearbox.children[0].material = plastic(0x6a717b);
      root.add(gearbox);
      part('gearbox', 'Gearbox', gearbox, { blockedBy: ['body', 'gScrew1', 'gScrew2'], reach: ['body'], pull: [-1.0, 1.2, 2.2], face: [0, 0, 1], focusRadius: 1.2,
        say: 'The gearbox holds the gears that pass the motor\'s spin on to the wheels.',
        breaks: 'Without the gearbox the motor spins, but the wheels get no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['The gears are fixed to a plate so they stay lined up. If they drift apart their teeth stop touching.', 'Here a small gear on the motor turns a big gear on the back axle. Their teeth fit together like fingers.', 'Gears are one of the oldest machines. They let you trade speed for strength.'] });
      kid(gearbox, 'gearbox', 'smallGear', 'Small gear', gear(SMALL, 0xc9ced6, 0xd8342c, 'small'), { level: 2, pull: [0.2, 1.2, 1.4], face: [0, 0, 1], focusRadius: 0.6,
        say: 'The small gear sits on the motor and spins very fast.',
        breaks: 'The motor spins, but the small gear is gone, so the wheels get no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['It is fixed on the motor\'s shaft, so it spins as fast as the motor.', 'Its teeth push the teeth of the big gear, one after another, like a line of kids passing a ball.', 'A small gear driving a big gear turns it slower, but with more push. Engineers call a small gear like this a pinion.'] });
      kid(gearbox, 'gearbox', 'bigGear', 'Big gear', gear(BIG, 0xe0a52c, 0x2457c5, 'big'), { level: 2, pull: [-0.8, 0.9, 1.6], face: [0, 0, 1], focusRadius: 0.8,
        say: 'The big gear turns the back wheels. It spins slower than the small gear, but it is stronger.',
        breaks: 'The motor spins, but the big gear is gone, so the wheels get no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['Watch the colored dots. The little gear goes round twice for every time the big gear goes round once.', 'The big gear has more teeth than the small one. Each tooth that passes pushes the next one along, so it takes the big gear longer to go all the way round.', 'This trade gives you a slower, stronger turn. That is what a car needs to get moving.'] });
      screwAt(gearbox, 'gearbox', 'gScrew1', -1.5, 1.25, -0.06, Math.PI / 2, { pull: [0, 0, 0.8], say: 'A screw holds the gear plate to the frame.', job: 'It keeps the gears lined up so their teeth meet.', focusRadius: 0.5 });
      screwAt(gearbox, 'gearbox', 'gScrew2', -0.2, 1.25, -0.06, Math.PI / 2, { pull: [0, 0, 0.8], say: 'A screw holds the gear plate to the frame.', job: 'It keeps the gears lined up so their teeth meet.', focusRadius: 0.5 });

      // ================= axles with wheels and tires
      const rod = (cx, g) => g.add(k.at(alongZ(k.cyl(0.05, 0.05, WZ * 2 + 0.3, k.metal(0xc9ced6, { roughness: 0.25 }), 12)), cx, AY, 0));
      const wheelPart = (axleObj, axleId, cx, sign, front) => {
        const id = 'wheel' + (front ? 'F' : 'B') + (sign > 0 ? 'R' : 'L'), tid = 'tire' + (front ? 'F' : 'B') + (sign > 0 ? 'R' : 'L');
        const z = sign * WZ;
        const rimSp = k.at(k.group(), cx, AY, z); spinners[id] = rimSp;
        rimSp.add(alongZ(k.cyl(0.3, 0.3, 0.32, k.metal(0xcfd5dc, { roughness: 0.25 }), 24)), alongZ(k.cyl(0.08, 0.08, 0.36, k.mat(0x2a2a2e), 12)));
        for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; rimSp.add(k.rot(k.at(k.box(0.24, 0.06, 0.36, k.mat(0x2a2a2e)), Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0), 0, 0, a)); }
        const w = k.group(rimSp);
        axleObj.add(w);
        const wp = part(id, 'Wheel', w, { level: 2, parent: axleId, pull: [0, 0.5, sign * 1.5], face: [0, 0, sign],
          say: front ? 'The front wheels roll along so the car glides.' : 'The back wheels are the ones that push the car along.',
          learn: front
            ? ['A wheel turns sliding into rolling, which is much easier. Rolling does not rub the whole way along the ground.', 'These front wheels are not pushed by the motor. They just roll and keep the front of the car up.', 'The wheel is a rim that holds the tire, with spokes to keep it light and strong.']
            : ['These wheels are fixed to the back axle. When the big gear turns the axle, they turn too, and they push the car forward.', 'The wheel rolling on the road is what moves the car. The turning of the gear becomes forward motion here.', 'The wheel is a rim that holds the tire, with spokes to keep it light and strong.'] });
        if (front) { wp.job = 'It just rolls along. The back wheels do the pushing.'; }
        else { wp.breaks = 'Without this wheel the car cannot be pushed along properly.'; }
        const tireSp = k.at(k.group(), cx, AY, z); spinners[tid] = tireSp;
        tireSp.add(alongZ(k.cyl(TIRE_R, TIRE_R, 0.24, k.mat(0x1c1c1f, { roughness: 0.9 }), 32)));
        for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; tireSp.add(k.rot(k.at(k.box(0.09, 0.1, 0.26, k.mat(0x2e2e33, { roughness: 0.9 })), Math.cos(a) * (TIRE_R + 0.01), Math.sin(a) * (TIRE_R + 0.01), 0), 0, 0, a)); }
        const t = k.group(tireSp);
        w.add(t);
        const tp = part(tid, 'Tire', t, { level: 3, parent: id, pull: [0, 1.0, sign * 1.2], face: [0, 0, sign],
          say: 'The soft tire has little bumps that grip the road.',
          learn: ['Rubber is grippy, so the wheel pushes against the road without slipping.', 'The bumps, called tread, give extra grip and let a little water or dust escape from under the tire.', 'Without a tire the hard wheel is slippery, and it slides instead of pushing the car along.'] });
        if (front) tp.job = 'It makes the wheel grip and roll quietly. The back tires do the pushing.';
        else { tp.breaks = 'The wheel still spins, but with no tire it slips. The car slides and hardly goes anywhere.'; tp.symptom = 'The wheels spin fast, but the car just slides.'; }
      };
      const frontAxle = k.group(); rod(1.0, frontAxle); root.add(frontAxle);
      part('frontAxle', 'Front axle', frontAxle, { pull: [2.4, 0.5, 0],
        say: 'The front axle is a rod that lets the front wheels spin freely.', job: 'It holds the front wheels so they can roll. The back wheels do the pushing.',
        learn: ['An axle is a rod the wheels turn around. The two front wheels share this one.', 'Its wheels are not driven by the motor. They just roll and follow along.', 'It sits in little clips under the chassis, which are smooth so it can turn easily.'] });
      wheelPart(frontAxle, 'frontAxle', 1.0, 1, true); wheelPart(frontAxle, 'frontAxle', 1.0, -1, true);
      const backAxle = k.group(); rod(-1.0, backAxle); root.add(backAxle);
      part('backAxle', 'Back axle', backAxle, { blockedBy: ['gearbox'], reach: [], pull: [-2.6, 0.5, 0],
        say: 'The back axle is a rod that the big gear turns. It turns both back wheels.',
        breaks: 'No back axle, so the big gear has nothing to turn and the back wheels get no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['The big gear is fixed to this rod, so when the gear turns, the rod turns and both back wheels turn with it.', 'Because both wheels are fixed to one rod they always turn together at the same speed.', 'This rod does the real pushing. Its turning becomes the car moving forward.'] });
      wheelPart(backAxle, 'backAxle', -1.0, 1, false); wheelPart(backAxle, 'backAxle', -1.0, -1, false);

      // ================= switch (+ slider, contacts) and wires (+ red, white): sit on the chassis, under the body
      const sw = k.group(k.at(k.box(0.34, 0.1, 0.22, plastic(0x3a3f47)), 0.15, 0.72, -0.45));
      root.add(sw);
      part('switch', 'Switch', sw, { level: 2, fuse: 'chassis', blockedBy: ['body'], pull: [0.4, 1.4, -1.2], focusRadius: 0.6, inside: 'switch-inside',
        say: 'The switch opens and closes the road for the electricity.',
        breaks: 'The road is closed, so the motor gets nothing. The car does not go!', symptom: 'The car will not go at all.',
        learn: ['When the switch is on, a little piece of metal touches and the electricity can pass. When it is off the metal moves away.', 'Turning it off stops the batteries running down while the toy sits in a drawer.', 'Tap Look inside to see how a switch works.'] });
      kid(sw, 'switch', 'slider', 'Switch slider', k.group(k.at(k.box(0.12, 0.1, 0.1, k.mat(0xe0842c)), 0.2, 0.8, -0.45)), { level: 3, pull: [0, 0.8, 0], focusRadius: 0.4,
        say: 'This is the little handle you slide to turn the car on and off.', job: 'It is just the handle. Sliding it moves the metal inside to open or close the road.',
        learn: ['It is a handle you push with your thumb, like a gate on the electricity road.', 'Sliding it moves a metal piece inside so it touches the two contacts, or lets go of them.', 'This is a slide switch, one of the simplest kinds. It stays where you leave it.'] });
      kid(sw, 'switch', 'switchContacts', 'Switch contacts', k.group(k.at(k.box(0.06, 0.04, 0.1, steel), 0.0, 0.73, -0.45), k.at(k.box(0.06, 0.04, 0.1, steel), 0.3, 0.73, -0.45)), { level: 3, pull: [0, 0.6, 0.6], focusRadius: 0.4, inside: 'switch-inside',
        say: 'Two metal tabs in the switch. When they touch, the road is open for electricity.', breaks: 'The tabs are gone, so the road is broken. The car does not go!', symptom: 'The switch clicks, but nothing happens.',
        learn: ['Electricity can only cross the gate where two metal tabs touch.', 'The slider presses one tab onto the other. When it slides away, the tabs spring apart and the road is cut.', 'They are springy metal, so they keep carrying electricity well even after lots of switching.'] });
      const wireR = k.mat(0xc0392b, { roughness: 0.5 }), wireB = k.mat(0x1d1d20, { roughness: 0.5 }), wireW = k.mat(0xe8e8e8, { roughness: 0.5 });
      const wires = k.group(k.tube([[1.18, 0.84, -0.15], [1.28, 0.78, -0.15], [1.32, 0.7, -0.6], [0.2, 0.68, -0.62], [-0.6, 0.72, -0.95], [-0.72, 0.88, -0.95]], 0.022, wireB));
      root.add(wires);
      part('wires', 'Wires', wires, { level: 2, fuse: 'chassis', blockedBy: ['body'], pull: [0, 1.6, 1.4], inside: 'wire-inside',
        say: 'Wires are roads for electricity. They carry it from the batteries to the motor.',
        breaks: 'The roads are cut, so the electricity cannot get to the motor.', symptom: 'The car will not go at all.',
        learn: ['Wires are copper inside, because copper lets electricity through easily. Plastic on the outside keeps them from touching.', 'Here they join the batteries, the switch and the motor into one loop.', 'Tap Look inside to see inside a wire.'] });
      kid(wires, 'wires', 'wireRed', 'Red wire', k.group(k.tube([[1.18, 0.84, 0.15], [1.28, 0.78, 0.15], [1.3, 0.7, -0.45], [0.32, 0.72, -0.45]], 0.022, wireR)), { level: 3, pull: [0.5, 0.9, 0.5], focusRadius: 0.5, inside: 'wire-inside',
        say: 'The red wire carries electricity from the batteries to the switch.', breaks: 'The road is cut, so electricity cannot get from the batteries to the switch. The car does not go!',
        learn: ['A wire is a road for electricity. This red one is the first stretch, from the batteries to the switch.', 'Copper inside carries the electricity, and the red plastic coat keeps it from touching other metal by accident.', 'Wire makers use colors so a repair person can tell which wire is which.'] });
      kid(wires, 'wires', 'wireWhite', 'White wire', k.group(k.tube([[-0.02, 0.73, -0.45], [-0.2, 0.8, -0.5], [-0.5, 0.8, -0.9], [-0.56, 0.9, -0.95]], 0.022, wireW)), { level: 3, pull: [-0.5, 0.9, 0.5], focusRadius: 0.5, inside: 'wire-inside',
        say: 'The white wire carries electricity from the switch to the motor.', breaks: 'The road is cut, so electricity cannot get from the switch to the motor. The car does not go!',
        learn: ['A wire is a road for electricity. This white one is the next stretch, from the switch to the motor.', 'Copper inside carries the electricity, and the white plastic coat keeps it from touching other metal by accident.', 'The black wire brings the electricity back to the battery, which finishes the loop.'] });

      return { root, parts, shell: [], refs: { spinners, roadTex, wm: 0, a: { small: 0, big: 0, rear: 0, front: 0, mot: 0 } } };
    },

    evaluate(has, on) {
      const cells = has('battery') && has('bat1') && has('bat2');
      const links = has('strap') && has('springL') && has('springR') && has('tabL') && has('tabR');
      const wiring = has('wires') && has('wireRed') && has('wireWhite') && has('switch') && has('switchContacts');
      const brushes = has('endCap') && has('brushA') && has('brushB');
      const spinner = has('armature') && has('coil1') && has('coil2') && has('coil3') && has('commutator');
      const magnets = has('magN') && has('magS');
      const elec = cells && links && wiring && has('motor') && brushes && spinner && magnets;
      const spin = on && elec;
      const drive = spin && has('shaft') && has('gearbox') && has('smallGear') && has('bigGear') && has('backAxle');
      const rear = ((has('wheelBL') && has('tireBL') ? 1 : 0) + (has('wheelBR') && has('tireBR') ? 1 : 0)) / 2;
      let reason = '';
      if (on && !elec) {
        reason = !cells ? 'There are no batteries in the car, so the motor gets no electricity.'
          : !links ? 'The batteries are not touching the metal tabs and springs, so no electricity gets out.'
          : !wiring ? 'The electricity cannot get from the batteries to the motor.'
          : !has('motor') ? 'There is no motor to make it go.'
          : !brushes ? 'The brushes are missing, so no electricity reaches the spinning part of the motor.'
          : !spinner ? 'The spinning part of the motor is missing or has a coil gone, so the motor cannot turn.'
          : 'The motor has lost a magnet, so it is too weak to move the car.';
      } else if (spin && !drive) reason = 'The motor is spinning, but the gears are not connected to the wheels, so the car does not move!';
      else if (drive && rear === 0) reason = 'The back wheels spin, but with no grip they slip. The car just slides!';
      else if (drive && rear < 1) reason = 'Only one back wheel can grip, so the car barely moves.';
      return { alive: spin, spin, drive, rear, reason };
    },

    tick(dt, t, inst, out) {
      const r = inst.refs, o = out || {}, S = r.spinners;
      const inn = (id) => { const p = inst.byId[id]; return !p || p.target === 0; };
      r.wm += ((o.spin && inn('motor') ? 9 : 0) - r.wm) * Math.min(1, dt * 3);
      const big = o.drive ? r.wm / (BIG.n / SMALL.n) : 0;                 // the big gear turns slower
      const roadSpeed = big * TIRE_R * (o.rear || 0);
      r.a.mot += r.wm * dt;
      MOTOR_SPIN.forEach((id) => { if (S[id]) S[id].rotation.z = r.a.mot; });
      if (inn('gearbox') && inn('smallGear')) { r.a.small += r.wm * dt; S.small.rotation.z = r.a.small; }
      if (inn('gearbox') && inn('bigGear')) { r.a.big += big * dt; S.big.rotation.z = -r.a.big; }
      if (inn('backAxle')) r.a.rear += big * dt;
      r.a.front += (roadSpeed / TIRE_R) * dt;
      ['BL', 'BR'].forEach((s) => {
        const w = inn('wheel' + s) && inn('backAxle');
        if (w) S['wheel' + s].rotation.z = -r.a.rear;
        if (w && inn('tire' + s)) S['tire' + s].rotation.z = -r.a.rear;
      });
      ['FL', 'FR'].forEach((s) => {
        const w = inn('wheel' + s) && inn('frontAxle');
        if (w) S['wheel' + s].rotation.z = -r.a.front;
        if (w && inn('tire' + s)) S['tire' + s].rotation.z = -r.a.front;
      });
      r.roadTex.offset.x += (roadSpeed * dt) / 2.6;
    },
  });

  Object.assign(TAL.insideByName, {
    'Electric motor': 'motor-inside', 'Wires': 'wire-inside', 'Screw': 'screw-inside', 'Switch': 'switch-inside',
  });
})();
