/* Flashlight: a simple circuit. Shows how a non-screen device plugs into the engine (custom apply() drives the light). */
TAL.registerDevice({
  id: 'flashlight',
  name: 'Flashlight',
  short: 'flashlight',
  subtitle: 'A little circuit you can hold',
  powerSound: 'click',
  channels: false,
  view: { target: [0, 1.3, 0], radius: 4.6, explodedRadius: 5.6, explodedY: 1.5, yaw: -0.3, pitch: 0.38, shadow: [9, 3] },
  intro: 'This is a flashlight. It is a great way to see how electricity travels in a loop.',
  guide: [
    { do: 'power', say: "Hi, I'm Sparky! Press the green power button to switch the flashlight on.", nudge: 'Press the power button.' },
    { do: 'remove', ids: ['tailcap'], say: 'Now twist off the black end cap. What happens to the light?', nudge: 'Drag the black end cap off.' },
    { do: 'remove', ids: ['spring'], say: 'Pull out the shiny spring.', nudge: 'Pull out the spring.' },
    { do: 'remove', ids: ['bat1'], say: 'Now slide out a battery!', nudge: 'Pull out the battery.' },
    { do: 'end', say: 'The light needs a full loop: battery, spring, cap, switch and bulb. Put them all back and turn it on again!' },
  ],
  shellSay: "That's the flashlight's tube. The batteries hide inside it. Try the X-ray button to see them!",

  build(k) {
    const T = k.THREE;
    const root = k.group();
    const Y = 1.0, X = 2.2; // flashlight center; it points left, toward the wall
    const body = k.at(k.group(), X, 0, 0);
    root.add(body);
    const red = k.metal(0xd8342c, { roughness: 0.35, metalness: 0.55 });
    const along = (m) => k.rot(m, 0, 0, Math.PI / 2); // turn a cylinder to lie along x

    // ---- shell: tube, head, cradles
    const shell = k.group(
      k.at(along(k.cyl(0.42, 0.42, 3.2, red, 32, true)), 0, Y, 0),
      k.at(along(k.cyl(0.62, 0.45, 0.8, k.metal(0xd8342c, { roughness: 0.35, metalness: 0.55, side: T.DoubleSide }), 32, true)), -2.0, Y, 0)
    );
    for (let i = 0; i < 6; i++) shell.add(k.at(k.rot(k.torus(0.43, 0.025, k.metal(0x9e231d)), 0, Math.PI / 2, 0), 0.4 + i * 0.18, Y, 0));
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

    // ---- parts
    const lens = k.group(k.at(along(k.cyl(0.6, 0.6, 0.05, k.glass(0xdff3ff, 0.35), 32)), -2.42, Y, 0));
    lens.add(k.at(k.rot(k.torus(0.6, 0.04, k.metal(0xcfd5dc)), 0, Math.PI / 2, 0), -2.42, Y, 0));
    body.add(lens);
    const reflector = k.group(k.at(along(k.cyl(0.18, 0.58, 0.5, k.mat(0xe9eef4, { roughness: 0.18, metalness: 0.35, side: T.DoubleSide }), 32, true)), -2.12, Y, 0));
    body.add(reflector);
    const bulbGlass = k.sphere(0.13, k.glow(0xfffbe8, 0xfff2b0));
    const bulb = k.group(k.at(bulbGlass, -1.95, Y, 0), k.at(along(k.cyl(0.09, 0.09, 0.2, k.metal(0xb9bec6), 16)), -1.78, Y, 0));
    body.add(bulb);
    const sw = k.group(
      k.at(k.box(0.5, 0.06, 0.32, k.metal(0x2a2a2a)), -1.0, Y + 0.42, 0),
      k.at(k.cyl(0.13, 0.15, 0.14, k.mat(0x3a3a3a, { roughness: 0.8 }), 20), -1.0, Y + 0.5, 0)
    );
    body.add(sw);
    const battery = (cx) => {
      const g = k.group(
        k.at(along(k.cyl(0.34, 0.34, 1.15, k.mat(0x2457c5, { roughness: 0.35 }), 28)), cx, Y, 0),
        k.at(along(k.cyl(0.345, 0.345, 0.14, k.metal(0xc9ced6), 28)), cx - 0.62, Y, 0),
        k.at(along(k.cyl(0.1, 0.1, 0.1, k.metal(0xc9ced6), 14)), cx - 0.73, Y, 0),
        k.at(along(k.cyl(0.345, 0.345, 0.06, k.metal(0xc9ced6), 28)), cx + 0.6, Y, 0)
      );
      body.add(g);
      return g;
    };
    const bat1 = battery(0.85), bat2 = battery(-0.5);
    const pts = [];
    for (let i = 0; i <= 70; i++) { const a = i * 0.55; pts.push([1.5 + i * 0.0045, Y + Math.sin(a) * 0.24, Math.cos(a) * 0.24]); }
    const spring = k.group(k.tube(pts, 0.022, k.metal(0xd7dce2, { roughness: 0.2 })));
    body.add(spring);
    const tailcap = k.group(
      k.at(along(k.cyl(0.45, 0.45, 0.45, k.metal(0x2d2d30, { roughness: 0.5 }), 32)), 1.83, Y, 0),
      k.at(k.rot(k.torus(0.16, 0.035, k.metal(0xb9bec6)), 0, Math.PI / 2, 0), 2.12, Y, 0)
    );
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; tailcap.add(k.at(k.box(0.4, 0.03, 0.03, k.metal(0x1f1f22)), 1.83, Y + Math.sin(a) * 0.455, Math.cos(a) * 0.455)); }
    body.add(tailcap);

    const loop = 'Electricity has to travel in a big loop: out of the battery, through the bulb, and back again. That loop is called a circuit.';
    const parts = [
      { id: 'lens', name: 'Lens', obj: lens, pull: [-0.8, 0, 2.4],
        say: 'The clear lens lets the light out and keeps the dust out.' },
      { id: 'reflector', name: 'Reflector', obj: reflector, pull: [-0.3, 0.9, 2.2], blockedBy: ['lens'],
        say: 'The shiny cup bounces the light forward into a beam.',
        breaks: 'Without the shiny cup, the light spreads out everywhere and gets weak.',
        fact: 'It works like a mirror. Light that would go sideways bounces off and goes forward instead.',
        symptom: 'The light is weak and spreads out everywhere.' },
      { id: 'bulb', name: 'LED bulb', obj: bulb, pull: [0.3, 1.8, 1.7], blockedBy: ['reflector'],
        say: 'This little bulb makes the light!',
        breaks: 'No bulb, no light!',
        fact: 'This bulb is an LED. When electricity flows through it, it glows.',
        symptom: 'It will not light up, even with the switch on.' },
      { id: 'switch', name: 'Switch', obj: sw, pull: [0, 1.3, 0.9],
        say: 'The switch opens and closes the path for the electricity.',
        breaks: 'The path is broken, so the light goes out.',
        fact: 'When you click it on, a little piece of metal touches and closes the loop. Click it off and the loop opens.',
        symptom: 'It will not light up, even with the switch on.' },
      { id: 'tailcap', name: 'End cap', obj: tailcap, pull: [1.6, 0, 1.5],
        say: 'The end cap screws on and holds the batteries in.',
        breaks: 'The end is open, so the electricity cannot get all the way around. The light goes out.',
        fact: loop },
      { id: 'spring', name: 'Spring', obj: spring, pull: [1.0, 0.9, 1.9], blockedBy: ['tailcap'],
        say: 'The spring pushes the batteries together so they touch.',
        breaks: "The batteries aren't pushed together anymore. No light!",
        fact: loop,
        symptom: 'It will not light up, even with the switch on.' },
      { id: 'bat1', name: 'Battery', obj: bat1, pull: [2.4, -0.62, 2.4], blockedBy: ['tailcap', 'spring'],
        say: 'Batteries store electricity, like a lunchbox stores food.',
        breaks: 'With a battery gone, the loop is broken. No light!',
        fact: loop,
        symptom: 'It will not light up, even with the switch on.' },
      { id: 'bat2', name: 'Battery', obj: bat2, pull: [3.7, -0.62, 3.3], blockedBy: ['bat1'],
        say: 'Another battery! Two batteries push the electricity twice as hard.',
        breaks: 'With a battery gone, the loop is broken. No light!',
        fact: loop },
    ];
    return { root, shell: [shell], parts, refs: { beam, wide, spot, bulbGlass } };
  },

  evaluate(has, on) {
    const circuit = has('bat1') && has('bat2') && has('spring') && has('tailcap') && has('switch') && has('bulb');
    const alive = on && circuit;
    let reason = '';
    if (on && !circuit) {
      reason = !has('bulb') ? "There's no bulb to make light!"
        : !has('bat1') || !has('bat2') ? "A battery is missing, so the electricity can't make a loop."
        : !has('switch') ? 'The switch is missing, so the path is broken.'
        : "The end is open, so the electricity can't get all the way around.";
    }
    return { alive, reason, light: alive ? (has('reflector') ? 'beam' : 'wide') : 'none' };
  },

  apply(out, inst) {
    const r = inst.refs, L = out.light;
    r.beam.visible = L === 'beam';
    r.wide.visible = L === 'wide';
    r.spot.intensity = L === 'beam' ? 2.8 : L === 'wide' ? 0.9 : 0;
    r.spot.angle = L === 'wide' ? 0.75 : 0.3;
    r.bulbGlass.material.emissiveIntensity = L !== 'none' ? 3 : 0;
  },
});
