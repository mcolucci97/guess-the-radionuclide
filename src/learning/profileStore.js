// Browser-local only. A blocked/failed store never prevents gameplay.
const copy = value => value == null ? null : structuredClone(value);
export class MemoryProfileStore {
  constructor() { this.values = new Map(); this.kind = 'memory'; }
  async load(key = 'primary') { return copy(this.values.get(key)); }
  async save(value, key = 'primary') { this.values.set(key, copy(value)); }
}
export class BrowserProfileStore {
  constructor({indexedDB, localStorage} = {}) {
    this.memory = new MemoryProfileStore(); this.kind = 'memory';
    try { this.idb = indexedDB === undefined ? globalThis.indexedDB : indexedDB; } catch {}
    try { this.storage = localStorage === undefined ? globalThis.localStorage : localStorage; } catch {}
    this.dbPromise = null;
  }
  async database() {
    if (!this.idb) throw new Error('No IndexedDB');
    if (!this.dbPromise) this.dbPromise = new Promise((resolve, reject) => {
      const request = this.idb.open('rn-learning-v1', 1);
      const timeout = setTimeout(() => reject(new Error('Storage timeout')), 1500);
      request.onupgradeneeded = () => request.result.createObjectStore('profiles');
      request.onsuccess = () => {clearTimeout(timeout); resolve(request.result);};
      request.onerror = request.onblocked = () => {clearTimeout(timeout); reject(request.error || new Error('Storage blocked'));};
    });
    return this.dbPromise;
  }
  async operation(mode, key, value) {
    const db = await this.database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', mode), store = tx.objectStore('profiles');
      const request = mode === 'readonly' ? store.get(key) : store.put(copy(value), key);
      const timeout = setTimeout(() => {reject(new Error('Storage timeout')); try {tx.abort();} catch {}}, 1500);
      tx.oncomplete = () => {clearTimeout(timeout); resolve(request.result);};
      tx.onerror = tx.onabort = () => {clearTimeout(timeout); reject(tx.error || new Error('Storage failed'));};
    });
  }
  async load(key = 'primary') {
    // LocalStorage also holds a crash-safe latest snapshot. Prefer its timestamp if newer.
    let backup; try {backup = JSON.parse(this.storage?.getItem('rn-learning-v1:'+key) || 'null');} catch {}
    try {
      const value = await this.operation('readonly', key); this.kind = 'indexeddb';
      return copy((backup?.storageRevision || 0) > (value?.storageRevision || 0) || (backup?.lastUpdated || 0) > (value?.lastUpdated || 0) ? backup : value || backup);
    } catch { this.kind = backup ? 'localStorage' : 'memory'; return backup || this.memory.load(key); }
  }
  checkpoint(value, key = 'primary') {
    this.memory.values.set(key,copy(value));
    try {
      const old=JSON.parse(this.storage?.getItem('rn-learning-v1:'+key)||'null');
      if(!old||(old.storageRevision||0)<=(value.storageRevision||0))this.storage?.setItem('rn-learning-v1:'+key,JSON.stringify(value));
      if(this.storage)this.kind='localStorage';
    } catch {}
  }
  async save(value, key = 'primary') {
    this.checkpoint(value,key);
    try {await this.operation('readwrite', key, value); this.kind = 'indexeddb';} catch {}
  }
}
