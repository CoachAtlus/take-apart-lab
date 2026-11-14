/* Deeper "tell me more" levels for parts that only had one or two, plus "Still works!" jobs and device intro stories.
 * TAL.deep[name]   replaces a part's levels when longer (level 1 is the part's own `say`, these are 2 and up).
 * TAL.introMore[id] is the "tell me more" story on a device's opening line.
 * TAL.jobs[name]   is what a not-needed part is FOR, said after "Still works!" when you pull it. */
TAL.deep = Object.assign(TAL.deep || {}, {

  // ---------- tube TV
  'Channel knob': [
    "Turning this knob changes which show you see. It works like the dial on a radio.",
    "Lots of shows are sent through the air at once, each one on its own spot, like stations on a radio. The knob tells the tuner which spot to listen to and which ones to ignore.",
    "Each channel is sent on its own band of radio waves, called a frequency. Turning the knob changes a circuit inside the tuner so that only the waves from one band get through.",
  ],
  'Wooden leg': [
    "The legs hold the TV up, like the legs of a table.",
    "An old tube TV is very heavy because of the thick glass tube. Legs spread that weight out so the TV does not wobble or sink into the rug.",
    "Wood is cheap, strong and does not carry electricity well, so it is a good choice for feet. The TV still works with no legs, it just sits lower.",
  ],
  'Picture tube': [
    "The picture tube is a big glass bottle with all the air taken out. The front of the bottle is the screen. Inside, it is painted with tiny dots that glow.",
    "At the back of the bottle, the gun shoots electrons. They fly through the empty space and hit the dots. Wherever they hit, a dot glows, like a tiny light turning on.",
    "The air is pumped out because electrons would bump into the air and never reach the screen. The glass has to be thick, because the air outside pushes hard on an empty bottle.",
    "The beam sweeps across the screen one line at a time, from the top to the bottom, about 60 times every second. It goes so fast that your eyes blend all the glowing dots into one picture.",
  ],
  'Red gun': [
    "Inside the tube there are three guns, side by side, one for each color. They are like three spray cans, and each one can only paint its own color.",
    "The red gun's electrons only land on the red dots. A metal sheet with tiny holes sits in front of the screen, and it makes sure of that. The beam reaches each hole from a different angle, so each gun hits its own color.",
    "More electrons make a brighter red dot, and fewer make a dimmer one. The signal tells the gun how many to shoot at each spot. When red, green and blue all glow together, you see white.",
  ],
  'Green gun': [
    "Inside the tube there are three guns, side by side, one for each color. They are like three spray cans, and each one can only paint its own color.",
    "The green gun's electrons only land on the green dots. A metal sheet with tiny holes sits in front of the screen, and it makes sure of that. The beam reaches each hole from a different angle, so each gun hits its own color.",
    "More electrons make a brighter green dot, and fewer make a dimmer one. When the red and green dots glow together, your eyes see yellow.",
  ],
  'Blue gun': [
    "Inside the tube there are three guns, side by side, one for each color. They are like three spray cans, and each one can only paint its own color.",
    "The blue gun's electrons only land on the blue dots. A metal sheet with tiny holes sits in front of the screen, and it makes sure of that. The beam reaches each hole from a different angle, so each gun hits its own color.",
    "More electrons make a brighter blue dot, and fewer make a dimmer one. If all three guns shoot nothing at a spot, that spot stays dark, and you see black.",
  ],

  // ---------- both TVs
  'Screw': [
    "A screw is like a tiny staircase wrapped around a nail. When you twist it, it climbs into the wood or metal and pulls things together.",
    "The ridge that winds around the screw is called the thread. It is a ramp that curls around the screw. The head is the part you turn, and it also stops the screw from going all the way through.",
    "A small twist moves the screw only a tiny bit forward, so the ramp gives you a big squeeze with a small push. The thread also rubs hard against the hole, and that rubbing keeps the screw from coming loose.",
  ],
  'Back cover': [
    "The back cover is like the lid on a box. It keeps fingers and dust away from the parts inside.",
    "It is usually made of plastic, and it is held on with screws or snap tabs. It has slots near the top so warm air can escape and the parts stay cool.",
    "Some parts inside a TV carry strong electricity, so the cover keeps people safe from them. It also keeps out dust, which can build up like a blanket and make parts too hot.",
  ],

  // ---------- LED TV
  'Stand': [
    "The stand holds the TV up, like the feet of a table.",
    "A flat TV is thin and tall, and most of its weight is up high in the screen. The stand has wide feet so the TV does not tip over.",
    "The stand is held on with screws at the back. Many TVs also have four holes on the back so you can hang them on a wall instead.",
  ],
  'Diffuser film': [
    "This thin sheet is like a frosted bathroom window. You can see that light is coming through, but you cannot see where it started.",
    "It is a thin sheet of plastic with a bumpy, frosted surface. It smooths out the last bright spots that the thick diffuser plate left behind.",
    "Each little bump bends the light a different way, so the beams mix together. If the light were not even, you would see blotches behind the picture.",
  ],
  'Brightness film': [
    "This sheet works like a mirror for light that is going the wrong way. It sends that light back so it can try again, so nothing is wasted.",
    "The panel in front can only use light that wiggles in one direction. This sheet lets that light through and bounces the rest back toward the shiny sheet at the back.",
    "The bounced light gets scrambled by the reflector and sent forward again, and some of it now wiggles the right way. In many TVs this recycling makes the screen noticeably brighter without using more electricity.",
  ],
  'Prism film': [
    "This sheet has tiny ridges, like a mountain range. They turn the light so that it points straight at you, instead of off to the sides.",
    "Each ridge is a tiny prism shaped like a little roof. Light that is heading sideways hits the slanted side and bends toward the front.",
    "A prism works because light bends when it goes from one see-through material into another. Some TVs stack two of these sheets with the ridges running in different directions, so the light is aimed both up-and-down and side to side.",
  ],
  'Back polarizer': [
    "Light wiggles in every direction. The polarizer is like a fence with up-and-down slits. Only the wiggles that line up with the slits can get through.",
    "A rope shaken in every direction can only get through the fence when it is shaken up and down. So after the back polarizer, all the light wiggles the same way.",
    "It is made from a stretched plastic film, where long molecules are all lined up in one direction. They soak up the light that wiggles one way and let the rest pass.",
    "The front polarizer sits at the other end, turned sideways. By itself, it would block all of this light. The liquid crystal in between twists the light so some of it can get out.",
  ],
  'Front polarizer': [
    "This is the second fence. It is turned sideways to the first one, so light that came straight through the first fence cannot get through this one unless something twists it.",
    "Polarized sunglasses work the same way. Glare bouncing off water or a road wiggles mostly sideways, and the sunglasses have a fence that blocks it.",
    "The liquid crystal twists the light by different amounts at every dot. A dot with a full twist lets all its light through, and a dot with no twist stays dark. That is how each dot gets its brightness.",
    "Try it at home. Look at a phone or a laptop screen through polarized sunglasses, then tilt your head. On many screens the picture fades to dark when the fences line up the wrong way.",
  ],
  'Pixel switches': [
    "Behind every dot on the screen there is a tiny switch, like a little faucet. It decides how much light that dot lets through.",
    "The switches are laid out in rows and columns of thin wires, like a city map. To change one dot, the TV sends a signal down its row and its column, and its switch opens and holds that setting.",
    "These switches are tiny transistors painted onto the glass in very thin layers. A 4K screen has about 8 million dots, and each dot has three colored parts, so there are about 25 million switches.",
    "The TV rewrites every dot many times a second, usually 60 times or more. That is how a moving picture can change smoothly.",
  ],
  'Liquid crystal': [
    "The liquid crystal is a very thin layer of a special liquid. Think of a spiral staircase that light can slide down. The staircase twists the light as it goes.",
    "In many screens, with no electricity the tiny rod-shaped molecules stack up like a spiral staircase and twist the light, so it can get through the front fence. Electricity makes the staircase stand straight up, and then the light is not twisted and the front fence blocks it.",
    "The twist does not have to be all or nothing. A little electricity straightens the staircase part of the way, so only some light gets through. That is how each dot can show shades from dark to bright.",
    "It is called a liquid crystal because it flows a bit like a liquid, but its molecules still stay in order a bit like a crystal. The layer is thinner than a human hair.",
  ],
  'Color filter': [
    "The color filter is like a sheet of tiny colored glass. Each dot has a little red, green or blue window.",
    "Three little windows, red, green and blue, sit side by side to make one dot of the picture. They are so small that your eyes mix them together, like the tiny dots in a painting.",
    "The light from behind is white. Each window blocks all of it except its own color. The liquid crystal decides how much goes through each window. Red and green together look yellow, and all three together look white.",
    "Filters soak up a lot of the light that hits them. That is one reason a TV needs such a bright backlight.",
  ],
  'Front frame': [
    "The frame is like the crust of a sandwich. It holds all the thin layers together.",
    "The layers inside are thin and floppy. The frame squeezes them flat and keeps them lined up, and it hides the edges of the panel.",
    "The frame is also the part you see around the screen. It can hold a few small things, like the remote sensor, the standby light and the power button, and it keeps dust out of the layers.",
  ],
  'Power button': [
    "This is the power button on the TV itself. It is for when the remote is lost in the couch.",
    "On most TVs it does not cut off all the electricity. It sends a message to the brain that says wake up or go to sleep. That is why the little standby light can stay on.",
    "A sleeping TV is still listening a tiny bit, so the remote can wake it. The button and the remote both send the same kind of message.",
  ],
  'Speaker plug': [
    "This plug connects the speaker to the board, like plugging headphones into a phone.",
    "The plug has little metal pins that press against metal contacts. That lets the sound signal pass through, and it lets someone swap the speaker without any tools like a soldering iron.",
    "The board sends the sound as a tiny electric signal that moves back and forth, over two wires. The plug keeps those wires snug, so the sound stays clear.",
  ],
  'Left speaker': [
    "This speaker plays the sound for the left side, like your left ear.",
    "Two speakers make stereo sound. The left and right can play slightly different things, so a car on the screen can sound like it zooms from one side to the other.",
    "Inside, a cone wiggles back and forth and pushes the air, like a paddle in a pool. A magnet and a coil of wire make it move, and the air carries the sound to your ears.",
    "Sound is waves of squeezed air. The faster the cone wiggles, the higher the note. The farther it moves, the louder the sound.",
  ],
  'Right speaker': [
    "This speaker plays the sound for the right side, like your right ear.",
    "Two speakers make stereo sound. The left and right can play slightly different things, so a car on the screen can sound like it zooms from one side to the other.",
    "Inside, a cone wiggles back and forth and pushes the air, like a paddle in a pool. A magnet and a coil of wire make it move, and the air carries the sound to your ears.",
    "Sound is waves of squeezed air. The faster the cone wiggles, the higher the note. The farther it moves, the louder the sound.",
  ],

  // ---------- flashlight
  'Rubber ring': [
    "This is a squishy ring, like a soft hug. It fills every tiny gap so water cannot sneak in.",
    "When you screw the parts together, the ring gets squeezed into a snug groove. It fills the gap between the two parts so water and dust cannot get past.",
    "Rubber is springy, so it keeps pushing back against what is squeezing it, and that pushing is what makes the seal tight. A fridge door has a seal that works the same way.",
  ],
  'Button cap': [
    "This is the soft part of the button that your thumb pushes.",
    "It is made of rubber, so it bends when you press and springs back when you let go. It also covers the hole, so water and dust stay out.",
    "Under the cap, pressing pushes the switch contact down until two bits of metal touch. That closes the loop and the light comes on.",
  ],
  'Battery label': [
    "The label is a wrapper, like the paper around a candy bar. Under it is the metal can that holds the battery's stuff.",
    "It is a thin plastic wrapper with printing on it. It tells you what kind of battery it is and which end is plus and which is minus.",
    "The metal can carries electricity at one end, so the wrapper also keeps the can from touching other metal by accident. That is how you avoid a short circuit.",
  ],
  'End cap': [
    "The end cap is the lid at the bottom. Twist it off to get to the batteries.",
    "It screws on with threads, like a jar lid. It holds the batteries inside, and a spring helps press them together.",
    "In many flashlights the cap and the metal tube also help carry the electricity back to the light. Screwing the cap on tight makes a better connection.",
  ],
  'Lanyard loop': [
    "This little loop is for tying a string, like the handle on a bag.",
    "A lanyard is a loop of cord. You can hang the flashlight from your wrist so it does not fall when you let go.",
    "The loop does nothing for the light. It just makes the flashlight easier to carry and harder to lose in the dark.",
  ],
  'Pocket clip': [
    "The clip works like a clothespin. It holds the flashlight to your pocket or backpack.",
    "It is a strip of springy metal. You bend it open to slide it over the cloth, and it springs back and pinches tight.",
    "Springy things bend a lot and then go back to their shape. The spring inside the flashlight that pushes on the batteries uses the same idea.",
  ],
});

TAL.introMore = Object.assign(TAL.introMore || {}, {
  'crt-tv': [
    "The big idea is that a tube TV paints a picture with a tiny beam. Inside the glass, a gun shoots invisible electrons at the back of the screen. Wherever they land, a tiny dot glows.",
    "The beam sweeps across the screen one line at a time, from the top to the bottom, about 60 times every second. Coils steer it, like invisible hands. It is so fast that your eyes see one whole picture.",
    "The screen is covered with tiny dots of red, green and blue. There is one gun for each color, so mixing the three makes every color you see. The signal from the antenna says how strongly to shoot at each spot.",
    "The tuner picks the channel, the chips sort out the colors and the sound, and the speaker plays the sound. The tube needs thousands of volts, far more than the wall outlet, so a part called the flyback makes it. That is why you never open a real TV with the plug in.",
  ],
  'led-tv': [
    "The big idea is that this TV is a bright light with millions of tiny windows in front of it. Each window can open, half open or close, to let through the right amount of light.",
    "At the back are lots of little LED lights. The layers in front of them spread the light out evenly and aim it at you.",
    "The windows are made from the liquid crystal between two fences, called polarizers. A tiny switch at every dot twists the light a little or a lot. A red, green or blue filter colors it, and three colored dots make one dot of the picture.",
    "The main board is the brain. It picks the channel or app, works out the picture and the sound, and tells the screen what to do. The power board changes wall electricity into the gentle kind the TV can use.",
  ],
  'flashlight': [
    "The big idea is that electricity only flows in a loop. The battery pushes it, and it has to go all the way around and come back, or nothing happens.",
    "The electricity goes from the battery, through the metal parts and the switch, to the light, and back to the battery. When the switch is off, there is a gap in the loop. The electricity cannot jump across the gap, so the light stays off.",
    "The light is an LED. It is a tiny chip that glows when electricity flows through it the right way. It makes much less heat than an old glowing bulb. The shiny cup behind it bounces the light forward into a beam.",
    "The LED needs a good push to light up, a few volts for a white one. Batteries in a row add their push together, which is why a flashlight often uses more than one.",
  ],
});

TAL.jobs = Object.assign(TAL.jobs || {}, {
  // tube TV and shared
  'Channel knob': "It only changes the channel, so the TV keeps showing the one it was on.",
  'Volume knob': "It only sets how loud the sound is.",
  'Wooden leg': "It only holds the TV up off the floor.",
  'Screw': "It only holds parts together, like a tiny clamp.",
  'Back cover': "It only keeps fingers and dust away from the insides.",
  'Small capacitor': "It only smooths out tiny bumps in the electricity, so it is a helper.",
  'Resistor': "It only slows the electricity a little to keep other parts safe.",
  // LED TV
  'Stand': "It only holds the TV up so it does not tip over.",
  'LED cap': "It only shapes the light so it spreads out wide.",
  'Front frame': "It only holds the layers in place and makes the TV look neat.",
  'Standby light': "It only shows that the TV is asleep. It does not run the TV.",
  'Power button': "It is a backup way to turn the TV on and off. The remote can do that too.",
  'Diode': "It is a one-way door for a small side job, not the main path of the power.",
  'Light messenger chip': "It only passes a safety message by light, so the strong side and the gentle side stay apart.",
  'Safety capacitor': "It only keeps electrical noise from leaking out, so it is there for safety.",
  'HDMI port': "It only lets a game box or streaming box plug in. The TV can still show other things.",
  'USB port': "It only lets you plug in a memory stick.",
  'Network port': "It only lets an internet cable plug in. Wi-Fi can do that job too.",
  'TV tuner': "It only picks up channels from an antenna. Apps and boxes come in another way.",
  'Power chip': "It is a helper that smooths the power for the brain chips.",
  // flashlight
  'Lens': "It only protects the light and helps shape the beam.",
  'Lanyard loop': "It only gives you a place to tie a string, so you do not drop it.",
  'Pocket clip': "It only holds the flashlight to your pocket.",
});
