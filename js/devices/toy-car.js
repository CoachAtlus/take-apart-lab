/* Toy car with an electric motor and gears. Beginner 7 pieces, Medium 15, Advanced 26.
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

  TAL.registerDevice({
    id: 'toy-car',
    name: 'Toy Car',
    short: 'toy car',
    subtitle: 'A motor, gears and wheels',
    powerSound: 'click',
    channels: false,
    view: { target: [0, 0.85, 0], radius: 4.5, explodedRadius: 8.6, explodedY: 1.4, yaw: -0.65, pitch: 0.3, shadow: [8, 4] },
    intro: 'This is a toy car. A little motor spins gears, and the gears turn the back wheels. Press power and watch the gears and wheels go!',
    shellSay: 'That is the road under the car.',
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button and watch the car go.", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['body'], say: 'Lift off the red body shell so we can see inside. Watch the gears turn!', nudge: 'Drag the red body shell off.' },
      { do: 'remove', ids: ['gearbox'], levels: [1], say: 'Now pull out the gearbox. What happens to the wheels?', nudge: 'Pull out the gearbox.' },
      { do: 'removeAny', ids: ['smallGear', 'bigGear'], levels: [2, 3], say: 'Pull out one of the gears. The motor still spins, but what happens to the wheels?', nudge: 'Pull out a gear.' },
      { do: 'removeAny', ids: ['tireBL', 'tireBR'], levels: [3], say: 'Peel a tire off a back wheel. Press power again. Does the car still go?', nudge: 'Pull a tire off a back wheel.' },
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
      const spinners = {};

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

      // ---- body shell (+ screws, headlights)
      const red = k.mat(0xc8281f, { roughness: 0.35, metalness: 0.15 });
      const body = k.group(
        k.at(k.rbox(3.4, 0.5, 1.6, red, 0.12), 0, 1.0, 0),
        k.at(k.rbox(1.5, 0.46, 1.4, k.glass(0xa8d8ff, 0.4, { roughness: 0.1 }), 0.05), -0.2, 1.46, 0),
        k.at(k.rbox(1.7, 0.07, 1.5, red, 0.03), -0.2, 1.72, 0));
      root.add(body);
      part('body', 'Body shell', body, { xray: true, pull: [0, 2.6, 0], face: [0, 1, 0],
        say: 'The body shell is the car\'s colorful coat. It covers everything inside.',
        job: 'It makes the toy look like a car, and keeps fingers away from the gears.',
        learn: ['The shell is molded plastic or metal made light, so the little motor does not have to push much weight.', 'It keeps little fingers and dirt out of the gears and wires.', 'On a toy the shape is mostly for looks. Real cars are shaped to slip through the air.'] });
      [[1.3, 0.45], [1.3, -0.45], [-1.4, 0.45], [-1.4, -0.45]].forEach(([x, z], i) => {
        const sc = k.screw(0xc3c7cf, 0.2); sc.scale.setScalar(0.6); sc.position.set(x, 1.25, z);
        kid(body, 'body', 'screw' + (i + 1), 'Screw', sc, { level: 3, kind: 'screw', pull: [0, 0.8, 0],
          say: 'A screw holds the body shell on.', job: 'It holds the body shell on tight.',
          learn: ['A screw has a spiral thread that bites into the plastic, so it cannot slip out.', 'A turning screw is a ramp wrapped round a rod. A little turning moves it a tiny bit with a lot of grip.', 'Tap Look inside to see how a screw works.'] });
      });
      kid(body, 'body', 'lights', 'Headlights', k.group(
        k.at(k.sphere(0.1, k.mat(0xfff0b0, { roughness: 0.2 }), 14), 1.7, 1.02, 0.45), k.at(k.sphere(0.1, k.mat(0xfff0b0, { roughness: 0.2 }), 14), 1.7, 1.02, -0.45)), { level: 3, pull: [1.2, 0.6, 0],
        say: 'The headlights are just for show on this toy.', job: 'They make the toy look like a real car. They do not make light.',
        learn: ['On a real car, headlights light the road. On this toy they are only colored plastic.', 'Making them really glow would need more wires and a bulb or an LED.', 'Toy makers add details like this so the toy looks like the real thing.'] });

      // ---- chassis
      const rail = (z) => k.at(k.box(3.1, 0.1, 0.1, plastic(0x3a3f47)), 0, PY, z);
      const chassis = k.group(rail(0.5), rail(-0.5), k.at(k.box(1.7, 0.1, 1.1, plastic(0x3a3f47)), 0.7, PY, 0),
        k.at(k.box(0.14, 0.12, 1.1, plastic(0x2a2d33)), 1.55, PY, 0), k.at(k.box(0.14, 0.12, 1.1, plastic(0x2a2d33)), -1.55, PY, 0));
      root.add(chassis);
      part('chassis', 'Chassis', chassis, { blockedBy: ['battery', 'motor', 'gearbox', 'frontAxle', 'backAxle'], pull: [0, 1.9, -2.6],
        say: 'The chassis is the car\'s backbone. Everything else is fastened onto it.',
        job: 'It is the frame that all the other parts are fastened to.',
        learn: ['"Chassis" is a fancy word for the frame. It holds the motor, the batteries and the wheels in the right places.', 'On a toy it is a flat piece of plastic. Real cars have strong steel frames because the whole car and its passengers sit on it.', 'Everything that has to work together is lined up on it, like the motor and the gears.'] });

      // ---- battery pack (+ contacts)
      const battery = k.group(k.at(k.rbox(1.2, 0.4, 0.6, plastic(0x1f2227), 0.04), 0.6, 0.88, 0), k.at(k.box(1.0, 0.03, 0.4, k.mat(0xd8342c)), 0.6, 1.09, 0), k.at(k.box(0.5, 0.02, 0.3, k.mat(0xf5f1d8)), 0.6, 1.1, 0));
      root.add(battery);
      part('battery', 'Battery pack', battery, { blockedBy: ['body'], pull: [1.6, 2.0, -1.8],
        say: 'The battery pack holds the batteries. They are like a lunchbox of electricity.',
        breaks: 'No batteries, so the motor gets nothing. The car does not go!', symptom: 'The car will not go at all.',
        learn: ['Batteries store energy in chemicals. When the switch is on, they push electricity round a loop through the motor.', 'A pack holds several batteries side by side so their pushes add up. More push makes the motor spin faster.', 'Tap Look inside to see what is in a battery.'] });
      kid(battery, 'battery', 'contacts', 'Battery contacts', k.group(k.at(k.box(0.02, 0.2, 0.3, k.metal(0xd8c48a)), 0.0, 0.88, 0), k.at(k.box(0.02, 0.2, 0.3, k.metal(0xd8c48a)), 1.2, 0.88, 0)), { level: 3, pull: [0, 0.9, 0.8],
        say: 'These metal tabs touch the ends of the batteries so electricity can get in and out.',
        breaks: 'The batteries are not touching anything, so no electricity can flow.',
        learn: ['Electricity only flows between parts that touch metal to metal.', 'The tabs are springy so they keep pressing on the batteries when the car bumps along.', 'Dirt or rust on a contact can stop the flow, which is a common reason a toy stops working.'] });

      // ---- motor (+ magnets)
      const can = k.mesh(new T.CylinderGeometry(0.22, 0.22, 0.75, 28, 1, true), k.metal(0xb8bdc4, { roughness: 0.3, side: T.DoubleSide }));
      can.rotation.x = Math.PI / 2;
      const motor = k.group(k.at(can, SMALL.x, SMALL.y, -0.475), k.at(alongZ(k.cyl(0.22, 0.22, 0.04, k.metal(0xd8c48a), 28)), SMALL.x, SMALL.y, -0.14), k.at(alongZ(k.cyl(0.04, 0.04, 0.3, k.metal(0xc9ced6), 10)), SMALL.x, SMALL.y, -0.02));
      root.add(motor);
      part('motor', 'Electric motor', motor, { blockedBy: ['body', 'gearbox'], reach: ['body'], pull: [-1.6, 2.0, -1.8], face: [0, 0, -1], focusRadius: 1.0,
        say: 'The motor is the car\'s muscle. Electricity makes its little shaft spin round and round.',
        breaks: 'No motor, so nothing spins. The car does not go.', symptom: 'The car will not go at all.',
        learn: ['Inside are magnets and a coil of wire. Electricity in the coil turns it into a magnet, and the other magnets push it round.', 'A small motor spins fast but with little force. That is why gears come next: they turn the fast spin into slower, stronger turning.', 'Tap Look inside to see the coil, the magnets and the little switch that flips the electricity.'] });
      const arcMag = (a0, a1, c) => { const s = new T.Shape(); s.absarc(0, 0, 0.2, a0, a1, false); s.absarc(0, 0, 0.16, a1, a0, true); const g = new T.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, -0.25); return k.mesh(g, k.mat(c, { roughness: 0.4 })); };
      kid(motor, 'motor', 'motorMagnets', 'Motor magnets', k.group(k.at(arcMag(Math.PI * 0.7, Math.PI * 1.3, 0xe0453a), SMALL.x, SMALL.y, -0.5), k.at(arcMag(-Math.PI * 0.3, Math.PI * 0.3, 0x2f7de0), SMALL.x, SMALL.y, -0.5)), { level: 3, pull: [-0.6, 0.9, -1.0], focusRadius: 0.6,
        say: 'Two curved magnets sit inside the motor. They push and pull the spinning coil.',
        breaks: 'No magnets, so the coil has nothing to push against and does not spin.',
        learn: ['A coil with electricity in it is a magnet, and it needs another magnet to push against. These two do that job.', 'They are fixed to the inside of the metal can and never move.', 'Tap Look inside to see the tiny magnets that make a magnet.'] });

      // ---- gearbox (+ small gear, big gear)
      const gearbox = k.group(k.at(k.box(1.5, 1.3, 0.05), -0.85, 0.72, -0.1));
      gearbox.children[0].material = plastic(0x6a717b);
      root.add(gearbox);
      part('gearbox', 'Gearbox', gearbox, { blockedBy: ['body'], reach: ['body'], pull: [-1.0, 1.2, 2.2], face: [0, 0, 1], focusRadius: 1.2,
        say: 'The gearbox holds the gears that pass the motor\'s spin on to the wheels.',
        breaks: 'Without the gearbox the motor spins, but the wheels get no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['The gears are fixed to a plate so they stay lined up. If they drift apart their teeth stop touching.', 'Here a small gear on the motor turns a big gear on the back axle. Their teeth fit together like fingers.', 'Gears are one of the oldest machines. They let you trade speed for strength.'] });
      kid(gearbox, 'gearbox', 'smallGear', 'Small gear', gear(SMALL, 0xc9ced6, 0xd8342c, 'small'), { level: 2, pull: [0.2, 1.2, 1.4], face: [0, 0, 1], focusRadius: 0.6,
        say: 'The small gear sits on the motor and spins very fast.',
        breaks: 'The motor spins, but the small gear is gone, so the wheels get no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['It is fixed on the motor\'s shaft, so it spins as fast as the motor.', 'Its teeth push the teeth of the big gear, one after another, like a line of kids passing a ball.', 'A small gear driving a big gear turns it slower, but with more push.'] });
      kid(gearbox, 'gearbox', 'bigGear', 'Big gear', gear(BIG, 0xe0a52c, 0x2457c5, 'big'), { level: 2, pull: [-0.8, 0.9, 1.6], face: [0, 0, 1], focusRadius: 0.8,
        say: 'The big gear turns the back wheels. It spins slower than the small gear, but it is stronger.',
        breaks: 'The motor spins, but the big gear is gone, so the wheels get no push.', symptom: 'The motor hums, but the car does not move.',
        learn: ['Watch the colored dots. The little gear goes round twice for every time the big gear goes round once.', 'The big gear has more teeth than the small one. Each tooth that passes pushes the next one along, so it takes the big gear longer to go all the way round.', 'This trade gives you a slower, stronger turn. That is what a car needs to get moving.'] });

      // ---- axles with wheels and tires
      const rod = (cx, g) => g.add(k.at(alongZ(k.cyl(0.05, 0.05, WZ * 2 + 0.3, k.metal(0xc9ced6, { roughness: 0.25 }), 12)), cx, AY, 0));
      const wheelPart = (axleObj, axleId, cx, sign, front) => {
        const id = 'wheel' + (front ? 'F' : 'B') + (sign > 0 ? 'R' : 'L'), tid = 'tire' + (front ? 'F' : 'B') + (sign > 0 ? 'R' : 'L');
        const z = sign * WZ;
        // wheel (rim with spokes)
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
        // tire (a kid of its wheel)
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

      // ---- switch and wires (sit on the chassis, under the body)
      const sw = k.group(k.at(k.box(0.34, 0.1, 0.22, plastic(0x3a3f47)), 0.15, 0.72, -0.45), k.at(k.box(0.12, 0.1, 0.1, k.mat(0xe0842c)), 0.2, 0.8, -0.45));
      root.add(sw);
      part('switch', 'Switch', sw, { level: 2, fuse: 'chassis', blockedBy: ['body'], pull: [0.4, 1.4, -1.2], focusRadius: 0.6,
        say: 'The switch opens and closes the road for the electricity.',
        breaks: 'The road is closed, so the motor gets nothing. The car does not go!', symptom: 'The car will not go at all.',
        learn: ['When the switch is on, a little piece of metal touches and the electricity can pass. When it is off the metal moves away.', 'Turning it off stops the batteries running down while the toy sits in a drawer.', 'Tap Look inside to see how a switch works.'] });
      const wireR = k.mat(0xc0392b, { roughness: 0.5 }), wireB = k.mat(0x1d1d20, { roughness: 0.5 });
      const wires = k.group(
        k.tube([[0.1, 0.9, -0.3], [0.1, 0.78, -0.4], [0.15, 0.74, -0.45]], 0.022, wireR),
        k.tube([[0.25, 0.74, -0.45], [0.0, 0.78, -0.5], [-0.2, 0.86, -0.55], [-0.42, 0.93, -0.55]], 0.022, wireR),
        k.tube([[1.2, 0.88, 0.0], [1.28, 0.72, -0.3], [0.8, 0.66, -0.52], [0.1, 0.68, -0.55], [-0.2, 0.8, -0.62], [-0.42, 0.85, -0.62]], 0.022, wireB));
      root.add(wires);
      part('wires', 'Wires', wires, { level: 2, fuse: 'chassis', blockedBy: ['body'], pull: [0, 1.6, 1.4],
        say: 'Wires are roads for electricity. They carry it from the batteries to the motor.',
        breaks: 'The roads are cut, so the electricity cannot get to the motor.', symptom: 'The car will not go at all.',
        learn: ['Wires are copper inside, because copper lets electricity through easily. Plastic on the outside keeps them from touching.', 'Here they join the batteries, the switch and the motor into one loop.', 'Tap Look inside to see inside a wire.'] });

      return { root, parts, shell: [], refs: { spinners, roadTex, wm: 0, a: { small: 0, big: 0, rear: 0, front: 0 } } };
    },

    evaluate(has, on) {
      const elec = has('battery') && has('motor') && has('wires') && has('switch') && has('contacts') && has('motorMagnets');
      const spin = on && elec;
      const drive = spin && has('gearbox') && has('smallGear') && has('bigGear') && has('backAxle');
      const rear = ((has('wheelBL') && has('tireBL') ? 1 : 0) + (has('wheelBR') && has('tireBR') ? 1 : 0)) / 2;
      let reason = '';
      if (on && !elec) {
        reason = !has('battery') || !has('contacts') ? 'There are no batteries touching the motor, so it gets no electricity.'
          : !has('motor') || !has('motorMagnets') ? 'There is no working motor to make it go.'
          : 'The electricity cannot get from the batteries to the motor.';
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
    'Electric motor': 'motor-inside', 'Motor magnets': 'magnet-inside', 'Battery pack': 'battery-inside',
    'Wires': 'wire-inside', 'Screw': 'screw-inside', 'Switch': 'switch-inside',
  });
})();
