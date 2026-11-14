/* Doorbell: a classic ding-dong chime. Beginner 5 pieces, Medium 11, Advanced 16.
 * Push the button (Power): the coil turns into a magnet and yanks the iron plunger into one tone bar (DING),
 * then the spring throws it back into the other bar (DONG). Also registers one world: Inside the electromagnet. */
(function () {
  const T = window.THREE;
  const CX = 1.5, CY = 1.9;   // the chime box center
  const TRAVEL = 0.35;        // how far the plunger swings from the middle

  // ---- a little sound maker of our own (the engine's sound helpers are private to engine.js)
  const Chime = {
    ctx: null,
    muted() { try { return JSON.parse(localStorage.getItem('tal-muted')) === true; } catch (e) { return false; } },
    ready() {
      try {
        if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return false; this.ctx = new C(); }
        if (this.ctx.state !== 'running') { const p = this.ctx.resume(); if (p && p.catch) p.catch(() => {}); }
        return true;
      } catch (e) { return false; }
    },
    // f = pitch; soft = felt pads on (round bell tone) or off (harsh clack)
    ring(f, soft) {
      if (this.muted() || !this.ready()) return;
      try {
        const c = this.ctx, t = c.currentTime, g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(soft ? 0.28 : 0.35, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (soft ? 1.4 : 0.35));
        g.connect(c.destination);
        (soft ? [[1, 'sine'], [2.76, 'sine'], [5.4, 'sine']] : [[1, 'square'], [1.5, 'square']]).forEach(([m, type], i) => {
          const o = c.createOscillator(), og = c.createGain();
          o.type = type; o.frequency.value = f * m; og.gain.value = soft ? [1, 0.35, 0.12][i] : 0.25;
          o.connect(og); og.connect(g); o.start(t); o.stop(t + 1.5);
        });
      } catch (e) { /* no sound is fine, the DING and DONG tags still show */ }
    },
  };

  const copperTex = (k) => k.canvasTex(64, 128, (c, w, h) => {
    c.fillStyle = '#8a4b1f'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { c.fillStyle = '#c9803a'; c.fillRect(0, y, w, 2); c.fillStyle = '#e3a15a'; c.fillRect(0, y, w, 1); }
  });

  TAL.registerDevice({
    id: 'doorbell',
    name: 'Doorbell',
    short: 'doorbell',
    subtitle: 'Ding, then dong!',
    powerSound: 'click',
    channels: false,
    view: { target: [0, 1.9, 0], radius: 6.6, explodedRadius: 9.0, explodedY: 2.0, yaw: -0.1, pitch: 0.28, shadow: [12, 4] },
    intro: 'This is a doorbell. Press the green power button, that is like pushing the doorbell. Listen for ding, then dong!',
    shellSay: 'That is the back of the chime box. It stays on the wall and holds everything.',
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button. That is like pushing the doorbell. Watch for ding, then dong!", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['cs1', 'cs2'], say: 'The cover has two screws. Twist them out with your finger!', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['cover'], say: 'Now lift off the cover and see what makes the sound.', nudge: 'Pull off the cover.' },
      { do: 'remove', ids: ['spring'], say: 'Pull out the spring. What do you hear now?', nudge: 'Pull out the spring.' },
      { do: 'remove', ids: ['coil'], say: 'Now pull out the coil. This is the part that turns into a magnet.', nudge: 'Pull out the coil.' },
      { do: 'remove', ids: ['felt1'], levels: [3], say: 'Peel off a soft felt pad. How does the sound change?', nudge: 'Pull off a felt pad.' },
      { do: 'end', say: 'Pushing the button makes a magnet, the magnet pulls the plunger, and the plunger hits the bars. Put everything back and push the button again!' },
    ],

    build(k) {
      const root = k.group();
      const parts = [];
      const add = (s) => { parts.push(s); return s; };
      const sub = (parentObj, parentId, s) => { parentObj.add(s.obj); s.parent = parentId; return add(s); };
      const Z = 0.5; // the depth of the working parts, in front of the back plate
      const brass = k.metal(0xdcb84e, { roughness: 0.28 });
      const silver = k.metal(0xcdd2d8, { roughness: 0.25 });
      const iron = k.metal(0x7d848d, { roughness: 0.4 });
      const wood = k.mat(0xb07a45, { roughness: 0.75 });

      // ---- scenery: the wall, and the back plate of the chime box (not removable)
      const wall = k.at(k.box(9.8, 4.2, 0.1, k.mat(0x9fc4bd, { roughness: 0.95 })), 0, 2.1, -0.2);
      wall.userData.noPick = true;
      root.add(wall);
      const back = k.group(k.at(k.box(4.7, 2.7, 0.25, wood), CX, CY, 0));
      root.add(back);

      // ---- cover (a lid: front plate with grille slots, plus four sides) + 2 screws
      const lid = k.mat(0xe9e3d4, { roughness: 0.6 });
      const cover = k.group(
        k.at(k.box(4.7, 2.7, 0.1, lid), CX, CY, 1.0),
        k.at(k.box(4.7, 0.1, 0.9, lid), CX, CY + 1.3, 0.55), k.at(k.box(4.7, 0.1, 0.9, lid), CX, CY - 1.3, 0.55),
        k.at(k.box(0.1, 2.7, 0.9, lid), CX - 2.3, CY, 0.55), k.at(k.box(0.1, 2.7, 0.9, lid), CX + 2.3, CY, 0.55)
      );
      [-1.7, 1.7].forEach((dx) => { for (let i = 0; i < 5; i++) cover.add(k.at(k.box(0.06, 1.4, 0.03, k.mat(0x6f6a5c)), CX + dx - 0.2 + i * 0.1, CY, 1.06)); });
      root.add(cover);
      add({ id: 'cover', name: 'Chime cover', obj: cover, pull: [0, 3.6, 1.2], blockedBy: ['cs1', 'cs2'], xray: true, face: [0, 0, 1], focusRadius: 4,
        say: 'The cover keeps fingers and dust away from the parts inside.',
        job: 'It protects the parts and makes the chime look neat.',
        learn: ['The slots let the sound out, so it is not muffled.', 'The cover is usually plastic or wood. It also keeps little fingers away from the moving plunger.', 'Many chime covers can be painted or swapped to match a house. The working parts underneath stay the same.'] });
      [-1, 1].forEach((s, i) => {
        const sc = k.rot(k.screw(0x9ea3ab, 0.3), Math.PI / 2, 0, 0);
        k.at(sc, CX + s * 2.05, CY + 1.05, 1.05);
        root.add(sc);
        add({ id: 'cs' + (i + 1), name: 'Cover screw', kind: 'screw', obj: sc, pull: [0, 0, 0.9], level: 2, fuse: 'cover',
          say: 'A screw! It holds the cover on. Lefty loosey, righty tighty.',
          job: 'It holds the cover on the wall box.',
          learn: ['A screw is a ramp wrapped around a nail. Turning it pulls it in tight.', 'The threads grip the wood, so the screw stays put until you turn it back.', 'Turning a screw many times lets a small twist make a big squeezing force.'] });
      });

      // ---- tone bars
      const barObj = (x, h, mat, id, name, text, learn, say, brk, sym) => {
        const inner = k.group(k.at(k.cyl(0.13, 0.13, h, mat, 20), x, CY + 0.05, Z), k.at(k.cyl(0.05, 0.05, 0.3, k.metal(0x8b9097), 8), x, CY + h / 2 + 0.1, Z));
        const g = k.group(inner);
        root.add(g);
        add({ id, name, obj: g, pull: [x < CX ? -1.4 : 1.4, 2.4, 1.2], blockedBy: ['cover'], level: 2, face: [0, 0, 1], focusRadius: 1.5, say, breaks: brk, fact: text, learn, symptom: sym });
        return inner;
      };
      const bar1 = barObj(CX - 1.7, 1.9, brass, 'bar1', 'Ding bar',
        'When the plunger hits a metal bar, the bar shakes. The shaking is the sound.',
        ['A hit makes the metal shiver very fast, and the shivering pushes the air, like ripples in a pond. Your ear catches those ripples as sound.', 'A shorter bar shivers faster and sounds higher. This one is short, so it sings the high note, ding.', 'The bar is hung or held at the spots where it can shiver freely. If you squeezed it tight, the sound would stop.'],
        'This is the ding bar. When the plunger hits it, it rings, like a little bell.', 'With no ding bar, the plunger hits nothing on this side. No ding!', 'I hear a dong but never a ding.');
      const bar2 = barObj(CX + 1.7, 1.5, silver, 'bar2', 'Dong bar',
        'The longer bar shakes slower, so its note is lower. Long and low is dong.',
        ['A longer bar shivers more slowly, and slow shivers sound lower. Short and fast is ding, long and slow is dong.', 'Tubes and bars of different lengths are how a chime makes different notes, like the pipes of an organ.', 'Each bar has its own natural pitch that depends on its length and stiffness. The plunger just gives it a knock, and the bar sings its own note.'],
        'This is the dong bar. It is longer, so its note is lower.', 'With no dong bar, the plunger hits nothing on this side. No dong!', 'It dings, but the second bar makes no sound.');

      // ---- coil: a hollow tube of copper wire turns, around the plunger
      const cmat = k.glow(0xb87333, 0xff8a3a); cmat.map = copperTex(k); cmat.side = T.DoubleSide; cmat.metalness = 0.4;
      const coilBody = k.at(k.rot(k.cyl(0.5, 0.5, 1.1, cmat, 36, true), 0, 0, Math.PI / 2), CX, CY, Z);
      const flange = (dx) => k.at(k.rot(k.mesh(new T.RingGeometry(0.2, 0.62, 28), k.mat(0x3a2f27, { side: T.DoubleSide })), 0, Math.PI / 2, 0), CX + dx, CY, Z);
      const coil = k.group(coilBody, flange(-0.56), flange(0.56));
      root.add(coil);
      add({ id: 'coil', name: 'Electromagnet coil', obj: coil, pull: [0, 2.2, 1.4], blockedBy: ['cover'], face: [0, 0, 1], focusRadius: 1.6,
        say: 'The coil is a long wire wound round and round. When electricity flows, it becomes a magnet!',
        breaks: 'No coil, no magnet. The plunger just sits there. No sound!',
        fact: 'A wire with electricity in it is a weak magnet. Winding it into a coil adds up all the little pulls.',
        learn: ['Think of one person pushing a car, then a whole team. Each loop of wire gives a little pull, and the coil adds them all up.', 'The magnet only exists while electricity flows. Switch the electricity off and the magnet is gone. That is an electromagnet.', 'Electric current makes a magnetic field around the wire. Coiling the wire stacks the fields inside the coil, and an iron core in the middle makes it much stronger.'],
        symptom: 'I push the button but nothing moves inside.' });

      // ---- plunger: an iron rod through the coil. The inner group is what slides.
      const pin = k.group(
        k.at(k.rot(k.cyl(0.17, 0.17, 2.4, iron, 20), 0, 0, Math.PI / 2), CX, CY, Z),
        k.at(k.rot(k.cyl(0.24, 0.24, 0.14, iron, 20), 0, 0, Math.PI / 2), CX - 1.15, CY, Z),
        k.at(k.rot(k.cyl(0.24, 0.24, 0.14, iron, 20), 0, 0, Math.PI / 2), CX + 1.15, CY, Z)
      );
      const plunger = k.group(pin);
      root.add(plunger);
      add({ id: 'plunger', name: 'Iron plunger', obj: plunger, pull: [0, -1.0, 1.8], blockedBy: ['cover'], face: [0, 0, 1], focusRadius: 1.8,
        say: 'The iron plunger gets yanked by the magnet and hits the bars.',
        breaks: 'The magnet has nothing to pull. No ding, no dong!',
        fact: 'Iron is pulled by a magnet. Wood and plastic are not.',
        learn: ['A magnet pulls on iron the way you pull on a toy with a string. The plunger is the toy.', 'The plunger is made of iron on purpose. Plastic or wood would just sit there when the coil turned on.', 'Iron is easy to magnetize. Inside, it has tiny magnets that line up when the coil is on, so the plunger itself becomes a magnet and is pulled in.'],
        symptom: 'The doorbell buzzes a little, but nothing hits the bars.' });
      [-1, 1].forEach((s, i) => {
        const pad = k.group(k.at(k.rot(k.cyl(0.25, 0.25, 0.06, k.mat(0xc23b3b, { roughness: 1 }), 20), 0, 0, Math.PI / 2), CX + s * 1.24, CY, Z));
        sub(pin, 'plunger', { id: 'felt' + (i + 1), name: 'Felt pad', obj: pad, pull: [0, -0.8 - i * 0.3, 1.2], level: 3, face: [0, 0, 1],
          say: 'A soft felt pad on the end. It makes the hit gentle, so the bar rings sweetly.',
          breaks: 'Without the soft pad, the hit sounds harsh and clacky. Ouch for the ears!', breaksAlways: true,
          fact: 'A soft tip softens the knock.',
          learn: ['Imagine tapping a bell with a pillow tip or a hard stick. The soft tip is quieter and kinder.', 'Felt also stops the plunger from bouncing and chattering against the bar, so the bell tone stays clean.', 'The bar rings its own note either way. A hard hit adds a lot of harsh, high noise on top. Felt takes that noise out.'] });
      });

      // ---- spring: pushes the plunger back (its inner group stretches and squashes)
      const SP_L = 0.63;
      const spts = [];
      for (let i = 0; i <= 60; i++) { const a = i * 0.9; spts.push([(i / 60) * SP_L, Math.sin(a) * 0.27, Math.cos(a) * 0.27]); }
      const springIn = k.group(k.tube(spts, 0.022, k.metal(0xd7dce2, { roughness: 0.2 })));
      k.at(springIn, CX + 0.6, CY, Z);
      const spring = k.group(springIn);
      root.add(spring);
      add({ id: 'spring', name: 'Spring', obj: spring, pull: [0.8, 2.0, 1.4], blockedBy: ['cover'], level: 2, fuse: 'plunger', face: [0, 0, 1], focusRadius: 1.2,
        say: 'The spring throws the plunger back to the other bar. That makes the second sound!',
        breaks: 'Without the spring, the plunger stays stuck after the ding. No dong!',
        fact: 'A squashed spring always wants to push back out.',
        learn: ['A spring is like a bouncy trampoline. Squash it and it bounces back.', 'When the magnet yanks the plunger, the spring gets squashed. When the magnet lets go, the squashed spring shoves the plunger back.', 'A spring stores energy when squeezed or stretched and gives it back as it returns. It pushes with a force that grows the more you squash it.'],
        symptom: 'It dings, but the plunger stays stuck and never swings back for the dong.' });

      // ---- the button on the wall, with a cap and a contact inside
      const BX = -3.9, BY = 1.7;
      const capIn = k.group(k.at(k.rot(k.cyl(0.24, 0.26, 0.14, k.mat(0xd8452e, { roughness: 0.5, metalness: 0.35 }), 24), Math.PI / 2, 0, 0), BX, BY, 0.27));
      const contactIn = k.group(k.at(k.box(0.28, 0.05, 0.03, k.metal(0xd8c48a)), BX, BY, 0.09));
      const button = k.group(k.at(k.rbox(0.8, 1.1, 0.16, k.mat(0xece6d4, { roughness: 0.5 }), 0.05), BX, BY, 0.06));
      root.add(button);
      add({ id: 'button', name: 'Doorbell button', obj: button, pull: [-1.2, 0.5, 2.0], face: [0, 0, 1], focusRadius: 1.3,
        say: 'The button is a switch. Pushing it starts the electricity.',
        breaks: 'No button, no push. The electricity never starts. No sound!',
        fact: 'A button closes the loop for electricity while you press it.',
        learn: ['Pushing the button is like opening a gate. The electricity can run through.', 'Inside, a metal strip touches another and joins the wires. Let go and a spring pops the strip away, and the loop opens again.', 'It is a momentary switch: connected only while pressed.'],
        symptom: 'I push the button and nothing happens at all.' });
      sub(button, 'button', { id: 'cap', name: 'Button cap', obj: capIn, pull: [0, 0.5, 0.6], level: 3, face: [0, 0, 1],
        say: 'The cap is the part your finger pushes. It is round and easy to find.',
        breaks: 'The doorbell still works, you just push the inside part now.', breaksAlways: true,
        fact: 'The cap is just a friendly cover for the part that really switches.',
        learn: ['The cap is like the lid on a jar. It is for your finger, not for the electricity.', 'It is often plastic, so your finger never touches the metal inside.', 'Sometimes it has a small light so you can find it in the dark.'] });
      sub(button, 'button', { id: 'contact', name: 'Button contact', obj: contactIn, pull: [0.4, 0.4, 0.5], level: 3, face: [0, 0, 1],
        say: 'This little metal strip touches the wires when you press, and closes the loop.',
        breaks: 'The strip is gone, so the loop never closes. No sound!',
        fact: 'Metal carries electricity. When two metal pieces touch, the loop is closed.',
        learn: ['Two metal pieces meeting is like two friends holding hands. Electricity can cross.', 'Metal is used because electricity moves easily through it.', 'Contacts are sometimes plated with a metal that does not rust, so the touch stays clean.'],
        symptom: 'I push the button and nothing happens at all.' });

      // ---- transformer on the wall (turns the strong wall electricity into a gentle one)
      const TX = -1.9, TY = 0.7;
      const coilM = k.mat(0xb87333, { metalness: 0.5, roughness: 0.4 });
      const trans = k.group(
        k.at(k.box(1.2, 0.9, 0.12, k.mat(0x3b3f46, { roughness: 0.7 })), TX, TY, 0.06),
        k.at(k.box(0.34, 0.74, 0.34, coilM), TX - 0.25, TY, 0.28), k.at(k.box(0.34, 0.74, 0.34, coilM), TX + 0.25, TY, 0.28),
        k.at(k.cyl(0.04, 0.04, 0.08, silver, 8), TX - 0.2, TY + 0.38, 0.1), k.at(k.cyl(0.04, 0.04, 0.08, silver, 8), TX + 0.2, TY + 0.38, 0.1)
      );
      const core = k.group(k.at(k.box(1.1, 0.14, 0.34, iron), TX, TY + 0.42, 0.28), k.at(k.box(1.1, 0.14, 0.34, iron), TX, TY - 0.42, 0.28), k.at(k.box(0.14, 0.9, 0.34, iron), TX, TY, 0.28));
      root.add(trans);
      add({ id: 'transformer', name: 'Transformer', obj: trans, pull: [-1.0, -0.4, 1.6], level: 2, face: [0, 0, 1], focusRadius: 1.2,
        say: 'The transformer makes the wall electricity gentle and safe for the doorbell.',
        breaks: 'No transformer, so the doorbell gets no electricity. No sound!',
        fact: 'The doorbell wires carry a gentle, low electricity. The house wires carry a strong one.',
        learn: ['It is like a gentle faucet turned down low. The strong water from the wall becomes a tiny stream.', 'Two coils sit near each other. The big coil makes a changing magnet, and the little coil catches it as gentle electricity.', 'Fewer turns on the output coil means lower voltage. That is why bell wires are safe to touch.'],
        symptom: 'The whole doorbell is dead, even when I push the button.' });
      sub(trans, 'transformer', { id: 'core', name: 'Iron core', obj: core, pull: [0, 1.0, 1.0], level: 3, face: [0, 0, 1],
        say: 'The iron core carries the magnetism from one coil to the other.',
        breaks: 'Without the iron core, the little coil barely hears the big one. Almost no electricity gets through. No sound!',
        fact: 'Iron guides magnetism the way a pipe guides water.',
        learn: ['The iron is like a slide that sends the magnetism from one coil to the other.', 'It is made of thin stacked sheets, which helps it waste less energy as heat.', 'Magnetic field lines prefer to travel through iron, so the core concentrates and routes the field between the two windings.'],
        symptom: 'The whole doorbell is dead, even when I push the button.' });

      // ---- wires: button -> coil -> transformer -> button, one loop
      const wireR = (col) => k.mat(col, { roughness: 0.5 });
      const w1 = k.tube([[BX, BY - 0.2, 0.15], [-3.3, 1.2, 0.18], [-2.3, 0.95, 0.22], [TX - 0.2, TY + 0.4, 0.2]], 0.035, wireR(0xd8342c));
      const w2 = k.tube([[BX, BY - 0.35, 0.15], [-3.0, 0.5, 0.15], [-1.1, 0.5, 0.25], [CX - 2.2, 1.1, 0.3], [CX - 1.2, CY - 0.55, 0.3], [CX - 0.55, CY - 0.4, 0.4]], 0.035, wireR(0xf2f2f2));
      const w3 = k.tube([[TX + 0.2, TY + 0.4, 0.2], [-0.9, 0.35, 0.2], [1.5, 0.3, 0.2], [3.9, 0.7, 0.2], [CX + 2.2, 1.7, 0.3], [CX + 1.2, CY - 0.55, 0.4], [CX + 0.55, CY - 0.4, 0.4]], 0.035, wireR(0x2a2a2a));
      const wires = k.group(w1, w2, w3);
      root.add(wires);
      add({ id: 'wires', name: 'Doorbell wires', obj: wires, pull: [0, -1.0, 2.6], face: [0, 0, 1], focusRadius: 3,
        say: 'The wires carry the electricity from the transformer to the button, and then to the coil.',
        breaks: 'Without the wires, the electricity has no road. No sound!',
        fact: 'Electricity needs a full loop of metal to run around.',
        learn: ['The wires are like little roads. Electricity drives along them in a loop.', 'Copper wire is covered with colored plastic so the wires do not touch each other by accident.', 'Doorbell wire carries low voltage, so it is thin. The plastic coat is an insulator, so the electricity stays in the copper.'],
        symptom: 'The whole doorbell is dead, even when I push the button.' });

      // ---- effects: halo + magnet tag, DING / DONG tags, field dots
      const halo = TAL.wk.halo(k, CX, CY, Z + 0.2, 0xffa24a, 2.8);
      const magTag = k.label('MAGNET!', { size: 0.34, bg: 'rgba(160,40,200,0.92)' }); magTag.position.set(CX, CY + 1.0, Z + 0.9); magTag.visible = false;
      const dingTag = k.label('DING!', { size: 0.44, bg: 'rgba(214,150,20,0.95)' }); dingTag.position.set(CX - 1.7, CY + 1.5, Z + 1.0); dingTag.visible = false;
      const dongTag = k.label('DONG!', { size: 0.44, bg: 'rgba(60,110,200,0.95)' }); dongTag.position.set(CX + 1.7, CY + 1.3, Z + 1.0); dongTag.visible = false;
      root.add(halo, magTag, dingTag, dongTag);
      const flow = k.flow([[CX - 0.55, CY - 0.4, 0.4], [CX - 1.2, CY - 0.55, 0.4], [CX - 2.2, 1.1, 0.3], [-1.1, 0.5, 0.25], [-3.0, 0.5, 0.15], [BX, BY - 0.35, 0.15], [BX, BY - 0.2, 0.15], [-3.3, 1.2, 0.18], [-2.3, 0.95, 0.22], [TX - 0.2, TY + 0.4, 0.2], [TX + 0.2, TY + 0.4, 0.2], [-0.9, 0.35, 0.2], [1.5, 0.3, 0.2], [3.9, 0.7, 0.2], [CX + 2.2, 1.7, 0.3], [CX + 0.55, CY - 0.4, 0.4]], { count: 18, color: 0x58b8ff, size: 0.12 });
      flow.visible = false;
      root.add(flow);

      return { root, shell: [back], parts, refs: { pin, springIn, capIn, halo, magTag, dingTag, dongTag, bar1, bar2, flow, off: 0, clock: 0, prev: 0, dingT: 0, dongT: 0, wob1: 0, wob2: 0, coilMat: cmat } };
    },

    evaluate(has, on) {
      const circuit = has('button') && has('contact') && has('wires') && has('transformer') && has('core');
      const magnet = circuit && has('coil');
      const move = magnet && has('plunger');
      const alive = on && move;
      let reason = '';
      if (on && !move) {
        reason = !circuit ? (!has('wires') ? 'The wires are missing, so the electricity has no road.' : !has('transformer') || !has('core') ? 'The transformer is not giving any electricity.' : 'The button is not closing the loop, so no electricity.')
          : !has('coil') ? 'The coil is missing, so there is no magnet.' : 'The plunger is missing, so the magnet has nothing to pull.';
      }
      return { alive, reason, magnet: on && magnet, ding: alive && has('bar1'), dong: alive && has('spring') && has('bar2'), spring: has('spring'), soft: has('felt1') && has('felt2'), flow: on && circuit };
    },

    apply(out, inst) {
      const r = inst.refs;
      inst.parts.forEach((p) => { p.blockedBy = p.blockedBy.filter((b) => inst.byId[b]); }); // drop blockers that are not separate pieces at this level
      r.flow.visible = !!out.flow && !!out.alive;
      if (!out.alive) { r.halo.visible = false; r.magTag.visible = false; r.coilMat.emissiveIntensity = 0; r.clock = 0; r.prev = 0; }
    },

    tick(dt, t, inst, out) {
      const r = inst.refs;
      if (!out) return;
      const ease = (a, b, rate) => a + (b - a) * Math.min(1, dt * rate);
      r.dingT = Math.max(0, r.dingT - dt); r.dongT = Math.max(0, r.dongT - dt);
      r.wob1 = Math.max(0, r.wob1 - dt); r.wob2 = Math.max(0, r.wob2 - dt);
      let magnetOn = false;
      if (out.alive) {
        r.prev = r.clock; r.clock += dt;
        const c = r.clock % 3.2, was = r.prev % 3.2;
        const cross = (x) => (was > c ? (c >= x || was < x) : (was < x && c >= x)); // did this frame cross time x?
        if (c < 0.7) { r.off = ease(r.off, -TRAVEL, 22); magnetOn = true; }
        else if (out.spring && c < 0.9) r.off = ease(r.off, TRAVEL, 30);
        else if (out.spring) { const s = c - 0.9; r.off = TRAVEL * Math.cos(s * 5) * Math.exp(-s * 2.2); }
        if (cross(0.12) && r.clock > 0) {
          if (out.ding) { Chime.ring(660, out.soft); r.dingT = 1.0; r.wob1 = 0.5; }
        }
        if (cross(0.9) && out.dong) { Chime.ring(494, out.soft); r.dongT = 1.0; r.wob2 = 0.5; }
      } else if (out.spring) r.off = ease(r.off, 0, 4);
      // plunger, spring, button cap, glow, tags
      r.pin.position.x = r.off;
      r.springIn.scale.x = Math.max(0.05, (1.15 + r.off - 0.07 - 0.6) / 0.63);
      r.capIn.position.z = magnetOn ? -0.07 : 0;
      r.halo.visible = magnetOn; r.magTag.visible = magnetOn;
      r.coilMat.emissiveIntensity = magnetOn ? 1.4 : 0;
      r.dingTag.visible = r.dingT > 0; r.dongTag.visible = r.dongT > 0;
      r.dingTag.position.y = CY + 1.5 + (1 - r.dingT) * 0.3; r.dongTag.position.y = CY + 1.3 + (1 - r.dongT) * 0.3;
      r.bar1.position.x = r.wob1 > 0 ? Math.sin(t * 90) * 0.02 * r.wob1 * 2 : 0;
      r.bar2.position.x = r.wob2 > 0 ? Math.sin(t * 90) * 0.02 * r.wob2 * 2 : 0;
      if (r.flow.visible) TAL.wk.upd([r.flow], dt, 0.35);
    },
  });

  // =====================================================================  world: inside the electromagnet
  const W = TAL.wk;
  W.world({
    id: 'electromagnet-inside', name: 'Inside the electromagnet', zoom: '2×', short: 'electromagnet',
    view: W.view(1.4, 4.6, 5.6, -0.2, 0.3),
    dial: { label: 'Electricity', steps: [
      { name: 'Off', level: 0, say: 'The electricity is off. No magnet. The paper clips just lie there.' },
      { name: 'Low', level: 1, say: 'A little electricity. A weak magnet. It picks up one paper clip.' },
      { name: 'Medium', level: 2, say: 'More electricity makes a stronger magnet. Now it holds two clips!' },
      { name: 'High', level: 3, say: 'A lot of electricity. A strong magnet. It holds all three clips!' },
    ] },
    intro: 'This is a nail wrapped in wire, a bit bigger than life. Tap the electricity button to turn the current up and down, and watch the paper clips. Then pull out the nail!',
    shellSay: 'This is an electromagnet: a nail wrapped in wire and joined to a battery.',
    learn: ['An electromagnet is a magnet you can switch on and off with electricity.', 'More electricity, or more loops of wire, makes the magnet stronger.', 'The iron nail in the middle makes the magnet much stronger than the coil alone.'],
    build(k) {
      const root = k.group(), parts = [], add = (s) => parts.push(W.part(k, root, s));
      const NY = 1.4, copper = k.metal(0xc17a3a, { roughness: 0.35 });
      // table
      const table = k.at(k.box(8, 0.12, 3, k.mat(0xb07a45, { roughness: 0.8 })), 0, 0, 0); table.userData.noPick = true; root.add(table);
      // nail
      const nailG = k.group(
        k.at(k.rot(k.cyl(0.17, 0.17, 3.4, k.metal(0x8b9199, { roughness: 0.4 }), 20), 0, 0, Math.PI / 2), 0, NY, 0),
        k.at(k.rot(k.cyl(0.32, 0.32, 0.1, k.metal(0x8b9199), 20), 0, 0, Math.PI / 2), -1.75, NY, 0),
        k.at(k.rot(k.cyl(0.17, 0.02, 0.2, k.metal(0x8b9199), 20), 0, 0, -Math.PI / 2), 1.8, NY, 0));
      add({ id: 'nail', name: 'Iron nail', obj: nailG, pull: [0, 2.2, 1.8], tagAt: [-1.8, NY + 0.7, 0],
        say: 'The iron nail makes the magnet much stronger.',
        breaks: 'Without the nail, the magnet is still there but weak.',
        learn: ['The nail is like a megaphone for magnetism: it makes the pull much louder.', 'Iron joins in. Its tiny magnets line up with the coil, and all their pulls add together.', 'That is why electromagnets almost always have an iron core.'] });
      // coil: a helix around the nail
      const hp = [];
      for (let i = 0; i <= 120; i++) { const f = i / 120, a = f * Math.PI * 2 * 9; hp.push([-1.0 + f * 2.0, NY + Math.sin(a) * 0.42, Math.cos(a) * 0.42]); }
      add({ id: 'wire', name: 'Wire coil', fixed: true, obj: k.group(k.tube(hp, 0.05, copper)), tagAt: [0, NY + 0.8, 0],
        say: 'The wire goes round and round the nail. Each loop adds a little more magnet.',
        learn: ['Many loops are stronger than few, like many people pushing a car.', 'Electricity in a wire always makes a tiny magnet around it. The loops stack those tiny magnets together.', 'Doubling the loops roughly doubles the strength of the magnetic field, if the same current flows.'] });
      // battery on the left, with leads
      const bat = k.group(k.at(k.box(1.0, 0.7, 0.7, k.mat(0x2457c5, { roughness: 0.4 })), -3.2, 0.5, 0), k.at(k.box(0.5, 0.12, 0.7, k.metal(0xd0d4da)), -3.2, 0.9, 0));
      add({ id: 'battery', name: 'Battery', obj: bat, pull: [0, 0.4, 2.4], tagAt: [-3.2, 1.35, 0],
        say: 'The battery pushes the electricity round the loop.',
        breaks: 'With no battery, no electricity. No magnet!',
        learn: ['The battery is the pusher. Without it the electricity does not move.', 'It is a little tank of stored energy, and it pushes the electricity out of one end and round to the other.', 'A stronger push makes more current flow, which makes a stronger magnet.'] });
      const lead = [[-3.0, 0.95, 0.1], [-2.5, 1.2, 0.5], [-1.9, 1.5, 0.45], ...hp.filter((_, i) => i % 6 === 0), [1.4, 1.45, 0.45], [2.0, 0.6, 0.4], [-2.8, 0.2, 0.4], [-3.4, 0.9, 0.1]];
      root.add(k.tube(lead.slice(0, 3).concat([hp[0]]), 0.04, copper));
      const eflow = k.flow(lead, { count: 16, color: 0x58b8ff, size: 0.13 });
      root.add(eflow);
      // clips
      const clips = [];
      for (let i = 0; i < 3; i++) {
        const g = k.group(k.mesh(new T.TorusGeometry(0.13, 0.018, 6, 18), k.metal(0xc3c7cf)), k.at(k.mesh(new T.TorusGeometry(0.08, 0.016, 6, 18), k.metal(0xc3c7cf)), 0, 0.06, 0));
        g.scale.set(0.8, 1.7, 1);
        g.userData.i = i; clips.push(g); root.add(g);
      }
      // pull readout and field loops
      const labels = ['Pull: none', 'Pull: small', 'Pull: medium', 'Pull: strong'].map((s, i) => {
        const l = k.label(s, { size: 0.36, bg: ['rgba(60,70,90,0.9)', 'rgba(60,140,90,0.92)', 'rgba(210,140,20,0.95)', 'rgba(200,50,50,0.95)'][i] });
        l.position.set(2.7, 2.4, 0.6); l.visible = i === 0; root.add(l); return l;
      });
      const field = [-0.5, 0, 0.5].map((z, i) => k.flow([[1.85, NY, z], [2.7, NY + 0.9, z], [0, NY + 2.2, z], [-2.7, NY + 0.9, z], [-1.85, NY, z]], { count: 8, color: 0xb57bff, size: 0.17, phase: i / 3 }));
      root.add(...field);
      return { root, parts, refs: { clips, labels, field, eflow, nailG, s: 0, hx: 1.9, NY } };
    },
    evaluate(has, on, inst) {
      let lvl = 1;
      try { if (inst && inst.def && inst.def.dial) lvl = inst.def.dial.steps[inst.dial || 0].level; } catch (e) { lvl = 1; }
      const cur = has('battery') ? lvl : 0, core = has('nail');
      const strength = cur === 0 ? 0 : Math.max(1, Math.round(cur * (core ? 1 : 0.34)));
      return { alive: cur > 0, cur, core, strength: core ? cur : (cur ? 1 : 0), weak: !core && cur > 0 };
    },
    tick(dt, t, inst, out) {
      const r = inst.refs; if (!out) return;
      const cur = out.cur || 0, str = out.core ? cur : (cur ? 1 : 0);
      r.s += (str - r.s) * Math.min(1, dt * 4);
      r.clips.forEach((g, i) => {
        r.hx += ((out.core ? 1.9 : 1.15) - r.hx) * Math.min(1, dt * 4);
        const up = str > i ? 1 : 0, rest = [1.5 + i * 0.5, 0.12, 0.4 - i * 0.4], hang = [r.hx, r.NY - (out.core ? 0.35 : 0.6) - i * 0.42, 0];
        g.userData.u = (g.userData.u || 0) + (up - (g.userData.u || 0)) * Math.min(1, dt * 5);
        const u = g.userData.u;
        g.position.set(rest[0] + (hang[0] - rest[0]) * u, rest[1] + (hang[1] - rest[1]) * u, rest[2] + (hang[2] - rest[2]) * u);
        g.rotation.x = -Math.PI / 2 * (1 - u);
      });
      r.labels.forEach((l, i) => { l.visible = i === Math.min(3, str); });
      r.eflow.visible = cur > 0; if (cur > 0) { r.eflow.material.size = 0.08 + cur * 0.05; TAL.wk.upd([r.eflow], dt, 0.1 + cur * 0.15); }
      r.field.forEach((f) => { f.visible = str > 0; if (str > 0) { f.material.size = 0.1 + str * 0.05; } });
      if (str > 0) TAL.wk.upd(r.field, dt, 0.1 + str * 0.1);
    },
  });

  Object.assign(TAL.insideByName, {
    'Electromagnet coil': 'electromagnet-inside', 'Iron plunger': 'magnet-inside', 'Transformer': 'transformer-inside', 'Iron core': 'transformer-inside',
    'Doorbell wires': 'wire-inside', 'Cover screw': 'screw-inside', 'Doorbell button': 'switch-inside', 'Button cap': 'switch-inside', 'Button contact': 'switch-inside',
  });
})();
