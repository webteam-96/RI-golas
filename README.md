# GOAL.SEEK — Zone 6 Goals & Hierarchy Prototype

Clickable React prototype for the RI Zone 6 goal-tracking presentation.
Four levels, no Assistant Governor layer: **Club → District → Zone → RI Director**.

Every report screen tracks the same **five categories** — Membership, Foundation, Public Image,
Projects, New Generation — from `REPORT_CATEGORIES`. The tab strip never changes shape as you
drill; only the scope of the numbers does. The older four-area `AREAS` list in `metrics.js`, which
has no New Generation, now drives `/zone/goals` alone. The RI Director view has no zone layer: it
goes straight from the categories to the districts.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Type is **Inter** for headings and body and **JetBrains Mono** for every figure, bundled locally
through `@fontsource` — replacing Zilla Slab + Open Sans + IBM Plex Mono. Nothing is fetched at
runtime, so the deck renders identically on a hall projector with no network.

## What it does

| Route | Screen |
|---|---|
| `/ri/overview` | The five categories over all 23 districts of Zones 5 & 6, with a zone filter — no zone drill layer |
| `/ri/coordinators` | RRFC + 5 ARRFCs — expand a coordinator to see their supported districts' data in place |
| `/zone/coordinators` | "My Districts" — the signed-in ARRFC's own supported districts, and nobody else's |
| `/zone/districts` | 9 districts, expandable to their clubs, with a totals row |
| `/zone/foundation` | All 24 Foundation metrics × 9 districts, in the workbook's own layout |
| `/zone/monthly-report` | The Zone 6 monthly coordinator report — sections 2–6 filled from the reported figures (Public Image is section 4, present and deliberately blank), plus section 7 for goal progress |
| `/district/:id/goals` | Where a governor enters the district's targets, beside the figure already achieved |
| `/club/:id/goals` | Club goal entry. Targets are written under the `club` scope, which only the club's own screens and the district's Clubs page read — nothing rolls up to District, Zone or RI |

A role switcher in the top bar moves between the four levels. It is a demo affordance, not auth.

## Data

`src/data/disha.js` carries the DISHA Zone 5 & 6 portal seed: **506 previous-year (2025-26) cells**
across all **23 districts** of both zones, covering **14 of the 27 fields** on the monthly
coordinator report. It holds **no Public Image data**, so those four rows are dashes at district
level. `PREVIOUS_YEAR` and `GOALS_YEAR` are exported from that file; screens interpolate them
rather than hardcoding a year.

**Targets are provisional.** The portal seeds none — its `goals` table holds a single test row,
every Target column in both consolidated workbooks is blank, and the live MySQL database carries
**1 goal row out of a possible 1,748** — because District Governors set theirs at the goal-setting
event. So the target beside each achieved figure is worked out in `src/data/dishaTargets.js` from
that district's or club's *own* 2025-26 reported number plus a growth uplift. It is not client
data, and every screen says so. A target typed on a Goals screen is real and replaces the
provisional one for that field. The thirteen unsourced fields have no reported figure to grow
from, so they stay blank on both sides. Replacing the provisional layer wholesale with the
client's real 2026-27 targets is a change to `src/data/dishaTargets.js` and nothing else.

`src/data/clubs.js` is a separate source, the AG-module datasets rather than the portal: 42 clubs
for D3120 and 4 for D3030. Those 4 D3030 clubs do carry Public Image figures, so club-level Public
Image exists where district-level does not — a difference in source, not a contradiction. Some club
USD figures in that file were FX-converted from INR at a fixed rate of **84** and render as reported
dollars. The file states no reporting period, so club screens do not claim one. The remaining
districts render district-level figures with an explicit "club-level data not yet loaded" state —
never a zero.

`src/data/foundationGoals.js` is generated from `docs/Foundation_Goals_Sample_Excel_Sheet_March 2026.xlsx`
— 24 Rotary Foundation metrics across the 9 Zone 6 districts, with the workbook's category codes
(40–52) preserved for round-tripping. Zone Annual Fund totals **$632,386**.

Targets are being set for Rotary Year **2026-27**. Every "Achieved" figure is what the district
reported for **2025-26** — a baseline, not progress inside the year being set.

No screen scores on a pace any more. A pace asks how far through the year you are, and no month
of 2026-27 has elapsed, so it scored a year that had not begun — an ambitious target turned a row
red and a modest one read "On Track". Every surface now measures the achieved figure against the
target and nothing else, a row with no target reads "No target" rather than being scored, and
"Near target" means the same 90% on `/zone/goals` as on the monthly report. `goalStatus()` keeps
its pace logic and its tests for when figures inside the live year exist.

## Checks

```bash
node src/lib/rollup.test.mjs    # 14 checks — the roll-up engine
node src/lib/smoke.test.mjs     # 15 checks — data paths and the four-area structure
node src/lib/disha.test.mjs     # 26 checks — the DISHA seed and the 27-field catalogue
```

Three rules the engine enforces, each with a test:

1. **Zone totals sum districts directly, never through coordinators.** D3120 is the RRFC's home
   district *and* an ARRFC's supported district — a coordinator-path sum double-counts it.
2. **Percentages are weighted by member count, never plain-averaged.** On five real Thane clubs a
   plain average reads 73.50% where the true figure is 58.84% — a 14.66-point overstatement.
3. **`null` is not `0`.** A club that did not report drops out of the numerator *and* the
   denominator, and coverage is stated on screen.

## Known data gaps

- **D3292 has no column in the Foundation workbook**; D3291 does. 3291's figures stand in for 3292
  and are footnoted wherever they appear. Needs confirming with the source.
- District region labels are placeholders for orientation. Confirm against the RI directory before
  showing this outside the room.
- **No real targets exist yet.** Governors enter them at the goal-setting event. Until then the
  target in each cell is a provisional figure derived from that district's or club's own 2025-26
  number — captioned as provisional wherever it appears, and never to be read as a client target.
- The portal carries no Public Image column, so all four of those fields are blank for all 23
  districts. Only the 4 D3030 clubs have figures, and they come from the club dataset.

See `docs/PRD.md` for the full specification.
