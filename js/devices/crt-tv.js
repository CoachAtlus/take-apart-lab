/* Old tube (CRT) TV. Coordinates: x right, y up, +z is the front of the TV. */
TAL.registerDevice({
  id: 'crt-tv',
  name: 'Old Tube TV',
  short: 'TV',
  subtitle: 'The big boxy kind from long ago',
  screenStyle: 'crt',
  screenPart: 'tube',
  powerSound: 'crt',
  channels: true,
  view: { target: [0, 2.2, 0], radius: 3.7, explodedRadius: 7.4, explodedY: 3.3, yaw: -0.55, pitch: 0.2, shadow: [5.2, 4.4] },
  intro: 'This is an old tube TV, the big boxy kind from long ago.',
  guide: [
    { do: 'power', say: "Hi, I'm Sparky! Let's take this TV apart together. First, press the green power button to turn it on.", nudge: 'Press the power button.' },
    { do: 'remove', ids: ['antenna'], say: 'See the rabbit ears on top? Pull them off with your finger and watch the screen!', nudge: 'Drag the rabbit ears off the top of the TV.' },
    { do: 'turn', side: 'back', say: "Now let's see the back. Tap the turn around button.", nudge: 'Tap the turn around button.' },
    { do: 'remove', ids: ['screw0', 'screw1', 'screw2', 'screw3'], say: 'Twist out the four screws with your finger!', nudge: 'Pull out the glowing screw.' },
    { do: 'remove', ids: ['cover'], say: 'Now pull off the back cover. Careful, real ones can zap you!', nudge: 'Drag the back cover away.' },
    { do: 'remove', ids: ['yoke'], say: 'Find the copper coils around the neck of the big glass tube. Pull them off!', nudge: 'Pull off the copper coils.' },
    { do: 'end', say: "Great job! Now you're the boss. Take apart anything you want!" },
  ],
  shellSay: "That's the wooden cabinet. It's the TV's outside shell, and everything else is hooked to it.",

  build(k) {
    const T = k.THREE;
    const root = k.group();
    const body = k.at(k.group(), 0, 0.55, 0); // the cabinet sits on short legs
    root.add(body);
    const wood = k.mat(0x8a5a2b, { roughness: 0.55 }), woodDark = k.mat(0x6a4220, { roughness: 0.6 }), trim = k.metal(0xd2bb8a, { roughness: 0.35 });
    const W = 4.4, H = 3.5, D = 3.6, TH = 0.15;
    const cx = -0.55, cy = 1.85, ow = 2.8, oh = 2.1; // screen opening

    // ---- cabinet (not removable)
    const shell = k.group();
    body.add(shell);
    shell.add(k.at(k.box(W, TH, D, wood), 0, H - TH / 2, 0));
    shell.add(k.at(k.box(W, TH, D, wood), 0, TH / 2, 0));
    shell.add(k.at(k.box(TH, H, D, wood), -W / 2 + TH / 2, H / 2, 0));
    shell.add(k.at(k.box(TH, H, D, wood), W / 2 - TH / 2, H / 2, 0));
    const fz = D / 2 - TH / 2, topH = H - (cy + oh / 2), botH = cy - oh / 2;
    const leftW = cx - ow / 2 + W / 2, rightW = W / 2 - (cx + ow / 2);
    shell.add(k.at(k.box(W, topH, TH, woodDark), 0, H - topH / 2, fz));
    shell.add(k.at(k.box(W, botH, TH, woodDark), 0, botH / 2, fz));
    shell.add(k.at(k.box(leftW, oh, TH, woodDark), -W / 2 + leftW / 2, cy, fz));
    shell.add(k.at(k.box(rightW, oh, TH, woodDark), W / 2 - rightW / 2, cy, fz));
    // brass trim around the screen
    const tz = D / 2 + 0.02;
    shell.add(k.at(k.box(ow + 0.12, 0.06, 0.05, trim), cx, cy + oh / 2 + 0.03, tz));
    shell.add(k.at(k.box(ow + 0.12, 0.06, 0.05, trim), cx, cy - oh / 2 - 0.03, tz));
    shell.add(k.at(k.box(0.06, oh, 0.05, trim), cx - ow / 2 - 0.03, cy, tz));
    shell.add(k.at(k.box(0.06, oh, 0.05, trim), cx + ow / 2 + 0.03, cy, tz));
    // control panel: channel knob, volume knob, speaker grille
    const px = W / 2 - rightW / 2;
    const knob = k.group(
      k.rot(k.cyl(0.27, 0.3, 0.2, k.mat(0x2a2522, { roughness: 0.4 }), 28), Math.PI / 2, 0, 0),
      k.at(k.box(0.06, 0.24, 0.06, trim), 0, 0.12, 0.1)
    );
    k.at(knob, px, 2.45, D / 2 + 0.1);
    shell.add(knob);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      shell.add(k.at(k.box(0.03, 0.03, 0.02, trim), px + Math.sin(a) * 0.4, 2.45 + Math.cos(a) * 0.4, D / 2 + 0.01));
    }
    shell.add(k.at(k.rot(k.cyl(0.16, 0.18, 0.14, k.mat(0x2a2522), 24), Math.PI / 2, 0, 0), px, 1.8, D / 2 + 0.07));
    for (let i = 0; i < 7; i++) shell.add(k.at(k.box(0.95, 0.05, 0.03, trim), px, 0.6 + i * 0.11, D / 2 + 0.01));
    // legs + a shelf for the flyback
    [[-1.8, 1.3], [1.8, 1.3], [-1.8, -1.3], [1.8, -1.3]].forEach(([x, z]) => shell.add(k.at(k.cyl(0.09, 0.05, 0.55, woodDark, 12), x, -0.275, z)));
    shell.add(k.at(k.box(0.8, 0.06, 0.8, k.metal(0x8d9196)), -1.7, 0.74, -1.0));

    // ---- antenna (rabbit ears)
    const ant = k.group(k.rot(k.at(k.sphere(0.3, k.mat(0x1b1b1b, { roughness: 0.3 })), 0, 0, 0), 0, 0, 0));
    ant.children[0].scale.y = 0.5;
    const chrome = k.metal(0xdfe4ea, { roughness: 0.15 });
    [0.45, -0.45].forEach((a) => {
      const rod = k.cyl(0.025, 0.035, 2.4, chrome, 10);
      rod.position.set(Math.sin(a) * 1.2, Math.cos(a) * 1.2, 0);
      rod.rotation.z = -a;
      ant.add(rod);
      ant.add(k.at(k.sphere(0.06, chrome), Math.sin(a) * 2.4, Math.cos(a) * 2.4, 0));
    });
    k.at(ant, 0.9, H, -0.4);
    body.add(ant);

    // ---- back cover + screws
    const cover = k.group(k.box(W - 0.1, H - 0.1, 0.06, k.mat(0x2b2118, { roughness: 0.85 })));
    const slotMat = k.mat(0x0d0a07);
    for (let i = 0; i < 6; i++) cover.add(k.at(k.box(1.8, 0.07, 0.02, slotMat), -0.7, 1.15 - i * 0.18, -0.035));
    const sticker = k.decal(0.75, 0.62, (c, w, h) => {
      c.fillStyle = '#ffd23a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#111'; c.beginPath(); c.moveTo(w / 2, h * 0.08); c.lineTo(w * 0.9, h * 0.88); c.lineTo(w * 0.1, h * 0.88); c.closePath(); c.fill();
      c.fillStyle = '#ffd23a'; c.beginPath();
      c.moveTo(w * 0.55, h * 0.3); c.lineTo(w * 0.42, h * 0.58); c.lineTo(w * 0.52, h * 0.58); c.lineTo(w * 0.45, h * 0.8); c.lineTo(w * 0.6, h * 0.5); c.lineTo(w * 0.5, h * 0.5); c.closePath(); c.fill();
    });
    k.rot(k.at(sticker, 1.2, 0.9, -0.035), 0, Math.PI, 0);
    cover.add(sticker);
    k.at(cover, 0, H / 2, -D / 2 - 0.03);
    body.add(cover);
    const screws = [[-1.95, H / 2 + 1.55], [1.95, H / 2 + 1.55], [-1.95, H / 2 - 1.55], [1.95, H / 2 - 1.55]].map(([x, y], i) => {
      const s = k.screw();
      k.rot(k.at(s, x, y, -D / 2 - 0.06), -Math.PI / 2, 0, 0);
      body.add(s);
      return s;
    });

    // ---- power cord
    const black = k.mat(0x151515, { roughness: 0.5 });
    const cord = k.group(
      k.tube([[-1.7, 0.45, -1.86], [-1.8, 0.15, -2.2], [-1.95, -0.48, -2.5], [-2.6, -0.5, -2.9], [-3.3, -0.5, -3.0]], 0.045, black),
      k.at(k.box(0.35, 0.2, 0.26, black), -3.5, -0.45, -3.0),
      k.at(k.box(0.14, 0.04, 0.02, k.metal(0xd8c48a)), -3.74, -0.45, -2.95),
      k.at(k.box(0.14, 0.04, 0.02, k.metal(0xd8c48a)), -3.74, -0.45, -3.05)
    );
    body.add(cord);

    // ---- picture tube (the screen is part of it)
    const tube = k.at(k.group(), cx, cy, 0);
    const face = k.at(k.box(ow + 0.3, oh + 0.3, 0.45, k.mat(0x1c2420, { roughness: 0.2, metalness: 0.3 })), 0, 0, D / 2 - TH - 0.25);
    tube.add(face);
    const scr = k.screen(ow + 0.04, oh + 0.04, 512, 384, 0.06);
    scr.mesh.position.z = 1.627;
    tube.add(scr.mesh);
    const fg = new T.CylinderGeometry(0.3, 1.85, 1.9, 4, 1, true);
    fg.rotateY(Math.PI / 4); fg.rotateX(-Math.PI / 2);
    const funnel = k.mesh(fg, k.glass(0x4a5a52, 0.45, { side: T.DoubleSide }));
    funnel.scale.set(1.15, 0.95, 1);
    funnel.position.z = 0.225;
    tube.add(funnel);
    const neck = k.at(k.rot(k.cyl(0.2, 0.2, 1.0, k.glass(0x6a7a72, 0.4), 20, true), Math.PI / 2, 0, 0), 0, 0, -1.22);
    tube.add(neck);
    funnel.userData.pickThrough = neck.userData.pickThrough = true;
    tube.add(k.at(k.box(ow + 0.34, oh + 0.34, 0.08, k.metal(0x7d8186)), 0, 0, 1.2)); // the metal band around the tube
    body.add(tube);

    // ---- electron gun (inside the neck), color coded red/green/blue
    const gun = k.at(k.group(), cx, cy, -1.35);
    [0xff4a3d, 0x3ee08f, 0x4aa8ff].forEach((col, i) => {
      const a = (i / 3) * Math.PI * 2;
      gun.add(k.at(k.rot(k.cyl(0.045, 0.045, 0.55, k.metal(col, { roughness: 0.4 }), 12), Math.PI / 2, 0, 0), Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0));
    });
    gun.add(k.at(k.rot(k.cyl(0.14, 0.14, 0.12, k.metal(0xb7bcc3), 20), Math.PI / 2, 0, 0), 0, 0, 0.3));
    gun.add(k.at(k.rot(k.cyl(0.24, 0.24, 0.07, k.mat(0x2f7d4a), 24), Math.PI / 2, 0, 0), 0, 0, -0.42));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; gun.add(k.at(k.box(0.025, 0.025, 0.14, k.metal(0xd8c48a)), Math.cos(a) * 0.15, Math.sin(a) * 0.15, -0.36)); }
    body.add(gun);

    // ---- deflection yoke (copper steering magnets around the neck)
    const copper = k.metal(0xc8743a, { roughness: 0.35 });
    const yg = new T.CylinderGeometry(0.28, 0.58, 0.48, 28, 1, true);
    yg.rotateX(-Math.PI / 2);
    const yoke = k.at(k.group(k.mesh(yg, k.mat(0xc8743a, { metalness: 0.8, roughness: 0.35, side: T.DoubleSide }))), cx, cy, -0.6);
    yoke.add(k.at(k.torus(0.58, 0.05, copper), 0, 0, 0.24));
    yoke.add(k.at(k.torus(0.3, 0.06, k.mat(0x222222)), 0, 0, -0.26));
    yoke.add(k.at(k.box(0.12, 0.2, 0.3, k.mat(0x222222)), 0, 0.45, 0));
    body.add(yoke);

    // ---- flyback transformer + red high-voltage wire with its suction cup
    const fly = k.at(k.group(), -1.6, 0.92, -1.0);
    fly.add(k.box(0.7, 0.22, 0.7, k.mat(0x4a3424)));
    fly.add(k.at(k.cyl(0.26, 0.28, 0.55, k.mat(0x111111, { roughness: 0.35 }), 24), 0, 0.38, 0));
    fly.add(k.at(k.rot(k.cyl(0.06, 0.06, 0.08, k.mat(0x777777), 12), Math.PI / 2, 0, 0), 0.12, 0.45, 0.28));
    fly.add(k.tube([[0, 0.66, 0], [0.1, 1.25, 0.4], [0.6, 1.92, 1.1], [1.05, 1.86, 1.5]], 0.045, k.mat(0xd8261f, { roughness: 0.4 })));
    fly.add(k.at(k.cyl(0.05, 0.16, 0.08, k.mat(0x1b1b1b), 18), 1.05, 1.82, 1.5));
    body.add(fly);

    // ---- tuner (behind the channel knob)
    const tuner = k.at(k.group(k.box(0.6, 0.6, 0.75, k.metal(0xb9bec6, { roughness: 0.45 }))), px, 2.45, 1.0);
    tuner.add(k.at(k.rot(k.cyl(0.04, 0.04, 0.5, k.metal(0xd0d4da), 10), Math.PI / 2, 0, 0), 0, 0, 0.6));
    for (let i = 0; i < 3; i++) tuner.add(k.at(k.box(0.5, 0.04, 0.02, k.metal(0x8f949b)), 0, -0.15 + i * 0.15, -0.38));
    body.add(tuner);

    // ---- speaker
    const sg = new T.CylinderGeometry(0.4, 0.13, 0.26, 28, 1, true);
    sg.rotateX(Math.PI / 2);
    const speaker = k.at(k.group(k.mesh(sg, k.mat(0x3a3530, { side: T.DoubleSide, roughness: 0.9 }))), px, 0.95, 1.38);
    speaker.add(k.at(k.rot(k.cyl(0.16, 0.16, 0.18, k.metal(0x8a8f96), 20), Math.PI / 2, 0, 0), 0, 0, -0.2));
    speaker.add(k.at(k.torus(0.41, 0.03, k.metal(0x55595f)), 0, 0, 0.13));
    speaker.add(k.at(k.sphere(0.07, k.mat(0x222222)), 0, 0, 0.0));
    body.add(speaker);

    // ---- main circuit board (slides out the back like a drawer)
    const board = k.board(3.6, 2.2, { seed: 11 });
    board.add(k.at(k.cyl(0.2, 0.2, 0.5, k.mat(0x1f3c8f), 20), 1.2, 0.27, 0.6));
    board.add(k.at(k.cyl(0.14, 0.14, 0.35, k.mat(0x1f3c8f), 20), 1.6, 0.2, 0.6));
    const sink = k.group();
    for (let i = 0; i < 6; i++) sink.add(k.at(k.box(0.04, 0.3, 0.5, k.metal(0xb0b6bd)), i * 0.08, 0.17, 0));
    board.add(k.at(sink, -1.3, 0, 0.5));
    k.at(board, 0, 0.2, -0.5);
    body.add(board);

    const parts = [
      { id: 'antenna', name: 'Antenna', obj: ant, pull: [0, 1.8, 0],
        say: 'These are the rabbit ears! They catch TV signals flying through the air.',
        breaks: 'Now the TV can\'t catch the show, so all you see is fuzzy snow!',
        fact: 'TV shows used to travel through the air as invisible radio waves. The antenna catches them, a bit like a net catches fish.',
        symptom: 'The screen is all fuzzy snow, and it goes shhhh.' },
      { id: 'cord', name: 'Power cord', obj: cord, pull: [-1.3, 0, -1.3], noSpark: true,
        say: 'This is the power cord. It brings electricity from the wall.',
        breaks: 'Unplugged! No electricity, so everything turns off.',
        fact: 'Electricity flows through the metal wires inside the cord, like water through a hose.' },
      ...screws.map((s, i) => ({ id: 'screw' + i, name: 'Screw', kind: 'screw', obj: s, pull: [0, 0, -0.9],
        say: 'A screw! Lefty loosey, righty tighty.' })),
      { id: 'cover', name: 'Back cover', obj: cover, xray: true, pull: [6.6, 0, -0.6], blockedBy: ['screw0', 'screw1', 'screw2', 'screw3'],
        say: 'The back cover keeps fingers away from the zappy parts inside.',
        fact: 'A real old TV can keep a big zap of electricity inside even when it is unplugged. Only open a real one with a grown-up who knows how!' },
      { id: 'tuner', name: 'Tuner', obj: tuner, pull: [0.6, 2.4, -0.8], blockedBy: ['cover'],
        say: 'The tuner picks which channel you watch. The channel knob turns it.',
        breaks: 'Without the tuner, the TV can\'t find any channel. Just snow!',
        fact: 'Each channel comes in on its own invisible wave. Turning the knob tells the tuner which wave to listen to.',
        symptom: 'The screen is all fuzzy snow, and it goes shhhh.' },
      { id: 'speaker', name: 'Speaker', obj: speaker, pull: [2.2, -0.35, -2.6], blockedBy: ['cover'],
        say: 'The speaker makes sound by wiggling back and forth really fast.',
        breaks: 'Now the TV is quiet. The picture still works!',
        fact: 'Put your hand on a speaker when music plays and you can feel it buzz.',
        symptom: 'The picture works, but there is no sound at all.' },
      { id: 'flyback', name: 'Flyback transformer', obj: fly, pull: [-1.0, 0.4, -3.0], blockedBy: ['cover'],
        say: 'The flyback makes super strong electricity for the picture tube. The red wire carries it.',
        breaks: 'The screen went dark! The tube needs that super strong electricity to glow. You can still hear the show though.',
        fact: 'It turns the electricity from the wall into about 25,000 volts! That\'s why TV fixers are so careful.',
        symptom: 'You can hear the show, but the screen is dark.' },
      { id: 'yoke', name: 'Deflection yoke', obj: yoke, pull: [0, 2.4, -1.4], blockedBy: ['cover'],
        say: 'These copper coils are magnets that steer the beam up, down and side to side.',
        breaks: 'Without the steering magnets, the beam only hits one spot. Just a tiny bright dot!',
        fact: 'The beam paints the whole picture one line at a time, about 15,000 lines every second. Your eyes are too slow to notice!',
        symptom: 'There is only one tiny bright dot in the middle of the screen.' },
      { id: 'gun', name: 'Electron gun', obj: gun, pull: [0, 3.4, -2.6], blockedBy: ['cover'],
        say: 'The electron gun shoots tiny invisible bits called electrons at the screen.',
        breaks: 'No gun, no beam. The screen goes dark!',
        fact: 'It really has three guns: one for red, one for green and one for blue. Every color you see on the screen is made from those three.',
        symptom: 'You can hear the show, but the screen is dark.' },
      { id: 'board', name: 'Main circuit board', obj: board, pull: [0, 0, -5.2], blockedBy: ['cover'],
        say: 'This is the TV\'s brain. It tells all the other parts what to do.',
        breaks: 'No brain, no TV! The picture and the sound both stop.',
        fact: 'The little bumps are parts called resistors, capacitors and chips. Electricity zooms between them on thin copper roads.',
        symptom: 'It turns on, but there is no picture and no sound.' },
      { id: 'tube', name: 'Picture tube', obj: tube, pull: [-5.8, 0.1, -0.4], blockedBy: ['cover', 'yoke', 'gun', 'flyback'],
        say: 'The big glass picture tube! The front of it is the screen.',
        breaks: 'The screen is gone! There\'s nothing to make a picture on.',
        fact: 'There is no air inside the tube at all. The back of the screen is painted with tiny dots that glow when the electrons hit them.' },
    ];
    return { root, shell: [shell], parts, screen: scr, refs: { knob } };
  },

  evaluate(has, on) {
    if (!on) return { alive: false, screen: { mode: 'off' }, sound: {} };
    if (!has('cord')) return { alive: false, reason: "It's not plugged in! Put the power cord back.", screen: { mode: 'off' }, sound: {} };
    if (!has('board')) return { alive: true, reason: "The main circuit board is missing. That's the TV's brain, so nothing works.", screen: { mode: 'black' }, sound: {} };
    const signal = has('antenna') && has('tuner');
    let mode;
    if (!has('tube')) mode = 'off';
    else if (!has('flyback') || !has('gun')) mode = 'black';
    else if (!has('yoke')) mode = 'dot';
    else mode = signal ? 'picture' : 'snow';
    const spk = has('speaker');
    return { alive: true, screen: { mode }, sound: { show: signal && spk, hiss: !signal && spk } };
  },
});
