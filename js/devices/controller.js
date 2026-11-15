/* Game controller (wireless). Beginner 8 pieces, Medium 26, Advanced 79.
 * Power plays a little demo: buttons press, sticks wobble, triggers squeeze, and the rumble motors spin their
 * off-center weights so the whole controller shakes. Advanced is a real teardown: the board, the battery pack,
 * the thumbstick modules, the trigger sensors and both rumble motors all come apart into their pieces.
 * Must-haves: battery pack (cell, protection board, wires, plug), main chip, crystal, regulator.
 * Everything else changes one feature (radio, light, buzz, a button, a stick) or nothing at all (screws, caps). */
(function () {
  const T = window.THREE;
  const TOP = 1.0; // top face of the shell
  const PI = Math.PI;

  TAL.registerDevice({
    id: 'controller',
    name: 'Game controller',
    short: 'game controller',
    subtitle: 'Buzzing, clicking and shaking',
    powerSound: 'flat',
    channels: false,
    view: { target: [0, 0.9, 0], radius: 5.0, explodedRadius: 9.0, explodedY: 2.0, yaw: 0, pitch: 0.85, shadow: [9, 6] },
    intro: 'This is a game controller. Press the green power button and feel it buzz! The rumble motors inside make it shake.',
    shellSay: 'That is the controller. Two plastic halves hold everything inside.',
    guide: [
      { do: 'power', say: "Hi, I'm Sparky! Press the green power button. Watch the buttons and feel the controller shake!", nudge: 'Press the power button.' },
      { do: 'remove', ids: ['sc1', 'sc2', 'sc3', 'sc4'], levels: [3], say: 'The two halves are held by four screws. Twist them out!', nudge: 'Pull out the glowing screw.' },
      { do: 'remove', ids: ['top'], say: 'Now lift off the top half.', nudge: 'Pull off the top shell.' },
      { do: 'remove', ids: ['mL'], say: 'See that little motor in the handle? Pull it out. What happens to the shaking?', nudge: 'Pull out a rumble motor.' },
      { do: 'remove', ids: ['membrane'], levels: [2, 3], say: 'Peel up the rubber sheet. Now try the buttons!', nudge: 'Pull up the rubber sheet.' },
      { do: 'remove', ids: ['xtal'], levels: [3], say: 'Look closely at the board. This tiny silver box is a crystal. It ticks like a heartbeat. Pull it out!', nudge: 'Pull out the tiny silver crystal.' },
      { do: 'remove', ids: ['battery'], levels: [1, 2], say: 'Pull out the battery. Everything stops!', nudge: 'Pull out the battery.' },
      { do: 'remove', ids: ['battery'], levels: [3], say: 'Last, pull out the battery. It is the power tank for everything.', nudge: 'Pull out the battery.' },
      { do: 'end', say: 'A controller has a battery for power, a board that thinks, buttons that tell it what you press, and motors that buzz. Put them back and play!' },
    ],

    build(k) {
      const shaker = k.group();
      const root = k.group(shaker);
      const parts = [];
      const add = (s) => { parts.push(s); return s; };
      const sub = (parentObj, parentId, s) => { parentObj.add(s.obj); s.parent = parentId; return add(s); };
      // a child part: its object rides inside its parent, and it comes off once the parent is reachable
      const kid = (po, pid, id, name, obj, level, o) => sub(po, pid, Object.assign({ id, name, obj, level, face: [0, 1, 0], focusRadius: 0.7 }, o));

      // ---- materials: deep glossy plastic (no metalness, so it does not wash out), plus small shared ones
      const speckle = (hex) => {
        const t = k.canvasTex(128, 128, (c, W, H) => {
          c.fillStyle = hex; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 500; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)'; c.fillRect(Math.random() * W, Math.random() * H, 1, 1); }
        });
        t.wrapS = t.wrapT = T.RepeatWrapping;
        return t;
      };
      const plastic = (hex, o) => new T.MeshPhysicalMaterial(Object.assign({ color: 0xffffff, map: speckle(hex), roughness: 0.4, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.28 }, o || {}));
      const lin = (c) => new T.Color(c).convertSRGBToLinear(); // the scene is lit for sRGB, so raw hex colors come out pale; this keeps them as picked
      const solid = (c, o) => new T.MeshPhysicalMaterial(Object.assign({ color: lin(c), roughness: 0.42, metalness: 0.0, clearcoat: 0.4, clearcoatRoughness: 0.3 }, o || {}));
      const dark = k.mat(lin(0x1d1f26), { roughness: 0.9 });
      const metal = k.metal(0xb9bec6);
      const silver = k.metal(0xd7dce2);
      const gold = k.metal(0xd8b25a, { roughness: 0.3 });
      const copper = k.metal(0xc9772e, { roughness: 0.4 });
      const chipBlk = k.mat(0x16171b, { roughness: 0.35 });
      const smdTan = k.mat(0xb48a5c, { roughness: 0.6 });
      const both = (c) => k.mat(c, { roughness: 0.6, side: T.DoubleSide });
      const ax = (o) => k.rot(o, 0, 0, PI / 2); // lay a cylinder along X
      const arc = (r, len, t0, tl, m) => k.mesh(new T.CylinderGeometry(r, r, len, 20, 1, true, t0, tl), m);

      // ---- shell halves (a body with two handles)
      const half = (y, hex) => {
        const m = plastic(hex);
        return k.group(k.at(k.rbox(5.4, 0.5, 3.0, m, 0.2), 0, y, 0), k.at(k.rbox(1.5, 0.5, 1.5, m, 0.25), -2.2, y, 1.35), k.at(k.rbox(1.5, 0.5, 1.5, m, 0.25), 2.2, y, 1.35));
      };
      const top = half(0.75, '#1c46c8');
      const led = k.mesh(new T.BoxGeometry(0.9, 0.03, 0.08), k.glow(0x3ee08f, 0x3ee08f)); led.name = 'led'; k.at(led, 0, TOP + 0.01, -1.2);
      top.add(led);
      const bottom = half(0.25, '#14161d');
      shaker.add(top, bottom);
      add({ id: 'top', name: 'Top shell', obj: top, pull: [0, 3.0, -3.4], blockedBy: ['sc1', 'sc2', 'sc3', 'sc4'], xray: true, face: [0, 1, 0], focusRadius: 4.5,
        say: 'The top half of the case. It holds the buttons in place and protects the insides.',
        job: 'It holds your buttons in place and protects the parts inside.',
        learn: ['It is like the lid of a lunchbox. It keeps everything safe and in the right spot.', 'It is molded plastic with holes for the sticks and buttons to poke through. The shape fits your hands.', 'Plastic is light, strong and easy to mold into curves. To make it, hot melted plastic is squirted into a metal mold and cools into the shape.'] });
      add({ id: 'bottom', name: 'Bottom shell', obj: bottom, pull: [0, -3.0, 1.4], blockedBy: ['top', 'board', 'battery', 'mL', 'mR', 'cboard', 'pipe'], face: [0, -1, 0], focusRadius: 4.5,
        say: 'The bottom half of the case. It is the tray that holds the battery and the motors.',
        job: 'It holds the battery, the motors and the board in place.',
        learn: ['It is like the bottom of the lunchbox where the food sits.', 'It has little posts and walls that keep each part from sliding around, even when it buzzes.', 'Plastic posts and ribs fit each part snugly, and they also make the shell stiff without making it heavy.'] });
      [[-2.2, -1.25], [2.2, -1.25], [-2.45, 1.75], [2.45, 1.75]].forEach(([x, z], i) => {
        const sc = k.at(k.screw(0x9ea3ab, 0.35), x, TOP, z);
        shaker.add(sc);
        add({ id: 'sc' + (i + 1), name: 'Case screw', kind: 'screw', obj: sc, pull: [x * 0.45, 1.1 + (i % 2) * 0.5, z * 0.4], level: 3, fuse: 'top', face: [0, 1, 0],
          say: 'A screw. It holds the two halves of the case together.',
          job: 'It holds the two halves of the case together.',
          learn: ['A screw is like a tiny spiral staircase that pulls the halves together as you twist.', 'The thread bites into the plastic post, so the screw stays put through all the shaking.', 'Twisting turns a big, slow motion into a strong squeeze. That squeeze is what holds the shell shut.'] });
      });

      // ---- main circuit board (parts sit on its top face, y = 0.525)
      const pcb = k.board(3.6, 2.0, { seed: 3, count: 10 });
      k.at(pcb, 0, 0.5, 0);
      const board = k.group(pcb);
      shaker.add(board);
      add({ id: 'board', name: 'Circuit board', obj: board, pull: [0, 2.8, 2.0], blockedBy: ['top', 'membrane', 'cboard'], face: [0, 1, 0], focusRadius: 2.2,
        say: 'The circuit board is the controller\'s tiny brain. It figures out which buttons you press.',
        breaks: 'No brain! Nothing works at all.',
        fact: 'The board has copper roads on it that join all the parts.',
        learn: ['It is like a town map. The little roads (copper lines) carry electricity between parts.', 'It reads each button and stick many times a second and sends the news to the console.', 'A board is a flat plastic and fiberglass sheet with thin copper traces. Chips and tiny parts are soldered on top.'],
        symptom: 'Nothing lights up and nothing works.' });
      let bn = 0;
      // put a small part on the board at (x, z): its pull fans outward from where it sits
      const onBoard = (id, name, obj, level, x, z, o) => {
        obj.position.set(x, 0, z);
        const n = bn++;
        return kid(board, 'board', id, name, obj, level, Object.assign({ pull: [x * 1.5 + (n % 2 ? 0.4 : -0.4), 1.0 + (n % 4) * 0.5, z * 1.5 + (z > 0 ? 0.6 : -0.6)], focusRadius: 0.6 }, o));
      };
      const smd = (w, h, d, m) => k.at(k.box(w, h, d, m), 0, 0.525 + h / 2, 0); // sits on the board face; the part's own x,z are set by onBoard
      const chip = k.group(k.at(k.box(0.6, 0.1, 0.6, chipBlk), -0.2, 0.6, 0.1), k.at(k.box(0.3, 0.01, 0.1, k.mat(0xdddddd)), -0.2, 0.656, 0.1));
      sub(board, 'board', { id: 'chip', name: 'Main chip', obj: chip, pull: [-1.2, 2.4, 1.2], level: 2, face: [0, 1, 0], focusRadius: 1,
        say: 'This little chip is the thinker. It reads your buttons and talks to the game.',
        breaks: 'The thinker is gone. Nothing works!',
        fact: 'A chip is a tiny brain with millions of switches.',
        learn: ['It is like the captain on a ship. It listens to everything and decides what to do.', 'It checks every button and stick hundreds of times each second, then sends a tiny message to the game console.', 'It is a microcontroller: a small computer on a chip that runs a program and sends data wirelessly or by cable.'],
        symptom: 'Nothing lights up and nothing works.' });
      const btc = k.group(smd(0.42, 0.07, 0.42, k.metal(0xc4c9d0)), k.at(k.box(0.24, 0.012, 0.08, chipBlk), 0, 0.6, 0.06));
      onBoard('btchip', 'Bluetooth radio chip', btc, 2, 0.15, 0.65, { pull: [0.6, 2.4, 1.6], focusRadius: 0.8,
        say: 'This chip is the radio. It talks to the game with invisible waves, with no cable!',
        breaks: 'No radio! The controller cannot talk to the game.',
        fact: 'Radio waves are invisible, but they travel right through the air.',
        learn: ['It is like a walkie-talkie inside. It sends your button news through the air.', 'The radio turns the chip\'s messages into radio waves, and listens for answers from the game console.', 'Many wireless controllers use Bluetooth, which sends data on radio waves in the 2.4 gigahertz band.'],
        symptom: 'It turns on, but it will not connect to the game.' });
      const antG = k.group(smd(0.32, 0.07, 0.1, k.mat(0xcfc6a8, { roughness: 0.7 })), k.at(k.box(0.05, 0.075, 0.1, silver), -0.18, 0.5625, 0), k.at(k.box(0.05, 0.075, 0.1, silver), 0.18, 0.5625, 0));
      for (let i = 0; i < 4; i++) antG.add(k.at(k.box(0.22, 0.012, 0.025, copper), -0.4, 0.531, -0.06 + i * 0.05));
      onBoard('ant', 'Chip antenna', antG, 3, 1.5, 0.75, { focusRadius: 0.7,
        say: 'A tiny stick that sends and catches the radio waves.',
        breaks: 'Without the antenna the radio is too weak, so the game cannot hear it well!',
        learn: ['It is like the ears and the mouth of a walkie-talkie, but for radio waves.', 'Electricity wiggling inside it sends waves out, and waves that arrive make a tiny wiggle of electricity in it.', 'Its size is matched to the waves it uses. Some controllers print the antenna as a copper zigzag on the board instead.'],
        symptom: 'It turns on, but it will not connect to the game.' });
      const xt = k.group(smd(0.24, 0.07, 0.1, silver), k.at(k.box(0.2, 0.01, 0.06, k.mat(0x777b82)), 0, 0.5975, 0));
      onBoard('xtal', 'Crystal', xt, 3, -0.8, 0.55, { pull: [-1.0, 2.6, 0.9], focusRadius: 0.5,
        say: 'This tiny silver box is a crystal. It ticks like a heartbeat for the chip.',
        breaks: 'No heartbeat! The chip cannot keep time, so it stops.',
        fact: 'A crystal shakes the same way, every single time.',
        learn: ['It is like a metronome that the chip follows to keep the beat.', 'A little slice of quartz shakes at one steady speed when electricity touches it. The chip counts the shakes to keep time.', 'Quartz is piezoelectric: squeezing it makes electricity, and electricity makes it vibrate. It rings at one very steady frequency.'],
        symptom: 'Nothing lights up and nothing works.' });
      onBoard('reg', 'Voltage regulator', k.group(smd(0.22, 0.07, 0.17, chipBlk)), 3, -0.85, -0.5, { focusRadius: 0.5,
        say: 'The battery pushes with a bit too much electricity. This chip makes it just right for the brain.',
        breaks: 'The brain gets the wrong push, so it stops!',
        learn: ['It is like a water tap that is turned just the right amount.', 'A battery pushes a little less as it drains. The regulator turns that into one steady push that the chip likes.', 'A lithium-ion cell sits between about 3 and 4.2 volts. The regulator holds a steady, lower voltage for the chips.'],
        symptom: 'Nothing lights up and nothing works.' });
      onBoard('chg', 'Charging chip', k.group(smd(0.26, 0.07, 0.26, chipBlk)), 3, 0.35, -0.55, { focusRadius: 0.6,
        say: 'This chip looks after the battery while you charge. It keeps the battery safe.',
        breaks: 'It still plays, but it cannot charge the battery safely now!',
        learn: ['It is like a careful grown-up filling a glass so it never spills over.', 'It fills the battery fast at first, then slows down near full so the battery does not get too hot.', 'Lithium-ion charging uses steady current first, then steady voltage. The chip watches the cell to stay inside safe limits.'],
        symptom: 'I plug it in, but it never charges.' });
      onBoard('drv', 'Motor driver chip', k.group(smd(0.3, 0.07, 0.2, chipBlk)), 3, -1.25, 0.5, { focusRadius: 0.6,
        say: 'The brain is too small to run the motors itself. This helper gives the motors a big push when the game says buzz!',
        breaks: 'The motors cannot get their push, so there is no buzzing!',
        learn: ['It is like a strong helper who turns the big wheel when the little brain whispers.', 'The chip sends only tiny signals. The driver switches the bigger electricity that the motors need.', 'It is a switch run by the microcontroller. Switching it on and off quickly changes how strong the buzz feels.'],
        symptom: 'The controller does not buzz in my hands.' });
      [[0.9, -0.25], [1.1, -0.25], [-0.45, -0.75]].forEach(([x, z], i) => {
        onBoard('cap' + (i + 1), 'Capacitor', k.group(smd(0.14, 0.09, 0.08, smdTan)), 3, x, z, { focusRadius: 0.4,
          say: 'A tiny part that holds a little bit of electricity, ready to use.',
          job: 'It smooths the electricity so the chips get a steady push.',
          learn: ['It is like a small cup of water next to a tap. It gives a sip when the tap sputters.', 'It stores a tiny bit of electricity and gives it back in a quick moment, so the power stays steady.', 'Two metal plates with a gap hold opposite charges. Near a chip, capacitors soak up sudden changes in how much power it wants.'] });
      });
      [[0.9, -0.55], [1.05, -0.55]].forEach(([x, z], i) => {
        onBoard('res' + (i + 1), 'Resistor', k.group(smd(0.1, 0.035, 0.055, chipBlk), k.at(k.box(0.02, 0.037, 0.058, silver), -0.045, 0.5425, 0), k.at(k.box(0.02, 0.037, 0.058, silver), 0.045, 0.5425, 0)), 3, x, z, { focusRadius: 0.4,
          say: 'A tiny part that makes electricity go a little slower.',
          job: 'It limits how much electricity flows, so nothing gets too much.',
          learn: ['It is like a narrow spot in a garden hose that slows the water.', 'Electricity has to squeeze through the resistor, so less gets through. That protects parts like the little light.', 'A resistor sets the current by Ohm\'s law: current equals voltage divided by resistance.'] });
      });
      onBoard('dio', 'Diode', k.group(smd(0.14, 0.05, 0.07, chipBlk), k.at(k.box(0.025, 0.052, 0.072, silver), 0.045, 0.55, 0)), 3, 0.6, -0.78, { focusRadius: 0.4,
        say: 'A one-way door for electricity.',
        job: 'It lets electricity go one way only, to protect the parts.',
        learn: ['It is like a one-way turnstile at a fair.', 'Electricity can go through it forward, but it is blocked if it tries to go backward.', 'A diode is a p-n junction. A forward voltage lets current cross, and a reverse voltage stops it.'] });
      const sled = k.mesh(new T.BoxGeometry(0.12, 0.06, 0.1), k.glow(0x3ee08f, 0x3ee08f)); sled.name = 'sled'; k.at(sled, 0, 0.555, 0);
      onBoard('sled', 'Status LED', k.group(sled), 3, 0, -0.55, { focusRadius: 0.5,
        say: 'This tiny light turns on when the controller is awake.',
        breaks: 'The little light is out, but the controller still works.',
        learn: ['It is like a tiny flashlight with only one color.', 'When electricity goes through it, it gives off light. A resistor keeps it from getting too much.', 'An LED shines when electrons cross a junction and give off their extra energy as light. The material sets the color.'] });
      [[-1, 'L', 'left'], [1, 'R', 'right']].forEach(([sx, S, side]) => {
        onBoard('hl' + S, 'Hall sensor', k.group(smd(0.14, 0.06, 0.1, chipBlk)), 3, sx * 1.15, -0.85, { focusRadius: 0.5,
          say: 'This tiny chip can feel a magnet nearby. It tells the game how far you squeeze the ' + side + ' trigger.',
          breaks: 'The trigger still squeezes, but the game cannot feel it, so it never buzzes back on that side!',
          learn: ['It is like a magnet-feeler. The closer the magnet, the bigger the feeling.', 'The magnet in the trigger gets closer as you squeeze. The sensor turns how strong it feels into a number.', 'A Hall sensor gives a voltage that changes with magnetic field strength. It measures without touching, so it does not wear. Some controllers use a potentiometer here instead.'],
          symptom: 'The ' + side + ' trigger squeezes, but the game does not notice.' });
        onBoard('sw' + S, 'Bumper switch', k.group(smd(0.24, 0.1, 0.2, dark), k.at(k.box(0.14, 0.02, 0.12, silver), 0, 0.636, 0)), 3, sx * 1.6, -0.88, { focusRadius: 0.5,
          say: 'A tiny click switch under the ' + side + ' bumper. Press the bumper and it clicks!',
          breaks: 'The bumper moves, but nothing clicks, so the game never hears it!',
          learn: ['It is like a tiny doorbell button.', 'Pressing the bumper pushes a little springy metal dome down onto two contacts. Click!', 'A tactile switch has a metal dome that snaps down and joins two contacts, then snaps back up when you let go.'] });
      });
      const zif = k.group(smd(0.22, 0.1, 0.42, k.mat(0xe8e4d8, { roughness: 0.6 })), k.at(k.box(0.06, 0.03, 0.4, dark), 0.04, 0.62, 0));
      onBoard('zif', 'Ribbon connector', zif, 3, 1.5, -0.12, { focusRadius: 0.6,
        say: 'A little clip that holds the end of the flat ribbon wire.',
        breaks: 'Without the clip, the ribbon cannot connect, so the colored buttons stop working!',
        learn: ['It is like a tiny hug that holds the end of the ribbon.', 'The ribbon slides in, then a little flip-up latch squeezes it onto the metal contacts.', 'It is called a ZIF connector, for zero insertion force. You slide the cable in with no push, then close the latch.'],
        symptom: 'The four colored buttons do nothing.' });
      const port = k.group(k.at(k.box(0.5, 0.14, 0.3, metal), 0, 0.58, -0.95), k.at(k.box(0.34, 0.06, 0.1, k.mat(0x1a1a1a)), 0, 0.58, -1.08));
      sub(board, 'board', { id: 'port', name: 'Charging port', obj: port, pull: [0, 1.0, -1.3], level: 2, face: [0, 1, 0], focusRadius: 1,
        say: 'The charging port is the little hole where the cable plugs in.',
        breaks: 'It still plays, but now you cannot plug in a cable to charge it!', breaksAlways: true,
        job: 'It is where the charging cable plugs in.',
        learn: ['It is the door where the electricity comes in to fill the battery.', 'It is a metal socket with tiny pins that touch the cable plug.', 'A USB socket has pins for power and for data, so one cable can both charge and talk to the computer.'] });

      // ---- membrane: a rubber sheet with little nubs under the buttons
      const mem = k.group(k.at(k.box(3.4, 0.04, 1.8, k.mat(0x56644f, { roughness: 0.95 })), 0, 0.62, 0));
      [[1.5, -0.35], [1.8, -0.1], [1.8, -0.6], [2.1, -0.35], [-0.85, 0.55], [-0.85, 0.55]].forEach(([x, z]) => mem.add(k.at(k.cyl(0.13, 0.13, 0.12, k.mat(0x6b7367, { roughness: 1 }), 12), x * 0.7, 0.68, z * 0.6)));
      board.add(mem);
      add({ id: 'membrane', name: 'Rubber membrane', obj: mem, pull: [0, 2.0, -1.8], level: 2, fuse: 'board', face: [0, 1, 0], focusRadius: 2.2,
        say: 'A soft rubber sheet with little bumps under the buttons. It makes the buttons spring back up.',
        breaks: 'The buttons are floppy and do not press anything now!',
        fact: 'The bumps touch the board when you push down.',
        learn: ['Think of a rubber trampoline under each button. Push it down and it bounces back.', 'Under each bump is a bit of black rubber. When you press, it touches two spots on the board and joins them.', 'Pressing connects the two copper spots, and the board notices the change. The rubber also springs the button back up.'],
        symptom: 'I press the buttons and nothing happens.' });

      // ---- button contact board (under the four colored buttons) with its ribbon cable
      const fx = 2.2, fz = -0.35;
      const cbG = k.group(k.at(k.box(0.8, 0.05, 0.8, k.mat(0x2f7d4a, { roughness: 0.7 })), fx, 0.54, fz));
      [[0, 0.32], [0.32, 0], [-0.32, 0], [0, -0.32]].forEach(([dx, dz]) => cbG.add(k.at(k.cyl(0.09, 0.09, 0.012, gold, 14), fx + dx, 0.572, fz + dz)));
      shaker.add(cbG);
      add({ id: 'cboard', name: 'Button contact board', obj: cbG, pull: [2.2, 1.9, -0.4], blockedBy: ['top'], level: 2, fuse: 'board', face: [0, 1, 0], focusRadius: 1.2,
        say: 'A small circuit board under the four colored buttons. It feels each press.',
        breaks: 'No contact board, so the four colored buttons cannot tell the game anything!',
        learn: ['It is like a little drum under each button that feels the tap.', 'It has copper pads. When a rubber bump with a black dot pushes down, two pads get joined and the press is noticed.', 'The pads are printed as two fingers that almost touch. A carbon dot on the rubber bridges them and closes the circuit.'],
        symptom: 'The four colored buttons do nothing.' });
      const rib = k.group(k.at(k.box(0.7, 0.012, 0.3, k.mat(0xd89a3c, { roughness: 0.5 })), 1.85, 0.58, -0.12));
      rib.add(k.at(k.box(0.5, 0.004, 0.02, copper), 1.85, 0.588, -0.12));
      kid(cbG, 'cboard', 'rib', 'Ribbon cable', rib, 3, { pull: [-0.9, 1.6, 1.0], blockedBy: ['zif'], focusRadius: 0.8,
        say: 'A flat, bendy cable with copper roads inside. It carries the button news to the main board.',
        breaks: 'The cable is gone, so the colored buttons cannot reach the brain!',
        learn: ['It is like a flat bridge between two towns.', 'Thin copper lines run side by side inside a bendy plastic strip, so many messages travel in one cable.', 'It is a flexible printed circuit: copper traces on thin polyimide film, which can bend many times.'],
        symptom: 'The four colored buttons do nothing.' });

      // ---- battery pack: pouch cell, protection board, wires, plug
      const battery = k.group(k.at(k.rbox(1.8, 0.3, 1.0, k.mat(0x2457c5, { roughness: 0.4 }), 0.05), 0, 0.28, 0.1), k.at(k.box(0.5, 0.12, 0.2, k.metal(0xd8c48a)), 0.55, 0.28, -0.45));
      shaker.add(battery);
      add({ id: 'battery', name: 'Battery', obj: battery, pull: [0, 2.2, 2.6], blockedBy: ['board'], face: [0, 1, 0], focusRadius: 1.6,
        say: 'The battery stores electricity, like a lunchbox stores food.',
        breaks: 'No battery, no electricity. Nothing works!',
        fact: 'A battery pushes electricity out when something is connected.',
        learn: ['The battery is a little tank of stored energy. It lets the controller work without a cable.', 'It makes electricity from chemicals inside. When you plug the controller in, electricity flows back in and refills it.', 'Rechargeable batteries like this one are usually lithium ion. A charging chip protects it from overheating.'],
        symptom: 'Nothing lights up and nothing works.' });
      const pcm = k.group(k.at(k.box(0.2, 0.06, 0.7, k.mat(0x2f7d4a, { roughness: 0.7 })), 1.05, 0.28, 0.1), k.at(k.box(0.1, 0.04, 0.12, chipBlk), 1.05, 0.33, 0.0), k.at(k.box(0.08, 0.03, 0.08, chipBlk), 1.05, 0.325, 0.25));
      kid(battery, 'battery', 'pcm', 'Battery protection board', pcm, 2, { pull: [1.6, 1.4, 0.8], focusRadius: 0.8,
        say: 'A tiny safety board on the battery. It switches things off if something goes wrong.',
        breaks: 'No safety board, so the electricity cannot get out. Nothing works!',
        learn: ['It is like a lifeguard at the pool.', 'It watches the battery for too much charge, too little, or too much electricity at once, and switches off to keep it safe.', 'A lithium-ion cell must stay inside a safe voltage window. A small protection circuit disconnects the cell when it does not.'],
        symptom: 'Nothing lights up and nothing works.' });
      const wires = k.group(k.tube([[1.12, 0.3, -0.05], [1.3, 0.32, -0.3], [1.1, 0.33, -0.7]], 0.025, k.mat(0xc83a3a, { roughness: 0.6 })), k.tube([[1.12, 0.28, 0.0], [1.34, 0.3, -0.28], [1.14, 0.31, -0.7]], 0.025, k.mat(0x1d1f26, { roughness: 0.6 })));
      kid(battery, 'battery', 'bwire', 'Battery wires', wires, 3, { pull: [2.0, 1.2, -1.0], blockedBy: ['bplug'], focusRadius: 0.8,
        say: 'Two thin wires, a red one and a black one, carry the electricity out of the battery.',
        breaks: 'The wires are gone, so the electricity cannot get out!',
        learn: ['They are like two straws. One lets electricity out, and the other lets it come back.', 'One wire carries electricity out and the other carries it back. Rubbery coats keep them from touching.', 'Copper strands inside are covered by plastic insulation. By habit, red is positive and black is negative.'],
        symptom: 'Nothing lights up and nothing works.' });
      const plug = k.group(k.at(k.box(0.3, 0.16, 0.2, k.mat(0xeceae2, { roughness: 0.6 })), 1.1, 0.33, -0.8), k.at(k.box(0.22, 0.04, 0.02, gold), 1.1, 0.33, -0.91));
      kid(battery, 'battery', 'bplug', 'Battery plug', plug, 3, { pull: [1.2, 1.5, -1.6], focusRadius: 0.7,
        say: 'A little white plug at the end of the wires. It snaps onto the board.',
        breaks: 'No plug, so the battery is not connected to the board!',
        learn: ['It is like the plug on a lamp cord.', 'It only fits one way, so the red and black wires always meet the right spots.', 'A keyed connector stops it going in backward. That would swap positive and negative and could hurt the board.'],
        symptom: 'Nothing lights up and nothing works.' });

      // ---- rumble motors: can, magnet, spinning coil + copper slices + shaft, brushes, lopsided weight
      const spinners = [];
      const motor = (sx, S, side) => {
        const mx = sx * 2.2, mz = 1.3, cy = 0.62;
        const can = k.group(ax(k.at(arc(0.2, 0.7, PI / 2 + 0.9, 2 * PI - 1.8, both(0x9aa0a8)), 0, 0, 0)), ax(k.at(k.cyl(0.2, 0.2, 0.03, metal, 18), 0, 0, 0)));
        can.children[0].position.set(mx - 0.1, cy, mz);
        can.children[1].position.set(mx - 0.46, cy, mz);
        shaker.add(can);
        add({ id: 'm' + S, name: 'Rumble motor', obj: can, pull: [sx * 2.2, 2.0, 1.8], blockedBy: ['top'], face: [0, 1, 0], focusRadius: 1.2,
          say: 'This little motor makes the controller shake. It has a lopsided weight on its spinning stick!',
          breaks: 'With a motor gone, there is less shaking.',
          fact: 'A weight that is not centered makes everything wobble when it spins.',
          learn: ['Spin something lopsided and it wobbles, like a washing machine with all the socks on one side.', 'The motor spins fast, and the heavy half of the weight pulls the whole controller a little to one side, then the other. Your hands feel that as a buzz.', 'This is an eccentric rotating mass motor. The off-center weight makes a rotating force, and a different motor speed changes the buzz.'],
          symptom: 'The ' + side + ' handle does not buzz in my hands.' });
        const spin = (x, ...meshes) => { const inner = k.at(k.group(...meshes), x, cy, mz); return { outer: k.group(inner), inner }; };
        // the weight: a half-moon on the end of the spinning stick, so it is lopsided
        const w = spin(mx + 0.48, k.rot(k.mesh(new T.CylinderGeometry(0.22, 0.22, 0.14, 14, 1, false, 0, PI), k.metal(0xd8a24a)), 0, 0, PI / 2));
        kid(can, 'm' + S, 'w' + S, 'Off-center weight', w.outer, 2, { pull: [sx * 1.0, 1.0, 1.2],
          face: [0, 1, 0], focusRadius: 0.8,
          say: 'This half-moon weight is lopsided on purpose. That is what makes the shaking.',
          breaks: 'The motor spins smoothly now, so there is no shaking!',
          fact: 'If it were perfectly round, it would spin without any shake.',
          learn: ['If it were perfectly round it would spin smoothly. The lopsided half is what makes it wobble.', 'The heavy side tugs sideways as it goes around, the way a bucket swung on a rope tugs your hand.', 'The off-center mass creates a force that rotates with the shaft. The faster it spins, the harder the tug, so speed controls the strength.'],
          symptom: 'The motor spins, but the controller does not buzz.' });
        const mag = arc(0.175, 0.32, 1.5 * PI - 1.0, 2.0, both(0x5b616b));
        ax(mag); mag.position.set(mx - 0.12, cy, mz);
        kid(can, 'm' + S, 'gm' + S, 'Motor magnet', k.group(mag), 3, { pull: [sx * 0.6, -1.0, 1.3], blockedBy: ['co' + S], focusRadius: 0.6,
          say: 'A magnet stuck inside the motor can. It pushes and pulls on the spinning part.',
          breaks: 'No magnet, so the motor cannot spin and there is no buzzing!',
          learn: ['It is like a fridge magnet that tugs on things nearby.', 'Electricity in the coil makes it a magnet too, and the fixed magnet pushes and pulls it round and round.', 'The turning push comes from a magnetic field acting on current in the coil. Switching the current at the right moment keeps it going around.'],
          symptom: 'The ' + side + ' handle does not buzz in my hands.' });
        const coil = spin(mx - 0.12, ax(k.cyl(0.125, 0.125, 0.3, copper, 16)));
        kid(can, 'm' + S, 'co' + S, 'Armature coil', coil.outer, 3, { pull: [sx * 1.4, 1.6, 0.5], blockedBy: ['w' + S], focusRadius: 0.6,
          say: 'Thin copper wire wound round and round. When electricity runs through it, it turns into a magnet.',
          breaks: 'No coil, so no spin and no buzz!',
          learn: ['It is like string wrapped around a spool, but the string is wire.', 'Electricity in the coil makes a magnet that pushes against the fixed magnet. That is what makes it spin.', 'More turns of wire make a stronger magnetic push for the same current. A thin coating keeps the turns from touching.'],
          symptom: 'The ' + side + ' handle does not buzz in my hands.' });
        const cm = spin(mx - 0.35, ax(k.cyl(0.09, 0.09, 0.1, k.metal(0xd49a52, { roughness: 0.35 }), 12)));
        kid(can, 'm' + S, 'cm' + S, 'Commutator', cm.outer, 3, { pull: [sx * 0.2, 1.8, 1.6], blockedBy: ['br' + S + '1', 'br' + S + '2'], focusRadius: 0.5,
          say: 'Copper slices at the end of the spinning part. They hand electricity to the coil as it turns.',
          breaks: 'No copper slices, so the electricity cannot reach the spinning coil!',
          learn: ['It is like passing a ball from hand to hand at just the right moment.', 'As it turns, the brushes touch different copper slices, which switches which way electricity runs in the coil. That keeps the push going the same way.', 'A commutator reverses the coil current every half turn, so the turning force keeps the same direction.'],
          symptom: 'The ' + side + ' handle does not buzz in my hands.' });
        const sh = spin(mx + 0.01, ax(k.cyl(0.03, 0.03, 0.9, silver, 8)));
        kid(can, 'm' + S, 'sh' + S, 'Motor shaft', sh.outer, 3, { pull: [sx * 1.9, 1.0, 1.4], blockedBy: ['co' + S, 'cm' + S], focusRadius: 0.6,
          say: 'A thin metal rod down the middle. Everything that spins is stuck on it.',
          breaks: 'No shaft, so nothing can spin!',
          learn: ['It is like the stick of a lollipop. Everything is stuck to it.', 'The coil, the copper slices and the lopsided weight all ride on it, so they turn as one.', 'The shaft turns in tiny bearings. Its job is to carry the spin from the coil out to the weight.'],
          symptom: 'The ' + side + ' handle does not buzz in my hands.' });
        [-1, 1].forEach((d, i) => {
          const br = k.group(k.at(k.box(0.12, 0.05, 0.025, k.metal(0xb8864a, { roughness: 0.4 })), mx - 0.35, cy, mz + d * 0.115), k.at(k.box(0.05, 0.05, 0.1, k.mat(0x2a2c33)), mx - 0.43, cy, mz + d * 0.17));
          kid(can, 'm' + S, 'br' + S + (i + 1), 'Motor brush', br, 3, { pull: [sx * (0.4 + i * 0.4), 0.9 + i * 0.5, d * 1.4], focusRadius: 0.5,
            say: 'A little springy metal finger. It touches the spinning copper and hands it electricity.',
            breaks: 'A brush is missing, so no electricity gets in. The motor stops!',
            learn: ['It is like a finger that gently touches a spinning wheel.', 'The brush stays still while the copper spins past it. Springy metal keeps pressing on it so electricity can keep passing.', 'Brushes are sliding contacts. They wear very slowly, which is why some motors are built without them.'],
            symptom: 'The ' + side + ' handle does not buzz in my hands.' });
        });
        spinners.push({ id: 'w' + S, obj: w.inner, S }, { id: 'sh' + S, obj: sh.inner, S }, { id: 'co' + S, obj: coil.inner, S }, { id: 'cm' + S, obj: cm.inner, S });
        return w.inner;
      };
      const spinL = motor(-1, 'L', 'left'), spinR = motor(1, 'R', 'right');

      // ---- thumbsticks: module (stick + base), cap, centering spring, two potentiometers, click switch
      const stick = (id, S, sx, sz, label, side) => {
        const pivot = k.at(k.group(k.at(k.cyl(0.1, 0.1, 0.5, metal, 12), 0, 0.22, 0)), sx, 0.62, sz);
        const base = k.at(k.box(0.75, 0.12, 0.75, k.mat(0x2a2c33, { roughness: 0.5 })), sx, 0.58, sz);
        const cap = k.group(k.at(k.cyl(0.3, 0.3, 0.2, solid(0x07080b), 24), 0, 0.5, 0), k.at(k.cyl(0.18, 0.28, 0.06, solid(0x111319, { roughness: 0.8 }), 24), 0, 0.62, 0));
        const g = k.group(base, pivot);
        shaker.add(g);
        add({ id, name: label, obj: g, pull: [sx * 1.3, 2.4, 0.9], face: [0, 1, 0], focusRadius: 1.2,
          say: 'A thumbstick! Your thumb tilts it to steer in the game.',
          breaks: 'Without the stick, you cannot steer on this side.',
          fact: 'It senses which way and how far you tilt it.',
          learn: ['It is like a tiny joystick on a stick. Tilt it left and your game character goes left.', 'Inside, two little dials measure the tilt, one for left and right, one for up and down. The harder you tilt, the faster you go.', 'Each axis is a potentiometer (or a magnetic sensor) giving a number for how far it is tilted. A spring pushes it back to center when you let go.'],
          symptom: 'I cannot steer on the ' + side + ' side.' });
        sub(pivot, id, { id: id + 'c', name: 'Thumbstick cap', obj: cap, pull: [0, 1.2, 0.5], level: 2, face: [0, 1, 0], focusRadius: 0.8,
          say: 'The cap is the part your thumb rests on. It has a dip so your thumb does not slip off.',
          breaks: 'The stick still steers, but your thumb would slide around!', breaksAlways: true,
          job: 'It is the comfy part your thumb rests on.',
          learn: ['The cap is like a little hat on the stick. It makes the stick comfy to push.', 'It is smooth plastic with a dip and a rough rim so your thumb stays put even when you sweat.', 'The rubbery grip texture adds friction, so your thumb keeps control during fast play.'] });
        const pts = [];
        for (let i = 0; i <= 36; i++) { const a = i * 0.7; pts.push([Math.sin(a) * 0.17, 0.02 + (i / 36) * 0.34, Math.cos(a) * 0.17]); }
        kid(pivot, id, 'ss' + S, 'Stick spring', k.group(k.tube(pts, 0.014, silver)), 3, { pull: [0, 1.7, -0.3], focusRadius: 0.5,
          say: 'A tiny spring pushes the stick back to the middle when you let go.',
          breaks: 'No spring, so the stick flops over and does not come back!',
          learn: ['It is like a pogo stick that always bounces you back to the middle.', 'When you tilt the stick, the spring squishes on one side. Let go and it pushes the stick upright again.', 'A spring pushes back harder the more it is bent, so the stick always settles back at the center.'],
          symptom: 'The ' + side + ' stick flops over and does not come back to the middle.' });
        const potMat = k.mat(0x44506a, { roughness: 0.55 });
        const pot = (pid, nm, x, z, axisWord, o) => kid(g, id, pid, nm, k.group(k.at(k.box(0.2, 0.14, 0.2, potMat), sx + x, 0.71, sz + z), k.at(k.cyl(0.05, 0.05, 0.03, gold, 10), sx + x, 0.795, sz + z)), 3, Object.assign({ focusRadius: 0.5,
          say: 'This part measures how far you tilt the ' + side + ' stick ' + axisWord + '.',
          breaks: 'The game cannot tell how far you tilt ' + axisWord + '!',
          learn: ['It is like a dimmer knob on a lamp. Turn it a little or a lot and you get a different brightness.', 'As the stick tilts, a metal wiper slides along a track. The farther it slides, the bigger the number the board reads.', 'A potentiometer is a variable resistor. The wiper picks off a share of the voltage that depends on where it sits. Some sticks use magnets and Hall sensors instead.'],
          symptom: 'The ' + side + ' stick feels loose, but the game does not see it move ' + axisWord + '.' }, o));
        pot('px' + S, 'Left-right potentiometer', 0.33, 0, 'left and right', { pull: [sx * 0.9 + 1.0, 1.4, 0] });
        pot('py' + S, 'Up-down potentiometer', 0, 0.33, 'up and down', { pull: [sx * 0.9, 1.4, 1.1] });
        const ck = k.group(k.at(k.box(0.18, 0.1, 0.18, dark), sx - 0.3, 0.7, sz - 0.3), k.at(k.box(0.1, 0.02, 0.1, silver), sx - 0.3, 0.76, sz - 0.3));
        kid(g, id, 'ck' + S, 'Stick click switch', ck, 3, { pull: [sx * 0.9 - 1.0, 1.3, -1.0], focusRadius: 0.5,
          say: 'Push the stick straight down and it clicks! This little switch feels that.',
          breaks: 'You cannot click the stick down anymore.',
          learn: ['It is like a tiny doorbell button under the stick.', 'Pressing the stick straight down pushes a springy metal dome onto two contacts. Click!', 'A tactile switch has a dome that snaps down and joins two contacts, then snaps back up when you let go.'] });
        return pivot;
      };
      const pL = stick('sL', 'L', -1.7, -0.35, 'Left thumbstick', 'left');
      const pR = stick('sR', 'R', 0.85, 0.55, 'Right thumbstick', 'right');

      // ---- face buttons (4 colored), d-pad, and the two small middle buttons
      const bcols = [0x12a05c, 0xd2281f, 0x1c78d8, 0xe29a08], bpos = [[0, 0.32], [0.32, 0], [-0.32, 0], [0, -0.32]], bname = ['Green', 'Red', 'Blue', 'Yellow'], btn = [];
      const faces = k.group(k.at(k.cyl(0.62, 0.62, 0.03, solid(0x0a0b0f), 28), fx, TOP + 0.005, fz)); // a dark ring around the buttons, so the group has a body of its own
      shaker.add(faces);
      add({ id: 'btns', name: 'Face buttons', obj: faces, pull: [2.4, 2.0, -0.2], level: 2, fuse: 'top', face: [0, 1, 0], focusRadius: 1.2,
        say: 'Four colorful buttons your right thumb pushes.',
        breaks: 'Without those buttons, you cannot push them.',
        fact: 'Each button presses a little bump on the rubber sheet.',
        learn: ['Pushing a button is like knocking on a door. It tells the controller you want to do something.', 'Each button pushes the rubber bump below it down onto the board, and the board sends a message to the game.', 'Each press connects a pair of copper pads. The chip scans them hundreds of times per second so it never misses a quick tap.'],
        symptom: 'My right thumb buttons do not do anything.' });
      bpos.forEach(([dx, dz], i) => {
        const b = k.at(k.cyl(0.17, 0.17, 0.12, solid(bcols[i]), 18), fx + dx, TOP + 0.04, fz + dz);
        btn.push(b);
        kid(faces, 'btns', 'f' + 'GRBY'[i], bname[i] + ' button', b, 3, { pull: [dx * 3.0, 1.3 + (i % 2) * 0.5, dz * 3.0], focusRadius: 0.5,
          say: 'The ' + bname[i].toLowerCase() + ' button. Your thumb pushes it to do something in the game.',
          breaks: 'That button is gone, so pressing there does nothing!',
          learn: ['It is like a doorbell for your thumb.', 'Each button pushes down on its own rubber bump, which touches the board below.', 'The cap only carries your push to the bump. A lip around its edge keeps it from popping out of the case.'] });
      });
      const dk = solid(0x0a0b0f);
      const dpad = k.group(k.at(k.box(0.7, 0.12, 0.24, dk), -0.85, TOP + 0.04, 0.55), k.at(k.box(0.24, 0.12, 0.7, dk), -0.85, TOP + 0.04, 0.55));
      shaker.add(dpad);
      add({ id: 'dpad', name: 'D-pad', obj: dpad, pull: [-2.0, 2.0, 1.6], level: 2, fuse: 'top', face: [0, 1, 0], focusRadius: 1,
        say: 'The D-pad is a plus shape. You push it up, down, left or right.',
        breaks: 'Without the D-pad, you cannot choose a direction with it.',
        fact: 'The four arms of the plus each press a different bump.',
        learn: ['It is like a seesaw in four directions. Press an arm and that side goes down.', 'Each arm presses its own bump on the rubber sheet, so the controller knows which way you pushed.', 'The four arms close four separate contact pairs. The chip reads them as up, down, left and right.'],
        symptom: 'The plus-shaped pad does not work.' });
      [['menu', 'Menu button', 0.4, 'The menu button is a small button in the middle. It opens the menu in a game.'], ['view', 'View button', -0.4, 'The view button is a small button in the middle. In many games it shows a different screen.']].forEach(([id, nm, x, say]) => {
        const sb = k.at(k.cyl(0.1, 0.1, 0.06, k.mat(0x2e3038, { roughness: 0.6 }), 14), x, TOP + 0.02, -0.3);
        shaker.add(sb);
        add({ id, name: nm, obj: sb, pull: [x * 2.5, 1.5, -1.8], level: 3, fuse: 'top', face: [0, 1, 0], focusRadius: 0.5,
          say, breaks: 'That small button is gone, so you cannot press it!',
          learn: ['It is like a little doorbell in the middle of the controller.', 'It presses its own bump on the rubber sheet, and the board tells the game you pushed it.', 'It works like the bigger buttons, but it is smaller and sits between the sticks so a thumb does not push it by accident.'] });
      });

      // ---- bumpers (top edge buttons) and triggers (with spring, magnet)
      const bump = (id, S, sx, label) => {
        const pivot = k.at(k.group(k.rbox(1.0, 0.2, 0.35, solid(0x2c3350), 0.08)), sx * 2.1, 0.98, -1.25);
        const t = k.group(pivot);
        shaker.add(t);
        add({ id, name: label, obj: t, pull: [sx * 1.7, 1.5, -1.6], level: 2, fuse: 'top', face: [0, 1, 0], focusRadius: 1,
          say: 'A bumper. It is a button on the top edge that your pointer finger presses.',
          breaks: 'Without the bumper, there is nothing to press there.',
          learn: ['It is like a little diving board for your finger. Press it down and it tips.', 'Pressing the bumper tips it onto a tiny switch on the board. Click!', 'The bumper pivots on a hinge and presses a tactile switch, which closes a contact for the chip to read.'],
          symptom: 'The top edge button does not work.' });
        return pivot;
      };
      const bL = bump('bumL', 'L', -1, 'Left bumper'), bR = bump('bumR', 'R', 1, 'Right bumper');
      const trig = (id, sid, S, sx, label) => {
        const pivot = k.at(k.group(k.at(k.rbox(0.9, 0.3, 0.4, solid(0x2a2d3b), 0.1), 0, 0.0, -0.18)), sx * 1.9, 0.9, -1.55);
        const t = k.group(pivot);
        shaker.add(t);
        add({ id, name: label, obj: t, pull: [sx * 1.6, 1.4, -2.2], level: 2, fuse: 'top', face: [0, 1, 0], focusRadius: 1,
          say: 'A trigger. Your pointer finger squeezes it.',
          breaks: 'You cannot squeeze this one anymore.',
          fact: 'The harder you squeeze, the more it tells the game.',
          learn: ['It is like a little lever for your finger.', 'A spring pushes it back out each time. Squeeze it more or less and the game can tell how hard.', 'A sensor measures how far it moves, so the game can use partial squeezes, like a gas pedal.'],
          symptom: 'The back trigger does not work.' });
        const mg = k.group(k.at(k.box(0.12, 0.1, 0.1, k.mat(0xc23a3a, { roughness: 0.5 })), -0.06, -0.12, 0.08), k.at(k.box(0.12, 0.1, 0.1, silver), 0.06, -0.12, 0.08));
        kid(pivot, id, 'tm' + S, 'Trigger magnet', mg, 3, { pull: [sx * 0.8, -0.8, 1.2], focusRadius: 0.5,
          say: 'A little magnet hides in the trigger. It moves closer to the sensor when you squeeze.',
          breaks: 'No magnet to feel, so the game cannot tell you squeezed. No buzz back on that side!',
          learn: ['It is like a tiny magnet that sneaks closer as you squeeze.', 'The sensor on the board feels the magnet getting closer. That is how the game knows how far the trigger went.', 'The magnet field gets stronger as the gap shrinks, and the Hall sensor turns that strength into a number.'],
          symptom: 'The trigger squeezes, but the game does not notice.' });
        const pts = [];
        for (let i = 0; i <= 40; i++) { const a = i * 0.8; pts.push([sx * 1.9 + Math.sin(a) * 0.1, 0.5 + (i / 40) * 0.38, -1.3 + Math.cos(a) * 0.1]); }
        const sp = k.group(k.tube(pts, 0.015, k.metal(0xd7dce2)));
        shaker.add(sp);
        add({ id: sid, name: 'Trigger spring', obj: sp, pull: [sx * 1.0, 1.8, -0.8], blockedBy: ['top'], level: 2, fuse: 'bottom', face: [0, 1, 0], focusRadius: 0.8,
          say: 'A tiny spring pushes the trigger back out after you squeeze it.',
          breaks: 'The trigger is floppy and does not spring back!',
          fact: 'A spring pushes back when squashed.',
          learn: ['Squash a spring and it bounces back. That is how the trigger pops back out.', 'It also gives the trigger a nice springy feel as you squeeze.', 'The spring pushes harder the more you squash it, so the trigger feels firmer as you press further.'],
          symptom: 'The trigger flops around and does not spring back.' });
        return pivot;
      };
      const tL = trig('trL', 'tsL', 'L', -1, 'Left trigger'), tR = trig('trR', 'tsR', 'R', 1, 'Right trigger');

      // ---- light pipe: a clear rod carries the status LED's glow up to the window in the top shell
      const pipe = k.group(k.tube([[0, 0.62, -0.55], [0, 0.8, -0.95], [0, 0.97, -1.2]], 0.05, k.glass(0xbfffe0, 0.7)));
      shaker.add(pipe);
      add({ id: 'pipe', name: 'Light pipe', obj: pipe, pull: [0, 2.2, -2.2], blockedBy: ['top'], level: 3, fuse: 'top', face: [0, 1, 0], focusRadius: 0.7,
        say: 'A clear plastic rod that carries the little light up to the window.',
        breaks: 'The window stays dark, because the light cannot reach it.',
        learn: ['It is like a slide for light. It goes in at the bottom and comes out at the top.', 'Light bounces along the inside of the clear plastic and comes out the end. That lets a small light on the board glow in a window on top.', 'It works by total internal reflection: light that hits the wall at a shallow angle bounces back instead of leaving.'],
        symptom: 'The little light never comes on.' });

      // ---- effects: rumble tags
      const big = k.label('BZZZ!', { size: 0.46, bg: 'rgba(214,90,20,0.95)' }); big.position.set(0, 2.2, 0.2); big.visible = false;
      const small = k.label('bzz...', { size: 0.34, bg: 'rgba(60,110,200,0.92)' }); small.position.set(0, 2.2, 0.2); small.visible = false;
      root.add(big, small);

      return { root, shell: [], parts, refs: { shaker, spinL, spinR, spinners, pL, pR, tL, tR, bL, bR, btn, dpad, big, small, clock: 0, spL: 0, spR: 0, trigA: 0, bumA: 0, lean: [0, 0] } };
    },

    evaluate(has, on) {
      const cut = !(has('battery') && has('pcm') && has('bwire') && has('bplug'));
      const brain = has('board') && has('chip') && has('reg') && has('xtal');
      const power = !cut && brain;
      const alive = on && power;
      let reason = '';
      if (on && !power) reason = !has('battery') ? 'There is no battery, so the controller has no electricity.' : cut ? 'The battery is cut off from the board, so no electricity gets through.' : 'The brain is missing or has no heartbeat, so nothing works.';
      // a motor spins only with its magnet, coil, copper slices, shaft and both brushes, and the driver chip
      const spin = (S) => alive && has('drv') && has('m' + S) && has('gm' + S) && has('co' + S) && has('cm' + S) && has('sh' + S) && has('br' + S + '1') && has('br' + S + '2');
      return {
        alive, reason,
        link: alive && has('btchip') && has('ant'), light: alive && has('pipe') && has('sled'), charge: has('port') && has('chg'),
        spinL: spin('L'), spinR: spin('R'), rumbleL: spin('L') && has('wL'), rumbleR: spin('R') && has('wR'), wtL: has('wL'), wtR: has('wR'),
        press: alive && has('membrane'), face: has('btns'), cb: has('cboard') && has('rib') && has('zif'),
        fG: has('fG'), fR: has('fR'), fB: has('fB'), fY: has('fY'), menu: has('menu'), view: has('view'), dpad: has('dpad'),
        sL: has('sL'), sR: has('sR'), xL: has('pxL'), yL: has('pyL'), xR: has('pxR'), yR: has('pyR'), ckL: has('ckL'), ckR: has('ckR'), rcL: has('ssL'), rcR: has('ssR'), capL: has('sLc'), capR: has('sRc'),
        bL: has('bumL'), bR: has('bumR'), kL: has('swL'), kR: has('swR'),
        tL: has('trL'), tR: has('trR'), aL: has('tmL') && has('hlL'), aR: has('tmR') && has('hlR'), spL: has('tsL'), spR: has('tsR'),
      };
    },

    apply(out, inst) {
      inst.parts.forEach((p) => { p.blockedBy = p.blockedBy.filter((b) => inst.byId[b]); }); // drop blockers that are not separate pieces at this level
      const glow = (name, v) => { const m = inst.root.getObjectByName(name); if (m && m.material) m.material.emissiveIntensity = v; };
      glow('led', out.alive && out.light ? 2.2 : 0);
      glow('sled', out.alive ? 2.2 : 0);
      if (!out.alive) { const r = inst.refs; r.clock = 0; r.big.visible = false; r.small.visible = false; }
    },

    tick(dt, t, inst, out, on) {
      const r = inst.refs;
      if (!out) return;
      const alive = !!out.alive;
      if (alive) r.clock += dt;
      const c = r.clock % 3.0, burst = alive && c < 1.5;
      const home = (id) => { const p = inst.byId[id]; return !p || p.t < 0.02; }; // a piece that is out of the controller does not animate
      // rumble: weights spin, the controller shakes
      // the game only rumbles back when it notices a trigger squeeze, so a missing trigger magnet or sensor stills that side
      const targetL = burst && out.spinL && out.aL !== false ? 1 : 0, targetR = burst && out.spinR && out.aR !== false ? 1 : 0;
      r.spL += (targetL - r.spL) * Math.min(1, dt * 6); r.spR += (targetR - r.spR) * Math.min(1, dt * 6);
      r.spinners.forEach((s) => { if (home(s.id)) s.obj.rotation.x += dt * 38 * (s.S === 'L' ? r.spL : r.spR); });
      const amp = 0.04 * ((out.rumbleL ? r.spL : 0) + (out.rumbleR ? r.spR : 0));
      r.shaker.position.set(Math.sin(t * 75) * amp, 0, Math.cos(t * 61) * amp * 0.8);
      const n = (out.rumbleL ? 1 : 0) + (out.rumbleR ? 1 : 0);
      r.big.visible = burst && n === 2; r.small.visible = burst && n === 1;
      // the demo: buttons press one at a time, sticks wobble, triggers squeeze
      const step = Math.floor(r.clock / 0.45) % 4, ph = (r.clock % 0.45) / 0.45;
      const fOk = [out.fG, out.fR, out.fB, out.fY];
      r.btn.forEach((b, i) => { if (home('f' + 'GRBY'[i])) b.position.y = TOP + 0.04 - (alive && out.press && out.face && out.cb && fOk[i] && i === step && ph < 0.55 ? 0.07 : 0); });
      const dpo = alive && out.press && out.dpad ? Math.sin(r.clock * 3) * 0.12 : 0;
      r.dpad.rotation.set(dpo, 0, dpo * 0.5);
      // sticks wobble while the controller is on; with no spring they flop to one side and stay there
      const stk = (p, on2, sprOk, a, b, lean) => {
        if (!sprOk) p.rotation.set(0.42 * lean, 0, 0.3 * lean);
        else p.rotation.set(alive && on2 ? Math.sin(r.clock * a) * 0.25 : 0, 0, alive && on2 ? Math.cos(r.clock * a) * 0.25 : 0);
      };
      stk(r.pL, out.sL, out.rcL, 2.2, 0, 1); stk(r.pR, out.sR, out.rcR, 1.9, 0, -1);
      const sq = alive && burst ? 1 : 0;
      r.tL.rotation.x += ((out.tL ? (out.spL ? -0.35 * sq : -0.35 * (alive ? 1 : 0)) : 0) - r.tL.rotation.x) * Math.min(1, dt * 12);
      r.tR.rotation.x += ((out.tR ? (out.spR ? -0.35 * sq : -0.35 * (alive ? 1 : 0)) : 0) - r.tR.rotation.x) * Math.min(1, dt * 12);
      // bumpers tip in turn
      const bp = alive && Math.floor(r.clock / 0.9) % 2 === 0 && (r.clock % 0.9) < 0.3;
      r.bL.rotation.x += ((bp && out.bL && out.kL ? 0.22 : 0) - r.bL.rotation.x) * Math.min(1, dt * 14);
      r.bR.rotation.x += ((alive && !bp && Math.floor(r.clock / 0.9) % 2 === 1 && (r.clock % 0.9) < 0.3 && out.bR && out.kR ? 0.22 : 0) - r.bR.rotation.x) * Math.min(1, dt * 14);
    },
  });

  Object.assign(TAL.insideByName, {
    'Circuit board': 'pcb-inside', 'Main chip': 'chip-package', 'Case screw': 'screw-inside',
    'Face buttons': 'switch-inside', 'D-pad': 'switch-inside',
    'Bluetooth radio chip': 'chip-package', 'Voltage regulator': 'chip-package', 'Charging chip': 'chip-package', 'Motor driver chip': 'chip-package', 'Hall sensor': 'chip-package',
    'Capacitor': 'cap-plates', 'Resistor': 'resistor-inside', 'Diode': 'diode-inside', 'Status LED': 'led-package',
    'Bumper switch': 'switch-inside', 'Stick click switch': 'switch-inside',
    'Motor magnet': 'magnet-inside', 'Trigger magnet': 'magnet-inside', 'Armature coil': 'wire-inside', 'Battery wires': 'wire-inside',
    'Battery protection board': 'pcb-inside', 'Button contact board': 'pcb-inside',
  });
})();
