# GTA VI Trophy Guide &amp; Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/MVReiha/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/MVReiha/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

Entry for [make.fun](https://make.fun)'s "Build the best GTA 6 trophy guide" bounty
([gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01), $250 in USDC):
an offline static web app — guide and tracker for all 55 Grand Theft Auto VI
trophies on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze).

## What it is

- **Every trophy, with a real guide.** Each of the 55 trophies shows its official
  name, description and grade, plus a guide written in our own words: what to do,
  where and how, and when it can be missed.
- **Tracker.** Tick trophies off; progress is saved in the browser (localStorage)
  and can be exported to a JSON file and imported back. Progress bar with points
  (1,350 total) and per-grade counts.
- **Filters.** By grade, by kind (story, activities, collectibles, crime, money,
  misc), by search, missable-only, and hide-earned.
- **Spoiler setting.** On by default: story trophies stay hidden until you tick
  them earned, so the guide never spoils the story.
- **Roadmap to the platinum.** Seven stages built from the official descriptions:
  story first, stranger strands as they appear, partner and one-off moments, then
  activities, collectibles, crime and money cleanup, then the finale.
- **Missable flags.** 9 trophies are flagged *potentially missable* — the ones
  whose description names one specific event or needs your partner beside you.
- **Offline.** Static files under `app/` only. No build step, no network request
  at run time; open `app/index.html` in desktop Chrome with the network off.

## Sources & honesty

Official names, descriptions and grades come from the
[Exophase trophy list](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
(PSNProfiles lists the same 55); counts such as the 42 Shooting Range challenges,
14 drone-race locations, 18 meditation spots, 52 areas, 9 gangs and 8 garages are
the counts PlayStation tracks for those trophies. GTA VI launched 19 November 2026,
so no complete community walkthrough exists yet: every guide is written from the
official description, and any step that goes beyond the description is labelled
*inferred*, never presented as a verified fact. No Rockstar logo, artwork or game
screenshot is used anywhere.

## Run

```
node serve.ts
```

Serves `app/` at http://localhost:8080. Or open `app/index.html` directly from any
static file server with `app/` at its root.

## Hand in (the make.fun entry program)

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
`/output` and writes `/output/dossier.json` with the vendored
`vendor/makefun-frontend.ts` library. Deterministic: two runs write identical bytes.

## License

MIT
