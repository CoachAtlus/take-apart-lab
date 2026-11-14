/* TV remote: a rubber button mat, a circuit board and a light you cannot see. Beginner 7 pieces, Medium 14, Advanced 25.
 * Power = pressing the Power button: the chip flashes an infrared LED, and a toy phone camera shows the flash as purple.
 * Also registers one inside world: 'infrared-light' (waves too long to see, and the camera trick). */
(function () {
  const T = window.THREE;
  const { world, view, part } = TAL.wk;
  const PURPLE = 0xc77dff;
  const TIMES = '×';

  // =====================================================================  world: infrared light
  world({
    id: 'infrared-light', name: 'Invisible light', zoom: '1,000,000' + TIMES, short: 'infrared light',
    view: view(1.6, 4.6, 6.4, -0.35, 0.3),
    dial: {
      label: 'Look with',
      steps: [
        { name: 'Your eyes', level: 0, say: 'With your eyes you can see the blue light and the red light. The infrared light is there too, but your eyes cannot see it. You see nothing!' },
        { name: 'Phone camera', level: 1, say: 'A phone camera can catch some of the infrared light. It shows it as a purple glow, even though your eyes see nothing. That is the trick for checking a remote!' },
      ],
    },
    intro: 'Here are three kinds of light, a million times bigger. Blue has the shortest waves. Red has longer waves. Infrared has the longest waves of all, too long for your eyes. Tap the Look with button to switch from your eyes to a phone camera.',
    shellSay: 'Three kinds of light, wiggling like jump ropes.',
    learn: [
      'Light is a wave, like a jump rope you shake. Short waves look blue. Longer waves look red. Waves even longer than red are called infrared, and our eyes cannot see them.',
      'Your eyes only have sensors for a small range of waves, from violet to red. Infrared is just past the red end. A warm campfire gives off lots of infrared too, which is why you can feel it on your face but not see it.',
      'A remote control sends infrared flashes, on and off, in a pattern. The pattern is a code, like a flashlight sending a secret message. The TV has a little sensor that sees the flashes and reads the code.',
      'A phone camera sensor is made of silicon, and silicon reacts to a little light beyond red. Most phones block much of it with a filter, but some leaks through, so the flash often shows up purple or white. Some phone cameras show it better than others.',
    ],
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(part(k, root, s));
      const X0 = -4.0, X1 = 1.1, N = 64;
      const ROWS = [
        { id: 'blue', y: 2.8, wl: 0.9, color: 0x2f6dff },
        { id: 'red', y: 1.8, wl: 1.3, color: 0xff2a1a },
        { id: 'ir', y: 0.8, wl: 1.9, color: 0x9a4dff },
      ];
      const lane = (R, spec) => {
        const m = k.mat(R.color, { transparent: true, opacity: 0.12, roughness: 0.3, depthWrite: false });
        const c = k.at(k.rot(k.cyl(0.36, 0.36, X1 - X0 + 0.4, m, 20), 0, 0, Math.PI / 2), (X0 + X1) / 2, R.y, 0);
        add(Object.assign({ id: R.id, obj: k.group(c), tag: false }, spec));
      };
      lane(ROWS[0], { name: 'Blue light', pull: [0, 0, 2.6],
        say: 'Blue light has the shortest waves of the three. They wiggle fast, close together.',
        learn: ['Pull it out and the other lights keep going. Each color travels on its own.', 'Violet and blue have the shortest waves we can see, about 400 to 450 nanometers. A nanometer is a millionth of a millimeter.', 'Short waves carry a bit more energy than long ones. That is partly why a blue-white LED is a good start for making white light.'] });
      lane(ROWS[1], { name: 'Red light', pull: [0, 1.6, 2.4],
        say: 'Red light has longer waves than blue. They are more stretched out.',
        learn: ['Pull it out and the other lights keep going. Each color travels on its own.', 'The red end of the rainbow is where visible waves are longest, around 650 to 700 nanometers.', 'Past that end, the waves are too long for our eyes. That invisible zone starts with infrared.'] });
      lane(ROWS[2], { name: 'Infrared light', pull: [0, 2.2, 2.2],
        say: 'Infrared light has the longest waves. They are too stretched out for your eyes to see.',
        learn: ['Pull it out and a phone camera sees nothing at all. The light really is there when it is in place.', 'The infrared LED in a remote usually sends waves around 940 nanometers long. That is about one and a half times as long as red light.', 'Because we cannot see it, a TV remote does not make a room look like a disco. But a camera sensor can respond to it.'] });

      // viewer: your eye, or a phone
      const white = k.mat(0xf3f3f1, { roughness: 0.3 }), dark = k.mat(0x101114, { roughness: 0.4 });
      const iris = k.at(k.sphere(0.24, k.mat(0x3f7fbf, { roughness: 0.3 }), 20), 1.2, 1.8, 0); iris.scale.set(0.35, 1, 1);
      const pupil = k.at(k.sphere(0.11, dark, 14), 1.12, 1.8, 0); pupil.scale.set(0.4, 1, 1);
      add({ id: 'eye', name: 'Your eye', fixed: true, obj: k.group(k.at(k.sphere(0.5, white, 28), 1.7, 1.8, 0), iris, pupil), tagAt: [1.7, 2.65, 0],
        say: 'This is your eye. It sees blue and red light. But infrared? Nothing!',
        learn: ['At the back of your eye are tiny sensors. Some like blue, some like green, some like red. None of them reacts to infrared.', 'The sensors are made of special molecules that change shape when light of the right wave length hits them. Infrared waves do not have the right size to do that.'] });
      const camBody = k.at(k.rbox(0.14, 1.5, 0.85, k.mat(0x1c1e24, { roughness: 0.35 }), 0.05), 1.7, 1.8, 0);
      const lens = k.at(k.rot(k.cyl(0.1, 0.1, 0.05, k.glass(0x2a3a55, 0.9), 20), 0, 0, Math.PI / 2), 1.62, 2.3, 0.2);
      add({ id: 'cam', name: 'Phone camera', fixed: true, obj: k.group(camBody, lens), tagAt: [1.7, 2.85, 0],
        say: 'This is a phone camera. Its sensor can catch a little of the infrared light and show it as a glow.',
        learn: ['A camera sensor is made of tiny light catchers. They react to a bit more kinds of light than our eyes do.', 'Many phones put a filter in front of the sensor to block most infrared, so pictures look normal. A little still sneaks through, enough to see a remote flash.'] });

      // the light ropes, drawn as beads
      const rows = ROWS.map((R) => {
        const mat = new T.MeshBasicMaterial({ color: R.color, toneMapped: false, transparent: true });
        const beads = [];
        for (let i = 0; i < N; i++) { const b = new T.Mesh(new T.SphereGeometry(0.07, 10, 8), mat); b.userData.noPick = true; beads.push(b); root.add(b); }
        return Object.assign({ beads, mat }, R);
      });
      const lab = (txt, x, y, z, bg) => { const l = k.label(txt, { size: 0.16, bg }); l.position.set(x, y, z); root.add(l); return l; };
      lab('Blue light: short waves', -1.9, 3.4, 0.2, 'rgba(30,110,190,0.92)');
      lab('Red light: longer waves', -1.9, 2.4, 0.2, 'rgba(170,40,30,0.92)');
      lab('Infrared: the longest waves', -1.9, 1.4, 0.2, 'rgba(110,60,170,0.92)');
      // what you would see, three little squares
      const sq = (y) => {
        const frame = new T.Sprite(new T.SpriteMaterial({ color: 0x555a66, toneMapped: false })); frame.scale.set(0.84, 0.84, 1); frame.position.set(3.5, y, -0.02);
        const s = new T.Sprite(new T.SpriteMaterial({ color: 0xffffff, toneMapped: false })); s.scale.set(0.7, 0.7, 1); s.position.set(3.5, y, 0);
        frame.userData.noPick = s.userData.noPick = true; root.add(frame, s); return s;
      };
      const sprites = ROWS.map((R) => sq(R.y));
      lab('What you see', 3.5, 3.5, 0, 'rgba(60,60,70,0.92)');
      const nothing = lab('Nothing!', 3.5, 1.3, 0.1, 'rgba(70,70,80,0.92)');
      const glow = lab('Purple glow!', 3.5, 1.3, 0.1, 'rgba(110,60,170,0.92)');
      const hint = lab('The waves are there, but your eyes can not see them', -1.9, 0.15, 0.2, 'rgba(70,70,80,0.92)');
      return { root, parts, refs: { rows, sprites, nothing, glow, hint, X0, X1, N } };
    },
    evaluate(has, on) { return { alive: on, blue: has('blue'), red: has('red'), ir: has('ir') }; },
    tick(dt, t, inst, out) {
      const r = inst.refs, cam = inst.def.dial.steps[inst.dial || 0].level === 1, on = !!(out && out.alive);
      r.rows.forEach((R) => {
        const vis = on && out[R.id];
        R.beads.forEach((b, i) => {
          const x = r.X0 + ((r.X1 - r.X0) * i) / (r.N - 1);
          b.position.set(x, R.y, 0.3 * Math.sin(((x - 1.6 * t) * Math.PI * 2) / R.wl));
          b.visible = vis;
        });
      });
      const ir = r.rows[2];
      ir.mat.opacity = cam ? 1 : 0.22;
      const pulse = 0.55 + 0.45 * Math.abs(Math.sin(t * 7));
      r.sprites[0].material.color.setHex(0x2f6dff).multiplyScalar(on && out.blue ? 1 : 0.06);
      r.sprites[1].material.color.setHex(0xff2a1a).multiplyScalar(on && out.red ? 1 : 0.06);
      r.sprites[2].material.color.setHex(cam && on && out.ir ? 0x9a4dff : 0x0e0e12).multiplyScalar(cam && on && out.ir ? pulse + 0.35 : 1);
      r.nothing.visible = !cam && on; r.glow.visible = cam && on && out.ir; r.hint.visible = !cam && on && out.ir;
      const eye = inst.byId.eye, phone = inst.byId.cam;
      if (eye) eye.obj.visible = !cam;
      if (phone) phone.obj.visible = cam;
    },
  });

  // =====================================================================  which parts open into which worlds
  Object.assign(TAL.insideByName, {
    'Battery': 'battery-inside', 'Screw': 'screw-inside', 'Circuit board': 'pcb-inside', 'Chip': 'chip-package',
    'Infrared LED': 'led-package', 'Infrared window': 'infrared-light', 'Carbon pads': 'switch-inside', 'Copper fingers': 'wire-inside',
  });
  TAL.introMore = TAL.introMore || {};
  TAL.introMore.remote = [
    'A remote has no wire to the TV. When you press a button, the remote flashes a little light in a secret pattern, and the TV reads the pattern.',
    'The light is infrared, a kind of light with waves too long for your eyes to see. A phone camera can often catch it, so you can check that a remote still works.',
    'Inside there is a rubber button mat, a circuit board with a tiny chip, and an infrared LED. Pressing a button connects two copper roads on the board. The chip notices which button it was, looks up its code, and flashes the LED in that pattern.',
  ];

  // =====================================================================  the remote
  const rr = (p, w, h, r, cx, cy) => {
    cx = cx || 0; cy = cy || 0;
    const x = cx - w / 2, y = cy - h / 2;
    p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    p.lineTo(x + w, y + h - r); p.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    p.lineTo(x + r, y + h); p.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    p.lineTo(x, y + r); p.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return p;
  };
  const helixPts = (cx, cz, y0, h, r, turns) => Array.from({ length: 34 }, (_, i) => { const f = i / 33, a = f * turns * Math.PI * 2; return [cx + Math.cos(a) * r, y0 + h * f, cz + Math.sin(a) * r]; });

  // button layout (x, y, radius, color); the first one is Power
  const BTN = [{ x: -0.4, y: 1.62, r: 0.13, c: 0xd8342c, pwr: true }, { x: 0.4, y: 1.62, r: 0.11, c: 0x6b7280 }];
  [1.15, 0.78, 0.41, 0.04, -0.33, -0.7, -1.07].forEach((y, ri) => [-0.38, 0, 0.38].forEach((x, ci) => {
    const mid = ri === 3 && ci === 1;
    BTN.push({ x, y, r: mid ? 0.12 : 0.095, c: mid ? 0x3d4a63 : 0x4a4f5a });
  }));

  TAL.registerDevice({
    id: 'remote',
    name: 'TV Remote',
    short: 'remote',
    subtitle: 'It talks with light you cannot see',
    powerSound: 'click',
    channels: false,
    view: { target: [0.9, 3.0, 0], radius: 3.7, explodedRadius: 6.4, explodedY: 3.0, yaw: -0.35, pitch: 0.12, shadow: [4, 2.4] },
    intro: 'This is a TV remote. Press the green power button, like pressing Power on the remote. It sends a secret message with light your eyes cannot see. The phone can see it!',
    shellSay: "That's the front of the remote. The rubber buttons poke up through it. Try the X-ray button to see inside!",
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button. It is like pressing Power on the remote. Watch the phone. It can see invisible light!", nudge: 'Press the power button.' },
      { do: 'turn', side: 'back', say: 'The batteries live on the back. Tap the turn around button to see it.', nudge: 'Tap the turn around button.' },
      { do: 'remove', ids: ['door'], say: 'Slide off the battery door. Does the light still flash?', nudge: 'Drag the battery door off.' },
      { do: 'remove', ids: ['sc1', 'sc2', 'sc3', 'sc4'], levels: [2, 3], say: 'Twist out the screws that hold the back case on.', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['back'], say: 'Now lift off the back case. Now you can see the circuit board!', nudge: 'Pull the back case off.' },
      { do: 'remove', ids: ['led'], levels: [2, 3], say: 'Find the little infrared light at the top of the board and pull it off. Watch the phone!', nudge: 'Pull off the little light at the top.' },
      { do: 'remove', ids: ['bat1'], say: 'Now slide out a battery! What happens?', nudge: 'Pull out a battery.' },
      { do: 'remove', ids: ['board'], say: 'Lift out the green circuit board. It is the remote\'s brain home!', nudge: 'Pull out the green board.' },
      { do: 'remove', ids: ['mat'], say: 'Last, pull out the rubber button mat. Without it, there is nothing to press!', nudge: 'Pull out the rubber mat.' },
      { do: 'end', say: 'A remote needs batteries, a button mat, a board with a chip, and a light. Put them all back and press power again!' },
    ],

    build(k) {
      const root = k.group();
      const RY = 2.3, W = 1.3, H = 4.2;
      const body = k.at(k.group(), 0, RY, 0);
      root.add(body);
      const parts = [];
      const add = (s) => { parts.push(s); return s; };
      const sub = (parentObj, parentId, spec) => { parentObj.add(spec.obj); spec.parent = parentId; return add(spec); };
      const extrude = (shape, depth, mat, z0) => {
        const m = k.mesh(new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 }), mat);
        m.position.z = z0; return m;
      };
      const caseMat = k.mat(0x1c1e23, { roughness: 0.8, envMapIntensity: 0.3 }), backMat = k.mat(0x24272d, { roughness: 0.8, envMapIntensity: 0.3 });
      const metal = (c) => k.metal(c, { roughness: 0.3 });
      const gold = k.metal(0xd8b45a, { roughness: 0.28 });

      // ---- shell: the front of the case, with a hole for each button
      const frontShape = rr(new T.Shape(), W, H, 0.3);
      BTN.forEach((b) => { const h = new T.Path(); h.absarc(b.x, b.y, b.r + 0.02, 0, Math.PI * 2, true); frontShape.holes.push(h); });
      const ringS = rr(new T.Shape(), W, H, 0.3); ringS.holes.push(rr(new T.Path(), W - 0.1, H - 0.1, 0.25));
      const shell = k.group(extrude(frontShape, 0.16, caseMat, 0.1), extrude(ringS, 0.12, caseMat, -0.02));
      body.add(shell);

      // ---- scenery: a little stand, and a phone that can see the invisible light
      const stand = k.at(k.rbox(1.9, 0.2, 1.1, k.mat(0x3a3d44, { roughness: 0.8 }), 0.06), 0, 0.1, 0);
      stand.userData.noPick = true; root.add(stand);
      const phone = k.group();
      phone.add(k.rbox(1.0, 1.9, 0.1, k.mat(0x1b1d22, { roughness: 0.35 }), 0.06));
      const tex = k.canvasTex(128, 256, (c, w, h) => {
        c.fillStyle = '#0f1115'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#3a3e47'; c.beginPath(); c.moveTo(40, 240); c.lineTo(40, 76); c.quadraticCurveTo(40, 64, 52, 64); c.lineTo(76, 64); c.quadraticCurveTo(88, 64, 88, 76); c.lineTo(88, 240); c.closePath(); c.fill();
        c.fillStyle = '#5a5f6b'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(64, 98 + i * 22, 7, 0, 7); c.fill(); }
      });
      const screen = k.at(new T.Mesh(new T.PlaneGeometry(0.88, 1.78), new T.MeshBasicMaterial({ map: tex, toneMapped: false })), 0, 0, 0.056);
      phone.add(screen);
      const flash = TAL.wk.halo(k, 0, 0.4, 0.07, PURPLE, 0.7);
      phone.add(flash);
      phone.position.set(2.35, 3.95, 0.35); phone.rotation.y = -0.75;
      phone.traverse((o) => { o.userData.noPick = true; });
      root.add(phone);
      const lab = (txt, x, y, z, bg) => { const l = k.label(txt, { size: 0.19, bg }); l.position.set(x, y, z); l.visible = false; root.add(l); return l; };
      const labCam = lab('Phone camera', 2.35, 5.2, 0.35, 'rgba(60,60,70,0.92)'); labCam.visible = true;
      const labFlash = lab('Purple flash!', 2.35, 2.75, 0.35, 'rgba(110,60,170,0.92)');
      const labNone = lab('The phone sees nothing', 2.35, 2.75, 0.35, 'rgba(70,70,80,0.92)');
      const labTV = lab('Invisible light to the TV', 0, 6.0, 0, 'rgba(110,60,170,0.92)');
      const beamTo = k.flow([[0, 4.4, 0], [0.9, 4.35, 0.2], [1.75, 4.1, 0.35]], { count: 9, color: PURPLE, size: 0.13 }); beamTo.visible = false;
      const beamUp = k.flow([[0, 4.45, 0], [0, 5.0, 0], [0, 5.6, 0]], { count: 7, color: PURPLE, size: 0.15 }); beamUp.visible = false;
      root.add(beamTo, beamUp);
      const led = TAL.wk.halo(k, 0, 2.08, -0.02, PURPLE, 0.7);
      body.add(led);

      // ---- back case (+ screws) and battery door
      const plateS = rr(new T.Shape(), W, H, 0.3); plateS.holes.push(rr(new T.Path(), 0.8, 1.0, 0.04, 0, -1.52));
      const ringB = rr(new T.Shape(), W, H, 0.3); ringB.holes.push(rr(new T.Path(), W - 0.1, H - 0.1, 0.25));
      const back = k.group(extrude(plateS, 0.05, backMat, -0.3), extrude(ringB, 0.28, backMat, -0.3));
      body.add(back);
      add({ id: 'back', name: 'Back case', obj: back, xray: true, pull: [0, 0, -2.4], blockedBy: ['door', 'sc1', 'sc2', 'sc3', 'sc4'], face: [0, 0, -1], focusRadius: 2.2,
        say: 'The back case is the lid of the remote. It keeps all the parts inside and fingers out.',
        job: 'It holds everything in and keeps fingers away from the board.',
        learn: ['Think of a lunch box. The back case is the lid that keeps everything snug inside.',
          'It is molded plastic. Plastic does not carry electricity, so it keeps the board safe from your hands, and your hands safe from the board.',
          'Remotes use two halves of plastic that fit together like a shell. Screws, or snap tabs, hold the halves closed.'] });
      [[-0.5, 1.85], [0.5, 1.85], [-0.5, -0.9], [0.5, -0.9]].forEach(([x, y], i) => {
        const s = k.screw(0x9ea3ab, 0.3);
        k.rot(k.at(s, x, y, -0.3), -Math.PI / 2, 0, 0);
        body.add(s);
        add({ id: 'sc' + (i + 1), name: 'Screw', kind: 'screw', obj: s, pull: [0, 0, -0.9], level: i < 2 ? 2 : 3, fuse: 'back', face: [0, 0, -1], focusRadius: 0.5,
          say: 'A screw! Lefty loosey, righty tighty.', job: 'It squeezes the case halves together so they do not come apart.',
          learn: ['A screw is like a little ramp wrapped around a stick. Twisting it pulls the two halves tight.',
            'The ramp is called a thread. Turning one way pulls the screw in, and turning the other way lets it out.',
            'Case screws are often small and self-tapping, which means they cut their own threads into the plastic as you screw them in.'] });
      });
      const door = k.group(k.at(k.box(0.78, 0.98, 0.04, k.mat(0x3d424a, { roughness: 0.5 }), 12), 0, -1.52, -0.28));
      [-1.8, -1.74, -1.68].forEach((y) => door.add(k.at(k.box(0.5, 0.02, 0.02, k.mat(0x555b66, { roughness: 0.5 })), 0, y, -0.31)));
      body.add(door);
      add({ id: 'door', name: 'Battery door', obj: door, xray: true, pull: [0, -0.5, -2.0], face: [0, 0, -1], focusRadius: 1.4,
        say: 'The battery door slides off so you can change the batteries.', job: 'It keeps the batteries in and little fingers out.',
        learn: ['It is like the lid of a toy box, just for batteries.',
          'The little ridges give your thumb something to push. A tiny catch clicks into place to hold the door shut.',
          'Keeping batteries covered is a safety job, too. Small batteries should stay away from little children, who might put them in their mouths.'] });

      // ---- batteries (+ springs, contacts, labels)
      const aaa = (cx, plusUp) => {
        const yc = -1.525, nubY = plusUp ? yc + 0.48 : yc - 0.48;
        const g = k.group(k.at(k.cyl(0.11, 0.11, 0.93, k.metal(0xb8bdc4, { roughness: 0.4 }), 24), cx, yc, -0.14), k.at(k.cyl(0.04, 0.04, 0.03, k.metal(0xc9ced6), 12), cx, nubY, -0.14));
        const wrap = k.group(k.at(k.cyl(0.114, 0.114, 0.8, k.mat(0x1f6f78, { roughness: 0.35 }), 24, true), cx, yc - (plusUp ? 0.04 : -0.04), -0.14));
        body.add(g);
        return { g, wrap };
      };
      const b1 = aaa(-0.125, true), b2 = aaa(0.125, false);
      const bsay = ['These two small batteries give the remote its electricity.', 'The second battery works with the first. Together they push the electricity harder.'];
      const blearn = ['A battery is a lunch box of electricity. Press a button and the remote takes a tiny bite.',
        'Each battery gives a push of about one and a half volts. Two in a line add up to about three volts, enough to flash the little light.',
        'Inside, chemicals react when the loop is complete, and that pushes electrons around it. The loop needs both batteries: take out one, and the loop is open.'];
      [b1, b2].forEach((b, i) => {
        add({ id: 'bat' + (i + 1), name: 'Battery', obj: b.g, pull: [i ? 0.9 : -0.9, -0.6, -2.0], blockedBy: ['door'], face: [0, 0, -1], focusRadius: 0.9,
          say: bsay[i], breaks: 'With a battery gone, there is no electricity. The remote cannot send anything!', learn: blearn, symptom: i ? undefined : 'I press Power, but the phone sees no purple flash.' });
        sub(b.g, 'bat' + (i + 1), { id: 'lbl' + (i + 1), name: 'Battery label', obj: b.wrap, pull: [0, 0.5, -0.4], level: 3, face: [0, 0, -1], focusRadius: 0.7,
          say: 'The label is a wrapper. Under it is a metal can with the battery stuff inside.', breaksAlways: true, breaks: 'The battery still works without its label!',
          learn: ['It is like the paper on a candy bar. It tells you what is inside, but the candy still works without it.', 'The label shows which end is plus and which is minus, and it keeps the metal can from touching things it should not.', 'It also covers the can, which is one side of the battery, so a loose wire cannot make a short circuit by accident.'] });
      });
      const sp = (cx, y0, id, bid) => {
        const s = k.group(k.tube(helixPts(cx, -0.14, y0, 0.09, 0.05, 4), 0.011, k.metal(0xd7dce2, { roughness: 0.2 })));
        body.add(s);
        add({ id, name: 'Spring', obj: s, pull: [cx < 0 ? -0.7 : 0.7, -0.4, -1.4], blockedBy: [bid], level: 2, fuse: 'back', face: [0, 0, -1], focusRadius: 0.5,
          say: 'The spring pushes the battery so it always touches the metal.', breaks: 'The battery is not pushed against the metal, so no electricity flows!',
          symptom: id === 'sp1' ? 'I press Power, but the phone sees no purple flash.' : undefined,
          learn: ['A spring is like a bouncy toy that always wants to stretch back out. It pushes the battery snug.',
            'Batteries are a little different in length, and they can change size a tiny bit as they age. The spring keeps pressing so the touch never gets loose.',
            'The spring is also springy enough that you can pop the batteries in and out with your thumb.'] });
      };
      sp(-0.125, -2.085, 'sp1', 'bat1'); sp(0.125, -1.06, 'sp2', 'bat2');
      const ct = (cx, y, id, bid) => {
        const c = k.group(k.at(k.box(0.17, 0.03, 0.14, metal(0xcfd5dc)), cx, y, -0.14));
        body.add(c);
        add({ id, name: 'Battery contact', obj: c, pull: [cx < 0 ? -0.8 : 0.8, 0.2, -1.4], blockedBy: [bid], level: 3, fuse: 'board', face: [0, 0, -1], focusRadius: 0.5,
          say: 'This shiny metal plate touches the end of the battery so electricity can flow.', breaks: 'The battery touches nothing, so no electricity flows!',
          learn: ['It is a little metal bridge between the battery and the rest of the remote.',
            'Metal lets electricity travel easily, so it is the right stuff for a bridge. Plastic would block the flow.',
            'The plate is usually steel with a thin coat of nickel or similar metal, so it stays shiny and does not rust.'] });
      };
      ct(-0.125, -1.0, 'ct1', 'bat1'); ct(0.125, -2.05, 'ct2', 'bat2');

      // ---- circuit board (+ chip, infrared LED, parts, copper fingers)
      const pcb = k.mesh(new T.BoxGeometry(W - 0.24, H - 0.2, 0.04), k.mat(0xffffff, { map: k.pcbTexture(W - 0.24, H - 0.2, 5), roughness: 0.7 }));
      const board = k.group(pcb);
      body.add(board);
      add({ id: 'board', name: 'Circuit board', obj: board, pull: [0, 0.4, -2.2], blockedBy: ['back', 'bat1', 'bat2'], reach: ['back'], face: [0, 0, -1], focusRadius: 2.2,
        say: "The circuit board is the remote's brain home. Little copper roads join the parts together.",
        breaks: 'The board connects everything. With it gone, the remote cannot do anything!',
        symptom: 'The buttons feel normal, but the phone sees no purple flash.',
        learn: ['It is like a tiny city. The copper roads are streets, and the parts are houses.',
          'The board is fiberglass with thin copper lines on it. Parts are stuck to the lines with melted metal called solder.',
          'Under every button, two copper roads end in little fingers that do not touch. Pressing the button bridges them, and the chip notices.'] });
      // the chip
      const chip = k.group(k.at(k.box(0.34, 0.34, 0.06, k.mat(0x16161a, { roughness: 0.5 })), 0, 0.5, -0.05), k.at(k.cyl(0.02, 0.02, 0.01, k.mat(0x8a8f99), 10), -0.1, 0.62, -0.085));
      for (let i = 0; i < 8; i++) [-1, 1].forEach((s) => chip.add(k.at(k.box(0.07, 0.025, 0.02, metal(0xc9ced6)), s * 0.205, 0.38 + i * 0.034, -0.045)));
      sub(board, 'board', { id: 'chip', name: 'Chip', obj: chip, pull: [0.5, 0.2, -1.0], level: 2, face: [0, 0, -1], focusRadius: 0.5,
        say: "This little black chip is the remote's tiny brain. It notices which button you press.",
        breaks: 'Without its brain, the remote cannot tell which button you pressed. Nothing gets sent!',
        symptom: 'I press Power and the button clicks, but the phone sees no purple flash.',
        learn: ['It is like a tiny brain that only knows one trick: a secret code for each button.',
          'It checks the buttons again and again, very fast. When it finds a pressed one, it looks up the code and tells the light to flash it.',
          'Inside is a small processor with a little memory that holds the codes. Most of the time it sleeps to save the batteries, and a button press wakes it up.'] });
      // the infrared LED
      const ledMat = k.glow(0x7a4fb8, 0xc77dff); ledMat.transparent = true; ledMat.opacity = 0.92;
      const ledBody = k.at(k.cyl(0.075, 0.075, 0.12, ledMat, 18), 0, 1.9, -0.02), ledDome = k.at(k.sphere(0.075, ledMat, 18), 0, 1.96, -0.02);
      const ledG = k.group(ledBody, ledDome, k.at(k.box(0.02, 0.1, 0.02, gold), -0.03, 1.8, -0.02), k.at(k.box(0.02, 0.1, 0.02, gold), 0.03, 1.8, -0.02));
      sub(board, 'board', { id: 'led', name: 'Infrared LED', obj: ledG, pull: [0, 0.9, -0.9], level: 2, face: [0, 1, 0], focusRadius: 0.5,
        say: 'This little light flashes infrared light. Your eyes cannot see it, but the TV can!',
        breaks: 'No little light, no message. The buttons click, but nothing is sent to the TV!',
        symptom: 'The buttons click, but the phone sees no purple flash.',
        learn: ['It is like a flashlight your eyes cannot see. It blinks on and off in a secret pattern.',
          'Infrared light has waves longer than red light. A phone camera can often catch a little of it, usually as purple.',
          'The LED is made of a crystal that gives off infrared when electricity flows through it. The flashes are also switched on and off very fast, often about 38 thousand times a second, so the TV can tell them from sunlight and lamps.'] });
      // little parts on the back of the board
      const crystal = k.group(k.at(k.rot(k.cyl(0.05, 0.05, 0.2, metal(0xc9ced6), 14), 0, 0, Math.PI / 2), 0.3, 1.0, -0.06));
      sub(board, 'board', { id: 'crystal', name: 'Crystal', obj: crystal, pull: [0.6, 0.3, -1.0], level: 3, face: [0, 0, -1], focusRadius: 0.4,
        say: 'This tiny silver can keeps perfect time, like a metronome for the chip.',
        breaks: 'The chip loses its beat, so it cannot time the flashes. Nothing gets sent!',
        learn: ['A metronome ticks the same speed every time so a musician can keep the beat. This does that for the chip.',
          'Inside is a sliver of quartz that wiggles at one exact speed when electricity touches it. The chip counts the wiggles to time each flash.',
          'Some remotes use a ceramic part called a resonator instead. It costs less, and is a little less exact, but it is good enough for this job.'] });
      const tr = k.group(k.at(k.box(0.14, 0.1, 0.07, k.mat(0x16161a, { roughness: 0.5 })), -0.3, 1.4, -0.055));
      [-0.04, 0, 0.04].forEach((dx) => tr.add(k.at(k.box(0.015, 0.06, 0.015, gold), -0.3 + dx, 1.32, -0.03)));
      sub(board, 'board', { id: 'transistor', name: 'Transistor', obj: tr, pull: [-0.6, 0.3, -1.0], level: 3, face: [0, 0, -1], focusRadius: 0.4,
        say: 'The transistor is a switch with no moving parts. The chip uses it to flick the light on and off.',
        breaks: 'The light never gets switched, so there are no flashes!',
        learn: ['It is like a helper hand on a light switch. The chip is gentle, so the helper does the heavy flicking.',
          'The chip can only send a tiny bit of electricity. The transistor takes that tiny signal and uses it to switch a bigger flow through the light.',
          'A transistor has three legs. A small signal on one leg lets a bigger current flow between the other two.'] });
      const res = k.group(k.at(k.rot(k.cyl(0.035, 0.035, 0.22, k.mat(0xd9b38c, { roughness: 0.6 }), 12), 0, 0, Math.PI / 2), 0.28, 1.45, -0.05));
      [[-0.06, 0xc0392b], [0, 0x2a2a2a], [0.06, 0xd98a1e]].forEach(([dx, c]) => res.add(k.at(k.rot(k.cyl(0.037, 0.037, 0.025, k.mat(c), 12), 0, 0, Math.PI / 2), 0.28 + dx, 1.45, -0.05)));
      sub(board, 'board', { id: 'resistor', name: 'Resistor', obj: res, pull: [0.6, 0.5, -1.0], level: 3, face: [0, 0, -1], focusRadius: 0.4,
        say: 'The resistor is like a speed bump for electricity.', job: 'It slows the electricity so the little light does not get too much and burn out.',
        learn: ['Cars slow down at a speed bump. Electricity slows down at a resistor.',
          'The colored stripes are a code that tells you how strongly it pushes back.',
          'The LED could be damaged by too much electricity. A resistor in line limits how much can flow.'] });
      const cap = k.group(k.at(k.rot(k.cyl(0.06, 0.06, 0.12, k.mat(0x1f4fa0, { roughness: 0.45 }), 16), Math.PI / 2, 0, 0), -0.32, 0.95, -0.09), k.at(k.rot(k.cyl(0.055, 0.055, 0.01, metal(0xc9ced6), 16), Math.PI / 2, 0, 0), -0.32, 0.95, -0.155));
      sub(board, 'board', { id: 'cap', name: 'Capacitor', obj: cap, pull: [-0.6, 0.7, -1.0], level: 3, face: [0, 0, -1], focusRadius: 0.4,
        say: 'The capacitor is a tiny bucket of electricity, ready for a quick drink.', job: 'It gives the chip a quick drink of electricity when the light flashes, so the chip stays steady.',
        learn: ['Picture a little bucket that fills slowly and pours quickly when the light flashes.',
          'When the LED flashes it needs a gulp of electricity all at once. The capacitor holds some close by so the chip keeps getting steady power.',
          'A capacitor is two metal plates with a thin gap between them. Charge builds up on the plates, and it can be let out fast.'] });
      // copper fingers under each button (front of the board)
      const fingers = k.group();
      BTN.forEach((b) => { [-0.025, 0.025].forEach((dx) => fingers.add(k.at(k.box(0.018, 0.1, 0.012, gold), b.x + dx, b.y, 0.026))); });
      sub(board, 'board', { id: 'fingers', name: 'Copper fingers', obj: fingers, pull: [0, 0, 1.6], level: 3, face: [0, 0, 1], focusRadius: 1.6,
        say: 'Under each button are two little copper fingers that do not touch, until you press.',
        breaks: 'The button pad has nothing to touch, so the remote never hears you press!',
        learn: ['They are like two kids who almost hold hands. Pressing the button makes them touch.',
          'When the black pad bridges the two fingers, a tiny bit of electricity can pass between them. The chip checks for that.',
          'The chip arranges the buttons in rows and columns. It tests each row and column pair to find which button has been bridged.'] });

      // ---- button mat (+ carbon pads)
      const mat = k.group(k.at(k.rbox(1.14, 3.8, 0.03, k.mat(0x2a2d33, { roughness: 0.8 }), 0.02), 0, 0, 0.065));
      let pwrBtn = null;
      BTN.forEach((b) => {
        const m = k.at(k.rot(k.cyl(b.r, b.r, 0.2, k.mat(b.c, { roughness: 0.7 }), 18), Math.PI / 2, 0, 0), b.x, b.y, 0.17);
        mat.add(m); if (b.pwr) pwrBtn = m;
      });
      body.add(mat);
      add({ id: 'mat', name: 'Button mat', obj: mat, pull: [0, 0.3, -2.4], blockedBy: ['board'], face: [0, 0, -1], focusRadius: 2.2,
        say: 'The rubber mat sits under the buttons. Press a button and it squishes, then springs back.',
        breaks: 'The buttons are gone, so there is nothing to press!', symptom: 'I cannot press the buttons, they are missing.',
        learn: ['It is like a bouncy pad. Press it and it squishes, let go and it pops back up.',
          'Every button is a little rubber dome. When you press one, it folds down, and the black pad under it touches the board.',
          'Rubber is springy, so no metal spring is needed. It is cheap to make in one piece, and it feels soft under your thumb.'] });
      const pads = k.group();
      BTN.forEach((b) => pads.add(k.at(k.rot(k.cyl(0.05, 0.05, 0.012, k.mat(0x0b0b0c, { roughness: 0.9 }), 14), Math.PI / 2, 0, 0), b.x, b.y, 0.045)));
      sub(mat, 'mat', { id: 'pads', name: 'Carbon pads', obj: pads, pull: [0, 0, -1.4], level: 2, face: [0, 0, -1], focusRadius: 1.8,
        say: 'The black dots under the buttons are carbon pads. They connect the board when you press.',
        breaks: 'Pressing does not connect anything, so the remote never knows!', symptom: 'The buttons click, but the phone sees no purple flash.',
        learn: ['Each dot is a little bridge. Press the button and the bridge touches two copper roads.',
          'Carbon is a soft black material that lets electricity through. It squishes flat, so it makes a good touch and does not wear down the copper.',
          'Remotes like these use carbon pads because they are cheap and last for many thousands of presses.'] });

      // ---- infrared window (top end)
      const winMat = k.mat(0x6e0c14, { transparent: true, opacity: 0.82, roughness: 0.15 });
      const win = k.group(k.at(k.box(0.5, 0.08, 0.22, winMat), 0, 2.08, 0));
      body.add(win);
      add({ id: 'window', name: 'Infrared window', obj: win, pull: [0, 1.2, 0.6], face: [0, 1, 0], focusRadius: 0.6,
        say: 'This dark red window lets the invisible light out. It also keeps dust out.',
        job: 'It protects the little light from dust and lets the invisible light out.',
        learn: ['It is like a window made for light that you cannot see.',
          'It looks dark because it blocks light you can see. But infrared light goes right through it. That also makes the remote look neat.',
          'Tap Look inside to shrink down and see why your eyes cannot see this light, but a phone camera can.'] });

      return { root, shell: [shell], parts, refs: { led, ledMeshes: [ledBody, ledDome], pwrBtn, flash, labFlash, labNone, labTV, beamTo, beamUp, lvl: 0 } };
    },

    evaluate(has, on) {
      const bats = has('bat1') && has('bat2');
      const wired = has('sp1') && has('sp2') && has('ct1') && has('ct2');
      const buttons = has('mat') && has('pads');
      const brain = has('board') && has('chip') && has('crystal') && has('transistor');
      const touch = has('fingers');
      const lit = has('led');
      const alive = on && bats && wired && buttons && brain && touch && lit;
      let reason = '';
      if (on && !alive) {
        reason = !bats ? 'There are no batteries, so there is no electricity!'
          : !wired ? "The batteries aren't touching the metal, so no electricity gets through!"
          : !has('mat') ? 'The button mat is gone, so there is nothing to press!'
          : !has('board') ? 'The circuit board is gone, so nothing is connected!'
          : !(has('pads') && touch) ? 'Pressing makes no connection, so the remote never hears you!'
          : !brain ? "The remote's brain is missing, so it cannot send a message!"
          : 'There is no little light to send the message!';
      }
      return { alive, reason };
    },

    tick(dt, t, inst, out, on) {
      const r = inst.refs, ir = !!(out && out.alive);
      let lvl = 0;
      if (ir) {
        const burst = (t % 1.8) < 1.1, n = Math.sin(Math.floor(t * 24) * 12.9898) * 43758.5453, bit = n - Math.floor(n) > 0.4;
        lvl = burst ? (bit ? 1 : 0.12) : 0.1;
      }
      r.lvl = lvl;
      r.ledMeshes.forEach((m) => { m.material.emissiveIntensity = lvl * 3.2; });
      r.led.visible = ir && lvl > 0.2; r.led.scale.setScalar(0.5 + lvl * 0.7);
      r.flash.visible = ir; r.flash.material.opacity = 0.2 + 0.8 * lvl;
      r.beamTo.visible = r.beamUp.visible = ir && lvl > 0.3;
      if (r.beamTo.visible) { r.beamTo.userData.flow.update(dt, 0.8); r.beamUp.userData.flow.update(dt, 0.7); }
      r.labFlash.visible = ir; r.labTV.visible = ir; r.labNone.visible = !!on && !ir;
      if (r.pwrBtn) r.pwrBtn.position.z += ((on ? 0.135 : 0.17) - r.pwrBtn.position.z) * Math.min(1, dt * 14);
    },
  });
})();
