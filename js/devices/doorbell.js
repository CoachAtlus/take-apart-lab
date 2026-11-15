/* Doorbell: a classic wired ding-dong chime. Beginner 5 pieces, Medium 18, Advanced 47.
 * Push the button (Power): the coil turns into a magnet and yanks the iron plunger into one tone bar (DING),
 * then the spring throws it back into the other bar (DONG). Parts: push button (cap, faceplate, spring, two contacts,
 * terminal screws, lamp + resistor), bell wire (three runs), transformer (core, two coils, terminals, house leads),
 * chime unit (cover, two tone bars with rubber mounts, coil on a bobbin, plunger with felt pads and return spring,
 * terminal block with screws). Also registers one world: Inside the electromagnet. */
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
    // f = pitch; soft = felt pads and rubber mounts on (round bell tone) or off (harsh clack)
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

  const SCREW_LEARN = ['A screw is a ramp wrapped around a nail. Turning it pulls it in tight.', 'The ridges, called threads, bite into what they hold, so the screw stays put until you turn it back.', 'Turning a screw many times lets a small twist make a big squeezing force.'];
  const TERM_LEARN = ['The screw clamps the wire tight so the little road stays joined.', 'Squeezing a wire against metal makes a good electrical touch. A loose wire can make a doorbell work only sometimes.', 'Screw terminals let you connect or change a wire with just a screwdriver, with no soldering.'];

  TAL.registerDevice({
    id: 'doorbell',
    name: 'Doorbell',
    short: 'doorbell',
    subtitle: 'Ding, then dong!',
    powerSound: 'click',
    channels: false,
    view: { target: [0, 1.9, 0], radius: 6.6, explodedRadius: 6.9, explodedY: 2.5, yaw: -0.1, pitch: 0.28, shadow: [14, 5] },
    intro: 'This is a doorbell. Press the green power button, that is like pushing the doorbell. Listen for ding, then dong!',
    shellSay: 'That is the back of the chime box. It stays on the wall and holds everything.',
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button. That is like pushing the doorbell. Watch for ding, then dong!", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['cs1', 'cs2'], say: 'The cover has two screws. Twist them out with your finger!', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['cover'], say: 'Now lift off the cover and see what makes the sound.', nudge: 'Pull off the cover.' },
      { do: 'remove', ids: ['spring'], say: 'Pull out the spring. What do you hear now?', nudge: 'Pull out the spring.' },
      { do: 'remove', ids: ['coil'], say: 'Now pull out the coil. This is the part that turns into a magnet.', nudge: 'Pull out the coil.' },
      { do: 'remove', ids: ['felt1'], levels: [2, 3], say: 'Peel off a soft felt pad. How does the sound change?', nudge: 'Pull off a felt pad.' },
      { do: 'focus', id: 'tblock', levels: [3], say: 'Tap the terminal block. That is where the doorbell wires hook on.', nudge: 'Tap the terminal block.' },
      { do: 'focus', id: 'button', levels: [3], say: 'Now tap the doorbell button to look at its tiny parts.', nudge: 'Tap the doorbell button.' },
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
      const screwMat = 0x9ea3ab;
      // a screw that faces the viewer (+Z). parentObj null = on the wall box itself.
      const screwPart = (parentObj, parentId, id, name, x, y, z, len, pull, extra) => {
        const sc = k.at(k.rot(k.screw(screwMat, len), Math.PI / 2, 0, 0), x, y, z);
        (parentObj || root).add(sc);
        const s = Object.assign({ id, name, kind: 'screw', obj: sc, pull, level: 3, face: [0, 0, 1], learn: SCREW_LEARN }, extra);
        if (parentId) s.parent = parentId;
        return add(s);
      };

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
      add({ id: 'cover', name: 'Chime cover', obj: cover, pull: [0, 2.8, 2.6], blockedBy: ['cs1', 'cs2'], xray: true, face: [0, 0, 1], focusRadius: 4,
        say: 'The cover keeps fingers and dust away from the parts inside.',
        job: 'It protects the parts and makes the chime look neat.',
        learn: ['The slots let the sound out, so it is not muffled.', 'The cover is usually plastic or wood. It also keeps little fingers away from the moving plunger.', 'Many chime covers can be painted or swapped to match a house. The working parts underneath stay the same.'] });
      [-1, 1].forEach((s, i) => {
        screwPart(null, null, 'cs' + (i + 1), 'Cover screw', CX + s * 2.05, CY + 1.05, 1.05, 0.3, [s * 1.6, 1.3, 1.3], { level: 2, fuse: 'cover',
          say: 'A screw! It holds the cover on. Lefty loosey, righty tighty.',
          job: 'It holds the cover on the wall box.' });
      });
      // two screws through the back plate into the wall (behind the cover)
      [-1, 1].forEach((s, i) => {
        screwPart(null, null, 'ms' + (i + 1), 'Chime mounting screw', CX + s * 2.05, CY - 1.1, 0.125, 0.3, [s * 1.0, -0.9, 1.8], {
          say: 'A long screw that goes through the back of the chime and into the wall.',
          job: 'It holds the whole chime box up on the wall.',
          learn: ['The screw is the chime\'s anchor. It keeps the box from falling off the wall.', 'Chimes hang from screws like these, into the wall or a stud, so a bump will not knock the box down.', 'A screw holds by friction between its threads and the wood. A longer screw has more threads gripping, so it holds more weight.'] });
      });

      // ---- tone bars, each hanging by a rubber boot and a little screw
      const rubber = k.mat(0x26292e, { roughness: 1 });
      const barObj = (x, h, mat, id, name, text, learn, say, brk, sym, gmId, hsId, n) => {
        const inner = k.group(k.at(k.cyl(0.13, 0.13, h, mat, 20), x, CY + 0.05, Z), k.at(k.cyl(0.05, 0.05, 0.3, k.metal(0x8b9097), 8), x, CY + h / 2 + 0.1, Z));
        const g = k.group(inner);
        root.add(g);
        add({ id, name, obj: g, pull: [x < CX ? -1.9 : 1.9, 2.2, 1.6], blockedBy: ['cover'], level: 2, face: [0, 0, 1], focusRadius: 1.5, say, breaks: brk, fact: text, learn, symptom: sym });
        const boot = k.group(k.at(k.cyl(0.2, 0.2, 0.12, rubber, 16), x, CY + h / 2 + 0.01, Z));
        sub(inner, id, { id: gmId, name: 'Bar rubber mount', obj: boot, pull: [x < CX ? -0.9 : 0.9, 1.5, 1.0], level: 3, face: [0, 0, 1],
          say: 'A little rubber boot on the end of the bar. It holds the bar gently.',
          breaks: 'Without the rubber boot, the bar rattles against its hanger and the sound gets harsh.', breaksAlways: true,
          fact: 'Rubber holds the bar without squeezing the sound out of it.',
          learn: ['Think of a soft cushion. Rubber lets the bar jiggle and sing, but keeps it from clanking on metal.', 'Rubber is soft, so it holds the bar without squeezing the shaking out of it.', 'A bar rings best when it is held lightly. A hard clamp soaks up the shaking, and metal touching metal adds a rattle. Rubber holds the bar and stays quiet.'],
          symptom: n === 1 ? 'The ding sounds rattly and harsh, not like a bell.' : undefined });
        screwPart(inner, id, hsId, 'Bar hanger screw', x, CY + h / 2 + 0.12, Z + 0.07, 0.3, [x < CX ? -0.6 : 0.6, 0.7, 1.3], {
          say: 'A screw holds the top of the bar to the box.',
          job: 'It keeps the bar hanging in the right place.' });
        return inner;
      };
      const bar1 = barObj(CX - 1.7, 1.5, brass, 'bar1', 'Ding bar',
        'When the plunger hits a metal bar, the bar shakes. The shaking is the sound.',
        ['A hit makes the metal shiver very fast, and the shivering pushes the air, like ripples in a pond. Your ear catches those ripples as sound.', 'A shorter bar shivers faster and sounds higher. Ding is the high note of the pair.', 'The bar is hung or held at the spots where it can shiver freely. If you squeezed it tight, the sound would stop.'],
        'This is the ding bar. When the plunger hits it, it rings, like a little bell.', 'With no ding bar, the plunger hits nothing on this side. No ding!', 'I hear a dong but never a ding.', 'gm1', 'hs1', 1);
      const bar2 = barObj(CX + 1.7, 1.9, silver, 'bar2', 'Dong bar',
        'A longer bar shakes slower, so its note is lower. Low is dong.',
        ['A longer bar shivers more slowly, and slow shivers sound lower. Short and fast sounds high, long and slow sounds low.', 'Tubes and bars of different lengths are how a chime makes different notes, like the pipes of an organ.', 'Each bar has its own natural pitch that depends on its length and stiffness. The plunger just gives it a knock, and the bar sings its own note.'],
        'This is the dong bar. It rings the lower note.', 'With no dong bar, the plunger hits nothing on this side. No dong!', 'It dings, but the second bar makes no sound.', 'gm2', 'hs2', 2);

      // ---- coil: copper wire turns on a plastic spool (bobbin), around the plunger
      const cmat = k.glow(0xb87333, 0xff8a3a); cmat.map = copperTex(k); cmat.side = T.DoubleSide; cmat.metalness = 0.4;
      const coilBody = k.at(k.rot(k.cyl(0.5, 0.5, 1.1, cmat, 36, true), 0, 0, Math.PI / 2), CX, CY, Z);
      const spool = k.mat(0x3a2f27, { side: T.DoubleSide, roughness: 0.6 });
      const flange = (dx) => k.at(k.rot(k.mesh(new T.RingGeometry(0.2, 0.62, 28), spool), 0, Math.PI / 2, 0), CX + dx, CY, Z);
      const bobbin = k.group(k.at(k.rot(k.cyl(0.3, 0.3, 1.14, spool, 24, true), 0, 0, Math.PI / 2), CX, CY, Z), flange(-0.56), flange(0.56));
      const coil = k.group(coilBody);
      root.add(coil);
      add({ id: 'coil', name: 'Electromagnet coil', obj: coil, pull: [0, 2.0, 2.2], blockedBy: ['cover'], face: [0, 0, 1], focusRadius: 1.8,
        say: 'The coil is a long wire wound round and round. When electricity flows, it becomes a magnet!',
        breaks: 'No coil, no magnet. The plunger just sits there. No sound!',
        fact: 'A wire with electricity in it is a weak magnet. Winding it into a coil adds up all the little pulls.',
        learn: ['Think of one person pushing a car, then a whole team. Each loop of wire gives a little pull, and the coil adds them all up.', 'The magnet only exists while electricity flows. Switch the electricity off and the magnet is gone. That is an electromagnet.', 'Electric current makes a magnetic field around the wire. Coiling the wire stacks the fields inside the coil, and an iron core in the middle makes it much stronger.'],
        symptom: 'I push the button but nothing moves inside.' });
      sub(coil, 'coil', { id: 'bobbin', name: 'Coil bobbin', obj: bobbin, pull: [0, 1.5, 1.0], level: 2, face: [0, 0, 1], focusRadius: 1.6,
        say: 'The bobbin is a plastic spool. The wire is wound round and round on it.',
        breaks: 'Without the spool, the wire flops loose and the magnet cannot work. No sound!',
        fact: 'The spool gives the wire a neat shape to wind on, with a hole in the middle for the plunger.',
        learn: ['A bobbin is like a spool of thread. The wire wraps neatly around it.', 'It is plastic, so the electricity stays in the wire. The hole down the middle lets the plunger slide through.', 'The flat ends, called flanges, keep the turns of wire from sliding off. A neat winding fits the most loops into the least space.'],
        symptom: 'The wire inside looks loose and floppy, and nothing happens.' });
      const leadMat = k.mat(0xc2652a, { roughness: 0.5 });
      const leadWire = (sx, pts) => k.group(k.tube(pts, 0.03, leadMat));
      const leadLearn = ['Electricity needs a little road to the coil. This wire is that road.', 'It is the end of the long copper winding. It has a thin coat of enamel so the loops do not touch, and it is bare at the end where it connects.', 'Both ends of the winding must connect, or no electricity can run around the loops.'];
      sub(coil, 'coil', { id: 'leadA', name: 'Coil lead wire', obj: leadWire(-1, [[CX - 0.58, CY - 0.45, Z + 0.05], [CX - 0.72, CY - 0.72, 0.45], [CX - 0.42, CY - 0.9, 0.34]]), pull: [-1.5, -1.1, 1.0], level: 3, face: [0, 0, 1],
        say: 'A thin wire that brings electricity from the terminal block to the coil.',
        breaks: 'The coil is cut off from the electricity. No magnet, no sound!', fact: 'Both ends of a coil have to be connected.', learn: leadLearn,
        symptom: 'The coil is not getting any electricity.' });
      sub(coil, 'coil', { id: 'leadB', name: 'Coil lead wire', obj: leadWire(1, [[CX + 0.58, CY - 0.45, Z + 0.05], [CX + 0.5, CY - 0.72, 0.45], [CX + 0.02, CY - 0.9, 0.34]]), pull: [1.5, -1.1, 1.0], level: 3, face: [0, 0, 1],
        say: 'The other end of the coil wire. It goes back to the terminal block.',
        breaks: 'The coil is cut off from the electricity. No magnet, no sound!', fact: 'Both ends of a coil have to be connected.', learn: leadLearn });

      // ---- plunger: an iron rod through the coil. The inner group is what slides.
      const pin = k.group(
        k.at(k.rot(k.cyl(0.17, 0.17, 2.4, iron, 20), 0, 0, Math.PI / 2), CX, CY, Z),
        k.at(k.rot(k.cyl(0.24, 0.24, 0.14, iron, 20), 0, 0, Math.PI / 2), CX - 1.15, CY, Z),
        k.at(k.rot(k.cyl(0.24, 0.24, 0.14, iron, 20), 0, 0, Math.PI / 2), CX + 1.15, CY, Z)
      );
      const plunger = k.group(pin);
      root.add(plunger);
      add({ id: 'plunger', name: 'Iron plunger', obj: plunger, pull: [0, -1.3, 2.6], blockedBy: ['cover'], face: [0, 0, 1], focusRadius: 1.8,
        say: 'The iron plunger gets yanked by the magnet and hits the bars.',
        breaks: 'The magnet has nothing to pull. No ding, no dong!',
        fact: 'Iron is pulled by a magnet. Wood and plastic are not.',
        learn: ['A magnet pulls on iron the way you pull on a toy with a string. The plunger is the toy.', 'The plunger is made of iron on purpose. Plastic or wood would just sit there when the coil turned on.', 'Iron is easy to magnetize. Inside, it has tiny magnets that line up when the coil is on, so the plunger itself becomes a magnet and is pulled in.'],
        symptom: 'The doorbell buzzes a little, but nothing hits the bars.' });
      [-1, 1].forEach((s, i) => {
        const pad = k.group(k.at(k.rot(k.cyl(0.25, 0.25, 0.06, k.mat(0xc23b3b, { roughness: 1 }), 20), 0, 0, Math.PI / 2), CX + s * 1.24, CY, Z));
        sub(pin, 'plunger', { id: 'felt' + (i + 1), name: 'Felt pad', obj: pad, pull: [s * 1.0, -1.0 - i * 0.2, 1.0], level: 2, face: [0, 0, 1],
          say: 'A soft felt pad on the end. It makes the hit gentle, so the bar rings sweetly.',
          breaks: 'Without the soft pad, the hit sounds harsh and clacky. Ouch for the ears!', breaksAlways: true,
          fact: 'A soft tip softens the knock.',
          learn: ['Imagine tapping a bell with a pillow tip or a hard stick. The soft tip is quieter and kinder.', 'Felt also stops the plunger from bouncing and chattering against the bar, so the bell tone stays clean.', 'The bar rings its own note either way. A hard hit adds a lot of harsh, high noise on top. Felt takes that noise out.'],
          symptom: i === 0 ? 'Every ding and dong sounds harsh and clacky.' : undefined });
      });

      // ---- spring: pushes the plunger back (its inner group stretches and squashes)
      const SP_L = 0.63;
      const spts = [];
      for (let i = 0; i <= 60; i++) { const a = i * 0.9; spts.push([(i / 60) * SP_L, Math.sin(a) * 0.27, Math.cos(a) * 0.27]); }
      const springIn = k.group(k.tube(spts, 0.022, k.metal(0xd7dce2, { roughness: 0.2 })));
      k.at(springIn, CX + 0.6, CY, Z);
      const spring = k.group(springIn);
      root.add(spring);
      add({ id: 'spring', name: 'Spring', obj: spring, pull: [1.2, 2.2, 1.6], blockedBy: ['cover'], level: 2, fuse: 'plunger', face: [0, 0, 1], focusRadius: 1.2,
        say: 'The spring throws the plunger back to the other bar. That makes the second sound!',
        breaks: 'Without the spring, the plunger stays stuck after the ding. No dong!',
        fact: 'A squashed spring always wants to push back out.',
        learn: ['A spring is like a bouncy trampoline. Squash it and it bounces back.', 'When the magnet yanks the plunger, the spring gets squashed. When the magnet lets go, the squashed spring shoves the plunger back.', 'A spring stores energy when squeezed or stretched and gives it back as it returns. It pushes with a force that grows the more you squash it.'],
        symptom: 'It dings, but the plunger stays stuck and never swings back for the dong.' });

      // ---- terminal block: where the bell wires screw on (TRANS, FRONT, REAR)
      const TBY = CY - 1.0, TBZ = 0.2;
      const lab = k.decal(1.3, 0.14, (c, w, h) => {
        c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h);
        c.fillStyle = '#f3ecd9'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        [['TRANS', -0.4], ['FRONT', 0], ['REAR', 0.4]].forEach(([t, dx]) => c.fillText(t, w / 2 + (dx / 1.3) * w, h / 2));
      }, 512);
      lab.material.transparent = true;
      k.at(lab, CX, TBY - 0.11, TBZ + 0.078);
      const tblock = k.group(k.at(k.box(1.5, 0.34, 0.15, k.mat(0x5a4636, { roughness: 0.6 })), CX, TBY - 0.04, TBZ), lab);
      root.add(tblock);
      add({ id: 'tblock', name: 'Chime terminal block', obj: tblock, pull: [0, -0.6, 2.8], blockedBy: ['cover'], level: 2, face: [0, 0, 1], focusRadius: 1.5,
        say: 'The terminal block is where the doorbell wires hook on to the chime.',
        breaks: 'Nothing joins the wires to the coil. No sound!',
        fact: 'The labels tell you which wire goes where.',
        learn: ['It is a meeting place for the wire roads, where they all join up.', 'The block is plastic so the metal screws on it do not touch each other. Each screw grips one wire.', 'Chimes label the screws. TRANS is the wire from the transformer, FRONT is the wire from the front door button, and REAR is for a second button at a back door.'],
        symptom: 'The wires are not joined to the chime at all.' });
      [['tsT', 'TRANS', -0.4, [-1.4, -1.0, 1.2], 'The wire from the transformer comes loose, so the loop is open. No sound!', 'The doorbell works for a bit, then stops.'],
        ['tsF', 'FRONT', 0, [0, -1.4, 1.5], 'The wire from the button comes loose, so the loop is open. No sound!', null],
        ['tsR', 'REAR', 0.4, [1.4, -1.0, 1.2], null, null]].forEach(([id, nm, dx, pl, brk, sym]) => {
        const ex = { say: 'A screw that pinches a wire so it cannot slip out. This one is marked ' + nm + '.', learn: TERM_LEARN, blockedBy: [] };
        if (brk) { ex.breaks = brk; if (sym) ex.symptom = sym; } else ex.job = 'This spare one is for a second doorbell button at a back door. Nothing is hooked to it here.';
        screwPart(tblock, 'tblock', id, 'Terminal screw (' + nm + ')', CX + dx, TBY + 0.04, TBZ + 0.075, 0.2, pl, ex);
      });

      // ---- the push button on the wall: a tray with a faceplate and a cap; the working parts sit inside
      const BX = -3.9, BY = 1.7;
      const cream = k.mat(0xece6d4, { roughness: 0.5 });
      const button = k.group(
        k.at(k.rbox(0.8, 1.1, 0.06, cream, 0.025), BX, BY, 0.01),
        k.at(k.box(0.8, 0.05, 0.1, cream), BX, BY + 0.525, 0.09), k.at(k.box(0.8, 0.05, 0.1, cream), BX, BY - 0.525, 0.09),
        k.at(k.box(0.05, 1.0, 0.1, cream), BX - 0.375, BY, 0.09), k.at(k.box(0.05, 1.0, 0.1, cream), BX + 0.375, BY, 0.09)
      );
      root.add(button);
      add({ id: 'button', name: 'Doorbell button', obj: button, pull: [-1.0, 0.0, 2.2], face: [0, 0, 1], focusRadius: 1.6,
        say: 'The button is a switch. Pushing it starts the electricity.',
        breaks: 'No button, no push. The electricity never starts. No sound!',
        fact: 'A button closes the loop for electricity while you press it.',
        learn: ['Pushing the button is like opening a gate. The electricity can run through.', 'Inside, a metal strip touches another and joins the wires. Let go and a spring pops the strip away, and the loop opens again.', 'It is a momentary switch: connected only while pressed.'],
        symptom: 'I push the button and nothing happens at all.' });
      // faceplate: a plate with a hole for the cap and a small window for the light
      const fpShape = new T.Shape();
      fpShape.moveTo(-0.4, -0.55); fpShape.lineTo(0.4, -0.55); fpShape.lineTo(0.4, 0.55); fpShape.lineTo(-0.4, 0.55); fpShape.lineTo(-0.4, -0.55);
      const hole1 = new T.Path(); hole1.absarc(0, 0, 0.3, 0, Math.PI * 2, true); fpShape.holes.push(hole1);
      const hole2 = new T.Path(); hole2.absarc(0, 0.42, 0.08, 0, Math.PI * 2, true); fpShape.holes.push(hole2);
      const fplate = k.group(k.at(k.mesh(new T.ExtrudeGeometry(fpShape, { depth: 0.04, bevelEnabled: false, curveSegments: 12 }), cream), BX, BY, 0.14));
      const faceBlock = ['fps1', 'fps2'];
      sub(button, 'button', { id: 'fplate', name: 'Button faceplate', obj: fplate, pull: [-0.6, 1.4, 1.8], level: 3, face: [0, 0, 1], blockedBy: faceBlock,
        say: 'The faceplate is the cover with a hole for the button. It hides the little parts.',
        job: 'It hides the little parts and keeps dirt and water away from them.',
        learn: ['It is like a lid on a lunchbox, hiding what is inside.', 'It is held on by two small screws, so a grown-up can open the button to fix it.', 'It keeps dirt and water off the metal contacts inside, which would stop working if they got dirty.'] });
      [-1, 1].forEach((s, i) => {
        screwPart(button, 'button', 'fps' + (i + 1), 'Faceplate screw', BX + s * 0.25, BY - 0.44, 0.18, 0.15, [s * 0.9, 0.6, 1.4], {
          say: 'A small screw that holds the faceplate on.', job: 'It holds the faceplate on the button.' });
      });
      // cap: what your finger pushes (the inner group moves in the tick)
      const capIn = k.group(k.at(k.rot(k.cyl(0.24, 0.26, 0.14, k.mat(0xd8452e, { roughness: 0.5, metalness: 0.35 }), 24), Math.PI / 2, 0, 0), BX, BY, 0.27), k.at(k.rot(k.cyl(0.14, 0.14, 0.14, cream, 16), Math.PI / 2, 0, 0), BX, BY, 0.16));
      sub(button, 'button', { id: 'cap', name: 'Button cap', obj: capIn, pull: [0.3, 0.9, 1.3], level: 2, face: [0, 0, 1],
        say: 'The cap is the part your finger pushes. It is round and easy to find.',
        breaks: 'The doorbell still works, you just push the inside part now.', breaksAlways: true,
        fact: 'The cap is just a friendly cover for the part that really switches.',
        learn: ['The cap is like the lid on a jar. It is for your finger, not for the electricity.', 'It is often plastic, so your finger never touches the metal inside.', 'Sometimes it has a small light so you can find it in the dark.'] });
      // the switch inside: a bridging strip and two fixed pads
      const inFace = ['fplate'];
      sub(button, 'button', { id: 'contact', name: 'Button contact', obj: k.group(k.at(k.box(0.5, 0.05, 0.02, k.metal(0xd8c48a)), BX, BY - 0.12, 0.115)), pull: [0.9, 0.5, 1.0], level: 2, face: [0, 0, 1], blockedBy: inFace,
        say: 'This little metal strip touches the two fixed pieces when you press, and closes the loop.',
        breaks: 'The strip is gone, so the loop never closes. No sound!',
        fact: 'Metal carries electricity. When two metal pieces touch, the loop is closed.',
        learn: ['Two metal pieces meeting is like two friends holding hands. Electricity can cross.', 'Metal is used because electricity moves easily through it.', 'Contacts are sometimes plated with a metal that does not rust, so the touch stays clean.'],
        symptom: 'I push the button and nothing happens at all.' });
      const pad = (dx) => k.at(k.rot(k.cyl(0.065, 0.065, 0.06, brass, 14), Math.PI / 2, 0, 0), BX + dx, BY - 0.12, 0.07);
      sub(button, 'button', { id: 'contact2', name: 'Fixed button contact', obj: k.group(k.at(k.box(0.6, 0.06, 0.02, brass), BX, BY - 0.12, 0.05), pad(-0.18), pad(0.18)), pull: [-1.2, 0.4, 1.0], level: 3, face: [0, 0, 1], blockedBy: inFace,
        say: 'Two shiny metal spots that wait for the strip to touch them.',
        breaks: 'The strip has nothing to touch, so the loop never closes. No sound!',
        fact: 'When the strip touches both spots, the loop is joined.',
        learn: ['These are the other two friends holding hands with the strip when you press.', 'There are two spots so the strip can bridge across them and join the two wires.', 'The spots are brass or similar metal. Pressing makes a clean metal-to-metal touch every time.'],
        symptom: 'The button feels fine, but the doorbell never rings.' });
      const bsp = [];
      for (let i = 0; i <= 36; i++) { const a = i * 0.55; bsp.push([BX + Math.cos(a) * 0.1, BY + 0.14 + Math.sin(a) * 0.1, 0.05 + (i / 36) * 0.09]); }
      sub(button, 'button', { id: 'bspring', name: 'Button spring', obj: k.group(k.tube(bsp, 0.014, k.metal(0xd7dce2, { roughness: 0.25 }))), pull: [0.2, 1.4, 1.4], level: 3, face: [0, 0, 1], blockedBy: inFace,
        say: 'A little spring under the cap. It pushes the button back out after you press.',
        job: 'It pops the button back out after every push.',
        learn: ['A spring is like a bouncy trampoline. Squash it and it bounces back.', 'Press the button and the spring squashes. Let go and it pushes the button back up, which opens the loop again.', 'Without a return spring the button could stay stuck in. That is why a good button feels springy.'] });
      const resi = k.group(
        k.at(k.rot(k.cyl(0.012, 0.012, 0.5, k.metal(0xc3c7cf), 6), 0, 0, Math.PI / 2), BX, BY - 0.27, 0.06),
        k.at(k.rot(k.cyl(0.04, 0.04, 0.22, k.mat(0xd9b98a, { roughness: 0.7 }), 12), 0, 0, Math.PI / 2), BX, BY - 0.27, 0.06),
        k.at(k.rot(k.cyl(0.043, 0.043, 0.02, k.mat(0x8a3d1c), 12), 0, 0, Math.PI / 2), BX - 0.07, BY - 0.27, 0.06),
        k.at(k.rot(k.cyl(0.043, 0.043, 0.02, k.mat(0x1c1c1c), 12), 0, 0, Math.PI / 2), BX - 0.02, BY - 0.27, 0.06),
        k.at(k.rot(k.cyl(0.043, 0.043, 0.02, k.mat(0xd8452e), 12), 0, 0, Math.PI / 2), BX + 0.03, BY - 0.27, 0.06));
      sub(button, 'button', { id: 'lampR', name: 'Lamp resistor', obj: resi, pull: [-1.4, -0.3, 1.2], level: 3, face: [0, 0, 1], blockedBy: inFace,
        say: 'A tiny part that keeps the little light from getting too much electricity.',
        job: 'It protects the little light from too much electricity.',
        learn: ['It is like a narrow gate that lets only a small trickle of electricity through.', 'A resistor slows the electricity down. The colored stripes tell how much.', 'A light that is an LED would burn out if too much current flowed through it, so a resistor in line holds the current to a small safe amount.'] });
      const lampMat = k.glow(0xffc27a, 0xff8c1a);
      sub(button, 'button', { id: 'lamp', name: 'Button lamp (LED)', obj: k.group(k.at(k.sphere(0.065, lampMat, 12), BX, BY + 0.42, 0.15), k.at(k.rot(k.cyl(0.05, 0.05, 0.08, k.mat(0xc9b99a), 10), Math.PI / 2, 0, 0), BX, BY + 0.42, 0.1)), pull: [1.1, 1.3, 1.0], level: 3, face: [0, 0, 1],
        say: 'A tiny light so you can find the button in the dark.',
        job: 'It only lights up the button so you can find it.',
        learn: ['It is like a little night-light on the wall.', 'An LED is a tiny light that makes light without getting very hot. It glows softly while the doorbell wires have electricity.', 'An LED only lets electricity pass one way, and it needs a resistor to keep the electricity gentle enough.'] });
      [-1, 1].forEach((s, i) => {
        screwPart(button, 'button', 'bs' + (i + 1), 'Button terminal screw', BX + s * 0.24, BY - 0.43, 0.04, 0.15, [s * 1.4, -0.9, 1.2], { blockedBy: inFace,
          say: 'A screw that pinches a bell wire to the button.', learn: TERM_LEARN,
          breaks: 'The wire comes loose from the button. The loop is open. No sound!',
          symptom: i === 0 ? 'The doorbell only works if I wiggle the wire at the button.' : undefined });
      });

      // ---- transformer on the wall (turns the strong wall electricity into a gentle one)
      const TX = -1.9, TY = 0.7;
      const trans = k.group(k.at(k.box(1.55, 0.9, 0.12, k.mat(0x3b3f46, { roughness: 0.7 })), TX + 0.175, TY, 0.06));
      root.add(trans);
      add({ id: 'transformer', name: 'Transformer', obj: trans, pull: [-1.4, -0.9, 2.0], level: 2, face: [0, 0, 1], focusRadius: 2.0,
        say: 'The transformer makes the wall electricity gentle and safe for the doorbell.',
        breaks: 'No transformer, so the doorbell gets no electricity. No sound!',
        fact: 'The doorbell wires carry a gentle, low electricity. The house wires carry a strong one.',
        learn: ['It is like a gentle faucet turned down low. The strong water from the wall becomes a tiny stream.', 'Two coils sit near each other. The big coil makes a changing magnet, and the little coil catches it as gentle electricity.', 'Fewer turns on the output coil means lower voltage. That is why bell wires are safe to touch.'],
        symptom: 'The whole doorbell is dead, even when I push the button.' });
      const core = k.group(k.at(k.box(1.1, 0.14, 0.3, iron), TX, TY + 0.42, 0.28), k.at(k.box(1.1, 0.14, 0.3, iron), TX, TY - 0.42, 0.28), k.at(k.box(0.14, 0.9, 0.3, iron), TX - 0.25, TY, 0.28), k.at(k.box(0.14, 0.9, 0.3, iron), TX + 0.25, TY, 0.28));
      sub(trans, 'transformer', { id: 'core', name: 'Iron core', obj: core, pull: [0.4, 1.7, 1.0], level: 2, face: [0, 0, 1],
        say: 'The iron core carries the magnetism from one coil to the other.',
        breaks: 'Without the iron core, the little coil barely hears the big one. Almost no electricity gets through. No sound!',
        fact: 'Iron guides magnetism the way a pipe guides water.',
        learn: ['The iron is like a slide that sends the magnetism from one coil to the other.', 'It is made of thin stacked sheets, called laminations, which helps it waste less energy as heat.', 'Magnetic field lines prefer to travel through iron, so the core concentrates and routes the field between the two windings.'],
        symptom: 'The whole doorbell is dead, even when I push the button.' });
      sub(trans, 'transformer', { id: 'prim', name: 'Primary coil', obj: k.group(k.at(k.box(0.34, 0.74, 0.4, k.mat(0x8e4a2c, { metalness: 0.4, roughness: 0.5 })), TX - 0.25, TY, 0.28)), pull: [-1.6, 0.6, 1.4], level: 3, face: [0, 0, 1],
        say: 'This coil is joined to the strong house electricity. It makes a magnet that keeps changing.',
        breaks: 'No strong electricity goes in, so no gentle electricity comes out. No sound!',
        fact: 'The input coil has more turns of wire than the output coil.',
        learn: ['This is where the strong water from the wall comes in, before the faucet turns it down.', 'The house electricity flows through many turns of thin wire here and makes a magnet that keeps flipping direction.', 'It has more turns than the output coil. The ratio of the turns sets how much the voltage steps down.'],
        symptom: 'The transformer feels dead and the doorbell is silent.' });
      sub(trans, 'transformer', { id: 'sec', name: 'Secondary coil', obj: k.group(k.at(k.box(0.34, 0.74, 0.4, k.mat(0xc47c3c, { metalness: 0.5, roughness: 0.4 })), TX + 0.25, TY, 0.28)), pull: [1.0, 1.9, 1.4], level: 3, face: [0, 0, 1],
        say: 'This coil catches the changing magnet and makes gentle, safe electricity for the bell.',
        breaks: 'Nothing catches the magnet, so no gentle electricity comes out. No sound!',
        fact: 'The output coil has fewer turns, so the voltage is lower.',
        learn: ['This is the gentle little stream that comes out of the faucet.', 'The changing magnet from the first coil pushes electricity through these turns. Fewer turns means a gentler push.', 'This low voltage is why the thin bell wires are safe to touch.'] });
      [-1, 1].forEach((s, i) => {
        screwPart(trans, 'transformer', 'xs' + (i + 1), 'Transformer terminal screw', TX + 0.76, TY + s * 0.2, 0.12, 0.15, [1.3, s * 0.7, 1.3], {
          say: 'A screw where a bell wire connects to the transformer.', learn: TERM_LEARN,
          breaks: 'A bell wire comes loose from the transformer. The loop is open. No sound!',
          symptom: i === 0 ? 'The transformer hums but no electricity reaches the bell wires.' : undefined });
      });
      const pl = k.group(
        k.tube([[TX - 0.42, TY + 0.1, 0.3], [TX - 0.8, TY + 0.12, 0.32], [TX - 1.15, TY + 0.02, 0.25]], 0.04, k.mat(0x1d1d1d, { roughness: 0.5 })),
        k.tube([[TX - 0.42, TY - 0.08, 0.3], [TX - 0.8, TY - 0.08, 0.3], [TX - 1.15, TY - 0.14, 0.23]], 0.04, k.mat(0xe8e6df, { roughness: 0.5 })));
      sub(trans, 'transformer', { id: 'pleads', name: 'Transformer house leads', obj: pl, pull: [-1.9, -0.2, 1.6], level: 3, face: [0, 0, 1],
        say: 'Two thick wires that bring the strong house electricity into the transformer.',
        breaks: 'No electricity comes in from the house. No sound!',
        fact: 'These connect to the regular house wiring, so a grown-up electrician does that part.',
        learn: ['They are the road from the house wall to the transformer.', 'Their coat is thick because the house electricity is strong. That is why only a grown-up electrician should touch them.', 'Doorbell transformers connect to the regular house wiring on one side and give low bell-wire voltage on the other. The two sides follow different safety rules.'],
        symptom: 'The whole doorbell is dead, and the transformer is quiet.' });

      // ---- wires: transformer -> button -> chime -> coil -> transformer, one loop
      const wireR = (col) => k.mat(col, { roughness: 0.5 });
      const w1 = k.tube([[BX + 0.24, BY - 0.43, 0.08], [BX + 0.24, BY - 0.62, 0.1], [-3.45, 1.15, 0.15], [-3.0, 1.4, 0.2], [-1.4, 1.4, 0.22], [TX + 0.76, 1.3, 0.2], [TX + 0.76, TY + 0.2, 0.16]], 0.035, wireR(0xd8342c));
      const w2 = k.tube([[BX - 0.24, BY - 0.43, 0.08], [BX - 0.24, BY - 0.62, 0.1], [-4.3, 0.6, 0.14], [-4.0, 0.15, 0.15], [-2.6, 0.12, 0.15], [-0.9, 0.13, 0.15], [CX, 0.15, 0.15], [CX, TBY, 0.3]], 0.035, wireR(0xf2f2f2));
      const w3 = k.tube([[TX + 0.76, TY - 0.2, 0.16], [-0.95, 0.4, 0.2], [CX - 0.4, 0.42, 0.2], [CX - 0.4, TBY, 0.3]], 0.035, wireR(0x2a2a2a));
      const wires = k.group(w1);
      root.add(wires);
      const wireLearn = ['The wires are like little roads. Electricity drives along them in a loop.', 'Copper wire is covered with colored plastic so the wires do not touch each other by accident.', 'Doorbell wire carries low voltage, so it is thin. The plastic coat is an insulator, so the electricity stays in the copper.'];
      add({ id: 'wires', name: 'Doorbell wires', obj: wires, pull: [-0.5, -1.2, 3.2], face: [0, 0, 1], focusRadius: 3,
        say: 'The wires carry the electricity around in a loop. This red one runs from the transformer to the button.',
        breaks: 'Without the wires, the electricity has no road. No sound!',
        fact: 'Electricity needs a full loop of metal to run around.',
        learn: wireLearn,
        symptom: 'The whole doorbell is dead, even when I push the button.' });
      sub(wires, 'wires', { id: 'wireW', name: 'Bell wire (white)', obj: k.group(w2), pull: [-1.6, -0.7, 2.6], level: 3, face: [0, 0, 1],
        say: 'This white wire runs from the button to the FRONT screw on the chime.',
        breaks: 'Without this wire, the electricity cannot get from the button to the chime. No sound!',
        fact: 'Each wire is one piece of the loop.', learn: wireLearn,
        symptom: 'The button seems fine, but nothing reaches the chime.' });
      sub(wires, 'wires', { id: 'wireB', name: 'Bell wire (black)', obj: k.group(w3), pull: [1.6, -0.9, 2.8], level: 3, face: [0, 0, 1],
        say: 'This black wire runs from the transformer to the TRANS screw on the chime.',
        breaks: 'Without this wire, the electricity cannot get from the transformer to the chime. No sound!',
        fact: 'Each wire is one piece of the loop.', learn: wireLearn });
      [-2.55, -1.85].forEach((sx, i) => {
        const st = k.group(k.at(k.box(0.05, 0.16, 0.05, silver), sx, 1.4, 0.26));
        sub(wires, 'wires', { id: 'st' + (i + 1), name: 'Wire staple', obj: st, pull: [i ? 0.8 : -0.8, 1.6, 1.4], level: 3, face: [0, 0, 1],
          say: 'A little staple that holds the wire flat against the wall.',
          job: 'It keeps the wire tidy and in place.',
          learn: ['It is like a clip that keeps a string from wandering off the wall.', 'Bell wire runs along the wall, and staples hold it in place so it does not sag or get pulled.', 'Staples for low-voltage wire are made so they do not cut through the wire coat.'] });
      });

      // ---- effects: halo + magnet tag, DING / DONG tags, field dots
      const halo = TAL.wk.halo(k, CX, CY, Z + 0.2, 0xffa24a, 2.8);
      const magTag = k.label('MAGNET!', { size: 0.34, bg: 'rgba(160,40,200,0.92)' }); magTag.position.set(CX, CY + 1.0, Z + 0.9); magTag.visible = false;
      const dingTag = k.label('DING!', { size: 0.44, bg: 'rgba(214,150,20,0.95)' }); dingTag.position.set(CX - 1.7, CY + 1.3, Z + 1.0); dingTag.visible = false;
      const dongTag = k.label('DONG!', { size: 0.44, bg: 'rgba(60,110,200,0.95)' }); dongTag.position.set(CX + 1.7, CY + 1.5, Z + 1.0); dongTag.visible = false;
      root.add(halo, magTag, dingTag, dongTag);
      const flow = k.flow([[TX + 0.76, TY + 0.2, 0.16], [TX + 0.76, 1.3, 0.2], [-1.4, 1.4, 0.22], [-3.0, 1.4, 0.2], [-3.45, 1.15, 0.15], [BX + 0.24, BY - 0.62, 0.1], [BX + 0.24, BY - 0.43, 0.08],
        [BX - 0.24, BY - 0.43, 0.08], [BX - 0.24, BY - 0.62, 0.1], [-4.3, 0.6, 0.14], [-4.0, 0.15, 0.15], [-2.6, 0.12, 0.15], [CX, 0.15, 0.15], [CX, TBY, 0.3],
        [CX + 0.02, CY - 0.9, 0.34], [CX + 0.58, CY - 0.45, Z + 0.05], [CX - 0.58, CY - 0.45, Z + 0.05], [CX - 0.42, CY - 0.9, 0.34], [CX - 0.4, TBY, 0.3], [CX - 0.4, 0.42, 0.2], [-0.95, 0.4, 0.2], [TX + 0.76, TY - 0.2, 0.16]],
      { count: 26, color: 0x58b8ff, size: 0.12 });
      flow.visible = false;
      root.add(flow);

      // ---- exploded layout: every part gets a spot in a wide fan in front of the wall; small parts ring around their parent
      root.updateMatrixWorld(true);
      const ctr = (o) => new T.Box3().setFromObject(o).getCenter(new T.Vector3());
      const TG = { cover: [1.5, 5.7, 0.6], cs1: [-1.2, 6.3, 2.0], cs2: [4.2, 6.3, 2.0], bar1: [-0.7, 3.2, 1.6], bar2: [4.2, 3.2, 1.6], coil: [1.5, 3.4, 2.2],
        plunger: [1.5, 2.2, 2.2], spring: [4.3, 1.5, 2.4], tblock: [1.5, 1.2, 2.0], ms1: [5.8, 1.9, 2.0], ms2: [5.8, 1.3, 2.0],
        button: [-3.9, 4.2, 2.0], transformer: [-4.2, 1.7, 2.0], wires: [-1.8, 1.9, 2.6] };
      const RING = { bar1: [0.8, 90], bar2: [0.8, 90], coil: [1.1, 90], plunger: [1.6, 0], tblock: [0.8, 90], button: [1.5, 90], transformer: [1.1, 90], wires: [1.0, 90] };
      const byPid = {}, kidsOf = {};
      parts.forEach((q) => { byPid[q.id] = q; if (q.parent) (kidsOf[q.parent] = kidsOf[q.parent] || []).push(q); });
      const c0 = {};
      parts.forEach((q) => { c0[q.id] = ctr(q.obj); });
      parts.forEach((q) => { const t = !q.parent && TG[q.id]; if (t) q.pull = [t[0] - c0[q.id].x, t[1] - c0[q.id].y, t[2] - c0[q.id].z]; });
      Object.keys(kidsOf).forEach((pid) => {
        const list = kidsOf[pid], rr = RING[pid] || [1.0, 90], par = c0[pid], n = list.length;
        list.forEach((q, i) => {
          const outer = n > 7 && i >= Math.ceil(n / 2);
          const m = outer ? n - Math.ceil(n / 2) : Math.min(n, n > 7 ? Math.ceil(n / 2) : n), j = outer ? i - Math.ceil(n / 2) : i;
          const a = (rr[1] * Math.PI) / 180 + (j * 2 * Math.PI) / m + (outer ? Math.PI / m : 0), r = rr[0] * (outer ? 1.55 : (n > 7 ? 1.0 : 1));
          q.pull = [par.x + Math.cos(a) * r - c0[q.id].x, par.y + Math.sin(a) * r * 0.9 - c0[q.id].y, par.z + 1.0 - c0[q.id].z];
        });
      });

      return { root, shell: [back], parts, refs: { pin, springIn, capIn, halo, magTag, dingTag, dongTag, bar1, bar2, flow, off: 0, clock: 0, prev: 0, dingT: 0, dongT: 0, wob1: 0, wob2: 0, coilMat: cmat, cg: null, lg: null } };
    },

    evaluate(has, on) {
      const btn = has('button') && has('contact') && has('contact2') && has('bs1') && has('bs2');
      const wiresOk = has('wires') && has('wireW') && has('wireB');
      const xf = has('transformer') && has('core') && has('prim') && has('sec') && has('xs1') && has('xs2') && has('pleads');
      const blk = has('tblock') && has('tsT') && has('tsF');
      const coilOk = has('coil') && has('bobbin') && has('leadA') && has('leadB');
      const circuit = btn && wiresOk && xf && blk;
      const magnet = circuit && coilOk;
      const move = magnet && has('plunger');
      const alive = on && move;
      let reason = '';
      if (on && !move) {
        reason = !wiresOk ? 'A wire is missing, so the electricity has no road.'
          : !xf ? (!has('pleads') ? 'No house electricity is reaching the transformer.' : 'The transformer is not giving any electricity.')
          : !blk ? 'The wires are not joined to the chime.'
          : !btn ? 'The button is not closing the loop, so no electricity.'
          : !coilOk ? (has('coil') ? 'The coil is missing a piece, so there is no magnet.' : 'The coil is missing, so there is no magnet.')
          : 'The plunger is missing, so the magnet has nothing to pull.';
      }
      return { alive, reason, magnet: on && magnet, ding: alive && has('bar1'), dong: alive && has('spring') && has('bar2'), spring: has('spring'),
        soft: has('felt1') && has('felt2') && has('gm1') && has('gm2'), flow: on && circuit, powered: on && circuit && coilOk };
    },

    apply(out, inst) {
      const r = inst.refs;
      inst.parts.forEach((p) => { p.blockedBy = p.blockedBy.filter((b) => inst.byId[b]); }); // drop blockers that are not separate pieces at this level
      r.flow.visible = !!out.flow && !!out.alive;
      if (!out.alive) { r.halo.visible = false; r.magTag.visible = false; r.clock = 0; r.prev = 0; }
    },

    tick(dt, t, inst, out) {
      const r = inst.refs;
      if (!out) return;
      // the engine clones each mesh's material, so glow has to be set on the clones the parts hold
      if (!r.cg) {
        const grab = (id) => (inst.byId[id] ? inst.byId[id].meshes.map((m) => m.material) : []);
        r.cg = grab('coil'); r.lg = grab('lamp');
      }
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
      r.cg.forEach((m) => { m.emissiveIntensity = magnetOn ? 1.4 : 0; });
      const lamp = inst.byId.lamp, lampOn = !!out.powered && !!lamp && lamp.target === 0;
      r.lg.forEach((m) => { m.emissiveIntensity = lampOn ? 0.9 + 0.25 * Math.sin(t * 3) : 0; });
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
    'Primary coil': 'transformer-inside', 'Secondary coil': 'transformer-inside',
    'Doorbell wires': 'wire-inside', 'Bell wire (white)': 'wire-inside', 'Bell wire (black)': 'wire-inside', 'Coil lead wire': 'wire-inside', 'Transformer house leads': 'wire-inside',
    'Cover screw': 'screw-inside', 'Chime mounting screw': 'screw-inside', 'Bar hanger screw': 'screw-inside', 'Faceplate screw': 'screw-inside',
    'Terminal screw (TRANS)': 'screw-inside', 'Terminal screw (FRONT)': 'screw-inside', 'Terminal screw (REAR)': 'screw-inside',
    'Button terminal screw': 'screw-inside', 'Transformer terminal screw': 'screw-inside',
    'Doorbell button': 'switch-inside', 'Button cap': 'switch-inside', 'Button contact': 'switch-inside', 'Fixed button contact': 'switch-inside', 'Button spring': 'switch-inside',
    'Lamp resistor': 'resistor-inside', 'Button lamp (LED)': 'led-package',
  });
})();
