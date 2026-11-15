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

---

## Depth pass (teardown parts, 2026-11-14)

After the devices were deepened into real teardown part lists, the new text was checked again:

- **Three Claude Sonnet checkers**, one per three devices, about 590 claims. 15 string fixes. Only the toy car, doorbell and controller checker used web sources; the phone, tube TV and flashlight checker worked from memory.
- **Claude Haiku second pass with web sources** on the phone, tube TV and flashlight: 26 claims checked, 23 confirmed, 0 wrong, 3 unverified. One understatement fixed afterward (the flashlight driver switches hundreds of thousands of times a second).
- **Logic issues found and fixed in code:** the doorbell's high-note bar was drawn longer than the low-note bar (swapped); the controller's trigger magnet and sensor changed nothing on screen (now that side stops buzzing back).
- **Logic simplifications left as is:** a pulled video amp in the tube TV turns that color off (a real one often turns it fully on); a pulled flashlight smoothing capacitor makes the light flicker (real ones mostly ripple); the controller antenna is all-or-nothing (real ones lose range); the toy car's drawn gear sizes are 2.5:1 while the tooth counts are 2:1.

### Phone, tube TV, flashlight

#### Fact-check depth 1 (phone, crt-tv, flashlight)

Method: checked against known teardown and electronics knowledge (iFixit-style phone teardowns, CRT service practice, LED flashlight driver design). No live web lookups were done, so everything below is "known from domain knowledge", not freshly sourced.

##### phone.js (~75 claims checked)
Fix:
- NFC chip learn: "It only turns on when it is near a reader, which helps keep it safe." -> "It only works from very close, so a stranger across the room cannot read it. That helps keep it safe." (NFC controllers poll periodically; they do not switch on only near a reader. Short range, about 4 cm, is the real safety point.)
Logic: none found.
Unverified / simplifications (left as is):
- Vibration motor / Buzz weight describes a spinning off-center weight. True for older and many Android phones; recent iPhones use a linear Taptic Engine that does not spin.
- Touch layer as a separate grid: modern OLED phones often build touch into the display. Fine as a simplification.
- "Two or three microphones": many phones have three or four.
- Wireless charging coil described as on the back glass: usually a separate piece stuck behind it. Fine.
- Battery pull tabs are iPhone-style stretch-release strips; Android batteries differ.

##### crt-tv.js (~95 claims checked)
Fixes:
- SAW filter learn: "The antenna brings in lots of channels at once. This filter lets through only the narrow band you picked..." -> "The tuner picks your channel, and this filter cleans it up. It lets through only the narrow band that channel uses, ..." (the SAW filter sits after the tuner in the IF stage, not at the antenna).
- Antenna terminals job: "... so the rabbit ears still work without it." -> "... The rabbit ears still work without it." (confusing wording).
Verified true: 25,000 V anode, about 15,000 lines/s (15.7 kHz), 60 Hz vertical, 3.58 MHz color subcarrier (about 3.6 million), 300 ohm twin lead, PTC degauss thermistor and the "boing", purity (2-pole) and convergence (4/6-pole) rings, shadow mask angles, aquadag outer coat plus ground strap acting as HV filter capacitor, implosion band, RCA colors (yellow video, white left, red right), neck board video amps with spark gaps, loss of both deflections gives a single bright dot, loss of vertical deflection gives a horizontal line.
Logic issues (not changed):
- Neck board and video amp removal ("screen went dark", casts like "blue and green"): in a real set a dead video amp often drives that gun fully on (bright single-color raster) rather than off. The game's "gun off" model is a simplification, not a clear error.
- Removed yoke wedges and flyback-less cases fine.
Unverified:
- IF coil cans: plausible for older sets; many later sets use only a SAW filter plus IF chip.
- Wedge text says a technician "can loosen them to adjust" tilt; real practice is to loosen the yoke clamp and reposition the wedges. Close enough.

##### flashlight.js (~80 claims checked)
Fix:
- Inductor learn: "on and off thousands of times a second" -> "many thousands of times a second" (real LED drivers switch at tens to hundreds of kHz).
Verified true: aluminum-base (MCPCB) star board with insulating layer, thermal paste fills micro gaps, O-ring seals, boost/buck driver with inductor, diode, output capacitor and sense resistor, 2 AA in series about 3 V, nickel-plated steel positive cap on AA, spring contacts and tail-cap return through the tube, IP-style waterproof ratings.
Logic issues: none clear. Missing smoothing capacitor causing flicker is a plausible but exaggerated effect (real result is ripple, usually still lit).
Unverified: "Switch ring" (a ring pinching a rubber boot around the button) is a plausible but unsourced part; kept.

Syntax check passed on all three files. No em dashes in added text.

### Remote, toaster, solar light

#### Fact-check, depth 2: remote.js, toaster.js, solar-light.js

Method: read all kid-facing strings of the added parts, checked against teardown knowledge plus two searches (toaster electronic-timer teardowns and patents; solar garden light YX8018-style boards). About 150 claims checked.

##### toaster.js
Parts list verdict: the latch electromagnet, RC timer (timing capacitor, timing resistor, control transistor, browning pot), rectifier diode and dropping resistor are real and match published toaster designs. One teardown-type description: capacitor charges through a resistor, and at a set voltage the magnet's power is cut so the spring pops the toast. The browning control is a variable resistor that sets the charge rate. Mica cards, nichrome, guard wires, thermal fuse, terminal block, contacts and crumb tray are standard. The diode plus dropper feeding the magnet from the wall is a common cheap design (some teardowns use logic or a microcontroller instead; the learn text says "many toasters", which is fine).

Fixes (string text only):
- Lever knob job: "keeps the metal lever from getting hot" -> "keeps your fingers off the metal lever" (the lever is not the hot part).
- Heating wires learn: "folded back and forth on a mica card" -> "wound back and forth around a mica card" (the ribbon is wound on the card).
- Crimp terminal learn: "cannot be soldered easily because it gets so hot" -> "Solder does not stick well to nichrome and would melt in that heat" (accurate reason).

Logic issues: none found. Symptoms match cause and effect (open resistor, capacitor, pot or transistor all give "never releases"; missing diode or magnet gives "pops right back up"; missing fuse gives dead toaster).

Unverified or simplified:
- Exact placement of the transistor (it "cuts off" magnet power) varies by design; fine as a simplification.
- Contacts described as brass; real toasters often use silver or copper alloys. Left as is.
- Spring "stretches" when lever goes down; some carriages use compression springs. Harmless.

##### remote.js
Parts list verdict: IR LED, transistor driver with base resistor, ceramic resonator, chip, small capacitor, wire jumpers, indicator LED with its resistor, carbon pads, copper fingers, battery contacts and link strip are all normal in a TV remote. 940 nm, 38 kHz carrier, and phone cameras seeing IR as purple or white are correct. Light wavelength numbers (400 to 450 nm blue, 650 to 700 nm red) are fine.

Fix:
- Board learn: "The board is fiberglass" -> "The board is stiff fiberglass or pressed paper" (cheap remotes use paper-phenolic boards).

Logic issues: none found.

Unverified:
- Whether a given remote has an indicator LED, a separate capacitor or jumpers varies by model; kept as "a typical remote".
- Ceramic resonator "tan": common colors vary (tan, yellow, blue). Left as is.

##### solar-light.js
Parts list verdict: lens-and-LED, rechargeable cell, slide switch, blocking diode, booster coil with a switching control chip (YX8018-style), filter capacitor, resistor, panel wires, bus ribbons, frame, cover and seal are all consistent with real garden lights. The blocking diode (stops the battery draining through the panel at night) and the inductor boost are confirmed in teardowns. Cell physics (boron bottom layer, phosphorus top layer, fingers, back metal) is correct.

Fixes: none needed.

Logic issues: none found for the evaluate logic as read. Note only: the light sensor part ("Light sensor") is correct for lights using a photoresistor. Many cheap lights have no photoresistor and the chip senses darkness from the panel voltage. The learn text already says "Some solar lights skip this part", so it is honest.

Unverified:
- LED series resistor: many boost-driver (YX8018) boards have no LED resistor, so the "Resistor" and "Small resistor" parts are typical of some boards, not all.
- Filter capacitor presence and size vary by board; plausible.
- Battery described as steel can with raised plus button on AA size: true for AA; NiMH or NiCd chemistry not named in text, fine.
- "LED hardly gets warm": true enough for a kid-level statement.

### Toy car, doorbell, controller

#### Fact-check depth 3: toy-car.js, doorbell.js, controller.js

Sources used: web search on chime mechanism (ding on press, dong on release via return spring; two-bar chime; front/rear solenoids; voltage matching) and iFixit Xbox One Wireless Controller teardown (triggers use linear Hall sensors). The rest rests on standard electronics knowledge. All three files pass the node syntax check. No em dashes found in any file.

##### toy-car.js
Parts fidelity: OK. A 3-pole armature with a 3-segment commutator is correct for small toy motors (one coil per arm, "always a push, can start from any position" is true). Two arc magnets in a steel can (can carries flux), brushes on a plastic end cap with solder tabs, 2xAA holder with a link strap, contact springs on the minus ends, flat tabs on the plus ends, 3 V from two AA, slide switch, red/white/black wiring all match real toys.

Fix:
- Bumper say: "the car's soft nose" -> "the car's tough edge" (the learn text calls it a bar of tough plastic, so "soft" contradicted it).

Logic / geometry notes (not changed):
- Gear teeth: BIG n=16, SMALL n=8 (2:1, text says "twice") but radii are 0.4 vs 0.16 (2.5:1). Teeth count matches the text; the pitch radii do not match the tooth count. Visual only.
- At the left end of the battery tray, springL (cell 1 minus), tabL (cell 2 plus) and the strap all occupy the same junction. Electrically fine for a series pair, but redundant: in a real holder the strap/tab/spring there is one piece.
- Inside-the-motor world uses a 2-segment commutator ("two copper halves"), the car's motor uses three. Fine as a simplified model, but a curious reader may notice. Left as is.

Unverified: none material.

##### doorbell.js
Parts fidelity: OK. Solenoid with iron plunger, return spring, two tuned bars, rubber mounts, felt/soft tips, bobbin, terminal block labeled TRANS / FRONT / REAR (standard chime labels; search did not surface a page confirming them, so counted as unverified but consistent with typical units), step-down transformer with laminated core, primary (more turns) and secondary (fewer turns), lighted button with resistor + LED, insulated staples. Ding on press, dong on release matches the animation (magnet on 0 to 0.7 s, spring return after). Wiring runs match the text: red transformer to button, white button to FRONT, black transformer to TRANS, coil between FRONT and TRANS.

Fixes (text contradicting the geometry: ding bar is the LONGER bar, h=1.9, dong bar the shorter, h=1.5, the reverse of "short = ding"):
- Ding bar learn: "This one is short, so it sings the high note, ding." -> "Ding is the high note of the pair."
- Dong bar fact: "The longer bar shakes slower... Long and low is dong." -> "A longer bar shakes slower, so its note is lower. Low is dong."
- Dong bar say: "It is longer, so its note is lower." -> "It rings the lower note."
- Dong bar learn: "Short and fast is ding, long and slow is dong." -> "Short and fast sounds high, long and slow sounds low."

Logic issue (not changed, geometry): the ding bar (high note, 660 Hz) is drawn longer than the dong bar (494 Hz). Swapping the two heights (bar1 h=1.5, bar2 h=1.9) would make picture, sound and text agree.

Judgment calls left as is:
- Transformer "gentle faucet" analogy: a faucet limits flow, a transformer lowers voltage. Acceptable kid analogy; the learn text then states the real rule (fewer turns, lower voltage).
- A real two-note chime usually has a second solenoid for REAR (single ding); here REAR is a spare terminal, and the text says so.
- Gravity, not a spring, returns the plunger in some real chimes; the spring version is also common.

Unverified: felt pads on plunger tips (plausible, some chimes use plastic/rubber), TRANS/FRONT/REAR labels (see above).

##### controller.js (modeled on an Xbox-style pad: layout, button colors/positions, Menu/View names all match)
Parts fidelity: OK. Hall-sensor triggers with a magnet are correct for Xbox One (iFixit: linear Hall sensors on both triggers); the text already hedges "some controllers use a potentiometer". Thumbsticks as potentiometers with a hedge for Hall sticks is correct. Rubber membrane with carbon pills plus a contact board and FFC/ZIF ribbon, tactile-dome bumper switches, pouch Li-ion cell with protection board, wires and keyed plug, Bluetooth chip, chip antenna, crystal, regulator, charger chip, motor driver, diode, SMD caps/resistors, light pipe, and two brushed eccentric-weight rumble motors (can, magnet, coil, commutator, brushes, shaft, off-center weight) are all real. 3 to 4.2 V Li-ion, CC then CV charging, 2.4 GHz Bluetooth, total internal reflection explanation: all true.

Fixes:
- Antenna breaks: "No antenna, so the radio waves cannot get out!" -> "Without the antenna the radio is too weak, so the game cannot hear it well!" (a missing antenna sharply cuts range, it does not stop the radio entirely).
- Top shell learn: "a metal mold that is pressed shut around hot plastic" -> "hot melted plastic is squirted into a metal mold and cools into the shape" (injection molding).

Logic issues (not changed):
- evaluate `link` requires the antenna, so removing it fully disables "link" (anything keyed to it). Reality is degraded range, not none. The kid text now says weak.
- `aL`/`aR` (trigger magnet + Hall sensor) are computed in evaluate but tick does not use them, so removing a trigger magnet or Hall sensor has no visible effect while the breaks/symptom text says the game cannot tell how hard you squeeze. Fine as a described effect, but nothing animates it.
- Crystal removal stops the controller (brain = board, chip, reg, xtal). Plausible for a radio MCU; some chips have internal oscillators, but the Bluetooth radio needs a crystal.

Unverified: thumbstick sensor type in the specific model (potentiometer vs Hall), D-pad switch type (membrane vs dome); text is generic enough to be true either way.

##### Counts
Claims checked: about 190 (kid-facing say/learn/breaks/symptom/job/fact strings plus part lists across the three files)
Fixes: 7 string edits (1 toy car, 4 doorbell, 2 controller)
Logic issues reported: 5 (doorbell bar length vs pitch, controller antenna all-or-nothing, controller trigger-sensor unused flags, plus two minor geometry notes in toy car)
Unverified: 5

### Second model: phone, tube TV, flashlight (web sources)

#### Second fact-check, web-sourced (phone.js, crt-tv.js, flashlight.js)

Method: WebFetch on Wikipedia pages and WebSearch for sources that Wikipedia could not supply (iFixit, TI, Analog Devices, Android Police). Each claim below is tied to the source that was read. Claims were taken from the kid-facing `say`, `learn` and `fact` strings in the three files.

Result: 26 claims checked against a web source. 0 wrong. 0 fixes made. 3 unverified.

##### Claims

####### crt-tv.js
1. Anode voltage about 25,000 V (fact string line 421; learn line 555). Source: https://en.wikipedia.org/wiki/Cathode-ray_tube says color TV tubes run "24-32 kV". CONFIRMED.
2. Outer graphite coat (aquadag) is grounded by the strap, and the inner and outer coats with the glass act as a capacitor (learn line 275). Source: same Cathode-ray tube page says the outer coating "is connected to ground" and the coatings act as a capacitor that filters the anode voltage. CONFIRMED.
3. Horizontal sweep about 15,000 lines a second (15,734 in NTSC; learn line 555 for the flyback). Source: https://en.wikipedia.org/wiki/NTSC says "15,734 lines per second". CONFIRMED.
4. Vertical sweep about 60 times a second (learn line 560). Source: https://en.wikipedia.org/wiki/NTSC gives 30/1.001 frames, so 59.94 fields a second. CONFIRMED.
5. Color subcarrier about 3.6 million ticks a second in North America (learn line 577). Source: https://en.wikipedia.org/wiki/NTSC gives 315/88 MHz = 3.579545 MHz. CONFIRMED.
6. Antenna twin lead about 300 ohms (learn line 201). Source: https://en.wikipedia.org/wiki/Twin-lead says standard TV twin-lead is 300 ohms. CONFIRMED.
7. RCA colors: yellow video, white left audio, red right audio (learn line 208). Source: https://en.wikipedia.org/wiki/RCA_connector says "yellow for composite video, red for the right audio channel, and white or black for the left". CONFIRMED.
8. Shadow mask holes arranged in triangles, later masks used slots (learn line 261). Source: https://en.wikipedia.org/wiki/Shadow_mask says phosphor dots are in a triangular arrangement and later masks "use rectangular slots instead of circular holes". CONFIRMED.
9. Aperture grille (Trinitron) uses vertical slots (learn line 261 contrast). Source: https://en.wikipedia.org/wiki/Trinitron describes "vertical slots cut in" a steel sheet, flagged on the page as disputed. CONFIRMED with that caveat.
10. Degauss coil starts strong and fades; its thermistor shuts it off after power-on (say line 293; learn line 521). Source: https://en.wikipedia.org/wiki/Degaussing says the field has "decreasing amplitude" and the thermistor is "a simple positive temperature coefficient (PTC) thermistor device". CONFIRMED.
11. PTC thermistor resistance rises with heat (learn line 521). Source: https://en.wikipedia.org/wiki/Thermistor says "PTC thermistors have more resistance at higher temperatures". CONFIRMED.
12. Ferrite is an iron-oxide ceramic that hardly conducts electricity (learn line 383). Source: https://en.wikipedia.org/wiki/Ferrite_(magnet) says ferrites are "magnetic ceramics containing iron oxide" and "poor conductors of electricity". CONFIRMED.
13. Common-mode choke has two windings on one core (learn line 517). Source: https://en.wikipedia.org/wiki/Common-mode_choke says "two parallel coil windings on a single core". CONFIRMED.
14. SAW stands for surface acoustic wave, and SAW filters pull subcarriers out of TV signals (learn line 566). Source: https://en.wikipedia.org/wiki/Surface_acoustic_wave gives the definition and says SAW filters are "frequently used in television receivers, for extracting subcarriers". CONFIRMED.
15. Yoke wedges: three rubber wedges (learn line 390). No source checked. UNVERIFIED (left as is; plausible, not contradicted).
16. Flyback steps the voltage up to about 25,000 V (learn line 555). Covered by claim 1. CONFIRMED.

####### phone.js
17. NFC works only at very short range (learn line 249, edited by the first checker). Source: https://en.wikipedia.org/wiki/Near-field_communication says NFC "typically requiring a separation of 10 cm (3+7/8 in) or less". The first checker's fix is correct. The text says "a few centimeters", which is inside the 10 cm limit. CONFIRMED.
18. Gyroscope senses rotation, accelerometer senses linear push (learn line 253). Source: https://en.wikipedia.org/wiki/Gyroscope says a gyroscope senses rotation and an accelerometer senses linear acceleration. The "tilt" wording is not covered by that page. CONFIRMED for the main point; tilt part UNVERIFIED.
19. Phones combine accelerometer and gyroscope in one chip (learn line 253). Source: iFixit chip IDs, found by WebSearch, list Bosch Sensortec accelerometer and gyroscope on iPhone 16 and 16 Pro boards, and an InvenSense 6-axis combo on iPhone 6 and 6s. Search result pages: https://www.ifixit.com/Guide/iPhone+16+Chip+ID/177222 and https://www.ifixit.com/Teardown/iPhone+6s+Teardown/48170. CONFIRMED.
20. Phone battery uses lithium-ion cells (learn line 153). Source: https://en.wikipedia.org/wiki/Lithium-ion_battery says handheld electronics "mostly use lithium polymer batteries", which is in the lithium-ion family. CONFIRMED with note (the more exact term is lithium polymer; not changed).
21. Battery protection circuit cuts the cell off when it is out of safe range (learn line 160). Source: https://en.wikipedia.org/wiki/Lithium-ion_battery says "many lithium-ion cells (and battery packs) contain fail-safe circuitry that disconnects the battery". CONFIRMED.
22. Phone vibration motor spins an off-center weight (say line 352). Wikipedia URL returned 404. Source: WebSearch results from TI SLOA194 (https://ti.com/lit/SLOA194) and Android Police (https://www.androidpolice.com/2020/10/20/a-lot-more-goes-into-good-smartphone-haptics-than-youd-think/) say an ERM is "a motor with a lopsided weight". The same sources say many phones use a linear resonant actuator instead. CONFIRMED for ERM; the game describes one common type and is left as is.
23. Phone microphone count: "two or three" (learn text, not changed). iFixit iPhone 6 teardown (search snippet) reports 2 MEMS microphones. TechInsights gives an ambiguous count for the iPhone SE. UNVERIFIED (many phones have three or more).
24. Touch chip scans the grid many times each second (learn line 123). No source checked. UNVERIFIED (plausible, not a specific number).

####### flashlight.js
25. Two AA cells give about 3 volts (line 158). Source: https://en.wikipedia.org/wiki/AA_battery gives 1.50 V nominal for an alkaline AA. Two in series is about 3 V. CONFIRMED.
26. The bumpy nub is the positive end of an AA cell (learn line 289). Source: https://en.wikipedia.org/wiki/AA_battery describes "the positive terminal button". CONFIRMED.
27. LED board is aluminum with an insulating layer for heat (learn line 138 and say line 136). Source: https://en.wikipedia.org/wiki/Printed_circuit_board says metal-core boards are "used for parts requiring significant cooling - power switches, LEDs" and "clad with thermally conductive thin dielectric" on aluminum. CONFIRMED.
28. Switching LED driver switches many thousands of times a second (learn line 180; first checker's edit). Sources: TI LM3405A datasheet at https://ti.com/lit/gpn/LM3405A has a 1.6 MHz switching frequency, and the Analog Devices MAX16834 buck-boost example at https://www.analog.com/en/technical-articles/designing-buck-boost-LED-driver-using-MAX16834.html runs at about 455-495 kHz. "Many thousands" understates this but is not wrong. CONFIRMED.
29. Thermal paste between board and head fills micro-gaps (learn line 145). No source checked. UNVERIFIED (common practice, not a number).

##### Changes
- None. No clear errors were found, so no files were edited and no syntax check was needed.
- The first checker's NFC fix (phone.js learn line 249) checks out.

##### Open items for a human
- Yoke wedge count (three), touch scan rate, phone microphone count ("two or three") and thermal-paste detail remain unsourced.
- The vibration-motor line describes one common type of phone motor, not all phones. It is a simplification, not an error.
