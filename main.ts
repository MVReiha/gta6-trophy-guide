// A working gta6-trophy-guide-01 entry (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json. The program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Only the plumbing, not a winner: a plain checklist of the 55 trophies with a one-line hint each. Write a real guide
// for every trophy in your own words, a roadmap to the platinum, filters and a spoiler setting in app/, put 3 or 4 PNG
// or JPEG screenshots of it in screenshots/ (the first by name is the cover; shots.json says which views this
// starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

// Entry: GTA VI Trophy Guide & Tracker (gta6-trophy-guide-01).
// The guide itself is app/: a dark-theme offline tracker over all 55 official PS5
// trophies (app/data/trophies.json) — every trophy with its official name, description
// and grade, a guide written in our own words from the official description, a
// 7-stage roadmap to the platinum, 9 potentially-missable flags, grade/kind/search
// filters, a spoiler setting, and export/import of checklist progress.
// This program only hands the guide in: copy app/ + screenshots/ to /output and
// write /output/dossier.json with the vendored make.fun library (unchanged).
// Deterministic by construction: same input files, same output bytes, every run.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
// Hand in exactly what the guide is: no generated files, no timestamps in the
// output — buildDossier reads app/ and screenshots/ as they stand, so two runs
// over the same tree write identical bytes. Fail loudly if the guide is missing
// rather than handing in an empty app/ directory.
if (!existsSync(join(here, 'app', 'index.html')) || !existsSync(join(here, 'app', 'data', 'trophies.json'))) {
  throw new Error('gta6-trophy-guide: app/index.html or app/data/trophies.json is missing; nothing to hand in');
}
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('gta6-trophy-guide: screenshots/ is missing; the entry needs 3 or 4 screenshots');
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
