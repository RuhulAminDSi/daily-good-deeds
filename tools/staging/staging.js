// Local staging (T-P2-PLAT-010, DL-040): a production build of web + api + worker on this machine,
// against the Neon `staging` branch, published on the internet with Tailscale Funnel as
// https://daily-deeds.<tailnet>.ts.net (DL-040: the owner opens it from a phone on mobile data).
//
//   pnpm staging                  build → migrate → start → publish → smoke; Ctrl+C stops and unpublishes
//   pnpm staging -- --skip-build  reuse the last build
//
// The hostname belongs to a second, userspace Tailscale node run only for staging, so this
// machine's own node (and anything it already serves) is untouched. Setup: docs/qa/STAGING.md.
// Windows only: staging runs on the owner's machine.
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { smoke } from './smoke.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const API_DIR = resolve(ROOT, 'apps/api');
const WEB_DIR = resolve(ROOT, 'apps/web');
const ENV_FILE = resolve(API_DIR, '.env.staging');
const WEB_PORT = 3200;
const HOSTNAME = 'daily-deeds';

const TAILSCALE = 'C:\\Program Files\\Tailscale\\tailscale.exe';
const TAILSCALED = 'C:\\Program Files\\Tailscale\\tailscaled.exe';
const TS_STATE = join(process.env.LOCALAPPDATA ?? '', 'dgd-tailscale');
const TS_SOCKET = '\\\\.\\pipe\\dgd-tailscaled';

const fail = (message) => {
  console.error(`staging: ${message}`);
  process.exit(1);
};
if (process.platform !== 'win32') fail('staging runs on Windows only (docs/qa/STAGING.md)');

/** Runs a setup step in the foreground; aborts staging when it fails. */
function step(title, command, args, options = {}) {
  console.log(`\n▶ ${title}`);
  // `shell` resolves pnpm's .cmd shim; arguments here never contain user input.
  const { status } = spawnSync(command, args, { stdio: 'inherit', shell: true, ...options });
  if (status !== 0) fail(`${title} failed (exit ${status})`);
}

/** Calls `fn` until it returns something truthy, or gives up after `timeoutMs` (undefined). */
async function poll(fn, timeoutMs, intervalMs = 500) {
  for (const deadline = Date.now() + timeoutMs; Date.now() < deadline;) {
    const value = await fn();
    if (value) return value;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return undefined;
}

async function waitFor(url, timeoutMs = 90_000) {
  const up = await poll(
    () =>
      fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) }).then(
        (res) => res.status < 500,
        () => false, // not listening yet
      ),
    timeoutMs,
  );
  if (!up) throw new Error(`${url} did not come up within ${timeoutMs / 1000} s`);
}

/** The staging node's CLI. */
const ts = (...args) =>
  execFileSync(TAILSCALE, [`--socket=${TS_SOCKET}`, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const tsStatus = () => {
  try {
    return JSON.parse(ts('status', '--json'));
  } catch {
    return undefined; // daemon not running
  }
};

const children = [];
let stopping = false;

/** Keeps a long-running child; if it dies, staging stops. */
function supervise(name, child) {
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(`staging: ${name} exited (code ${code}); stopping everything`);
      void stop(1);
    }
  });
  children.push(child);
}

/** Starts an app process with its output prefixed by its name. */
function start(name, args, options) {
  const child = spawn(process.execPath, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const [stream, out] of [
    [child.stdout, process.stdout],
    [child.stderr, process.stderr],
  ]) {
    createInterface({ input: stream }).on('line', (line) => out.write(`[${name}] ${line}\n`));
  }
  supervise(name, child);
}

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  try {
    ts('funnel', '--https=443', 'off');
  } catch {
    // never published, or the daemon is already gone
  }
  for (const child of children) child.kill();
  process.exit(code);
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());

/** Starts the staging node (if not already running) and logs it in once; returns its DNS name. */
async function tailnetNode() {
  if (!tsStatus()) {
    mkdirSync(TS_STATE, { recursive: true });
    const log = openSync(join(TS_STATE, 'tailscaled.log'), 'a');
    // Userspace networking: no TUN adapter, no admin rights, no effect on this machine's own node.
    // `--windows-mode=dev` allows a hand-run daemon on its own pipe. Its log goes to a file.
    const args = [
      '--windows-mode=dev',
      '--tun=userspace-networking',
      `--statedir=${TS_STATE}`,
      `--socket=${TS_SOCKET}`,
      '--port=0',
    ];
    supervise(
      'tailscaled',
      spawn(TAILSCALED, args, { cwd: TS_STATE, stdio: ['ignore', log, log] }),
    );
    if (!(await poll(tsStatus, 15_000))) throw new Error('the staging tailscaled did not start');
  }
  // A restarted daemon reconnects by itself (state is kept); wait until it settles.
  const state = await poll(() => {
    const s = tsStatus()?.BackendState;
    return s === 'Running' || s === 'NeedsLogin' ? s : undefined;
  }, 10_000);
  if (state !== 'Running') {
    console.log(`\n▶ log in the "${HOSTNAME}" tailnet node (once): open the URL below`);
    // Unattended: on Windows the node otherwise stops when this CLI disconnects.
    const login = ['up', `--hostname=${HOSTNAME}`, '--unattended', '--timeout=600s'];
    const { status } = spawnSync(TAILSCALE, [`--socket=${TS_SOCKET}`, ...login], {
      stdio: 'inherit',
    });
    if (status !== 0) throw new Error('tailnet login did not complete');
  }
  // The DNS name arrives with the first network map, shortly after login.
  const dnsName = (await poll(() => tsStatus()?.Self?.DNSName, 10_000))?.replace(/\.$/, '');
  if (!dnsName?.startsWith(`${HOSTNAME}.`)) {
    throw new Error(
      `the node is named ${dnsName}; free the name "${HOSTNAME}" in the admin console`,
    );
  }
  return dnsName;
}

// --- configuration -------------------------------------------------------------------------------
if (!existsSync(ENV_FILE)) fail(`missing ${ENV_FILE} (see docs/qa/STAGING.md)`);
const apiEnv = parseEnv(readFileSync(ENV_FILE, 'utf8'));
if (!apiEnv.PORT) fail(`set PORT in ${ENV_FILE}`);
const apiUrl = `http://127.0.0.1:${apiEnv.PORT}`;
const webUrl = `http://127.0.0.1:${WEB_PORT}`;
// A previous staging killed without Ctrl+C leaves its processes running on Windows; the smoke test
// would then pass against the old build.
for (const url of [apiUrl, webUrl]) {
  const inUse = await fetch(url, { signal: AbortSignal.timeout(2000) }).then(
    () => true,
    () => false,
  );
  if (inUse) fail(`${url} is already in use: is another staging running? (docs/qa/STAGING.md)`);
}
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const dirty = git('status', '--porcelain', '--untracked-files=no') ? '-dirty' : '';
const release = `${git('rev-parse', '--short', 'HEAD')}${dirty}`;

try {
  const publicUrl = `https://${await tailnetNode()}`;

  if (!process.argv.includes('--skip-build')) {
    step(
      'build api + web',
      'pnpm',
      ['turbo', 'run', 'build', '--filter=@dgd/api', '--filter=@dgd/web'],
      {
        cwd: ROOT,
        env: { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_APP_RELEASE: release },
      },
    );
  }
  step('apply migrations (staging branch)', 'pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: API_DIR,
    env: { ...process.env, ...apiEnv },
  });

  // Values from the env file win over this shell's (e.g. a dev NODE_ENV). The public origin is
  // derived from the node, so it can't drift from the env file.
  const serverEnv = { ...process.env, ...apiEnv, WEB_ORIGINS: publicUrl, APP_RELEASE: release };
  start('api', ['dist/main.js'], { cwd: API_DIR, env: serverEnv });
  start('worker', ['dist/worker.js'], { cwd: API_DIR, env: serverEnv });
  start(
    'web',
    [
      'node_modules/next/dist/bin/next',
      'start',
      '--port',
      String(WEB_PORT),
      '--hostname',
      '127.0.0.1',
    ],
    {
      cwd: WEB_DIR,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        API_URL: apiUrl,
        NEXT_PUBLIC_APP_RELEASE: release,
      },
    },
  );
  await Promise.all([waitFor(`${apiUrl}/api/v1/health/live`), waitFor(`${webUrl}/en`)]);

  ts('funnel', '--bg', '--https=443', webUrl);
  // The first HTTPS request makes the node fetch its TLS certificate, which can take a while.
  console.log(`\n▶ publishing ${publicUrl} (first run fetches a TLS certificate)`);
  await waitFor(`${publicUrl}/en`, 180_000);
  console.log(`\n▶ smoke test via ${publicUrl}`);
  if (!(await smoke(publicUrl, apiUrl))) throw new Error('smoke test failed');
  console.log(`\n✔ staging ${release} is up: ${publicUrl} (public, via Funnel). Ctrl+C to stop.\n`);
} catch (err) {
  console.error(`staging: ${err instanceof Error ? err.message : String(err)}`);
  await stop(1);
}
