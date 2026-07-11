#!/usr/bin/env node
/**
 * restructure-godot-only.js — moves ONLY Godot-related content into /godot/.
 * Everything else (index.html, products*, services*, contact, about, admin,
 * course/, Learn/, blog, legal, tech tools, marketing, etc.) is left exactly
 * where it is.
 *
 * USAGE:
 *   node restructure-godot-only.js            # dry run
 *   node restructure-godot-only.js --apply    # actually execute
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
function log(m) { console.log(m); }
function run(cmd) {
  if (!APPLY) { log(`  [dry-run] $ ${cmd}`); return ''; }
  return execSync(cmd, { stdio: 'pipe' }).toString();
}

function preflight() {
  let status;
  try { status = execSync('git status --porcelain').toString(); }
  catch (e) { console.error('ERROR: not a git repo.'); process.exit(1); }
  if (status.trim()) {
    console.error('ERROR: working tree not clean. Commit/stash first (and keep this script outside the repo, or commit it).');
    console.error(status);
    process.exit(1);
  }
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  if (branch === 'main' || branch === 'master') {
    log(`On "${branch}" — creating/switching to "godot-restructure" branch.`);
    run('git checkout -b godot-restructure 2>/dev/null || git checkout godot-restructure');
  } else {
    log(`Already on branch "${branch}" — continuing here.`);
  }
}

// Content overlaps within the Godot scope — NOT deleted, just moved with a
// -REVIEW suffix so you can read both and pick a winner.
const NEEDS_MANUAL_REVIEW = [
  ['/godot/course/index.html', '/godot/course/GDScourse-REVIEW.html'],
  ['/godot/visual-coder/visualcode-REVIEW.html', 'godotvisualcoder/index.html'],
];

// [from, to] — Godot-only. Folders first where a later file lands inside them.
const MOVES = [
  ['/godot/assets', 'godot/assets'],
  ['/godot/visual-coder', 'godot/visual-coder'],
  ['/godot/multiplayer/app', 'godot/multiplayer/app'],       // authenticated app (auth/callback/dashboard/register)
  ['/godot/store/admin', 'godot/store/admin'],
  ['/godot/assets/godot-player-script.html', 'godot/assets/godot-player-script.html'],

  ['/godot/index.html', 'godot/index.html'],
  ['/godot/course/index.html', 'godot/course/index.html'],
  ['/godot/course/GDScourse-REVIEW.html', 'godot/course/GDScourse-REVIEW.html'],
  ['/godot/course/free.html', 'godot/course/free.html'],
  ['/godot/course/mini-courses.html', 'godot/course/mini-courses.html'],
  ['/godot/course/starter-guide.html', 'godot/course/starter-guide.html'],
  ['/godot/course/gdscript-guide.html', 'godot/course/gdscript-guide.html'],
  ['/godot/gdscript.html', 'godot/gdscript.html'],
  ['/godot/assets/free.html', 'godot/assets/free.html'],
  ['/godot/assets/scripts.html', 'godot/assets/scripts.html'],
  ['/godot/tools-list.html', 'godot/tools-list.html'],

  ['/godot/multiplayer/index.html', 'godot/multiplayer/index.html'],
  ['/godot/multiplayer/server-setup.html', 'godot/multiplayer/server-setup.html'],
  ['/godot/multiplayer/cgrelay.html', 'godot/multiplayer/cgrelay.html'],
  ['/godot/multiplayer/cgrelay-guide.html', 'godot/multiplayer/cgrelay-guide.html'],
  ['/godot/multiplayer/cgrelay-trial.html', 'godot/multiplayer/cgrelay-trial.html'],

  ['/godot/visual-coder/visualcode-REVIEW.html', 'godot/visual-coder/visualcode-REVIEW.html'],
  ['/godot/assistant-pro.html', 'godot/assistant-pro.html'],
  ['/godot/mobile-game.html', 'godot/mobile-game.html'],
  ['/godot/connect.html', 'godot/connect.html'],
  ['/godot/touch-control.html', 'godot/touch-control.html'],
  ['/godot/pvp-game.html', 'godot/pvp-game.html'],
  ['/godot/store/games.html', 'godot/store/games.html'],
  ['/godot/store/assets.html', 'godot/store/assets.html'],
  ['/godot/store/stream-login.html', 'godot/store/stream-login.html'],  // verify manually — 0 "godot" keyword hits, but tied to gamestore.html
  ['/godot/services.html', 'godot/services.html'],
  ['/godot/cglive.html', 'godot/cglive.html'],
  ['/godot/livekit.html', 'godot/livekit.html'],
];

function exists(p) { return fs.existsSync(p); }

function gitMvSingle(from, to) {
  const dir = path.dirname(to);
  if (dir && dir !== '.') run(`mkdir -p "${dir}"`);
  log(`  git mv "${from}" "${to}"`);
  if (APPLY) {
    try { execSync(`git mv "${from}" "${to}"`, { stdio: 'pipe' }); }
    catch (e) { fs.renameSync(from, to); execSync('git add -A', { stdio: 'pipe' }); }
  }
}

function gitMv(from, to) {
  if (!exists(from)) { log(`  SKIP (missing, already moved?): ${from}`); return; }
  const fromIsDir = fs.statSync(from).isDirectory();
  const toExistsAsDir = exists(to) && fs.statSync(to).isDirectory();
  if (fromIsDir && toExistsAsDir) {
    log(`  MERGE "${from}/*" into existing "${to}/"`);
    for (const child of fs.readdirSync(from)) {
      gitMvSingle(path.join(from, child), path.join(to, child));
    }
    if (APPLY) { try { fs.rmdirSync(from); } catch (e) {} }
  } else {
    gitMvSingle(from, to);
  }
}

function walkFiles(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, exts, out);
    else if (exts.includes(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function rewriteReferences() {
  log('\n== Rewriting references to moved Godot paths (site-wide scan) ==');
  const files = walkFiles('.', ['.html', '.css', '.js']);
  const refMap = [];
  for (const [from, to] of MOVES) {
    const base = from.replace(/^\.?\//, '');
    for (const prefix of ['', './', '../', '../../']) {
      refMap.push([prefix + base, '/' + to]);
    }
  }
  refMap.sort((a, b) => b[0].length - a[0].length);

  let changed = 0;
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    for (const [oldRef, newRef] of refMap) {
      const esc = oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(["'(])${esc}(["')#?])`, 'g');
      content = content.replace(re, `$1${newRef}$2`);
    }
    if (content !== original) {
      changed++;
      log(`  updated references in: ${file}`);
      if (APPLY) fs.writeFileSync(file, content, 'utf8');
    }
  }
  log(`Reference rewrite touched ${changed} file(s).`);
}

function main() {
  log(APPLY ? '=== APPLYING Godot-only restructure ===' : '=== DRY RUN (pass --apply to execute) ===');
  preflight();

  log('\n== Moving Godot-related files/folders into /godot/ ==');
  MOVES.forEach(([from, to]) => gitMv(from, to));

  rewriteReferences();

  log('\n== Cleanup: remove now-empty leftover dirs (sale/ etc.) ==');
  for (const d of ['sale']) {
    if (exists(d) && fs.statSync(d).isDirectory() && fs.readdirSync(d).length === 0) {
      log(`  removing empty dir: ${d}`);
      if (APPLY) fs.rmdirSync(d);
    }
  }

  log('\n== NEEDS MANUAL REVIEW (content differs — pick a winner, not auto-deleted) ==');
  NEEDS_MANUAL_REVIEW.forEach(([a, b]) => log(`  - ${a}  <->  ${b}`));

  log('\n== Not touched by this script ==');
  log('  - index.html, products*, services*, contact.html, about.html, admin*.html — untouched');
  log('  - course/ folder — confirmed NOT Godot content, left in place');
  log('  - Learn/ (LMS) — already separate, left in place');
  log('  - Navigation redesign / components.js wiring — do this next, as a separate pass');

  if (!APPLY) log('\nDry run only — nothing changed. Re-run with --apply to execute.');
  else log('\nDone. Check `git status`, test locally, then commit.');
}

main();
