# Improvements checklist

The bar every view should meet:

- Pulling any piece visibly changes something, or says plainly that nothing changed and why.
- Every view has something to *do*, not just watch.
- Explanations go 3 to 5 levels deep, plain words first.
- Things look like the real material.
- Nothing is cut off or overlapping on an iPad.

Built from an audit of every part in all 3 devices (Advanced level) and all 29 inside views, plus a screenshot review of each one (2026-11-14).

## 1. Quick fixes (bugs and rough edges)

- [ ] Views with nothing to pull off (zinc atoms, copper atoms, LED atoms, silicon atoms, magnet, diode) show a lit "Put back" button. Hide Take apart when there is nothing removable.
- [ ] Old text still says "Tap the magnifying glass." Change it to "Tap Look inside" everywhere: copper strands, LED chip, LED die, chip die, silicon, and others.
- [ ] Labels are small and some collide or sit under the toolbar:
  - capacitor: "Rubber plug" is behind the toolbar;
  - chip die: the wiring-layer tags pile up;
  - speaker: "Metal post" and "Springy spider" overlap;
  - battery cutaway: "Steel can" and "Plus bump".
  - Raise the minimum label size on small screens and nudge tags apart, the way Look inside mode already does.
- [ ] Some views render small in the frame: color filter, polarizer, LED atoms. Tighten their cameras.
- [ ] The picture tube inside view is dark and hard to read. Add more light and a visible electron beam.
- [ ] In the dots-of-color view the beams are thin lines. Make them visible glowing beams that hit the dots.
- [ ] The floating Look inside badge can sit on top of the caption. Keep it clear of the caption box.

## 2. Every pull should teach something: the critical path

Your idea from today: some parts can go and the thing still works (the screws), and some tiny parts stop everything. Right now about 40 pulls change nothing and say nothing.

- [ ] For each part that isn't needed to work, add a "Still works!" line saying what it is *for* instead: holding, protecting, cooling, looks, safety.
  - **Tube TV:** channel knob, volume knob, wooden legs, screws, back cover, small capacitor, resistor.
  - **LED TV:** screws, stand, LED caps, front frame, standby light, power button, back cover, diode, resistor, light-messenger chip, safety capacitor, small capacitor, HDMI, USB and network ports, TV tuner, power chip.
  - **Flashlight:** lens, lanyard loop, pocket clip.
  - **Inside views:**
    - LED: clear cap.
    - Chip: heat paste, metal lid.
    - Chip die: cores, memory, picture maker, wiring.
    - Capacitor: metal can, rubber plug.
    - Speaker: dust cap.
    - Wire: inner coating, outer jacket.
    - Resistor: painted coat.
    - Fuse: glass tube.
    - Switch: spring.
    - Circuit board: green coat.
    - Polarizer: clear covers.
- [ ] Some of these should really break something. Pulling a chip core should slow or stop the picture, a missing heat-paste layer should make the chip overheat over time, and the power button and tuner should affect the TV. Wire those effects up rather than just explaining them.
- [ ] **Critical path mode:** a button that colors every part red (stops it working) or green (still works), so a kid can see the critical path at a glance. Then a "find the critical part" game.
- [ ] Count it: "You found 12 parts it can't live without, and 30 it can."

## 3. An experiment in every view

The liquid crystal's Electricity button (Off / Some / Full) with a "What you see" result works well. The engine now supports a dial for any view. Give each view one thing to change and one result to watch:

- [ ] **LED package / LED die:** a current dial. Brightness rises, and too much burns it out.
- [ ] **Resistor:** choose the colored bands and watch the bulb dim or brighten.
- [ ] **Fuse:** a current dial with a safe zone and a melt point. Show why the fuse saves the TV.
- [ ] **Transistor:** a gate voltage dial that opens the channel; show on and off as 1 and 0.
- [ ] **Chip die:** tap a core to switch it off and watch the picture slow down.
- [ ] **Capacitor:** charge and discharge. The plates fill with charge, and pulling the power lights a bulb briefly.
- [ ] **Speaker:** a pitch and volume dial. The cone moves faster or further, with sound.
- [ ] **Transformer:** a coil-turns dial. More turns give more output voltage and a brighter bulb.
- [ ] **Magnet:** heat it, a knock, or a fridge-magnet test that shows strength as the domains scramble.
- [ ] **Heat sink:** a workload dial. Without fins the chip overheats and the TV shuts off.
- [ ] **Diode:** a "flip the battery" button.
- [ ] **Switch:** press and hold, with a contact spark when it opens.
- [ ] **Wire / copper:** a thickness dial. A thin wire gets hot, and a thick one carries more.
- [ ] **Polarizer:** a rotate-the-sheet dial. Turn it 90 degrees and the blue light is blocked instead (the sunglasses trick).
- [ ] **Picture tube:** steer the beam yourself to draw on the screen.
- [ ] **Color filter:** mix your own color with three red, green and blue sliders.

## 4. Explanations

- [ ] About 60 parts have only one level of text, or none. Bring each to at least 3 levels:
  - **Fewest levels:**
    - LED TV panel layers (diffuser, brightness and prism films, both polarizers, pixel switches, liquid crystal, color filter);
    - speakers;
    - picture tube and guns;
    - capacitor plug and legs;
    - switch parts;
    - circuit board layers;
    - diode sides;
    - magnet ends;
    - screw head and point;
    - fuse caps.
- [ ] Give every inside view a "Tell me more" story on its intro. Only the two battery views have one today.
- [ ] One analogy per part, kept consistent across levels: sponge for a polarizer, staircase for liquid crystal, water tower for a capacitor, one-way door for a diode.
- [ ] **Check every fact with several models.** Have several independent models check each explanation against sources, and record what was verified. All the teaching text so far is model-written and unchecked.

## 5. Looks like the real thing

The battery got real materials today. Do the same everywhere:

- [ ] Picture tube glass, the phosphor glow and the electron beam.
- [ ] Circuit board: green solder mask, copper sheen, silkscreen text.
- [ ] Speaker: paper cone texture, rubber surround.
- [ ] Capacitor: aluminum foil and paper roll texture.
- [ ] Chip die: rainbow silicon shimmer.
- [ ] The tube TV's wood grain.

## 6. Making it a game a kid comes back to

- [ ] **Predict before you pull:** "What do you think will happen?" with 2 or 3 picture choices, then pull and see.
- [ ] **A parts collection book:** every part found gets a card with its picture, a one-liner and how deep you went. Badges for reaching the atom level on each device.
- [ ] **Quiz mode:** "Which part makes the colors?" Tap the right part.
- [ ] **Rebuild challenge:** put it back together in the right order.
- [ ] More missions: the broken-part missions exist for the TVs; add them for the flashlight and inside views.

## 7. More devices

The engine handles any device. Good next ones with kid appeal:

- [ ] TV remote: infrared light, buttons, battery.
- [ ] Game controller.
- [ ] Phone.
- [ ] Toaster: heating wire, thermostat.
- [ ] Electric toy car: motor and gears.
- [ ] Solar garden light: the solar cell down to atoms.
- [ ] Doorbell: electromagnet.

## 8. Still unverified

- [ ] Sound and speech on a real iPad.
- [ ] Smoothness on a real iPad, especially the LED TV at Advanced (266 parts).
- [ ] Watch a 5-year-old use it for 10 minutes and note where he gets stuck. That's the best checklist of all.
