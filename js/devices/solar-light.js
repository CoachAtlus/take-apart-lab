/* Solar garden light. Beginner 6 pieces, Medium 22, Advanced 48.
 * Uses the Time dial (Day / Night) instead of Power: in the day the sun fills the battery (watch the
 * charge meter), at night the light sensor turns the LED on and the battery drains.
 * Also registers one inside world: "Inside a solar cell". Needs js/worlds.js (TAL.wk). */
(function () {
  const T = window.THREE;
  const wk = TAL.wk;
  const CHARGE_SEC = 9, DRAIN_SEC = 16; // sped up on purpose so a kid can watch it

  // =====================================================================  inside a solar cell
  wk.world({
    id: 'solar-cell-inside', name: 'Inside a solar cell', zoom: '100×', short: 'solar cell',
    view: wk.view(1.5, 4.4, 5.6, -0.5, 0.3),
    dial: {
      label: 'Sunshine',
      steps: [
        { name: 'Dark', level: 0, say: 'No sunshine. No light is hitting the cell, so no electrons get knocked loose. No electricity!' },
        { name: 'Dim', level: 0.4, say: 'A little sunshine, like a cloudy day. A few bits of light hit the cell, so a few electrons get loose. A little electricity.' },
        { name: 'Bright', level: 1, say: 'Bright sunshine! Lots of light hits the cell and lots of electrons get loose. They march round the wire and light the bulb!' },
      ],
    },
    intro: 'We shrank down into a solar cell! Tap the Sunshine button to make it dark, dim or bright. Watch the yellow light hit the silicon and knock tiny blue electrons loose. They march round the wire and light the bulb. The bar shows how much electricity is made.',
    shellSay: 'This is a slice of a solar cell, made of silicon.',
    learn: [
      'The cell is a sandwich of two kinds of silicon. When light hits it, it can knock an electron loose from its atom.',
      'Where the two kinds of silicon meet there is a one-way wall. It lets loose electrons slip toward the top but not back, so they all drift the same way. Electrons all drifting the same way is electricity.',
      'The electrons cannot leave through the glass, so they leave through the metal fingers, go round the wire, pass through the bulb, and come back in at the bottom. No light means no loose electrons, so nothing moves.',
    ],
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(wk.part(k, root, s));
      const speck = (base, hi, lo) => k.canvasTex(128, 128, (c, w, h) => {
        c.fillStyle = base; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 420; i++) { c.globalAlpha = 0.22; c.fillStyle = Math.random() < 0.5 ? hi : lo; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); }
        c.globalAlpha = 1;
      });
      const silver = k.metal(0xc9ced6, { roughness: 0.25 });
      const wireMat = k.mat(0xc0392b, { roughness: 0.5 });
      // layers, bottom to top
      add({ id: 'back', name: 'Back metal', fixed: true, obj: k.group(k.at(k.box(3.4, 0.1, 2.0, silver), 0, 0.1, 0)), tagAt: [-2.0, -0.15, 1.0],
        say: 'A sheet of metal on the back. The electrons come home to the cell through here.',
        learn: ['After the electrons have lit the bulb, they come back in through the back metal and the cycle starts again.', 'It is usually aluminum or silver. It covers the whole back so electrons can get in from anywhere.', 'Electricity needs a full loop. The fingers on top are the way out and the back metal is the way in.'] });
      add({ id: 'bottom', name: 'Bottom silicon', fixed: true, obj: k.group(k.at(k.box(3.2, 1.0, 1.8, k.mat(0xffffff, { map: speck('#7d8fb5', '#9fb0d0', '#5d6e94'), roughness: 0.4, metalness: 0.2 })), 0, 0.65, 0)), tagAt: [-2.0, 0.55, 0.9], tag: 'Bottom silicon',
        say: 'This thick layer is silicon with a little bit of boron mixed in. It likes to have spare spots where an electron could sit.',
        learn: ['Silicon is made from sand, cleaned up until it is very pure and then shaped into thin layers.', 'The mixed-in boron leaves empty spots called holes. A hole acts like a tiny plus charge that can move.', 'Most of the sunlight is soaked up in this thick layer, so this is where most of the loose electrons come from.'] });
      const wallMat = k.mat(0xffd166, { transparent: true, opacity: 0.55, emissive: 0xffb02e, emissiveIntensity: 0.6, depthWrite: false });
      add({ id: 'wall', name: 'One-way wall', fixed: true, obj: k.group(k.at(k.box(3.2, 0.06, 1.8, wallMat), 0, 1.15, 0)), tagAt: [-2.0, 1.05, 0.9],
        say: 'A one-way wall is built right here. It lets electrons slip up but does not let them slip back.',
        learn: ['Like a slide at the playground: easy to go down, hard to climb back up. Electrons slide to the top and get stuck there until the wire gives them a way to go.', 'It is where the top silicon (extra electrons) meets the bottom silicon (spare spots). Some electrons wander across and set up a small push that points one way.', 'That push is called an electric field. Any loose electron that finds the wall gets pushed to the top side, and any hole gets pushed to the bottom side.'] });
      add({ id: 'top', name: 'Top silicon', fixed: true, obj: k.group(k.at(k.box(3.2, 0.28, 1.8, k.mat(0xffffff, { map: speck('#2f5fb8', '#5f8ae0', '#1f3f86'), roughness: 0.3, metalness: 0.25 })), 0, 1.29, 0)), tagAt: [-2.0, 1.55, 0.9],
        say: 'This thin top layer is silicon with a little phosphorus mixed in. It has extra electrons that are happy to move.',
        learn: ['It is very thin so light can reach the thick layer below.', 'Phosphorus brings an extra electron that is not stuck to any atom, so it can roam.', 'This is also why solar cells look dark blue: the top is coated to catch as much light as it can.'] });
      // fingers and bus bar
      const fingers = k.group();
      [-1.1, 0, 1.1].forEach((x) => fingers.add(k.at(k.box(0.12, 0.05, 1.9, silver), x, 1.455, -0.05)));
      fingers.add(k.at(k.box(3.1, 0.06, 0.12, silver), 0.4, 1.455, -1.05));
      add({ id: 'fingers', name: 'Metal fingers', obj: fingers, blockedBy: ['cover'], pull: [0, 1.7, -1.6], tagAt: [1.1, 1.8, 0.2],
        say: 'The thin metal fingers collect the loose electrons and send them out into the wire.',
        breaks: 'The electrons have no way out! They wander for a moment and then fall back. No electricity, and the bulb goes dark.',
        learn: ['They are thin so they do not block much sunlight, but there are enough of them to catch electrons from all over the top.', 'If the fingers were wider they would collect electrons more easily, but they would shade the cell. Cell makers balance the two.', 'You can see the fingers on a real solar panel as thin lines across each cell.'] });
      add({ id: 'cover', name: 'Glass cover', obj: k.group(k.at(k.box(3.4, 0.1, 2.0, k.glass(0xd8f0ff, 0.3, { depthWrite: true })), 0, 1.58, 0)), pull: [0, 2.2, 1.4], tagAt: [-2.0, 2.05, 0.9],
        say: 'A clear glass cover keeps rain and dust off the cell.',
        breaks: 'The cell still works, but without its cover rain and scratches could hurt it.', breaksAlways: true,
        learn: ['Sunlight goes straight through clear glass, so the cell hardly notices it is there.', 'Solar panels can sit outside for years, so the glass has to be tough against wind, rain and hail.', 'The glass is often coated so less sunlight bounces off and more gets through.'] });
      // wire out to a little bulb and back
      const loopTop = k.tube([[1.9, 1.455, -1.05], [2.6, 1.455, -1.05], [2.6, 1.25, -1.05]], 0.035, wireMat);
      const loopBot = k.tube([[2.6, 0.75, -1.05], [2.6, 0.1, -1.05], [1.7, 0.1, -1.0]], 0.035, wireMat);
      const bulbMat = k.glow(0xfffbe8, 0xffd96a);
      const bulb = k.at(k.sphere(0.23, bulbMat, 20), 2.6, 1.0, -1.05);
      add({ id: 'bulb', name: 'Wire and bulb', fixed: true, obj: k.group(loopTop, loopBot, bulb), tagAt: [2.6, 1.55, -1.05],
        say: 'The wire carries the electrons round to a little bulb and back to the bottom. The bulb shows you when electricity is flowing.',
        learn: ['Electrons only flow when they have a complete loop to run around. Here the loop goes top, wire, bulb, back metal, silicon.', 'The brighter the sunshine, the more electrons move, so the bulb glows brighter.', 'In the garden light this loop goes into the battery to fill it up, instead of a bulb.'] });
      // the moving things: photons (light), electrons and holes
      const N = 22, slots = [];
      const sph = (r, col) => { const m = k.mesh(new T.SphereGeometry(r, 12, 10), new T.MeshBasicMaterial({ color: col, toneMapped: false })); m.userData.noPick = true; m.visible = false; return m; };
      for (let i = 0; i < N; i++) {
        const ph = sph(0.07, 0xffe066), el = sph(0.075, 0x58b8ff);
        const ho = k.mesh(new T.TorusGeometry(0.075, 0.022, 8, 16), new T.MeshBasicMaterial({ color: 0xff7a7a, toneMapped: false })); ho.userData.noPick = true; ho.visible = false;
        root.add(ph, el, ho);
        slots.push({ ph, el, ho, st: 0, wait: Math.random() * 2, x: 0, z: 0, ya: 1, path: null, s: 0, len: 0, fade: 0 });
      }
      add({ id: 'photon', name: 'Light', fixed: true, obj: k.group(), tagAt: [-1.2, 3.1, 0.6], tag: 'Light',
        say: 'The yellow dots are tiny packets of light. When one hits the silicon, it can knock an electron loose.',
        learn: ['Sunlight is made of tiny packets of light called photons. Each one carries a little bit of energy.', 'If a photon has enough energy and hits the right spot, it gives all of its energy to one electron and the electron jumps free of its atom.', 'Brighter sunshine just means more photons arriving each second, so more electrons get loose.'] });
      add({ id: 'electron', name: 'Electron', fixed: true, obj: k.group(), tagAt: [0.4, 2.0, 0.9], tag: 'Electron',
        say: 'The blue dots are loose electrons. The one-way wall pushes them up, and the wire takes them round.',
        learn: ['Electrons are tiny bits of electricity. Loose ones can move, and moving electrons are what we call current.', 'Each loose electron leaves a hole behind. The electron goes up to the fingers and the hole drifts down.', 'The electrons travel round the wire, do some work in the bulb, and come back to fill the holes at the bottom.'] });
      add({ id: 'hole', name: 'Hole', fixed: true, obj: k.group(), tagAt: [0.9, 0.3, 1.0], tag: 'Hole',
        say: 'A red ring is a hole, the empty spot an electron left behind. Holes drift down toward the back.',
        learn: ['A hole is not a thing, it is a missing electron. But it acts like a tiny plus charge that can move.', 'The one-way wall pushes holes down while it pushes electrons up. That keeps the two apart so they cannot just fall back together.', 'When an electron comes home through the back metal, it fills a hole. The loop is closed.'] });
      // the meter: how much electricity is being made
      const meterFrame = k.at(k.box(0.5, 2.2, 0.16, k.mat(0x2a3040)), -3.4, 1.2, 0.3);
      const meterFill = k.at(k.box(0.34, 2.0, 0.06, new T.MeshBasicMaterial({ color: 0x34d27b, toneMapped: false })), -3.4, 0.2, 0.4);
      meterFill.geometry.translate(0, 1.0, 0);
      meterFill.scale.y = 0.001;
      const meterLab = k.label('Electricity made', { size: 0.18 }); meterLab.position.set(-3.4, 2.55, 0.3);
      [meterFrame, meterFill].forEach((m) => { m.userData.noPick = true; });
      root.add(meterFrame, meterFill, meterLab);
      return { root, parts, refs: { slots, bulb, meterFill, cur: 0, fingerX: [-1.1, 0, 1.1], N } };
    },
    evaluate(has, on) { return { alive: on, out: has('fingers'), cover: has('cover') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, level = inst.def.dial.steps[inst.dial || 0].level;
      const o = out || {};
      let flowing = 0;
      const pathFor = (x, y, z) => {
        const xf = r.fingerX.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));
        return [[x, y, z], [x, 1.46, z], [xf, 1.46, z], [xf, 1.46, -1.0], [xf, 1.46, -1.05], [1.9, 1.46, -1.05], [2.6, 1.46, -1.05], [2.6, 0.1, -1.05], [1.75, 0.1, -1.0]];
      };
      r.slots.forEach((s) => {
        if (s.st === 0) {
          s.wait -= dt * level * 1.6;
          if (s.wait <= 0 && level > 0) {
            s.st = 1; s.x = (Math.random() - 0.5) * 2.8; s.z = (Math.random() - 0.5) * 1.6; s.ya = 0.5 + Math.random() * 0.9; s.py = 3.4;
            s.ph.position.set(s.x, s.py, s.z); s.ph.visible = true;
          }
        } else if (s.st === 1) {
          s.py -= dt * 2.4;
          s.ph.position.y = s.py;
          if (s.py <= s.ya) {
            s.ph.visible = false; s.st = 2; s.ey = s.ya; s.hy = s.ya;
            s.el.position.set(s.x, s.ya, s.z); s.ho.position.set(s.x, s.ya, s.z); s.ho.rotation.x = Math.PI / 2; s.el.visible = s.ho.visible = true;
          }
        } else if (s.st === 2) {
          s.ey = Math.min(1.43, s.ey + dt * 1.5); s.hy = Math.max(0.17, s.hy - dt * 1.0);
          s.el.position.y = s.ey; s.ho.position.y = s.hy;
          if (s.ey >= 1.43) {
            if (o.out) {
              s.st = 3; s.path = pathFor(s.x, s.ey, s.z); s.s = 0; s.segs = [];
              s.len = 0; for (let i = 1; i < s.path.length; i++) { const a = s.path[i - 1], b = s.path[i], d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); s.segs.push(d); s.len += d; }
            } else { s.st = 4; s.fade = 0.7; }
          }
        } else if (s.st === 3) {
          s.s += dt * 2.2;
          flowing++;
          let d = s.s, i = 0;
          while (i < s.segs.length - 1 && d > s.segs[i]) { d -= s.segs[i]; i++; }
          const a = s.path[i], b = s.path[i + 1], f = Math.min(1, d / (s.segs[i] || 1));
          s.el.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
          s.hy = Math.max(0.17, s.hy - dt * 1.0); s.ho.position.y = s.hy;
          if (s.s >= s.len) { s.el.visible = s.ho.visible = false; s.st = 0; s.wait = 0.2 + Math.random() * 1.0; }
        } else {
          s.fade -= dt; s.el.scale.setScalar(Math.max(0.05, s.fade / 0.7)); s.ho.scale.setScalar(Math.max(0.05, s.fade / 0.7));
          if (s.fade <= 0) { s.el.visible = s.ho.visible = false; s.el.scale.setScalar(1); s.ho.scale.setScalar(1); s.st = 0; s.wait = 0.2 + Math.random(); }
        }
        if (s.st === 3 || s.st === 2) s.el.visible = true;
      });
      r.cur += (Math.min(1, flowing / 5) - r.cur) * Math.min(1, dt * 3);
      r.bulb.material.emissiveIntensity = 3.2 * r.cur;
      r.bulb.material.color.setHex(r.cur > 0.08 ? 0xfffbe8 : 0x7d786b);
      r.meterFill.scale.y = Math.max(0.001, r.cur);
    },
  });

  // =====================================================================  the garden light
  const SCREW_LEARN = ['The screw spins into a hole and its spiral thread bites in, so it cannot slip out.', 'A screw is a ramp wrapped round a rod. A small turn moves it a tiny bit forward with a lot of grip.', 'Tap Look inside to see how a screw works.'];

  TAL.registerDevice({
    id: 'solar-light',
    name: 'Solar Garden Light',
    short: 'garden light',
    subtitle: 'Sunshine by day, glow by night',
    powerSound: 'click',
    channels: false,
    dial: {
      label: 'Time',
      steps: [
        { name: 'Day', level: 0, say: 'It is daytime. The sun shines on the solar cell and fills the battery. The light takes a nap.' },
        { name: 'Night', level: 1, say: 'Now it is night. The light sensor feels the dark and turns the light on. Watch the battery slowly empty.' },
      ],
    },
    view: { target: [0, 2.3, 0], radius: 5.4, explodedRadius: 7.4, explodedY: 3.4, yaw: -0.45, pitch: 0.3, shadow: [8, 5] },
    intro: 'This is a solar garden light. In the day it drinks up sunshine, and at night it lights up all by itself. Tap the Time button to switch between day and night, and watch the charge meter!',
    shellSay: 'That is the grass the light is standing in.',
    guide: [
      { do: 'remove', ids: ['screw1', 'screw2', 'screw3', 'screw4', 'lid'], say: "Hi, I'm Sparky! Try the Time button first: Day fills the battery and Night turns the light on. Then twist out any screws and pull the lid with the solar panel off the top.", nudge: 'Pull the lid off the top.' },
      { do: 'remove', ids: ['cell'], levels: [2], say: 'Slide the solar cell out of the lid. Now set the time to Day. Does the battery still fill up?', nudge: 'Pull the solar cell out of the lid.' },
      { do: 'remove', ids: ['frame', 'cover', 'ribbon', 'cell'], levels: [3], say: 'Take the frame off the lid, peel off the clear cover, lift the shiny ribbons, then slide the solar cell out. Now set the time to Day. Does the battery still fill up?', nudge: 'Take the panel apart, layer by layer.' },
      { do: 'remove', ids: ['sensor'], levels: [2, 3], say: 'Now find the little light sensor on the circuit board and pull it off. Set the time to Day. What does the light do?', nudge: 'Pull the light sensor off the board.' },
      { do: 'remove', ids: ['bscrew1', 'bscrew2', 'board'], say: 'Now lift out the circuit board. It is the little brain.', nudge: 'Pull the circuit board out.' },
      { do: 'remove', ids: ['battery'], say: 'Pull out the battery. Set the time to Night. Can the light come on?', nudge: 'Pull the battery out.' },
      { do: 'end', say: 'The light needs the sun, a battery, a brain and an LED, all working together. Put the parts back and try Day and Night again!' },
    ],

    build(k) {
      const root = k.group();
      const parts = [];
      const part = (id, name, obj, o) => { const s = Object.assign({ id, name, obj, noSpark: true }, o); parts.push(s); return s; };
      const kid = (parentObj, parentId, id, name, obj, o) => { parentObj.add(obj); return part(id, name, obj, Object.assign({ parent: parentId }, o)); };
      const plastic = (c) => k.mat(c, { roughness: 0.55 });
      const along = (m) => k.rot(m, 0, 0, Math.PI / 2); // lie a cylinder along x
      const steel = k.metal(0x9aa0a8, { roughness: 0.4 });
      const copper = (o) => k.metal(0xc8743a, Object.assign({ roughness: 0.4 }, o || {}));
      const BZ = -0.2, BY = 3.06; // where the battery lies

      // ---- scenery: grass mound
      const mound = k.at(k.cyl(1.3, 1.9, 0.5, k.mat(0x2a5f1f, { roughness: 0.95 }), 40), 0, 0.25, 0);
      mound.userData.noPick = true; root.add(mound);

      // ---- stake: upper pole (the part), plus spike, lower pole, joint sleeve, joint screw and top cap
      const stake = k.group(k.at(k.cyl(0.07, 0.07, 0.5, steel, 14), 0, 1.85, 0));
      root.add(stake);
      const spike = k.group(k.at(k.cyl(0.1, 0.012, 0.75, plastic(0x2a2f36), 14), 0, 0.475, 0));
      const lowpole = k.group(k.at(k.cyl(0.07, 0.07, 0.6, steel, 14), 0, 1.15, 0));
      const joint = k.group(k.at(k.cyl(0.1, 0.1, 0.2, plastic(0x4a5560), 20), 0, 1.5, 0));
      const topcap = k.group(k.at(k.cyl(0.075, 0.075, 0.05, plastic(0x2a2f36), 14), 0, 2.125, 0));
      const jscrew = k.screw(0xc3c7cf, 0.12); jscrew.scale.setScalar(0.4); k.rot(jscrew, 0, 0, -Math.PI / 2); jscrew.position.set(0.1, 1.5, 0);

      // ---- diffuser globe (+ ring)
      const globe = k.group(k.at(k.sphere(0.52, k.glass(0xf6ecd2, 0.5, { side: T.DoubleSide, roughness: 0.4 }), 28), 0, 2.5, 0));
      root.add(globe);

      // ---- lamp body: housing wall + rim, and a floor plate with a hole for the LED
      const wallMat = k.mat(0x2f4a3a, { roughness: 0.6, side: T.DoubleSide });
      const floorMesh = k.mesh(new T.RingGeometry(0.14, 0.56, 32), wallMat); floorMesh.rotation.x = -Math.PI / 2; floorMesh.position.set(0, 2.97, 0);
      const rim = k.at(k.rot(k.torus(0.56, 0.03, plastic(0x24382c), 36), Math.PI / 2, 0, 0), 0, 2.95, 0);
      const body = k.group(k.at(k.cyl(0.56, 0.56, 0.55, wallMat, 36, true), 0, 3.225, 0), rim);
      root.add(body);
      const floor = k.group(floorMesh);

      // ---- battery: steel can (the part), blue sleeve, plus button and insulator ring
      const battery = k.group(
        k.at(along(k.cyl(0.088, 0.088, 0.64, k.metal(0xc9ced6, { roughness: 0.35 }), 20)), 0, BY, BZ),
        k.at(along(k.cyl(0.092, 0.092, 0.03, k.metal(0xaeb4bc), 20)), -0.325, BY, BZ));
      root.add(battery);
      const sleeve = k.group(k.at(along(k.cyl(0.1, 0.1, 0.6, k.mat(0x2a5fb0, { roughness: 0.4, side: T.DoubleSide }), 20, true)), 0, BY, BZ));
      const posterm = k.group(k.at(along(k.cyl(0.055, 0.055, 0.02, k.metal(0xd7dce2), 16)), 0.335, BY, BZ), k.at(along(k.cyl(0.032, 0.032, 0.03, k.metal(0xd7dce2), 12)), 0.36, BY, BZ));
      const ring = k.group(k.at(along(k.cyl(0.09, 0.09, 0.012, plastic(0xeeeeee), 20)), 0.312, BY, BZ));

      // ---- battery holder (tray + end walls), contact tab, contact spring
      const holderMat = plastic(0x2b2f36);
      const holder = k.group(k.at(k.box(0.89, 0.04, 0.22, holderMat), 0, 2.965, BZ), k.at(k.box(0.03, 0.16, 0.22, holderMat), 0.43, 3.03, BZ), k.at(k.box(0.03, 0.16, 0.22, holderMat), -0.43, 3.03, BZ));
      const tab = k.group(k.at(k.box(0.02, 0.17, 0.16, k.metal(0xd8c48a)), 0.395, BY, BZ));
      const springPts = Array.from({ length: 30 }, (_, i) => { const f = i / 29, a = f * 3.5 * Math.PI * 2; return [-0.345 - 0.07 * f, BY + Math.cos(a) * 0.05, BZ + Math.sin(a) * 0.05]; });
      const spring = k.group(k.tube(springPts, 0.011, k.metal(0xc9ced6, { roughness: 0.3 })));

      // ---- circuit board (disc) and the little parts on it
      const pcbTex = k.pcbTexture(1, 1, 4, '#2f7d4a');
      const board = k.group(k.at(k.cyl(0.46, 0.46, 0.04, k.mat(0xffffff, { map: pcbTex, roughness: 0.7 }), 40), 0, 3.3, 0));
      root.add(board);

      // ---- lid with solar panel on top
      const cellTex = k.canvasTex(256, 256, (c, w, h) => {
        const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#1d3f8f'); g.addColorStop(1, '#0f2358'); c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(200,210,235,0.75)'; c.lineWidth = 2;
        for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo((w * i) / 4, 0); c.lineTo((w * i) / 4, h); c.stroke(); }
        c.lineWidth = 1; c.strokeStyle = 'rgba(200,210,235,0.3)';
        for (let i = 1; i < 16; i++) { c.beginPath(); c.moveTo(0, (h * i) / 16); c.lineTo(w, (h * i) / 16); c.stroke(); }
      });
      const lid = k.group(k.at(k.cyl(0.64, 0.64, 0.1, plastic(0x2b2f36), 40), 0, 3.57, 0));
      root.add(lid);

      // ---- sun and moon, beam, meter, light (scenery, not parts)
      const scen = (o) => { o.userData.noPick = true; root.add(o); return o; };
      const SUN = [-5.6, 7.4, -2.5], LID = [0, 3.65, 0];
      const sun = k.group(k.mesh(new T.SphereGeometry(0.34, 20, 16), new T.MeshBasicMaterial({ color: 0xffd23a, toneMapped: false })));
      const sunHalo = wk.halo(k, 0, 0, 0, 0xffe08a, 2.2); sunHalo.visible = true; sun.add(sunHalo);
      sun.position.set(SUN[0], SUN[1], SUN[2]);
      const sunLab = k.label('Sun', { size: 0.2, bg: 'rgba(170,120,0,0.92)' }); sunLab.position.set(0, -0.6, 0); sun.add(sunLab);
      scen(sun);
      const moon = k.group(k.mesh(new T.SphereGeometry(0.28, 20, 16), new T.MeshBasicMaterial({ color: 0xdfe8ff, toneMapped: false })));
      const moonHalo = wk.halo(k, 0, 0, 0, 0x8aa6ff, 1.6); moonHalo.visible = true; moon.add(moonHalo);
      moon.position.set(SUN[0], SUN[1], SUN[2]);
      const moonLab = k.label('Night', { size: 0.2, bg: 'rgba(40,60,130,0.92)' }); moonLab.position.set(0, -0.55, 0); moon.add(moonLab);
      scen(moon);
      const stars = [];
      for (let i = 0; i < 9; i++) {
        const s = new T.Sprite(new T.SpriteMaterial({ map: k.dotTex(), color: 0xffffff, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        s.scale.setScalar(0.22); s.position.set(-3.2 + Math.random() * 6.4, 4.2 + Math.random() * 1.6, -3 + Math.random() * 2); scen(s); stars.push(s);
      }
      // sun beam onto the lid
      const sv = new T.Vector3(...SUN), lv = new T.Vector3(...LID), dir = sv.clone().sub(lv), len = dir.length();
      const beam = k.mesh(new T.CylinderGeometry(0.06, 0.62, len, 24, 1, true), new T.MeshBasicMaterial({ color: 0xfff0a0, transparent: true, opacity: 0.14, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
      beam.position.copy(lv).addScaledVector(dir, 0.5);
      beam.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
      scen(beam);
      const rays = k.flow([[SUN[0] + 0.3, SUN[1] - 0.3, SUN[2]], [0, 3.8, 0]], { count: 9, color: 0xffe066, size: 0.2 }); root.add(rays);
      // charge meter
      const mx = 2.9, my = 1.5, mz = -1.4;
      scen(k.at(k.box(0.62, 2.5, 0.16, k.mat(0x1c2230)), mx, my + 0.5, mz));
      const segs = [];
      for (let i = 0; i < 8; i++) {
        const sg = k.mesh(new T.BoxGeometry(0.44, 0.2, 0.06), new T.MeshBasicMaterial({ color: 0x2a3040, toneMapped: false }));
        sg.position.set(mx, my - 0.6 + i * 0.26, mz + 0.1); scen(sg); segs.push(sg);
      }
      const meterLab = k.label('Charge', { size: 0.22 }); meterLab.position.set(mx, my + 2.1, mz); scen(meterLab);
      const stateLabs = {
        charging: k.label('Filling up', { size: 0.2, bg: 'rgba(30,130,70,0.92)' }),
        full: k.label('Full!', { size: 0.2, bg: 'rgba(30,130,70,0.92)' }),
        lightOn: k.label('Using it up', { size: 0.2, bg: 'rgba(170,110,0,0.92)' }),
        empty: k.label('Empty', { size: 0.2, bg: 'rgba(170,50,40,0.92)' }),
      };
      Object.values(stateLabs).forEach((l) => { l.position.set(mx, my - 1.05, mz); l.visible = false; scen(l); });
      // light on the ground
      const lamp = new T.PointLight(0xffe2a0, 0, 9, 2); lamp.position.set(0, 2.8, 0.2); root.add(lamp);
      const halo = wk.halo(k, 0, 2.6, 0, 0xffe9a0, 2.4); halo.renderOrder = 5; root.add(halo);

      // =================================================================  parts
      // ---------- the stake (beginner: one piece; medium: spike, lower pole, joint; advanced: more)
      part('stake', 'Stake', stake, { blockedBy: ['globe'], reach: [],
        say: 'The stake pokes into the ground and holds the light up, like a tent peg.',
        job: 'It holds the light up high where the sun can find it.', fact: 'The pointy end slides into soft dirt and the dirt holds it still.',
        learn: ['The stake is pointy so it slides into the dirt, and then the dirt squeezes it and holds it still.', 'Most of the stake is a plain rod. It does no electricity work. Its whole job is to hold everything up where the sky can reach it.', 'Standing the light up off the ground also keeps the grass from shading the panel.'] });
      kid(stake, 'stake', 'spike', 'Ground spike', spike, { level: 2, focusRadius: 0.9,
        say: 'The spike is the pointy end. It pokes into the dirt like a tent peg.', job: 'It anchors the light in the ground so the wind cannot tip it over.',
        learn: ['It is like a tent peg. The point goes in easily and then the dirt hugs it tight.', 'A spike can be plastic or metal. Plastic does not rust in wet soil.', 'The wider the spike gets higher up, the more dirt grips it, like a wedge.'] });
      kid(stake, 'stake', 'lowpole', 'Lower pole', lowpole, { level: 2, focusRadius: 1.0,
        say: 'This is one section of the pole. Pole sections slide together like building blocks.', job: 'It lifts the light up above the grass so it can see the sun.',
        learn: ['It is like the leg of a tall table: it lifts the light up high.', 'A tube is strong for its weight, because the metal is out at the edge where bending pushes hardest.', 'Making the pole in sections lets it ship in a small box and snap together at home.'] });
      kid(stake, 'stake', 'joint', 'Pole joint', joint, { level: 2, focusRadius: 0.7,
        say: 'The joint is a little sleeve that holds two pole sections together.', job: 'It joins the pole sections into one stick.',
        learn: ['It is like a sleeve that hugs two arms of a coat at once.', 'The tubes slide into the sleeve, and a screw or a snug fit stops them wiggling.', 'A wobbly light usually wobbles right at a joint like this.'] });
      kid(stake, 'stake', 'jscrew', 'Screw', jscrew, { level: 3, kind: 'screw', focusRadius: 0.6,
        say: 'A tiny screw keeps the pole joint from coming apart.', job: 'It stops the pole sections from sliding apart.', learn: SCREW_LEARN });
      kid(stake, 'stake', 'topcap', 'Pole top cap', topcap, { level: 3, focusRadius: 0.6,
        say: 'A little plastic cap closes the top of the pole.', job: 'It keeps rain and bugs out of the pole.',
        learn: ['It is like the lid on a straw: it keeps things out of the open end.', 'An open tube would fill up with rain and dirt, so the end gets plugged.', 'The cap also covers the sharp cut edge of the tube.'] });

      // ---------- the globe
      part('globe', 'Diffuser globe', globe, { blockedBy: ['body'], face: [0, 0, 1],
        say: 'The frosted globe spreads the light out so it glows soft, like a lantern.',
        breaks: 'Without the globe the light is a sharp little dot instead of a soft glow, and rain can hit the LED.',
        learn: ['Frosted plastic is a little bit rough. Light bounces around inside it and comes out going every which way.', 'That is called diffusing the light. It makes the glow look bigger and softer, and easier on your eyes than staring at the bare LED.', 'The globe also protects the LED from rain and bumps.'] });
      kid(globe, 'globe', 'collar', 'Globe ring', k.group(k.at(k.rot(k.torus(0.33, 0.045, plastic(0xb8bdc4), 28), Math.PI / 2, 0, 0), 0, 2.98, 0)), { level: 2, focusRadius: 0.8,
        say: 'The ring holds the globe on tight.', job: 'It holds the globe in place.',
        learn: ['Without the ring the globe could wobble loose in the wind.', 'It is plastic, shaped to snap or screw around the globe.', 'It is another part that does no electricity. It just keeps the other parts where they belong.'] });

      // ---------- the lamp body and what lives in it
      part('body', 'Lamp body', body, { blockedBy: ['battery', 'board'], reach: ['lid'], face: [0, 0, 1],
        say: 'The lamp body is a little house. It keeps the battery and the circuit board dry and safe.',
        job: 'It is the house for the parts, and it keeps rain out.',
        learn: ['Everything that must stay dry lives in here: the battery, the circuit board and the wires.', 'The plastic has to put up with sun, rain and cold. The rubber seal on the lid works together with it to keep water out.', 'Plastic does not carry electricity, so it also stops the wires from touching anything they should not.'] });
      kid(body, 'body', 'floor', 'LED floor plate', floor, { level: 3, blockedBy: ['holder', 'board'], face: [0, 1, 0], focusRadius: 1.0,
        say: 'The floor plate is the bottom of the lamp body. The LED pokes down through its hole.', job: 'It closes the bottom of the body and lets the LED peek out.',
        learn: ['It is like the floor of a little house. It holds things up and keeps the rooms above dry.', 'It has a hole in the middle so the LED can shine out into the globe.', 'It also helps hold the battery tray still.'] });
      kid(body, 'body', 'holder', 'Battery holder', holder, { level: 2, blockedBy: ['battery'], focusRadius: 1.0,
        say: 'The holder is a little cradle that keeps the battery from rolling around.', job: 'It holds the battery still so it keeps touching the metal tabs.',
        learn: ['It is like an egg cup: it holds something round so it cannot roll away.', 'Plastic does not carry electricity, so the holder keeps the battery away from anything it should not touch.', 'It has a metal contact at each end, and the battery is squeezed between them.'] });
      kid(body, 'body', 'contacts', 'Battery contacts', tab, { level: 2, blockedBy: ['battery'], focusRadius: 0.6,
        say: 'This metal tab touches the plus end of the battery so electricity can get in and out.',
        breaks: 'The battery is not touching anything, so no electricity can flow.',
        learn: ['Electricity only flows between parts that touch metal to metal.', 'The tab is pressed against the battery end. Springy metal keeps the touch tight even when the light gets bumped.', 'It is usually brass or steel, plated so it does not rust.'] });
      kid(tab, 'contacts', 'spring', 'Contact spring', spring, { level: 3, focusRadius: 0.6,
        say: 'This tiny spring pushes on the flat end of the battery to keep it snug.',
        breaks: 'The minus end of the battery is not touching metal, so no electricity can flow.',
        learn: ['It is like a tiny trampoline: it pushes back when you squash it.', 'The spring squeezes the battery against the tab at the other end, so the touch stays tight even when the light gets bumped.', 'It is usually steel or brass, plated so it does not rust.'] });
      const wireMat = k.mat(0xc0392b, { roughness: 0.5 }), blackMat = k.mat(0x1d1d20, { roughness: 0.5 });
      kid(body, 'body', 'wires', 'Panel wires', k.group(
        k.tube([[-0.36, 3.34, 0.12], [-0.36, 3.45, 0.1], [-0.34, 3.52, 0.05]], 0.02, wireMat),
        k.tube([[0.36, 3.34, 0.12], [0.4, 3.45, 0.1], [0.38, 3.52, 0.05]], 0.02, blackMat)), { level: 2, focusRadius: 0.7,
        say: 'These wires are little roads for electricity. They carry it from the solar panel down to the board.',
        breaks: 'The roads are cut, so the sun\'s electricity cannot get down to the board.',
        learn: ['Wires are roads for electricity. They carry it from the panel to the board.', 'Wires are copper inside, because copper lets electricity through easily. A plastic coat on the outside keeps them from touching each other.', 'Tap Look inside to see inside a wire.'] });
      kid(body, 'body', 'bwireP', 'Battery wire', k.group(k.tube([[0.4, 3.1, BZ], [0.44, 3.2, BZ + 0.02], [0.3, 3.3, -0.15]], 0.02, wireMat)), { level: 3, focusRadius: 0.6,
        say: 'The red wire is a road between the plus end of the battery and the circuit board.',
        breaks: 'The road is cut, so the battery cannot talk to the board.',
        learn: ['A wire is a road for electricity, with a coat on the outside.', 'The coat keeps it from touching other wires, because a shortcut would waste the battery.', 'One wire goes to the plus end and one to the minus end, so electricity can travel round in a loop.'] });
      kid(body, 'body', 'bwireN', 'Battery wire', k.group(k.tube([[-0.42, 3.1, BZ], [-0.46, 3.2, BZ + 0.02], [-0.3, 3.3, BZ]], 0.02, blackMat)), { level: 3, focusRadius: 0.6,
        say: 'The black wire is a road between the minus end of the battery and the circuit board.',
        breaks: 'The road is cut, so the battery cannot talk to the board.',
        learn: ['A wire is a road for electricity, with a coat on the outside.', 'The coat keeps it from touching other wires, because a shortcut would waste the battery.', 'The minus wire is the way home. Electricity needs a road out and a road back to make a loop.'] });
      const sw = k.group(k.at(k.box(0.14, 0.14, 0.24, k.mat(0x24382c)), 0.6, 3.22, 0.1));
      kid(body, 'body', 'switch', 'Switch', sw, { level: 2, focusRadius: 0.5,
        say: 'The switch lets you turn the whole light off, like a door for the electricity.',
        breaks: 'With the switch gone the path is broken. No light at night!', symptom: 'The light will not come on at night.',
        learn: ['When the switch is on, a little metal piece touches and the electricity can pass. When it is off the piece moves away and the path is open.', 'People turn it off for storing the light in a drawer so the battery does not run down.', 'Tap Look inside to see how a switch works.'] });
      kid(sw, 'switch', 'slider', 'Switch slider', k.group(k.at(k.box(0.09, 0.07, 0.1, k.mat(0xe0842c)), 0.67, 3.22, 0.1)), { level: 3, focusRadius: 0.4,
        say: 'This little orange lever is what you slide to turn the light on or off.',
        breaks: 'With no lever the switch cannot be turned on. No light at night!',
        learn: ['It is the handle, like the handle on a door.', 'Sliding it moves a small metal piece inside, so it touches different pins.', 'Tiny handles like this are designed to be pushed with a fingernail.'] });
      kid(sw, 'switch', 'pins', 'Switch pins', k.group(
        k.at(k.cyl(0.01, 0.01, 0.08, k.metal(0xd7dce2), 8), 0.6, 3.11, 0.03), k.at(k.cyl(0.01, 0.01, 0.08, k.metal(0xd7dce2), 8), 0.6, 3.11, 0.1), k.at(k.cyl(0.01, 0.01, 0.08, k.metal(0xd7dce2), 8), 0.6, 3.11, 0.17)), { level: 3, focusRadius: 0.4,
        say: 'The switch pins are the metal legs that connect the switch to the circuit.',
        breaks: 'The switch is not connected to anything, so the path is broken.',
        learn: ['The pins are like the legs of a table: they hold the switch up and connect it to the board.', 'Each pin is joined to the board with solder, which is melted metal that hardens into a strong electric glue.', 'The slider decides which two pins are joined.'] });

      // ---------- the battery
      part('battery', 'Rechargeable battery', battery, { blockedBy: ['board'], face: [0, 0, 1], focusRadius: 1.2,
        say: 'This battery is like a little water tank. The sun fills it up in the day and the light empties it at night.',
        breaks: 'No battery, so there is nothing to light the lamp at night.', symptom: 'The light will not come on at night, even after a sunny day.',
        learn: ['A rechargeable battery can be filled up again and again, unlike the one in a toy that you throw away.', 'When the sun is shining, electricity from the cell pushes the battery chemicals one way and stores energy. At night the chemicals go back and the energy flows out to the lamp.', 'Rechargeable batteries slowly wear out after many fills. That is usually why an old solar light gets dim.'] });
      kid(battery, 'battery', 'sleeve', 'Cell sleeve', sleeve, { level: 3, focusRadius: 0.7,
        say: 'The blue wrapper is a thin plastic jacket around the battery.', job: 'It keeps the metal case from touching other metal, and it carries the label.',
        learn: ['It is like a jacket for the battery, keeping its metal case covered.', 'It is a thin shrink-wrap sleeve. It insulates the case so it cannot short out against other metal.', 'Under it is the steel can that holds all the battery chemicals.'] });
      kid(battery, 'battery', 'posterm', 'Positive terminal', posterm, { level: 3, focusRadius: 0.5,
        say: 'This little button is the plus end of the battery, where the electricity comes out.',
        breaks: 'The battery has no plus end for the tab to touch, so nothing flows.',
        learn: ['It is the spout of the battery, where the electricity comes out.', 'The button sticks up so the metal tab can press on it. On AA-size cells the plus end is the raised button and the minus end is the flat end.', 'The button is a separate metal cap, kept apart from the can by a thin ring.'] });
      kid(battery, 'battery', 'ring', 'Insulator ring', ring, { level: 3, focusRadius: 0.5,
        say: 'A tiny ring keeps the plus end and the minus case apart.', job: 'It keeps the plus button from touching the minus case.',
        learn: ['It is like a fence between two neighbors who must not touch.', 'If the plus end touched the minus case, the battery would short out and waste its energy as heat.', 'It is one of the little details that makes a battery safe.'] });

      // ---------- the circuit board and its parts
      part('board', 'Circuit board', board, { blockedBy: ['lid', 'bscrew1', 'bscrew2'], reach: ['lid'], face: [0, 1, 0], focusRadius: 1.0,
        say: 'The circuit board is the little brain. It decides when to charge and when to shine.',
        breaks: 'No brain, so nothing knows when to charge or when to shine.',
        learn: ['The board holds a few tiny parts and connects them with thin copper roads.', 'Its parts watch the light, move electricity from the cell to the battery in the day, and move it from the battery to the LED at night.', 'Tap Look inside to see how a circuit board is built in layers.'] });
      kid(board, 'board', 'sensor', 'Light sensor', k.group(k.at(k.cyl(0.05, 0.05, 0.05, k.mat(0xd9822b, { roughness: 0.5 }), 16), 0.32, 3.345, 0.18), k.at(k.box(0.06, 0.012, 0.02, k.mat(0x2a1a0a)), 0.32, 3.375, 0.18)), { level: 2, focusRadius: 0.5,
        say: 'The light sensor is like an eye. It can tell day from night.',
        breaks: 'Without its eye the light cannot tell when it is dark. It stays on all the time!', symptom: 'The light stays on, even in the daytime.',
        learn: ['In bright light the sensor lets electricity through easily. In the dark it hardly lets any through.', 'The board feels that change, a bit like feeling a dimmer knob, and switches the lamp on when it gets dark.', 'Some solar lights skip this part and use the solar cell itself to notice when the sun goes away.'] });
      const ledG = k.group(
        k.at(k.cyl(0.012, 0.012, 0.38, k.metal(0xb9bec6), 8), -0.025, 3.09, 0),
        k.at(k.cyl(0.012, 0.012, 0.38, k.metal(0xb9bec6), 8), 0.025, 3.09, 0));
      const lensMat = k.glow(0xfff4cc, 0xffd96a);
      const lensDome = k.at(k.sphere(0.085, lensMat, 16), 0, 2.86, 0), lensBase = k.at(k.cyl(0.085, 0.085, 0.07, lensMat, 16), 0, 2.925, 0);
      kid(board, 'board', 'led', 'LED', ledG, { level: 2, focusRadius: 0.5,
        say: 'The LED is the tiny light that glows.', breaks: 'No LED, no light at night.', symptom: 'The light will not shine at night.',
        learn: ['LED stands for light-emitting diode. When electricity flows through it, it glows.', 'It hardly gets warm, so it wastes very little energy as heat. That helps a small battery last the whole night.', 'Tap Look inside to see an LED up close.'] });
      kid(ledG, 'led', 'lens', 'LED lens', k.group(lensDome, lensBase), { level: 3, focusRadius: 0.5,
        say: 'The clear dome on the LED lets the light out and keeps the tiny chip safe.',
        breaks: 'The dome is gone, so the tiny light chip is bare and the glow is lost.',
        learn: ['It is like a snow globe over the tiny light chip: it protects it and shapes the light.', 'It is clear plastic called epoxy, molded in a round shape so the light spreads out.', 'The light chip inside is about as small as a grain of sand. Tap Look inside to see.'] });
      kid(board, 'board', 'diode', 'Diode', k.group(k.at(along(k.cyl(0.03, 0.03, 0.14, k.mat(0x1c1c1f), 10)), -0.28, 3.335, 0.2), k.at(along(k.cyl(0.032, 0.032, 0.02, k.metal(0xd7dce2), 10)), -0.22, 3.335, 0.2)), { level: 2, focusRadius: 0.4,
        say: 'The diode is a one-way gate. Electricity can go in but cannot come back out.',
        breaks: 'The light still works, but at night the battery can leak backward through the panel.', breaksAlways: true,
        learn: ['It lets electricity go one way only, like a turnstile at a train station. That keeps the sun-made electricity flowing into the battery.', 'At night the cell makes nothing. Without a one-way gate the battery could push electricity backward through the cell and slowly empty itself.', 'A diode is made from two kinds of silicon touching. Tap Look inside to see the gate.'] });
      const coil = k.group(k.at(k.rot(k.torus(0.055, 0.028, k.mat(0x3a3a40, { roughness: 0.5 }), 16), Math.PI / 2, 0, 0), 0.12, 3.345, -0.24));
      kid(board, 'board', 'coil', 'Booster coil', coil, { level: 2, focusRadius: 0.4,
        say: 'The coil helps give the electricity a boost so the LED can light up.',
        breaks: 'No boost, so the LED does not get enough push to light.', symptom: 'The light is dark at night, but the battery is full.',
        learn: ['The battery gives a gentle push and the LED likes a bigger one. The coil and the chip work together to make a bigger push, a bit like pumping a swing.', 'Electricity flowing through a coil makes a magnetic field that stores a little energy. Switching it on and off very quickly lets it release that energy as a bigger push.', 'Many solar lights have a booster like this, because one rechargeable battery gives less push than an LED wants.'] });
      kid(coil, 'coil', 'winding', 'Copper winding', k.group(k.at(k.rot(k.torus(0.055, 0.034, copper(), 16), Math.PI / 2, 0, 0), 0.12, 3.345, -0.24)), { level: 3, focusRadius: 0.4,
        say: 'Thin copper wire is wrapped round and round the ring.',
        breaks: 'Without its wire the ring cannot make a boost, so the LED does not light.',
        learn: ['It is like thread wound around a spool: the wire loops around the ring many times.', 'Electricity in a coil of wire makes a magnetic field, and more loops make a stronger one.', 'The ring in the middle makes the magnetic field much stronger than loops of wire alone.'] });
      kid(board, 'board', 'chip', 'Control chip', k.group(k.at(k.box(0.12, 0.03, 0.12, k.mat(0x16161a)), -0.18, 3.34, -0.22)), { level: 2, focusRadius: 0.4,
        say: 'The little chip is a tiny helper. It flips the electricity on and off very fast.',
        breaks: 'The helper is gone, so the booster does not work and the LED does not light.', symptom: 'The light will not shine at night.',
        learn: ['The chip is the timer for the booster coil. It switches the electricity on and off many times a second.', 'It is a very small piece of silicon sealed in black plastic, with metal legs that connect it to the board.', 'Tap Look inside to see inside a chip.'] });
      kid(board, 'board', 'resistor', 'Resistor', k.group(k.at(along(k.cyl(0.025, 0.025, 0.14, k.mat(0xe6d3a8, { roughness: 0.6 }), 10)), 0.14, 3.335, 0.32), k.at(k.cyl(0.027, 0.027, 0.02, k.mat(0xc0392b), 10), 0.14, 3.335, 0.32)), { level: 2, focusRadius: 0.4,
        say: 'The resistor is a tiny speed bump. It keeps the LED from getting too much electricity.',
        breaks: 'The light still works, but the LED could get too much push and wear out sooner.', breaksAlways: true,
        learn: ['Too much electricity can burn out an LED, like too much water pressure can burst a balloon. A resistor holds some of it back.', 'It works by making the electrons squeeze through something narrow, which uses up some of their push.', 'Tap Look inside to see how a resistor is made.'] });
      kid(board, 'board', 'rsmall', 'Small resistor', k.group(k.at(along(k.cyl(0.022, 0.022, 0.12, k.mat(0xe6d3a8, { roughness: 0.6 }), 10)), 0, 3.335, -0.38), k.at(k.cyl(0.024, 0.024, 0.02, k.mat(0x2a6fb0), 10), 0, 3.335, -0.38)), { level: 3, focusRadius: 0.4,
        say: 'Another tiny speed bump. It lets just the right amount of electricity through to the chip.', job: 'It helps the chip get just the right amount of electricity.',
        learn: ['A speed bump slows cars down, and a resistor slows electricity down.', 'It works by making the electrons squeeze through something narrow, which uses up some of their push.', 'The colored stripes on a resistor are a code for how much it holds back.'] });
      kid(board, 'board', 'cap', 'Capacitor', k.group(k.at(k.box(0.07, 0.05, 0.04, k.mat(0xc8a05a, { roughness: 0.5 })), -0.05, 3.345, 0.15)), { level: 3, focusRadius: 0.4,
        say: 'The capacitor is a tiny cup that stores a little electricity and gives it back smoothly.',
        breaks: 'Without its cup the electricity gets bumpy and the light flickers.', symptom: 'The light flickers at night.',
        learn: ['It is like a tiny cup of water: it fills up and then pours out slowly, so the flow stays smooth.', 'A capacitor stores a little electric charge on two plates that sit very close but do not touch.', 'When the supply gets bumpy the capacitor fills in the dips, so the LED does not jump around.'] });
      kid(board, 'board', 'fcap', 'Filter capacitor', k.group(k.at(k.cyl(0.05, 0.05, 0.1, k.mat(0x1d2b4a, { roughness: 0.5 }), 14), 0.33, 3.37, -0.06), k.at(k.cyl(0.046, 0.046, 0.008, k.metal(0xc9ced6), 14), 0.33, 3.424, -0.06)), { level: 3, focusRadius: 0.4,
        say: 'This little can is a bigger cup for electricity. It helps keep the flow steady too.',
        breaks: 'The flow gets bumpier, so the light flickers more.',
        learn: ['It is a bigger cup than the little capacitor, so it can even out bigger bumps.', 'Inside, thin foil layers are rolled up into a can so there is lots of plate area in a small space.', 'Cans like this have a plus side and a minus side, so they only fit one way round.'] });
      [[-0.37, -0.06], [-0.12, 0.37]].forEach((xz, i) => {
        const bs = k.screw(0xc3c7cf, 0.2); bs.scale.setScalar(0.4); bs.position.set(xz[0], 3.32, xz[1]);
        kid(board, 'board', 'bscrew' + (i + 1), 'Screw', bs, { level: 3, kind: 'screw', focusRadius: 0.4,
          say: 'A screw holds the circuit board in place.', job: 'It keeps the board from wiggling loose.', learn: SCREW_LEARN });
      });

      // ---------- the lid and the solar panel
      part('lid', 'Solar lid', lid, { blockedBy: ['screw1', 'screw2', 'screw3', 'screw4'], reach: [], face: [0, 1, 0],
        say: 'The lid has a solar panel on top. It catches sunshine and turns it into electricity.',
        breaks: 'No lid means no solar panel, so the sun cannot fill the battery.',
        learn: ['The panel faces up so it can see as much sky as possible.', 'Under the lid is the rest of the circuit. The panel makes electricity and sends it down thin wires to the board.', 'Tap Look inside to shrink into the solar cell.'] });
      kid(lid, 'lid', 'cell', 'Solar cell', k.group(k.at(k.box(0.82, 0.03, 0.82, k.mat(0xffffff, { map: cellTex, roughness: 0.25, metalness: 0.3 })), 0, 3.65, 0)), { level: 2, blockedBy: ['cover', 'ribbon'], face: [0, 1, 0],
        say: 'This is the solar cell. It drinks sunshine and makes a little bit of electricity.',
        breaks: 'No solar cell, so the battery never gets filled up.', symptom: 'The battery never fills up in the sunshine.',
        learn: ['Sunlight is made of tiny packets of light. When they hit the cell they knock tiny electrons loose, and loose electrons moving is electricity.', 'The cell is thin layers of silicon, which is made from sand. One side is built to push the loose electrons one way.', 'Tap Look inside to watch it happen.'] });
      const frameMat = plastic(0x3a4048);
      kid(lid, 'lid', 'frame', 'Panel frame', k.group(
        k.at(k.box(0.88, 0.04, 0.045, frameMat), 0, 3.675, 0.4175), k.at(k.box(0.88, 0.04, 0.045, frameMat), 0, 3.675, -0.4175),
        k.at(k.box(0.045, 0.04, 0.79, frameMat), 0.4175, 3.675, 0), k.at(k.box(0.045, 0.04, 0.79, frameMat), -0.4175, 3.675, 0)), { level: 3, face: [0, 1, 0], focusRadius: 0.9,
        say: 'The frame is a border that holds the solar panel in the lid.', job: 'It holds the panel and its clear cover in place.',
        learn: ['It is like a picture frame: it holds the flat panel in place and lets you see its face.', 'It presses down on the edges of the clear cover so wind and rain cannot lift it.', 'The frame also covers the rough edges of the panel.'] });
      kid(lid, 'lid', 'cover', 'Panel cover', k.group(k.at(k.box(0.84, 0.012, 0.84, k.glass(0xcfe6ff, 0.28)), 0, 3.6755, 0)), { level: 3, blockedBy: ['frame'], face: [0, 1, 0], focusRadius: 0.9,
        say: 'A clear cover sits over the solar cells like a window. It keeps rain off but lets the sun in.',
        breaks: 'The light still works, but now rain and dirt can reach the delicate cells.', breaksAlways: true,
        learn: ['It is like the window of a car: you can see through it and the rain stays out.', 'The cover is clear plastic or glass, so sunlight passes through almost completely.', 'Solar cells are thin and delicate, so they need this armor on top.'] });
      const ribMat = k.metal(0xe3e6ea, { roughness: 0.25 });
      kid(lid, 'lid', 'ribbon', 'Bus ribbons', k.group(k.at(k.box(0.03, 0.006, 0.78, ribMat), -0.205, 3.6685, 0), k.at(k.box(0.03, 0.006, 0.78, ribMat), 0.205, 3.6685, 0)), { level: 3, blockedBy: ['cover'], face: [0, 1, 0], focusRadius: 0.9,
        say: 'These shiny strips are tiny roads that gather the electricity from the whole panel.',
        breaks: 'The roads are cut, so the electricity cannot leave the panel.', symptom: 'The battery never fills up in the sunshine.',
        learn: ['Like a street that gathers cars from every house, a ribbon gathers electricity from the whole cell.', 'Thin flat metal strips are soldered onto the cell to collect the electrons that the sunlight knocks loose.', 'They are thin so they block as little sunlight as possible.'] });
      kid(lid, 'lid', 'backing', 'Panel backing', k.group(k.at(k.box(0.88, 0.015, 0.88, plastic(0xd9d9d0)), 0, 3.6275, 0)), { level: 3, blockedBy: ['cell'], face: [0, 1, 0], focusRadius: 0.9,
        say: 'The backing is a firm sheet behind the thin solar cells.', job: 'It props up the thin cells so they do not crack.',
        learn: ['It is like the cardboard behind a poster: it gives something thin a firm back.', 'Solar cells are thin and brittle, so a firm sheet keeps them flat.', 'It also covers the back of the cells.'] });
      kid(lid, 'lid', 'seal', 'Rubber seal', k.group(k.at(k.rot(k.torus(0.55, 0.03, k.mat(0x151515, { roughness: 0.8 }), 36), Math.PI / 2, 0, 0), 0, 3.51, 0)), { level: 2,
        say: 'A rubber ring keeps raindrops from sneaking in under the lid.',
        breaks: 'The light still works, but now rain could sneak in!', breaksAlways: true,
        learn: ['Rubber squishes tight between two hard parts, so water has no gap to get through.', 'Water is the enemy of electronics. It makes metal rust and can connect wires that should not touch.', 'It is the same idea as the rubber ring in a flashlight.'] });
      [[-0.56, 0], [0.56, 0], [0, -0.56], [0, 0.56]].forEach((xz, i) => {
        const sc = k.screw(0xc3c7cf, 0.2); sc.scale.setScalar(0.6); sc.position.set(xz[0], 3.62, xz[1]);
        kid(lid, 'lid', 'screw' + (i + 1), 'Screw', sc, { level: 3, kind: 'screw', focusRadius: 0.5,
          say: 'A screw holds the lid on.', job: 'It holds the lid on tight.', learn: SCREW_LEARN });
      });

      // =================================================================  explode layout
      // Where each part lands when everything is pulled out: six clusters, one per module, so the view is
      // wide and flat instead of a pile. A kid lands next to its parent wherever the parent goes.
      const CLUSTERS = [
        { c: [-3.4, 5.8, 0.2], cols: 4, dx: 1.3, dy: 1.0, ids: ['screw1', 'frame', 'cover', 'screw2', 'seal', 'cell', 'lid', 'ribbon', 'screw3', 'backing', 'screw4'] },
        { c: [3.3, 5.8, 0.2], cols: 5, dx: 1.15, dy: 1.0, ids: ['bscrew1', 'sensor', 'cap', 'fcap', 'bscrew2', 'diode', 'chip', 'board', 'coil', 'winding', 'resistor', 'rsmall', 'led', 'lens'] },
        { c: [-3.3, 3.3, 0.5], cols: 4, dx: 1.25, dy: 1.0, ids: ['wires', 'bwireP', 'bwireN', 'switch', 'slider', 'body', 'floor', 'pins'] },
        { c: [2.9, 3.3, 0.5], cols: 4, dx: 1.2, dy: 1.0, ids: ['battery', 'sleeve', 'posterm', 'ring', 'holder', 'contacts', 'spring'] },
        { c: [-3.3, 1.45, 0.4], cols: 3, dx: 1.3, dy: 1.0, ids: ['topcap', 'stake', 'joint', 'spike', 'lowpole', 'jscrew'] },
        { c: [2.9, 1.4, 0.5], cols: 2, dx: 1.5, dy: 1.0, ids: ['globe', 'collar'] },
      ];
      const F = {};
      CLUSTERS.forEach((cl) => {
        const rows = Math.ceil(cl.ids.length / cl.cols);
        cl.ids.forEach((id, i) => {
          const r = Math.floor(i / cl.cols), col = i % cl.cols, inRow = Math.min(cl.cols, cl.ids.length - r * cl.cols);
          F[id] = [cl.c[0] + (col - (inRow - 1) / 2) * cl.dx, cl.c[1] + ((rows - 1) / 2 - r) * cl.dy, cl.c[2] + (i % 2) * 0.3];
        });
      });
      root.updateMatrixWorld(true);
      const byIdSpec = {}, objSet = new Set(parts.map((p) => p.obj));
      parts.forEach((p) => { byIdSpec[p.id] = p; });
      const ownCenter = (p) => {
        const b = new T.Box3();
        const walk = (o) => { if (o !== p.obj && objSet.has(o)) return; if (o.isMesh) b.expandByObject(o); o.children.forEach(walk); };
        walk(p.obj);
        return b.getCenter(new T.Vector3());
      };
      const shift = {};
      const resolve = (p) => {
        if (shift[p.id]) return shift[p.id];
        const par = p.parent ? byIdSpec[p.parent] : null, pd = par ? resolve(par) : new T.Vector3();
        const lift = p.kind === 'screw' ? new T.Vector3(0, 1, 0).applyQuaternion(p.obj.quaternion).multiplyScalar(0.35) : new T.Vector3();
        const f = F[p.id], v = new T.Vector3(f[0], f[1], f[2]).sub(ownCenter(p)).sub(pd).sub(lift);
        p.pull = [v.x, v.y, v.z];
        return (shift[p.id] = pd.clone().add(v).add(lift));
      };
      parts.forEach(resolve);

      return { root, parts, shell: [], refs: { ledMeshes: [lensDome, lensBase], segs, stateLabs, sun, moon, stars, beam, rays, lamp, halo, sunHalo, charge: 0.35, b: 0, haloS: 2.4, ft: 0 } };
    },

    // Flags do not depend on the dial, so every pull that matters changes them.
    evaluate(has) {
      const hasBat = has('battery') && has('posterm'), board = has('board');
      const batWires = has('bwireP') && has('bwireN'), contacts = has('contacts') && has('spring');
      const canCharge = has('lid') && has('cell') && has('ribbon') && has('wires') && board && hasBat && contacts && batWires;
      const lightOk = hasBat && board && batWires && contacts && has('led') && has('lens') && has('switch') && has('slider') && has('pins') && has('coil') && has('winding') && has('chip');
      return {
        alive: canCharge || lightOk, canCharge, lightOk, bat: hasBat, lid: has('lid'),
        hasSensor: has('sensor') && board, leak: !has('diode'), globe: has('globe'), res: has('resistor'), seal: has('seal'), cover: has('cover'),
        flick: (has('cap') ? 0 : 1) + (has('fcap') ? 0 : 1),
      };
    },

    apply(out, inst) { look(inst, out, 0); },
    tick(dt, t, inst, out) { look(inst, out, dt); },
  });

  function look(inst, out, dt) {
    const r = inst.refs, o = out || {};
    const night = inst.dial == null ? TAL.app.inst !== inst : inst.dial === 1; // home-card thumbnails show night
    const charging = !night && !!o.canCharge;
    let lit = !!o.lightOk && (night || !o.hasSensor);
    if (r.charge <= 0.001) lit = false;
    if (dt > 0 && o.bat) {
      if (charging) r.charge += dt / CHARGE_SEC;
      if (lit) r.charge -= dt / DRAIN_SEC;
      if (night && o.leak) r.charge -= dt / 50;
      r.charge = Math.max(0, Math.min(1, r.charge));
    }
    r.ft += dt;
    const fl = o.flick || 0;
    let want = lit ? 1 : 0;
    if (lit && fl) want *= 1 - 0.3 * fl * (0.5 + 0.5 * Math.sin(r.ft * 31) * Math.sin(r.ft * 17.3));
    r.b = dt > 0 ? r.b + (want - r.b) * Math.min(1, dt * (fl ? 20 : 6)) : want;
    r.ledMeshes.forEach((m) => { m.material.emissiveIntensity = 4 * r.b; });
    const hs = o.globe === false ? 1.0 : 2.4;
    r.haloS += (hs - r.haloS) * (dt > 0 ? Math.min(1, dt * 5) : 1);
    r.halo.visible = r.b > 0.02; r.halo.material.opacity = 0.9 * r.b; r.halo.scale.setScalar(r.haloS);
    r.lamp.intensity = 2.4 * r.b;
    // sun by day, moon and stars at night; the beam only reaches a lid that is still on
    const lidOn = o.lid !== false;
    r.sun.visible = !night; r.moon.visible = night; r.beam.visible = !night && lidOn; r.rays.visible = !night && lidOn;
    r.stars.forEach((s) => { s.visible = night; });
    if (!night && dt > 0) r.rays.userData.flow.update(dt, 0.35);
    // meter
    r.segs.forEach((sg, i) => {
      const on = o.bat && r.charge > (i + 0.5) / 8;
      sg.material.color.setHex(on ? (i < 2 ? 0xffb02e : 0x34d27b) : 0x2a3040);
    });
    const L = r.stateLabs;
    let which = null;
    if (o.bat) {
      if (night && lit) which = 'lightOn'; else if (night && o.lightOk && r.charge <= 0.001) which = 'empty';
      else if (charging) which = r.charge >= 0.999 ? 'full' : 'charging';
    }
    Object.keys(L).forEach((kk) => { L[kk].visible = kk === which; });
  }

  Object.assign(TAL.insideByName, {
    'Solar lid': 'solar-cell-inside', 'Solar cell': 'solar-cell-inside', 'Rechargeable battery': 'battery-inside', 'Circuit board': 'pcb-inside',
    'LED': 'led-package', 'LED lens': 'led-package', 'Panel wires': 'wire-inside', 'Battery wire': 'wire-inside', 'Bus ribbons': 'wire-inside', 'Copper winding': 'wire-inside',
    'Screw': 'screw-inside', 'Switch': 'switch-inside', 'Diode': 'diode-inside',
    'Booster coil': 'transformer-inside', 'Control chip': 'chip-package', 'Resistor': 'resistor-inside', 'Small resistor': 'resistor-inside',
    'Capacitor': 'cap-inside', 'Filter capacitor': 'cap-inside',
  });
})();
