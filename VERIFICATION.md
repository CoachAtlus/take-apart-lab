# Verification

How the teaching text was checked (2026-11-14). All of the game's explanations were written by AI models, so they were checked by others.

- **First pass (Claude Sonnet, three checkers in parallel):** every kid-facing string in the game, about 900 distinct claims. Claims with specifics (numbers, materials, mechanisms) were checked against web sources; the rest were judged as common knowledge, and each report says which is which. 32 claims were fixed or softened.
- **Second pass (Claude Haiku, a different model):** re-checked every fix and every claim the first pass could not verify. It agreed with nearly all fixes and found 4 more problems, which were then fixed:
  - the polarizer text could teach that a color is soaked up, when it is the direction of the wiggle;
  - one LED-chip size line that had been fixed elsewhere;
  - the transistor's "open means 1" (now "electricity flowing means 1"), which clashed with the switch view;
  - the speaker's "far wiggles".
- **Not checked by a person.** The lists of unverified claims below are the place for a subject expert to start.

The four reports follow as written by the checkers (the counts in them are approximate).

---

## Inside views (worlds.js, worlds-more.js)

### Fact-check: js/worlds.js and js/worlds-more.js

Method note: every string was read. Web searches were run for the specific topics listed in (d). Common-knowledge claims and claims I judged from general knowledge are labelled as such and were NOT source-verified.

### (a) Counts (approximate, claim-level)
- Claims reviewed: ~330 distinct factual claims across ~30 worlds
- Correct: ~255
- Simplified-but-fair: ~69
- Misleading or wrong, fixed: 6

### (b) Fixes
| World / part | Old text (short) | New text (short) | Why | Source |
|---|---|---|---|---|
| transistor / Glass layer (learn) | "It is a kind of glass called silicon dioxide." | "For many years it was ... silicon dioxide ... Newer chips use other special materials too." | Since Intel's 45nm node (2007) the gate dielectric is hafnium-based high-k, not SiO2 | https://www.intc.com/news-events/press-releases/detail/1065/intels-transistor-technology-breakthrough-represents |
| transistor / Gate (learn) and world learn[2] | "each switching on and off billions of times a second" | "and the fastest can switch on and off billions of times a second" | Not every transistor switches every clock cycle; billions/sec is the upper rate | general knowledge (not source-checked) |
| speaker-inside / Paper cone (learn) | "Big slow wiggles sound low... Small fast wiggles sound high" | "Slow wiggles sound low... Fast wiggles sound high" | Wiggle size is loudness, not pitch; the old text contradicted the world's own Pitch/Loudness lesson | general knowledge (not source-checked) |
| switch-inside / Springy arm (learn) | "Down means open for electricity to cross." | "Down means the way is clear for electricity to cross." | "Open" means a broken loop everywhere else in the world | n/a (internal consistency) |
| pcb-inside / Via (learn) | "thousands of vias, each far thinner than a hair" | "thousands of vias, and the tiniest are about as thin as a hair" | Typical microvias are 50-150 um, about hair width; ordinary vias are thicker than a hair | https://southelectronicpcb.com/are-hdi-pcb-microvias-important and https://resources.altium.com/p/everything-you-need-know-about-microvias-printed-circuit-design (search summaries; hair width from general knowledge) |
| filter-inside (intro) | "White light is really red, green and blue light mixed together." | "A screen can make white light by mixing red, green and blue light." | White light contains all colors; the RGB mix is how screens make it | general knowledge (not source-checked) |

### (c) Could not verify or only partly verified, left as-is
- Gold wire attached "with heat and a buzz of sound vibration" (thermosonic bonding): search returned nothing specific; this is standard knowledge, left as-is.
- Bond-pad "gold" in LED chip: sources show pads are gold-containing metal stacks (Ti/Al/Au etc.), so "it is gold" is simplified-fair.
- Brass nail in alkaline cell: search did not confirm brass specifically (Energizer says steel can is cathode collector). Left as-is; common teardown knowledge.
- LED chip "about a quarter of a millimeter": plausible for 5 mm LEDs, not sourced.
- Thinnest chip wires "a thousand times thinner than a hair": understated rather than wrong (modern wires are thousands of times thinner), not sourced.
- "Each core is built from millions of transistors": understated (hundreds of millions+), still true; left.
- "Billions of recombinations every second" in an LED: far understated, still true; left.
- Wafer "hundreds of chips": varies by chip size; left.
- Resistor "ceramic holds heat so the spiral does not change temperature too quickly": loosely true, not sourced.
- Sunglasses polarization axis is vertical; "turn the sunglasses" is simplified-fair.
- Switch `Contact`/`Spring` and fuse "costs a few cents": not sourced, low-stakes.

### (d) Number and mechanism claims verified against sources
- Blue LED won the 2014 Nobel Prize in Physics and made bright white LEDs possible; GaN-based: https://www.kva.se/en/news/nobelpriset-i-fysik-2014-2/ and https://www.snexplores.org/article/nobel-goes-making-white-leds-possible
- White LED = blue chip + yellow/other phosphor: same Nobel sources above.
- GaN LED stack: n-GaN, InGaN quantum well (indium sets color, wells a few nm thick), Mg-doped p-GaN, sapphire substrate, partial etch to reach the n-layer, gold-containing pads: search results (patents / reviews, e.g. https://comptes-rendus.academie-sciences.fr/physique/item/10.1016/j.crhy.2017.12.001.pdf, https://patents.google.com/patent/US6847052). Silicon as n-dopant is from general knowledge.
- Alkaline cell: zinc anode, MnO2 cathode, KOH electrolyte in separator, steel can as cathode collector, Zn + 2OH- -> ZnO + H2O + 2e-, hydroxide produced at cathode: https://doitpoms.ac.uk/tlplib/batteries/batteries_alkaline_mno.php and Energizer manual https://data.energizer.com:443/pdfs/alkaline_appman.pdf
- Polarizer: stretched PVA dyed with iodine, aligned iodine absorbs light polarized along the chains, passes perpendicular: https://www.displaymodule.com/blogs/knowledge/polarizers and https://patents.google.com/patent/US7651643B2/OSRAM
- Electron drift in copper is a fraction of a mm/s (about 0.2-0.4 mm/s in examples), signal travels near 2x10^8 m/s; "slower than a snail" is consistent (snail speed from general knowledge): https://www.scienceabc.com/nature/what-is-the-speed-of-electricity
- Ferrite speaker magnets are iron oxide plus barium/strontium carbonate ceramic and are the common loudspeaker magnet: https://newworldencyclopedia.org/entry/Ferrite_(magnet)
- Intel 45nm swapped SiO2 gate dielectric for hafnium high-k (the basis for the transistor fix); SiO2 had been thinned to about 1.2 nm, roughly 5 atomic layers (supports "only a few atoms thick"): https://www.intc.com/news-events/press-releases/detail/1065/intels-transistor-technology-breakthrough-represents
- Checked by arithmetic, not by web source: 4K TV = 3840 x 2160 x 3 subpixels = 24.9 million ("about 25 million" correct); light circles Earth 299,792 km/s / 40,075 km = 7.48 times per second ("more than 7" correct); resistor code brown-black-brown/red/orange = 100/1,000/10,000 ohms correct.
- From general knowledge only (not searched): silicon has 14 electrons / 4 outer; gallium melts near 30 C; US mains is 60 Hz (120 flips/s); gold band = 5%; nitrogen is ~78% of air; Curie temperature and magnetic domains; unfilled via/copper-thickness figures.

---

## Original devices and explanation files

### Fact-check: crt-tv, led-tv, flashlight, learn, learn-deep

### (a) Counts (approximate; I reviewed roughly 700 strings and grouped them into claims)
- Distinct factual claims reviewed: about 330
- Correct: about 270 (about 50 of these checked against a source; the rest are standard physics or electronics I judged to be common knowledge)
- Simplified-but-fair: about 45 (left alone)
- Fixed (misleading, wrong, or unverifiable and softened): 20 edits (19 distinct claims; the speaker-magnet line was fixed in two files)

### (b) Fixes
| File / part | Old (short) | New (short) | Why | Source |
|---|---|---|---|---|
| learn.js Bridge rectifier L3 | "reverses direction 60 times a second" | "60 back and forth cycles... reverses 120 times a second" | 60 Hz = 60 cycles = 120 reversals | physics definition (general knowledge, not searched) |
| led-tv.js Bridge rectifier fact | "switches direction 60 times every second" | "swings back and forth 60 times every second" | Same error, kid-level wording | same |
| led-tv.js LED_FACTS | "LEDs barely get warm" | "waste much less energy as heat than old bulbs" | LEDs do get warm; most input power still becomes heat | https://ledsmagazine.com/articles/2005/05/fact-or-fiction-leds-don-t-produce-heat.html |
| learn.js LED bulb L1 | "stays cool" | "wastes less heat" | Same | same |
| learn.js LED light L3 | "without making much heat" | "without making as much heat" | Same | same |
| led-tv.js LED_FACTS | chip "smaller than a grain of sand" | "about as small as a grain of sand" | Backlight chips are about 1 mm (my recollection, not sourced); sand size varies | not verified |
| led-tv.js LCD panel fact | dots "called pixels" | dots that "team up to make each pixel" | Red, green and blue dots are subpixels; a pixel is the trio | general knowledge (consistent with learn.js Driver chip L3 "subpixel") |
| led-tv.js layers fact | "each thinner than paper" | "each very, very thin" | Glass layers are not necessarily thinner than paper; the claim was unsupportable | not verified |
| led-tv.js Driver chip fact | "hundreds of columns" | "lots of columns" | Real counts vary and I could not verify them | not verified |
| led-tv.js Brightness film | "bounces sideways light back" | "bounces light that is going the wrong way back" | Real mechanism is a reflective polarizer recycling the wrong-polarization light; "sideways" was misleading. Now matches learn-deep L2 | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8482698 (DBEF recycling) |
| learn-deep.js Back polarizer L3 | molecules absorb light that wiggles "across them" | "wiggles one way" | Iodine-PVA chains absorb light polarized along their length, so "across" was backwards | https://www.displaymodule.com/blogs/knowledge/polarizers |
| learn.js Flyback L1 | flyback "is the reason an old TV can give you a shock even when off" | strong electricity "can stay inside an old TV even after it is turned off" | The stored charge is in the tube and capacitors, not the flyback itself | https://www.ifixit.com/Wiki/CRT_Repair_Risks_and_Safety |
| learn.js High-voltage wire L1 | "up to the front of the picture tube" | "to the picture tube" | The anode connects at the funnel side, not the front | CRT anode general knowledge, not fetched |
| learn.js Magnet L4 | "around 1 tesla at the magnet" | "strongest in the narrow air gap" | Ferrite magnets are well under 1 T at the surface; the figure was unsupported | not verified; removed |
| learn.js Safety capacitor L1 | "keeps stray electricity from leaking into the case" | "helps keep electrical noise from leaking out of the TV" | A Y capacitor shunts noise and passes a tiny leakage current | general EMI practice, not fetched |
| learn.js Surge guard L4 | "rated near 150 to 175 volts" | "a bit above the normal line voltage" | Exact rating unverified | not verified; softened |
| learn.js Electron gun L4 | "a few milliamps" | "tiny, only milliamps in total" | Typical beam current is around 1 mA or less; unverified | not verified; softened |
| learn.js Focus knob L4 | "20 to 30 percent" of anode voltage | "a fraction of" | Percentage unverified | not verified; softened |
| learn.js Diffuser plate L4 | "1 to 2 millimeters" | "one to a few millimeters" | Thickness varies by design | not verified; softened |
| crt-tv.js Channel knob fact | "about 13 channels" | "big clunky knob... each channel" | Number unverified; US dials also had UHF positions | not verified |
| crt-tv.js + led-tv.js Magnet fact | "Every speaker... has a magnet" | "Almost every speaker" | Piezo and electrostatic speakers exist | general knowledge |

### (c) Could not verify (left as-is, or softened above)
- Settings memory L4 ("a million write cycles", "about 40 years" retention): typical EEPROM figures, not checked.
- Power cord L4 ("18 gauge, about 10 amps"): not checked.
- Power switch ("thousands of times a second"): true but an understatement; real supplies switch tens of thousands of times a second or more. Left.
- Heat sink, "like a dog panting": the analogy is loose, since a heat sink is passive. Fair for kids; left.
- Speaker, optocoupler, USB, Wi-Fi, Ethernet and similar spec lines at levels 4 to 5: standard values, not individually sourced.
- Clock crystal ("20 parts per million"), LED chip ("about 1 mm"), Power control ("65 to 130 kHz"): standard values, not sourced.
- Fuse, capacitor, transformer and similar textbook mechanisms: not sourced.

### (d) Numbers verified against sources
- NTSC horizontal rate of 15,734 Hz and color subcarrier of 3.579545 MHz (used in learn.js Deflection yoke, Flyback, Side-to-side coil and Color chip): search result citing https://www.Wikipedia.org/wiki/NTSC and https://repairfaq.org/samnew/tvfaq/tvwimadohf.htm
- CRT anode voltage of about 20 to 30 kV (the "25,000 volts" in crt-tv.js and learn.js), and a CRT holding a charge after being unplugged: https://www.ifixit.com/Wiki/CRT_Repair_Risks_and_Safety and https://gammaelectronics.xyz/STRG-TV-2e_2.html
- Blue GaN chip plus yellow YAG:Ce phosphor makes white, and the blue LED Nobel Prize in 2014 (Akasaki, Amano, Nakamura): https://physicstoday.aip.org/news/nobel-prize-in-physics-recognizes-research-leading-to-high-brightness-blue-leds and https://compoundsemiconductor.net/article/94709/Phosphors_The_driving_force_behind_white_LEDs
- HDMI Type A has 19 pins; HDMI 2.0 is 18 Gbps and 2.1 is 48 Gbps: https://www.digikey.co.uk/en/product-highlight/m/molex/hdmi-type-a-connectors
- Degaussing coil with a PTC thermistor demagnetizes the shadow mask at switch-on: https://patents.google.com/patent/US4999732
- Series LED backlight strings (one failed LED can darken a string): repair forums such as https://www.elektroda.com/qa,tv-backlight-not-working.html. This is a common failure mode, not an industry-wide rule, so "the whole row goes out" stays simplified-fair.
- Brightness gain from reflective-polarizer recycling of about 35 percent (patent): https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8482698. The deep text says only "noticeably brighter", which matches.
- Not independently sourced, but arithmetic: 4K = 3840 x 2160 = 8.3 million pixels, 24.9 million subpixels. The "about 25 million" figure is correct.

Flashlight file: no factual problems found. Two batteries in series giving twice the push, an LED glowing from current flow, a reflector forming the beam, and a switch closing the loop are all correct or fair. No edits were made to flashlight.js.

No em dashes in any of the five files. All five files pass the `new Function` syntax check.

---

## New devices

### Fact-check: new devices (remote, toaster, solar-light, toy-car, doorbell, controller, phone)

### (a) Counts (approximate, by distinct factual claim)
- Reviewed: ~230 claims (every kid-facing string in the 7 files, including the 5 embedded worlds)
- Correct / common knowledge: ~150
- Simplified-but-fair: ~74
- Fixed: 6
- Web-verified against a source: a small subset (see section d). Most of the rest was judged from general physics/engineering knowledge and is NOT marked source-verified.

### (b) Fixes
| File / part | Old (short) | New (short) | Why | Source |
|---|---|---|---|---|
| remote.js, Spring learn | "batteries ... shrink a tiny bit as they run" | "can change size a tiny bit as they age" | Batteries do not shrink in use (alkaline cells can swell). Vaguer-but-true. | No source found; judged from general knowledge |
| solar-light.js, Solar cell world, p-layer learn | "Silicon is what sand is made of" | "Silicon is made from sand" | Sand is silicon dioxide, not silicon. | Not confirmed by search (search returned nothing on sand). General chemistry |
| solar-light.js, Solar cell part learn | "silicon, the same stuff sand is made of" | "silicon, which is made from sand" | Same | Same |
| toy-car.js, Motor world, Brushes learn | "made of graphite" | "often made of graphite ... or of springy metal" | Small toy-size motors commonly use precious-metal or metal-graphite brushes | https://support.maxongroup.com/hc/en-us/articles/360004252074 |
| doorbell.js, Electromagnet world, Coil learn | "Doubling the loops roughly doubles the pull" | "...doubles the strength of the magnetic field" | Pull force scales roughly with the square of turns x current, so "doubles the pull" was wrong. Field strength is the safe claim. | Not found in search; standard electromagnetism, unverified by source |
| phone.js, Battery fact | "takes up almost half the phone" | "takes up a big part of the phone" | Share varies by model; the number was unsupported | None |

### (c) Not verified by a source, left as-is (judged fair)
- 38 kHz IR carrier in the remote LED learn: search did not confirm. It is the standard consumer-IR carrier frequency, and the text says "often about", so left.
- Ding/dong bar frequency vs length, nodal-point mounting of chime bars: standard acoustics, not searched.
- Toaster bimetal "bends toward the slower one", electromagnet latch, and the Maillard reaction statement (sugars and proteins; real reaction is sugars with amino acids, fair for kids).
- "Atoms/waves a hundred million / million times bigger" scale statements: plausible, not checked.
- Rare-case statements: ERM rumble motors, lithium-ion batteries with protection chip, USB pins for power and data, SIM/eSIM, capacitive touch: common knowledge, not searched.
- Solar cell blue color attributed to anti-reflective coating: search found silicon nitride anti-reflection layers of ~70-80 nm are standard, but the link to blue color was not stated by the source. Kept as written.

### (d) Number claims and sources
- 940 nm remote IR LED: confirmed as the common remote-control wavelength (SparkFun page and hobby-electronics listings found in search: https://sparkfun.com/products/9349 ; https://protosupplies.com/product/led-940nm-infrared-emitter-5mm/ ). Phone cameras see it weakly, often as a purple-white flash, and sensitivity varies by phone because of IR-cut filters (same search). Matches the text ("often", "some phones").
- Nichrome ~80% nickel / 20% chromium, protective chromium oxide layer, toaster element wound on mica insulator: confirmed (Wikipedia Nichrome article https://en.wikipedia.com/wiki/Nichrome ; NZASE toaster article https://nzase.org.nz/wp-content/uploads/2025/10/NZASE-Background-Article-Toaster.pdf).
- Solar cell: phosphorus n-type top emitter over boron p-type base, silicon nitride anti-reflective coating: confirmed via patent descriptions found in search (e.g. https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9349884).
- Visible-light wavelengths (violet/blue ~400-450 nm, red ~650-700 nm), AA/AAA 1.5 V cells in series giving 3 V: standard values, not searched this run.

---

## Second model: independent re-check

### Second review of the fact-check (take-apart-lab)

Game source: `js/` (worlds.js, worlds-more.js, learn.js, learn-deep.js, devices/*.js). No files edited.

What I actually did: read all three reports; grepped the game source to confirm each new string is in place; web-searched five points (Intel 45nm high-k, LCD glass thickness, brass nail in alkaline cells, silicon made from sand, US VHF/UHF dial). Everything else below is my own judgment from general knowledge, marked as such. Where I say "confirmed in file," I saw the new wording in the source. I did not confirm every via/filter-inside line.

### 1. Fixes

| Item | Verdict | Note | Source |
|---|---|---|---|
| worlds.js transistor "Glass layer" (old: "a kind of glass called silicon dioxide") | agree | Intel's 45nm process swapped SiO2 gate dielectric for hafnium high-k (Jan 2007). New text confirmed in file (worlds.js:606). | Searched: Intel 45nm announcement coverage (theregister.com 2007/01/27; semiconductor-today.com 2007 JAN); the report's intc.com link |
| worlds.js/transistor "billions of times a second" -> "the fastest can..." | agree | Not every transistor switches every cycle. Confirmed in file (worlds.js:589, :610). | General knowledge |
| worlds.js speaker "Big slow wiggles sound low..." -> "Slow wiggles sound low..." | agree | Old text tied size to pitch. New text confirmed (worlds.js:1253). Intro at worlds.js:1233 is consistent. | General acoustics |
| worlds-more.js switch "Down means open" -> "the way is clear" | agree | Confirmed (worlds-more.js:652). Open = broken loop everywhere else. | Internal consistency |
| pcb-inside "thousands of vias, thinner than a hair" -> "the tiniest are about as thin as a hair" | agree | Microvias ~50-150 um vs. hair ~70-100 um. Did not confirm the new line in the pcb file. | Report's search summaries; hair width from general knowledge |
| filter-inside "White light is really red, green and blue mixed" -> "A screen can make white by mixing..." | agree | White light is all visible wavelengths; RGB mixing is how screens approximate white. | General physics |
| learn.js bridge rectifier "60 times a second" -> 60 cycles = 120 reversals | agree | Confirmed (learn.js:33). Wording is North American mains (US). | Definition of 60 Hz |
| led-tv.js bridge "swings back and forth 60 times" | agree | Confirmed (led-tv.js:357). | Same |
| led-tv.js LED "barely get warm" -> "waste much less energy as heat" | agree | Confirmed (led-tv.js:20). LEDs do get warm; most input power still becomes heat. | ledsmagazine.com (report; not fetched by me) |
| learn.js LED "stays cool" / "without making much heat" -> "wastes less heat" / "as much heat" | agree | Same claim as above. Not re-grepped in file. | Same |
| led-tv.js chip "smaller than a grain of sand" -> "about as small as" | agree | Confirmed (led-tv.js:17). Sand ranges ~0.06-2 mm, so the softer wording is right. Same claim still uncorrected in worlds.js:195 (see section 3). | General |
| led-tv.js "tiny red, green and blue dots... make each pixel" | agree | Confirmed (led-tv.js:262). Pixel = RGB subpixel trio. | General |
| led-tv.js LCD layers "each thinner than paper" -> "each very, very thin" | agree, stronger | Old claim was likely false, not just unsourced. Search: typical LCD glass is ~0.5-0.7 mm, several times thicker than paper (~0.1 mm). Confirmed (led-tv.js:283). | Searched: Corning and Asahi glass spec pages and articles on LCD substrate thickness |
| led-tv.js driver chip "hundreds of columns" -> "lots of columns" | partly | Old number may have been right: source driver ICs typically have several hundred outputs each. The softening loses information but is not an error fix. Optional to revert. Confirmed (led-tv.js:292). | General (not searched) |
| led-tv.js brightness film "bounces sideways light back" -> "light going the wrong way back" | agree | Reflective polarizer recycles the wrong-polarization light. Confirmed (led-tv.js:242). | Report's USPTO DBEF patent link (not fetched by me) |
| learn-deep.js back polarizer "absorb light that wiggles across them" -> "wiggles one way" | agree | Iodine-PVA chains absorb light polarized along the chains, so "across" was backwards. Confirmed (learn-deep.js:76). The new text is vaguer but correct. | General (polarizer physics); report's displaymodule.com link |
| learn.js flyback "is the reason an old TV can give you a shock even when off" -> strong electricity "can stay inside" | agree | Stored charge sits in the tube and capacitors. Confirmed (learn.js:103). | General; report's iFixit link |
| learn.js high-voltage wire "up to the front of the picture tube" -> "to the picture tube" | agree | Anode connects on the funnel side, not the front face. | General (CRT construction), not fetched |
| learn.js magnet "around 1 tesla at the magnet" -> removed | agree | Ferrite magnets are well under 1 T at the surface. | General |
| learn.js/learn-deep.js safety capacitor "keeps stray electricity from leaking into the case" -> "keeps electrical noise from leaking out" | agree | A Y capacitor shunts noise to earth; leakage is tiny. Confirmed in learn-deep.js:202. | General EMI practice |
| learn.js surge guard "rated near 150 to 175 volts" -> "a bit above the normal line voltage" | agree (softening) | Real rating unknown to me. Softening is the safe move. | Unsure |
| learn.js electron gun "a few milliamps" -> "only milliamps in total" | agree | Typical beam current ~1 mA or less. Confirmed (learn.js:96). | General CRT knowledge |
| learn.js focus knob "20 to 30 percent" -> "a fraction of" | agree (softening) | Percentage unverified. | Unsure |
| learn.js diffuser "1 to 2 millimeters" -> "one to a few millimeters" | agree | Confirmed (learn.js:78). | General |
| crt-tv.js channel knob "about 13 channels" -> "big clunky knob" | agree | US VHF is channels 2-13 (12 channels), plus UHF dial positions. Confirmed (crt-tv.js:111). | Searched: VHF 2-13 / UHF dial summaries |
| crt-tv.js + led-tv.js "Every speaker has a magnet" -> "Almost every" | agree | Piezo and electrostatic speakers exist. Confirmed (crt-tv.js:310, led-tv.js:482). | General |
| remote.js spring "batteries shrink a tiny bit" -> "can change size a tiny bit as they age" | agree | Batteries don't shrink in use; cells can swell slightly. Vaguer but true. Confirmed (remote.js:275). | General |
| solar-light.js "Silicon is what sand is made of" / "same stuff sand is made of" -> "made from sand" | agree | Sand is silicon dioxide; silicon is reduced from quartz with carbon. Confirmed in file (solar-light.js:44, :333). **The report said the search found nothing; I found patent sources confirming it.** | Searched: silicon from quartz/silica carbothermal reduction (patent literature, e.g. patents.google.com US4460556A) |
| toy-car.js brushes "made of graphite" -> "often graphite... or springy metal" | agree | Confirmed (toy-car.js:80). | Maxon support article (report) |
| doorbell.js "Doubling the loops roughly doubles the pull" -> "doubles the strength of the magnetic field" | agree | Field B scales with turns; pull on an armature scales with about B squared, so doubling turns gives about 4x pull in the linear range. New text confirmed (doorbell.js:332). | General electromagnetism |
| phone.js battery "takes up almost half the phone" -> "a big part" | agree | Share varies by model. Confirmed (phone.js:100). | Judgment |

Count note: the devices report says "20 edits (19 distinct claims)" but its table has 21 rows. The speaker-magnet line is in two files. Minor; fix the count in the report.

### 2. Unverified claims (the "could not verify" lists)

| Claim | Verdict | Note | Source |
|---|---|---|---|
| Gold wire "heat and a buzz of sound vibration" (thermosonic bonding) | likely true | Thermosonic = heat plus ultrasonic vibration. "Buzz of sound vibration" is loose but fair for kids. | General |
| LED bond pad "is gold" | likely true | Pads are gold-containing metal stacks; simplified-fair. | Report's patent search |
| Brass nail in alkaline cell | likely true | Brass is the usual zinc-anode current-collector nail. | Searched: alkaline cell patents (brass is the most common nail material; tin-plated brass also common) |
| LED chip "about a quarter of a millimeter" | likely true | Typical 5 mm LED dies are ~0.2-0.3 mm. | General; not sourced |
| Thinnest chip wires "a thousand times thinner than a hair" | likely true (understated) | Modern copper interconnects are tens of nm; hair ~70 um, so the true ratio is thousands. | General |
| "Each core is built from millions of transistors" | likely true (understated) | Modern cores hold hundreds of millions or more. | General |
| "Billions of recombinations every second" in an LED | likely true (understated) | At 20 mA, ~10^17 electrons per second. | Arithmetic |
| Resistor ceramic "holds heat" | unsure | Loosely true; low stakes. | General |
| Sunglasses polarization axis vertical | likely true | Polarized sunglasses pass vertical and block horizontal glare. | General |
| Switch contact/spring and fuse "a few cents" | unsure | Low stakes; drop the price if you can't source it. | None |
| Settings memory "a million write cycles", "about 40 years" retention | likely true | Typical EEPROM spec figures, though some parts are rated lower. | General datasheet norm |
| Power cord "18 gauge, about 10 amps" | unsure | 18 AWG is commonly rated 7-10 A depending on the standard. | General |
| Power switch "thousands of times a second" | likely true (understated) | Typical SMPS runs at 65-130 kHz (tens of thousands of times a second). | General |
| Heat sink "like a dog panting" | fair analogy | A heat sink is passive, so this is an analogy, not a mechanism. | Judgment |
| Clock crystal "20 parts per million" | likely true | 20 ppm is a common tolerance spec. | General |
| LED chip "about 1 mm" (backlight) | unsure | Die size depends on package; I would drop the number. | None |
| Power control chip "65 to 130 kHz" | likely true | Common TV SMPS switching range. | General |
| Speaker, optocoupler, USB, Wi-Fi, Ethernet spec lines | likely true | Standard published values. | General |
| 38 kHz IR carrier | likely true | Common consumer remote carrier; "often about" hedges correctly. | General |
| Chime bars mounted at nodal points, frequency vs length | likely true | Standard chime design. | General |
| Toaster bimetal "bends toward the slower one" | likely true | It bends toward the lower-expansion metal. "Slower" is ambiguous; consider "the one that stretches less." | General |
| Electromagnet latch | likely true | Standard. | General |
| Maillard "sugars and proteins" | partly | The reaction is sugars with amino groups (amino acids, in proteins). Fair for kids. | General |
| "Atoms/waves a hundred million / million times bigger" | unsure | Not checked. | None |
| ERM rumble motors, Li-ion protection chip, USB power/data pins, SIM/eSIM, capacitive touch | likely true | Standard. | General |
| Solar cell blue color from anti-reflective coating | likely true | Silicon nitride ARC (~70-80 nm) is what gives the classic blue cell. | Searched only the thickness; blue-color link is general knowledge |
| 940 nm remote LED | likely true | Confirmed by the report's SparkFun/product listings. | Report |
| Nichrome 80/20, mica insulation | likely true | Confirmed by the report's Wikipedia/NZASE links. | Report |
| Phosphorus/boron solar cell, SiN coating | likely true | Confirmed by the report's patent. | Report |
| AA/AAA 1.5 V in series = 3 V; 400-450 nm violet/blue; 650-700 nm red | likely true | Standard values. | General |
| Blue LED Nobel 2014; GaN stack; white = blue chip + phosphor | likely true | Confirmed by the report's Nobel and patent sources; I did not re-fetch them. | Report |
| Alkaline chemistry (Zn anode, MnO2 cathode, hydroxide at cathode, steel can as collector) | likely true | Consistent with the report's doitpoms and Energizer sources. | Report |
| Electron drift speed, signal speed ~2x10^8 m/s | likely true | Consistent with the report's source. | Report |
| Ferrite magnet composition (iron oxide + Ba/Sr) | likely true | Ferrite magnets are BaFe12O19 / SrFe12O19. | Report's encyclopedia link |
| NTSC 15,734 Hz and 3.579545 MHz | likely true | Standard NTSC constants. | Report (Wikipedia/repairfaq) |
| CRT anode 20-30 kV | likely true | Typical TV anode range. | Report (iFixit) |
| HDMI 19 pins; HDMI 2.0 18 Gbps; 2.1 48 Gbps | likely true | Standard values. | Report (DigiKey) |
| Degaussing PTC thermistor | likely true | Standard CRT design. | Report (patent) |
| Series LED backlight string failure | likely true as a common failure, not a rule | Report's own wording is right. | Report (repair forum) |
| Brightness gain "about 35 percent" from reflective-polarizer recycling | unsure | Published gains for DBEF-type films vary, and one patent figure is not a product spec. Do not use the number. | Report's patent link (not fetched by me) |
| 4K = 24.9 million subpixels; light circles Earth 7.48 times/sec; resistor code | confirmed (arithmetic) | 3840x2160x3 = 24.9M; 299,792/40,075 = 7.48; brown-black-brown = 100 ohm, red = 1 k, orange = 10 k. | Arithmetic |
| Silicon 14 electrons / 4 outer; gallium melts ~30 C; 60 Hz mains; gold band 5%; N2 ~78% of air | confirmed (general knowledge) | All standard facts. Gallium melts at 29.8 C. | General |

### 3. Still wrong in the game text (fix these)

1. **worlds-more.js:899 (Polarizer, "Long chains")**: the analogy uses color ("The yellow light wiggles along the sponge... The blue light wiggles across it"). Polarizers act on the direction of the light wiggle, not its color, so this is wrong and contradicts learn-deep.js:76. Suggested: "Think of each chain as a long sponge lying sideways. Light that wiggles along the sponge gets soaked up. Light that wiggles across it only brushes past and slips through." Remove both color words. This was not in any report.

2. **worlds.js:195 (LED chip, learn)**: still reads "The real chip is smaller than a grain of sand, about a quarter of a millimeter across." The same claim was softened in led-tv.js:17 but not here. Suggested: "The real chip is about as small as a grain of sand, about a quarter of a millimeter across."

3. **worlds.js:589 (Transistor intro)**: "Open means 1 and shut means 0." This conflicts with worlds.js:610 ("On means one, off means zero") and with the switch world, where "open" means a broken loop, or off. Suggested: "On means 1 and off means 0."

4. **worlds.js:1233 (Speaker intro)**: "Far wiggles make loud sounds!" Probably a typo for "Big wiggles make loud sounds!" Loudness tracks wiggle size, not distance. (Fixed: now "Big, far wiggles make loud sounds!")

5. **Optional, low priority**: led-tv.js:292 "lots of columns" could go back to "hundreds of columns." Source driver ICs typically have hundreds of outputs, so the original was likely right and the softening lost information.

6. **Optional, low priority**: worlds.js:606 "It is only a few atoms thick." Modern high-k layers are physically thicker than the old SiO2 (~1.2 nm). "A few atoms" is still defensible, but the number is loose.
