/* Flashlight: a simple circuit. Beginner 6 pieces, Medium 8, Advanced 17.
 * Shows how a non-screen device plugs into the engine (apply() drives the light beam). */
TAL.registerDevice({
  id: 'flashlight',
  name: 'Flashlight',
  short: 'flashlight',
  subtitle: 'A little circuit you can hold',
  powerSound: 'click',
  channels: false,
  view: { target: [0, 1.3, 0], radius: 4.6, explodedRadius: 7.4, explodedY: 1.7, yaw: -0.3, pitch: 0.38, shadow: [9, 3] },
  intro: 'This is a flashlight. It is a great way to see how electricity travels in a loop.',
  shellSay: "That's the flashlight's tube. The batteries hide inside it. Try the X-ray button to see them!",
  guide: [
    { do: 'power', say: "Hi, I'm Sparky! Press the green power button to switch the flashlight on.", nudge: 'Press the power button.' },
    { do: 'remove', ids: ['tailcap'], say: 'Now twist off the black end cap. What happens to the light?', nudge: 'Drag the black end cap off.' },
    { do: 'remove', ids: ['spring'], say: 'Pull out the shiny spring.', nudge: 'Pull out the spring.' },
    { do: 'remove', ids: ['bat1'], say: 'Now slide out a battery!', nudge: 'Pull out the battery.' },
    { do: 'remove', ids: ['wrap1'], levels: [3], say: 'Peel the blue label off the battery. What is underneath?', nudge: 'Peel off the blue label.' },
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

    // ---- lens (+ its rubber ring)
    const lens = k.group(k.at(along(k.cyl(0.6, 0.6, 0.05, k.glass(0xdff3ff, 0.35), 32)), -2.42, Y, 0), k.at(ringX(0.6, 0.04, k.metal(0xcfd5dc)), -2.42, Y, 0));
    body.add(lens);
    add({ id: 'lens', name: 'Lens', obj: lens, pull: [-0.8, 0, 2.4], face: [-1, 0, 0],
      say: 'The clear lens lets the light out and keeps the dust out.',
      breaks: 'The light still shines, but the beam is wider and a little dimmer. And dust can get in!' });
    sub(lens, 'lens', { id: 'oringL', name: 'Rubber ring', obj: k.at(k.group(ringX(0.57, 0.022, rubber)), -2.39, Y, 0), pull: [0.0, -0.5, 0.5], level: 3,
      say: 'A rubber ring seals the lens so water cannot sneak in.', breaks: 'The light still works, but now rain could get inside!', breaksAlways: true });

    // ---- reflector
    const reflector = k.group(k.at(along(k.cyl(0.18, 0.58, 0.5, k.mat(0xe9eef4, { roughness: 0.18, metalness: 0.35, side: T.DoubleSide }), 32, true)), -2.12, Y, 0));
    body.add(reflector);
    add({ id: 'reflector', name: 'Reflector', obj: reflector, pull: [-0.3, 0.9, 2.2], blockedBy: ['lens'], level: 2, fuse: 'lens', face: [-1, 0, 0],
      say: 'The shiny cup bounces the light forward into a beam.',
      breaks: 'Without the shiny cup, the light spreads out everywhere and gets weak.',
      fact: 'It works like a mirror. Light that would go sideways bounces off and goes forward instead.',
      symptom: 'The light is weak and spreads out everywhere.' });

    // ---- bulb (+ the tiny LED chip inside it)
    const bulbGlass = k.sphere(0.13, k.glow(0xfffbe8, 0xfff2b0));
    bulbGlass.material.transparent = true; bulbGlass.material.opacity = 0.85;
    const bulb = k.group(k.at(bulbGlass, -1.95, Y, 0), k.at(along(k.cyl(0.09, 0.09, 0.2, k.metal(0xb9bec6), 16)), -1.78, Y, 0));
    body.add(bulb);
    add({ id: 'bulb', name: 'LED bulb', obj: bulb, pull: [0.3, 1.8, 1.7], blockedBy: ['reflector'], face: [-1, 0, 0], focusRadius: 0.6,
      say: 'This little bulb makes the light!', breaks: 'No bulb, no light!',
      fact: 'This bulb is an LED. When electricity flows through it, it glows.',
      symptom: 'The switch clicks, but the bulb stays dark.' });
    const ledChip = k.at(k.group(k.box(0.05, 0.05, 0.05, k.glow(0xffe9a8, 0xfff2c0))), -1.95, Y, 0);
    sub(bulb, 'bulb', { id: 'ledChip', name: 'LED chip', obj: ledChip, pull: [-0.3, 0.4, 0.4], level: 3,
      say: 'This tiny chip is the part that really glows. The glass around it just protects it.', breaks: 'No chip, no light!',
      symptom: 'The glass looks fine, but no light comes out.' });

    // ---- switch (+ button cap and metal contact)
    const sw = k.group(k.at(k.box(0.5, 0.06, 0.32, k.metal(0x2a2a2a)), -1.0, Y + 0.42, 0));
    body.add(sw);
    add({ id: 'switch', name: 'Switch', obj: sw, pull: [0, 1.3, 0.9], face: [0, 1, 0], focusRadius: 0.7,
      say: 'The switch opens and closes the path for the electricity.', breaks: 'The path is broken, so the light goes out.',
      fact: 'When you click it on, a little piece of metal touches and closes the loop. Click it off and the loop opens.',
      symptom: 'The switch does not click right. It feels broken.' });
    sub(sw, 'switch', { id: 'button', name: 'Button cap', obj: k.at(k.group(k.cyl(0.13, 0.15, 0.14, k.mat(0x3a3a3a, { roughness: 0.8 }), 20)), -1.0, Y + 0.5, 0), pull: [0, 0.5, 0.3], level: 3,
      say: 'The rubber button cap is the part your thumb pushes.', breaks: 'The switch still works, you just push the metal part now.', breaksAlways: true });
    sub(sw, 'switch', { id: 'contact', name: 'Switch contact', obj: k.at(k.group(k.box(0.3, 0.03, 0.12, k.metal(0xd8c48a))), -1.0, Y + 0.36, 0), pull: [0.4, 0.6, 0.4], level: 3,
      say: 'This little metal strip is what really touches to close the loop.', breaks: 'No contact, so the loop is open. No light!',
      symptom: 'The switch feels mushy, and the light never comes on.' });

    // ---- batteries (+ their labels)
    const battery = (cx) => {
      const g = k.group(
        k.at(along(k.cyl(0.33, 0.33, 1.15, k.metal(0xb8bdc4, { roughness: 0.4 }), 28)), cx, Y, 0),
        k.at(along(k.cyl(0.345, 0.345, 0.14, k.metal(0xc9ced6), 28)), cx - 0.62, Y, 0),
        k.at(along(k.cyl(0.1, 0.1, 0.1, k.metal(0xc9ced6), 14)), cx - 0.73, Y, 0),
        k.at(along(k.cyl(0.345, 0.345, 0.06, k.metal(0xc9ced6), 28)), cx + 0.6, Y, 0)
      );
      const wrap = k.group(k.at(along(k.cyl(0.345, 0.345, 1.1, k.mat(0x2457c5, { roughness: 0.35 }), 28, true)), cx, Y, 0));
      body.add(g);
      return { g, wrap };
    };
    const b1 = battery(0.85), b2 = battery(-0.5);
    add({ id: 'bat1', name: 'Battery', obj: b1.g, pull: [2.4, -0.62, 2.4], blockedBy: ['tailcap', 'spring'], face: [0, 0, 1], focusRadius: 1,
      say: 'Batteries store electricity, like a lunchbox stores food.', breaks: 'With a battery gone, the loop is broken. No light!',
      fact: loop, symptom: 'It is dead. The batteries feel empty.' });
    add({ id: 'bat2', name: 'Battery', obj: b2.g, pull: [3.7, -0.62, 3.3], blockedBy: ['bat1'], face: [0, 0, 1], focusRadius: 1,
      say: 'Another battery! Two batteries push the electricity twice as hard.', breaks: 'With a battery gone, the loop is broken. No light!', fact: loop,
      symptom: 'It is dead. One of the batteries feels empty.' });
    [b1, b2].forEach((b, i) => sub(b.g, 'bat' + (i + 1), { id: 'wrap' + (i + 1), name: 'Battery label', obj: b.wrap, pull: [0, 0.7, 0.3], level: 3, face: [0, 0, 1],
      say: 'The label is just a wrapper. Underneath is a metal can full of special paste that makes electricity.',
      breaks: 'The battery still works without its label!', breaksAlways: true,
      fact: 'The bumpy end is plus and the flat end is minus. Electricity flows out one end and back into the other.' }));

    // ---- spring
    const pts = [];
    for (let i = 0; i <= 70; i++) { const a = i * 0.55; pts.push([1.5 + i * 0.0045, Y + Math.sin(a) * 0.24, Math.cos(a) * 0.24]); }
    const spring = k.group(k.tube(pts, 0.022, k.metal(0xd7dce2, { roughness: 0.2 })));
    body.add(spring);
    add({ id: 'spring', name: 'Spring', obj: spring, pull: [1.0, 0.9, 1.9], blockedBy: ['tailcap'], level: 2, fuse: 'tailcap', face: [1, 0, 0],
      say: 'The spring pushes the batteries together so they touch.', breaks: "The batteries aren't pushed together anymore. No light!",
      fact: loop, symptom: 'The batteries rattle around loose inside, and the light will not come on.' });

    // ---- end cap (+ rubber ring, lanyard loop)
    const tailcap = k.group(k.at(along(k.cyl(0.45, 0.45, 0.45, k.metal(0x2d2d30, { roughness: 0.5 }), 32)), 1.83, Y, 0));
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; tailcap.add(k.at(k.box(0.4, 0.03, 0.03, k.metal(0x1f1f22)), 1.83, Y + Math.sin(a) * 0.455, Math.cos(a) * 0.455)); }
    body.add(tailcap);
    add({ id: 'tailcap', name: 'End cap', obj: tailcap, pull: [1.6, 0, 1.5], face: [1, 0, 0], focusRadius: 0.9,
      say: 'The end cap screws on and holds the batteries in.',
      breaks: 'The end is open, so the electricity cannot get all the way around. The light goes out.', fact: loop,
      symptom: 'The back end feels loose, and the light will not come on.' });
    sub(tailcap, 'tailcap', { id: 'oringT', name: 'Rubber ring', obj: k.at(k.group(ringX(0.43, 0.025, rubber)), 1.62, Y, 0), pull: [-0.3, -0.5, 0.4], level: 3,
      say: 'A rubber ring seals the end cap so water cannot sneak in.', breaks: 'The light still works, but now rain could get inside!', breaksAlways: true });
    sub(tailcap, 'tailcap', { id: 'lanyard', name: 'Lanyard loop', obj: k.at(k.group(ringX(0.16, 0.035, k.metal(0xb9bec6))), 2.12, Y, 0), pull: [0.5, 0.4, 0.3], level: 3,
      say: 'The loop is for a string, so you can hang the flashlight on your wrist.' });

    // ---- pocket clip
    const clip = k.group(k.at(k.box(1.2, 0.04, 0.12, k.metal(0xc9ced6)), 0.6, Y + 0.45, 0), k.at(k.box(0.12, 0.06, 0.12, k.metal(0xc9ced6)), 1.15, Y + 0.43, 0));
    body.add(clip);
    add({ id: 'clip', name: 'Pocket clip', obj: clip, pull: [0, 1.4, 1.2], level: 3, face: [0, 1, 0],
      say: 'The pocket clip holds the flashlight on your pocket or backpack.' });

    return { root, shell: [shell], parts, refs: { beam, wide, spot, bulbGlass, ledChip: ledChip.children[0] } };
  },

  evaluate(has, on) {
    const circuit = has('bat1') && has('bat2') && has('spring') && has('tailcap') && has('switch') && has('contact') && has('bulb') && has('ledChip');
    const alive = on && circuit;
    let reason = '';
    if (on && !circuit) {
      reason = !has('bulb') || !has('ledChip') ? "There's no bulb to make light!"
        : !has('bat1') || !has('bat2') ? "A battery is missing, so the electricity can't make a loop."
        : !has('switch') || !has('contact') ? 'The switch is missing, so the path is broken.'
        : "The end is open, so the electricity can't get all the way around.";
    }
    return { alive, reason, light: alive ? (has('reflector') ? 'beam' : 'wide') : 'none', lens: has('lens') };
  },

  apply(out, inst) {
    const r = inst.refs, L = out.light;
    r.beam.visible = L === 'beam';
    r.wide.visible = L === 'wide';
    const open = !out.lens; // no lens: a wider, dimmer spot
    r.spot.intensity = (L === 'beam' ? 2.8 : L === 'wide' ? 0.9 : 0) * (open ? 0.7 : 1);
    r.spot.angle = (L === 'wide' ? 0.75 : 0.3) + (open ? 0.18 : 0);
    r.beam.scale.set(open ? 1.25 : 1, 1, open ? 1.25 : 1);
    r.beam.material.opacity = open ? 0.11 : 0.16;
    r.bulbGlass.material.emissiveIntensity = L !== 'none' ? 2.2 : 0;
    r.ledChip.material.emissiveIntensity = L !== 'none' ? 4 : 0;
  },
});
