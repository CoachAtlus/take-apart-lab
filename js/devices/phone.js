/* Phone, lying face up. Beginner 6 pieces, Medium 30, Advanced 84.
 * Power lights the screen with a simple picture; no battery means it turns off; no display layer means a black screen.
 * Every so often it gets a "message": the speaker dings and the vibration motor buzzes, then the screen feels a tap
 * and the camera snaps. Each of those needs its real parts (touch layer + touch chip, lens + sensor + camera cable, ...).
 * Advanced follows a real smartphone teardown: glass, touch layer, display, glue, battery (pack, protection board, flex,
 * pull tabs), logic board (chip + memory, storage, modem under a shield, power chip, audio chip, crystal, connectors,
 * passives), cameras, speakers, microphones, buttons, SIM, antennas, wireless charging coil, back glass. */
(function () {
  const T = window.THREE;
  const W = 3.0, L = 6.0; // phone width (x) and length (z)
  const BY = 0.125; // top surface of the main board

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

  // faint grid of the touch sensor lines, drawn over a clear layer
  const gridTex = (k) => k.canvasTex(128, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.strokeStyle = 'rgba(60,120,200,0.4)'; c.lineWidth = 1.5;
    for (let x = 8; x < w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    c.strokeStyle = 'rgba(200,120,40,0.4)';
    for (let y = 8; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  });

  TAL.registerDevice({
    id: 'phone',
    name: 'Phone',
    short: 'phone',
    subtitle: 'A tiny computer in your pocket',
    powerSound: 'flat',
    channels: false,
    view: { target: [0, -0.4, 0], radius: 5.0, explodedRadius: 11.5, explodedY: 1.0, yaw: 0, pitch: 0.95, shadow: [8, 9] },
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
      const parts = [], objs = {};
      const metal = k.metal(0xb9bec6);
      const darkM = k.mat(0x16171b, { roughness: 0.3 });
      const bx = (w, h, d, m, x, y, z) => k.at(k.box(w, h, d, m), x, y, z);
      let nFan = 0;
      // an outward, slightly varied explode vector from a spot (x,z) in the part's parent's frame
      const fan = (x, z, up, s) => {
        const i = nFan++;
        return [+(x * s + 0.45 * Math.cos(i * 2.4)).toFixed(2), +(up + (i % 3) * 0.4).toFixed(2), +(z * s + 0.45 * Math.sin(i * 2.4)).toFixed(2)];
      };
      // register a part: s.parent nests it inside that part, s.fuse says which part it rides inside at lower levels
      const reg = (s) => {
        objs[s.id] = s.obj;
        if (s.parent) objs[s.parent].add(s.obj); else shaker.add(s.obj);
        if (!s.face) s.face = [0, 1, 0];
        if (!s.focusRadius) s.focusRadius = 0.7;
        parts.push(s);
        return s;
      };
      // component on the main board (top surface at BY): footprint w x d, height h
      const comp = (w, d, h, color, x, z) => bx(w, h, d, k.mat(color, { roughness: 0.35 }), x, BY + h / 2, z);

      // ================================================================ FRAME and BACK GLASS
      const fm = k.metal(0x8c939c, { roughness: 0.4 });
      const frame = k.group(
        k.at(k.rbox(W, 0.06, L, fm, 0.02), 0, 0.03, 0),
        k.at(k.box(0.1, 0.34, L, fm), -W / 2 + 0.05, 0.2, 0), k.at(k.box(0.1, 0.34, L, fm), W / 2 - 0.05, 0.2, 0),
        k.at(k.box(W, 0.34, 0.1, fm), 0, 0.2, -L / 2 + 0.05), k.at(k.box(W, 0.34, 0.1, fm), 0, 0.2, L / 2 - 0.05)
      );
      reg({ id: 'frame', name: 'Phone frame', obj: frame, pull: [0, 0.25, 0], blockedBy: [], focusRadius: 5, face: [0, -1, 0],
        say: 'The frame is the strong metal tray. All the parts sit in it.',
        job: 'It holds all the parts together and keeps them safe.',
        learn: ['It is like the tray that holds your toys in a box.', 'It is usually metal or tough plastic. It is stiff so the phone does not bend in your pocket.', 'Metal also helps carry heat away from the chip, and some frames double as part of the antenna.'] });

      const bgm = k.glass(0x9fb4c8, 0.85, { depthWrite: true });
      const back = k.group(k.at(k.rbox(W - 0.02, 0.05, L - 0.02, bgm, 0.03), 0, -0.03, 0));
      reg({ id: 'backglass', name: 'Back glass', obj: back, level: 2, fuse: 'frame', pull: [0, -0.12, 0], blockedBy: ['frame'], face: [0, -1, 0], focusRadius: 5,
        say: 'The back glass is the shiny cover on the back of the phone.',
        job: "It covers the back, and it lets the charging pad's invisible magnetic push reach the coil inside.",
        learn: ['It is like the lid on a lunchbox.', 'Glass lets wireless charging work. A metal back would block the invisible push that the charging pad sends.', 'The back glass is stuck on with glue and has a coil of wire on its inner side that catches the charging pad signal.'] });
      const coil = k.group(
        k.at(k.rot(k.mesh(new T.TorusGeometry(0.8, 0.028, 6, 32), k.metal(0xc9772c, { roughness: 0.4 })), Math.PI / 2, 0, 0), 0, 0.004, 1.0),
        k.at(k.rot(k.mesh(new T.TorusGeometry(0.62, 0.028, 6, 28), k.metal(0xc9772c, { roughness: 0.4 })), Math.PI / 2, 0, 0), 0, 0.004, 1.0),
        k.at(k.rot(k.mesh(new T.TorusGeometry(0.44, 0.028, 6, 24), k.metal(0xc9772c, { roughness: 0.4 })), Math.PI / 2, 0, 0), 0, 0.004, 1.0)
      );
      reg({ id: 'coil', name: 'Wireless charging coil', obj: coil, parent: 'backglass', level: 2, pull: [0, 1.6, 2.2],
        say: 'A flat coil of copper wire. It catches the invisible push from a charging pad.',
        job: 'It lets you charge the phone by setting it on a charging pad, with no cable.',
        learn: ['It is like a little catcher for an invisible push.', 'A charging pad makes a changing magnetic field. When that field wiggles through the coil, it makes electricity in the wire.', 'This is the same trick as a transformer: one coil in the pad, one coil in the phone, and energy crosses the gap between them.'] });

      // ================================================================ GLASS, TOUCH LAYER, DISPLAY
      const glass = k.group(k.at(k.rbox(W - 0.04, 0.04, L - 0.04, k.glass(0xdff3ff, 0.18), 0.03), 0, 0.38, 0), k.at(k.box(0.3, 0.005, L - 0.8, k.mat(0xffffff, { transparent: true, opacity: 0.07, depthWrite: false })), -0.7, 0.405, 0));
      reg({ id: 'glass', name: 'Glass screen', obj: glass, pull: [-3.8, 3.4, 0.8], blockedBy: [], focusRadius: 4.5,
        say: 'The glass is the clear top. Your finger touches it. It keeps the screen safe from scratches.',
        job: 'It protects the screen and is what your finger touches.',
        learn: ['It is like a window over the picture. You touch the window, not the picture.', 'The glass is made extra tough so it does not scratch or crack easily. Under it is a layer that notices your finger.', 'The touch layer feels the tiny electric field your finger changes when it gets close. The phone turns that into where you tapped.'] });

      const touchMat = new T.MeshBasicMaterial({ map: gridTex(k), transparent: true, depthWrite: false, toneMapped: false });
      const touchPl = k.mesh(new T.PlaneGeometry(W - 0.24, L - 0.24), touchMat);
      k.rot(touchPl, -Math.PI / 2, 0, 0); k.at(touchPl, 0, 0.352, 0);
      const touch = k.group(k.at(k.box(W - 0.24, 0.008, L - 0.24, k.mat(0xcfe6f5, { transparent: true, opacity: 0.1, depthWrite: false })), 0, 0.346, 0), touchPl);
      touch.children.forEach((c) => { c.name = 'touchbit'; });
      reg({ id: 'touch', name: 'Touch layer', obj: touch, level: 2, fuse: 'glass', pull: [-3.8, 1.9, -1.4], blockedBy: ['glass'], focusRadius: 4.5,
        say: 'A thin clear layer with a grid of tiny wires. It feels where your finger is.',
        breaks: 'The picture is still there, but the phone cannot feel your finger. Taps do nothing!', breaksAlways: true,
        symptom: 'The picture looks fine, but the phone does not feel my finger.',
        learn: ['It is like a net of invisible threads that notices when you touch it.', 'Your finger is a tiny bit electric, so when it gets close to the grid it changes the electric field there. The phone sees which crossing changed.', 'The touch chip on the board checks every crossing of the grid many times each second and tells the phone exactly where your finger is.'] });

      const picMat = new T.MeshBasicMaterial({ map: pictureTex(k), toneMapped: false, color: 0x0d0e12 });
      const pic = k.mesh(new T.PlaneGeometry(W - 0.3, L - 0.3), picMat); pic.name = 'pic';
      k.rot(pic, -Math.PI / 2, 0, 0); k.at(pic, 0, 0.336, 0);
      const display = k.group(k.at(k.box(W - 0.2, 0.04, L - 0.2, k.mat(0x0b0b0e, { roughness: 0.4 })), 0, 0.31, 0), pic);
      reg({ id: 'display', name: 'Display layer', obj: display, pull: [4.4, 2.6, 0], blockedBy: ['glass', 'touch', 'adhesive'], focusRadius: 4.5,
        say: 'The display makes the picture. It is made of millions of tiny colored dots.',
        breaks: 'No display, no picture! The screen is just black.',
        fact: 'Each tiny dot glows red, green or blue, and together they make the picture.',
        learn: ['It is like a giant picture made of colored beads. Each bead is a tiny dot of light.', 'Each dot is made of three little parts: red, green and blue. Mix them and you can make any color.', 'Some phone screens are LCDs, like the picture you can look inside here. Others are OLED, where each dot makes its own light.'],
        symptom: 'The phone is on, but the screen is all black.' });

      const glue = k.mat(0xe8e2d0, { roughness: 1 });
      const adh = k.group(
        bx(W - 0.2, 0.02, 0.14, glue, 0, 0.27, -L / 2 + 0.2), bx(W - 0.2, 0.02, 0.14, glue, 0, 0.27, L / 2 - 0.2),
        bx(0.14, 0.02, L - 0.6, glue, -W / 2 + 0.2, 0.27, 0), bx(0.14, 0.02, L - 0.6, glue, W / 2 - 0.2, 0.27, 0)
      );
      reg({ id: 'adhesive', name: 'Screen glue', obj: adh, level: 3, pull: [0, 1.4, -4.2], blockedBy: ['glass', 'touch'], focusRadius: 4.5,
        say: 'A thin sticky frame that glues the screen in, like double-sided tape.',
        breaks: 'The screen still works, but it is not stuck in anymore and could pop loose!', breaksAlways: true,
        job: 'It holds the screen in and keeps dust and water out.',
        learn: ['It is like double-sided tape around the edge of a picture.', 'It also seals the edge so dust and splashes cannot sneak in.', 'This glue is why repairing a screen takes careful heating to soften it before the screen comes off.'] });

      // ================================================================ BATTERY (pack, protection board, flex, pull tabs)
      const battery = k.group(k.at(k.rbox(2.4, 0.12, 2.5, k.mat(0x8f9bb0, { roughness: 0.5 }), 0.04), 0, 0.14, 1.0));
      reg({ id: 'battery', name: 'Battery', obj: battery, pull: [0, 3.2, 3.2], blockedBy: ['display', 'pull1', 'pull2', 'bcover'], focusRadius: 3,
        say: 'The battery is the big flat part. It stores the electricity that powers the phone.',
        breaks: 'No battery, no electricity. The phone turns off!',
        fact: 'The battery takes up a big part of the phone.',
        learn: ["It is the phone's lunchbox of electricity. When it is empty, you plug in to refill it.", 'It is a thin, flat battery that gives out electricity and takes it back while charging.', 'Phone batteries are usually lithium ion. A little protection chip stops them from getting too full or too hot.'],
        symptom: 'The phone will not turn on at all.' });
      const prot = k.group(bx(1.0, 0.012, 0.28, k.mat(0x2c8b57, { roughness: 0.6 }), 0, 0.206, 2.05), bx(0.18, 0.03, 0.12, 0x18181b, -0.25, 0.227, 2.05), bx(0.12, 0.03, 0.1, 0x18181b, 0.15, 0.227, 2.05), bx(0.06, 0.03, 0.06, 0x3a5fa8, 0.35, 0.227, 2.05));
      reg({ id: 'prot', name: 'Battery protection board', obj: prot, parent: 'battery', level: 2, pull: [0, 1.4, 1.6], blockedBy: [],
        say: 'A tiny green board on the battery. It keeps the battery safe.',
        breaks: 'Without its safety helper the battery is not allowed to give out power. The phone turns off!',
        symptom: 'The phone will not turn on, even though the battery looks fine.',
        learn: ['It is like a lifeguard for the battery.', 'It watches the battery and switches it off if it gets too full, too empty, too hot, or if something touches by mistake.', 'It is a small circuit board with a couple of chips that measure voltage and current and can cut the battery off in a split second.'] });
      const bflexM = k.mat(0xd9892b, { roughness: 0.6 });
      const bflex = k.group(bx(0.28, 0.012, 0.75, bflexM, 0.85, 0.21, -0.6), bx(0.2, 0.014, 0.12, k.metal(0xd8c48a), 0.85, 0.216, -0.97));
      reg({ id: 'battflex', name: 'Battery cable', obj: bflex, parent: 'battery', level: 3, pull: [1.6, 1.0, -1.0], blockedBy: ['bcover'],
        say: 'A thin orange ribbon that carries the battery power over to the board.',
        breaks: 'The battery cannot reach the board. No electricity, and the phone turns off!',
        symptom: 'The phone will not turn on, even though the battery looks fine.',
        learn: ['It is like a ribbon road for electricity.', 'It is thin and bendy so it can fold into a tight space. It has a tiny gold plug on the end.', 'The plug presses onto a small connector on the board. A metal cover holds it down so a bump will not shake it loose.'] });
      [[-0.15, 1], [0.15, 2]].forEach(([x, n]) => {
        const tab = k.group(bx(0.1, 0.012, 1.7, k.mat(0xe8e2d0, { roughness: 1 }), x, 0.074, 1.9), bx(0.1, 0.014, 0.24, k.mat(0x58b8ff, { roughness: 0.8 }), x, 0.075, 2.78));
        reg({ id: 'pull' + n, name: 'Battery pull tab', obj: tab, level: 3, fuse: 'battery', pull: [x * 6 + (n === 1 ? -0.8 : 0.8), 0.7, 3.4 + n * 0.5], blockedBy: [], focusRadius: 1,
          say: 'A sticky strip under the battery with a little tab sticking out. You pull it to let the battery go.',
          job: 'It glues the battery down, and pulling it slowly lets the battery come out safely.',
          learn: ['It is like the tape strip on a sticky note that lets go when you peel it.', 'The strip stretches a long way when you pull it low and slow, and then it lets go without leaving glue behind.', 'Pulling it fast or poking at the battery with tools can bend the battery, so repair guides say to pull steadily.'] });
      });

      // ================================================================ MAIN BOARD
      const pcb = k.board(2.4, 1.6, { seed: 11, color: 0x1f5f3a, count: 0 });
      k.at(pcb, 0, 0.1, -1.8);
      const board = k.group(pcb);
      reg({ id: 'board', name: 'Main board', obj: board, pull: [0, 3.0, -3.4], blockedBy: ['display', 'bs1', 'bs2', 'bs3', 'bs4'], reach: ['display'], focusRadius: 2.4,
        say: "The main board is the phone's brain. It is a small green board with chips on it.",
        breaks: 'No brain! The phone cannot think and nothing works.',
        fact: 'The board joins the chip, camera, speaker and screen.',
        learn: ['It is like the control room of the phone. Every part sends its news here.', 'Tiny copper roads on the board carry electricity and messages between the chip and all the other parts.', 'The board is a many-layered sandwich of thin copper and fiberglass, so lots of tiny roads can cross without touching.'],
        symptom: 'The phone will not turn on at all.' });
      const chip = k.group(bx(0.7, 0.1, 0.7, k.mat(0x16171b, { roughness: 0.3 }), 0.35, 0.18, -1.9), bx(0.35, 0.004, 0.1, k.mat(0xdddddd), 0.35, 0.231, -1.9));
      reg({ id: 'chip', name: 'Main chip', obj: chip, parent: 'board', level: 2, pull: [0, 2.2, 0.8], blockedBy: [], focusRadius: 1,
        say: 'This is the main chip. It does all the thinking for the phone.',
        breaks: 'No thinker! The phone cannot do anything.',
        fact: 'A phone chip has billions of tiny switches.',
        learn: ["It is the phone's brain. It decides what to show and what to do.", 'It runs your apps, listens to the touch, and tells the screen what to draw, many times every second.', 'It is a system on a chip: the main processor, the graphics and more are all packed onto one tiny piece of silicon.'],
        symptom: 'The phone will not turn on at all.' });
      const ram = k.group(bx(0.6, 0.06, 0.6, k.mat(0x2a2d36, { roughness: 0.3 }), 0.35, 0.265, -1.9), bx(0.2, 0.004, 0.06, k.mat(0xbbbbbb), 0.35, 0.297, -1.9));
      reg({ id: 'ram', name: 'Memory chip', obj: ram, parent: 'chip', level: 2, pull: [0.6, 1.6, 0.4], blockedBy: [],
        say: 'This chip sits right on top of the main chip. It is the phone\'s quick memory, like a notepad.',
        breaks: 'No notepad! The phone has nowhere to keep what it is doing right now, so it stops.',
        symptom: 'The phone will not turn on at all.',
        learn: ['It is like a notepad you scribble on while you work. When you finish, you toss it.', 'It is called RAM. The chip uses it to hold the apps and pictures you are using right now, because it is very fast.', 'RAM forgets everything when the power goes off. That is why phones also have storage that remembers.'] });
      const stor = comp(0.5, 0.3, 0.05, 0x23262e, 0.55, -1.28);
      reg({ id: 'storage', name: 'Storage chip', obj: k.group(stor, bx(0.2, 0.004, 0.06, k.mat(0xbbbbbb), 0.55, BY + 0.052, -1.28)), parent: 'board', level: 2, pull: fan(0.55, 0.52, 1.1, 1.3), blockedBy: [],
        say: 'This chip is the phone\'s long memory. Your photos, songs and apps live here.',
        breaks: 'No long memory! The phone cannot find its apps, so it cannot start.',
        symptom: 'The phone will not turn on at all.',
        learn: ['It is like a toy box where everything stays put, even when the lights are off.', 'It is flash memory. It keeps your stuff with no power at all, so your photos are still there tomorrow.', 'Flash stores data as tiny trapped bits of charge. It is slower than RAM but it does not forget.'] });
      const shield = (() => {
        const m = k.metal(0xaeb4bc, { roughness: 0.35 }), w = 0.87, d = 0.46, h = 0.14, x = -0.685, z = -1.65;
        return k.group(bx(w, 0.015, d, m, x, BY + h, z), bx(w, h, 0.015, m, x, BY + h / 2, z - d / 2), bx(w, h, 0.015, m, x, BY + h / 2, z + d / 2), bx(0.015, h, d, m, x - w / 2, BY + h / 2, z), bx(0.015, h, d, m, x + w / 2, BY + h / 2, z));
      })();
      reg({ id: 'shield', name: 'Metal shield', obj: shield, parent: 'board', level: 2, pull: fan(-0.685, 0.15, 1.6, 1.0), blockedBy: [],
        say: 'A little metal lid over the radio chips. It keeps the radio noise in and the outside noise out.',
        job: 'It shields the radio chips from electrical noise and protects them.',
        learn: ['It is like a lid on a pot, so nothing splashes in or out.', 'Radio chips make and hear very faint signals. The metal can blocks other electrical noise from the other chips.', 'It is a thin metal box with no gaps, soldered to the board. It acts like a Faraday cage for the chips under it.'] });
      reg({ id: 'modem', name: 'Modem chip', obj: comp(0.4, 0.3, 0.04, 0x1d2027, -0.82, -1.65), parent: 'board', level: 2, pull: fan(-0.82, 0.15, 0.8, 1.3), blockedBy: ['shield'],
        say: 'The modem is the phone\'s talking chip. It talks to the phone towers.',
        job: 'It lets the phone make calls and use the internet from far away.',
        learn: ['It is like the phone\'s radio talker and listener.', 'It turns your voice and data into radio signals going out, and turns the signals coming in back into data.', 'A modem has to work with many radio bands and standards, so it is one of the most complicated chips in the phone.'] });
      reg({ id: 'rf', name: 'Radio chip', obj: comp(0.2, 0.2, 0.035, 0x2b2f3a, -0.4, -1.65), parent: 'board', level: 3, pull: fan(-0.4, 0.15, 1.2, 1.3), blockedBy: ['shield'],
        say: 'A small radio chip. It hands the radio signal to the antenna and takes it back.',
        job: 'It connects the modem to the antennas.',
        learn: ['It is like a gate between the talker and the antenna.', 'It boosts the faint signal from the tower and prepares the outgoing signal to be sent out.', 'It sits next to the modem under the shield, and it has to work with the exact radio bands the phone is allowed to use.'] });
      reg({ id: 'pmic', name: 'Power chip', obj: comp(0.3, 0.3, 0.045, 0x20242c, -0.05, -1.27), parent: 'board', level: 2, pull: fan(-0.05, 0.53, 1.0, 1.3), blockedBy: [],
        say: 'The power chip hands out electricity to every other part, in the right amounts.',
        breaks: 'Nobody hands out the electricity! The parts get no power, so the phone turns off.',
        symptom: 'The phone will not turn on, and nothing lights up.',
        learn: ['It is like a lunch lady giving each kid the right portion.', 'Different chips need different amounts of electricity. The power chip changes the battery voltage into each of those, and it also manages charging.', 'It works with the little coils and capacitors near it to make steady voltages from the battery.'] });
      reg({ id: 'audio', name: 'Audio chip', obj: comp(0.28, 0.28, 0.04, 0x1b1e25, 0.4, -2.45), parent: 'board', level: 2, pull: fan(0.4, -0.65, 1.0, 1.3), blockedBy: [],
        say: 'This chip handles sound. It makes the sounds for the speaker and listens to the microphones.',
        breaks: 'The speaker gets no sound to play. The ding is silent!',
        symptom: 'I cannot hear any sounds from the phone.',
        learn: ['It is like a translator between the phone and your ears.', 'The phone thinks in numbers. The audio chip turns numbers into a wobbly electric signal for the speaker, and turns the microphone signal back into numbers.', 'It also has a little amplifier so the signal is strong enough to move the speaker.'] });
      reg({ id: 'touchctl', name: 'Touch chip', obj: comp(0.28, 0.28, 0.04, 0x1f232b, -0.75, -1.2), parent: 'board', level: 3, pull: fan(-0.75, 0.6, 1.0, 1.3), blockedBy: [],
        say: 'This chip watches the touch layer all day, so it knows where your finger is.',
        breaks: 'Nobody is watching the touch layer! The phone cannot feel your finger.',
        breaksAlways: true,
        symptom: 'The picture looks fine, but the phone does not feel my finger.',
        learn: ['It is like a guard who keeps checking the net for a touch.', 'It sends tiny signals along the grid and listens for tiny changes where your finger is.', 'It does this many times every second, so it can follow your finger as you swipe.'] });
      reg({ id: 'crystal', name: 'Crystal', obj: bx(0.2, 0.07, 0.12, k.metal(0xcfd3d8, { roughness: 0.3 }), 0.72, BY + 0.035, -2.52), parent: 'board', level: 2, pull: fan(0.72, -0.72, 1.0, 1.4), blockedBy: [],
        say: 'A tiny silver box with a crystal inside. It ticks very steadily, like a drummer keeping the beat.',
        breaks: 'The beat stops! The chips lose their rhythm, so the phone stops working.',
        symptom: 'The phone will not turn on, and the screen stays dark.',
        learn: ['It is like a drummer that keeps every chip stepping together.', 'A thin slice of quartz crystal shakes at one exact speed when electricity touches it. The chip counts those shakes to keep time.', 'The chips need that steady beat to do things in order, and to keep the clock right.'] });
      reg({ id: 'wifi', name: 'Wi-Fi chip', obj: comp(0.3, 0.3, 0.04, 0x232730, 1.0, -2.0), parent: 'board', level: 3, pull: fan(1.0, -0.2, 1.0, 1.3), blockedBy: [],
        say: 'This chip talks to Wi-Fi at home, and to other things like headphones.',
        job: 'It connects the phone to Wi-Fi and Bluetooth.',
        learn: ['It is like a chat chip for the house.', 'It sends and hears radio signals to your Wi-Fi box, so the phone can get on the internet without a cable.', 'The same chip often does Bluetooth too, which links the phone to headphones, watches and speakers.'] });
      reg({ id: 'nfc', name: 'Tap-to-pay chip', obj: comp(0.22, 0.22, 0.035, 0x2a2e38, 1.0, -1.6), parent: 'board', level: 3, pull: fan(1.0, 0.2, 1.0, 1.3), blockedBy: [],
        say: 'This chip lets the phone talk to things that are really close, like a card reader.',
        job: 'It lets you tap the phone to pay or to share something.',
        learn: ['It is like a whisper that only works when you are very close.', 'It talks using a tiny short-range radio called NFC. A reader needs to be only a few centimeters away.', 'It only works from very close, so a stranger across the room cannot read it. That helps keep it safe.'] });
      reg({ id: 'motion', name: 'Motion sensor', obj: comp(0.16, 0.16, 0.035, 0x1c1f26, -0.15, -2.15), parent: 'board', level: 3, pull: fan(-0.15, -0.35, 1.0, 1.5), blockedBy: [],
        say: 'A tiny chip that feels when the phone tilts, turns or shakes.',
        job: 'It tells the phone which way is up, so the screen can turn sideways when you do.',
        learn: ['It is like the tummy feeling you get on a swing.', 'It has tiny moving bits of silicon that lean a little when the phone moves. The chip measures that lean.', 'It is two sensors in one: one feels pushes and tilts, and one feels turning.'] });
      // connectors
      reg({ id: 'dconn', name: 'Display connector', obj: comp(0.6, 0.1, 0.08, 0x2a2a30, 0, -1.07), parent: 'board', level: 3, pull: fan(0, 0.73, 0.9, 1.3), blockedBy: ['flex'],
        say: 'A tiny socket on the board. The display cable plugs in here.',
        breaks: 'The screen cable has nothing to plug into. The screen goes black!',
        symptom: 'The phone is on, but the screen is all black.',
        learn: ['It is like a wall socket for a cable.', 'It has a row of tiny metal contacts that line up with the cable\'s copper lines.', 'The cable just presses on, with no solder, so a repair person can unplug it.'] });
      reg({ id: 'bconn', name: 'Battery connector', obj: comp(0.3, 0.1, 0.08, 0x2a2a30, 0.85, -1.05), parent: 'board', level: 3, pull: fan(0.85, 0.75, 0.9, 1.3), blockedBy: ['battflex'],
        say: 'A tiny socket on the board. The battery cable plugs in here.',
        breaks: 'The battery cable has nothing to plug into. No electricity, and the phone turns off!',
        symptom: 'The phone will not turn on, even though the battery looks fine.',
        learn: ['It is like a wall socket for the battery.', 'It has small metal contacts that press onto the gold plug of the battery cable.', 'Repair guides tell you to unplug this first so the phone cannot turn on while you work.'] });
      // inductors, capacitors, resistors, diode (small passives that really are there)
      const indM = k.mat(0x3b3d44, { roughness: 0.5 });
      [[0.2, -1.4], [-0.4, -1.2]].forEach(([x, z]) => {
        reg({ id: 'ind' + (x > 0 ? 1 : 2), name: 'Power coil', obj: bx(0.15, 0.08, 0.15, indM, x, BY + 0.04, z), parent: 'board', level: 3, pull: fan(x, z + 1.8, 1.0, 1.3), blockedBy: [],
          say: 'A little coil of wire in a box. It helps the power chip change one voltage into another.',
          job: 'It smooths and changes the electricity for the power chip.',
          learn: ['It is like a spring for electricity that soaks up bumps.', 'A coil stores energy in a magnetic push while current flows, and gives it back later. That helps turn the battery voltage into smaller steady ones.', 'It works with the power chip many thousands of times each second to keep the voltage steady.'] });
      });
      const capM = k.mat(0xb08d5a, { roughness: 0.5 });
      [[-0.15, -1.7], [-0.15, -1.55], [0.9, -2.3], [1.1, -1.78], [0.8, -1.5], [-1.0, -1.37], [-0.3, -1.95], [0.5, -1.49]].forEach(([x, z], i) => {
        reg({ id: 'cap' + (i + 1), name: 'Capacitor', obj: bx(0.1, 0.06, 0.07, capM, x, BY + 0.03, z), parent: 'board', level: 3, pull: fan(x, z + 1.8, 0.9, 1.4), blockedBy: [],
          say: 'A tiny part that stores a little bit of electricity for a moment, like a mini bucket.',
          job: 'It keeps the electricity steady for the chip next to it.',
          learn: ['It is like a tiny bucket of electricity.', 'It fills up when there is extra and gives some back when a chip needs a quick drink. That keeps the power from wobbling.', 'There are hundreds of these on a phone board. Each sits right next to the chip it helps.'] });
      });
      const resM = k.mat(0x232326, { roughness: 0.5 });
      [[0.1, -2.4], [-0.2, -2.4], [0.8, -1.7], [0.95, -1.4]].forEach(([x, z], i) => {
        reg({ id: 'res' + (i + 1), name: 'Resistor', obj: k.group(bx(0.09, 0.03, 0.05, resM, x, BY + 0.015, z), bx(0.015, 0.032, 0.05, metal, x - 0.04, BY + 0.016, z), bx(0.015, 0.032, 0.05, metal, x + 0.04, BY + 0.016, z)), parent: 'board', level: 3, pull: fan(x, z + 1.8, 0.9, 1.4), blockedBy: [],
          say: 'A tiny part that squeezes the electricity a little, like a narrow pipe.',
          job: 'It limits how much electricity goes to the next part.',
          learn: ['It is like a narrow part of a water pipe.', 'It slows the flow of electricity so the next part gets just the right amount.', 'It is a small slab of material that does not let electricity pass easily. A thicker or thinner slab makes a bigger or smaller squeeze.'] });
      });
      reg({ id: 'diode', name: 'Diode', obj: k.group(bx(0.1, 0.05, 0.06, k.mat(0x18181b), 0.05, BY + 0.025, -2.55), bx(0.015, 0.052, 0.06, metal, 0.02, BY + 0.026, -2.55)), parent: 'board', level: 3, pull: fan(0.05, -0.75, 0.9, 1.5), blockedBy: [],
        say: 'A one-way gate for electricity. It guards a part from a sudden zap.',
        job: 'It protects the chips from sudden zaps of static electricity.',
        learn: ['It is like a one-way door.', 'Electricity can go through one way but not the other. Some diodes guard a pin by sending a sudden zap safely away.', 'Diodes are made from two kinds of silicon joined together, with a one-way wall where they meet.'] });
      [[-1.05, -2.45], [1.05, -2.45], [-1.05, -1.2], [1.05, -1.2]].forEach(([x, z], i) => {
        const sc = k.at(k.screw(0x9ea3ab, 0.12), x, 0.13, z);
        sc.scale.setScalar(0.65);
        reg({ id: 'bs' + (i + 1), name: 'Board screw', kind: 'screw', obj: sc, pull: [0, 0.8, 0], level: 3, fuse: 'board',
          say: 'A tiny screw. It holds the main board in place.',
          job: 'It keeps the board from sliding around.',
          learn: ['A screw is like a tiny spiral staircase that pulls things tight.', 'These are very tiny, and they are held in with a small special-shaped head.', 'Because they are so small, repair shops use special little screwdrivers and keep the screws in order.'] });
      });

      // ================================================================ CAMERA (motor, lens, filter, sensor, cable)
      const cam = k.group(bx(0.7, 0.12, 0.7, k.mat(0x25262c, { roughness: 0.5 }), -0.65, 0.2, -2.35));
      reg({ id: 'camera', name: 'Camera', obj: cam, pull: [-3.0, 2.2, -1.6], blockedBy: ['display'], focusRadius: 1.2,
        say: 'The camera takes pictures. Light goes through the lens and lands on a tiny sensor.',
        breaks: 'No camera, no snap! The phone cannot take pictures.', fact: 'The camera is a stack: lens, filter and sensor.',
        symptom: 'The phone will not take any pictures.',
        learn: ['It works like your eye. Light comes in through a round window and lands on a screen at the back.', 'The lens bends the light so the picture is sharp. The sensor behind it has millions of tiny dots that each measure how much light lands on them.', 'Each dot on the sensor turns the light it catches into a little bit of electricity, and the chip turns all those numbers into a picture.'] });
      const motM = k.mat(0xb4662a, { roughness: 0.45 });
      const afm = k.group(bx(0.62, 0.05, 0.06, motM, -0.65, 0.285, -2.35 - 0.28), bx(0.62, 0.05, 0.06, motM, -0.65, 0.285, -2.35 + 0.28), bx(0.06, 0.05, 0.5, motM, -0.65 - 0.28, 0.285, -2.35), bx(0.06, 0.05, 0.5, motM, -0.65 + 0.28, 0.285, -2.35));
      reg({ id: 'afm', name: 'Focus motor', obj: afm, parent: 'camera', level: 3, pull: [-1.0, 1.4, -0.6], blockedBy: [], face: [0, 1, 0], focusRadius: 0.8,
        say: 'A tiny frame with a coil and magnets. It slides the lens a tiny bit to make the picture sharp.',
        breaks: 'The lens cannot move to focus, so pictures come out fuzzy.', breaksAlways: true,
        learn: ['It is like a tiny hand that nudges the lens to focus.', 'A coil of wire and a magnet push against each other, and the lens slides up and down just a little. More electricity means a bigger push.', 'This kind of motor is called a voice coil, because it works like the coil in a speaker.'] });
      reg({ id: 'lens', name: 'Camera lens', obj: k.group(k.at(k.cyl(0.24, 0.24, 0.1, metal, 24), -0.65, 0.3, -2.35), k.at(k.cyl(0.17, 0.17, 0.04, k.glass(0x5a7fc0, 0.9), 24), -0.65, 0.35, -2.35)), parent: 'camera', level: 3, pull: [-0.3, 1.2, -0.4], blockedBy: ['afm'], face: [0, 1, 0], focusRadius: 0.8,
        say: 'The lens is a tiny clear window that bends the light so the picture is sharp.',
        breaks: 'No lens, so the light is a blur! The pictures are spoiled.', breaksAlways: true,
        learn: ['It is a little magnifying glass.', 'Several tiny lenses are stacked so colors and edges stay sharp.', 'Stacking several lenses corrects the color and shape errors a single lens would have.'] });
      reg({ id: 'irf', name: 'Infrared filter', obj: k.at(k.cyl(0.2, 0.2, 0.008, k.glass(0x6a8ad8, 0.6), 20), -0.65, 0.28, -2.35), parent: 'camera', level: 3, pull: [0.2, 1.0, -0.5], blockedBy: ['lens'], face: [0, 1, 0], focusRadius: 0.7,
        say: 'A thin bluish glass disc. It blocks the heat light that your eyes cannot see.',
        job: 'It stops invisible infrared light, so the colors in pictures look right.',
        learn: ['It is like sunglasses that block one kind of light.', 'The sensor can see infrared light that our eyes cannot, and that would make colors look wrong, so the filter stops it.', 'It is a thin glass with a special coating that lets visible light through and bounces infrared away.'] });
      reg({ id: 'sensor', name: 'Camera sensor', obj: bx(0.3, 0.02, 0.3, k.mat(0x2a8a52, { roughness: 0.6 }), -0.65, 0.262, -2.35), parent: 'camera', level: 3, pull: [0, 0.8, 0.5], blockedBy: ['irf'], face: [0, 1, 0], focusRadius: 0.8,
        say: 'The sensor catches the light and turns it into a picture. It is made of millions of tiny dots.',
        breaks: 'No sensor, so nothing catches the light! No pictures.', breaksAlways: true,
        learn: ['It is like a tiny screen that catches the light instead of making it.', 'Each dot counts the light that lands on it. Put the counts together and you get a picture.', 'Each dot has a color filter in front of it, so the chip can work out the colors from red, green and blue counts.'] });
      reg({ id: 'camflex', name: 'Camera cable', obj: k.group(bx(0.35, 0.012, 0.1, k.mat(0xd9892b, { roughness: 0.6 }), -0.65, 0.15, -1.95), bx(0.2, 0.014, 0.05, k.metal(0xd8c48a), -0.65, 0.155, -1.9)), parent: 'camera', level: 3, pull: [-0.8, 0.8, 0.9], blockedBy: [], face: [0, 1, 0], focusRadius: 0.7,
        say: 'A thin ribbon that sends the picture from the camera to the board.',
        breaks: 'The picture cannot get from the camera to the board. No pictures!', breaksAlways: true,
        learn: ['It is like a ribbon road for pictures.', 'It carries the camera sensor\'s numbers to the main chip, and it carries power the other way.', 'It has many tiny copper lines, each carrying a piece of the picture data very fast.'] });
      reg({ id: 'flash', name: 'Flash light', obj: k.group(bx(0.14, 0.05, 0.14, k.mat(0xf3efe0, { roughness: 0.4, emissive: 0x806a30, emissiveIntensity: 0.4 }), -0.3, 0.155, -2.82), bx(0.16, 0.02, 0.16, k.mat(0x3a3a40), -0.3, 0.13, -2.82)), level: 2, fuse: 'camera', pull: [-1.0, 1.6, -1.5], blockedBy: ['display'], focusRadius: 0.8,
        say: 'A tiny bright light. It flashes when you take a photo in the dark, and it can be a flashlight.',
        job: 'It lights up dark scenes when you take a photo.',
        learn: ['It is like a tiny flashlight.', 'It is an LED, which makes light when electricity goes through it, with a yellow coating to make the light look white.', 'It can flash for a split second for a photo, or stay on as a torch.'] });

      // ================================================================ SPEAKER, VIBRATION MOTOR, PORT, MICROPHONES
      const speaker = k.group(k.at(k.cyl(0.32, 0.32, 0.14, k.mat(0x2a2c33, { roughness: 0.5 }), 24), -0.7, 0.14, 2.6), k.at(k.cyl(0.18, 0.12, 0.05, metal, 20), -0.7, 0.22, 2.6));
      reg({ id: 'speaker', name: 'Loudspeaker', obj: speaker, level: 2, pull: [-3.0, 2.0, 2.0], blockedBy: ['display', 'ss1', 'ss2'], focusRadius: 1.2,
        say: 'The speaker makes the sounds. It shakes a little piece to wiggle the air.',
        breaks: 'No speaker, so no sound. The ding is silent!',
        fact: 'Sound is wiggles in the air.',
        learn: ['It is like a drum that shakes the air so you can hear it.', 'A magnet and a coil of wire make the little cone go back and forth, and the cone pushes the air.', 'The signal from the chip is a tiny wobbling electricity. The coil follows that wobble and shakes the cone the same way.'],
        symptom: 'I cannot hear any sounds from the phone.' });
      [[-1.05, 2.9, 1], [-0.35, 2.3, 2]].forEach(([x, z, n]) => {
        const sc = k.at(k.screw(0x9ea3ab, 0.12), x, 0.15, z);
        sc.scale.setScalar(0.55);
        reg({ id: 'ss' + n, name: 'Speaker screw', kind: 'screw', obj: sc, pull: [n === 1 ? -0.6 : 0.4, 0.8, 0.4], level: 3, fuse: 'speaker',
          say: 'A tiny screw. It holds the speaker in place.',
          job: 'It keeps the speaker from rattling.',
          learn: ['A screw is like a tiny spiral staircase that pulls things tight.', 'This screw clamps the speaker\'s little ear against the frame.', 'Without it the speaker could buzz against the frame when the sound gets loud.'] });
      });
      const vib = k.group(k.at(k.cyl(0.26, 0.26, 0.1, k.metal(0x9aa0a8), 24), 0.75, 0.13, 2.55));
      reg({ id: 'vib', name: 'Vibration motor', obj: vib, level: 2, pull: [3.0, 2.0, 2.0], blockedBy: ['display'], focusRadius: 1,
        say: 'This little motor makes the phone buzz. It spins a lopsided weight.',
        breaks: 'It does not buzz anymore.',
        fact: 'A lopsided weight makes things wobble when it spins.',
        learn: ['It is like a washing machine with all the socks on one side. It shakes!', 'The motor spins a weight that is heavy on one side, and the whole phone wiggles with it.', 'It is the same idea as the rumble motors in a game controller, only a lot smaller.'],
        symptom: 'My phone does not buzz anymore.' });
      reg({ id: 'vweight', name: 'Buzz weight', obj: bx(0.14, 0.03, 0.2, k.metal(0xd8a24a), 0.75, 0.2, 2.55), parent: 'vib', level: 3, pull: [0.8, 1.2, 0.2], blockedBy: [],
        say: 'A heavy little piece on one side. When it spins, it shakes the phone.',
        breaks: 'With no lopsided weight, the motor spins smoothly and the phone does not buzz.',
        symptom: 'My phone does not buzz anymore.',
        learn: ['It is like the socks piled on one side of the washing machine.', 'It is made of a heavy metal, so it pulls hard to one side as it spins.', 'The pull changes direction as it spins, which is what makes the phone shake back and forth.'] });
      reg({ id: 'port', name: 'Charging port', obj: k.group(bx(0.55, 0.12, 0.3, metal, 0, 0.12, 2.9), bx(0.4, 0.06, 0.06, k.mat(0x151515), 0, 0.12, 2.98)), level: 2, pull: [0, 1.4, 3.0], blockedBy: ['display', 'portflex'], focusRadius: 1,
        say: 'This little socket is where the charging cable plugs in.',
        breaks: 'It still works, but now you cannot plug in a cable to charge it!', breaksAlways: true,
        job: 'It is where you plug in the cable to charge it.',
        learn: ['It is the door for the charging cable.', "The little metal pins inside touch the cable's pins, and electricity goes in to refill the battery.", 'The same socket can carry information too, so you can plug the phone into a computer.'] });
      reg({ id: 'portflex', name: 'Charging cable', obj: k.group(bx(0.9, 0.012, 0.2, k.mat(0xd9892b, { roughness: 0.6 }), 0, 0.2, 2.62), bx(0.4, 0.014, 0.1, k.metal(0xd8c48a), 0, 0.206, 2.4)), level: 3, fuse: 'port', pull: [0, 1.2, 1.4], blockedBy: ['display'], focusRadius: 1,
        say: 'A thin ribbon that carries the charging electricity from the socket up to the board.',
        breaks: 'The charging socket cannot reach the battery, so you cannot refill it!', breaksAlways: true,
        learn: ['It is like a ribbon road from the socket to the board.', 'It carries the power from the cable plug toward the battery, and carries data too.', 'It is thin and bendy so it can wind around the other parts.'] });
      const micM = k.metal(0xcfd3d8, { roughness: 0.3 });
      [['mic1', 'Bottom microphone', 0.45, 2.9, 2, 'It is the one you talk into on a call.'], ['mic2', 'Top microphone', 1.15, -2.85, 3, 'It listens to the room so the phone can cancel noise.'], ['mic3', 'Rear microphone', -1.2, -2.3, 3, 'It listens when you film a video with the back camera.']].forEach(([id, name, x, z, lvl, sayIt]) => {
        reg({ id, name, obj: k.group(k.at(k.cyl(0.06, 0.06, 0.06, micM, 10), x, 0.16, z), k.at(k.cyl(0.02, 0.02, 0.02, k.mat(0x111111), 8), x, 0.2, z)), level: lvl, fuse: lvl === 2 ? 'frame' : 'board', pull: fan(x, z, 1.2, 1.3), blockedBy: ['display'], focusRadius: 0.6,
          say: 'A tiny hole with a thin skin inside that shivers when you talk. ' + sayIt,
          job: 'It hears sound and turns it into a tiny electric signal.',
          learn: ['It is like a tiny ear.', 'A very thin skin inside shivers when sound waves hit it. The chip next to it measures the shivers as electricity.', 'Phones have two or three microphones, so they can hear you clearly and tell your voice from the background noise.'] });
      });
      reg({ id: 'earpiece', name: 'Earpiece speaker', obj: k.group(bx(0.5, 0.08, 0.14, k.mat(0x2a2c33, { roughness: 0.5 }), 0.75, 0.16, -2.8), bx(0.34, 0.006, 0.06, k.mat(0x111111), 0.75, 0.205, -2.8)), level: 2, fuse: 'selfie', pull: [1.8, 1.6, -1.2], blockedBy: ['display'], focusRadius: 0.9,
        say: 'A small speaker at the top. It is quiet, for when you hold the phone to your ear.',
        job: 'It is the quiet speaker you hear during a phone call.',
        learn: ['It is like a little whisper speaker.', 'It works like the big speaker, but much smaller and softer, because it is right next to your ear.', 'It has a coil and a magnet, like the big one. The sound comes out through a narrow slot at the top of the screen.'] });

      // ================================================================ FRONT CAMERA, SENSOR
      const selfie = k.group(k.at(k.cyl(0.09, 0.09, 0.06, darkM, 16), 0, 0.17, -2.82));
      reg({ id: 'selfie', name: 'Front camera', obj: selfie, level: 2, pull: [0, 1.8, -1.9], blockedBy: ['display'], focusRadius: 0.9,
        say: 'The front camera looks at you. It is for selfies and video calls.',
        job: 'It lets you take selfies and talk on video calls.',
        learn: ['It is a little eye on the front of the phone.', 'It is much smaller than the main camera, because it has less room.', 'It works the same way: a lens bends light onto a small sensor, and the chip turns it into a picture.'] });
      reg({ id: 'slens', name: 'Front camera lens', obj: k.at(k.cyl(0.045, 0.045, 0.02, k.glass(0x5a7fc0, 0.9), 12), 0, 0.22, -2.82), parent: 'selfie', level: 3, pull: [0.3, 1.0, -0.4], blockedBy: [], focusRadius: 0.6,
        say: 'A tiny lens that bends the light for the front camera.',
        job: 'It bends the light so selfies are sharp.',
        learn: ['It is a tiny magnifying glass.', 'It is smaller than the rear lens, so the front camera is not as big.', 'It has to focus on things that are close, like your face.'] });
      reg({ id: 'ssensor', name: 'Front camera sensor', obj: bx(0.09, 0.012, 0.09, k.mat(0x2a8a52, { roughness: 0.6 }), 0, 0.205, -2.82), parent: 'selfie', level: 3, pull: [-0.3, 0.8, 0.4], blockedBy: ['slens'], focusRadius: 0.6,
        say: 'A tiny sensor that catches the light for the front camera.',
        job: 'It turns light into a picture of you.',
        learn: ['It is like a tiny screen that catches the light.', 'It has fewer dots than the rear sensor, but it is enough for a selfie.', 'It works the same way, counting the light that lands on each dot.'] });
      reg({ id: 'prox', name: 'Light sensor', obj: bx(0.1, 0.04, 0.1, k.mat(0x0d0e12, { roughness: 0.3 }), -0.65, 0.15, -2.85), level: 3, fuse: 'selfie', pull: [-1.2, 1.4, -1.1], blockedBy: ['display'], focusRadius: 0.6,
        say: 'A tiny eye that checks how bright it is, and whether your face is close to the screen.',
        job: 'It dims the screen in the dark and turns it off when it is against your ear.',
        learn: ['It is like a tiny eye on the top of the phone.', 'It measures how much light is around so the phone can make the screen brighter or dimmer.', 'It also sends out a little invisible light and watches for it to bounce back. If it does, your face must be close, and the screen turns off so your cheek does not tap it.'] });

      // ================================================================ SIM, SIDE BUTTONS, ANTENNAS
      const sim = k.group(k.at(k.box(0.12, 0.05, 0.6, k.metal(0xcfd5dc)), 1.5, 0.14, -0.5), k.at(k.box(0.22, 0.03, 0.45, k.mat(0x8a8f98, { metalness: 0.6, roughness: 0.4 })), 1.3, 0.12, -0.5));
      reg({ id: 'sim', name: 'SIM tray', obj: sim, level: 2, pull: [3.2, 0.2, 0.4], blockedBy: [], face: [1, 0, 0], focusRadius: 1,
        say: 'The SIM tray holds a tiny card that tells the phone company which phone this is.',
        job: 'It holds the little card that connects the phone to the phone company.',
        learn: ['It is like a name tag for the phone so the phone company knows it is yours.', 'The tray slides in from the side. When it is out, the card sits on it, and you can swap the card to another phone.', 'The card holds a small chip with an identity code. Newer phones can use an electronic version instead.'] });
      reg({ id: 'simcard', name: 'SIM card', obj: k.group(bx(0.17, 0.02, 0.28, k.mat(0x1c2a44, { roughness: 0.5 }), 1.3, 0.14, -0.5), bx(0.1, 0.022, 0.12, k.metal(0xd8c48a), 1.3, 0.141, -0.5)), parent: 'sim', level: 3, pull: [0, 1.4, -0.6], blockedBy: [], focusRadius: 0.8,
        say: 'The tiny card with a gold chip. It holds the phone\'s identity.',
        job: 'It holds the secret code that says which phone number is yours.',
        learn: ['It is like the phone\'s name tag.', 'The little gold square is a chip. It holds a code that proves to the phone company that this is your phone.', 'You can move the card to another phone, and your phone number moves with it.'] });
      reg({ id: 'reader', name: 'SIM reader', obj: bx(0.16, 0.07, 0.5, k.mat(0x32353d, { metalness: 0.5, roughness: 0.4 }), 1.12, 0.115, -0.5), level: 3, fuse: 'sim', pull: [0.8, 1.2, -0.6], blockedBy: ['display', 'sim'], face: [1, 0, 0], focusRadius: 0.8,
        say: 'A tiny holder with little metal fingers. It touches the gold chip on the SIM card.',
        job: 'It reads the SIM card so the phone knows who it belongs to.',
        learn: ['It is like a socket for the card.', 'Tiny metal springs press on the gold square, so electricity and messages can flow between the card and the phone.', 'The tray lines the card up with those springs, so it always sits in the right place.'] });
      const btn = (id, name, x, z, d, lvl, sayIt) => {
        reg({ id, name, obj: k.group(bx(0.07, 0.13, d, k.metal(0xa6acb4), x, 0.22, z)), level: lvl, fuse: 'frame', pull: [x > 0 ? 3.0 : -3.0, 0.4 + (id === 'volup' ? 0.6 : 0), id === 'volup' ? -0.8 : id === 'voldn' ? 0.6 : -1.8], blockedBy: [], face: [x > 0 ? 1 : -1, 0, 0], focusRadius: 0.7,
          say: sayIt,
          job: 'It is a button on the side of the phone, with a switch under it.',
          learn: ['It is like a doorbell on the side of the phone.', 'When you press it, it squeezes a tiny switch under it. The chip sees the switch close and knows what you asked.', 'The button is a little stick of metal that pokes through the frame, with a small seal so water and dust stay out.'] });
      };
      btn('power', 'Power button', 1.54, -1.7, 0.4, 2, 'The side button. It wakes the phone up and puts it to sleep.');
      btn('volup', 'Volume up button', -1.54, -1.45, 0.28, 2, 'A side button. It makes the sound louder.');
      btn('voldn', 'Volume down button', -1.54, -0.9, 0.28, 2, 'A side button. It makes the sound softer.');
      const flexM = k.mat(0xd9892b, { roughness: 0.6 });
      reg({ id: 'pwrflex', name: 'Power button cable', obj: k.group(bx(0.25, 0.01, 0.3, flexM, 1.33, 0.2, -1.7), bx(0.06, 0.012, 0.1, k.metal(0xd8c48a), 1.2, 0.205, -1.7)), level: 3, fuse: 'power', pull: [1.4, 0.8, -1.2], blockedBy: ['display'], face: [1, 0, 0], focusRadius: 0.6,
        say: 'A thin ribbon with a tiny switch. It tells the board when you press the power button.',
        job: 'It carries the button press over to the board.',
        learn: ['It is like a ribbon with a tiny switch.', 'When the button squeezes it, a little metal dome clicks and a signal goes through its ribbon to the board.', 'The dome is what gives the button its click.'] });
      reg({ id: 'volflex', name: 'Volume button cable', obj: k.group(bx(0.25, 0.01, 0.6, flexM, -1.33, 0.2, -1.2), bx(0.06, 0.012, 0.1, k.metal(0xd8c48a), -1.2, 0.205, -1.2)), level: 3, fuse: 'volup', pull: [-1.4, 0.8, -0.4], blockedBy: ['display'], face: [-1, 0, 0], focusRadius: 0.6,
        say: 'A thin ribbon with two tiny switches. It tells the board when you press the volume buttons.',
        job: 'It carries the volume button presses over to the board.',
        learn: ['It is like a ribbon with two tiny switches.', 'Each button squeezes its own little dome switch on the ribbon.', 'Both signals ride the same ribbon over to the board.'] });
      const antM = k.metal(0xd8a050, { roughness: 0.4 });
      reg({ id: 'antc', name: 'Cell antenna', obj: bx(0.03, 0.1, 1.8, antM, -1.37, 0.2, 1.2), level: 2, fuse: 'frame', pull: [-2.8, 0.8, 1.0], blockedBy: ['display'], face: [-1, 0, 0], focusRadius: 1,
        say: 'A thin metal strip inside the frame. It is the phone\'s radio ear.',
        job: 'It catches and sends the radio signals for calls and the internet.',
        learn: ['It is like the phone\'s ear for radio.', 'A radio signal makes a tiny electric wiggle in the metal strip. The radio chip turns that into a call.', 'The antenna is a particular length and shape for the radio bands it needs to catch. Phones tuck several antennas along the edges.'] });
      reg({ id: 'antw', name: 'Wi-Fi antenna', obj: bx(0.03, 0.1, 1.4, antM, 1.37, 0.2, 1.3), level: 3, fuse: 'frame', pull: [2.8, 0.8, 1.2], blockedBy: ['display'], face: [1, 0, 0], focusRadius: 1,
        say: 'Another thin metal strip. It listens for Wi-Fi and Bluetooth.',
        job: 'It catches the Wi-Fi and Bluetooth signals.',
        learn: ['It is like a second, smaller ear.', 'It is tuned for the signals Wi-Fi and Bluetooth use, which are different from phone calls.', 'Putting different antennas far apart keeps them from bothering each other.'] });

      // ================================================================ DISPLAY CABLE and its cover
      const flex = k.group(bx(1.2, 0.012, 0.35, k.mat(0xd9892b, { roughness: 0.6 }), 0, 0.24, -0.95), bx(0.5, 0.02, 0.1, k.metal(0xd8c48a), 0, 0.25, -1.12));
      reg({ id: 'flex', name: 'Display cable', obj: flex, level: 3, pull: [2.0, 1.6, -0.2], blockedBy: ['display', 'dcover'], focusRadius: 1,
        say: 'A thin bendy cable that sends the picture from the board up to the display.',
        breaks: 'The display cannot hear the board. The screen goes black!',
        fact: 'It is thin and flexible so it can fold into a tiny space.',
        learn: ['It is like a ribbon road that carries the picture from the brain to the screen.', 'It bends easily, so it can fold up and fit in a thin phone.', 'It has dozens of tiny copper lines, each carrying part of the picture signal.'],
        symptom: 'The phone is on, but the screen is all black.' });
      const coverM = k.metal(0xaeb4bc, { roughness: 0.35 });
      reg({ id: 'dcover', name: 'Connector cover', obj: bx(0.55, 0.02, 0.16, coverM, 0, 0.278, -1.12), level: 3, fuse: 'board', pull: [0, 1.4, -1.0], blockedBy: ['display', 'dcs'], focusRadius: 0.8,
        say: 'A thin metal plate with a screw. It holds the display cable down so it does not pop out.',
        job: 'It keeps the cable plugged in when the phone gets bumped.',
        learn: ['It is like a little clip that holds a plug in.', 'Phone cables just press on, with no solder, so a metal plate over them stops a bump from shaking them loose.', 'A repair person must remove the plate first, and then the cable can come off.'] });
      const sc1 = k.at(k.screw(0x9ea3ab, 0.1), 0.32, 0.29, -1.12); sc1.scale.setScalar(0.45);
      reg({ id: 'dcs', name: 'Cover screw', kind: 'screw', obj: sc1, pull: [0, 0.8, 0], level: 3, fuse: 'dcover',
        say: 'A tiny screw that holds the cover plate down.',
        job: 'It holds the plate over the cable plug.',
        learn: ['A screw is like a tiny spiral staircase that pulls things tight.', 'This one is smaller than a grain of rice.', 'Repair people put these in a tray in order, because the screws in different spots are different lengths.'] });
      const bcv = bx(0.36, 0.02, 0.2, coverM, 0.85, 0.238, -1.0);
      reg({ id: 'bcover', name: 'Battery connector cover', obj: bcv, level: 3, fuse: 'board', pull: [1.2, 1.4, -1.0], blockedBy: ['bcs'], focusRadius: 0.8,
        say: 'A thin metal plate with a screw. It holds the battery cable down so it does not pop out.',
        job: 'It keeps the battery cable plugged in.',
        learn: ['It is like a little clip that holds a plug in.', 'The battery plug is very important, so a metal plate presses it down.', 'It must come off first, before the battery cable can be unplugged.'] });
      const sc2 = k.at(k.screw(0x9ea3ab, 0.1), 0.97, 0.25, -1.0); sc2.scale.setScalar(0.45);
      reg({ id: 'bcs', name: 'Cover screw', kind: 'screw', obj: sc2, pull: [0, 0.8, 0], level: 3, fuse: 'bcover',
        say: 'A tiny screw that holds the battery cover down.',
        job: 'It holds the plate over the battery plug.',
        learn: ['A screw is like a tiny spiral staircase that pulls things tight.', 'This one is smaller than a grain of rice.', 'Repair people put these in a tray in order, because the screws in different spots are different lengths.'] });

      // ================================================================ effects: ding, buzz, tap and snap tags
      const ding = k.label('ding!', { size: 0.4, bg: 'rgba(214,150,20,0.95)' }); ding.position.set(-0.7, 1.2, 2.6); ding.visible = false;
      const bzz = k.label('bzz bzz', { size: 0.36, bg: 'rgba(60,110,200,0.92)' }); bzz.position.set(0.9, 1.2, 2.6); bzz.visible = false;
      const tap = k.label('tap!', { size: 0.4, bg: 'rgba(40,150,110,0.95)' }); tap.position.set(0.5, 1.2, 0.2); tap.visible = false;
      const snap = k.label('snap!', { size: 0.4, bg: 'rgba(200,70,110,0.95)' }); snap.position.set(-0.65, 1.2, -2.4); snap.visible = false;
      const fuzzy = k.label('fuzzy snap', { size: 0.34, bg: 'rgba(120,120,130,0.95)' }); fuzzy.position.set(-0.65, 1.2, -2.4); fuzzy.visible = false;
      root.add(ding, bzz, tap, snap, fuzzy);

      // the frame waits for every part that sits in it (the back glass is under the frame)
      parts.find((p) => p.id === 'frame').blockedBy = parts.filter((p) => !p.parent && p.kind !== 'screw' && p.id !== 'frame' && p.id !== 'backglass').map((p) => p.id);

      return { root, shell: [], parts, refs: { shaker, ding, bzz, tap, snap, fuzzy, clock: 0, pic: picMat } };
    },

    evaluate(has, on) {
      const power = has('battery') && has('prot') && has('battflex') && has('bconn') && has('board') && has('chip') && has('ram') && has('storage') && has('pmic') && has('crystal');
      const alive = on && power;
      let reason = '';
      if (on && !power) {
        if (!has('battery')) reason = 'There is no battery, so the phone has no electricity.';
        else if (!has('prot') || !has('battflex') || !has('bconn')) reason = 'The battery cannot get its electricity to the board.';
        else if (!has('pmic')) reason = 'Nobody hands out the electricity to the parts.';
        else if (!has('crystal')) reason = 'The chips have lost their steady beat.';
        else if (!has('ram') || !has('storage')) reason = 'The phone has lost its memory.';
        else reason = 'The brain is missing, so the phone cannot wake up.';
      }
      return {
        alive, reason,
        show: alive && has('display') && has('flex') && has('dconn'),
        ring: alive && has('speaker') && has('audio'),
        buzz: alive && has('vib') && has('vweight'),
        touch: alive && has('touch') && has('touchctl'),
        photo: alive && has('camera') && has('lens') && has('sensor') && has('camflex'),
        sharp: has('afm'),
      };
    },

    apply(out, inst) {
      const r = inst.refs;
      inst.parts.forEach((p) => { p.blockedBy = p.blockedBy.filter((b) => inst.byId[b]); }); // drop blockers that are not separate pieces at this level
      const pics = inst.byId.display ? inst.byId.display.meshes.filter((m) => m.name === 'pic') : [];
      // the touch layer's look only shows where it is its own piece (it is part of the glass at Beginner)
      if (inst.byId.glass) inst.byId.glass.meshes.forEach((m) => { if (m.name === 'touchbit') m.visible = !!inst.byId.touch; });
      pics.forEach((m) => { m.material.color.setHex(out.show ? 0xffffff : 0x0d0e12); });
      if (!out.alive) { r.clock = 0; r.ding.visible = false; r.bzz.visible = false; r.tap.visible = false; r.snap.visible = false; r.fuzzy.visible = false; }
    },

    tick(dt, t, inst, out) {
      const r = inst.refs;
      if (!out) return;
      if (out.alive) r.clock += dt;
      const c = r.clock % 5, msg = out.alive && c > 1 && c < 1.8;
      r.ding.visible = msg && !!out.ring;
      r.bzz.visible = msg && !!out.buzz;
      const tapping = out.alive && c > 2 && c < 2.7, snapping = out.alive && c > 3.1 && c < 3.8;
      r.tap.visible = tapping && !!out.touch;
      r.snap.visible = snapping && !!out.photo && !!out.sharp;
      r.fuzzy.visible = snapping && !!out.photo && !out.sharp;
      const amp = msg && out.buzz ? 0.035 : 0;
      r.shaker.position.set(Math.sin(t * 80) * amp, 0, Math.cos(t * 67) * amp * 0.8);
    },
  });

  Object.assign(TAL.insideByName, {
    'Display layer': 'lcd-pixel', 'Glass screen': 'lcd-pixel', 'Main board': 'pcb-inside', 'Main chip': 'chip-package',
    'Board screw': 'screw-inside', 'Speaker screw': 'screw-inside', 'Cover screw': 'screw-inside', 'Battery': 'battery-inside', 'Speaker': 'speaker-inside',
    'Loudspeaker': 'speaker-inside', 'Earpiece speaker': 'speaker-inside',
    'Memory chip': 'chip-package', 'Storage chip': 'chip-package', 'Modem chip': 'chip-package', 'Radio chip': 'chip-package', 'Power chip': 'chip-package',
    'Audio chip': 'chip-package', 'Touch chip': 'chip-package', 'Wi-Fi chip': 'chip-package', 'Tap-to-pay chip': 'chip-package', 'Motion sensor': 'chip-package',
    'Capacitor': 'cap-inside', 'Resistor': 'resistor-inside', 'Diode': 'diode-inside', 'Power coil': 'transformer-inside',
    'Battery protection board': 'pcb-inside', 'Display cable': 'pcb-inside', 'Battery cable': 'pcb-inside', 'Camera cable': 'pcb-inside', 'Charging cable': 'pcb-inside',
    'Power button cable': 'pcb-inside', 'Volume button cable': 'pcb-inside',
    'Wireless charging coil': 'wire-inside', 'Cell antenna': 'wire-inside', 'Wi-Fi antenna': 'wire-inside',
    'Power button': 'switch-inside', 'Volume up button': 'switch-inside', 'Volume down button': 'switch-inside',
  });
})();
