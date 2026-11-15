/* Flashlight: a simple circuit. Beginner 6 pieces, Medium 16, Advanced 36.
 * Shows how a non-screen device plugs into the engine (apply() drives the light beam). */
TAL.registerDevice({
  id: 'flashlight',
  name: 'Flashlight',
  short: 'flashlight',
  subtitle: 'A little circuit you can hold',
  powerSound: 'click',
  channels: false,
  view: { target: [0, 1.3, 0], radius: 4.6, explodedRadius: 7.0, explodedY: 1.4, yaw: -0.3, pitch: 0.38, shadow: [9, 3] },
  intro: 'This is a flashlight. It is a great way to see how electricity travels in a loop.',
  shellSay: "That's the flashlight's tube. The batteries hide inside it. Try the X-ray button to see them!",
  guide: [
    { do: 'power', say: "Hi, I'm Sparky! Press the green power button to switch the flashlight on.", nudge: 'Press the power button.' },
    { do: 'remove', ids: ['tailcap'], say: 'Now twist off the black end cap. What happens to the light?', nudge: 'Drag the black end cap off.' },
    { do: 'remove', ids: ['spring'], say: 'Pull out the shiny spring.', nudge: 'Pull out the spring.' },
    { do: 'remove', ids: ['bat1'], say: 'Now slide out a battery!', nudge: 'Pull out the battery.' },
    { do: 'remove', ids: ['wrap1'], levels: [2, 3], say: 'Peel the blue label off the battery. What is underneath?', nudge: 'Peel off the blue label.' },
    { do: 'end', say: 'The light needs a full loop: battery, spring, cap, switch and bulb. Put them all back and turn it on again!' },
  ],

  build(k) {
    const T = k.THREE;
    const root = k.group();
    const Y = 1.0, X = 2.2; // flashlight center; it points left, toward the wall
    const body = k.at(k.group(), X, 0, 0);
    root.add(body);
    // anodized, brushed red aluminum: fine streaks along the length of the tube
    const rn = k.rng(9);
    const brushed = k.canvasTex(256, 256, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#c42d27'); g.addColorStop(0.5, '#dc3b33'); g.addColorStop(1, '#c42d27');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 420; i++) {
        const x = rn() * w;
        c.fillStyle = rn() < 0.5 ? `rgba(255,210,200,${0.04 + rn() * 0.09})` : `rgba(70,8,6,${0.05 + rn() * 0.1})`;
        c.fillRect(x, 0, 0.6 + rn() * 1.4, h);
      }
    });
    brushed.wrapS = brushed.wrapT = T.RepeatWrapping;
    brushed.repeat.set(2, 1);
    const red = k.metal(0xffffff, { map: brushed, roughness: 0.42, metalness: 0.6 });
    const rubber = k.mat(0x151515, { roughness: 0.8 });
    const along = (m) => k.rot(m, 0, 0, Math.PI / 2); // turn a cylinder to lie along x
    const ringX = (r, t, m) => k.rot(k.torus(r, t, m), 0, Math.PI / 2, 0); // a ring around the x axis
    const parts = [];
    const add = (spec) => { parts.push(spec); return spec; };
    const sub = (parentObj, parentId, spec) => { parentObj.add(spec.obj); spec.parent = parentId; return add(spec); };

    // ---- shell: tube, head, cradles
    const shell = k.group(
      k.at(along(k.cyl(0.42, 0.42, 3.2, red, 32, true)), 0, Y, 0),
      k.at(along(k.cyl(0.62, 0.45, 0.8, k.metal(0xffffff, { map: brushed, roughness: 0.42, metalness: 0.6, side: T.DoubleSide }), 32, true)), -2.0, Y, 0)
    );
    for (let i = 0; i < 6; i++) shell.add(k.at(ringX(0.43, 0.025, k.metal(0x9e231d)), 0.4 + i * 0.18, Y, 0));
    shell.add(k.at(k.box(0.35, 0.6, 1.0, k.mat(0x5a3b22)), -1.0, 0.3, 0));
    shell.add(k.at(k.box(0.35, 0.6, 1.0, k.mat(0x5a3b22)), 1.0, 0.3, 0));
    body.add(shell);

    // ---- wall that catches the light (scenery, not a part)
    const wall = k.at(k.box(0.12, 3.4, 4.4, k.mat(0xf1eee6, { roughness: 0.95 })), -4.9, 1.7, 0);
    wall.userData.noPick = true;
    root.add(wall);

    // ---- light: beam cones + spotlight
    const beamMat = (op) => new T.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
    const beam = k.mesh(new T.CylinderGeometry(0.5, 1.5, 4.7, 32, 1, true), beamMat(0.16));
    k.at(k.rot(beam, 0, 0, -Math.PI / 2), X - 2.4 - 2.35, Y, 0);
    const wide = k.mesh(new T.CylinderGeometry(0.5, 3.2, 4.7, 32, 1, true), beamMat(0.06));
    k.at(k.rot(wide, 0, 0, -Math.PI / 2), X - 2.4 - 2.35, Y, 0);
    beam.userData.noPick = wide.userData.noPick = true;
    beam.visible = wide.visible = false;
    root.add(beam, wide);
    const spot = new T.SpotLight(0xfff1c0, 0, 0, 0.3, 0.45, 1);
    spot.position.set(X - 2.3, Y, 0);
    const target = new T.Object3D();
    target.position.set(-5, Y, 0);
    root.add(spot, target);
    spot.target = target;

    const loop = 'Electricity has to travel in a big loop: out of the battery, through the bulb, and back again. That loop is called a circuit.';

    // shared small materials
    const steel = k.metal(0xc9ced6), brass = k.metal(0xd8c48a), dark = k.mat(0x1c1c1e, { roughness: 0.5 });
    const disc = (r, t, m, seg) => along(k.cyl(r, r, t, m, seg || 24)); // a flat round plate facing along x
    const helix = (x0, x1, r, turns, n) => { const p = []; for (let i = 0; i <= n; i++) { const a = (i / n) * turns * Math.PI * 2; p.push([x0 + (x1 - x0) * i / n, Y + Math.sin(a) * r, Math.cos(a) * r]); } return p; };

    // ---- bezel ring + lens (+ its O-ring)
    const lens = k.group(k.at(along(k.cyl(0.6, 0.6, 0.05, k.glass(0xdff3ff, 0.35), 32)), -2.42, Y, 0));
    body.add(lens);
    add({ id: 'lens', name: 'Lens', obj: lens, pull: [-0.8, 0, 2.4], face: [-1, 0, 0], blockedBy: ['bezel'],
      say: 'The clear lens lets the light out and keeps the dust out.',
      breaks: 'The light still shines, but the beam is wider and a little dimmer. And dust can get in!' });
    const bezel = k.group(k.at(ringX(0.6, 0.04, steel), -2.42, Y, 0));
    body.add(bezel);
    add({ id: 'bezel', name: 'Bezel ring', obj: bezel, pull: [-1.9, 1.5, 3.1], level: 2, fuse: 'lens', face: [-1, 0, 0],
      say: 'This shiny ring is like a picture frame. It holds the lens in place.',
      learn: ['Think of a picture frame. The ring presses around the edge of the lens so it cannot fall out.',
        'It screws onto the front of the head. The lens sits on a rubber ring, and the bezel squeezes it down snug.',
        'A bezel or retaining ring is a ring that holds something in place. Here it is usually metal, like the head, so it stays strong when it is bumped.'],
      job: 'It holds the lens in place.' });
    sub(lens, 'lens', { id: 'oringL', name: 'Lens O-ring', obj: k.at(k.group(ringX(0.57, 0.022, rubber)), -2.39, Y, 0), pull: [-0.3, -0.9, 0.5], level: 3,
      say: 'A rubber ring seals the lens so water cannot sneak in.', breaks: 'The light still works, but now rain could get inside!', breaksAlways: true,
      learn: ['It is like the rubber ring in a jar lid. It squishes flat and fills every tiny gap, so water cannot get through.',
        'An O-ring is a round rubber loop with a round cross-section. Squeezed between the lens and the head, it blocks water and dust.',
        'O-rings seal because the squeeze makes the rubber push back on both surfaces. A thin film of grease often helps it slide in and last longer.'] });

    // ---- reflector
    const reflector = k.group(k.at(along(k.cyl(0.18, 0.58, 0.5, k.mat(0xe9eef4, { roughness: 0.18, metalness: 0.35, side: T.DoubleSide }), 32, true)), -2.12, Y, 0));
    body.add(reflector);
    add({ id: 'reflector', name: 'Reflector', obj: reflector, pull: [-0.3, 0.9, 2.2], blockedBy: ['lens'], level: 2, fuse: 'lens', face: [-1, 0, 0],
      say: 'The shiny cup bounces the light forward into a beam.',
      breaks: 'Without the shiny cup, the light spreads out everywhere and gets weak.',
      fact: 'It works like a mirror. Light that would go sideways bounces off and goes forward instead.',
      symptom: 'The light is weak and spreads out everywhere.' });

    // ---- LED (bulb) with its tiny chip
    const bulbGlass = k.sphere(0.13, k.glow(0xfffbe8, 0xfff2b0));
    bulbGlass.material.transparent = true; bulbGlass.material.opacity = 0.85;
    const bulb = k.group(k.at(bulbGlass, -1.95, Y, 0), k.at(along(k.cyl(0.09, 0.09, 0.2, steel, 16)), -1.78, Y, 0));
    body.add(bulb);
    add({ id: 'bulb', name: 'LED bulb', obj: bulb, pull: [0.3, 1.8, 1.7], blockedBy: ['reflector'], face: [-1, 0, 0], focusRadius: 0.6,
      say: 'This little bulb makes the light!', breaks: 'No bulb, no light!',
      fact: 'This bulb is an LED. When electricity flows through it, it glows.',
      symptom: 'The switch clicks, but the bulb stays dark.' });
    const ledChip = k.at(k.group(k.box(0.05, 0.05, 0.05, k.glow(0xffe9a8, 0xfff2c0))), -1.95, Y, 0);
    sub(bulb, 'bulb', { id: 'ledChip', name: 'LED chip', obj: ledChip, pull: [-0.3, 0.4, 0.4], level: 3,
      say: 'This tiny chip is the part that really glows. The glass around it just protects it.', breaks: 'No chip, no light!',
      symptom: 'The glass looks fine, but no light comes out.' });

    // ---- LED star board (+ thermal paste)
    const star = k.group(k.at(disc(0.34, 0.04, k.mat(0xe9ecef, { roughness: 0.5 }), 28), -1.66, Y, 0),
      k.at(disc(0.1, 0.045, k.mat(0xb8bdc4, { roughness: 0.4, metalness: 0.5 }), 16), -1.66, Y, 0));
    body.add(star);
    add({ id: 'star', name: 'LED star board', obj: star, pull: [-1.0, 2.3, 0.4], blockedBy: ['reflector'], level: 2, fuse: 'bulb', face: [-1, 0.2, 0.2], focusRadius: 0.8,
      say: 'The little light sits on this round metal board. The board brings it electricity and carries away the heat.',
      breaks: 'The light has nothing to sit on and no way to get electricity. No light!',
      learn: ['The tiny light gets hot, like a hot potato. The metal board is like an oven mitt: it spreads the heat out so the light does not get too hot.',
        'It is a circuit board with an aluminum base. The light is soldered on top, and the aluminum pulls the heat out and passes it to the metal head.',
        'Aluminum moves heat far better than the usual fiberglass board. A thin insulating layer keeps the copper wires on top from touching the aluminum underneath.'],
      symptom: 'The light flickers and then goes dark.' });
    sub(star, 'star', { id: 'paste', name: 'Thermal paste', obj: k.at(k.group(disc(0.28, 0.016, k.mat(0x8f949b, { roughness: 0.9 }), 24)), -1.635, Y, 0), pull: [-0.3, 0.5, 0.3], level: 3, face: [-1, 0, 0],
      say: 'A thin smear of gray goo sits under the board. It helps heat slip into the metal head.',
      breaks: 'The light still works, but now the heat gets stuck and it runs hotter.', breaksAlways: true,
      learn: ['Think of honey between two slices of bread. The goo fills the tiny gaps so heat can move across instead of getting stuck.',
        'Two metal surfaces look flat, but they have tiny bumps with air in between, and air carries heat badly. The paste fills those gaps.',
        'Thermal paste is a soft goo with tiny particles that carry heat well. It is not glue. It only makes sure the board touches the head as well as it can.'] });

    // ---- driver board (+ chip, resistor, inductor, capacitor, diode)
    const pcb = k.mat(0x1f7a44, { roughness: 0.55 });
    const driver = k.group(k.at(disc(0.38, 0.05, pcb, 28), -1.52, Y, 0));
    body.add(driver);
    add({ id: 'driver', name: 'Driver board', obj: driver, pull: [-0.5, -0.5, 2.7], blockedBy: ['star'], level: 2, fuse: 'bulb', face: [0.6, 0.2, 0.8], focusRadius: 0.9,
      say: 'This little board is the light\'s helper. It gives the light just the right amount of electricity.',
      breaks: 'With no helper board, the light gets no electricity. No light!',
      learn: ['Think of a faucet with a smart helper. The board keeps the electricity coming out gentle and steady, so the light never gets too much.',
        'An LED needs a steady flow of electricity. Batteries get weaker as they empty, so the driver board adjusts to keep the light the same brightness and to protect the LED.',
        'Many flashlight drivers are constant-current regulators. Two AA cells give about 3 volts, so many drivers switch the power on and off very fast to hold the flow steady, and some also add modes such as low, high and blinking.'],
      symptom: 'The light will not stay steady, and then it goes out.' });
    const onBoard = (id, name, obj, pull, extra) => sub(driver, 'driver', Object.assign({ id, name, obj, pull, level: 3, focusRadius: 0.45 }, extra));
    const px = -1.47;
    onBoard('dChip', 'LED driver chip', k.group(k.at(k.box(0.05, 0.14, 0.14, dark), px, Y + 0.2, 0)), [0.2, 0.9, 0.6], {
      say: 'This tiny chip is the helper\'s brain. It decides how much electricity goes to the light.',
      breaks: 'With no chip, nothing controls the electricity. No light!',
      learn: ['Think of the faucet helper. The chip is the little hand that turns the faucet a bit more or a bit less, all day long.',
        'It switches the electricity on and off very fast, and it checks how much is flowing so it can keep the light steady.',
        'The chip is a small integrated circuit, a tiny piece of silicon with lots of transistors inside, sealed in a plastic package with metal legs.'],
      symptom: 'The light blinks once and then stays dark.' });
    onBoard('dRes', 'Sense resistor', k.group(k.at(k.box(0.03, 0.06, 0.1, dark), px, Y, -0.27), k.at(k.box(0.032, 0.062, 0.015, steel), px, Y, -0.32), k.at(k.box(0.032, 0.062, 0.015, steel), px, Y, -0.22)), [0.3, -0.2, 1.0], {
      say: 'This tiny part helps the chip see how much electricity is flowing.',
      breaks: 'The chip cannot tell how much electricity is flowing, so the light goes out.',
      learn: ['Think of a little measuring cup under the faucet. The chip peeks at how full it is to know how much is flowing.',
        'The electricity flows through the resistor, and a tiny bit of voltage shows up across it. The chip reads that voltage to know the flow.',
        'Voltage across a known resistance tells you the current, by Ohm\'s law. Sense resistors have a very small resistance, so they waste almost no power.'] });
    onBoard('dInd', 'Inductor', k.group(k.at(disc(0.09, 0.1, k.mat(0x3a3a40, { roughness: 0.6 }), 16), px + 0.03, Y - 0.2, 0.1)), [0.3, -0.7, 0.7], {
      say: 'This little coil is like a flywheel for electricity. It helps push the electricity along.',
      breaks: 'Without the coil the board cannot push the electricity along. No light!',
      learn: ['Think of a heavy flywheel. Once it gets going, it likes to keep going, and the coil does the same with electricity.',
        'When electricity flows through a coil of wire, it makes a magnetic field. The coil stores a little energy in that field and gives it back when the chip switches.',
        'In a switching driver, the chip turns the current through the inductor on and off hundreds of thousands of times a second. The inductor smooths it out, and that lets the driver turn the battery voltage into what the LED needs.'],
      symptom: 'The light is dark, but the batteries are fine.' });
    onBoard('dCap', 'Smoothing capacitor', k.group(k.at(disc(0.055, 0.12, k.mat(0x1d2f57, { roughness: 0.5 }), 16), px + 0.035, Y, 0.27)), [0.6, 0.6, 0.8], {
      say: 'This little can is a tiny bucket. It smooths out bumpy electricity.',
      breaks: 'The light still shines, but it flickers.',
      learn: ['Think of a tiny bucket under a dripping tap. It catches the drips and pours them out as one smooth stream.',
        'The chip makes the electricity in quick little pulses. The capacitor stores a bit of each pulse and lets it out evenly, so the light stays smooth.',
        'A capacitor stores energy in an electric field between two plates. Placed across the LED supply, it evens out the ripple left by the fast switching.'] });
    onBoard('dDiode', 'Diode', k.group(k.at(k.box(0.04, 0.06, 0.1, dark), px, Y - 0.12, -0.2), k.at(k.box(0.042, 0.062, 0.015, steel), px, Y - 0.12, -0.17)), [0.0, -0.5, 0.9], {
      say: 'A diode is a one-way door for electricity.',
      breaks: 'The one-way door is gone, so the electricity does not reach the light. No light!',
      learn: ['Think of a turnstile at the zoo. People can go in, but they cannot go back out.',
        'A diode lets electricity flow one way and blocks it the other way. The silver stripe shows which end is which.',
        'In a switching driver, the diode lets the stored energy flow on to the LED and stops it from flowing backward while the chip switches.'] });

    // ---- the two thin wires from driver board to star board
    const wireMat = (c) => k.mat(c, { roughness: 0.6 });
    const wR = k.group(k.tube([[-1.55, Y + 0.3, 0.02], [-1.6, Y + 0.36, 0.04], [-1.65, Y + 0.3, 0.02]], 0.018, wireMat(0xc83030))), wB = k.group(k.tube([[-1.55, Y - 0.3, 0.02], [-1.6, Y - 0.36, 0.04], [-1.65, Y - 0.3, 0.02]], 0.018, wireMat(0x1a1a1a)));
    body.add(wR, wB);
    add({ id: 'wireR', name: 'Red wire', obj: wR, pull: [-0.9, 1.3, 1.2], blockedBy: ['star'], level: 3, focusRadius: 0.4,
      say: 'This red wire carries electricity from the helper board to the light.',
      breaks: 'The wire is gone, so the electricity cannot reach the light. No light!',
      learn: ['Think of a little water pipe. The wire is a path that lets the electricity run from one place to another.',
        'Inside the plastic coat is a thin copper wire. Copper lets electricity move through it easily, and the coat keeps it from touching other metal.',
        'Red usually marks the plus side and black the minus side. The driver sends current out through one wire and back through the other, so the LED sees a full loop.'],
      symptom: 'The light flickers when the head is wiggled.' });
    add({ id: 'wireB', name: 'Black wire', obj: wB, pull: [-0.5, -0.5, 1.5], blockedBy: ['star'], level: 3, focusRadius: 0.4,
      say: 'This black wire brings the electricity back from the light.',
      breaks: 'The loop is open, so the electricity cannot come back. No light!',
      learn: ['Think of a little water pipe. This one is the pipe that brings the water back around.',
        'Electricity needs a full loop. It goes out one wire, through the light, and comes back in the other.',
        'The coat is plastic, which does not carry electricity, so the copper inside stays safe from the metal head.'] });

    // ---- contact spring between the driver board and the batteries
    const hSpring = k.group(k.tube(helix(-1.4, -1.27, 0.11, 6, 60), 0.014, k.metal(0xd7dce2, { roughness: 0.2 })));
    body.add(hSpring);
    add({ id: 'hSpring', name: 'Contact spring', obj: hSpring, pull: [-0.1, -0.5, 1.7], blockedBy: ['driver'], level: 2, fuse: 'bulb', face: [0, 0, 1], focusRadius: 0.5,
      say: 'This little spring presses on the battery so the electricity can cross over.',
      breaks: 'The spring does not touch the battery anymore. No light!',
      learn: ['Think of a hand that always stays held out. The spring pushes gently so it keeps touching the battery even when the flashlight is bumped.',
        'A spring keeps pressure on a contact. Without that push, a bump could break the touch for a moment and the light would blink.',
        'Springs in a flashlight are usually plated steel or brass, so they carry electricity well and do not rust.'],
      symptom: 'The light blinks off when you bump the flashlight.' });

    // ---- head O-ring (hidden inside the joint, so it is scenery below Advanced)
    add({ id: 'oringH', name: 'Head O-ring', obj: k.at(k.group(ringX(0.395, 0.025, rubber)), -1.62, Y, 0), pull: [-0.3, -0.5, 2.0], level: 3, face: [-1, 0, 0],
      say: 'This rubber ring seals the place where the head meets the tube.', breaks: 'The light still works, but now water could get in!', breaksAlways: true,
      learn: ['It is like the rubber ring in a jar lid. It squishes flat and keeps water out of the gap.',
        'The head screws onto the tube. A rubber ring in the thread squeezes tight when you twist, and that makes the seal.',
        'Waterproof flashlights are rated by how long and how deep they can be under water. The O-rings are a big part of how they earn that rating.'] });
    body.add(parts[parts.length - 1].obj);

    // ---- switch (+ button cap, ring, housing, spring, contact)
    const sw = k.group(k.at(k.box(0.5, 0.06, 0.32, k.metal(0x2a2a2a)), -1.0, Y + 0.42, 0));
    body.add(sw);
    add({ id: 'switch', name: 'Switch', obj: sw, pull: [0, 1.3, 0.9], face: [0, 1, 0], focusRadius: 0.7,
      say: 'The switch opens and closes the path for the electricity.', breaks: 'The path is broken, so the light goes out.',
      fact: 'When you click it on, a little piece of metal touches and closes the loop. Click it off and the loop opens.',
      symptom: 'The switch does not click right. It feels broken.' });
    sub(sw, 'switch', { id: 'button', name: 'Button cap', obj: k.at(k.group(k.cyl(0.13, 0.15, 0.14, k.mat(0x3a3a3a, { roughness: 0.8 }), 20)), -1.0, Y + 0.5, 0), pull: [0, 0.5, 0.3], level: 2, focusRadius: 0.5,
      say: 'The rubber button cap is the part your thumb pushes.', breaks: 'The switch still works, you just push the metal part now.', breaksAlways: true });
    sub(sw, 'switch', { id: 'ring', name: 'Switch ring', obj: k.at(k.group(k.rot(k.torus(0.17, 0.03, steel), Math.PI / 2, 0, 0)), -1.0, Y + 0.47, 0), pull: [0.5, 0.4, 0.6], level: 3, focusRadius: 0.45,
      say: 'This little ring holds the button cap in its place.', job: 'It keeps the button from popping out.',
      learn: ['Think of a belt. The ring goes around the button and keeps it from slipping away.',
        'The button cap pokes up through a hole. The ring pinches the rubber around the hole so it stays put and dirt stays out.',
        'A retaining ring is a small ring that locks one part to another. It can be pressed on or screwed on.'] });
    sub(sw, 'switch', { id: 'housing', name: 'Switch housing', obj: k.at(k.group(k.box(0.42, 0.1, 0.28, dark)), -1.0, Y + 0.3, 0), pull: [-0.6, 0.3, 0.8], level: 3, focusRadius: 0.5,
      say: 'The housing is the little plastic box that holds the switch pieces together.',
      breaks: 'The switch pieces fall apart, so the loop is open. No light!',
      learn: ['Think of a lunchbox. It holds all the little pieces so they stay where they belong.',
        'The metal contacts and the spring sit inside this box, lined up so they touch only when you press the button.',
        'Switch housings are usually molded plastic. Plastic does not carry electricity, so the metal contacts cannot touch the wrong thing.'] });
    sub(sw, 'switch', { id: 'clickSpring', name: 'Click spring', obj: k.group(k.tube(Array.from({ length: 41 }, (_, i) => { const a = i * 0.9; return [-1.0 + Math.cos(a) * 0.08, Y + 0.37 + i * 0.0016, Math.sin(a) * 0.08]; }), 0.012, k.metal(0xd7dce2, { roughness: 0.2 }))), pull: [0.5, 0.9, -0.1], level: 3, focusRadius: 0.4,
      say: 'This tiny spring makes the button click and pop back up.',
      breaks: 'The button will not pop back, and the switch cannot click on. No light!',
      learn: ['Think of a trampoline. You push down, and the spring pushes your thumb back up.',
        'When you press, the spring squishes and the contact touches. When you let go, the spring springs back.',
        'Click switches use a spring so the touch snaps on and off quickly. A quick snap keeps the contacts clean and helps them last.'],
      symptom: 'The button stays pushed in and does nothing.' });
    sub(sw, 'switch', { id: 'contact', name: 'Switch contact', obj: k.at(k.group(k.box(0.3, 0.03, 0.12, brass)), -1.0, Y + 0.36, 0), pull: [0.4, 0.6, 0.4], level: 3, focusRadius: 0.45,
      say: 'This little metal strip is what really touches to close the loop.', breaks: 'No contact, so the loop is open. No light!',
      symptom: 'The switch feels mushy, and the light never comes on.' });

    // ---- batteries (+ label, plus cap)
    const battery = (cx) => {
      const g = k.group(
        k.at(along(k.cyl(0.33, 0.33, 1.15, k.metal(0xb8bdc4, { roughness: 0.4 }), 28)), cx, Y, 0),
        k.at(along(k.cyl(0.345, 0.345, 0.06, steel, 28)), cx + 0.6, Y, 0)
      );
      const plus = k.group(k.at(along(k.cyl(0.345, 0.345, 0.14, steel, 28)), cx - 0.62, Y, 0), k.at(along(k.cyl(0.1, 0.1, 0.1, steel, 14)), cx - 0.73, Y, 0));
      const wrap = k.group(k.at(along(k.cyl(0.345, 0.345, 1.1, k.mat(0x2457c5, { roughness: 0.35 }), 28, true)), cx, Y, 0));
      body.add(g);
      return { g, wrap, plus };
    };
    const b1 = battery(0.85), b2 = battery(-0.5);
    add({ id: 'bat1', name: 'Battery', obj: b1.g, pull: [2.4, -0.62, 2.4], blockedBy: ['tailcap', 'spring'], face: [0, 0, 1], focusRadius: 1,
      say: 'Batteries store electricity, like a lunchbox stores food.', breaks: 'With a battery gone, the loop is broken. No light!',
      fact: loop, symptom: 'It is dead. The batteries feel empty.' });
    add({ id: 'bat2', name: 'Battery', obj: b2.g, pull: [3.7, -0.62, 3.3], blockedBy: ['bat1'], face: [0, 0, 1], focusRadius: 1,
      say: 'Another battery! Two batteries push the electricity twice as hard.', breaks: 'With a battery gone, the loop is broken. No light!', fact: loop,
      symptom: 'It is dead. One of the batteries feels empty.' });
    [b1, b2].forEach((b, i) => {
      sub(b.g, 'bat' + (i + 1), { id: 'wrap' + (i + 1), name: 'Battery label', obj: b.wrap, pull: [0, 0.7, 0.3], level: 2, face: [0, 0, 1],
        say: 'The label is just a wrapper. Underneath is a metal can full of special paste that makes electricity.',
        breaks: 'The battery still works without its label!', breaksAlways: true,
        fact: 'The bumpy end is plus and the flat end is minus. Electricity flows out one end and back into the other.' });
      sub(b.g, 'bat' + (i + 1), { id: 'plus' + (i + 1), name: 'Positive cap', obj: b.plus, pull: [-1.2, 0.5, 0.3 + i * 0.3], level: 3, face: [-1, 0, 0], focusRadius: 0.5,
        say: 'The bumpy end is the plus end. It is where the electricity comes out.',
        breaks: 'Without its bumpy end, this battery cannot touch the next piece. No light!',
        learn: ['Think of the spout on a juice box. The electricity comes out of the bumpy end.',
          'The bumpy cap is the plus side of the battery. The flat end at the other side is the minus side. The spring and the contacts touch these two ends.',
          'The cap is a small stamped piece of nickel-plated steel joined to the can. It is a clean place to touch, and the little bump makes sure it touches well.'] });
    });

    // ---- tail spring
    const pts = [];
    for (let i = 0; i <= 70; i++) { const a = i * 0.55; pts.push([1.5 + i * 0.0045, Y + Math.sin(a) * 0.24, Math.cos(a) * 0.24]); }
    const spring = k.group(k.tube(pts, 0.022, k.metal(0xd7dce2, { roughness: 0.2 })));
    body.add(spring);
    add({ id: 'spring', name: 'Spring', obj: spring, pull: [1.0, 0.9, 1.9], blockedBy: ['tailcap'], level: 2, fuse: 'tailcap', face: [1, 0, 0],
      say: 'The spring pushes the batteries together so they touch.', breaks: "The batteries aren't pushed together anymore. No light!",
      fact: loop, symptom: 'The batteries rattle around loose inside, and the light will not come on.' });

    // ---- end cap (+ O-ring, contact plate, lanyard loop)
    const tailcap = k.group(k.at(along(k.cyl(0.45, 0.45, 0.45, k.metal(0x2d2d30, { roughness: 0.5 }), 32)), 1.83, Y, 0));
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; tailcap.add(k.at(k.box(0.4, 0.03, 0.03, k.metal(0x1f1f22)), 1.83, Y + Math.sin(a) * 0.455, Math.cos(a) * 0.455)); }
    body.add(tailcap);
    add({ id: 'tailcap', name: 'End cap', obj: tailcap, pull: [1.6, 0, 1.5], face: [1, 0, 0], focusRadius: 0.9,
      say: 'The end cap screws on and holds the batteries in.',
      breaks: 'The end is open, so the electricity cannot get all the way around. The light goes out.', fact: loop,
      symptom: 'The back end feels loose, and the light will not come on.' });
    sub(tailcap, 'tailcap', { id: 'oringT', name: 'Tail O-ring', obj: k.at(k.group(ringX(0.43, 0.025, rubber)), 1.62, Y, 0), pull: [-0.3, -0.5, 0.4], level: 2,
      say: 'A rubber ring seals the end cap so water cannot sneak in.', breaks: 'The light still works, but now rain could get inside!', breaksAlways: true,
      learn: ['It is like the rubber ring in a jar lid. It squishes flat and keeps the water out.',
        'The end cap screws onto the tube. The rubber ring in the thread squeezes tight when you twist, and that makes the seal.',
        'A flashlight is only as waterproof as its O-rings. They can dry out or get nicked, so people check them and put a little grease on them.'] });
    sub(tailcap, 'tailcap', { id: 'plate', name: 'Cap contact plate', obj: k.at(k.group(disc(0.3, 0.03, brass, 24)), 1.845, Y, 0), pull: [-0.4, 0.8, 0.4], level: 3, face: [-1, 0, 0], focusRadius: 0.6,
      say: 'This shiny disc inside the cap is where the spring touches, so the electricity can head back.',
      breaks: 'The spring has nothing to touch, so the loop is open. No light!',
      learn: ['Think of a doormat that the spring stands on. It gives the spring a good place to touch.',
        'The disc joins the spring to the metal tube, so electricity can run back along the tube to the light.',
        'Many flashlights use the metal tube as the return wire, so the cap has to touch the tube well. Brass or plated metal is used because it does not rust easily.'],
      symptom: 'The light flickers when you twist the back end.' });
    sub(tailcap, 'tailcap', { id: 'lanyard', name: 'Lanyard loop', obj: k.at(k.group(ringX(0.16, 0.035, steel)), 2.12, Y, 0), pull: [0.5, 0.4, 0.3], level: 3,
      say: 'The loop is for a string, so you can hang the flashlight on your wrist.', job: 'It lets you hang the flashlight on a string.' });

    // ---- pocket clip
    const clip = k.group(k.at(k.box(1.2, 0.04, 0.12, steel), 0.6, Y + 0.45, 0), k.at(k.box(0.12, 0.06, 0.12, steel), 1.15, Y + 0.43, 0));
    body.add(clip);
    add({ id: 'clip', name: 'Pocket clip', obj: clip, pull: [0, 1.4, 1.2], level: 3, face: [0, 1, 0],
      say: 'The pocket clip holds the flashlight on your pocket or backpack.', job: 'It keeps the flashlight on your pocket.' });

    return { root, shell: [shell], parts, refs: { beam, wide, spot, bulbGlass, ledChip: ledChip.children[0] } };
  },

  evaluate(has, on) {
    const need = ['bulb', 'ledChip', 'star', 'wireR', 'wireB', 'driver', 'dChip', 'dRes', 'dInd', 'dDiode', 'hSpring',
      'bat1', 'bat2', 'plus1', 'plus2', 'spring', 'plate', 'tailcap', 'switch', 'contact', 'housing', 'clickSpring'];
    const circuit = need.every(has);
    const alive = on && circuit;
    const miss = (...ids) => ids.some((i) => !has(i));
    let reason = '';
    if (on && !circuit) {
      reason = miss('bulb', 'ledChip') ? "There's no bulb to make light!"
        : miss('star', 'wireR', 'wireB') ? "The light can't get electricity from the helper board."
        : miss('driver', 'dChip', 'dRes', 'dInd', 'dDiode') ? "The light's helper board is missing its parts, so no electricity gets through."
        : miss('bat1', 'bat2', 'plus1', 'plus2') ? "A battery is missing, so the electricity can't make a loop."
        : miss('switch', 'contact', 'housing', 'clickSpring') ? 'The switch is missing a piece, so the path is broken.'
        : "The end is open, so the electricity can't get all the way around.";
    }
    return { alive, reason, light: alive ? (has('reflector') ? 'beam' : 'wide') : 'none', lens: has('lens'), flicker: alive && !has('dCap') };
  },

  apply(out, inst) {
    const r = inst.refs, L = out.light;
    r.beam.visible = L === 'beam';
    r.wide.visible = L === 'wide';
    const open = !out.lens; // no lens: a wider, dimmer spot
    r.baseI = (L === 'beam' ? 2.8 : L === 'wide' ? 0.9 : 0) * (open ? 0.7 : 1);
    r.spot.intensity = r.baseI;
    r.spot.angle = (L === 'wide' ? 0.75 : 0.3) + (open ? 0.18 : 0);
    r.beam.scale.set(open ? 1.25 : 1, 1, open ? 1.25 : 1);
    r.beam.material.opacity = open ? 0.11 : 0.16;
    r.bulbGlass.material.emissiveIntensity = L !== 'none' ? 2.2 : 0;
    r.ledChip.material.emissiveIntensity = L !== 'none' ? 4 : 0;
  },

  // no smoothing capacitor: the light flickers
  tick(dt, t, inst, out) {
    const r = inst.refs;
    if (!out || !out.alive || !out.flicker || r.baseI == null) return;
    const f = 0.35 + 0.65 * (Math.sin(t * 41) > -0.2 ? 1 : 0.2) * (0.7 + 0.3 * Math.sin(t * 9));
    r.spot.intensity = r.baseI * f;
    r.bulbGlass.material.emissiveIntensity = 2.2 * f;
    r.ledChip.material.emissiveIntensity = 4 * f;
  },
});

Object.assign(TAL.insideByName, {
  'LED star board': 'pcb-inside', 'Driver board': 'pcb-inside', 'Thermal paste': 'heatsink-inside', 'LED driver chip': 'chip-package',
  'Sense resistor': 'resistor-inside', 'Inductor': 'transformer-inside', 'Smoothing capacitor': 'cap-inside', 'Diode': 'diode-inside',
  'Red wire': 'wire-inside', 'Black wire': 'wire-inside', 'Switch housing': 'switch-inside', 'Click spring': 'switch-inside',
});
