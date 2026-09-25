// Loaded only when entering online play. Offline modes never initialize Firebase.
import {initializeApp, getApps} from 'firebase/app';
import {getAuth, setPersistence, browserLocalPersistence, signInAnonymously, connectAuthEmulator} from 'firebase/auth';
import {getDatabase, connectDatabaseEmulator} from 'firebase/database';
let clientPromise;
export function firebaseClient() {
  if (!clientPromise) clientPromise = initialize().catch(error => { clientPromise = null; throw error; });
  return clientPromise;
}
async function initialize() {
  let config;
  try {
    const response = await fetch(new URL('./firebase-config.json', document.baseURI), {cache: 'no-store', signal: AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('configError');
    config = await response.json();
    for (const key of ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId']) if (typeof config[key] !== 'string' || !config[key] || config[key].includes('YOUR_')) throw new Error('configError');
  } catch { throw Object.assign(new Error('configError'), {code: navigator.onLine ? 'configError' : 'offline'}); }
  const app = getApps().find(a => a.name === 'multiplayer') || initializeApp(config, 'multiplayer');
  const auth = getAuth(app), database = getDatabase(app);
  // Build-only switch. Invite URLs and public runtime config cannot enable emulators.
  if (typeof __RN_EMULATORS__ !== 'undefined' && __RN_EMULATORS__) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings: true});
    connectDatabaseEmulator(database, '127.0.0.1', 9000);
  }
  await setPersistence(auth, browserLocalPersistence);
  await auth.authStateReady();
  const user = auth.currentUser || (await signInAnonymously(auth)).user;
  return {database, uid: user.uid};
}
