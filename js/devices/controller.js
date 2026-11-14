/* Game controller. Beginner 8 pieces, Medium 15, Advanced 25.
 * Power plays a little demo: buttons press, sticks wobble, and the rumble motors spin their off-center weights
 * so the whole controller shakes. Pull a motor or its weight and the shake gets weaker. */
(function () {
  const T = window.THREE;
  const TOP = 1.0; // top face of the shell

  TAL.registerDevice({
    id: 'controller',
    name: 'Game controller',
    short: 'game controller',
    subtitle: 'Buzzing, clicking and shaking',
    powerSound: 'flat',
    channels: false,
    view: { target: [0, 0.9, 0], radius: 5.0, explodedRadius: 8.6, explodedY: 1.6, yaw: 0, pitch: 0.85, shadow: [9, 6] },
    intro: 'This is a game controller. Press the green power button and feel it buzz! The rumble motors inside make it shake.',
    shellSay: 'That is the controller. Two plastic halves hold everything inside.',
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button. Watch the buttons and feel the controller shake!", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['sc1', 'sc2', 'sc3', 'sc4'], levels: [3], say: 'The two halves are held by four screws. Twist them out!', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['top'], say: 'Now lift off the top half.', nudge: 'Pull off the top shell.' },
      { do: 'remove', ids: ['mL'], say: 'See that little motor in the handle? Pull it out. What happens to the shaking?', nudge: 'Pull out a rumble motor.' },
      { do: 'remove', ids: ['membrane'], levels: [2, 3], say: 'Peel up the rubber sheet. Now try the buttons!', nudge: 'Pull up the rubber sheet.' },
      { do: 'remove', ids: ['battery'], say: 'Pull out the battery. Everything stops!', nudge: 'Pull out the battery.' },
      { do: 'end', say: 'A controller has a battery for power, a board that thinks, buttons that tell it what you press, and motors that buzz. Put them back and play!' },
    ],

    build(k) {
      const shaker = k.group();
      const root = k.group(shaker);
      const parts = [];
      const add = (s) => { parts.push(s); return s; };
      const sub = (parentObj, parentId, s) => { parentObj.add(s.obj); s.parent = parentId; return add(s); };
      const plastic = (c) => k.mat(c, { roughness: 0.5, metalness: 0.35 });
      const dark = k.mat(0x1d1f26, { roughness: 0.9 });
      const metal = k.metal(0xb9bec6);

      // ---- shell halves (a body with two handles)
      const half = (y, col) => {
        const m = plastic(col);
        return k.group(k.at(k.rbox(5.4, 0.5, 3.0, m, 0.2), 0, y, 0), k.at(k.rbox(1.5, 0.5, 1.5, m, 0.25), -2.2, y, 1.35), k.at(k.rbox(1.5, 0.5, 1.5, m, 0.25), 2.2, y, 1.35));
      };
      const top = half(0.75, 0x3f6fe0);
      const led = k.mesh(new T.BoxGeometry(0.9, 0.03, 0.08), k.glow(0x3ee08f, 0x3ee08f)); led.name = 'led'; k.at(led, 0, TOP + 0.01, -1.2);
      top.add(led);
      const bottom = half(0.25, 0x191c24);
      shaker.add(top, bottom);
      add({ id: 'top', name: 'Top shell', obj: top, pull: [0, 2.8, -3.0], blockedBy: ['sc1', 'sc2', 'sc3', 'sc4'], xray: true, face: [0, 1, 0], focusRadius: 4.5,
        say: 'The top half of the case. It holds the buttons in place and protects the insides.',
        job: 'It holds your buttons in place and protects the parts inside.',
        learn: ['It is like the lid of a lunchbox. It keeps everything safe and in the right spot.', 'It is molded plastic with holes for the sticks and buttons to poke through. The shape fits your hands.', 'Plastic is light, strong and easy to mold into curves. Making it takes a metal mold that is pressed shut around hot plastic.'] });
      add({ id: 'bottom', name: 'Bottom shell', obj: bottom, pull: [0, -2.6, 1.2], blockedBy: ['top', 'board', 'battery', 'mL', 'mR'], face: [0, -1, 0], focusRadius: 4.5,
        say: 'The bottom half of the case. It is the tray that holds the battery and the motors.',
        job: 'It holds the battery, the motors and the board in place.',
        learn: ['It is like the bottom of the lunchbox where the food sits.', 'It has little posts and walls that keep each part from sliding around, even when it buzzes.', 'Plastic posts and ribs fit each part snugly, and they also make the shell stiff without making it heavy.'] });
      [[-2.2, -1.25], [2.2, -1.25], [-2.45, 1.75], [2.45, 1.75]].forEach(([x, z], i) => {
        const sc = k.at(k.screw(0x9ea3ab, 0.35), x, TOP, z);
        shaker.add(sc);
        add({ id: 'sc' + (i + 1), name: 'Case screw', kind: 'screw', obj: sc, pull: [0, 0.9, 0], level: 3, fuse: 'top', face: [0, 1, 0],
          say: 'A screw. It holds the two halves of the case together.',
          job: 'It holds the two halves of the case together.',
          learn: ['A screw is like a tiny spiral staircase that pulls the halves together as you twist.', 'The thread bites into the plastic post, so the screw stays put through all the shaking.', 'Twisting turns a big, slow motion into a strong squeeze. That squeeze is what holds the shell shut.'] });
      });

      // ---- circuit board (with chip and charging port)
      const pcb = k.board(3.6, 2.0, { seed: 3, count: 40 });
      k.at(pcb, 0, 0.5, 0);
      const board = k.group(pcb);
      const bled = k.mesh(new T.BoxGeometry(0.2, 0.06, 0.1), k.mat(0x2a2a2a)); k.at(bled, 1.3, 0.56, -0.8);
      board.add(bled);
      // a strip of rubber pads sits on top of the board: the membrane
      shaker.add(board);
      add({ id: 'board', name: 'Circuit board', obj: board, pull: [0, 2.6, 1.8], blockedBy: ['top', 'membrane'], face: [0, 1, 0], focusRadius: 2.2,
        say: 'The circuit board is the controller\'s tiny brain. It figures out which buttons you press.',
        breaks: 'No brain! Nothing works at all.',
        fact: 'The board has copper roads on it that join all the parts.',
        learn: ['It is like a town map. The little roads (copper lines) carry electricity between parts.', 'It reads each button and stick many times a second and sends the news to the console.', 'A board is a flat plastic and fiberglass sheet with thin copper traces. Chips and tiny parts are soldered on top.'],
        symptom: 'Nothing lights up and nothing works.' });
      const chip = k.group(k.at(k.box(0.6, 0.1, 0.6, k.mat(0x16171b, { roughness: 0.3 })), -0.2, 0.6, 0.1), k.at(k.box(0.3, 0.01, 0.1, k.mat(0xdddddd)), -0.2, 0.656, 0.1));
      sub(board, 'board', { id: 'chip', name: 'Main chip', obj: chip, pull: [0, 1.6, 0.4], level: 3, face: [0, 1, 0], focusRadius: 1,
        say: 'This little chip is the thinker. It reads your buttons and talks to the game.',
        breaks: 'The thinker is gone. Nothing works!',
        fact: 'A chip is a tiny brain with millions of switches.',
        learn: ['It is like the captain on a ship. It listens to everything and decides what to do.', 'It checks every button and stick hundreds of times each second, then sends a tiny message to the game console.', 'It is a microcontroller: a small computer on a chip that runs a program and sends data wirelessly or by cable.'],
        symptom: 'Nothing lights up and nothing works.' });
      const port = k.group(k.at(k.box(0.5, 0.14, 0.3, metal), 0, 0.58, -0.95), k.at(k.box(0.34, 0.06, 0.1, k.mat(0x1a1a1a)), 0, 0.58, -1.08));
      sub(board, 'board', { id: 'port', name: 'Charging port', obj: port, pull: [0, 0.8, -0.8], level: 3, face: [0, 1, 0], focusRadius: 1,
        say: 'The charging port is the little hole where the cable plugs in.',
        breaks: 'It still plays, but now you cannot plug in a cable to charge it!', breaksAlways: true,
        job: 'It is where the charging cable plugs in.',
        learn: ['It is the door where the electricity comes in to fill the battery.', 'It is a metal socket with tiny pins that touch the cable plug.', 'A USB socket has pins for power and for data, so one cable can both charge and talk to the computer.'] });

      // ---- battery
      const battery = k.group(k.at(k.rbox(1.8, 0.3, 1.0, k.mat(0x2457c5, { roughness: 0.4 }), 0.05), 0, 0.28, 0.1), k.at(k.box(0.5, 0.12, 0.2, k.metal(0xd8c48a)), 0.55, 0.28, -0.45));
      shaker.add(battery);
      add({ id: 'battery', name: 'Battery', obj: battery, pull: [0, 2.2, 2.4], blockedBy: ['board'], face: [0, 1, 0], focusRadius: 1.6,
        say: 'The battery stores electricity, like a lunchbox stores food.',
        breaks: 'No battery, no electricity. Nothing works!',
        fact: 'A battery pushes electricity out when something is connected.',
        learn: ['The battery is a little tank of stored energy. It lets the controller work without a cable.', 'It makes electricity from chemicals inside. When you plug the controller in, electricity flows back in and refills it.', 'Rechargeable batteries like this one are usually lithium ion. A charging chip protects it from overheating.'],
        symptom: 'Nothing lights up and nothing works.' });

      // ---- rumble motors (with off-center weights)
      const mk = (sx, id, wid, name, nm) => {
        const mx = sx * 2.2, mz = 1.3;
        const body = k.group(k.at(k.rot(k.cyl(0.2, 0.2, 0.7, k.metal(0x9aa0a8), 18), 0, 0, Math.PI / 2), mx - 0.1, 0.32, mz), k.at(k.rot(k.cyl(0.04, 0.04, 0.3, k.metal(0xd7dce2), 8), 0, 0, Math.PI / 2), mx + 0.35, 0.32, mz));
        const m = k.group(body); shaker.add(m);
        // the weight: a half-moon on the end of the spinning stick, so it is lopsided (inner group spins)
        const spinIn = k.at(k.group(k.rot(k.mesh(new T.CylinderGeometry(0.22, 0.22, 0.14, 14, 1, false, 0, Math.PI), k.metal(0xd8a24a)), 0, 0, Math.PI / 2)), mx + 0.48, 0.32, mz);
        const spin = k.group(spinIn);
        add({ id, name: 'Rumble motor', obj: m, pull: [sx * 2.0, 2.0, 1.6], blockedBy: ['top'], face: [0, 1, 0], focusRadius: 1.2,
          say: 'This little motor makes the controller shake. It has a lopsided weight on its spinning stick!',
          breaks: 'With a motor gone, there is less shaking.',
          fact: 'A weight that is not centered makes everything wobble when it spins.',
          learn: ['Spin something lopsided and it wobbles, like a washing machine with all the socks on one side.', 'The motor spins fast, and the heavy half of the weight pulls the whole controller a little to one side, then the other. Your hands feel that as a buzz.', 'This is an eccentric rotating mass motor. The off-center weight makes a rotating force, and a different motor speed changes the buzz.'],
          symptom: 'The controller does not buzz in my hands.' });
        sub(m, id, { id: wid, name: 'Off-center weight', obj: spin, pull: [0, 1.0, 0.8], level: 3, face: [0, 1, 0], focusRadius: 0.8,
          say: 'This half-moon weight is lopsided on purpose. That is what makes the shaking.',
          breaks: 'The motor spins smoothly now, so there is no shaking!',
          fact: 'If it were perfectly round, it would spin without any shake.',
          learn: ['If it were perfectly round it would spin smoothly. The lopsided half is what makes it wobble.', 'The heavy side tugs sideways as it goes around, the way a bucket swung on a rope tugs your hand.', 'The off-center mass creates a force that rotates with the shaft. The faster it spins, the harder the tug, so speed controls the strength.'],
          symptom: 'The motor spins, but the controller does not buzz.' });
        return spinIn;
      };
      const spinL = mk(-1, 'mL', 'wL', 'Left rumble motor', 'L');
      const spinR = mk(1, 'mR', 'wR', 'Right rumble motor', 'R');

      // ---- membrane: a rubber sheet with little nubs under the buttons
      const mem = k.group(k.at(k.box(3.4, 0.04, 1.8, k.mat(0x56644f, { roughness: 0.95 })), 0, 0.62, 0));
      [[1.5, -0.35], [1.8, -0.1], [1.8, -0.6], [2.1, -0.35], [-0.85, 0.55], [-0.85, 0.55]].forEach(([x, z]) => mem.add(k.at(k.cyl(0.13, 0.13, 0.12, k.mat(0x6b7367, { roughness: 1 }), 12), x * 0.7, 0.68, z * 0.6)));
      board.add(mem);
      add({ id: 'membrane', name: 'Rubber membrane', obj: mem, pull: [0, 1.8, -1.6], level: 2, fuse: 'board', face: [0, 1, 0], focusRadius: 2.2,
        say: 'A soft rubber sheet with little bumps under the buttons. It makes the buttons spring back up.',
        breaks: 'The buttons are floppy and do not press anything now!',
        fact: 'The bumps touch the board when you push down.',
        learn: ['Think of a rubber trampoline under each button. Push it down and it bounces back.', 'Under each bump is a bit of black rubber. When you press, it touches two spots on the board and joins them.', 'Pressing connects the two copper spots, and the board notices the change. The rubber also springs the button back up.'],
        symptom: 'I press the buttons and nothing happens.' });

      // ---- thumbsticks (with caps)
      const stick = (id, sx, sz, label, symptomText) => {
        const pivot = k.at(k.group(k.at(k.cyl(0.1, 0.1, 0.5, metal, 12), 0, 0.22, 0)), sx, 0.62, sz);
        const base = k.at(k.box(0.75, 0.12, 0.75, k.mat(0x2a2c33, { roughness: 0.5 })), sx, 0.58, sz);
        const g = k.group(base, pivot);
        const cap = k.group(k.at(k.cyl(0.3, 0.3, 0.2, dark, 24), 0, 0.5, 0), k.at(k.cyl(0.18, 0.28, 0.06, k.mat(0x2e3038, { roughness: 0.9 }), 24), 0, 0.62, 0));
        shaker.add(g);
        add({ id, name: label, obj: g, pull: [sx * 1.2, 2.4, 0.6], face: [0, 1, 0], focusRadius: 1.2,
          say: 'A thumbstick! Your thumb tilts it to steer in the game.',
          breaks: 'Without the stick, you cannot steer on this side.',
          fact: 'It senses which way and how far you tilt it.',
          learn: ['It is like a tiny joystick on a stick. Tilt it left and your game character goes left.', 'Inside, two little dials measure the tilt, one for left and right, one for up and down. The harder you tilt, the faster you go.', 'Each axis is a potentiometer (or a magnetic sensor) giving a number for how far it is tilted. A spring pushes it back to center when you let go.'],
          symptom: symptomText });
        sub(pivot, id, { id: id + 'c', name: 'Thumbstick cap', obj: cap, pull: [0, 1.0, 0.4], level: 3, face: [0, 1, 0], focusRadius: 0.8,
          say: 'The cap is the part your thumb rests on. It has a dip so your thumb does not slip off.',
          breaks: 'The stick still steers, but your thumb would slide around!', breaksAlways: true,
          job: 'It is the comfy part your thumb rests on.',
          learn: ['The cap is like a little hat on the stick. It makes the stick comfy to push.', 'It is smooth plastic with a dip and a rough rim so your thumb stays put even when you sweat.', 'The rubbery grip texture adds friction, so your thumb keeps control during fast play.'] });
        return pivot;
      };
      const pL = stick('sL', -1.7, -0.35, 'Left thumbstick', 'I cannot steer on the left side.');
      const pR = stick('sR', 0.85, 0.55, 'Right thumbstick', 'I cannot look around on the right side.');

      // ---- face buttons (4) and d-pad
      const fx = 1.8, fz = -0.35, btn = [];
      const bcols = [0x3ee08f, 0xff5b4f, 0x58b8ff, 0xffc23a], bpos = [[0, 0.32], [0.32, 0], [-0.32, 0], [0, -0.32]];
      const faces = k.group();
      bpos.forEach(([dx, dz], i) => { const b = k.at(k.cyl(0.17, 0.17, 0.12, k.mat(bcols[i], { roughness: 0.5, metalness: 0.35 }), 18), fx + dx, TOP + 0.04, fz + dz); faces.add(b); btn.push(b); });
      shaker.add(faces);
      add({ id: 'btns', name: 'Face buttons', obj: faces, pull: [1.6, 1.8, -0.4], level: 2, fuse: 'top', face: [0, 1, 0], focusRadius: 1.2,
        say: 'Four colorful buttons your right thumb pushes.',
        breaks: 'Without those buttons, you cannot push them.',
        fact: 'Each button presses a little bump on the rubber sheet.',
        learn: ['Pushing a button is like knocking on a door. It tells the controller you want to do something.', 'Each button pushes the rubber bump below it down onto the board, and the board sends a message to the game.', 'Each press connects a pair of copper pads. The chip scans them hundreds of times per second so it never misses a quick tap.'],
        symptom: 'My right thumb buttons do not do anything.' });
      const dpad = k.group(k.at(k.box(0.7, 0.12, 0.24, dark), -0.85, TOP + 0.04, 0.55), k.at(k.box(0.24, 0.12, 0.7, dark), -0.85, TOP + 0.04, 0.55));
      const dpadIn = dpad;
      shaker.add(dpad);
      add({ id: 'dpad', name: 'D-pad', obj: dpad, pull: [-1.6, 1.8, 1.4], level: 2, fuse: 'top', face: [0, 1, 0], focusRadius: 1,
        say: 'The D-pad is a plus shape. You push it up, down, left or right.',
        breaks: 'Without the D-pad, you cannot choose a direction with it.',
        fact: 'The four arms of the plus each press a different bump.',
        learn: ['It is like a seesaw in four directions. Press an arm and that side goes down.', 'Each arm presses its own bump on the rubber sheet, so the controller knows which way you pushed.', 'The four arms close four separate contact pairs. The chip reads them as up, down, left and right.'],
        symptom: 'The plus-shaped pad does not work.' });

      // ---- triggers and their springs
      const trig = (id, sid, sx, label) => {
        const pivot = k.at(k.group(k.at(k.rbox(0.9, 0.3, 0.4, plastic(0x3a3d49), 0.1), 0, 0.0, -0.18)), sx * 1.9, 0.9, -1.55);
        const t = k.group(pivot);
        shaker.add(t);
        add({ id, name: label, obj: t, pull: [sx * 1.6, 1.4, -2.2], level: 2, fuse: 'top', face: [0, 1, 0], focusRadius: 1,
          say: 'A trigger. Your pointer finger squeezes it.',
          breaks: 'You cannot squeeze this one anymore.',
          fact: 'The harder you squeeze, the more it tells the game.',
          learn: ['It is like a little lever for your finger.', 'A spring pushes it back out each time. Squeeze it more or less and the game can tell how hard.', 'A sensor measures how far it moves, so the game can use partial squeezes, like a gas pedal.'],
          symptom: 'The back trigger does not work.' });
        const pts = [];
        for (let i = 0; i <= 40; i++) { const a = i * 0.8; pts.push([sx * 1.9 + Math.sin(a) * 0.1, 0.5 + (i / 40) * 0.38, -1.3 + Math.cos(a) * 0.1]); }
        const sp = k.group(k.tube(pts, 0.015, k.metal(0xd7dce2)));
        shaker.add(sp);
        add({ id: sid, name: 'Trigger spring', obj: sp, pull: [sx * 1.0, 1.8, -0.8], blockedBy: ['top'], level: 2, fuse: 'bottom', face: [0, 1, 0], focusRadius: 0.8,
          say: 'A tiny spring pushes the trigger back out after you squeeze it.',
          breaks: 'The trigger is floppy and does not spring back!',
          fact: 'A spring pushes back when squashed.',
          learn: ['Squash a spring and it bounces back. That is how the trigger pops back out.', 'It also gives the trigger a nice springy feel as you squeeze.', 'The spring pushes harder the more you squash it, so the trigger feels firmer as you press further.'],
          symptom: 'The trigger flops around and does not spring back.' });
        return pivot;
      };
      const tL = trig('trL', 'tsL', -1, 'Left trigger'), tR = trig('trR', 'tsR', 1, 'Right trigger');

      // ---- effects: rumble tags
      const big = k.label('BZZZ!', { size: 0.46, bg: 'rgba(214,90,20,0.95)' }); big.position.set(0, 2.2, 0.2); big.visible = false;
      const small = k.label('bzz...', { size: 0.34, bg: 'rgba(60,110,200,0.92)' }); small.position.set(0, 2.2, 0.2); small.visible = false;
      root.add(big, small);

      return { root, shell: [], parts, refs: { shaker, spinL, spinR, pL, pR, tL, tR, btn, dpad: dpadIn, big, small, clock: 0, spL: 0, spR: 0, trigA: 0 } };
    },

    evaluate(has, on) {
      const power = has('battery') && has('board') && has('chip');
      const alive = on && power;
      let reason = '';
      if (on && !power) reason = !has('battery') ? 'There is no battery, so the controller has no electricity.' : 'The brain is missing, so nothing works.';
      const mot = (m, w) => alive && has(m) && has(w);
      return {
        alive, reason,
        rumbleL: mot('mL', 'wL'), rumbleR: mot('mR', 'wR'), spinL: alive && has('mL'), spinR: alive && has('mR'),
        press: alive && has('membrane'), face: has('btns'), dpad: has('dpad'), sL: has('sL'), sR: has('sR'), caps: has('sLc') && has('sRc'),
        tL: has('trL'), tR: has('trR'), spL: has('tsL'), spR: has('tsR'), port: has('port'),
      };
    },

    apply(out, inst) {
      const r = inst.refs;
      inst.parts.forEach((p) => { p.blockedBy = p.blockedBy.filter((b) => inst.byId[b]); }); // drop blockers that are not separate pieces at this level
      const led = inst.byId.top && inst.byId.top.meshes.find((m) => m.name === 'led');
      if (led) led.material.emissiveIntensity = out.alive ? 2.2 : 0;
      if (!out.alive) { r.clock = 0; r.big.visible = false; r.small.visible = false; }
    },

    tick(dt, t, inst, out, on) {
      const r = inst.refs;
      if (!out) return;
      const alive = !!out.alive;
      if (alive) r.clock += dt;
      const c = r.clock % 3.0, burst = alive && c < 1.5;
      // rumble: weights spin, the controller shakes
      const targetL = burst && out.spinL ? 1 : 0, targetR = burst && out.spinR ? 1 : 0;
      r.spL += (targetL - r.spL) * Math.min(1, dt * 6); r.spR += (targetR - r.spR) * Math.min(1, dt * 6);
      r.spinL.rotation.x += dt * 38 * r.spL; r.spinR.rotation.x += dt * 38 * r.spR;
      const amp = 0.04 * ((out.rumbleL ? r.spL : 0) + (out.rumbleR ? r.spR : 0));
      r.shaker.position.set(Math.sin(t * 75) * amp, 0, Math.cos(t * 61) * amp * 0.8);
      const n = (out.rumbleL ? 1 : 0) + (out.rumbleR ? 1 : 0);
      r.big.visible = burst && n === 2; r.small.visible = burst && n === 1;
      // the demo: buttons press one at a time, sticks wobble, triggers squeeze
      const step = Math.floor(r.clock / 0.45) % 4, ph = (r.clock % 0.45) / 0.45;
      r.btn.forEach((b, i) => { b.position.y = TOP + 0.04 - (alive && out.press && out.face && i === step && ph < 0.55 ? 0.07 : 0); });
      const dpo = alive && out.press && out.dpad ? Math.sin(r.clock * 3) * 0.12 : 0;
      r.dpad.rotation.set(dpo, 0, dpo * 0.5);
      r.pL.rotation.set(alive && out.sL ? Math.sin(r.clock * 2.2) * 0.25 : 0, 0, alive && out.sL ? Math.cos(r.clock * 2.2) * 0.25 : 0);
      r.pR.rotation.set(alive && out.sR ? Math.cos(r.clock * 1.9) * 0.25 : 0, 0, alive && out.sR ? Math.sin(r.clock * 1.9) * 0.25 : 0);
      const sq = alive && burst ? 1 : 0;
      r.tL.rotation.x += ((out.tL ? (out.spL ? -0.35 * sq : -0.35 * (alive ? 1 : 0)) : 0) - r.tL.rotation.x) * Math.min(1, dt * 12);
      r.tR.rotation.x += ((out.tR ? (out.spR ? -0.35 * sq : -0.35 * (alive ? 1 : 0)) : 0) - r.tR.rotation.x) * Math.min(1, dt * 12);
    },
  });

  Object.assign(TAL.insideByName, {
    'Circuit board': 'pcb-inside', 'Main chip': 'chip-package', 'Case screw': 'screw-inside',
    'Face buttons': 'switch-inside', 'D-pad': 'switch-inside',
  });
})();
