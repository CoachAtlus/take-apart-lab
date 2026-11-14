// Headless Chrome driver: node shoot.mjs <outdir> <steps.json>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const [, , outDir, stepsFile] = process.argv;
const steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8'));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = Number(process.env.CDP_PORT || 9333);
const prof = outDir + '/prof';
const proc = { kill() {} }; void spawn; void prof; void chrome; const _unused = (['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1280,800', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', 'about:blank']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch (e) {} await sleep(250); }
const page = tabs.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const logs = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') logs.push('EXC ' + JSON.stringify(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
  if (d.method === 'Runtime.consoleAPICalled' && /error|warn/.test(d.params.type)) logs.push(d.params.type + ' ' + d.params.args.map((a) => a.value || a.description).join(' '));
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });
for (const s of steps) {
  if (s.size) await send('Emulation.setDeviceMetricsOverride', { width: s.size[0], height: s.size[1], deviceScaleFactor: 1, mobile: !!s.touch });
  if (s.size && s.touch) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  if (s.touchDrag) {
    // s.touchDrag = JS expression returning [x0,y0,x1,y1]
    const r = await send('Runtime.evaluate', { expression: s.touchDrag, returnByValue: true });
    const [x0, y0, x1, y1] = r.result.result.value;
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let i = 1; i <= 12; i++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / 12, y: y0 + ((y1 - y0) * i) / 12 }] }); await sleep(30); }
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    logs.push(`DRAG ${[x0, y0, x1, y1].map(Math.round)}`);
    await sleep(s.wait || 1200);
  }
  if (s.touchTap) {
    const r = await send('Runtime.evaluate', { expression: s.touchTap, returnByValue: true });
    const [x, y] = r.result.result.value;
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(60);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(s.wait || 1200);
  }
  if (s.go) { await send('Page.navigate', { url: s.go }); await sleep(s.wait || 2500); }
  if (s.js) { const r = await send('Runtime.evaluate', { expression: s.js, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) logs.push('JSERR ' + JSON.stringify(r.result.exceptionDetails.exception?.description)); else if (r.result?.result?.value !== undefined) logs.push('JS ' + JSON.stringify(r.result.result.value)); await sleep(s.wait || 1200); }
  if (s.shot) { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(`${outDir}/${s.shot}.png`, Buffer.from(r.result.data, 'base64')); }
}
console.log(logs.join('\n') || 'no errors');
ws.close(); proc.kill();
process.exit(0);
