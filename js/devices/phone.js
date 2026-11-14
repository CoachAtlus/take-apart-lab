/* Phone, lying face up. Beginner 6 pieces, Medium 12, Advanced 20.
 * Power lights the screen with a simple picture; no battery means it turns off; no display layer means a black screen.
 * Every so often it gets a "message": the speaker dings and the vibration motor buzzes. */
(function () {
  const T = window.THREE;
  const W = 3.0, L = 6.0; // phone width (x) and length (z)

  const pictureTex = (k) => k.canvasTex(256, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h * 0.7);
    g.addColorStop(0, '#2d6fd8'); g.addColorStop(1, '#bfe3ff');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(w * 0.72, h * 0.38, 32, 0, 7); c.fill();
    c.fillStyle = '#3aa655'; c.beginPath(); c.moveTo(0, h * 0.7); c.quadraticCurveTo(w * 0.3, h * 0.52, w * 0.6, h * 0.7); c.lineTo(0, h); c.fill();
    c.fillStyle = '#2b8a46'; c.beginPath(); c.moveTo(w, h * 0.66); c.quadraticCurveTo(w * 0.7, h * 0.56, w * 0.3, h * 0.76); c.lineTo(w * 0.3, h); c.lineTo(w, h); c.fill();
    c.fillStyle = '#ffffff'; c.font = '800 54px "Baloo 2", sans-serif'; c.textAlign = 'center'; c.fillText('10:09', w / 2, 90);
    c.font = '600 18px sans-serif'; c.fillText('Good morning!', w / 2, 118);
    const cols = ['#ff5b4f', '#ffc23a', '#3ee08f', '#58b8ff'];
    for (let i = 0; i < 4; i++) { c.fillStyle = cols[i]; c.beginPath(); if (c.roundRect) c.roundRect(24 + i * 56, h - 64, 44, 44, 11); else c.rect(24 + i * 56, h - 64, 44, 44); c.fill(); }
  });

  TAL.registerDevice({
    id: 'phone',
    name: 'Phone',
    short: 'phone',
    subtitle: 'A tiny computer in your pocket',
    powerSound: 'flat',
    channels: false,
    view: { target: [0, 0.3, 0], radius: 5.0, explodedRadius: 9.0, explodedY: 1.4, yaw: 0, pitch: 0.95, shadow: [8, 9] },
    intro: 'This is a phone. Press the green power button to wake it up. A phone is a tiny computer with a screen, a camera and a battery!',
    shellSay: 'That is the phone frame. Everything else is stacked inside it.',
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button to wake the phone up.", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['glass'], say: 'Lift off the glass. It is the clear layer your finger touches. Does the screen still work?', nudge: 'Pull off the glass.' },
      { do: 'remove', ids: ['display'], say: 'Now lift out the display layer. What happens to the picture?', nudge: 'Pull out the display layer.' },
      { do: 'remove', ids: ['battery'], say: 'Pull out the battery. That is the big one. What happens now?', nudge: 'Pull out the battery.' },
      { do: 'remove', ids: ['sim'], levels: [2, 3], say: 'Slide out the little SIM tray from the side.', nudge: 'Pull out the SIM tray.' },
      { do: 'end', say: 'A phone is layers: glass, display, battery and a board that thinks. Put them back and wake it up again!' },
    ],

    build(k) {
      const shaker = k.group();
      const root = k.group(shaker);
      const parts = [];
      const add = (s) => { parts.push(s); return s; };
      const sub = (parentObj, parentId, s) => { parentObj.add(s.obj); s.parent = parentId; return add(s); };
      const metal = k.metal(0xb9bec6);
      const darkM = k.mat(0x16171b, { roughness: 0.3 });

      // ---- frame: the back plate with raised rails
      const fm = k.metal(0x8c939c, { roughness: 0.4 });
      const frame = k.group(
        k.at(k.rbox(W, 0.06, L, fm, 0.02), 0, 0.03, 0),
        k.at(k.box(0.1, 0.34, L, fm), -W / 2 + 0.05, 0.2, 0), k.at(k.box(0.1, 0.34, L, fm), W / 2 - 0.05, 0.2, 0),
        k.at(k.box(W, 0.34, 0.1, fm), 0, 0.2, -L / 2 + 0.05), k.at(k.box(W, 0.34, 0.1, fm), 0, 0.2, L / 2 - 0.05)
      );
      shaker.add(frame);
      add({ id: 'frame', name: 'Phone frame', obj: frame, pull: [0, -2.2, 0], blockedBy: ['glass', 'display', 'battery', 'board', 'camera', 'speaker', 'vib', 'port', 'sim', 'selfie'], face: [0, -1, 0], focusRadius: 5,
        say: 'The frame is the strong metal tray. All the parts sit in it.',
        job: 'It holds all the parts together and keeps them safe.',
        learn: ['It is like the tray that holds your toys in a box.', 'It is usually metal or tough plastic. It is stiff so the phone does not bend in your pocket.', 'Metal also helps carry heat away from the chip, and some frames double as part of the antenna.'] });

      // ---- glass (a clear pane on top)
      const glass = k.group(k.at(k.rbox(W - 0.04, 0.04, L - 0.04, k.glass(0xdff3ff, 0.18), 0.03), 0, 0.38, 0), k.at(k.box(0.3, 0.005, L - 0.8, k.mat(0xffffff, { transparent: true, opacity: 0.07, depthWrite: false })), -0.7, 0.405, 0));
      shaker.add(glass);
      add({ id: 'glass', name: 'Glass screen', obj: glass, pull: [-3.8, 2.6, 0.8], face: [0, 1, 0], focusRadius: 4.5,
        say: 'The glass is the clear top. Your finger touches it. It keeps the screen safe from scratches.',
        job: 'It protects the screen and is what your finger touches.',
        learn: ['It is like a window over the picture. You touch the window, not the picture.', 'The glass is made extra tough so it does not scratch or crack easily. Under it is a layer that notices your finger.', 'The touch layer feels the tiny electric field your finger changes when it gets close. The phone turns that into where you tapped.'] });

      // ---- display layer: a dark panel with the picture on top
      const picMat = new T.MeshBasicMaterial({ map: pictureTex(k), toneMapped: false, color: 0x0d0e12 });
      const pic = k.mesh(new T.PlaneGeometry(W - 0.3, L - 0.3), picMat); pic.name = 'pic';
      k.rot(pic, -Math.PI / 2, 0, 0); k.at(pic, 0, 0.336, 0);
      const display = k.group(k.at(k.box(W - 0.2, 0.04, L - 0.2, k.mat(0x0b0b0e, { roughness: 0.4 })), 0, 0.31, 0), pic);
      shaker.add(display);
      add({ id: 'display', name: 'Display layer', obj: display, pull: [3.8, 2.4, 0], blockedBy: ['glass', 'adhesive'], face: [0, 1, 0], focusRadius: 4.5,
        say: 'The display makes the picture. It is made of millions of tiny colored dots.',
        breaks: 'No display, no picture! The screen is just black.',
        fact: 'Each tiny dot glows red, green or blue, and together they make the picture.',
        learn: ['It is like a giant picture made of colored beads. Each bead is a tiny dot of light.', 'Each dot is made of three little parts: red, green and blue. Mix them and you can make any color.', 'Some phone screens are LCDs, like the picture you can look inside here. Others are OLED, where each dot makes its own light.'],
        symptom: 'The phone is on, but the screen is all black.' });
      // the screen adhesive: a thin sticky frame that holds the display in
      const adh = k.group(
        k.at(k.box(W - 0.2, 0.02, 0.14, k.mat(0xe8e2d0, { roughness: 1 })), 0, 0.27, -L / 2 + 0.2), k.at(k.box(W - 0.2, 0.02, 0.14, k.mat(0xe8e2d0, { roughness: 1 })), 0, 0.27, L / 2 - 0.2),
        k.at(k.box(0.14, 0.02, L - 0.6, k.mat(0xe8e2d0, { roughness: 1 })), -W / 2 + 0.2, 0.27, 0), k.at(k.box(0.14, 0.02, L - 0.6, k.mat(0xe8e2d0, { roughness: 1 })), W / 2 - 0.2, 0.27, 0)
      );
      shaker.add(adh);
      add({ id: 'adhesive', name: 'Screen glue', obj: adh, pull: [0, 1.4, -3.4], blockedBy: ['glass'], level: 3, face: [0, 1, 0], focusRadius: 4.5,
        say: 'A thin sticky frame that glues the screen in, like double-sided tape.',
        breaks: 'The screen still works, but it is not stuck in anymore and could pop loose!', breaksAlways: true,
        job: 'It holds the screen in and keeps dust and water out.',
        learn: ['It is like double-sided tape around the edge of a picture.', 'It also seals the edge so dust and splashes cannot sneak in.', 'This glue is why repairing a screen takes careful heating to soften it before the screen comes off.'] });

      // ---- battery
      const battery = k.group(k.at(k.rbox(2.4, 0.12, 2.5, k.mat(0x8f9bb0, { roughness: 0.5 }), 0.04), 0, 0.14, 1.0), k.at(k.box(2.0, 0.005, 0.5, k.mat(0x2c8b57)), 0, 0.205, 1.4), k.at(k.box(0.4, 0.04, 0.1, k.metal(0xd8c48a)), 0.6, 0.16, -0.3));
      shaker.add(battery);
      add({ id: 'battery', name: 'Battery', obj: battery, pull: [0, 2.8, 3.0], blockedBy: ['display'], face: [0, 1, 0], focusRadius: 3,
        say: 'The battery is the big flat part. It stores the electricity that powers the phone.',
        breaks: 'No battery, no electricity. The phone turns off!',
        fact: 'The battery takes up a big part of the phone.',
        learn: ['It is the phone\'s lunchbox of electricity. When it is empty, you plug in to refill it.', 'It is a thin, flat battery that gives out electricity and takes it back while charging.', 'Phone batteries are usually lithium ion. A little protection chip stops them from getting too full or too hot.'],
        symptom: 'The phone will not turn on at all.' });

      // ---- main board with its chip and screws
      const pcb = k.board(2.4, 1.6, { seed: 11, color: 0x1f5f3a, count: 26 });
      k.at(pcb, 0, 0.1, -1.8);
      const board = k.group(pcb);
      shaker.add(board);
      add({ id: 'board', name: 'Main board', obj: board, pull: [0, 2.4, -3.0], blockedBy: ['display', 'bs1', 'bs2', 'bs3', 'bs4'], face: [0, 1, 0], focusRadius: 2.4,
        say: 'The main board is the phone\'s brain. It is a small green board with chips on it.',
        breaks: 'No brain! The phone cannot think and nothing works.',
        fact: 'The board joins the chip, camera, speaker and screen.',
        learn: ['It is like the control room of the phone. Every part sends its news here.', 'Tiny copper roads on the board carry electricity and messages between the chip and all the other parts.', 'The board is a many-layered sandwich of thin copper and fiberglass, so lots of tiny roads can cross without touching.'],
        symptom: 'The phone will not turn on at all.' });
      const chip = k.group(k.at(k.box(0.7, 0.1, 0.7, k.mat(0x16171b, { roughness: 0.3 })), 0.35, 0.18, -1.9), k.at(k.box(0.35, 0.004, 0.1, k.mat(0xdddddd)), 0.35, 0.231, -1.9));
      add({ id: 'chip', name: 'Main chip', obj: chip, pull: [0, 1.6, -0.6], blockedBy: ['display'], parent: 'board', level: 2, face: [0, 1, 0], focusRadius: 1,
        say: 'This is the main chip. It does all the thinking for the phone.',
        breaks: 'No thinker! The phone cannot do anything.',
        fact: 'A phone chip has billions of tiny switches.',
        learn: ['It is the phone\'s brain. It decides what to show and what to do.', 'It runs your apps, listens to the touch, and tells the screen what to draw, many times every second.', 'It is a system on a chip: the main processor, the graphics and more are all packed onto one tiny piece of silicon.'],
        symptom: 'The phone will not turn on at all.' });
      board.add(chip);
      [[-1.05, -2.45], [1.05, -2.45], [-1.05, -1.2], [1.05, -1.2]].forEach(([x, z], i) => {
        const sc = k.at(k.screw(0x9ea3ab, 0.12), x, 0.13, z);
        sc.scale.setScalar(0.65);
        shaker.add(sc);
        add({ id: 'bs' + (i + 1), name: 'Board screw', kind: 'screw', obj: sc, pull: [0, 0.8, 0], level: 3, fuse: 'board', face: [0, 1, 0],
          say: 'A tiny screw. It holds the main board in place.',
          job: 'It keeps the board from sliding around.',
          learn: ['A screw is like a tiny spiral staircase that pulls things tight.', 'These are very tiny, and they are held in with a small special-shaped head.', 'Because they are so small, repair shops use special little screwdrivers and keep the screws in order.'] });
      });

      // ---- camera: a module with a lens (and a sensor), on the main board edge
      const cam = k.group(k.at(k.box(0.7, 0.12, 0.7, k.mat(0x25262c, { roughness: 0.5 })), -0.65, 0.2, -2.35));
      const lensG = k.group(k.at(k.cyl(0.24, 0.24, 0.1, metal, 24), -0.65, 0.3, -2.35), k.at(k.cyl(0.17, 0.17, 0.04, k.glass(0x5a7fc0, 0.9), 24), -0.65, 0.35, -2.35));
      const sensor = k.group(k.at(k.box(0.3, 0.02, 0.3, k.mat(0x2a8a52, { roughness: 0.6 })), -0.65, 0.27, -2.35));
      shaker.add(cam);
      add({ id: 'camera', name: 'Camera', obj: cam, pull: [-2.2, 1.8, -1.6], blockedBy: ['display'], face: [0, 1, 0], focusRadius: 1.2,
        say: 'The camera takes pictures. Light goes through the lens and lands on a tiny sensor.',
        job: 'It takes pictures and videos.',
        learn: ['It works like your eye. Light comes in through a round window and lands on a screen at the back.', 'The lens bends the light so the picture is sharp. The sensor behind it has millions of tiny dots that each measure how much light lands on them.', 'Each dot on the sensor turns the light it catches into a little bit of electricity, and the chip turns all those numbers into a picture.'] });
      sub(cam, 'camera', { id: 'lens', name: 'Camera lens', obj: lensG, pull: [-0.3, 1.0, -0.4], level: 3, face: [0, 1, 0], focusRadius: 0.8,
        say: 'The lens is a tiny clear window that bends the light so the picture is sharp.',
        job: 'It bends light so the picture is sharp.',
        learn: ['It is a little magnifying glass.', 'Several tiny lenses are stacked so colors and edges stay sharp.', 'Stacking several lenses corrects the color and shape errors a single lens would have.'] });
      sub(cam, 'camera', { id: 'sensor', name: 'Camera sensor', obj: sensor, pull: [0, 0.8, 0.4], level: 3, face: [0, 1, 0], focusRadius: 0.8,
        say: 'The sensor catches the light and turns it into a picture. It is made of millions of tiny dots.',
        job: 'It catches the light and turns it into a picture.',
        learn: ['It is like a tiny screen that catches the light instead of making it.', 'Each dot counts the light that lands on it. Put the counts together and you get a picture.', 'Each dot has a color filter in front of it, so the chip can work out the colors from red, green and blue counts.'] });

      // ---- small parts: speaker, vibration motor, charging port, SIM tray, selfie camera, flex cable
      const speaker = k.group(k.at(k.cyl(0.32, 0.32, 0.14, k.mat(0x2a2c33, { roughness: 0.5 }), 24), -0.7, 0.14, 2.6), k.at(k.cyl(0.18, 0.12, 0.05, metal, 20), -0.7, 0.22, 2.6));
      shaker.add(speaker);
      add({ id: 'speaker', name: 'Speaker', obj: speaker, pull: [-1.8, 1.8, 1.4], blockedBy: ['display'], level: 2, face: [0, 1, 0], focusRadius: 1.2,
        say: 'The speaker makes the sounds. It shakes a little piece to wiggle the air.',
        breaks: 'No speaker, so no sound. The ding is silent!',
        fact: 'Sound is wiggles in the air.',
        learn: ['It is like a drum that shakes the air so you can hear it.', 'A magnet and a coil of wire make the little cone go back and forth, and the cone pushes the air.', 'The signal from the chip is a tiny wobbling electricity. The coil follows that wobble and shakes the cone the same way.'],
        symptom: 'I cannot hear any sounds from the phone.' });
      const vib = k.group(k.at(k.cyl(0.26, 0.26, 0.1, k.metal(0x9aa0a8), 24), 0.75, 0.13, 2.55), k.at(k.box(0.14, 0.03, 0.2, k.metal(0xd8a24a)), 0.75, 0.2, 2.55));
      shaker.add(vib);
      add({ id: 'vib', name: 'Vibration motor', obj: vib, pull: [1.8, 1.8, 1.4], blockedBy: ['display'], level: 2, face: [0, 1, 0], focusRadius: 1,
        say: 'This little motor makes the phone buzz. It spins a lopsided weight.',
        breaks: 'It does not buzz anymore.',
        fact: 'A lopsided weight makes things wobble when it spins.',
        learn: ['It is like a washing machine with all the socks on one side. It shakes!', 'The motor spins a weight that is heavy on one side, and the whole phone wiggles with it.', 'It is the same idea as the rumble motors in a game controller, only a lot smaller.'],
        symptom: 'My phone does not buzz anymore.' });
      const port = k.group(k.at(k.rbox(0.55, 0.12, 0.3, metal, 0.03), 0, 0.12, 2.9), k.at(k.box(0.4, 0.06, 0.06, k.mat(0x151515)), 0, 0.12, 2.98));
      shaker.add(port);
      add({ id: 'port', name: 'Charging port', obj: port, pull: [0, 1.2, 2.0], blockedBy: ['display'], level: 2, face: [0, 1, 0], focusRadius: 1,
        say: 'This little socket is where the charging cable plugs in.',
        breaks: 'It still works, but now you cannot plug in a cable to charge it!', breaksAlways: true,
        job: 'It is where you plug in the cable to charge it.',
        learn: ['It is the door for the charging cable.', 'The little metal pins inside touch the cable\'s pins, and electricity goes in to refill the battery.', 'The same socket can carry information too, so you can plug the phone into a computer.'] });
      const sim = k.group(k.at(k.box(0.12, 0.05, 0.6, k.metal(0xcfd5dc)), 1.5, 0.14, -0.5), k.at(k.box(0.2, 0.04, 0.4, k.mat(0xd8c48a, { metalness: 0.6, roughness: 0.3 })), 1.3, 0.12, -0.5));
      shaker.add(sim);
      add({ id: 'sim', name: 'SIM tray', obj: sim, pull: [2.0, 0.2, 0.4], level: 2, face: [1, 0, 0], focusRadius: 1,
        say: 'The SIM tray holds a tiny card that tells the phone company which phone this is.',
        job: 'It holds the little card that connects the phone to the phone company.',
        learn: ['It is like a name tag for the phone so the phone company knows it is yours.', 'The tray slides in from the side. When it is out, the card sits on it, and you can swap the card to another phone.', 'The card holds a small chip with an identity code. Newer phones can use an electronic version instead.'] });
      const selfie = k.group(k.at(k.cyl(0.09, 0.09, 0.06, darkM, 16), 0, 0.17, -2.82), k.at(k.cyl(0.04, 0.04, 0.02, k.glass(0x5a7fc0, 0.9), 12), 0, 0.2, -2.82));
      shaker.add(selfie);
      add({ id: 'selfie', name: 'Front camera', obj: selfie, pull: [0, 1.6, -1.4], blockedBy: ['display'], level: 2, face: [0, 1, 0], focusRadius: 0.9,
        say: 'The front camera looks at you. It is for selfies and video calls.',
        job: 'It lets you take selfies and talk on video calls.',
        learn: ['It is a little eye on the front of the phone.', 'It is much smaller than the main camera, because it has less room.', 'It works the same way: a lens bends light onto a small sensor, and the chip turns it into a picture.'] });
      const flex = k.group(k.at(k.box(1.2, 0.012, 0.35, k.mat(0xd9892b, { roughness: 0.6 })), 0, 0.24, -0.95), k.at(k.box(0.5, 0.02, 0.1, k.metal(0xd8c48a)), 0, 0.25, -1.12));
      shaker.add(flex);
      add({ id: 'flex', name: 'Display cable', obj: flex, pull: [1.4, 1.4, -0.6], blockedBy: ['display'], level: 3, face: [0, 1, 0], focusRadius: 1,
        say: 'A thin bendy cable that sends the picture from the board up to the display.',
        breaks: 'The display cannot hear the board. The screen goes black!',
        fact: 'It is thin and flexible so it can fold into a tiny space.',
        learn: ['It is like a ribbon road that carries the picture from the brain to the screen.', 'It bends easily, so it can fold up and fit in a thin phone.', 'It has dozens of tiny copper lines, each carrying part of the picture signal.'],
        symptom: 'The phone is on, but the screen is all black.' });

      // ---- effects: ding and buzz tags
      const ding = k.label('ding!', { size: 0.4, bg: 'rgba(214,150,20,0.95)' }); ding.position.set(-0.7, 1.2, 2.6); ding.visible = false;
      const bzz = k.label('bzz bzz', { size: 0.36, bg: 'rgba(60,110,200,0.92)' }); bzz.position.set(0.9, 1.2, 2.6); bzz.visible = false;
      root.add(ding, bzz);

      return { root, shell: [], parts, refs: { shaker, ding, bzz, clock: 0, pic: picMat } };
    },

    evaluate(has, on) {
      const power = has('battery') && has('board') && has('chip');
      const alive = on && power;
      let reason = '';
      if (on && !power) reason = !has('battery') ? 'There is no battery, so the phone has no electricity.' : 'The brain is missing, so the phone cannot wake up.';
      return { alive, reason, show: alive && has('display') && has('flex'), ring: alive && has('speaker'), buzz: alive && has('vib') };
    },

    apply(out, inst) {
      const r = inst.refs;
      inst.parts.forEach((p) => { p.blockedBy = p.blockedBy.filter((b) => inst.byId[b]); }); // drop blockers that are not separate pieces at this level
      const pics = inst.byId.display ? inst.byId.display.meshes.filter((m) => m.name === 'pic') : [];
      pics.forEach((m) => { m.material.color.setHex(out.show ? 0xffffff : 0x0d0e12); });
      if (!out.alive) { r.clock = 0; r.ding.visible = false; r.bzz.visible = false; }
    },

    tick(dt, t, inst, out) {
      const r = inst.refs;
      if (!out) return;
      if (out.alive) r.clock += dt;
      const c = r.clock % 4, msg = out.alive && c > 1 && c < 1.8;
      r.ding.visible = msg && !!out.ring;
      r.bzz.visible = msg && !!out.buzz;
      const amp = msg && out.buzz ? 0.035 : 0;
      r.shaker.position.set(Math.sin(t * 80) * amp, 0, Math.cos(t * 67) * amp * 0.8);
    },
  });

  Object.assign(TAL.insideByName, {
    'Display layer': 'lcd-pixel', 'Glass screen': 'lcd-pixel', 'Main board': 'pcb-inside', 'Main chip': 'chip-package',
    'Board screw': 'screw-inside', 'Battery': 'battery-inside', 'Speaker': 'speaker-inside',
  });
})();
