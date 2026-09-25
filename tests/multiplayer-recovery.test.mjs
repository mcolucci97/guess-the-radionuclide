import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {createMemoryHub} from '../src/multiplayer/memoryTransport.js';
import {RoomService} from '../src/multiplayer/roomService.js';

let useOnlineRoom, directory, dom;
before(async () => {
  dom = new JSDOM('<div id="root"></div>', {url: 'https://example.test/guess-the-radionuclide/'});
  for (const key of ['window', 'document', 'localStorage', 'location', 'history']) globalThis[key] = dom.window[key];
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  directory = await mkdtemp(join(tmpdir(), 'rn-recovery-'));
  const outfile = join(directory, 'hook.mjs');
  // Substitute only the transport boundary; exercise the actual React hook,
  // service and state transitions without a production Firebase project.
  await build({entryPoints: ['src/multiplayer/useOnlineRoom.js'], outfile, bundle: true, platform: 'node', format: 'esm', plugins: [{
    name: 'recovery-transport', setup(b) {
      b.onResolve({filter: /^react$/}, () => ({path: fileURLToPath(import.meta.resolve('react')), external: true}));
      b.onResolve({filter: /\/firebaseTransport\.js$/}, () => ({path: 'transport', namespace: 'test'}));
      b.onLoad({filter: /.*/, namespace: 'test'}, () => ({contents: 'export async function createFirebaseTransport() { return globalThis.__rnRecoveryTransport; }'}));
    }
  }]});
  ({useOnlineRoom} = await import(pathToFileURL(outfile)));
});
after(async () => {
  dom.window.close();
  for (const key of ['window', 'document', 'localStorage', 'location', 'history', 'IS_REACT_ACT_ENVIRONMENT', '__rnRecoveryTransport']) delete globalThis[key];
  await rm(directory, {recursive: true, force: true});
});

async function fixture() {
  const hub = createMemoryHub(), host = new RoomService(hub.connect('host')), guestTransport = hub.connect('guest'), guest = new RoomService(guestTransport);
  const code = await host.create({deckIds: ['H-3', 'F-18', 'C-14'], audience: 'adult', level: 'base', assist: 'assisted'});
  await guest.join(code); await host.selectSecret(code, 'H-3'); await guest.selectSecret(code, 'F-18');
  globalThis.__rnRecoveryTransport = guestTransport;
  localStorage.setItem('rn-online-resume-v1', JSON.stringify({code, uid: 'guest'}));
  history.replaceState(null, '', '/guess-the-radionuclide/');
  let latest;
  function Probe() { latest = useOnlineRoom(''); return null; }
  const root = createRoot(document.getElementById('root'));
  return {host, code, guestTransport, get latest() { return latest; },
    mount: () => act(async () => { root.render(React.createElement(Probe)); }),
    unmount: () => act(async () => { root.unmount(); })};
}

test('Recovery processes a guess received while another personal write is busy', async () => {
  const x = await fixture();
  try {
    await x.mount();
    let release, pending;
    const gate = new Promise(resolve => { release = resolve; });
    await act(async () => { pending = x.latest.run(() => gate); });
    assert.equal(x.latest.busy, true);
    await act(async () => { await x.host.guess(x.code, await x.host.transport.readRoom(x.code), 'F-18'); });
    assert.equal(x.latest.room.phase, 'guess');
    await act(async () => { release(); await pending; });
    assert.equal(x.latest.room.phase, 'finished');
    assert.equal(x.latest.room.winner, 1);
    const seq = x.latest.room.seq;
    await act(async () => {});
    assert.equal(x.latest.room.seq, seq, 'does not resolve the same guess twice');
  } finally { await x.unmount(); }
});

test('A failed recovery does not loop and an explicit retry resumes the pending phase', async () => {
  const x = await fixture();
  const transact = x.guestTransport.transactRoom;
  let attempts = 0;
  x.guestTransport.transactRoom = (...args) => {
    attempts++;
    return attempts === 1 ? Promise.reject(new Error('error')) : transact(...args);
  };
  try {
    await x.host.guess(x.code, await x.host.transport.readRoom(x.code), 'F-18');
    await x.mount();
    assert.equal(x.latest.error, 'error');
    assert.equal(x.latest.busy, false);
    assert.equal(attempts, 1);
    await act(async () => {});
    assert.equal(attempts, 1);
    await act(async () => { x.latest.retry(); });
    assert.equal(x.latest.room.phase, 'finished');
    assert.equal(attempts, 2);
  } finally { await x.unmount(); }
});
