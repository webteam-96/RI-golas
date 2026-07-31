# GOAL.SEEK — Zone 6 Goals & Hierarchy Prototype

Clickable React prototype for the RI Zone 6 goal-tracking presentation.
Four levels, no Assistant Governor layer: **Club → District → Zone → RI Director**.

Every level tracks the same **four goal areas** — Foundation, Membership, Public Image,
Projects. The tab strip never changes shape as you drill; only the scope of the numbers does.
The RI Director view has no zone layer: it goes straight from the four areas to the districts.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What it does

| Route | Screen |
|---|---|
| `/ri/overview` | The four goal areas, then all 9 districts directly — no zone layer |
| `/zone/coordinators` | RRFC + 5 ARRFCs — expand a coordinator to see their supported districts' data in place |
| `/zone/districts` | 9 districts, expandable to their clubs, sticky totals |
| `/zone/foundation` | All 24 Foundation metrics × 9 districts, in the workbook's own layout |
| `/zone/monthly-report` | The Zone 6 monthly coordinator report, sections 2/3/5/6 auto-filled |
| `/district/:id/goals` | District targets with the zone target alongside |
| `/club/:id/goals` | Club goal entry — edits roll up to District, Zone and RI immediately |

A role switcher in the top bar moves between the four levels. It is a demo affordance, not auth.

## Data

`src/data/foundationGoals.js` is generated from `docs/Foundation_Goals_Sample_Excel_Sheet_March 2026.xlsx`
— 24 Rotary Foundation metrics across the 9 Zone 6 districts, with the workbook's category codes
(40–52) preserved for round-tripping. Zone Annual Fund totals **$632,386**.

Club rosters exist for D3120 (42) and D3030 (4). The other seven districts render district-level
figures with an explicit "club-level data not yet loaded" state — never a zero.

Foundation figures are real for all nine districts. Membership, Public Image and Projects roll up
from club reports, so they only have values where a roster exists — and Public Image fields exist
only in the D3030 records. Those areas show dashes elsewhere rather than inventing zeros.

Rotary Year **2025–26, data as of March 2026**, matching the workbook. Goal status is pace-aware,
so this date drives every On Track / At Risk / Behind badge.

## Checks

```bash
node src/lib/rollup.test.mjs    # 11 checks — the roll-up engine
node src/lib/smoke.test.mjs     # 12 checks — data paths and the four-area structure
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
- Zone and district targets are seeded demo values, not client-supplied. All are editable.

See `docs/PRD.md` for the full specification.
