/* Flat LED TV, about 150 pieces.
 * Front, outside in: frame, LCD panel (5 layers + 4 driver chips), 3 films, diffuser plate, 5 LED strips (50 LEDs), reflector.
 * Back: 8 screws, back cover, power board, main board, T-con board, speakers, cables. Boards come apart into their components.
 * Coordinates: x right, y up, +z is the front of the TV. Board pieces stick out the back (-z). */
(function () {
  const ROWS = 5, COLS = 10;
  const ledId = (r, c) => `led${r}_${c}`;
  const LEDS = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) LEDS.push(ledId(r, c));
  const ids = (prefix, n) => Array.from({ length: n }, (_, i) => prefix + i);
  const COVER_SCREWS = ids('cs', 8), PSU_SCREWS = ids('ps', 4), MAIN_SCREWS = ids('ms', 4), TCON_SCREWS = ids('ts', 2);
  const PSU_POWER = ['fuse', 'bridge', 'bigcap1', 'bigcap2', 'transformer', 'mosfet', 'heatsinkP', 'coilP', 'controller', 'powerConn'];
  const BRAIN = ['soc', 'heatsinkM', 'ram1', 'ram2', 'flash', 'crystal'];

  const SERIES = 'These lights are wired in a line, like kids holding hands. If one lets go, the whole row goes out.';
  const LED_FACTS = [
    'Inside each light is a tiny chip, about as small as a grain of sand. When electricity flows through it, it glows!',
    'The chip really makes blue light. A yellow coating on top mixes with it to make white light.',
    'LED stands for light emitting diode. It only lets electricity go one way.',
    'LEDs waste much less energy as heat than old bulbs, so they can last for many, many years.',
    SERIES,
  ];

  TAL.registerDevice({
    id: 'led-tv',
    name: 'Flat LED TV',
    short: 'TV',
    subtitle: 'The thin kind we have today',
    screenStyle: 'flat',
    screenPart: 'panel',
    powerSound: 'flat',
    channels: true,
    view: { target: [0, 2.4, 0], radius: 3.5, explodedRadius: 9.8, explodedY: 3.2, yaw: -0.4, pitch: 0.14, shadow: [6.4, 2.6] },
    intro: 'This is a flat LED TV. It is built in layers, like a sandwich!',
    shellSay: "That's the metal back plate. All the layers and boards hang on it.",

    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Let's take this TV apart together. First, press the green power button to turn it on.", nudge: 'Press the power button. It has a circle with a line on top.' },
      { do: 'remove', ids: ['bezel'], say: 'The TV is made of layers. Put your finger on the black frame and drag it off!', nudge: 'Drag the black frame away from the TV.' },
      { do: 'remove', ids: ['polarF'], say: 'Now peel the clear sheet off the front of the screen. Watch what happens to the picture!', nudge: 'Put your finger on the screen and pull the sheet off.' },
      { do: 'remove', ids: ['panel'], say: 'Now pull off the whole screen panel. Pull it toward you!', nudge: 'Drag the screen panel off.' },
      { do: 'remove', ids: ['film1', 'film2', 'film3'], say: 'So much light! Peel off the three thin sheets.', nudge: 'Pull off the thin see-through sheet.' },
      { do: 'remove', ids: ['diffuser'], say: 'Now pull off the milky white plate.', nudge: 'Drag the white plate off.' },
      { do: 'removeAny', ids: ['strip0', 'strip1', 'strip2', 'strip3', 'strip4'], levels: [1], say: 'Look at the lights behind! Pull out one strip of lights.', nudge: 'Pull out a strip of lights.' },
      { do: 'removeAny', ids: LEDS, say: 'Look at all the little lights! Pull out just one light and watch its row.', nudge: 'Pull out one little light.' },
      { do: 'removeAny', ids: LEDS.map((id) => id + '_lens'), levels: [3], say: 'Each light has a clear cap. Pull the cap off a light that is still glowing.', nudge: 'Pull the clear cap off a glowing light.' },
      { do: 'removeAny', ids: LEDS.map((id) => id + '_ph'), levels: [3], say: 'Now peel off the yellow coating. What color is the light now?', nudge: 'Peel off the yellow coating.' },
      { do: 'turn', side: 'back', say: "Now let's see the back. Tap the turn around button.", nudge: 'Tap the turn around button.' },
      { do: 'remove', ids: COVER_SCREWS, say: 'The back cover has eight screws. Twist them out with your finger!', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['cover'], say: 'Now pull off the back cover.', nudge: 'Drag the back cover away.' },
      { do: 'remove', ids: ['cord'], say: 'Before we touch the boards, unplug the power cord. Real fixers always unplug first!', nudge: 'Pull out the power cord.' },
      { do: 'remove', ids: ['harness'], say: 'Unplug the colored power wires from the power board.', nudge: 'Pull out the red, black and yellow wires.' },
      { do: 'remove', ids: PSU_SCREWS, say: 'The power board has four screws. Take them out!', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['psu'], say: 'Now pull out the whole power board.', nudge: 'Drag the power board out.' },
      { do: 'focus', id: 'psu', say: 'Tap the power board to look at it up close.', nudge: 'Tap the power board.' },
      { do: 'remove', ids: ['fuse'], say: 'See the little glass tube? That is the fuse. Pull it out!', nudge: 'Pull out the little glass tube.' },
      { do: 'end', say: "You did it! Now you're the boss. Take apart anything you want. Try the main board, the speakers and all the little chips!" },
    ],

    build(k) {
      const T = k.THREE;
      const root = k.group();
      const W = 5.6, H = 3.15, CY = 2.45;
      const parts = [];
      const refs = { ledRows: [], layers: [] };
      const add = (spec) => { parts.push(spec); return spec.obj; };
      const M = {
        black: k.mat(0x17181b, { roughness: 0.45 }),
        frame: k.mat(0x111317, { roughness: 0.3 }),
        silver: k.metal(0xc3c8cf, { roughness: 0.35 }),
        pin: k.metal(0xd8c48a, { roughness: 0.3 }),
        white: k.mat(0xeeeeea, { roughness: 0.6 }),
      };

      // ---------- component builders (all stick out toward -z from z=0)
      const elcap = (r, h, color) => {
        const g = k.group();
        g.add(k.at(k.rot(k.cyl(r, r, h, k.mat(color, { roughness: 0.35 }), 24), Math.PI / 2, 0, 0), 0, 0, -h / 2));
        g.add(k.at(k.rot(k.cyl(r * 0.95, r * 0.95, 0.01, k.metal(0xc9ced6), 24), Math.PI / 2, 0, 0), 0, 0, -h - 0.004));
        g.add(k.at(k.box(r * 1.3, 0.014, 0.006, 0x555555), 0, 0, -h - 0.01));
        g.add(k.rot(k.at(k.box(r * 1.3, 0.014, 0.006, 0x555555), 0, 0, -h - 0.01), 0, 0, Math.PI / 2));
        g.add(k.at(k.box(0.02, r * 1.2, h * 0.8, k.mat(0xd8dde4)), r * 0.98, 0, -h / 2));
        return g;
      };
      const chip = (w, h, d, color, pins) => {
        const g = k.group(k.at(k.box(w, h, d, color || 0x1a1a1d), 0, 0, -d / 2));
        const n = pins || 0;
        for (let i = 0; i < n; i++) {
          const y = -h / 2 + ((i + 0.5) * h) / n;
          g.add(k.at(k.box(0.03, 0.012, 0.012, M.silver), -w / 2 - 0.012, y, -0.008));
          g.add(k.at(k.box(0.03, 0.012, 0.012, M.silver), w / 2 + 0.012, y, -0.008));
        }
        g.add(k.at(k.cyl(0.012, 0.012, 0.004, 0x55555a, 8), -w / 2 + 0.03, h / 2 - 0.03, -d - 0.002));
        return g;
      };
      const heatsink = (w, h, d, fins) => {
        const g = k.group(), m = k.metal(0xb7bdc5, { roughness: 0.4 });
        g.add(k.at(k.box(w, h, 0.03, m), 0, 0, -0.015));
        for (let i = 0; i < fins; i++) g.add(k.at(k.box(0.022, h, d, m), -w / 2 + ((i + 0.5) * w) / fins, 0, -0.03 - d / 2));
        return g;
      };
      const transformer = (w, h, d) => k.group(
        k.at(k.box(w * 0.7, h * 0.92, d, 0xe9c440), 0, 0, -d / 2),
        k.at(k.box(w, h * 0.22, d * 1.04, 0x2a2a2e), 0, h * 0.39, -d / 2),
        k.at(k.box(w, h * 0.22, d * 1.04, 0x2a2a2e), 0, -h * 0.39, -d / 2),
        k.at(k.box(w * 0.16, h, d * 1.04, 0x2a2a2e), w * 0.42, 0, -d / 2),
        k.at(k.box(w * 0.16, h, d * 1.04, 0x2a2a2e), -w * 0.42, 0, -d / 2)
      );
      const toroid = (R, r) => k.group(k.at(k.torus(R, r, k.metal(0xc8743a, { roughness: 0.35 }), 28), 0, 0, -r), k.at(k.cyl(R * 0.5, R * 0.5, 0.02, 0x333333, 16), 0, 0, -0.01));
      const fuse = (len) => {
        const g = k.group();
        g.add(k.at(k.rot(k.cyl(0.045, 0.045, len * 0.7, k.glass(0xdff3ff, 0.45), 16), 0, 0, Math.PI / 2), 0, 0, -0.07));
        g.add(k.at(k.rot(k.cyl(0.006, 0.006, len * 0.7, k.metal(0xd0d0d0), 6), 0, 0, Math.PI / 2), 0, 0, -0.07));
        [-1, 1].forEach((s) => {
          g.add(k.at(k.rot(k.cyl(0.05, 0.05, len * 0.16, M.silver, 16), 0, 0, Math.PI / 2), s * len * 0.42, 0, -0.07));
          g.add(k.at(k.box(0.05, 0.1, 0.06, M.silver), s * len * 0.42, 0, -0.03));
        });
        return g;
      };
      const conn = (w, h, d, color, pins) => {
        const g = k.group(k.at(k.box(w, h, d, color || 0xf2efe6), 0, 0, -d / 2));
        const n = pins || 4;
        for (let i = 0; i < n; i++) g.add(k.at(k.box(0.025, 0.025, 0.03, M.pin), (w > h ? -w / 2 + ((i + 0.5) * w) / n : 0), (w > h ? 0 : -h / 2 + ((i + 0.5) * h) / n), -d - 0.01));
        return g;
      };
      const port = (w, h, d, slot) => k.group(k.at(k.box(w, h, d, M.silver), 0, 0, -d / 2), k.at(k.box(0.02, h * 0.7, d * 0.55, slot || 0x101012), w / 2 + 0.005, 0, -d / 2));
      const module = (w, h) => k.group(k.at(k.box(w, h, 0.03, 0x2f7d4a), 0, 0, -0.015), k.at(k.box(w * 0.7, h * 0.65, 0.05, M.silver), -w * 0.08, 0, -0.055), k.at(k.box(w * 0.15, h * 0.5, 0.01, 0xd8c48a), w * 0.38, 0, -0.035));
      const crystal = () => k.group(k.at(k.box(0.16, 0.07, 0.06, M.silver), 0, 0, -0.03), k.at(k.cyl(0.035, 0.035, 0.06, M.silver, 12), 0.08, 0, -0.03), k.at(k.cyl(0.035, 0.035, 0.06, M.silver, 12), -0.08, 0, -0.03));
      const diode = () => k.group(k.at(k.rot(k.cyl(0.03, 0.03, 0.14, 0x1b1b1b, 12), 0, 0, Math.PI / 2), 0, 0, -0.035), k.at(k.rot(k.cyl(0.031, 0.031, 0.025, 0xd8dde4, 12), 0, 0, Math.PI / 2), 0.05, 0, -0.035));
      const disc = (r, color) => k.group(k.at(k.rot(k.cyl(r, r, 0.03, k.mat(color, { roughness: 0.4 }), 20), Math.PI / 2, 0, 0), 0, 0, -0.06));
      const mosfet = () => k.group(k.at(k.box(0.12, 0.13, 0.05, 0x1b1b1b), 0, 0, -0.06), k.at(k.box(0.12, 0.08, 0.012, M.silver), 0, 0.1, -0.04), k.at(k.box(0.015, 0.08, 0.015, M.silver), -0.04, -0.1, -0.04), k.at(k.box(0.015, 0.08, 0.015, M.silver), 0, -0.1, -0.04), k.at(k.box(0.015, 0.08, 0.015, M.silver), 0.04, -0.1, -0.04));

      // A board: a wrapper group (no rotation) with the PCB at z=0 and a printed back face.
      const makeBoard = (w, h, color, seed) => {
        const g = k.group(k.box(w, h, 0.05, k.mat(color, { roughness: 0.7 })));
        const face = new T.Mesh(new T.PlaneGeometry(w, h), k.mat(0xffffff, { map: k.pcbTexture(w, h, seed, '#' + color.toString(16).padStart(6, '0')), roughness: 0.65 }));
        face.rotation.y = Math.PI; face.position.z = -0.026;
        g.add(face);
        return g;
      };
      // Child component on a board/group at local (x, y). Default pull: out the back and a bit outward.
      const comp = (parent, parentId, spec) => {
        const [x, y] = spec.at;
        k.at(spec.obj, x, y, spec.z == null ? -0.025 : spec.z);
        parent.add(spec.obj);
        spec.parent = parentId;
        if (!spec.pull) { const len = Math.hypot(x, y), dx = len ? x / len : 0, dy = len ? y / len : 1, d = len * 0.6 + 0.35; spec.pull = [dx * d, dy * d, -0.5]; }
        delete spec.at;
        return add(spec);
      };
      const screwAt = (id, x, y, z, blockedBy, shaft) => {
        const s = k.screw(0x9ea3ab, shaft);
        k.rot(k.at(s, x, y, z), -Math.PI / 2, 0, 0);
        root.add(s);
        add({ id, name: 'Screw', kind: 'screw', obj: s, pull: [0, 0, -0.9], blockedBy: blockedBy || [], say: 'A screw! Lefty loosey, righty tighty.' });
      };

      // ---------- shell: metal back plate
      const shell = k.group(k.at(k.box(W - 0.15, H - 0.15, 0.04, k.metal(0x9aa0a8, { roughness: 0.5 })), 0, CY, -0.02));
      root.add(shell);

      // ---------- stand + 2 screws
      const stand = k.group(
        k.at(k.box(2.2, 0.08, 1.1, k.metal(0x2b2e34, { roughness: 0.4 })), 0, 0.04, -0.1),
        k.at(k.box(0.3, 1.0, 0.12, k.metal(0x2b2e34, { roughness: 0.4 })), 0, 0.55, -0.3)
      );
      root.add(stand);
      screwAt('ss0', -0.08, 0.95, -0.37, [], 0.2);
      screwAt('ss1', 0.08, 0.95, -0.37, [], 0.2);
      add({ id: 'stand', name: 'Stand', obj: stand, pull: [-4.3, 0, 1.2], blockedBy: ['ss0', 'ss1'], face: [0, 1, 0],
        say: 'The stand holds the TV up. Two screws keep it on.' });

      // ---------- reflector sheet (behind the LEDs)
      const reflector = k.group(k.at(k.box(W - 0.3, H - 0.3, 0.01, k.mat(0xf7f7f2, { roughness: 0.3, metalness: 0.1 })), 0, 0, 0));
      k.at(reflector, 0, CY, 0.006);
      root.add(reflector);

      // ---------- LED strips, 10 LEDs each
      const haloTex = k.canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,250,225,1)'); g.addColorStop(0.35, 'rgba(255,240,190,0.55)'); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
      const stripObjs = [];
      for (let r = 0; r < ROWS; r++) {
        const strip = k.group(k.box(W - 0.6, 0.13, 0.015, k.mat(0xf4f4f0, { roughness: 0.5 })));
        strip.add(k.at(k.box(W - 0.7, 0.012, 0.004, M.pin), 0, 0.045, 0.009));
        strip.add(k.at(k.box(0.2, 0.1, 0.02, 0xf2efe6), (W - 0.6) / 2 - 0.1, 0, 0.012));
        k.at(strip, 0, CY - 1.2 + r * 0.6, 0.03);
        root.add(strip);
        stripObjs.push(strip);
        add({ id: 'strip' + r, name: 'LED strip', obj: strip, blockedBy: ['diffuser'], reach: ['diffuser'], face: [0, 0, 1], focusRadius: 2.2,
          pull: [0, 0.3 - (1.25 + r * 0.6) + 0.0, 2.5 + r * 0.38],
          say: 'An LED strip! It holds ten little lights in a row and carries the electricity to them.',
          breaks: 'That whole row of lights went dark.', fact: SERIES });
        const row = [];
        for (let c = 0; c < COLS; c++) {
          const chipM = k.mesh(new T.BoxGeometry(0.035, 0.035, 0.01), k.glow(0xffe9a8, 0xfff2c0));
          chipM.userData.glowI = 3;
          const dome = k.mesh(new T.SphereGeometry(0.055, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), k.glow(0xfff8dc, 0xfff6e0));
          dome.rotation.x = Math.PI / 2; dome.position.z = 0.03;
          dome.material.transparent = true; dome.material.opacity = 0.9;
          dome.userData.glowI = 1.1;
          const halo = new T.Mesh(new T.PlaneGeometry(0.3, 0.3), new T.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
          halo.position.z = 0.07; halo.userData.noPick = true; halo.visible = false;
          const led = k.group(k.at(k.box(0.14, 0.14, 0.03, M.white), 0, 0, 0.015), k.at(chipM, 0, 0, 0.035), halo);
          const lensG = k.group(dome);
          const phM = k.rot(k.cyl(0.032, 0.032, 0.006, k.mat(0xf2d33a, { roughness: 0.6 }), 16), Math.PI / 2, 0, 0);
          const phG = k.group(k.at(phM, 0, 0, 0.044));
          led.add(phG, lensG);
          const id = ledId(r, c);
          comp(strip, 'strip' + r, {
            id, name: 'LED light', obj: led, at: [-2.25 + c * 0.5, 0], z: 0.008, pull: [(c - 4.5) * 0.03, 0.22, 0.5],
            say: 'One tiny LED light! It shines through all the layers to light up the picture.',
            breaks: 'Uh oh, the whole row went dark! ' + SERIES,
            fact: LED_FACTS[(r * COLS + c) % LED_FACTS.length],
            symptom: c === 4 ? `One stripe of the screen is dark.` : undefined,
          });
          comp(led, id, { id: id + '_lens', name: 'LED cap', obj: lensG, at: [0, 0], z: 0, pull: [0, 0.12, 0.35], face: [0, 0, 1], level: 3,
            say: 'The clear cap is a tiny lens. It spreads the light out wide.',
            fact: 'Without the cap, the light shoots straight out in a narrow beam.' });
          comp(led, id, { id: id + '_ph', name: 'Yellow coating', obj: phG, at: [0, 0], z: 0, pull: [0, -0.12, 0.3], blockedBy: [id + '_lens'], face: [0, 0, 1], level: 3,
            say: 'Under the cap is a yellow coating. Watch what color the light is without it!',
            breaks: 'Now it glows blue! The tiny chip really makes blue light. The yellow coating mixes in to make it look white.', breaksAlways: true,
            fact: 'Blue plus yellow light looks white to our eyes. TV makers use that trick in almost every white LED.' });
          row.push({ id, chipM, dome, halo, lens: id + '_lens', ph: id + '_ph' });
        }
        refs.ledRows.push(row);
      }
      add({ id: 'reflector', name: 'Reflector sheet', obj: reflector, pull: [-6.4, -0.95, 0.4], blockedBy: ids('strip', ROWS), face: [0, 0, 1],
        say: 'The shiny white reflector sheet bounces light forward so none is wasted.',
        breaks: 'The screen got a little dimmer.', fact: 'It works like the white inside of a lampshade.' });

      // ---------- diffuser plate + 3 films
      const diffMesh = k.box(W - 0.2, H - 0.2, 0.05, k.glow(0xeef2f7, 0xffffff));
      diffMesh.material.roughness = 0.9;
      refs.diffuser = diffMesh;
      const diffuser = k.at(k.group(diffMesh), 0, CY, 0.13);
      root.add(diffuser);
      add({ id: 'diffuser', name: 'Diffuser plate', obj: diffuser, pull: [-6.4, 1.9, 1.2], blockedBy: ['film3'], face: [0, 0, 1],
        say: 'This milky plate spreads the light out evenly, like a cloud in front of the sun.',
        breaks: 'Now you can see bright spots from each little light!', fact: 'Without it you would see every LED, like a row of flashlights.',
        symptom: 'There are bright splotchy spots all over the picture.' });
      const filmSpecs = [
        ['film1', 'Diffuser film', 0.178, 'This thin sheet softens the light even more.', []],
        ['film2', 'Brightness film', 0.168, 'This sheet bounces light that is going the wrong way back, so the screen looks brighter.', ['film1']],
        ['film3', 'Prism film', 0.158, 'This sheet has tiny ridges, like a mountain range, that point the light straight at you.', ['film2']],
      ];
      filmSpecs.forEach(([id, name, z, say, bl], i) => {
        const m = k.box(W - 0.24, H - 0.24, 0.006, k.mat([0xf5f8fc, 0xe9f2ff, 0xf0f4ea][i], { transparent: true, opacity: 0.75, roughness: 0.5 }));
        const g = k.at(k.group(m), 0, CY, z);
        root.add(g);
        add({ id, name, obj: g, pull: [6.4, -0.95, 1.1 + i * 0.45], blockedBy: ['panel'].concat(bl), face: [0, 0, 1], say,
          breaks: 'The picture got a little dimmer.', fact: 'The three thin sheets work together to aim the light at your eyes.' });
      });

      // ---------- LCD panel: screen + 5 layers + 4 driver chips
      const panel = k.at(k.group(k.box(W - 0.14, H - 0.14, 0.03, k.mat(0x0d0f14, { roughness: 0.25 }))), 0, CY, 0.2);
      const scr = k.screen(W - 0.24, H - 0.24, 512, 288, 0);
      scr.mesh.position.z = 0.0165;
      panel.add(scr.mesh);
      root.add(panel);
      add({ id: 'panel', name: 'LCD panel', obj: panel, pull: [6.4, 1.9, 1.2], blockedBy: ['bezel'], reach: ['bezel'], face: [0, 0, 1], focusRadius: 3,
        say: 'The LCD panel has millions of tiny shutters that open and close to make the colors.',
        breaks: 'Look! Without the panel there is just plain white light. The panel is what turns light into a picture.',
        fact: 'Look really close at a TV and you can see tiny red, green and blue dots that team up to make each pixel.' });
      const stripes = k.canvasTex(96, 8, (c, w) => { ['#ff3030', '#30ff60', '#3060ff'].forEach((col, i) => { c.fillStyle = col; for (let x = i * 2; x < w; x += 6) c.fillRect(x, 0, 2, 8); }); });
      stripes.wrapS = T.RepeatWrapping; stripes.repeat.set(12, 1);
      const grid = k.canvasTex(64, 64, (c) => { c.fillStyle = '#9fd6ff'; c.fillRect(0, 0, 64, 64); c.clearRect(4, 4, 56, 56); });
      grid.wrapS = grid.wrapT = T.RepeatWrapping; grid.repeat.set(30, 16);
      const layerSpecs = [
        ['polarR', 'Back polarizer', 0.021, { color: 0x8f9aa8 }, 'The back polarizer only lets light wiggle one way through.', 'tft', null],
        ['tft', 'Pixel switches', 0.026, { color: 0xffffff, map: grid }, 'This glass has millions of tiny switches, one for every dot on the screen.', 'lc', null],
        ['lc', 'Liquid crystal', 0.031, { color: 0xbfe8ff }, 'The liquid crystal is a very thin layer of special liquid. It twists to let light through or block it.', 'colorFilter', null],
        ['colorFilter', 'Color filter', 0.036, { color: 0xffffff, map: stripes }, 'The color filter has tiny red, green and blue stripes. Every color you see is made from those three.', 'polarF', 'The picture is only black and white. No colors!'],
        ['polarF', 'Front polarizer', 0.041, { color: 0x8f9aa8 }, 'This clear sheet is the front polarizer. It works like magic sunglasses.', null, 'The picture is plain white.'],
      ];
      layerSpecs.forEach(([id, name, z, mo, say, above, symptom]) => {
        const mat = k.mat(mo.color, { map: mo.map || null, transparent: true, opacity: 0.08, depthWrite: false, side: T.DoubleSide, roughness: 0.2 });
        const m = new T.Mesh(new T.PlaneGeometry(W - 0.26, H - 0.26), mat);
        const g = k.group(m);
        refs.layers.push({ id, mesh: m });
        comp(panel, 'panel', {
          id, name, obj: g, at: [0, 0], z, pull: [0, 3.1 + z * 10, 0.4 + z * 18], blockedBy: above ? [above] : [], face: [0, 0, 1],
          say,
          breaks: id === 'polarF' ? 'The picture disappeared! It is still there, but you need the magic sunglasses sheet to see it.' : 'The picture is gone. Just white light!',
          fact: id === 'polarF' ? 'Polarized sunglasses work the same way. Try looking at a phone screen with them and tilting your head!' : 'The panel is a sandwich of see-through layers, each very, very thin.',
          symptom: symptom || undefined,
        });
      });
      for (let i = 0; i < 4; i++) {
        const drv = k.group(k.at(k.box(0.55, 0.12, 0.008, k.mat(0xd99a3a, { roughness: 0.5 })), 0, 0, 0.004), k.at(k.box(0.26, 0.045, 0.01, 0x1a1a1d), 0, 0.01, 0.012));
        comp(panel, 'panel', {
          id: 'drv' + i, name: 'Driver chip', obj: drv, at: [-2.1 + i * 1.4, (H - 0.14) / 2 + 0.03], z: 0.016, pull: [0, 0.5, 0.5], face: [0, 0, 1],
          say: 'A driver chip! It sends signals to one part of the screen.',
          breaks: 'A stripe of the picture went black!', fact: 'Each driver chip controls lots of columns of tiny dots.',
          symptom: i === 1 ? 'A black stripe goes down the screen.' : undefined,
        });
      }

      // ---------- front frame (bezel) with remote sensor, standby light, power button
      const bezel = k.at(k.group(
        k.at(k.box(W, 0.1, 0.07, M.frame), 0, H / 2 - 0.05, 0),
        k.at(k.box(W, 0.16, 0.07, M.frame), 0, -H / 2 + 0.08, 0),
        k.at(k.box(0.1, H, 0.07, M.frame), -W / 2 + 0.05, 0, 0),
        k.at(k.box(0.1, H, 0.07, M.frame), W / 2 - 0.05, 0, 0)
      ), 0, CY, 0.25);
      root.add(bezel);
      add({ id: 'bezel', name: 'Front frame', obj: bezel, pull: [0, 0.3, 2.9], face: [0, 0, 1], focusRadius: 3,
        say: 'The frame holds all the thin layers together, like the crust on a sandwich.' });
      const ir = k.group(k.at(k.sphere(0.045, k.mat(0x5a0d12, { roughness: 0.15 })), 0, 0, 0.02));
      comp(bezel, 'bezel', { id: 'irSensor', name: 'Remote sensor', obj: ir, at: [0, -H / 2 + 0.08], z: 0.035, pull: [0, -0.35, 0.5], face: [0, 0, 1],
        say: 'This little window sees invisible light from the remote control.', breaks: 'Now the remote control cannot talk to the TV!', breaksAlways: true,
        fact: 'A remote blinks an invisible light really fast, like a secret code. A phone camera can sometimes see it!' });
      const standby = k.box(0.06, 0.035, 0.02, k.glow(0x330000, 0xff2020));
      refs.standby = standby;
      comp(bezel, 'bezel', { id: 'standbyLed', name: 'Standby light', obj: k.group(standby), at: [W / 2 - 0.45, -H / 2 + 0.08], z: 0.04, pull: [0.3, -0.35, 0.5], face: [0, 0, 1],
        say: 'The little red light glows when the TV is sleeping.' });
      const btn = k.group(k.at(k.box(0.14, 0.05, 0.06, 0x2a2c31), 0, 0, 0));
      comp(bezel, 'bezel', { id: 'powerBtn', name: 'Power button', obj: btn, at: [0.9, -H / 2 + 0.01], z: -0.01, pull: [0.2, -0.45, 0.4], face: [0, 0, 1],
        say: 'The power button on the TV itself, for when the remote gets lost in the couch.',
        breaks: 'Now the TV has no way to switch on. The screen stays dark!' });

      // ---------- back cover (a tub) + 8 screws
      const coverMat = k.mat(0x1d1f24, { roughness: 0.8 });
      const CW = W - 0.3, CH = H - 0.3;
      const cover = k.at(k.group(
        k.box(CW, CH, 0.05, coverMat),
        k.at(k.box(3.6, 2.2, 0.12, coverMat), 0, 0, -0.07),
        k.at(k.box(CW, 0.04, 0.45, coverMat), 0, CH / 2, 0.225),
        k.at(k.box(CW, 0.04, 0.45, coverMat), 0, -CH / 2, 0.225),
        k.at(k.box(0.04, CH, 0.45, coverMat), CW / 2, 0, 0.225),
        k.at(k.box(0.04, CH, 0.45, coverMat), -CW / 2, 0, 0.225)
      ), 0, CY, -0.5);
      for (let i = 0; i < 8; i++) cover.add(k.at(k.box(1.4, 0.04, 0.02, 0x0c0d10), 0, 0.75 - i * 0.12, -0.14));
      root.add(cover);
      const cs = [[-2.45, 1.25], [0, 1.25], [2.45, 1.25], [-2.45, 0], [2.45, 0], [-2.45, -1.25], [0, -1.25], [2.45, -1.25]];
      cs.forEach(([x, y], i) => screwAt('cs' + i, x, CY + y, -0.53));
      add({ id: 'cover', name: 'Back cover', obj: cover, xray: true, pull: [6.4, -0.95, -1.9], blockedBy: COVER_SCREWS, face: [0, 0, -1],
        say: 'The back cover protects the circuit boards inside.' });

      // ---------- power board
      const psu = makeBoard(1.8, 1.3, 0x6b5b3a, 21);
      k.at(psu, -1.45, 2.2, -0.075);
      root.add(psu);
      [[-0.82, 0.57], [0.82, 0.57], [-0.82, -0.57], [0.82, -0.57]].forEach(([x, y], i) => screwAt('ps' + i, -1.45 + x, 2.2 + y, -0.1, ['cover'], 0.08));
      add({ id: 'psu', name: 'Power board', obj: psu, pull: [-1.8, -0.4, -2.9], blockedBy: ['cover', 'harness', 'cord'].concat(PSU_SCREWS), reach: ['cover'], face: [0, 0, -1], focusRadius: 1.5,
        say: 'The power board changes wall electricity into the gentle kind the TV can use.',
        breaks: 'No power board, no power! The TV turns off.', fact: 'Wall electricity is way too strong for the tiny chips, so this board turns it down.' });
      const P = (spec) => comp(psu, 'psu', spec);
      const POWER_OFF = 'The TV turned off!';
      P({ id: 'powerConn', name: 'Power socket', obj: conn(0.2, 0.3, 0.16, 0xf2efe6, 2), at: [-0.78, -0.3], blockedBy: ['cord'],
        say: 'The power cord plugs in here.', breaks: POWER_OFF });
      P({ id: 'fuse', name: 'Fuse', obj: fuse(0.36), at: [-0.5, -0.5],
        say: 'This little glass tube is the fuse. It is a safety guard.', breaks: 'No fuse, no power. ' + POWER_OFF,
        fact: 'If too much electricity rushes in, the thin wire inside melts and stops it, so nothing catches fire.', symptom: 'It will not turn on at all.' });
      P({ id: 'varistor', name: 'Surge guard', obj: disc(0.1, 0x2a5fd6), at: [-0.5, -0.15],
        say: 'The blue surge guard protects the TV from big zaps, like lightning far away.', breaks: 'The TV still works, but it is not protected from big zaps anymore.', breaksAlways: true });
      P({ id: 'bridge', name: 'Bridge rectifier', obj: chip(0.26, 0.12, 0.08, 0x1b1b1b, 2), at: [-0.2, -0.5],
        say: 'The bridge rectifier turns wiggly electricity into electricity that flows only one way.', breaks: POWER_OFF,
        fact: 'Wall electricity swings back and forth 60 times every second. Chips need it to flow one way, like a one-way street.' });
      P({ id: 'bigcap1', name: 'Big capacitor', obj: elcap(0.16, 0.34, 0x1d2a5c), at: [-0.35, 0.28],
        say: 'A big capacitor! It stores electricity like a little water tank.', breaks: POWER_OFF,
        fact: 'Big capacitors can hold a zap even after unplugging. That is why grown-up fixers are so careful.', symptom: 'It will not turn on at all.' });
      P({ id: 'bigcap2', name: 'Big capacitor', obj: elcap(0.14, 0.3, 0x1d2a5c), at: [0.02, 0.32],
        say: 'Another big capacitor. It keeps the power smooth and steady.', breaks: POWER_OFF });
      P({ id: 'transformer', name: 'Transformer', obj: transformer(0.38, 0.34, 0.26), at: [0.45, 0.08],
        say: 'The transformer uses magnets and coils of wire to turn the electricity way down.', breaks: POWER_OFF,
        fact: 'Electricity goes around and around one coil. Its magnet pushes electricity into a second coil without them ever touching!', symptom: 'It will not turn on at all.' });
      P({ id: 'heatsinkP', name: 'Heat sink', obj: heatsink(0.3, 0.26, 0.16, 6), at: [-0.05, -0.18], z: -0.09,
        say: 'The heat sink has metal fins that let heat escape, like a dog panting to cool off.', breaks: 'The power switch got too hot, so the TV turned off to stay safe.' });
      P({ id: 'mosfet', name: 'Power switch', obj: mosfet(), at: [-0.05, -0.18], blockedBy: ['heatsinkP'],
        say: 'This power switch flips on and off thousands of times every second.', breaks: POWER_OFF });
      P({ id: 'coilP', name: 'Coil', obj: toroid(0.12, 0.045), at: [0.2, -0.45],
        say: 'A coil of copper wire! It stores energy in a magnet field and smooths out bumps.', breaks: POWER_OFF });
      P({ id: 'controller', name: 'Power control chip', obj: chip(0.14, 0.1, 0.03, 0x1a1a1d, 4), at: [0.48, -0.45],
        say: 'This little chip is the boss of the power board. It tells the power switch when to flip.', breaks: POWER_OFF });
      P({ id: 'ledDriver', name: 'LED driver chip', obj: chip(0.16, 0.16, 0.03, 0x1a1a1d, 5), at: [0.62, 0.45],
        say: 'The LED driver chip sends just the right amount of electricity to the little lights.', breaks: 'All the lights went out! The picture is still there, but way too dark to see.',
        symptom: 'The picture is super dark, almost black. But you can hear the show.' });
      P({ id: 'diode', name: 'Diode', obj: diode(), at: [0.75, -0.2],
        say: 'A diode only lets electricity go one way, like a door that only opens one way.' });
      P({ id: 'outConn', name: 'Power wire socket', obj: conn(0.12, 0.3, 0.12, 0xf2efe6, 3), at: [0.82, 0.15], blockedBy: ['harness'],
        say: 'The power wires to the main board plug in here.', breaks: 'The main board lost its power!' });
      const resistor = () => {
        const g = k.group(k.at(k.rot(k.cyl(0.022, 0.022, 0.13, 0xd9b38c, 10), 0, 0, Math.PI / 2), 0, 0, -0.03));
        [0xc0392b, 0x8e44ad, 0x1b1b1b].forEach((c, i) => g.add(k.at(k.rot(k.cyl(0.024, 0.024, 0.012, c, 10), 0, 0, Math.PI / 2), -0.035 + i * 0.025, 0, -0.03)));
        return g;
      };
      const RES = { name: 'Resistor', say: 'A resistor slows electricity down, like a narrow pipe slows water.', fact: 'The colored stripes are a secret code that tells how much it slows things down.' };
      [[-0.72, 0.1], [-0.72, 0.2], [0.12, 0.58], [0.45, -0.25]].forEach(([x, y], i) => P(Object.assign({ id: 'resP' + i, obj: resistor(), at: [x, y], level: 3 }, RES)));
      P({ id: 'opto', name: 'Light messenger chip', obj: chip(0.12, 0.08, 0.03, 0xf2efe6, 2), at: [0.6, 0.25], level: 3,
        say: 'This chip sends messages with a tiny light inside, so the strong side and the gentle side never touch.', fact: 'It is called an optocoupler. It keeps the strong wall electricity away from the chips.' });
      P({ id: 'ycap', name: 'Safety capacitor', obj: disc(0.06, 0x2a5fd6), at: [-0.31, -0.05], level: 3,
        say: 'A little blue safety capacitor. It stops electrical noise from leaking out.' });
      [[-0.75, 0.45], [0.3, 0.55], [0.78, -0.48]].forEach(([x, y], i) => P({ id: 'scapP' + i, name: 'Small capacitor', obj: elcap(0.05, 0.13, [0x2e8b57, 0x1b6fa8, 0x7a3fb0][i]), at: [x, y],
        say: 'A small capacitor. It soaks up little bumps in the electricity.' }));

      // ---------- main board
      const main = makeBoard(1.6, 1.15, 0x2f7d4a, 33);
      k.at(main, 1.4, 2.2, -0.075);
      root.add(main);
      [[-0.72, 0.5], [0.72, 0.5], [-0.72, -0.5], [0.72, -0.5]].forEach(([x, y], i) => screwAt('ms' + i, 1.4 + x, 2.2 + y, -0.1, ['cover'], 0.08));
      add({ id: 'mainboard', name: 'Main board', obj: main, pull: [1.8, -0.4, -2.9], blockedBy: ['cover', 'harness', 'lvds', 'hdmi', 'wireL', 'wireR'].concat(MAIN_SCREWS), reach: ['cover'], face: [0, 0, -1], focusRadius: 1.4,
        say: 'The main board is the brain. It is a little computer that runs the apps, the menus and the sound.',
        breaks: 'The brain is gone! The screen goes black and the sound stops.', fact: "A smart TV's main board is a lot like the inside of a tablet." });
      const Mn = (spec) => comp(main, 'mainboard', spec);
      const BRAIN_OFF = 'The brain stopped! The screen went black.';
      Mn({ id: 'heatsinkM', name: 'Heat sink', obj: heatsink(0.36, 0.36, 0.12, 7), at: [-0.1, 0.05], z: -0.07,
        say: 'This heat sink keeps the brain chip cool.', breaks: 'The brain chip got too hot, so it stopped to stay safe!' });
      Mn({ id: 'soc', name: 'Processor chip', obj: chip(0.3, 0.3, 0.04, 0x26282d, 8), at: [-0.1, 0.05], blockedBy: ['heatsinkM'],
        say: 'The processor chip is the real brain. It does billions of tiny math problems every second!', breaks: BRAIN_OFF,
        fact: 'Inside it are billions of switches called transistors, each way too small to see.', symptom: 'It turns on, but the screen stays black and there is no sound.' });
      Mn({ id: 'ram1', name: 'Memory chip', obj: chip(0.22, 0.12, 0.03, 0x1a1a1d, 5), at: [0.35, 0.25],
        say: 'A memory chip holds what the brain is thinking about right now.', breaks: BRAIN_OFF, fact: 'When the TV turns off, this memory forgets everything, like a dream.' });
      Mn({ id: 'ram2', name: 'Memory chip', obj: chip(0.22, 0.12, 0.03, 0x1a1a1d, 5), at: [0.35, -0.08],
        say: 'Another memory chip. Two of them work as a team.', breaks: BRAIN_OFF });
      Mn({ id: 'flash', name: 'Storage chip', obj: chip(0.2, 0.15, 0.03, 0x1a1a1d, 6), at: [-0.5, 0.36],
        say: 'The storage chip remembers the apps and settings, even when the TV is unplugged.', breaks: 'The TV forgot how to start up!' });
      Mn({ id: 'wifi', name: 'Wi-Fi module', obj: module(0.28, 0.22), at: [-0.55, -0.08],
        say: 'The Wi-Fi module talks to the internet with invisible radio waves.', breaks: 'The TV can still show the game box, but it lost the internet.', breaksAlways: true });
      [0.35, 0.12, -0.11].forEach((y, i) => Mn({ id: 'hdmiP' + (i + 1), name: 'HDMI port', obj: port(0.14, 0.2, 0.12), at: [0.72, y], blockedBy: i === 0 ? ['hdmi'] : [],
        say: i === 0 ? 'The HDMI cable plugs into this port.' : 'Another HDMI port, for another game box.',
        breaks: i === 0 ? 'No port, no show on the game box channel. It says No Signal!' : undefined, symptom: i === 0 ? 'The screen just says NO SIGNAL.' : undefined }));
      Mn({ id: 'usb', name: 'USB port', obj: port(0.12, 0.09, 0.08), at: [0.72, -0.38], say: 'A USB port, for plugging in a memory stick.' });
      Mn({ id: 'lan', name: 'Network port', obj: port(0.16, 0.16, 0.14, 0x202a3a), at: [0.46, -0.42], say: 'The network port is for an internet cable.' });
      Mn({ id: 'crystal', name: 'Clock crystal', obj: crystal(), at: [0.08, -0.36],
        say: 'The clock crystal ticks millions of times a second, like a drum keeping everyone in step.', breaks: 'No clock, so the brain lost the beat and stopped!',
        fact: 'Inside is a tiny piece of quartz, a kind of rock, that wiggles at an exact speed.' });
      Mn({ id: 'amp', name: 'Sound chip', obj: chip(0.14, 0.14, 0.03, 0x1a1a1d, 4), at: [-0.2, -0.42],
        say: 'The sound chip makes the sound strong enough to push the speakers.', breaks: 'The sound stopped!', symptom: 'The picture works, but there is no sound at all.' });
      Mn({ id: 'tunerM', name: 'TV tuner', obj: k.group(k.at(k.box(0.3, 0.18, 0.08, M.silver), 0, 0, -0.04)), at: [-0.52, -0.4],
        say: 'The tuner can pick up TV channels from an antenna.',
        breaks: 'Now the antenna channels say No Signal! Press the channel button to see. The game box channel still works.' });
      Mn({ id: 'spkConn', name: 'Speaker plug', obj: conn(0.14, 0.08, 0.08, 0xf2efe6, 4), at: [0.12, 0.48], blockedBy: ['wireL', 'wireR'],
        say: 'The speaker wires plug in here.', breaks: 'The sound stopped!' });
      Mn({ id: 'lvdsConn', name: 'Picture cable plug', obj: conn(0.3, 0.07, 0.07, 0xf2efe6, 8), at: [-0.2, 0.48], blockedBy: ['lvds'],
        say: 'The picture cable to the T-con board plugs in here.', breaks: 'The picture stopped! The light is on, but nothing is showing.' });
      [[-0.72, 0.38], [0.12, -0.22], [0.47, 0.45]].forEach(([x, y], i) => Mn(Object.assign({ id: 'resM' + i, obj: resistor(), at: [x, y], level: 3 }, RES)));
      Mn({ id: 'vreg', name: 'Power chip', obj: chip(0.1, 0.1, 0.03, 0x1a1a1d, 3), at: [-0.33, 0.3], level: 3,
        say: 'This power chip gives the brain exactly the gentle electricity it needs.' });
      [[-0.75, 0.15], [0.25, -0.3]].forEach(([x, y], i) => Mn({ id: 'scapM' + i, name: 'Small capacitor', obj: elcap(0.045, 0.12, 0x1b6fa8), at: [x, y],
        say: 'A small capacitor. It soaks up little bumps in the electricity.' }));

      // ---------- T-con board
      const tcon = makeBoard(1.8, 0.5, 0x2c6a8a, 44);
      k.at(tcon, 0, 3.55, -0.075);
      root.add(tcon);
      screwAt('ts0', -0.82, 3.55, -0.1, ['cover'], 0.08);
      screwAt('ts1', 0.82, 3.55, -0.1, ['cover'], 0.08);
      add({ id: 'tcon', name: 'T-con board', obj: tcon, pull: [0, 1.6, -2.6], blockedBy: ['cover', 'lvds'].concat(TCON_SCREWS), reach: ['cover'], face: [0, 0, -1], focusRadius: 1.4,
        say: 'The T-con board tells every tiny dot on the screen when to change color.', breaks: 'The picture stopped!',
        fact: 'T-con is short for timing controller. It is like the conductor of an orchestra.' });
      const Tc = (spec) => comp(tcon, 'tcon', spec);
      Tc({ id: 'timing', name: 'Timing chip', obj: chip(0.2, 0.2, 0.03, 0x1a1a1d, 6), at: [0, 0],
        say: 'The timing chip keeps all the dots changing at exactly the right moment.', breaks: 'Without it, the picture gets all scrambled!',
        symptom: 'The picture is all scrambled with stripes.' });
      Tc({ id: 'gamma', name: 'Color chip', obj: chip(0.12, 0.12, 0.03, 0x1a1a1d, 3), at: [0.4, 0.05],
        say: 'The color chip makes sure dark looks dark and bright looks bright.', breaks: 'Whoa, the colors went backwards!',
        symptom: 'The colors are all backwards, like a photo negative.' });
      Tc({ id: 'eeprom', name: 'Settings memory', obj: chip(0.1, 0.08, 0.025, 0x1a1a1d, 3), at: [0.65, -0.1],
        say: 'This tiny memory holds the settings for this exact screen.', breaks: 'Whoa, the colors went backwards!' });
      Tc({ id: 'tconLvds', name: 'Picture cable socket', obj: conn(0.3, 0.07, 0.07, 0xf2efe6, 8), at: [-0.6, -0.12], blockedBy: ['lvds'],
        say: 'The picture cable from the main board plugs in here.', breaks: 'The picture stopped!' });
      [-0.675, -0.225, 0.225, 0.675].forEach((x, i) => Tc({ id: 'ribbon' + i, name: 'Ribbon cable', obj: k.group(k.at(k.box(0.24, 0.26, 0.008, k.mat(0xd99a3a, { roughness: 0.5 })), 0, 0, -0.01)), at: [x, 0.3],
        pull: [x * 0.3, 0.55, -0.6],
        say: 'A flat ribbon cable carries signals up to a driver chip on the screen.', breaks: 'A stripe of the picture went black!' }));
      [[-0.25, 0.1], [0.25, -0.12]].forEach(([x, y], i) => Tc({ id: 'scapT' + i, name: 'Small capacitor', obj: elcap(0.04, 0.1, 0x2e8b57), at: [x, y],
        say: 'A small capacitor. It soaks up little bumps in the electricity.' }));

      // ---------- speakers (each: box, magnet, cone, wire)
      const speaker = (side) => {
        const x = side === 'L' ? -1.9 : 1.9, pos = [x, 1.2, -0.13];
        const g = k.at(k.group(k.box(0.8, 0.24, 0.12, k.mat(0x1c1d21))), ...pos);
        for (let i = 0; i < 6; i++) g.add(k.at(k.box(0.02, 0.18, 0.02, 0x3a3c42), -0.25 + i * 0.1, 0, 0.065));
        root.add(g);
        const id = 'spk' + side, name = side === 'L' ? 'Left speaker' : 'Right speaker';
        add({ id, name, obj: g, pull: [side === 'L' ? -1.5 : 1.5, -0.75, -2.1], blockedBy: ['cover'], reach: ['cover'], face: [0, 0, -1], focusRadius: 0.9,
          say: `The ${lower(name)} plays sound on this side.`, breaks: 'Now the sound only comes out of one side!',
          fact: 'Two speakers make stereo sound, so a car on the screen can sound like it zooms from one side to the other.' });
        const cg = new T.CylinderGeometry(0.1, 0.05, 0.08, 20, 1, true); cg.rotateX(Math.PI / 2);
        comp(g, id, { id: 'cone' + side, name: 'Speaker cone', obj: k.group(k.mesh(cg, k.mat(0x2b2b2b, { side: T.DoubleSide, roughness: 0.9 }))), at: [0, 0], z: -0.1, pull: [0, 0.3, -0.5], face: [0, 0, -1],
          say: 'The speaker cone wiggles back and forth super fast. That pushes the air, and the air carries the sound to your ears.', breaks: 'Now the sound only comes out of one side!',
          symptom: side === 'L' ? 'The sound only comes out of one side.' : undefined });
        comp(g, id, { id: 'mag' + side, name: 'Magnet', obj: k.group(k.at(k.rot(k.cyl(0.06, 0.06, 0.06, k.metal(0x8a8f96), 16), Math.PI / 2, 0, 0), 0, 0, -0.03)), at: [0, 0], z: -0.15, pull: [0.3, 0.3, -0.5], blockedBy: [],
          say: 'A strong magnet! It pushes and pulls the cone to make sound.', breaks: 'Now the sound only comes out of one side!', fact: 'Almost every speaker, even in headphones, has a magnet inside.' });
        const tgt = side === 'L' ? [[-1.6, 1.3, -0.14], [-0.4, 1.42, -0.22], [1.0, 1.5, -0.22], [1.5, 2.0, -0.26], [1.52, 2.62, -0.16]] : [[1.6, 1.3, -0.14], [1.65, 1.6, -0.24], [1.55, 2.2, -0.26], [1.52, 2.62, -0.16]];
        const local = tgt.map((p) => [p[0] - pos[0], p[1] - pos[1], p[2] - pos[2]]);
        const wire = k.group(k.tube(local, 0.014, k.mat(0xc0392b, { roughness: 0.5 })), k.tube(local.map((p) => [p[0] + 0.03, p[1], p[2]]), 0.014, k.mat(0x111111, { roughness: 0.5 })));
        comp(g, id, { id: 'wire' + side, name: 'Speaker wire', obj: wire, at: [0, 0], z: 0, pull: [0, 0, -0.7], face: [0, 0, -1],
          say: 'The red and black speaker wires carry the sound from the main board.', breaks: 'Now the sound only comes out of one side!' });
      };
      speaker('L');
      speaker('R');

      // ---------- cables
      const cableMat = k.mat(0x16171a, { roughness: 0.5 });
      const prong = k.metal(0xd8c48a);
      const cordObj = k.group(
        k.at(k.box(0.14, 0.24, 0.14, k.mat(0x222428)), -2.23, 1.9, -0.17),
        k.tube([[-2.28, 1.9, -0.18], [-2.55, 1.6, -0.35], [-2.75, 0.6, -0.6], [-2.95, 0.05, -1.0], [-3.7, 0.05, -1.6]], 0.04, cableMat),
        k.at(k.box(0.3, 0.18, 0.24, k.mat(0x222428)), -3.85, 0.1, -1.65),
        k.at(k.box(0.12, 0.04, 0.02, prong), -4.05, 0.1, -1.6),
        k.at(k.box(0.12, 0.04, 0.02, prong), -4.05, 0.1, -1.7)
      );
      root.add(cordObj);
      add({ id: 'cord', name: 'Power cord', obj: cordObj, pull: [-1.0, 0, -1.3], noSpark: true, face: [0, 0, -1],
        say: 'This is the power cord. It brings electricity from the wall.', breaks: 'Unplugged! No electricity, so the TV turns off.',
        fact: 'Always unplug something before you open it. That is rule number one for fixers!' });
      const hdmiObj = k.group(
        k.at(k.box(0.16, 0.2, 0.16, k.mat(0x222428)), 2.2, 2.55, -0.14),
        k.tube([[2.28, 2.55, -0.15], [2.55, 2.2, -0.3], [2.75, 0.6, -0.6], [2.95, 0.05, -1.0], [3.7, 0.05, -1.6]], 0.04, cableMat)
      );
      root.add(hdmiObj);
      add({ id: 'hdmi', name: 'HDMI cable', obj: hdmiObj, pull: [1.0, 0, -1.3], noSpark: true, face: [0, 0, -1],
        say: 'The HDMI cable brings the show in from a game or a streaming box.', breaks: 'No cable, so the game box channel says No Signal!',
        fact: 'One HDMI cable carries the picture and the sound together through 19 tiny wires.' });
      const lvdsObj = k.group(k.tube([[1.2, 2.68, -0.15], [0.9, 3.0, -0.19], [-0.2, 3.15, -0.19], [-0.6, 3.43, -0.15]], 0.03, k.mat(0xb8bcc4, { roughness: 0.4 })));
      root.add(lvdsObj);
      add({ id: 'lvds', name: 'Picture cable', obj: lvdsObj, pull: [0, 0.2, -1.6], blockedBy: ['cover'], face: [0, 0, -1],
        say: 'The picture cable carries the picture from the main board to the T-con board.', breaks: 'The picture stopped! The light is on, but nothing is showing.' });
      const hp = [[-0.63, 2.35, -0.15], [-0.2, 2.45, -0.24], [0.3, 2.4, -0.24], [0.62, 2.35, -0.15]];
      const harness = k.group(...[0xc0392b, 0x111111, 0xf1c40f].map((c, i) => k.tube(hp.map((p) => [p[0], p[1] + (i - 1) * 0.035, p[2]]), 0.016, k.mat(c, { roughness: 0.5 }))));
      root.add(harness);
      add({ id: 'harness', name: 'Power wires', obj: harness, pull: [0, -0.3, -1.6], blockedBy: ['cover'], face: [0, 0, -1],
        say: 'These colored wires carry power from the power board to the main board.', breaks: 'The main board lost its power! The screen went dark.' });

      const L1 = ['stand', 'strip0', 'strip1', 'strip2', 'strip3', 'strip4', 'diffuser', 'panel', 'bezel', 'cover', 'cs0', 'cs2', 'cs5', 'cs7',
        'psu', 'mainboard', 'tcon', 'spkL', 'spkR', 'cord', 'hdmi'];
      const L2 = ['ss0', 'ss1', 'reflector', 'film1', 'film2', 'film3', 'polarF', 'irSensor', 'cs1', 'cs3', 'cs4', 'cs6', 'fuse', 'bigcap1', 'transformer',
        'heatsinkP', 'ledDriver', 'heatsinkM', 'soc', 'ram1', 'wifi', 'hdmiP1', 'amp', 'timing', 'coneL', 'coneR', 'lvds', 'harness'];
      const FUSE = { ss0: 'stand', ss1: 'stand', film1: 'diffuser', film2: 'diffuser', film3: 'diffuser', cs1: 'cover', cs3: 'cover', cs4: 'cover', cs6: 'cover', lvds: 'tcon', harness: 'psu' };
      parts.forEach((p) => {
        if (p.level) return;
        p.level = L1.indexOf(p.id) >= 0 ? 1 : L2.indexOf(p.id) >= 0 || /^led\d_\d$/.test(p.id) || /^(ps|ms|ts)\d$/.test(p.id) ? 2 : 3;
        if (FUSE[p.id]) p.fuse = FUSE[p.id];
        else if (/^ps\d$/.test(p.id)) p.fuse = 'psu';
        else if (/^ms\d$/.test(p.id)) p.fuse = 'mainboard';
        else if (/^ts\d$/.test(p.id)) p.fuse = 'tcon';
      });
      return { root, shell: [shell], parts, screen: scr, refs };
    },

    evaluate(has, on) {
      const all = (a) => a.every(has);
      const psuOK = has('psu') && all(PSU_POWER);
      const out = { standby: has('cord') && psuOK && !on && has('standbyLed'), alive: false, strips: [0, 0, 0, 0, 0], glow: 0, screen: { mode: 'off' }, sound: {} };
      if (!on) return out;
      if (!has('cord')) { out.reason = "It's not plugged in! Put the power cord back."; return out; }
      if (!psuOK) { out.reason = 'Something on the power board is missing, so no electricity gets in.'; return out; }
      if (!has('powerBtn')) { out.reason = "The power button is missing, so there's no way to switch the TV on."; return out; }
      out.alive = true;
      if (!(has('mainboard') && has('harness') && has('outConn') && all(BRAIN))) {
        out.screen = { mode: 'black' }; out.reason = "Something on the main board is missing, so the TV can't think."; return out;
      }
      const driver = has('ledDriver');
      for (let r = 0; r < ROWS; r++) {
        let ok = driver && has('strip' + r);
        for (let c = 0; ok && c < COLS; c++) ok = has(ledId(r, c));
        out.strips[r] = ok ? 1 : 0;
      }
      const lit = out.strips.reduce((a, b) => a + b, 0) / ROWS;
      const reflect = has('reflector') ? 1 : 0.8;
      out.glow = +(lit * reflect).toFixed(3);
      // Channel 1 is the game box (HDMI). The other channels come from an antenna, through the tuner.
      const mis = TAL.app && TAL.app.mission, brokenNow = mis && !mis.fixedPart ? mis.broken : null;
      const chan = (TAL.app && TAL.app.channel) || 0;
      const gameBox = has('hdmi') && has('hdmiP1'), antenna = has('tunerM');
      const signal = chan === 0 || brokenNow === 'hdmiP1' ? gameBox : antenna;
      out.inputs = [gameBox, antenna];
      const feed = has('lvds') && has('lvdsConn') && has('tcon') && has('tconLvds');
      const films = ['film1', 'film2', 'film3'].filter((id) => !has(id)).length;
      const scr = { mode: signal ? 'picture' : 'nosignal', dim: +((lit === 0 ? 0.07 : 1) * Math.pow(0.85, films) * reflect).toFixed(3) };
      if (!feed) { scr.mode = 'black'; scr.lit = lit > 0; }
      else {
        if (!has('panel') || !all(['polarF', 'polarR', 'lc', 'tft'])) scr.mode = 'white';
        if (!has('colorFilter')) scr.gray = true;
        if (!has('gamma') || !has('eeprom')) scr.invert = true;
        if (!has('timing')) scr.glitch = true;
        const dead = [0, 1, 2, 3].filter((i) => !has('drv' + i) || !has('ribbon' + i));
        if (dead.length) scr.deadCols = dead;
      }
      if (lit > 0 && lit < 1) scr.darkRows = out.strips.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0);
      if (lit > 0 && !has('diffuser')) scr.hotspots = true;
      out.screen = scr;
      const sound = signal && has('amp') && has('spkConn');
      out.sound = sound ? { show: true, left: all(['spkL', 'magL', 'coneL', 'wireL']), right: all(['spkR', 'magR', 'coneR', 'wireR']) } : {};
      return out;
    },

    apply(out, inst) {
      const r = inst.refs, k3 = THREE;
      r.ledRows.forEach((row, ri) => row.forEach(({ id, chipM, dome, halo, lens, ph }) => {
        const me = inst.byId[id], cap = inst.byId[lens], coat = inst.byId[ph];
        const lit = !!(out.strips && out.strips[ri] && (!me || me.target === 0));
        const blue = !!(coat && coat.target === 1);
        chipM.material.emissive.setHex(blue ? 0x2a48ff : 0xfff2c0);
        chipM.material.emissiveIntensity = lit ? chipM.userData.glowI : 0;
        dome.material.emissiveIntensity = lit && (!cap || cap.target === 0) ? dome.userData.glowI : 0;
        halo.material.color.setHex(blue ? 0x2f5bff : 0xffffff);
        const blend = blue ? k3.NormalBlending : k3.AdditiveBlending; // blue is drawn solid so it shows on the white sheet
        if (halo.material.blending !== blend) { halo.material.blending = blend; halo.material.needsUpdate = true; }
        halo.scale.setScalar(blue ? 1.4 : 1);
        halo.visible = lit;
      }));
      r.diffuser.material.emissiveIntensity = 0.85 * (out.glow || 0);
      r.standby.material.emissiveIntensity = out.standby ? 2.5 : 0;
    },

    // Screen layers are nearly invisible while on the panel, and show up as sheets once peeled off.
    tick(dt, t, inst) {
      inst.refs.layers.forEach(({ id, mesh }) => { const p = inst.byId[id]; mesh.material.opacity = (id === 'tft' ? 0.02 : 0.07) + 0.5 * (p ? p.t : 0); });
    },
  });

  function lower(n) { return n.charAt(0).toLowerCase() + n.slice(1); }
})();
