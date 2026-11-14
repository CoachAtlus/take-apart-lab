// Full regression: paste into a page that has loaded index.html (tools/shoot.mjs "js" step). Returns a report string.
(async function () {
  const W = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 60 && !(window.TAL && TAL.debug && TAL.devices && TAL.devices.length >= 10); i++) await W(250);
  const out = [], errs = [];
  const onErr = (e) => errs.push(String(e.message || e.reason || e));
  addEventListener('error', onErr); addEventListener('unhandledrejection', onErr);
  const step = async (label, fn, wait) => { try { await fn(); } catch (e) { errs.push(label + ': ' + e.message); } await W(wait || 200); };
  out.push('devices: ' + TAL.devices.map((d) => d.id).join(', '));
  for (const d of TAL.devices) {
    for (const L of [1, 2, 3]) {
      const tag = d.id + L;
      await step(tag + ' open', () => TAL.debug.openDevice(d.id, L), 400);
      const n = TAL.app.inst.parts.length;
      await step(tag + ' power', () => { if (TAL.app.inst.def.dial) TAL.debug.dial(); else TAL.debug.togglePower(); }, 300);
      await step(tag + ' crit', () => TAL.debug.game('crit'), 300);
      const crit = TAL.debug.gameText();
      await step(tag + ' find', () => TAL.debug.game('find'), 200);
      await step(tag + ' endgame', () => TAL.debug.endGame(), 50);
      await step(tag + ' explode', () => TAL.debug.explodeAll(), 2500);
      const outN = TAL.app.inst.parts.filter((p) => p.target === 1).length;
      await step(tag + ' fix', () => TAL.debug.fixAll(true), 2500);
      const back = TAL.app.inst.parts.filter((p) => p.target === 1).length;
      let mission = '-';
      if (TAL.app.inst.parts.some((p) => p.symptom)) { await step(tag + ' mission', () => TAL.debug.startMission(), 200); mission = TAL.debug.state().mission ? TAL.debug.state().mission.broken : 'none'; await step(tag + ' stopmission', () => TAL.debug.startMission(), 100); }
      out.push(`${tag}: ${n} parts, out ${outN}, left after fix ${back}, mission ${mission}, ${crit}`);
    }
  }
  const worlds = Object.keys(TAL.worlds);
  let wok = 0;
  for (const id of worlds) {
    await step(id + ' host', () => { TAL.debug.openDevice('flashlight', 3); const b = TAL.app.inst.byId.bat1; b.inside = id; b.hasInside = true; TAL.debug.dive('bat1'); }, 1100);
    if (!TAL.app.inst || TAL.app.inst.def.id !== id) { errs.push(id + ': did not open'); continue; }
    await step(id + ' poke', () => { if (TAL.app.inst.def.dial) { TAL.debug.dial(); TAL.debug.dial(); } else { TAL.debug.togglePower(); TAL.debug.togglePower(); } }, 300);
    await step(id + ' explode', () => TAL.debug.explodeAll(), 900);
    await step(id + ' fix', () => TAL.debug.fixAll(true), 900);
    wok++;
  }
  out.push(`worlds ok ${wok} of ${worlds.length}`);
  removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr);
  out.push('ERRORS: ' + (errs.length ? errs.join(' | ') : 'none'));
  return out.join('\n');
})()
