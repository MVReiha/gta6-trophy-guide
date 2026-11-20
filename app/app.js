// GTA VI Trophy Guide & Tracker: checklist saved in localStorage, with grade/kind/
// search filters, a missable-only view, a spoiler setting that hides story trophies
// until earned, export/import of progress, and the 7-stage roadmap to the platinum.
// Loads only its own files (data/trophies.json); makes no network request.
const CHECKLIST_KEY = 'gta6-trophy-checklist-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';

const cardsEl = document.getElementById('cards');
const progressEl = document.getElementById('progress');
const progressFill = document.getElementById('progressFill');
const gradeCountsEl = document.getElementById('gradeCounts');
const resultCountEl = document.getElementById('resultCount');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const missableOnlyEl = document.getElementById('missableOnly');
const hideEarnedEl = document.getElementById('hideEarned');
const spoilerEl = document.getElementById('spoiler');

let earned = new Set(loadChecklist());
let doc = null;

function loadChecklist() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveChecklist() {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...earned]));
}

function loadSpoilerSetting() {
  const raw = localStorage.getItem(SPOILER_KEY);
  return raw === null ? true : raw === 'true';
}

function saveSpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, String(spoilerEl.checked));
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', activity: 'Activity', collectible: 'Collectible',
    crime: 'Crime', money: 'Money', misc: 'Misc',
    completion: '100% completion', platinum: 'Platinum',
  };
  return labels[kind] ?? kind;
}

function trophyIsHidden(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function trophyMatches(trophy) {
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) return false;
  if (missableOnlyEl.checked && !trophy.missable) return false;
  if (hideEarnedEl.checked && earned.has(trophy.name)) return false;
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function buildCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(trophy.name) ? ' earned' : '');
  const hidden = trophyIsHidden(trophy);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveChecklist();
    renderCards();
    renderProgress();
  });
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  head.append(box, name);
  card.append(head);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = `badge ${trophy.grade}`;
  gradeBadge.textContent = trophy.grade;
  badges.append(gradeBadge);
  const kindBadge = document.createElement('span');
  kindBadge.className = 'badge kind';
  kindBadge.textContent = kindLabel(trophy.kind);
  badges.append(kindBadge);
  if (trophy.secret) {
    const secretBadge = document.createElement('span');
    secretBadge.className = 'badge secret';
    secretBadge.textContent = 'Secret on PSN';
    badges.append(secretBadge);
  }
  if (trophy.missable) {
    const missBadge = document.createElement('span');
    missBadge.className = 'badge missable';
    missBadge.textContent = 'Potentially missable';
    badges.append(missBadge);
  }
  const pointsBadge = document.createElement('span');
  pointsBadge.className = 'badge';
  pointsBadge.textContent = `${trophy.points} pts`;
  badges.append(pointsBadge);
  card.append(badges);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-hidden';
    note.textContent = 'Spoiler-free mode hides this story trophy until you earn it. Tick the box when you have earned it in-game to reveal its name, description and guide — or switch the spoiler setting off above.';
    card.append(note);
    return card;
  }

  const descLabel = document.createElement('p');
  descLabel.className = 'label';
  descLabel.textContent = 'Official description';
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = trophy.description;
  card.append(descLabel, desc);

  const guideLabel = document.createElement('p');
  guideLabel.className = 'label';
  guideLabel.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = trophy.guide;
  card.append(guideLabel, guide);

  if (trophy.missable && trophy.missable_note) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = trophy.missable_note;
    card.append(note);
  }

  const source = document.createElement('p');
  source.className = 'source-line';
  source.textContent = `Source: ${trophy.source ?? 'Exophase trophy list — official name, description and grade.'}`;
  card.append(source);
  return card;
}

function renderCards() {
  cardsEl.replaceChildren();
  const shown = doc.trophies.filter(trophyMatches);
  for (const trophy of shown) cardsEl.append(buildCard(trophy));
  emptyEl.hidden = shown.length !== 0;
  resultCountEl.textContent = `Showing ${shown.length} of ${doc.trophies.length} trophies` +
    (missableOnlyEl.checked ? ' — missable only' : '');
}

function renderProgress() {
  const total = doc.trophies.length;
  const totalPoints = doc.trophies.reduce((sum, t) => sum + (t.points || 0), 0);
  const earnedPoints = doc.trophies
    .filter((t) => earned.has(t.name))
    .reduce((sum, t) => sum + (t.points || 0), 0);
  const pct = total === 0 ? 0 : Math.round((earned.size / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressEl.textContent = `${earned.size} of ${total} earned · ${earnedPoints.toLocaleString()} / ${totalPoints.toLocaleString()} points · ${pct}% to the platinum`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const inGrade = doc.trophies.filter((t) => t.grade === grade);
    const done = inGrade.filter((t) => earned.has(t.name)).length;
    return `${done}/${inGrade.length} ${grade}`;
  });
  gradeCountsEl.textContent = counts.join(' · ') +
    ` · ${doc.trophies.filter((t) => t.missable).length} potentially missable`;
}

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const item = document.createElement('li');
    const stageLabel = document.createElement('p');
    stageLabel.className = 'stage';
    stageLabel.textContent = `Stage ${stage.stage} of ${(doc.roadmap ?? []).length}`;
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const note = document.createElement('p');
    note.textContent = stage.note;
    const trophies = document.createElement('p');
    trophies.className = 'stage-trophies';
    trophies.textContent = stage.trophies;
    item.append(stageLabel, title, note, trophies);
    list.append(item);
  }
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('expected an array or an object with an earned array');
    const known = new Set(doc.trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveChecklist();
    renderCards();
    renderProgress();
  } catch (error) {
    alert(`Could not import that file: ${error.message}`);
  }
}

async function loadGuide() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json failed to load (${response.status})`);
  doc = await response.json();
  spoilerEl.checked = loadSpoilerSetting();
  renderRoadmap();
  renderCards();
  renderProgress();
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear every tick on the checklist?')) return;
  earned = new Set();
  saveChecklist();
  renderCards();
  renderProgress();
});
for (const element of [searchEl, gradeEl, kindEl, missableOnlyEl, hideEarnedEl]) {
  element.addEventListener('input', renderCards);
  element.addEventListener('change', renderCards);
}
spoilerEl.addEventListener('change', () => {
  saveSpoilerSetting();
  renderCards();
});

loadGuide().catch((error) => {
  cardsEl.replaceChildren();
  const message = document.createElement('p');
  message.className = 'empty';
  message.textContent = `The trophy list could not be loaded: ${error.message}`;
  cardsEl.append(message);
});
