/* Old tube (CRT) TV. Beginner 10 pieces, Medium 21, Advanced 45.
 * Coordinates: x right, y up, +z is the front of the TV. */
TAL.registerDevice({
  id: 'crt-tv',
  name: 'Old Tube TV',
  short: 'TV',
  subtitle: 'The big boxy kind from long ago',
  screenStyle: 'crt',
  screenPart: 'tube',
  channelPart: 'chKnob',
  powerSound: 'crt',
  channels: true,
  view: { target: [0, 2.2, 0], radius: 3.7, explodedRadius: 7.6, explodedY: 3.3, yaw: -0.55, pitch: 0.2, shadow: [5.2, 4.4] },
  intro: 'This is an old tube TV, the big boxy kind from long ago.',
  shellSay: "That's the wooden cabinet. It's the TV's outside shell, and everything else is hooked to it.",
  guide: [
    { do: 'power', say: "Hi, I'm Sparky! Let's take this TV apart together. First, press the green power button to turn it on.", nudge: 'Press the power button.' },
    { do: 'remove', ids: ['antenna'], say: 'See the rabbit ears on top? Pull them off with your finger and watch the screen!', nudge: 'Drag the rabbit ears off the top of the TV.' },
    { do: 'turn', side: 'back', say: "Now let's see the back. Tap the turn around button.", nudge: 'Tap the turn around button.' },
    { do: 'remove', ids: ['screw0', 'screw1', 'screw2', 'screw3'], say: 'Twist out the screws with your finger!', nudge: 'Pull out the glowing screw.' },
    { do: 'remove', ids: ['cover'], say: 'Now pull off the back cover. Careful, real ones can zap you!', nudge: 'Drag the back cover away.' },
    { do: 'remove', ids: ['yoke'], levels: [1, 2], say: 'Find the copper coils around the neck of the big glass tube. Pull them off!', nudge: 'Pull off the copper coils.' },
    { do: 'remove', ids: ['redGun'], levels: [3], say: 'Find the electron gun at the very back of the glass tube. Pull out the red one and watch the colors!', nudge: 'Pull out the red gun at the back of the tube.' },
    { do: 'remove', ids: ['vCoil'], levels: [3], say: 'Now find the copper ring around the neck of the tube. Pull it off and watch the screen!', nudge: 'Pull off the copper ring.' },
    { do: 'end', say: "Great job! Now you're the boss. Take apart anything you want!" },
  ],

  build(k) {
    const T = k.THREE;
    const root = k.group();
    const body = k.at(k.group(), 0, 0.55, 0); // the cabinet sits on short legs
    root.add(body);
    const wood = k.mat(0x8a5a2b, { roughness: 0.55 }), woodDark = k.mat(0x6a4220, { roughness: 0.6 }), trim = k.metal(0xd2bb8a, { roughness: 0.35 });
    const W = 4.4, H = 3.5, D = 3.6, TH = 0.15;
    const cx = -0.55, cy = 1.85, ow = 2.8, oh = 2.1; // screen opening
    const parts = [];
    const add = (spec) => { parts.push(spec); return spec; };
    // a piece that sits on another part: nested in its object, pulled relative to it
    const sub = (parentObj, parentId, spec) => { parentObj.add(spec.obj); spec.parent = parentId; return add(spec); };

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
    const tz = D / 2 + 0.02;
    shell.add(k.at(k.box(ow + 0.12, 0.06, 0.05, trim), cx, cy + oh / 2 + 0.03, tz));
    shell.add(k.at(k.box(ow + 0.12, 0.06, 0.05, trim), cx, cy - oh / 2 - 0.03, tz));
    shell.add(k.at(k.box(0.06, oh, 0.05, trim), cx - ow / 2 - 0.03, cy, tz));
    shell.add(k.at(k.box(0.06, oh, 0.05, trim), cx + ow / 2 + 0.03, cy, tz));
    const px = W / 2 - rightW / 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      shell.add(k.at(k.box(0.03, 0.03, 0.02, trim), px + Math.sin(a) * 0.4, 2.45 + Math.cos(a) * 0.4, D / 2 + 0.01));
    }
    for (let i = 0; i < 7; i++) shell.add(k.at(k.box(0.95, 0.05, 0.03, trim), px, 0.6 + i * 0.11, D / 2 + 0.01));
    shell.add(k.at(k.box(0.8, 0.06, 0.8, k.metal(0x8d9196)), -1.7, 0.74, -1.0));

    // ---- knobs
    const knobInner = k.group(
      k.rot(k.cyl(0.27, 0.3, 0.2, k.mat(0x2a2522, { roughness: 0.4 }), 28), Math.PI / 2, 0, 0),
      k.at(k.box(0.06, 0.24, 0.06, trim), 0, 0.12, 0.1)
    );
    const chKnob = k.at(k.group(knobInner), px, 2.45, D / 2 + 0.1);
    body.add(chKnob);
    add({ id: 'chKnob', name: 'Channel knob', obj: chKnob, pull: [1.3, 0.3, 1.5], level: 2, face: [0, 0, 1],
      say: 'The channel knob! Turn it to pick a different show.', fact: 'Old TVs had about 13 channels. You clicked the knob around to find them.' });
    const volKnob = k.at(k.group(k.rot(k.cyl(0.16, 0.18, 0.14, k.mat(0x2a2522), 24), Math.PI / 2, 0, 0)), px, 1.8, D / 2 + 0.07);
    body.add(volKnob);
    add({ id: 'volKnob', name: 'Volume knob', obj: volKnob, pull: [1.3, -0.3, 1.5], level: 2, face: [0, 0, 1],
      say: 'The volume knob makes the sound louder or quieter.' });

    // ---- legs
    [[-1.8, 1.3], [1.8, 1.3], [-1.8, -1.3], [1.8, -1.3]].forEach(([x, z], i) => {
      const leg = k.at(k.group(k.cyl(0.09, 0.05, 0.55, woodDark, 12)), x, -0.275, z);
      body.add(leg);
      add({ id: 'leg' + i, name: 'Wooden leg', obj: leg, pull: [Math.sign(x) * 1.2, 0, Math.sign(z) * 1.2], level: 3, face: [0, 1, 0],
        say: 'A wooden leg. The TV still works without it, it just sits lower.' });
    });

    // ---- antenna (rabbit ears)
    const dome = k.sphere(0.3, k.mat(0x1b1b1b, { roughness: 0.3 }));
    dome.scale.y = 0.5;
    const ant = k.group(dome);
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
    add({ id: 'antenna', name: 'Antenna', obj: ant, pull: [0, 1.8, 0],
      say: 'These are the rabbit ears! They catch TV signals flying through the air.',
      breaks: "Now the TV can't catch the show, so all you see is fuzzy snow!",
      fact: 'TV shows used to travel through the air as invisible radio waves. The antenna catches them, a bit like a net catches fish.',
      symptom: 'The screen is all fuzzy snow, and it goes shhhh.' });

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
    const screwIds = [];
    [[-1.95, H / 2 + 1.55], [1.95, H / 2 + 1.55], [-1.95, H / 2 - 1.55], [1.95, H / 2 - 1.55]].forEach(([x, y], i) => {
      const s = k.screw();
      k.rot(k.at(s, x, y, -D / 2 - 0.06), -Math.PI / 2, 0, 0);
      body.add(s);
      screwIds.push('screw' + i);
      add({ id: 'screw' + i, name: 'Screw', kind: 'screw', obj: s, pull: [0, 0, -0.9], level: i === 0 || i === 3 ? 1 : 2, fuse: 'cover',
        say: 'A screw! Lefty loosey, righty tighty.' });
    });
    add({ id: 'cover', name: 'Back cover', obj: cover, xray: true, pull: [6.6, 0, -0.6], blockedBy: screwIds, face: [0, 0, -1],
      say: 'The back cover keeps fingers away from the zappy parts inside.',
      fact: 'A real old TV can keep a big zap of electricity inside even when it is unplugged. Only open a real one with a grown-up who knows how!' });

    // ---- power cord
    const black = k.mat(0x151515, { roughness: 0.5 });
    const cord = k.group(
      k.tube([[-1.7, 0.45, -1.86], [-1.8, 0.15, -2.2], [-1.95, -0.48, -2.5], [-2.6, -0.5, -2.9], [-3.3, -0.5, -3.0]], 0.045, black),
      k.at(k.box(0.35, 0.2, 0.26, black), -3.5, -0.45, -3.0),
      k.at(k.box(0.14, 0.04, 0.02, k.metal(0xd8c48a)), -3.74, -0.45, -2.95),
      k.at(k.box(0.14, 0.04, 0.02, k.metal(0xd8c48a)), -3.74, -0.45, -3.05)
    );
    body.add(cord);
    add({ id: 'cord', name: 'Power cord', obj: cord, pull: [-1.3, 0, -1.3], noSpark: true,
      say: 'This is the power cord. It brings electricity from the wall.',
      breaks: 'Unplugged! No electricity, so everything turns off.',
      fact: 'Electricity flows through the metal wires inside the cord, like water through a hose.' });

    // ---- picture tube (the screen is part of it)
    const tube = k.at(k.group(), cx, cy, 0);
    tube.add(k.at(k.box(ow + 0.3, oh + 0.3, 0.45, k.mat(0x1c2420, { roughness: 0.2, metalness: 0.3 })), 0, 0, D / 2 - TH - 0.25));
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
    tube.add(k.at(k.box(ow + 0.34, oh + 0.34, 0.08, k.metal(0x7d8186)), 0, 0, 1.2));
    body.add(tube);
    add({ id: 'tube', name: 'Picture tube', obj: tube, pull: [-5.8, 0.1, -0.4], blockedBy: ['cover', 'yoke', 'gun', 'flyback', 'degauss'], face: [0, 0, 1],
      say: 'The big glass picture tube! The front of it is the screen.',
      breaks: "The screen is gone! There's nothing to make a picture on.",
      fact: 'There is no air inside the tube at all. The back of the screen is painted with tiny dots that glow when the electrons hit them.' });

    // ---- degaussing coil (a loop of taped wire around the front of the tube)
    const loop = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      loop.push([cx + Math.sign(c) * Math.pow(Math.abs(c), 0.35) * 1.62, cy + Math.sign(s) * Math.pow(Math.abs(s), 0.35) * 1.3, 1.02]);
    }
    const degauss = k.group(k.tube(loop, 0.045, k.mat(0x1d1d1d, { roughness: 0.7 }), true));
    body.add(degauss);
    add({ id: 'degauss', name: 'Degaussing coil', obj: degauss, pull: [-5.8, -0.5, -2.4], blockedBy: ['cover'], level: 2, fuse: 'tube', face: [0, 0, 1],
      say: 'This loop of wire is the degaussing coil. Every time the TV turns on, it shakes out stray magnets so the colors stay clean.',
      breaks: 'Now the colors are blotchy, like a rainbow puddle!', breaksAlways: true,
      fact: 'Old TVs made a big BOING sound when you turned them on. That was this coil working!',
      symptom: 'Rainbow blotches of color are all over the picture.' });

    // ---- electron gun (inside the neck): base + red, green and blue guns + socket
    const gun = k.at(k.group(k.at(k.rot(k.cyl(0.14, 0.14, 0.12, k.metal(0xb7bcc3), 20), Math.PI / 2, 0, 0), 0, 0, 0.3)), cx, cy, -1.35);
    body.add(gun);
    add({ id: 'gun', name: 'Electron gun', obj: gun, pull: [0, 3.4, -2.6], blockedBy: ['cover'], level: 2, fuse: 'tube', face: [0, 0, -1], focusRadius: 0.9,
      say: 'The electron gun shoots tiny invisible bits called electrons at the screen.',
      breaks: 'No gun, no beam. The screen goes dark!',
      fact: 'It really has three guns: one for red, one for green and one for blue.',
      symptom: 'You can hear the show, but the screen is dark.' });
    const GUNS = [['redGun', 'Red gun', 0xff4a3d, 'red', 'Everything looks blue and green.'], ['greenGun', 'Green gun', 0x3ee08f, 'green', 'Everything looks pink and purple.'], ['blueGun', 'Blue gun', 0x4aa8ff, 'blue', 'Everything looks yellow.']];
    GUNS.forEach(([id, name, col, word, look], i) => {
      const a = (i / 3) * Math.PI * 2;
      const g = k.at(k.group(k.rot(k.cyl(0.045, 0.045, 0.55, k.metal(col, { roughness: 0.4 }), 12), Math.PI / 2, 0, 0)), Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0);
      sub(gun, 'gun', { id, name, obj: g, pull: [Math.cos(a) * 0.5, Math.sin(a) * 0.5 + 0.2, -0.4], level: 3, face: [0, 0, -1],
        say: `The ${word} gun shoots the electrons that light up the ${word} dots on the screen.`,
        breaks: `Now there's no ${word} in the picture! ${look}`,
        fact: 'Every color on the screen is mixed from red, green and blue light.',
        symptom: i === 0 ? 'The picture has no red in it. Everything looks blue and green.' : undefined });
    });
    const socket = k.at(k.group(k.rot(k.cyl(0.24, 0.24, 0.07, k.mat(0x2f7d4a), 24), Math.PI / 2, 0, 0)), 0, 0, -0.42);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; socket.add(k.at(k.box(0.025, 0.025, 0.14, k.metal(0xd8c48a)), Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.06)); }
    sub(gun, 'gun', { id: 'socket', name: 'Gun socket', obj: socket, pull: [0, -0.3, -0.6], level: 3, face: [0, 0, -1],
      say: 'The gun socket plugs the electron gun into the TV.', breaks: 'The gun lost its power. The screen went dark!' });

    // ---- deflection yoke: side-to-side coil + up-and-down ring on a plastic clamp
    const yoke = k.at(k.group(k.at(k.torus(0.3, 0.06, k.mat(0x222222)), 0, 0, -0.26), k.at(k.box(0.12, 0.2, 0.3, k.mat(0x222222)), 0, 0.45, 0)), cx, cy, -0.6);
    body.add(yoke);
    add({ id: 'yoke', name: 'Deflection yoke', obj: yoke, pull: [0, 2.4, -1.4], blockedBy: ['cover'], face: [0, 0, -1], focusRadius: 1,
      say: 'These copper coils are magnets that steer the beam up, down and side to side.',
      breaks: 'Without the steering magnets, the beam only hits one spot. Just a tiny bright dot!',
      fact: 'The beam paints the whole picture one line at a time, about 15,000 lines every second. Your eyes are too slow to notice!',
      symptom: 'There is only one tiny bright dot in the middle of the screen.' });
    const yg = new T.CylinderGeometry(0.28, 0.58, 0.48, 28, 1, true);
    yg.rotateX(-Math.PI / 2);
    const hCoil = k.group(k.mesh(yg, k.mat(0xc8743a, { metalness: 0.8, roughness: 0.35, side: T.DoubleSide })));
    sub(yoke, 'yoke', { id: 'hCoil', name: 'Side-to-side coil', obj: hCoil, pull: [0.9, 0.3, -0.4], level: 3, face: [0, 0, -1],
      say: 'This big copper coil steers the beam side to side.',
      breaks: "Without it the beam can't go sideways. Just a tall line!",
      symptom: 'There is only a tall line down the middle of the screen.' });
    const vCoil = k.at(k.group(k.torus(0.58, 0.05, k.metal(0xc8743a, { roughness: 0.35 }))), 0, 0, 0.24);
    sub(yoke, 'yoke', { id: 'vCoil', name: 'Up-and-down coil', obj: vCoil, pull: [-0.9, 0.3, 0.4], level: 3, face: [0, 0, -1],
      say: 'This copper ring steers the beam up and down.',
      breaks: "Without it the beam can't go up and down. Just a flat line across the middle!",
      symptom: 'There is only a flat line across the middle of the screen.' });

    // ---- flyback transformer + high-voltage wire + focus knob
    const fly = k.at(k.group(k.box(0.7, 0.22, 0.7, k.mat(0x4a3424)), k.at(k.cyl(0.26, 0.28, 0.55, k.mat(0x111111, { roughness: 0.35 }), 24), 0, 0.38, 0)), -1.6, 0.92, -1.0);
    body.add(fly);
    add({ id: 'flyback', name: 'Flyback transformer', obj: fly, pull: [-1.0, 0.4, -3.0], blockedBy: ['cover'], face: [0, 1, 0], focusRadius: 1.4,
      say: 'The flyback makes super strong electricity for the picture tube.',
      breaks: 'The screen went dark! The tube needs that super strong electricity to glow. You can still hear the show though.',
      fact: 'It turns the electricity from the wall into about 25,000 volts! That is why TV fixers are so careful.',
      symptom: 'You can hear the show, but the screen is dark.' });
    const anode = k.group(
      k.tube([[0, 0.66, 0], [0.1, 1.25, 0.4], [0.6, 1.92, 1.1], [1.05, 1.86, 1.5]], 0.045, k.mat(0xd8261f, { roughness: 0.4 })),
      k.at(k.cyl(0.05, 0.16, 0.08, k.mat(0x1b1b1b), 18), 1.05, 1.82, 1.5)
    );
    sub(fly, 'flyback', { id: 'anode', name: 'High-voltage wire', obj: anode, pull: [0.5, 0.8, 0.2], level: 3, face: [0, 1, 0],
      say: 'The thick red wire carries super strong electricity to the tube. The suction cup holds it on.',
      breaks: 'The screen went dark!', fact: 'TV fixers use a special tool to drain this wire before they touch anything.' });
    const focusKnob = k.at(k.group(k.rot(k.cyl(0.06, 0.06, 0.08, k.mat(0x777777), 12), Math.PI / 2, 0, 0)), 0.12, 0.45, 0.28);
    sub(fly, 'flyback', { id: 'focusKnob', name: 'Focus knob', obj: focusKnob, pull: [0.3, 0.3, 0.6], level: 3, face: [0, 0, 1],
      say: 'The focus knob makes the picture sharp.', breaks: 'Now everything is blurry!', symptom: 'The picture is all blurry.' });

    // ---- tuner (behind the channel knob)
    const tuner = k.at(k.group(k.box(0.6, 0.6, 0.75, k.metal(0xb9bec6, { roughness: 0.45 }))), px, 2.45, 1.0);
    tuner.add(k.at(k.rot(k.cyl(0.04, 0.04, 0.5, k.metal(0xd0d4da), 10), Math.PI / 2, 0, 0), 0, 0, 0.6));
    for (let i = 0; i < 3; i++) tuner.add(k.at(k.box(0.5, 0.04, 0.02, k.metal(0x8f949b)), 0, -0.15 + i * 0.15, -0.38));
    body.add(tuner);
    add({ id: 'tuner', name: 'Tuner', obj: tuner, pull: [0.6, 2.4, -0.8], blockedBy: ['cover'], level: 2,
      say: 'The tuner picks which channel you watch. The channel knob turns it.',
      breaks: "Without the tuner, the TV can't find any channel. Just snow!",
      fact: 'Each channel comes in on its own invisible wave. Turning the knob tells the tuner which wave to listen to.',
      symptom: 'The screen is all fuzzy snow, and it goes shhhh.' });

    // ---- speaker: frame, cone, magnet
    const speaker = k.at(k.group(k.at(k.torus(0.41, 0.03, k.metal(0x55595f)), 0, 0, 0.13)), px, 0.95, 1.38);
    body.add(speaker);
    add({ id: 'speaker', name: 'Speaker', obj: speaker, pull: [2.2, -0.35, -2.6], blockedBy: ['cover'], face: [0, 0, -1], focusRadius: 0.9,
      say: 'The speaker makes sound by wiggling back and forth really fast.',
      breaks: 'Now the TV is quiet. The picture still works!',
      fact: 'Put your hand on a speaker when music plays and you can feel it buzz.',
      symptom: 'The picture works, but there is no sound at all.' });
    const sg = new T.CylinderGeometry(0.4, 0.13, 0.26, 28, 1, true);
    sg.rotateX(Math.PI / 2);
    sub(speaker, 'speaker', { id: 'cone', name: 'Speaker cone', obj: k.group(k.mesh(sg, k.mat(0x3a3530, { side: T.DoubleSide, roughness: 0.9 })), k.sphere(0.07, k.mat(0x222222))), pull: [0, 0.6, 0.3], level: 3, face: [0, 0, 1],
      say: 'The cone wiggles super fast. That pushes the air, and the air carries the sound to your ears.', breaks: 'The sound stopped!' });
    sub(speaker, 'speaker', { id: 'magnet', name: 'Magnet', obj: k.at(k.group(k.rot(k.cyl(0.16, 0.16, 0.18, k.metal(0x8a8f96), 20), Math.PI / 2, 0, 0)), 0, 0, -0.2), pull: [0, -0.5, -0.5], level: 3, face: [0, 0, -1],
      say: 'A strong magnet! It pushes and pulls the cone to make sound.', breaks: 'The sound stopped!', fact: 'Every speaker, even in headphones, has a magnet inside.' });

    // ---- main circuit board (slides out the back like a drawer) and its parts
    const board = k.board(3.6, 2.2, { seed: 11, count: 30 });
    board.add(k.at(k.cyl(0.14, 0.14, 0.35, k.mat(0x1f3c8f), 20), 1.6, 0.2, 0.6));
    k.at(board, 0, 0.2, -0.5);
    body.add(board);
    add({ id: 'board', name: 'Main circuit board', obj: board, pull: [0, 0, -5.2], blockedBy: ['cover'], face: [0, 1, 0], focusRadius: 2.4,
      say: "This is the TV's brain. It tells all the other parts what to do.",
      breaks: 'No brain, no TV! The picture and the sound both stop.',
      fact: 'The little bumps are parts called resistors, capacitors and chips. Electricity zooms between them on thin copper roads.',
      symptom: 'It turns on, but there is no picture and no sound.' });
    const B = (spec) => { k.at(spec.obj, spec.at[0], 0.025, spec.at[1]); spec.pull = spec.pull || [spec.at[0] * 0.25, 0.9, spec.at[1] * 0.25]; spec.face = [0, 1, 0]; delete spec.at; return sub(board, 'board', spec); };
    const OFF = 'The TV turned off!';
    B({ id: 'bigcapC', name: 'Big capacitor', obj: k.group(k.at(k.cyl(0.2, 0.2, 0.5, k.mat(0x1f3c8f), 20), 0, 0.25, 0), k.at(k.cyl(0.19, 0.19, 0.01, k.metal(0xc9ced6), 20), 0, 0.505, 0)), at: [1.2, 0.6], level: 2,
      say: 'A big capacitor stores electricity like a little water tank.', breaks: OFF, fact: 'Big capacitors in old TVs can hold a zap long after unplugging.' });
    const sink = k.group();
    for (let i = 0; i < 6; i++) sink.add(k.at(k.box(0.04, 0.3, 0.5, k.metal(0xb0b6bd)), i * 0.08 - 0.2, 0.15, 0));
    B({ id: 'heatsinkC', name: 'Heat sink', obj: sink, at: [-1.1, 0.5], level: 2,
      say: "The heat sink's metal fins carry heat away, like a dog panting to cool off.", breaks: 'The power part got too hot, so the TV turned off to stay safe.' });
    B({ id: 'transistorC', name: 'Power transistor', obj: k.group(k.at(k.box(0.22, 0.28, 0.08, 0x1b1b1b), 0, 0.14, 0), k.at(k.box(0.22, 0.12, 0.02, k.metal(0xc9ced6)), 0, 0.33, 0)), at: [-1.1, 0.85], blockedBy: ['heatsinkC'], level: 2,
      say: 'This power transistor is a super fast switch for the power.', breaks: OFF });
    B({ id: 'fuseC', name: 'Fuse', obj: k.group(k.at(k.rot(k.cyl(0.05, 0.05, 0.3, k.glass(0xdff3ff, 0.45), 14), 0, 0, Math.PI / 2), 0, 0.08, 0), k.at(k.rot(k.cyl(0.055, 0.055, 0.06, k.metal(0xc9ced6), 14), 0, 0, Math.PI / 2), 0.15, 0.08, 0), k.at(k.rot(k.cyl(0.055, 0.055, 0.06, k.metal(0xc9ced6), 14), 0, 0, Math.PI / 2), -0.15, 0.08, 0)), at: [1.4, -0.7], level: 2,
      say: 'The fuse is a safety guard. If too much electricity rushes in, its tiny wire melts so nothing catches fire.', breaks: 'No fuse, no power. ' + OFF,
      symptom: 'It will not turn on at all.' });
    B({ id: 'jungle', name: 'Color chip', obj: k.group(k.at(k.box(0.5, 0.06, 0.24, 0x18181b), 0, 0.03, 0)), at: [-0.3, -0.2], level: 3,
      say: 'The color chip figures out all the colors in the show.', breaks: 'The colors are gone! Only black and white.', symptom: 'The picture is only black and white.' });
    B({ id: 'soundChip', name: 'Sound chip', obj: k.group(k.at(k.box(0.3, 0.06, 0.2, 0x18181b), 0, 0.03, 0)), at: [0.5, -0.5], level: 3,
      say: 'The sound chip makes the sound strong enough for the speaker.', breaks: 'The sound stopped!', symptom: 'The picture works, but there is no sound at all.' });
    [[-1.5, -0.7], [0.0, 0.7], [0.8, 0.2], [-0.6, 0.6]].forEach(([x, z], i) => B({ id: 'capC' + i, name: 'Small capacitor', obj: k.group(k.at(k.cyl(0.07, 0.07, 0.2, [0x2e8b57, 0x1b6fa8, 0x7a3fb0, 0x1d1d1d][i], 14), 0, 0.1, 0)), at: [x, z], level: 3,
      say: 'A small capacitor. It soaks up little bumps in the electricity.' }));
    [[0.2, -0.85], [0.45, -0.85], [-1.0, -0.5], [-1.0, -0.3]].forEach(([x, z], i) => {
      const r = k.group(k.at(k.rot(k.cyl(0.025, 0.025, 0.16, 0xd9b38c, 10), 0, 0, Math.PI / 2), 0, 0.04, 0));
      [0xc0392b, 0x8e44ad, 0x1b1b1b].forEach((c, j) => r.add(k.at(k.rot(k.cyl(0.027, 0.027, 0.014, c, 10), 0, 0, Math.PI / 2), -0.04 + j * 0.03, 0.04, 0)));
      B({ id: 'resC' + i, name: 'Resistor', obj: r, at: [x, z], level: 3,
        say: 'A resistor slows electricity down, like a narrow pipe slows water.', fact: 'The colored stripes are a secret code that tells how much it slows things down.' });
    });

    return { root, shell: [shell], parts, screen: scr, refs: { knob: knobInner } };
  },

  evaluate(has, on) {
    const off = { alive: false, screen: { mode: 'off' }, sound: {} };
    if (!on) return off;
    if (!has('cord')) return Object.assign(off, { reason: "It's not plugged in! Put the power cord back." });
    if (!has('fuseC')) return Object.assign(off, { reason: 'The fuse is missing, so no electricity gets in.' });
    if (!has('bigcapC')) return Object.assign(off, { reason: "A big capacitor is missing, so the power can't stay steady." });
    if (!has('transistorC') || !has('heatsinkC')) return Object.assign(off, { reason: 'A power part is missing or too hot, so the TV turned off to stay safe.' });
    if (!has('board')) return { alive: true, reason: "The main circuit board is missing. That's the TV's brain, so nothing works.", screen: { mode: 'black' }, sound: {} };
    const signal = has('antenna') && has('tuner');
    const r = has('redGun'), g = has('greenGun'), b = has('blueGun');
    const gunOK = has('gun') && has('socket') && (r || g || b);
    const hv = has('flyback') && has('anode');
    const scr = {};
    if (!has('tube')) scr.mode = 'off';
    else if (!hv || !gunOK) scr.mode = 'black';
    else if (!has('yoke') || (!has('hCoil') && !has('vCoil'))) scr.mode = 'dot';
    else if (!has('vCoil')) scr.mode = 'line';
    else if (!has('hCoil')) scr.mode = 'vline';
    else {
      scr.mode = signal ? 'picture' : 'snow';
      if (!(r && g && b)) scr.tint = '#' + [r, g, b].map((x) => (x ? 'ff' : '00')).join('');
      if (!has('degauss')) scr.blotch = true;
      if (!has('focusKnob')) scr.blur = true;
      if (!has('jungle')) scr.gray = true;
    }
    const spk = has('speaker') && has('magnet') && has('cone');
    return { alive: true, screen: scr, sound: { show: signal && spk && has('soundChip'), hiss: !signal && spk } };
  },
});
