/* Old tube (CRT) TV. Beginner 10 pieces, Medium 34, Advanced about 100.
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
  view: { target: [0, 2.2, 0], radius: 3.7, explodedRadius: 10, explodedY: 3.6, yaw: -0.55, pitch: 0.2, shadow: [5.2, 4.4] },
  intro: 'This is an old tube TV, the big boxy kind from long ago.',
  shellSay: "That's the wooden cabinet. It's the TV's outside shell, and everything else is hooked to it.",
  guide: [
    { do: 'power', say: "Hi, I'm Sparky! Let's take this TV apart together. First, press the green power button to turn it on.", nudge: 'Press the power button.' },
    { do: 'remove', ids: ['antenna'], say: 'See the rabbit ears on top? Pull them off with your finger and watch the screen!', nudge: 'Drag the rabbit ears off the top of the TV.' },
    { do: 'turn', side: 'back', say: "Now let's see the back. Tap the turn around button.", nudge: 'Tap the turn around button.' },
    { do: 'remove', ids: ['screw0', 'screw1', 'screw2', 'screw3'], say: 'Twist out the screws with your finger!', nudge: 'Pull out the glowing screw.' },
    { do: 'remove', ids: ['cover'], say: 'Now pull off the back cover. Careful, real ones can zap you!', nudge: 'Drag the back cover away.' },
    { do: 'remove', ids: ['yoke'], levels: [1, 2], say: 'Find the copper coils around the neck of the big glass tube. Pull them off!', nudge: 'Pull off the copper coils.' },
    { do: 'remove', ids: ['neckboard'], levels: [3], say: 'See the little green card plugged onto the very back of the glass tube? That is the neck board. Pull it off first!', nudge: 'Pull off the green card at the back of the tube.' },
    { do: 'remove', ids: ['redGun'], levels: [3], say: 'Find the electron gun at the very back of the glass tube. Pull out the red one and watch the colors!', nudge: 'Pull out the red gun at the back of the tube.' },
    { do: 'remove', ids: ['vCoil'], levels: [3], say: 'Now find the copper ring around the neck of the tube. Pull it off and watch the screen!', nudge: 'Pull off the copper ring.' },
    { do: 'end', say: "Great job! Now you're the boss. Take apart anything you want!" },
  ],

  build(k) {
    const T = k.THREE;
    const LV = (TAL.app && TAL.app.level) || 3; // only used to keep Medium/Advanced-only exterior bits off the lower levels
    const root = k.group();
    const body = k.at(k.group(), 0, 0.55, 0); // the cabinet sits on short legs
    root.add(body);
    // real wood grain: a canvas texture, mapped so the grain runs along each board
    const rnd = k.rng(5);
    const grainTex = (base, lines, knots) => {
      const t = k.canvasTex(512, 256, (c, w, h) => {
        c.fillStyle = base; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 70; i++) { // soft wide bands
          const y = rnd() * h;
          c.fillStyle = `rgba(${rnd() < 0.5 ? '60,30,10' : '210,160,100'},${0.04 + rnd() * 0.07})`;
          c.fillRect(0, y, w, 2 + rnd() * 9);
        }
        for (let i = 0; i < 150; i++) { // thin wavy grain lines
          const y0 = rnd() * h, amp = 1 + rnd() * 5, f = 0.005 + rnd() * 0.012, ph = rnd() * 6.3;
          c.strokeStyle = `rgba(${rnd() < 0.7 ? '50,24,8' : '230,185,120'},${0.08 + rnd() * 0.2})`;
          c.lineWidth = 0.6 + rnd() * 1.2;
          c.beginPath();
          for (let x = 0; x <= w; x += 8) { const y = y0 + Math.sin(x * f * 6.28 + ph) * amp; if (x) c.lineTo(x, y); else c.moveTo(x, y); }
          c.stroke();
        }
        for (let n = 0; n < knots; n++) { // a few knots, rings stretched along the grain
          const kx = 60 + rnd() * (w - 120), ky = 30 + rnd() * (h - 60);
          for (let r = 14; r > 1; r -= 2.5) { c.strokeStyle = `rgba(45,20,6,${0.28 - r * 0.012})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(kx, ky, r * 2.6, r * 0.8, 0, 0, 6.3); c.stroke(); }
        }
      });
      t.wrapS = t.wrapT = T.RepeatWrapping;
      return t;
    };
    const woodMat = k.mat(0xffffff, { map: grainTex('#8f5e2e', 150, 2), roughness: 0.55 });
    const woodDarkMat = k.mat(0xffffff, { map: grainTex('#6e4523', 150, 1), roughness: 0.6 });
    // a board whose texture scale follows its size (the texture covers about 4 x 2 units)
    const woodBox = (w, h, d, m) => {
      const g = new T.BoxGeometry(w, h, d), uv = g.attributes.uv;
      const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
      dims.forEach(([du, dv], f) => { for (let i = 0; i < 4; i++) { const j = f * 4 + i; uv.setXY(j, uv.getX(j) * du / 4, uv.getY(j) * dv / 2); } });
      return k.mesh(g, m);
    };
    const wood = woodMat, woodDark = woodDarkMat, trim = k.metal(0xd2bb8a, { roughness: 0.35 });
    const brassM0 = k.metal(0xd8c48a), blk = k.mat(0x18181b, { roughness: 0.45 }), chromeM = k.metal(0xc9ced6), copperM = k.metal(0xc8743a, { roughness: 0.35 }), ferriteM = k.mat(0x35363b, { roughness: 0.7 });
    const W = 4.4, H = 3.5, D = 3.6, TH = 0.15;
    const cx = -0.55, cy = 1.85, ow = 2.8, oh = 2.1; // screen opening
    const parts = [];
    const add = (spec) => { parts.push(spec); return spec; };
    // a piece that sits on another part: nested in its object, pulled relative to it
    const sub = (parentObj, parentId, spec) => { parentObj.add(spec.obj); spec.parent = parentId; return add(spec); };

    // ---- cabinet (not removable)
    const shell = k.group();
    body.add(shell);
    shell.add(k.at(woodBox(W, TH, D, wood), 0, H - TH / 2, 0));
    shell.add(k.at(woodBox(W, TH, D, wood), 0, TH / 2, 0));
    shell.add(k.at(woodBox(TH, H, D, wood), -W / 2 + TH / 2, H / 2, 0));
    shell.add(k.at(woodBox(TH, H, D, wood), W / 2 - TH / 2, H / 2, 0));
    const fz = D / 2 - TH / 2, topH = H - (cy + oh / 2), botH = cy - oh / 2;
    const leftW = cx - ow / 2 + W / 2, rightW = W / 2 - (cx + ow / 2);
    shell.add(k.at(woodBox(W, topH, TH, woodDark), 0, H - topH / 2, fz));
    shell.add(k.at(woodBox(W, botH, TH, woodDark), 0, botH / 2, fz));
    shell.add(k.at(woodBox(leftW, oh, TH, woodDark), -W / 2 + leftW / 2, cy, fz));
    shell.add(k.at(woodBox(rightW, oh, TH, woodDark), W / 2 - rightW / 2, cy, fz));
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
      say: 'The channel knob! Turn it to pick a different show.',
      breaks: 'Now the channel is stuck on this show. The knob is how you pick a different one!', breaksAlways: true, fact: 'Old TVs had a big clunky knob. You clicked it around to find each channel.' });
    const volKnob = k.at(k.group(k.rot(k.cyl(0.16, 0.18, 0.14, k.mat(0x2a2522), 24), Math.PI / 2, 0, 0)), px, 1.8, D / 2 + 0.07);
    body.add(volKnob);
    add({ id: 'volKnob', name: 'Volume knob', obj: volKnob, pull: [1.3, -0.3, 1.5], level: 2, face: [0, 0, 1],
      say: 'The volume knob makes the sound louder or quieter.',
      breaks: 'Now nobody can turn the sound up, so the TV stays quiet!' });
    // power button (Medium and Advanced only)
    const pbtn = k.group(k.rbox(0.26, 0.13, 0.1, k.mat(0x24201d, { roughness: 0.4 }), 0.02), k.at(k.cyl(0.018, 0.018, 0.02, k.mat(0xd8261f), 10), 0.07, 0, 0.055));
    pbtn.children[1].rotation.x = Math.PI / 2;
    k.at(pbtn, px, 1.42, D / 2 + 0.08);
    if (LV >= 2) body.add(pbtn);
    add({ id: 'powerBtn', name: 'Power button', obj: pbtn, pull: [1.3, -0.5, 1.5], level: 2, face: [0, 0, 1],
      say: 'The power button! Push it and the TV wakes up or goes to sleep.',
      breaks: 'No power button, so the TV cannot be switched on. It turned off!', breaksAlways: true,
      learn: ['A switch is like a drawbridge. Push the button and the bridge comes down so electricity can walk across.', 'Inside, two metal contacts touch when you push, and the electricity can flow through them. Push again and a spring pulls them apart, which opens the bridge.', 'The power switch sits right in the path from the wall, so it has to handle the full power of the TV. That is why its contacts are strong and its spring is firm.'],
      symptom: 'It will not turn on at all, even when you push the power button.' });
    // volume potentiometer: hides behind the volume knob
    const volPot = k.at(k.group(k.rot(k.cyl(0.09, 0.09, 0.2, k.metal(0xb7bcc3), 14), Math.PI / 2, 0, 0), k.at(k.rot(k.cyl(0.02, 0.02, 0.2, k.metal(0xd0d4da), 8), Math.PI / 2, 0, 0), 0, 0, 0.2)), 0, 0, -0.28);
    for (let i = 0; i < 3; i++) volPot.add(k.at(k.box(0.025, 0.06, 0.02, brassM0), -0.05 + i * 0.05, -0.1, -0.12));
    sub(volKnob, 'volKnob', { id: 'volPot', name: 'Volume potentiometer', obj: volPot, pull: [0, -0.2, -0.7], level: 3, face: [0, 0, -1],
      say: 'This sits behind the volume knob. Turning the knob slides a little contact that sets how loud the sound is.',
      breaks: 'No volume control, so the sound cannot get through. The TV is quiet!',
      learn: ['It works like a faucet for sound. Turn it one way and more sound flows, turn it the other way and less flows.', 'Inside is a strip that resists electricity, with a little slider touching it. Moving the slider changes how much of the sound signal gets through.', 'It is a potentiometer, a variable resistor used as a voltage divider. The slider picks off a fraction of the signal. Audio ones are often shaped so the loudness feels even all the way around the turn.'],
      symptom: 'The picture is fine, but the sound never comes out, even with the volume knob turned up.' });

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
    add({ id: 'cover', name: 'Back cover', obj: cover, xray: true, pull: [6.6, 0, -0.6], blockedBy: screwIds, reach: [], face: [0, 0, -1],
      say: 'The back cover keeps fingers away from the zappy parts inside.',
      fact: 'A real old TV can keep a big zap of electricity inside even when it is unplugged. Only open a real one with a grown-up who knows how!' });

    // back panel: antenna terminals and AV jacks sit on the cover
    const terms = k.group(k.box(0.5, 0.3, 0.04, k.mat(0x3a3530)));
    [-0.12, 0.12].forEach((x) => { terms.add(k.at(k.rot(k.cyl(0.055, 0.055, 0.08, brassM0, 10), Math.PI / 2, 0, 0), x, 0, -0.05)); });
    k.at(terms, 1.3, -0.9, -0.05);
    sub(cover, 'cover', { id: 'terms', name: 'Antenna terminals', obj: terms, pull: [0.5, -0.4, -0.7], level: 3, face: [0, 0, -1],
      say: 'Two screws on the back where an antenna wire can connect.',
      job: 'It is another place to hook up an antenna wire. The rabbit ears still work without it.',
      learn: ['Think of it as a front door for the TV signal. The antenna wire knocks here to get in.', 'Two screws hold the ends of a flat wire. The signal runs from there to the tuner inside.', 'Old sets used a flat twin wire of about 300 ohms. Later ones used a round connector. Either way the job is to pass a weak radio signal in with as little loss as possible.'] });
    const avj = k.group(k.box(0.9, 0.3, 0.04, k.mat(0x3a3530)));
    [[0xf2c230, -0.3], [0xf2f2f2, 0], [0xd8261f, 0.3]].forEach(([c, x]) => { avj.add(k.at(k.rot(k.cyl(0.06, 0.06, 0.1, k.metal(c, { roughness: 0.4 }), 12), Math.PI / 2, 0, 0), x, 0, -0.06)); });
    k.at(avj, -1.3, -0.9, -0.05);
    sub(cover, 'cover', { id: 'avjacks', name: 'AV jacks', obj: avj, pull: [-0.5, -0.4, -0.7], level: 3, face: [0, 0, -1],
      say: 'Round plug holes for a game or video player. Yellow is for the picture, and white and red are for sound.',
      job: 'It is only for plugging in a game or video player.',
      learn: ['Think of three little mail slots. One takes pictures, the other two take sound.', 'Yellow carries the picture. White carries the left sound and red carries the right sound.', 'These are RCA jacks. Each one has a center pin for the signal and an outer ring for the ground, so the signal stays clean as it travels from the player into the TV.'] });

    // ---- power cord
    const black = k.mat(0x151515, { roughness: 0.5 });
    const cord = k.group(
      k.tube([[-1.7, 0.45, -1.86], [-1.8, 0.15, -2.2], [-1.95, -0.48, -2.5], [-2.6, -0.5, -2.9], [-3.3, -0.5, -3.0]], 0.045, black),
      k.at(k.box(0.35, 0.2, 0.26, black), -3.5, -0.45, -3.0),
      k.at(k.box(0.14, 0.04, 0.02, k.metal(0xd8c48a)), -3.74, -0.45, -2.95),
      k.at(k.box(0.14, 0.04, 0.02, k.metal(0xd8c48a)), -3.74, -0.45, -3.05)
    );
    body.add(cord);
    const relief = k.at(k.rot(k.cyl(0.09, 0.07, 0.24, black, 10), Math.PI / 2, 0, 0), -1.7, 0.45, -1.95);
    cord.add(relief);
    add({ id: 'relief', name: 'Strain relief', obj: relief, pull: [0, 0, -0.4], level: 3, face: [0, 0, -1], parent: 'cord',
      say: 'A rubber sleeve where the cord goes into the TV. It keeps the cord from bending sharply and breaking.',
      job: 'It only protects the cord from bending too sharply.',
      learn: ['Think of the stiff end on a phone charger cable. It stops a floppy cable from folding at one weak spot.', 'The rubber is firm near the TV and gets softer along the cord, so the bend spreads out instead of snapping in one place.', 'Cords last longer when the bend is spread over a longer length. Repeated sharp bends crack the copper strands inside, and that can make a cord hot or break.'] });
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
    add({ id: 'tube', name: 'Picture tube', obj: tube, pull: [-5.8, 0.1, -0.4], blockedBy: ['cover', 'yoke', 'gun', 'flyback', 'degauss', 'neckboard', 'strap', 'tubeBolt0', 'tubeBolt1', 'tubeBolt2', 'tubeBolt3'], reach: ['cover'], face: [0, 0, 1],
      say: 'The big glass picture tube! The front of it is the screen.',
      breaks: "The screen is gone! There's nothing to make a picture on.",
      fact: 'There is no air inside the tube at all. The back of the screen is painted with tiny dots that glow when the electrons hit them.' });

    // tube pieces: shadow mask, safety band, ground strap, mounting bolts
    const maskTex = k.canvasTex(256, 192, (c, w, h) => {
      c.fillStyle = '#9aa0a8'; c.fillRect(0, 0, w, h);
      for (let y = 4; y < h; y += 8) for (let x = 4 + ((y / 8) % 2) * 4; x < w; x += 8) c.clearRect(x - 1.6, y - 1.6, 3.2, 3.2);
    });
    const maskMat = k.mat(0xffffff, { map: maskTex, alphaTest: 0.5, side: T.DoubleSide, metalness: 0.5, roughness: 0.5 });
    sub(tube, 'tube', { id: 'mask', name: 'Shadow mask', obj: k.group(k.at(k.mesh(new T.PlaneGeometry(ow - 0.2, oh - 0.2), maskMat), 0, 0, 1.1)), pull: [0, 0.6, -1.4], blockedBy: ['tube'], level: 2, face: [0, 0, -1],
      say: 'A thin metal sheet with thousands of tiny holes, just behind the screen. It makes each beam hit only its own color of dots.',
      breaks: 'Without the holes, each beam hits every color of dot. The colors get all mixed up!', fact: 'There is a hole for every little group of red, green and blue dots.',
      learn: ['Think of a window screen with tiny holes. Each hole lets a beam through to just the right dots.', 'The three beams come in at slightly different angles. Because of the angles, each beam passes through a hole and reaches only the dots of its own color.', 'Older tubes use a steel sheet with a hole for every trio of dots. Later ones use slots. The sheet must stay flat and unmagnetized, which is why the degaussing coil is there.'],
      symptom: 'The colors are all mixed up, like a rainbow puddle.' });
    const bandM = k.metal(0x7d8186, { roughness: 0.4 });
    const band = k.group(
      k.at(k.box(ow + 0.5, 0.08, 0.3, bandM), 0, (oh + 0.5) / 2, 1.35), k.at(k.box(ow + 0.5, 0.08, 0.3, bandM), 0, -(oh + 0.5) / 2, 1.35),
      k.at(k.box(0.08, oh + 0.5, 0.3, bandM), (ow + 0.5) / 2, 0, 1.35), k.at(k.box(0.08, oh + 0.5, 0.3, bandM), -(ow + 0.5) / 2, 0, 1.35));
    sub(tube, 'tube', { id: 'band', name: 'Safety band', obj: band, pull: [0, 0, -1.8], level: 3, face: [0, 0, 1],
      say: 'A strong steel band around the edge of the glass. It helps keep the tube from shattering.',
      job: 'It only helps hold the glass strong and gives the tube a place to bolt on.',
      learn: ['Think of a belt around a barrel. It squeezes the front glass so it stays strong.', 'There is no air inside the tube, so the air outside pushes on all of the glass. A steel band around the front keeps it strong against that push.', 'A tube with no air inside is under constant pressure from the outside. The band puts the front glass under a little squeeze, and that helps it stay together if something hits it.'] });
    const strapM = k.metal(0xa9aeb5, { roughness: 0.5 });
    sub(tube, 'tube', { id: 'strap', name: 'Ground strap', obj: k.group(k.tube([[-1.0, -0.7, 0.0], [-0.4, -1.0, -0.2], [0.3, -1.35, -0.5], [0.5, -1.55, -0.6]], 0.03, strapM), k.at(k.box(0.14, 0.1, 0.1, strapM), -1.0, -0.7, 0.0)), pull: [0.6, -0.6, -0.8], level: 3, face: [0, 1, 0],
      say: 'A braided metal strap wrapped around the glass. It lets stray electricity drain safely away to the metal frame.',
      job: 'It only drains stray electricity away. Nothing looks different until a build-up of charge causes trouble.',
      learn: ['Think of a drain in a bathtub. Extra electricity runs away through the strap instead of piling up.', 'The outside of the glass has a coat of graphite paint. The strap connects that coat to the TV frame, which is the ground.', 'The coats inside and outside the glass, with the glass between, act like a big capacitor that smooths the very high voltage. That is why a tube can hold a charge for a while after it is switched off.'] });
    [[-1.62, 1.27], [1.62, 1.27], [-1.62, -1.27], [1.62, -1.27]].forEach(([x, y], i) => {
      const bolt = k.screw(0xa0a4ab, 0.25);
      k.rot(k.at(bolt, x, y, 1.28), -Math.PI / 2, 0, 0);
      bolt.scale.setScalar(0.8);
      sub(tube, 'tube', { id: 'tubeBolt' + i, name: 'Screw', kind: 'screw', obj: bolt, pull: [0, 0, -0.9], level: 3,
        say: 'A big bolt that holds one corner of the heavy tube to the cabinet.' });
    });

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
      sub(gun, 'gun', { id, name, obj: g, pull: [Math.cos(a) * 0.5, Math.sin(a) * 0.5 + 0.2, -0.4], blockedBy: ['neckboard'], level: 3, face: [0, 0, -1],
        say: `The ${word} gun shoots the electrons that light up the ${word} dots on the screen.`,
        breaks: `Now there's no ${word} in the picture! ${look}`,
        fact: 'Every color on the screen is mixed from red, green and blue light.',
        symptom: i === 0 ? 'The picture has no red in it. Everything looks blue and green.' : undefined });
    });
    const socket = k.at(k.group(k.rot(k.cyl(0.24, 0.24, 0.07, k.mat(0x2f7d4a), 24), Math.PI / 2, 0, 0)), 0, 0, -0.42);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; socket.add(k.at(k.box(0.025, 0.025, 0.14, k.metal(0xd8c48a)), Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.06)); }
    sub(gun, 'gun', { id: 'socket', name: 'Gun socket', obj: socket, pull: [0, -0.3, -0.6], blockedBy: ['neckboard'], level: 3, face: [0, 0, -1],
      say: 'The gun socket plugs the electron gun into the TV.', breaks: 'The gun lost its power. The screen went dark!' });

    // neck board: the little card plugged onto the back of the tube
    const nbM = k.mat(0x2f7d4a, { roughness: 0.7 });
    const nb = k.at(k.group(k.box(0.9, 1.1, 0.04, nbM)), 0, 0, -0.405);
    sub(gun, 'gun', { id: 'neckboard', name: 'Neck board', obj: nb, pull: [0, -0.2, -1.5], level: 2, face: [0, 0, -1], focusRadius: 0.9,
      say: 'The little green card on the very back of the tube. It plugs onto the gun and feeds it the picture.',
      breaks: 'The gun lost its picture signal. The screen went dark!', breaksAlways: true,
      fact: 'It sits at the very end of the tube so the picture signal has almost no distance to travel.',
      learn: ['Think of it as a relay station at the end of a long road. The picture arrives here and gets handed to the gun at the last moment.', 'It carries three small amplifiers, one for each color. They boost the weak picture signal so it can steer the beam of each gun.', 'The video amplifiers on the neck board change the voltage on each gun by many volts, fast enough to follow millions of dots a second. They sit right on the socket so the signal stays clean, and small spark gaps protect them from arcs inside the tube.'],
      symptom: 'You can hear the show, but the screen is dark and the back of the tube is not getting a picture.' });
    // little parts on the back of the neck board (their local +y is the back of the board)
    const back = (obj, x, y) => k.at(k.rot(k.group(obj), -Math.PI / 2, 0, 0), x, y, -0.02);
    const vamp = () => k.group(k.at(k.box(0.14, 0.18, 0.06, blk), 0, 0.09, 0), k.at(k.box(0.14, 0.08, 0.015, chromeM), 0, 0.2, -0.02));
    const VAMPS = [['vampR', 'red', -0.28, 'Everything looks blue and green.'], ['vampG', 'green', 0, 'Everything looks pink and purple.'], ['vampB', 'blue', 0.28, 'Everything looks yellow.']];
    VAMPS.forEach(([id, word, x, look], i) => {
      const o = back(vamp(), x, 0.32);
      o.userData.vamp = true;
      sub(nb, 'neckboard', { id, name: 'Video amp transistor', obj: o, pull: [x * 1.2, 0.5, -1.0 - i * 0.2], level: 3, face: [0, 0, -1],
        say: `This transistor makes the ${word} signal stronger before it goes into the gun.`,
        breaks: `Now the ${word} part of the picture is wrong! ${look}`,
        learn: ['It works like a megaphone for a whisper. The picture signal is tiny and the gun needs a big one.', 'There are three of them, one for red, one for green and one for blue. Each boosts its own color and gets warm because it works all the time.', 'A transistor uses a tiny control signal to steer a much bigger current, so the output is a bigger copy of the input. These are built to be fast and to handle the high voltage the tube wants.'],
        symptom: i === 0 ? 'The picture has a strange color cast, and the red looks wrong.' : undefined });
    });
    [[-0.3, -0.3], [0.3, -0.3]].forEach(([x, y], i) => {
      const r = k.group(k.at(k.rot(k.cyl(0.025, 0.025, 0.16, 0xd9b38c, 10), 0, 0, Math.PI / 2), 0, 0.04, 0));
      [0xc0392b, 0x8e44ad, 0x1b1b1b].forEach((c, j) => r.add(k.at(k.rot(k.cyl(0.027, 0.027, 0.014, c, 10), 0, 0, Math.PI / 2), -0.04 + j * 0.03, 0.04, 0)));
      sub(nb, 'neckboard', { id: 'nbRes' + i, name: 'Resistor', obj: back(r, x, y), pull: [x, y * 0.5, -0.8], level: 3, face: [0, 0, -1],
        say: 'A resistor slows electricity down, like a narrow pipe slows water.', fact: 'The colored stripes are a secret code that tells how much it slows things down.' });
    });
    sub(nb, 'neckboard', { id: 'nbCap', name: 'Small capacitor', obj: back(k.group(k.at(k.cyl(0.07, 0.07, 0.2, 0x7a3fb0, 14), 0, 0.1, 0)), 0, -0.4), pull: [0, -0.2, -0.8], level: 3, face: [0, 0, -1],
      say: 'A small capacitor. It soaks up little bumps in the electricity.' });
    const spark = k.group(k.at(k.cyl(0.07, 0.07, 0.05, k.mat(0x4a3a2a), 12), 0, 0.025, 0), k.at(k.box(0.02, 0.05, 0.02, chromeM), -0.03, 0.07, 0), k.at(k.box(0.02, 0.05, 0.02, chromeM), 0.03, 0.07, 0));
    sub(nb, 'neckboard', { id: 'spark', name: 'Spark gap', obj: back(spark, 0.3, -0.1), pull: [0.4, 0, -0.9], level: 3, face: [0, 0, -1],
      say: 'Two tiny metal points very close together. If a spark jumps inside the tube, it carries the zap away so the card stays safe.',
      job: 'It only protects the card from sparks. Nothing changes until a zap happens.',
      learn: ['Think of a lightning rod. A zap takes the easy path through the points instead of through the delicate parts.', 'The gap is so small that a big zap can jump across it, but the normal picture signal cannot. So it does nothing until trouble comes.', 'Spark gaps are cheap protection. When a sudden high voltage appears, the air between the points breaks down and carries the surge to ground, so the video amplifiers do not see the full jolt.'] });

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

    const ferrite = k.group(k.mesh((() => { const g = new T.CylinderGeometry(0.66, 0.66, 0.26, 24, 1, true); g.rotateX(-Math.PI / 2); return g; })(), k.mat(0x2b2b30, { roughness: 0.7, side: T.DoubleSide })));
    k.at(ferrite, 0, 0, 0.1);
    sub(yoke, 'yoke', { id: 'ferrite', name: 'Ferrite core', obj: ferrite, pull: [0, 0.8, 0.3], level: 3, face: [0, 0, -1],
      say: 'This dark ring helps the copper coils make a stronger magnet.',
      job: 'It only makes the coil magnets stronger and neater.',
      learn: ['Think of a funnel for magnet power. It gathers the push and aims it at the beam.', 'Ferrite is a dark ceramic that is easy to magnetize. It guides the magnetic field of the coil so little of it is wasted outside the neck.', 'Ferrite is an iron oxide ceramic that concentrates magnetic flux but hardly conducts electricity, so it wastes little energy even at the fast speeds the yoke runs at.'] });
    [90, 210, 330].forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const wedge = k.at(k.rot(k.box(0.1, 0.08, 0.2, k.mat(0x7a2b22, { roughness: 0.9 })), 0, 0, a), Math.cos(a) * 0.66, Math.sin(a) * 0.66, 0.36);
      sub(yoke, 'yoke', { id: 'wedge' + i, name: 'Rubber wedge', obj: wedge, pull: [Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.5], level: 3, face: [0, 0, -1],
        say: 'A little rubber wedge that keeps the coils snug on the glass so they do not wiggle.',
        job: 'It only keeps the coils from wobbling.',
        learn: ['Think of the little wedge you put under a wobbly door. It stops the wiggle.', 'Three rubber wedges squeeze between the coils and the glass. If the coils can tilt even a little, the picture tilts too.', 'The yoke is aligned during setup so the picture is straight and square. The wedges hold the yoke at that tilt, and a technician can loosen them to adjust it.'] });
    });
    const yc = k.group(k.tube([[0, -0.45, -0.05], [0.06, -0.8, -0.2], [0, -1.15, -0.4]], 0.03, k.mat(0x151515)), k.at(k.box(0.24, 0.12, 0.1, k.mat(0xe6e0d0)), 0, -1.2, -0.42));
    sub(yoke, 'yoke', { id: 'yokeCable', name: 'Yoke cable', obj: yc, pull: [0, -0.5, -0.6], level: 3, face: [0, 0, -1],
      say: 'These wires carry power from the brain board to the steering coils.',
      breaks: 'The coils get no power, so the beam stays in the middle. Just one bright dot!',
      learn: ['Think of a garden hose. The power runs along the wires to the coils, and the coils spray the beam where they want it.', 'The brain board makes a rising and falling push of current. The cable carries that push, many thousands of times a second, to the coils.', 'The cable joins the horizontal and vertical output circuits to the yoke coils through a plug. Large currents flow in it, which is why the plug must be firm. A loose plug makes the picture shrink or vanish.'],
      symptom: 'There is only one tiny bright dot in the middle of the screen, and the steering wires look loose.' });
    // purity and convergence rings: magnet rings clamped on the neck
    const ringM = k.mat(0x5b4a3a, { roughness: 0.7 });
    const ringset = k.at(k.group(k.torus(0.27, 0.022, k.metal(0xa9aeb5), 20), k.at(k.box(0.06, 0.06, 0.06, k.metal(0xa9aeb5)), 0, 0.3, 0)), 0, 0, -0.62);
    sub(yoke, 'yoke', { id: 'ringset', name: 'Magnet ring set', obj: ringset, pull: [0, 0.2, -1.2], level: 2, face: [0, 0, -1],
      say: 'Rings of tiny magnets on the neck of the tube. Twisting them nudges the beams so the colors land just right.',
      breaks: 'Now the colors are off. The picture is blotchy and blurry at the edges!', breaksAlways: true,
      learn: ['Think of tiny hands that nudge each beam a hair left or right until the colors line up.', 'The rings are small magnets. Twisting a ring slides the beams a little, so each one hits its own color of dots and all three land on the same spot.', 'They come in pairs that are twisted against each other. A pair of two-pole rings sets purity, and rings with more poles pull the beams together at the edges of the screen, which is called convergence.'] });
    [['purity', 'Purity ring', 0.07, 'This ring of magnet nudges the beams so each one hits only its own color of dots.', 'Now the colors are blotchy. Patches of the screen show the wrong color!', 'There are blotchy patches of the wrong color all over the picture.'],
     ['conv0', 'Convergence ring', 0, 'This ring lines up the red, green and blue beams so they land on the same spot.', 'The three colors drift apart, so the picture looks blurry with colored edges!', 'The picture is blurry, with red and blue ghosts at the edges.'],
     ['conv1', 'Convergence ring', -0.07, 'This ring helps line up the beams near the corners of the screen.', 'The colors drift apart at the edges, so the picture looks blurry with colored edges!', undefined]].forEach(([id, name, z, say, br, sy]) => {
      sub(ringset, 'ringset', { id, name, obj: k.at(k.torus(0.25, 0.034, ringM, 20), 0, 0, z), pull: [id === 'purity' ? 0.5 : id === 'conv0' ? -0.5 : 0.1, id === 'conv1' ? -0.6 : 0.5, id === 'conv1' ? -0.3 : 0.4], level: 3, face: [0, 0, -1],
        say, breaks: br, symptom: sy,
        learn: name === 'Purity ring'
          ? ['Think of a tiny hand nudging three beams together so they all go through the right holes.', 'The beams must come into the mask holes at just the right angle, or a beam lights the wrong color of dot. The ring magnet fixes that angle.', 'A pair of two-pole ring magnets, twisted against each other, makes a small steady magnetic field of any strength and direction. That moves all three beams together, which is how purity is set.']
          : ['Think of three kids trying to touch one spot on a wall. The ring nudges each one until they all hit it.', 'If the red, green and blue beams land in slightly different places, the picture shows colored edges. The ring pulls the beams back to the same spot.', 'Convergence is adjusted with rings that have four and six poles. They bend the beams toward or away from each other, and the technician twists them while watching a grid of dots.'] });
    });

    // ---- flyback transformer + high-voltage wire + focus knob
    const fly = k.at(k.group(k.box(0.7, 0.22, 0.7, k.mat(0x4a3424)), k.at(k.cyl(0.26, 0.28, 0.55, k.mat(0x111111, { roughness: 0.35 }), 24), 0, 0.38, 0)), -1.6, 0.92, -1.0);
    body.add(fly);
    add({ id: 'flyback', name: 'Flyback transformer', obj: fly, pull: [-1.0, 0.4, -3.0], blockedBy: ['cover'], face: [0, 1, 0], focusRadius: 1.4,
      say: 'The flyback makes super strong electricity for the picture tube.',
      breaks: 'The screen went dark! The tube needs that super strong electricity to glow. You can still hear the show though.',
      fact: 'It turns the electricity from the wall into about 25,000 volts! That is why TV fixers are so careful.',
      symptom: 'You can hear the show, but the screen is dark.' });
    const anode = k.group(
      k.tube([[0, 0.66, 0], [0.1, 1.25, 0.4], [0.6, 1.92, 1.1], [1.05, 1.86, 1.5]], 0.045, k.mat(0xd8261f, { roughness: 0.4 }))
    );
    sub(fly, 'flyback', { id: 'anode', name: 'High-voltage wire', obj: anode, pull: [0.5, 0.8, 0.2], level: 2, face: [0, 1, 0],
      say: 'The thick red wire carries super strong electricity to the tube. The suction cup holds it on.',
      breaks: 'The screen went dark!', fact: 'TV fixers use a special tool to drain this wire before they touch anything.' });
    sub(anode, 'anode', { id: 'anodeCap', name: 'Anode cap', obj: k.at(k.cyl(0.05, 0.16, 0.08, k.mat(0x1b1b1b), 18), 1.05, 1.82, 1.5), pull: [0.4, 0.5, 0.3], level: 3, face: [0, 1, 0],
      say: 'The big rubber suction cup. It plugs the super strong electricity wire into the side of the glass tube.',
      breaks: 'The super strong electricity cannot reach the tube, so the screen went dark!',
      learn: ['Think of the rubber cap on the end of a plunger. It sticks to the glass and keeps the electricity inside.', 'It plugs into a metal button on the glass. The rubber is thick, so the electricity cannot jump out and zap anything nearby.', 'The cap covers the anode button, where the high voltage enters the tube. Its shape is wide and deep to keep the electricity from arcing across the glass surface, and that is why it is pulled off with great care.'],
      symptom: 'You can hear the show, but the screen is dark, and the big rubber cap by the tube looks loose.' });
    const focusKnob = k.at(k.group(k.rot(k.cyl(0.06, 0.06, 0.08, k.mat(0x777777), 12), Math.PI / 2, 0, 0)), 0.12, 0.45, 0.28);
    sub(fly, 'flyback', { id: 'focusKnob', name: 'Focus knob', obj: focusKnob, pull: [0.3, 0.3, 0.6], level: 2, face: [0, 0, 1],
      say: 'The focus knob makes the picture sharp.', breaks: 'Now everything is blurry!', symptom: 'The picture is all blurry.' });

    // ---- tuner (behind the channel knob)
    const tuner = k.at(k.group(k.box(0.6, 0.6, 0.75, k.metal(0xb9bec6, { roughness: 0.45 }))), px, 2.45, 1.0);
    const shaft = k.at(k.rot(k.cyl(0.04, 0.04, 0.5, k.metal(0xd0d4da), 10), Math.PI / 2, 0, 0), 0, 0, 0.6);
    for (let i = 0; i < 3; i++) tuner.add(k.at(k.box(0.5, 0.04, 0.02, k.metal(0x8f949b)), 0, -0.15 + i * 0.15, -0.38));
    body.add(tuner);
    add({ id: 'tuner', name: 'Tuner', obj: tuner, pull: [0.6, 2.4, -0.8], blockedBy: ['cover'], level: 2,
      say: 'The tuner picks which channel you watch. The channel knob turns it.',
      breaks: "Without the tuner, the TV can't find any channel. Just snow!",
      fact: 'Each channel comes in on its own invisible wave. Turning the knob tells the tuner which wave to listen to.',
      symptom: 'The screen is all fuzzy snow, and it goes shhhh.' });
    sub(tuner, 'tuner', { id: 'tunerShaft', name: 'Tuner shaft', obj: shaft, pull: [0, 0, 0.8], level: 3, face: [0, 0, 1],
      say: 'A metal rod that connects the channel knob to the tuner.',
      job: 'It links the knob to the tuner. Without it the knob would spin, but the channel would not change.',
      learn: ['Think of the handle on a car window. You turn the handle, and a rod carries your turn inside.', 'The channel knob slips onto the end of the rod. As you turn the knob, the rod turns the parts inside the tuner.', 'A shaft carries rotation from one place to another with almost no loss. In an old tuner, turning it changes which radio wave the tuner listens to.'] });
    const lid = k.at(k.box(0.58, 0.03, 0.72, k.metal(0xc9ced6, { roughness: 0.35 })), 0, 0.315, 0);
    sub(tuner, 'tuner', { id: 'tunerLid', name: 'Tuner lid', obj: lid, pull: [0, 0.8, 0], level: 3, face: [0, 1, 0],
      say: 'A metal lid on top of the tuner. It keeps outside noise from sneaking in.',
      job: 'It only keeps stray radio noise out of the tuner. Everything still works at first.',
      learn: ['Think of a lid on a pot. It keeps things from getting in or out.', 'Radio waves are everywhere in a house. The metal box blocks them, so only the station you want reaches the tiny parts inside.', 'A closed metal box is a shield. Radio waves induce currents in the metal that cancel them inside the box, so the sensitive tuner circuits do not pick up stray signals, and do not give any off either.'] });

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
    sub(speaker, 'speaker', { id: 'vcoil', name: 'Voice coil', obj: k.at(k.group(k.torus(0.1, 0.03, copperM, 18)), 0, 0, -0.02), pull: [0, 0.4, -0.3], level: 3, face: [0, 0, 1],
      say: 'A thin coil of wire glued to the back of the cone. When electricity flows through it, it wiggles.',
      breaks: 'The sound stopped!',
      learn: ['Think of a tiny hand that pushes the cone back and forth, many times a second.', 'Electricity in the coil makes it a magnet that gets pushed and pulled by the big magnet. The cone is glued to the coil, so it moves too, and the air moves with it.', 'The sound signal flows through the voice coil, which sits in the gap of the magnet. The force on the wire grows with the current, so the cone moves in step with the sound wave.'] });
    sub(speaker, 'speaker', { id: 'spkWire', name: 'Speaker wire', obj: k.group(k.tube([[0.3, -0.1, -0.2], [0.45, -0.3, -0.7], [0.2, -0.65, -1.1]], 0.025, k.mat(0xd8261f)), k.tube([[0.34, -0.1, -0.2], [0.5, -0.32, -0.7], [0.26, -0.67, -1.1]], 0.025, k.mat(0x1b1b1b))), pull: [0.5, -0.3, -0.8], level: 2, face: [0, 0, -1],
      say: 'Two thin wires that bring the sound from the brain board to the speaker.',
      breaks: 'The sound stopped! The wires carried it to the speaker.',
      symptom: 'The picture works, but the speaker is silent and its wires look loose.' });
    sub(speaker, 'speaker', { id: 'magnet', name: 'Magnet', obj: k.at(k.group(k.rot(k.cyl(0.16, 0.16, 0.18, k.metal(0x8a8f96), 20), Math.PI / 2, 0, 0)), 0, 0, -0.2), pull: [0, -0.5, -0.5], level: 3, face: [0, 0, -1],
      say: 'A strong magnet! It pushes and pulls the cone to make sound.', breaks: 'The sound stopped!', fact: 'Almost every speaker, even in headphones, has a magnet inside.' });

    // ---- main circuit board (slides out the back like a drawer) and its parts
    const board = k.board(3.6, 2.2, { seed: 11, count: 10 });
    k.at(board, 0, 0.2, -0.5);
    body.add(board);
    add({ id: 'board', name: 'Main circuit board', obj: board, pull: [0, 0, -5.2], blockedBy: ['cover', 'boardScrew0', 'boardScrew1'], reach: ['cover'], face: [0, 1, 0], focusRadius: 2.4,
      say: "This is the TV's brain. It tells all the other parts what to do.",
      breaks: 'No brain, no TV! The picture and the sound both stop.',
      fact: 'The little bumps are parts called resistors, capacitors and chips. Electricity zooms between them on thin copper roads.',
      symptom: 'It turns on, but there is no picture and no sound.' });
    let bn = 0;
    const B = (spec) => {
      const x = spec.at[0], z = spec.at[1];
      k.at(spec.obj, x, 0.025, z);
      spec.pull = spec.pull || [x * 1.0, 1.0 + (bn++ % 5) * 0.5, z * 1.2];
      spec.face = [0, 1, 0]; delete spec.at;
      return sub(board, 'board', spec);
    };
    const OFF = 'The TV turned off!';
    const to220 = (w, h) => k.group(k.at(k.box(w, h, 0.08, blk), 0, h / 2, 0), k.at(k.box(w, 0.12, 0.02, chromeM), 0, h + 0.05, 0));
    const dip = (w, d) => k.group(k.at(k.box(w, 0.06, d, blk), 0, 0.05, 0), k.at(k.box(w * 0.92, 0.03, 0.03, chromeM), 0, 0.02, d / 2), k.at(k.box(w * 0.92, 0.03, 0.03, chromeM), 0, 0.02, -d / 2));
    const sinkObj = () => { const g = k.group(); for (let i = 0; i < 6; i++) g.add(k.at(k.box(0.04, 0.3, 0.5, chromeM), i * 0.08 - 0.2, 0.15, 0)); return g; };
    const cap0 = (c) => k.group(k.at(k.cyl(0.07, 0.07, 0.2, c, 14), 0, 0.1, 0));
    const res0 = () => {
      const r = k.group(k.at(k.rot(k.cyl(0.025, 0.025, 0.16, 0xd9b38c, 10), 0, 0, Math.PI / 2), 0, 0.04, 0));
      [0xc0392b, 0x8e44ad, 0x1b1b1b].forEach((c, j) => r.add(k.at(k.rot(k.cyl(0.027, 0.027, 0.014, c, 10), 0, 0, Math.PI / 2), -0.04 + j * 0.03, 0.04, 0)));
      return r;
    };
    // power supply section
    B({ id: 'fuseC', name: 'Fuse', obj: k.group(k.at(k.rot(k.cyl(0.05, 0.05, 0.3, k.glass(0xdff3ff, 0.45), 14), 0, 0, Math.PI / 2), 0, 0.08, 0), k.at(k.rot(k.cyl(0.055, 0.055, 0.06, chromeM, 14), 0, 0, Math.PI / 2), 0.15, 0.08, 0), k.at(k.rot(k.cyl(0.055, 0.055, 0.06, chromeM, 14), 0, 0, Math.PI / 2), -0.15, 0.08, 0)), at: [1.5, -0.95], level: 2,
      say: 'The fuse is a safety guard. If too much electricity rushes in, its tiny wire melts so nothing catches fire.', breaks: 'No fuse, no power. ' + OFF,
      symptom: 'It will not turn on at all.' });
    const lcoil = k.group(k.at(k.rot(k.mesh(new T.TorusGeometry(0.14, 0.06, 8, 14), ferriteM), Math.PI / 2, 0, 0), 0, 0.14, 0));
    [0, Math.PI].forEach((a0) => lcoil.add(k.at(k.rot(k.mesh(new T.TorusGeometry(0.14, 0.068, 8, 10, 2.2), copperM), Math.PI / 2, 0, a0), 0, 0.14, 0)));
    B({ id: 'lineCoil', name: 'Line filter coil', obj: lcoil, at: [1.0, -0.85], level: 3,
      say: 'Two coils of wire on a ring. They keep buzzing noise from the TV from leaking back into the wall.',
      breaks: 'The power cannot get past the coil, so the TV turned off!',
      learn: ['Think of a bouncer at a door. Steady power walks right in, but noisy jitters get turned away.', 'Two coils of wire share one ring. They let the smooth wall power through, and they block the buzzing noise the TV makes from running back out into the house wiring.', 'This is a common-mode choke with two windings on one core. Current going in and out cancels in the core, so the power passes. Noise that travels the same way on both wires sees a large impedance and is blocked.'] });
    B({ id: 'thermistor', name: 'Degauss thermistor', obj: k.group(k.at(k.rot(k.cyl(0.09, 0.09, 0.04, k.mat(0xb5651d, { roughness: 0.7 }), 14), Math.PI / 2, 0, 0), 0, 0.11, 0), k.at(k.cyl(0.01, 0.01, 0.1, chromeM, 6), -0.04, 0.05, 0), k.at(k.cyl(0.01, 0.01, 0.1, chromeM, 6), 0.04, 0.05, 0)), at: [0.6, -0.9], level: 3,
      say: 'A little disc that gets hot and shuts off the power to the degaussing coil a moment after the TV turns on.',
      breaks: 'The degaussing coil never gets its shake, so the colors are blotchy!',
      learn: ['Think of a faucet that slowly closes itself. A big rush goes through at first, and then it shuts almost all the way.', 'When the TV turns on, the disc is cool and lets lots of current into the degaussing coil. The current heats the disc, the disc blocks the current, and the coil fades from strong to nothing.', 'It is a positive temperature coefficient thermistor, which means its resistance jumps up sharply when it warms. That smooth fade is what makes degaussing work, and it is why you wait a few minutes before the next degauss.'],
      symptom: 'There are rainbow blotches on the picture, and the TV does not make a boing when it turns on.' });
    const bridgeObj = k.group(k.at(k.box(0.32, 0.1, 0.32, blk), 0, 0.05, 0));
    [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]].forEach(([x, z]) => bridgeObj.add(k.at(k.box(0.025, 0.05, 0.025, chromeM), x, 0.125, z)));
    B({ id: 'bridge', name: 'Bridge rectifier', obj: bridgeObj, at: [1.5, -0.45], level: 2,
      say: 'Four little one-way doors that turn the wall electricity, which keeps changing direction, into electricity that only flows one way.',
      breaks: 'The wall power cannot be turned around to flow one way, so the TV turned off!',
      learn: ['Think of four one-way doors arranged so everyone ends up walking the same way down the hall.', 'Wall power flips direction many times a second. Two of the four doors open on each flip, so the power always comes out going the same way.', 'A bridge rectifier of four diodes turns alternating current into pulsing direct current. The big capacitor after it then smooths the pulses into a steady level.'] });
    B({ id: 'bigcapC', name: 'Big capacitor', obj: k.group(k.at(k.cyl(0.2, 0.2, 0.5, k.mat(0x1f3c8f), 20), 0, 0.25, 0), k.at(k.cyl(0.19, 0.19, 0.01, chromeM, 20), 0, 0.505, 0)), at: [1.05, -0.1], level: 2,
      say: 'A big capacitor stores electricity like a little water tank.', breaks: OFF, fact: 'Big capacitors in old TVs can hold a zap long after unplugging.' });
    B({ id: 'xformer', name: 'Switching transformer', obj: k.group(k.at(k.box(0.5, 0.2, 0.3, ferriteM), 0, 0.1, 0), k.at(k.box(0.32, 0.26, 0.26, k.mat(0xb0662e, { roughness: 0.6 })), 0, 0.13, 0)), at: [0.3, -0.6], level: 2,
      say: 'This changes the strong power from the wall into smaller, safer pushes that the other parts can use.',
      breaks: 'There is no gentle power for the TV, so it turned off!',
      learn: ['Think of a gearbox. It turns one big strong spin into a few smaller gentle spins.', 'Coils of wire wrap around a block. The power coming in on one coil makes a push in the other coils, and the number of turns decides how big each push is.', 'The power transistor chops the electricity thousands of times a second, so the transformer core can be small and light. Old sets used big iron transformers that ran at wall frequency instead.'] });
    B({ id: 'heatsinkC', name: 'Heat sink', obj: sinkObj(), at: [1.45, 0.8], level: 2,
      say: "The heat sink's metal fins carry heat away, like a dog panting to cool off.", breaks: 'The power part got too hot, so the TV turned off to stay safe.' });
    B({ id: 'transistorC', name: 'Power transistor', obj: to220(0.22, 0.28), at: [1.45, 0.45], blockedBy: ['heatsinkC'], level: 2,
      say: 'This power transistor is a super fast switch for the power.', breaks: OFF });
    B({ id: 'regulator', name: 'Voltage regulator', obj: to220(0.16, 0.2), at: [0.65, 0.25], level: 3,
      say: 'It makes sure the little chips get one steady gentle push of electricity.',
      breaks: 'The chips lost their steady power, so the picture and the sound stopped!',
      learn: ['Think of a faucet that gives the same gentle flow no matter how hard the pump pushes.', 'The power part makes a push that bounces around a bit. The regulator trims it to one steady gentle push that the little chips can trust.', 'A linear regulator compares its output to a fixed reference and adjusts itself to hold the voltage steady. The extra energy leaves as heat, which is why it often has a metal tab to carry the heat away.'],
      symptom: 'The TV turns on but the screen stays black and there is no sound.' });
    [[0.62, -0.4], [0.62, -0.22]].forEach(([x, z], i) => B({ id: 'diode' + i, name: 'Diode', obj: k.group(k.at(k.rot(k.cyl(0.03, 0.03, 0.14, k.glass(0xe6c8a0, 0.7), 10), 0, 0, Math.PI / 2), 0, 0.05, 0), k.at(k.rot(k.cyl(0.032, 0.032, 0.02, blk, 10), 0, 0, Math.PI / 2), 0.04, 0.05, 0)), at: [x, z], level: 3,
      say: 'A one-way door for electricity. It lets power through one way and blocks it the other way.',
      job: 'It is one of several helpers that guard the power parts from backward spikes. The TV keeps going for now.',
      learn: ['Think of a turnstile that only spins one way.', 'A diode lets electricity flow in one direction. The stripe on it shows which end is which, and a backward push gets stopped at the door.', 'A diode is a junction between two kinds of silicon. Pushed one way it conducts with only a small drop, and pushed the other way it blocks. In TVs, diodes turn alternating current into one-way current and guard parts from voltage spikes.'] }));
    // horizontal drive (makes the high voltage)
    B({ id: 'heatsinkH', name: 'Heat sink', obj: sinkObj(), at: [-0.35, 0.85], level: 3,
      say: 'Metal fins that carry heat away from the big switch that runs the flyback.',
      job: 'It cools the big switch. Without it the switch works for a little while, and then it gets too hot and quits.' });
    B({ id: 'hot', name: 'Horizontal output transistor', obj: to220(0.26, 0.3), at: [0.1, 0.85], blockedBy: ['heatsinkH'], level: 2,
      say: 'A big switch that flips on and off thousands of times a second to power the flyback.',
      breaks: 'The flyback has no push, so the screen went dark. You can still hear the show.',
      learn: ['Think of someone pushing a swing at just the right moment, again and again. The switch gives the flyback its push.', 'It switches the current in the flyback on and off about 15,000 times a second, the same speed the lines of the picture are drawn.', 'When the transistor shuts the current off, the collapsing magnetic field in the flyback makes a huge spike of voltage. The flyback steps that up to the 25,000 volts or so the tube wants. That is why it runs hot and is bolted to a heat sink.'],
      symptom: 'You can hear the show, but the screen is dark and the big switch by the flyback may be warm.' });
    B({ id: 'vertChip', name: 'Vertical amp chip', obj: k.group(k.at(k.box(0.3, 0.22, 0.06, blk), 0, 0.11, 0), k.at(k.box(0.3, 0.1, 0.015, chromeM), 0, 0.26, 0)), at: [-0.55, 0.3], level: 2,
      say: 'It gives the up-and-down coil the push it needs to sweep the beam from the top of the screen to the bottom.',
      breaks: 'The beam cannot move up and down, so there is just a flat line across the middle!',
      learn: ['Think of a pump. It pushes with just enough force to move the beam from top to bottom, again and again.', 'It makes a slowly rising push of current, then lets go fast. That brings the beam down the screen once, then snaps it back to the top, about 60 times a second.', 'The vertical output stage must drive a coil, which resists sudden changes in current, so it needs a strong output. Many sets use one power chip with a metal tab for cooling.'],
      symptom: 'There is only a thin bright line across the middle of the screen.' });
    // signal section
    B({ id: 'saw', name: 'SAW filter', obj: k.group(k.at(k.box(0.2, 0.07, 0.14, chromeM), 0, 0.035, 0)), at: [-1.1, -0.8], level: 3,
      say: 'A tiny filter that lets through only the channel you picked and blocks the rest.',
      breaks: 'The show cannot get through the filter. Just snow!',
      learn: ['Think of a coffee filter. The right part goes through and the rest stays behind.', 'The tuner picks your channel, and this filter cleans it up. It lets through only the narrow band that channel uses, so the neighbors do not show up in your picture.', 'SAW stands for surface acoustic wave. The signal is turned into a tiny ripple on the surface of a crystal and back to electricity, and the pattern on the crystal lets only the wanted band through.'],
      symptom: 'The screen is all fuzzy snow, even with the rabbit ears on.' });
    [[-0.75, -0.85], [-0.52, -0.85]].forEach(([x, z], i) => B({ id: 'if' + i, name: 'IF coil can', obj: k.group(k.at(k.cyl(0.09, 0.09, 0.22, k.metal(0xb9bec6, { roughness: 0.4 }), 12), 0, 0.11, 0), k.at(k.box(0.1, 0.02, 0.02, 0x2a2a2a), 0, 0.225, 0)), at: [x, z], level: 3,
      say: 'A little metal can with a tuned coil inside. It helps pick the picture and sound out of the radio signal.',
      breaks: 'The signal gets lost on its way. Just snow!',
      learn: ['Think of pushing a swing. A small push at just the right beat makes a big swing.', 'Inside the can, a coil and a small capacitor ring like a swing at one beat. A signal at that beat gets stronger, and other beats fade away.', 'The tuner moves the channel to a fixed middle frequency, called the intermediate frequency, so these tuned circuits can be set once at the factory. Turning a small slug of ferrite in the coil tunes it.'] }));
    B({ id: 'jungle', name: 'Color chip', obj: k.group(k.at(k.box(0.5, 0.06, 0.24, blk), 0, 0.03, 0), k.at(k.box(0.46, 0.03, 0.03, chromeM), 0, 0.02, 0.13), k.at(k.box(0.46, 0.03, 0.03, chromeM), 0, 0.02, -0.13)), at: [-1.0, -0.2], level: 2,
      say: 'The color chip figures out all the colors in the show.', breaks: 'The colors are gone! Only black and white.', symptom: 'The picture is only black and white.' });
    B({ id: 'crystal', name: 'Color crystal', obj: k.group(k.at(k.rbox(0.2, 0.09, 0.07, chromeM, 0.02), 0, 0.07, 0), k.at(k.box(0.02, 0.04, 0.02, chromeM), -0.05, 0.01, 0), k.at(k.box(0.02, 0.04, 0.02, chromeM), 0.05, 0.01, 0)), at: [-1.55, -0.2], level: 3,
      say: 'A tiny crystal that keeps perfect time. The color chip uses its beat to find the colors.',
      breaks: 'No beat, no color! The picture is black and white.',
      learn: ['Think of a metronome that never changes its beat. The color chip needs that beat to tell which color is which.', 'The color is hidden in the signal as small wiggles, timed against a steady beat of about 3.6 million ticks a second in North America. The crystal makes that beat.', 'A quartz crystal bends a tiny bit when a voltage is put across it, and it rings at a very steady rate set by how it was cut. That steadiness is why it is used for a reference instead of a plain coil.'],
      symptom: 'The picture is only black and white, and the little silver crystal near the color chip looks loose.' });
    B({ id: 'syncChip', name: 'Sync chip', obj: dip(0.34, 0.2), at: [-0.3, -0.45], level: 3,
      say: 'This chip keeps the picture from rolling. It tells the beam when to start each line and each new picture.',
      breaks: 'The picture tears and rolls up and down!',
      learn: ['Think of a drummer who keeps the whole band together. Everyone starts each beat at the same moment.', 'The signal has tiny pulses between lines that say start a new line, and between pictures that say start again at the top. This chip finds those pulses and keeps the beam in step.', 'The sync separator strips the sync pulses from the video signal and sends them to the sweep circuits. Without them the sweeps run free at their own speed and slip out of step with the signal.'],
      symptom: 'The picture is jumping and rolling up the screen.' });
    B({ id: 'soundChip', name: 'Sound chip', obj: k.group(k.at(k.box(0.3, 0.06, 0.2, blk), 0, 0.03, 0)), at: [-1.3, 0.5], level: 2,
      say: 'The sound chip makes the sound strong enough for the speaker.', breaks: 'The sound stopped!', symptom: 'The picture works, but there is no sound at all.' });
    // small parts
    [[-1.65, -0.75], [-0.85, 0.55], [0.35, 0.3], [-0.1, -0.1], [0.85, 0.6], [-1.1, 0.95]].forEach(([x, z], i) => B({ id: 'capC' + i, name: 'Small capacitor', obj: cap0([0x2e8b57, 0x1b6fa8, 0x7a3fb0, 0x1d1d1d, 0x2e8b57, 0x1b6fa8][i]), at: [x, z], level: 3,
      say: 'A small capacitor. It soaks up little bumps in the electricity.' }));
    [[0.2, -0.95], [0.45, -0.95], [-1.45, 0.1], [-1.45, 0.3], [-0.8, 0.15], [-0.7, 0.8]].forEach(([x, z], i) => B({ id: 'resC' + i, name: 'Resistor', obj: res0(), at: [x, z], level: 3,
      say: 'A resistor slows electricity down, like a narrow pipe slows water.', fact: 'The colored stripes are a secret code that tells how much it slows things down.' }));
    // two screws hold the board in
    [[-1.7, -1.0], [1.7, -1.0]].forEach(([x, z], i) => {
      const sc = k.screw(0xc3c7cf, 0.25);
      sc.scale.setScalar(0.7);
      sub(board, 'board', { id: 'boardScrew' + i, name: 'Screw', kind: 'screw', obj: k.at(sc, x, 0.025, z), pull: [0, 0.9, 0], level: 3, say: 'A screw that holds the circuit board in place.' });
    });

    return { root, shell: [shell], parts, screen: scr, refs: { knob: knobInner } };
  },

  evaluate(has, on) {
    const off = { alive: false, screen: { mode: 'off' }, sound: {} };
    if (!on) return off;
    if (!has('cord')) return Object.assign(off, { reason: "It's not plugged in! Put the power cord back." });
    if (!has('powerBtn')) return Object.assign(off, { reason: 'The power button is missing, so the TV cannot be switched on.' });
    if (!has('fuseC')) return Object.assign(off, { reason: 'The fuse is missing, so no electricity gets in.' });
    if (!has('lineCoil')) return Object.assign(off, { reason: 'The line filter coil is missing, so the power cannot get in.' });
    if (!has('bridge')) return Object.assign(off, { reason: 'The bridge rectifier is missing, so the power cannot be turned around to flow one way.' });
    if (!has('bigcapC')) return Object.assign(off, { reason: "A big capacitor is missing, so the power can't stay steady." });
    if (!has('transistorC') || !has('heatsinkC')) return Object.assign(off, { reason: 'A power part is missing or too hot, so the TV turned off to stay safe.' });
    if (!has('xformer')) return Object.assign(off, { reason: 'The switching transformer is missing, so there is no gentle power for the TV.' });
    if (!has('board')) return { alive: true, reason: "The main circuit board is missing. That's the TV's brain, so nothing works.", screen: { mode: 'black' }, sound: {} };
    if (!has('regulator')) return { alive: true, reason: 'The voltage regulator is missing, so the chips have no steady power.', screen: { mode: 'black' }, sound: {} };
    const signal = has('antenna') && has('tuner') && has('saw') && has('if0') && has('if1');
    const r = has('redGun') && has('vampR'), g = has('greenGun') && has('vampG'), b = has('blueGun') && has('vampB');
    const gunOK = has('gun') && has('socket') && has('neckboard') && (r || g || b);
    const hv = has('flyback') && has('anode') && has('anodeCap') && has('hot');
    const scr = {};
    if (!has('tube')) scr.mode = 'off';
    else if (!hv || !gunOK) scr.mode = 'black';
    else if (!has('yoke') || !has('yokeCable') || (!has('hCoil') && !has('vCoil'))) scr.mode = 'dot';
    else if (!has('vCoil') || !has('vertChip')) scr.mode = 'line';
    else if (!has('hCoil')) scr.mode = 'vline';
    else {
      scr.mode = signal ? 'picture' : 'snow';
      if (!(r && g && b)) scr.tint = '#' + [r, g, b].map((x) => (x ? 'ff' : '00')).join('');
      if (!has('degauss') || !has('thermistor') || !has('ringset') || !has('purity') || !has('mask')) scr.blotch = true;
      if (!has('focusKnob') || !has('ringset') || !has('conv0') || !has('conv1')) scr.blur = true;
      if (!has('jungle') || !has('crystal')) scr.gray = true;
      if (!has('syncChip')) scr.glitch = true;
    }
    const spk = has('speaker') && has('magnet') && has('cone') && has('vcoil') && has('spkWire');
    const vol = has('volKnob') && has('volPot');
    return { alive: true, screen: scr, sound: { show: signal && spk && has('soundChip') && vol, hiss: !signal && spk && vol } };
  },
});

Object.assign(TAL.insideByName, {
  'Neck board': 'pcb-inside', 'Shadow mask': 'crt-inside', 'Video amp transistor': 'transistor', 'Horizontal output transistor': 'transistor', 'Voltage regulator': 'transistor',
  'Switching transformer': 'transformer-inside', 'Line filter coil': 'transformer-inside', 'Purity ring': 'magnet-inside', 'Convergence ring': 'magnet-inside',
  'Ferrite core': 'magnet-inside', 'Vertical amp chip': 'chip-package', 'Sync chip': 'chip-package', 'Ground strap': 'wire-inside', 'Yoke cable': 'wire-inside',
  'Volume potentiometer': 'resistor-inside',
});
