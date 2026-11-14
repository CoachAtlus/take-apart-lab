# Take-Apart Lab

A 3D take-it-apart game for a 5-year-old. Pick a device, spin it around, tap parts to pull them out, and watch what breaks. A friendly voice explains each part. A "Fix-it mission" breaks one part; the kid reads the symptom and finds it.

Devices so far: Old Tube TV (CRT, 14 pieces), Flat LED TV (156 pieces), Flashlight (8 pieces).

Sparky, a talking robot, walks the kid through each device step by step: a glowing ring shows what to touch, an arrow shows which way to drag, and he nudges if nothing happens for a while.

## Play

- iPad: open the GitHub Pages link in Safari, tap Share, then **Add to Home Screen**. It opens full screen like an app and works offline after the first visit.
- PC: double-click `Play.bat` (opens `index.html` in your browser). No install, no server.
- Drag a part with a finger to pull it out (any direction works). Tap a pulled-out board to look closer and pick its pieces off.
- Needs internet the first time for the font; three.js falls back to `vendor/three.min.js` offline.
- Keys: `P` power, `C` channel, `X` x-ray, `Esc` back to devices.
- Link straight to a device with `index.html#crt-tv`, `#led-tv`, or `#flashlight`.

## How it's built

- `js/engine.js`: scene, camera, tapping, part animation, sound (all synthesized), speech, TV shows, particles, missions.
- `js/devices/*.js`: one file per device. Each calls `TAL.registerDevice({...})`.
- three.js r128 as a plain global (`THREE`), so it all works from `file://` with no build step.

## Add a device

1. Copy `js/devices/flashlight.js` (simplest) to a new file.
2. Add a `<script src="js/devices/your-device.js"></script>` line at the bottom of `index.html`.

A device is:

```js
TAL.registerDevice({
  id: 'radio', name: 'Radio', short: 'radio', subtitle: 'Shown on the start card',
  powerSound: 'click',              // 'crt' | 'flat' | 'click'
  channels: false,                  // true shows the Channel button
  screenStyle: 'crt' | 'flat',      // only if it has a screen; screenPart = id of the part that holds it
  view: { target: [0, 1.5, 0], radius: 4, explodedRadius: 6, explodedY: 2, yaw: -0.4, pitch: 0.25, shadow: [5, 3] },
  intro: 'Spoken when it opens.',
  shellSay: 'Spoken when the kid taps the non-removable case.',

  build(k) {                        // k = kit: box, cyl, sphere, torus, tube, board, screw, decal, screen, mat, metal, glass, glow, at, rot, group
    const root = k.group();
    // ...make meshes; add the parts' groups to root (or to a child group with no rotation)
    return {
      root,
      shell: [caseGroup],           // not removable; goes see-through with X-ray
      parts: [{
        id: 'battery', name: 'Battery', obj: batteryGroup,
        pull: [2, 0, 1],            // where it flies when pulled out (offset)
        blockedBy: ['cover'],       // must be removed first
        kind: 'screw',              // optional: unscrew animation
        xray: true,                 // optional: goes see-through with X-ray (covers)
        noSpark: true,              // optional: no sparks when pulled while on (plugs, cables)
        parent: 'board',            // optional: this piece sits on another part (its obj is nested in the parent's obj)
        reach: ['cover'],           // on a parent: what blocks touching its pieces while it's still in (default: blockedBy)
        face: [0, 0, -1],           // which way the part faces, so "look closer" turns it toward you
        focusRadius: 1.4,           // how close "look closer" zooms
        breaksAlways: true,         // say the `breaks` line even if nothing visible changes
        say: 'What it is, for a 5-year-old.',
        breaks: 'What stops working if you pull it while it is on.',
        fact: 'The "Tell me more" line.',
        symptom: 'If set, this part can be the broken one in a Fix-it mission.',
      }],
      screen,                       // from k.screen(...), optional
      refs: {},                     // anything apply() needs
    };
  },

  // has(id) is false when a part is pulled out (or is the mission's broken part).
  evaluate(has, on) {
    return { alive: on && has('battery'), reason: 'Spoken if it will not turn on', screen: { mode: 'picture' }, sound: { show: true } };
  },

  apply(out, inst) { /* optional: light LEDs, show beams, etc. from out */ },
  tick(dt, t, inst, out) { /* optional: per-frame animation */ },

  // Sparky's walkthrough. Steps: power, remove {ids}, removeAny {ids}, turn {side:'back'}, focus {id}, end.
  guide: [
    { do: 'power', say: 'Press the green power button.', nudge: 'Said again if nothing happens for a while.' },
    { do: 'remove', ids: ['cover'], say: 'Pull off the back cover.' },
    { do: 'end', say: "Now you're the boss!" },
  ],
});
```

Screen modes: `off`, `black`, `picture`, `snow`, `dot`, `nosignal`, `white`, plus `glitch`, `gray`, `invert`, `hotspots`, `deadCols` (column indexes of 4), `darkRows` (row indexes of 5, from the bottom) and `dim` (0 to 1). Sound: `show`, `hiss`, `left`, `right`.

The LED TV (`js/devices/led-tv.js`) is the worked example of a big device: board builders, nested pieces, role-based breakage.

Ideas for next devices: radio, desk fan, game controller, toaster, phone, keyboard.
