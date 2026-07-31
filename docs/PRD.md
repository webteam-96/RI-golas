# PRD — Multi-Level Goals & Hierarchy Module

**Product:** GOAL.SEEK (`webteam-96/AG_module`)
**Module:** Goal Entry, Goal Tracking & Hierarchical Roll-up — **Club → District → Zone → RI Director**
**Version:** 2.0
**Date:** 31 July 2026
**Status:** Draft for approval
**Deliverable:** Clickable React prototype for stakeholder presentation (mock data, no backend)

---

## 1. Context

### 1.1 What exists today

`AG_module` is a Vite + React 18 SPA (**JavaScript, not TypeScript** — `jsconfig.json`, no TS deps) deployed at `ag-module.vercel.app`. Three dashboard modules ship today:

| Route | Module path | Pages |
|---|---|---|
| `/agdashboard` | `src/modules/ag/` | My Clubs, Club Detail, Membership, TRF & Foundation, Club Excellence, Youth Services, Service Projects, District View |
| `/clubdashboard` | `src/modules/club/` | Overview, Foundation, Membership, Avenue of Service, E-Governance, Communication, Website Data, Payments, Directory |
| `/districtdashboard` | `src/modules/district/` | Overview, Membership, Foundation, Communication, E-Governance, Website Data |

**Stack (`package.json`):** React 18.2 · Vite 5 · react-router-dom 6.22 · TailwindCSS 3.4 · `@base-ui/react` 1.3 (**not** Radix) · Recharts 2.12 · lucide-react 0.344 · `xlsx` 0.18 (already wired in `src/utils/exportExcel.js`) · `@fontsource-variable/geist`.

**Docs convention:** `docs/superpowers/specs/YYYY-MM-DD-*.md` (design specs) and `docs/superpowers/plans/YYYY-MM-DD-*.md` (implementation plans). This PRD is the product-level document those specs descend from.

### 1.2 Scope decision — four levels, no AG

The hierarchy in this module is **Club → District → Zone → RI Director**. The Assistant Governor is **not** a level.

The existing `/agdashboard` module stays in the codebase untouched and continues to work; it is simply **out of scope** for this module and does not appear in the hierarchy, the role switcher, or any new screen.

**Consequence — a naming rule.** The codebase currently uses "Zone" to mean *a cluster of clubs inside a district* (`src/modules/district/data/agData.js` → `ZONES = [{ zoneName: 'Zone A', agName: 'Anita Mehta', clubs: [...] }]`; `src/data/district3192.js` → 7 zones A–G with ambassadors). Rotary International uses "Zone" to mean *a group of districts under an RI Director* — Zone 6.

In every screen this module builds, **"Zone" means the RI Zone**. The intra-district `ZONES` constants are legacy, belong to the out-of-scope AG module, and must not be surfaced in any new view. No rename of legacy code is required; the rule is that new code never uses the word for the old meaning.

### 1.3 Data sources

**Source 1 — `Foundation_Goals_Sample_Excel_Sheet_March 2026.xlsx` (repo root).** This is the real RRFC Foundation goals workbook: **24 goal metrics as rows, 44 districts as columns**, March 2026. It is the authoritative goal catalogue and the authoritative district-level actuals for the Foundation track. Sheet `Foundation`, columns `SrNo · Number1_Dont_change (category code 40–52) · Category · Input Type · <district columns>`.

**Source 2 — club-level datasets in `src/data/`.** Three unrelated district datasets with no shared schema or ID space:

| File | District | Clubs | Shape |
|---|---|---|---|
| `src/data/realData.js` | 3142 | 4 | flat — `members`, `femaleMembers`, `myRotaryCount`, `avgAttendance`, `newMembers`, `terminatedMembers`, `goals{}`, `trf{}`, `citationScore`; club `id: 15530` (**number**) |
| `src/data/district3192.js` | 3192 | 43 in array, **93 claimed** in `DISTRICT_TOTALS` | nested — `membership{}`, `trf{}`, `excellence{}`, `sponsored{}`, `serviceProjects{}`; club `id: '15766'` (**string**) |
| `src/modules/district/data/*.js` | 5656 | 6 | minimal — name, meeting day, member count; **no club IDs at all** |

Neither 3142, 3192 nor 5656 is a Zone 6 district (§2.1). They are the only club-level data in the repo, so they serve as **club-depth samples** re-parented into Zone 6 districts for drill-down (§3.3), clearly labelled as such.

### 1.4 The three problems

1. **Goals are read-only and hard-coded.** `realData.js` clubs carry `goals: { membershipGrowth, trfPerCapita, projects, attendance, myRotary, newMembers }` — six *actuals* with no targets stored anywhere. `district3192.js` carries `excellence: { goalsSet: 18, goalsCompleted: 18 }` — a *count* with no visibility into which goals. There is no screen anywhere to enter, edit, or attribute a goal.
2. **The hierarchy stops at District** — no Zone, no RI Director. The Zone 6 coordinator report has nowhere to live.
3. **The club data underneath does not connect** — three schemas, three ID formats, one dataset with no IDs at all, and a totals object claiming 93 clubs where the array holds 43.

---

## 2. Zone 6 — the real structure

### 2.1 Coordinators and districts

Zone 6's Rotary Foundation coordinator team, as supplied:

| Role | Name | Home district | Districts supported |
|---|---|---|---|
| **RRFC** — Regional Rotary Foundation Coordinator | **Rtn Pramod Kumar** | 3120 | *Zone-wide* |
| ARRFC — Assistant RRFC | PDG Rtn Dr Anand Ashok Jhunjhunuwala | 3030 | 3030, 3120 |
| ARRFC | PDG Rtn Pawan Agarwal | 3110 | 3110, 3100 |
| ARRFC | PDG Rtn Dr Mohan Shyam Konwar | 3240 | 3240 |
| ARRFC | PDG Rtn Shashi Varvandkar | 3261 | 3261, 3262 |
| ARRFC | MN JHA | 3292 | 3292, 3250 |

**Zone 6 districts (9):** 3030 · 3100 · 3110 · 3120 · 3240 · 3250 · 3261 · 3262 · 3292

### 2.2 Two structural facts that drive the design

**Fact 1 — coordinator → district is many-to-many.** District 3120 is RRFC Pramod Kumar's home district *and* is supported by ARRFC Jhunjhunuwala. A coordinator may support two districts; a district may be touched by two coordinators.

> **Therefore zone totals must be computed Zone → District directly, never Zone → Coordinator → District.** Summing through the coordinator layer double-counts 3120. The coordinator layer is a **view/grouping**, exactly like a filter — never an arithmetic path. This is verified in §8.1.

**Fact 2 — district 3292 is absent from the Foundation workbook.** The sheet has columns for 3030, 3100, 3110, 3120, 3240, 3250, 3261, 3262 and **3291** — but no 3292. Options are (a) 3291 is a typo for 3292 in the source data, or (b) 3292's column was genuinely not collected. The prototype uses **3291's figures as a stand-in for 3292, rendered with a `data source: 3291` footnote**, and the discrepancy is listed for the client to resolve. It is not silently hidden.

### 2.3 Real Zone 6 Foundation actuals (from the workbook, March 2026)

| District | Annual Fund ($) | PHF | Major Donors | PHSM | Endowment | Per-capita $25+ | CSR w/ RFI |
|---|---:|---:|---:|---:|---:|---:|---:|
| 3030 | 47,581 | 112 | 2 | — | 2 | 6 | 1 |
| 3100 | 26,964 | 29 | 3 | 3 | 1 | 13 | — |
| 3110 | 26,416 | 35 | 1 | 2 | — | 10 | 4 |
| 3120 | 106,328 | 133 | 2 | — | 1 | 24 | — |
| 3240 | 123,339 | 82 | 5 | 9 | 1 | 38 | — |
| 3250 | 123,286 | 138 | 6 | 2 | 1 | 36 | — |
| 3261 | 8,966 | 31 | 1 | 1 | — | 2 | — |
| 3262 | 41,293 | 70 | 2 | 9 | — | 14 | — |
| 3292 ⁽*⁾ | 128,213 | 55 | 3 | 1 | 1 | 31 | — |
| **ZONE 6** | **632,386** | **685** | **25** | **27** | **7** | **174** | **5** |

⁽*⁾ figures sourced from column 3291 — see §2.2 Fact 2.

Grouped by coordinator (a **view** of the same rows, not a second summation path):

| ARRFC | Districts | Annual Fund ($) | PHF | Major Donors | PHSM |
|---|---|---:|---:|---:|---:|
| PDG Rtn Dr Anand Ashok Jhunjhunuwala | 3030, 3120 | 153,909 | 245 | 4 | — |
| PDG Rtn Pawan Agarwal | 3110, 3100 | 53,380 | 64 | 4 | 5 |
| PDG Rtn Dr Mohan Shyam Konwar | 3240 | 123,339 | 82 | 5 | 9 |
| PDG Rtn Shashi Varvandkar | 3261, 3262 | 50,259 | 101 | 3 | 10 |
| MN JHA | 3292, 3250 | 251,499 | 193 | 9 | 3 |
| **Total** | **9 districts** | **632,386** | **685** | **25** | **27** |

The coordinator-grouped total and the district-summed total agree at **$632,386** — because each district is counted exactly once, with 3120 attributed to Jhunjhunuwala and not re-added under the RRFC. That equality is acceptance criterion **A6**.

---

## 3. Hierarchy model

```
RI Director
   │
   └── Zone                    Zone 6
         │                     RRFC Rtn Pramod Kumar  +  5 ARRFCs
         │                     (coordinator = a grouping lens, not a summation level)
         │
         └── District          3030 · 3100 · 3110 · 3120 · 3240 · 3250 · 3261 · 3262 · 3292
               │               District Governor / DRFC
               │
               └── Club
```

**Rules**
- A club belongs to exactly one district; a district to exactly one zone.
- Coordinators sit **beside** the district level as an assignment map, not inside the roll-up chain.
- Everything rolls up. Nothing rolls sideways.

### 3.1 Data unification (P0 — prerequisite)

Create `src/data/hierarchy/` with one normaliser per source, all emitting one shape:

```js
// src/data/hierarchy/schema.js
/**
 * @typedef {Object} Club
 * @property {string} id           RI club ID as STRING — '15530', '15766'
 * @property {string} name
 * @property {string} districtId   '3120'
 * @property {Membership} membership
 * @property {TRF} trf
 * @property {Service} service
 * @property {Excellence} excellence
 * @property {Officer} president
 * @property {Officer} secretary
 */

/**
 * @typedef {Object} Membership
 * @property {number}      atRYStart   3142: membersPrev       | 3192: membership.atJuly
 * @property {number}      current     3142: members           | 3192: membership.current
 * @property {number|null} newMembers  3142: newMembers        | 3192: null
 * @property {number|null} terminated  3142: terminatedMembers | 3192: null
 * @property {number}      female      3142: femaleMembers     | 3192: membership.female
 * @property {number}      myRotary    3142: myRotaryCount     | 3192: membership.myRotary
 * @property {number|null} attendance  3142: avgAttendance     | 3192: null
 */

/**
 * @typedef {Object} TRF
 * @property {number} annualUSD     3142: trf.annual    | 3192: trf.annualFund
 * @property {number} polioUSD      3142: trf.polio     | 3192: trf.polioPlus
 * @property {number} endowmentUSD  3142: trf.endowment | 3192: trf.endowment
 * @property {number} otherUSD      3142: others+globalGrant | 3192: trf.otherFunds
 * @property {number} totalUSD
 * @property {number} totalINR      converted at FX_RATE where the source is USD-only
 * @property {number|null} donors, newDonors    3192 only
 */

/** @typedef {Object} Service  @property {number} projects, volunteers?, manHours?, cost? */
/** @typedef {Object} Excellence @property {number} goalsSet, goalsCompleted, duesOutstanding
 *  @property {boolean} awardEarned  @property {number|null} citationScore */
```

**Missing fields resolve to `null`, never `0`.** A `null` renders `—` and is **excluded from roll-up numerators and denominators**. Coercing a missing attendance figure to zero silently drags a district average down — the same class of bug as the weighted-mean rule in §8.1, and refused the same way: by not inventing data. Every rolled-up figure carries a coverage note — *"Attendance — 38 of 43 clubs reporting."*

### 3.2 Zone assembly

```js
// src/data/hierarchy/index.js
export const ZONES = [{
  id: 'zone-6', number: 6, name: 'Zone 6',
  rrfc: { name: 'Rtn Pramod Kumar', role: 'RRFC', homeDistrict: '3120' },
  coordinators: [
    { name: 'PDG Rtn Dr Anand Ashok Jhunjhunuwala', role: 'ARRFC', homeDistrict: '3030', supports: ['3030','3120'] },
    { name: 'PDG Rtn Pawan Agarwal',                role: 'ARRFC', homeDistrict: '3110', supports: ['3110','3100'] },
    { name: 'PDG Rtn Dr Mohan Shyam Konwar',        role: 'ARRFC', homeDistrict: '3240', supports: ['3240'] },
    { name: 'PDG Rtn Shashi Varvandkar',            role: 'ARRFC', homeDistrict: '3261', supports: ['3261','3262'] },
    { name: 'MN JHA',                               role: 'ARRFC', homeDistrict: '3292', supports: ['3292','3250'] },
  ],
  districtIds: ['3030','3100','3110','3120','3240','3250','3261','3262','3292'],
}]
```

The `role` field is a string, not an enum of one — the PDF's other coordinator tracks (ARC, RMGA, EMGA, RPIC) slot in without a schema change when that data arrives.

### 3.3 Club-depth samples

No club-level data exists for any Zone 6 district. To make Club-level drill-down demonstrable, the three existing datasets are re-parented:

| Source | Clubs | Re-parented to | Marked |
|---|---|---|---|
| `district3192.js` | 42 | **3120** (RRFC's home district — the demo's deep-dive district) | loaded |
| `realData.js` | 4 | **3030** | loaded |
| `district/data/*` | 6 | — | **not used** (see D2) |

The remaining six districts show district-level Foundation actuals only (real, from the workbook) with an explicit *"club-level data not yet loaded"* state — not a zero, not a blank.

Clubs render as ordinary club records with no provenance chip. Districts without a roster show an
explicit *"club-level data not yet loaded"* state — never a zero. Acceptance criterion **A15**.

### 3.4 Dead code

`src/pages/` holds 9 files byte-identical to `src/modules/ag/pages/` (~200 KB) and unreferenced by `App.jsx`. Delete in P0. `src/pages/Login.jsx` is also unrouted — keep it; the role switcher reuses its `role` field.

---

## 4. Personas

| # | Persona | Level | Sees | Edits |
|---|---|---|---|---|
| P1 | Club President / Secretary | Club | Own club | Own club's goals + actuals |
| P2 | District Governor / DRFC | District | Own district → its clubs | District goals |
| P3 | Zone Coordinator (RRFC / ARRFC) | Zone | Own zone → its districts → their clubs | Zone goals; files the monthly report |
| P4 | RI Director / Director-elect | RI | All zones → all districts → all clubs | Zone targets; reads all reports |

**Prototype auth:** none. A **Role Switcher** in the top bar jumps between P1–P4, labelled "Demo — role switcher". An ARRFC selection additionally filters the zone view to that coordinator's supported districts.

---

## 5. Goal catalogue

### 5.1 Foundation track — the 24 real metrics from the workbook

Category codes are the workbook's `Number1_Dont_change` column and must be preserved for round-tripping.

| Code | Metric | Input type |
|---|---|---|
| 40 | Arch Klump Society | Number |
| 40 | Arch Klump Society — first time district entering AKS club | Yes/No |
| 41 | Endowment | Number |
| 41 | Endowment — $100,000 & above for the year | Yes/No |
| 41 | Endowment — first time by district | Yes/No |
| 42 | Bequest Society | Number |
| 42 | Bequest Society — $100,000 & above for the year | Yes/No |
| 43 | Directed Gift | Number |
| 43 | Directed Gift — $100,000 & above for the year | Yes/No |
| 43 | Directed Gift — first time by district | Yes/No |
| 44 | DDF (Pledge to Polio) | Number |
| 45 | EPF | Number |
| 46 | Polio Plus Society | Number |
| 47 | **Annual Fund** | Number ($) |
| 47 | Annual Fund — per capita contribution $25+ | Number |
| 47 | Annual Fund — 100% clubs contributing minimum $100 | Yes/No |
| 47 | Annual Fund — 100% Rotarians contributing minimum $10 | Yes/No |
| 48 | **PHF** (Paul Harris Fellows) | Number |
| 49 | Hall of Honor Club (min 25 members) | Number |
| 50 | PHSM (Paul Harris Society Member) | Number |
| 51 | **Major Donors** | Number |
| 52 | CSR project with RFI | Number |
| 52 | CSR project with RFI — $100,000 or above | Yes/No |
| 52 | CSR project with RFI — first time by district | Yes/No |

**Yes/No metrics** are a distinct unit: no percentage, no target — they render as an achieved/not-achieved badge and roll up as *"4 of 9 districts"*. They must not be coerced into the numeric path.

**Empty cells** (`DDF`, `Polio Plus Society`, `Hall of Honor` are blank for every Zone 6 district) are `null`, not `0` — the metric exists, the data was not collected. It renders `—` with a "not collected" tooltip.

### 5.2 Club/District track — from the app's own data

| Area | Metric | Unit | Entered at | Direction |
|---|---|---|---|---|
| Membership | New members · Terminated · Female members | count | Club | ↑ / ↓ / ↑ |
| | Net change · Membership growth % | count / % | *computed* | ↑ |
| | Clubs chartered · Clubs closed | count | District | ↑ / ↓ |
| Service | Active service projects · Volunteers · Man-hours · Project cost | count / INR | Club | ↑ |
| Youth | New Rotaract / Interact clubs sponsored | count | Club | ↑ |
| Public Image | Media mentions · Social growth · Public image events | count | Club | ↑ |
| | Brand consistency reviews | count | District | ↑ |
| Engagement | Meeting attendance · My Rotary registration | % | Club | ↑ |
| | Rotary Club Central goals set / completed | count | Club | ↑ |
| | Dues outstanding | INR | Club | ↓ |

> `excellence.goalsSet` / `goalsCompleted` already exist per club in `district3192.js` (Thane 18/18, Thane Brigades 26/24, Thane Centennial 0/0). This is the Rotary Club Central primitive and the natural bridge to RI's own system. In v1 they are two tracked metrics; importing the individual goals behind the count is v2.

### 5.3 The goal record

```js
/**
 * @typedef {Object} Goal
 * @property {string} id
 * @property {'club'|'district'|'zone'|'ri'} scope
 * @property {string} scopeId                 '15766' | '3120' | 'zone-6'
 * @property {string} metricId                'foundation.annualFund'
 * @property {number|null} categoryCode       47 — workbook round-trip, null for non-Foundation
 * @property {string} rotaryYear              '2026-27'
 * @property {number|boolean|null} target
 * @property {number|boolean|null} actual     null = not reported
 * @property {'count'|'USD'|'INR'|'percent'|'yesno'} unit
 * @property {string} comments                → PDF §6 "Comments"
 * @property {string} setBy, setOn
 * @property {{month:string, actual:number}[]} [monthly]
 */
```

`percentAchieved`, `status` and `onTrack` are derived, never stored.

---

## 6. Feature F1 — Goal Entry

| Level | Route |
|---|---|
| Club | `/clubdashboard/goals` |
| District | `/districtdashboard/goals` |
| Zone | `/zonedashboard/goals` |
| RI | `/ridashboard/goals` |

One new `NavLink` per sidebar, following the existing `ClubLayout` / `DistrictLayout` pattern.

### 6.1 Screen — one component, four scopes

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Goals — District 3120                              RY 2026–27  ▾        │
│  Set your targets. Actuals update as reports come in.                    │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Foundation ][ Membership ][ Service ][ Public Image ][ Youth ][ Engmt ]│  ← active pill #003DA5
├──────────────────────────────────────────────────────────────────────────┤
│  Metric                       Target      Actual     %     Status  Cmt   │
│  ───────────────────────────────────────────────────────────────────────│
│  Annual Fund ($)             [140,000]  [106,328]   76%   ● On Track [✎] │
│  PHF                         [   150 ]  [    133]   89%   ● On Track [✎] │
│  Major Donors                [     5 ]  [      2]   40%   ● Behind   [✎] │
│  Endowment                   [     3 ]  [      1]   33%   ● Behind   [✎] │
│  Per capita $25+             [    30 ]  [     24]   80%   ● At Risk  [✎] │
│  100% clubs ≥ $100           [ Yes ▾ ]  [  No  ▾]   —     ○ Not met  [✎] │
│  DDF (Pledge to Polio)       [      ]        —      —     ○ No data  [✎] │
│  ───────────────────────────────────────────────────────────────────────│
│  + Add custom goal                          [ Reset ]  [ Save Goals ]    │
└──────────────────────────────────────────────────────────────────────────┘
```

**Behaviour**
- Inline numeric inputs; target and actual side by side. No modal, no edit mode. Typing recalculates % and status live.
- Yes/No metrics render a two-state select, not a number field.
- Computed rows (`Net change`, `Growth %`, `TRF per capita`) are read-only and greyed.
- `[✎]` opens a one-line comment → PDF §6 Comments column.
- `Save Goals` writes to the store and toasts **"Goals saved — Zone 6 view updated."** That toast is the demo's proof roll-up fired.
- **Add custom goal** — free-text name + unit + target; covers PDF §6's blank "Goal Area" rows.
- Rotary Year selector; past years render read-only.

### 6.2 Validation

| Rule | Message |
|---|---|
| Target / actual ≥ 0 | "Value cannot be negative." |
| Non-numeric input | blocked on keypress |
| `%` metrics within 0–100 | "Percentage must be between 0 and 100." |
| Yes/No metric given a number | field type prevents it |
| Custom goal needs name + unit | "Give the goal a name and pick a unit." |
| Nothing entered | "Set at least one target before saving." |
| Blank actual | stored `null` (not reported) — **never** `0` |

### 6.3 Who sets what

| Goal scope | Set by | Visible to |
|---|---|---|
| Club | Club officers | Club, District, Zone, RI |
| District | DG / DRFC | District, Zone, RI |
| Zone ("Zone Target", PDF §6) | RRFC / ARRFC, RI Director | Zone, RI, and **as context** on every district page in the zone |
| RI | RI Director | Everyone |

Each district page shows its own target *and* the zone target beside it — exactly the comparison PDF §6 exists to produce.

---

## 7. Feature F2 — Goal Display & Roll-up

### 7.1 Roll-up rules

| Type | Rule |
|---|---|
| Counts, currency | Sum children |
| **Percentages** | **Weighted mean by member count** — never a plain average |
| Per-capita | Recompute at the level (level total ÷ level members) |
| Growth % | Recompute from level totals |
| Yes/No | Count achieved — "4 of 9 districts" |
| Scores | Mean of children + min / max / median |
| Text | Concatenate with attribution — "3120: 2 provisional · 3250: 1" |
| `null` | Excluded from numerator and denominator; coverage stated |
| **Coordinator layer** | **Never a summation path** — filter only (§2.2 Fact 1) |

**Target roll-up:** a level's rolled-up target (Σ children's targets) displays **beside**, never instead of, its own target. The gap is the point: *"Zone target $700,000; districts have collectively committed to $612,000."*

### 7.2 Status thresholds

Time-aware — 60% in August means something different from 60% in May.

```
expectedPace = months elapsed in Rotary Year ÷ 12       // RY starts 1 July
paceRatio    = percentAchieved ÷ (expectedPace × 100)

Achieved    percentAchieved ≥ 100       emerald #16A34A
On Track    paceRatio ≥ 0.90            emerald #16A34A
At Risk     0.70 ≤ paceRatio < 0.90     amber   #F59E0B
Behind      paceRatio < 0.70            rose    #E11D48
No data     actual is null              slate   #94A3B8
```

Lower-is-better metrics invert. This maps 1:1 to PDF §6's **On Track (Y/N)**: `Y` for Achieved/On Track, `N` otherwise.

### 7.3 Drill-down

```
RI Director ──▶ Zone 6 ──▶ District 3120 ──▶ Rotary Club of Thane
```

Breadcrumb on every page — `RI Director › Zone 6 › District 3120 › Rotary Club of Thane` — all crumbs clickable. Deep links work (`/zonedashboard/district/3120`) so the presenter can jump straight to any slide's screen.

---

## 8. Screen specifications

### 8.1 NEW — Zone Dashboard (`/zonedashboard`)

Sidebar: `Overview` · `Coordinators` · `Districts` · `Goals` · `Foundation` · `Membership` · `Service` · `Public Image` · `Monthly Report`

#### `/zonedashboard/overview`

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ▌ ZONE 6                                        RY 2026–27 ▾   [Export]    │  ← #003DA5, gold rule
│   9 Districts · RRFC Rtn Pramod Kumar (D 3120) · 5 ARRFCs                  │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐┌──────────┐┌────────┐┌──────────┐┌────────┐┌────────┐         │
│ │DISTRICTS││ANNUAL FND││  PHF   ││MAJOR DONR││  PHSM  ││GOALS ✔ │         │
│ │    9    ││ $632,386 ││  685   ││    25    ││   27   ││ 14/24  │         │
│ └─────────┘└──────────┘└────────┘└──────────┘└────────┘└────────┘         │
├────────────────────────────────────────────────────────────────────────────┤
│  Goal Progress vs. Zone Target            ← mirrors PDF §6 column-for-column│
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Goal Area        Zone Target   Actual     % Ach.  On Track   Comments │ │
│  │ Annual Fund      $700,000      $632,386   90%     Y          —        │ │
│  │ PHF              800           685        86%     Y          —        │ │
│  │ Major Donors     40            25         63%     N          Q3 push  │ │
│  │ PHSM             35            27         77%     Y          —        │ │
│  │ Endowment        12            7          58%     N          —        │ │
│  │ Per capita $25+  200           174        87%     Y          —        │ │
│  │ CSR with RFI     10            5          50%     N          —        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────┤
│  View by:  [ Coordinator ]  [ District ]        ← toggle, same underlying rows │
└────────────────────────────────────────────────────────────────────────────┘
```

#### `/zonedashboard/coordinators` — **the screen the client asked for**

Coordinator name → supporting districts → that district's data, expandable in place.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Zone 6 Foundation Coordinators                          [ Search… ]       │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ★ RRFC · Rtn Pramod Kumar                          Home: D 3120      │  │
│  │   Regional Rotary Foundation Coordinator — Zone 6 (all 9 districts)  │  │
│  │   Annual Fund $632,386 · PHF 685 · Major Donors 25                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ARRFC — Assistant Regional Rotary Foundation Coordinators                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ▼ PDG Rtn Dr Anand Ashok Jhunjhunuwala           Home: D 3030        │  │
│  │   Supporting: 3030 · 3120        $153,909 · PHF 245 · MD 4           │  │
│  │   ┌────────────────────────────────────────────────────────────────┐ │  │
│  │   │ District  AnnualFnd    PHF   MD  PHSM  Endow  $25+  CSR        │ │  │
│  │   │ 3030      $ 47,581     112    2    —      2     6     1    →   │ │  │
│  │   │ 3120      $106,328     133    2    —      1    24     —    →   │ │  │
│  │   └────────────────────────────────────────────────────────────────┘ │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ ▶ PDG Rtn Pawan Agarwal                          Home: D 3110        │  │
│  │   Supporting: 3110 · 3100         $53,380 · PHF  64 · MD 4           │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ ▶ PDG Rtn Dr Mohan Shyam Konwar                  Home: D 3240        │  │
│  │   Supporting: 3240               $123,339 · PHF  82 · MD 5           │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ ▶ PDG Rtn Shashi Varvandkar                      Home: D 3261        │  │
│  │   Supporting: 3261 · 3262         $50,259 · PHF 101 · MD 3           │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ ▶ MN JHA                                         Home: D 3292        │  │
│  │   Supporting: 3292 · 3250        $251,499 · PHF 193 · MD 9           │  │
│  │   ⓘ 3292 figures sourced from column 3291 — see data note            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ────────────────────────────────────────────────────────────────────────  │
│  ZONE 6 TOTAL (9 districts, each counted once)  $632,386 · PHF 685 · MD 25 │
│  ⓘ D 3120 appears under RRFC Pramod Kumar and ARRFC Jhunjhunuwala.         │
│    Zone totals sum districts directly, so it is counted once.              │
└────────────────────────────────────────────────────────────────────────────┘
```

That footnote is not decoration — it is the visible proof of §2.2 Fact 1, and it pre-empts the first question a coordinator in the room will ask.

Each district row's `→` opens the district dashboard.

#### `/zonedashboard/districts`
All 9 districts, one row each, every Foundation metric as a column, sticky totals row, sortable headers, `▶` expanding to that district's clubs (where club data exists — §3.3).

#### `/zonedashboard/foundation`
The full 24-metric grid: metrics as rows, 9 districts as columns, zone total column — **the workbook's own layout**, so a coordinator recognises it instantly. Yes/No metrics render as ✓ / — chips. Cell click → the goal's detail.

#### `/zonedashboard/membership` · `/service` · `/publicimage`
One page per PDF section (§2, §4, §5): zone KPI strip, the PDF's exact table one row per district, a stacked bar chart, an expandable club table beneath.

### 8.2 NEW — RI Director Dashboard (`/ridashboard`)

Sidebar: `Overview` · `Zones` · `Goals` · `Coordinator Reports`

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ▌ RI DIRECTOR OFFICE                            RY 2026–27 ▾  [Export]    │
│   Global Overview — 1 Zone · 9 Districts                                  │
├───────────────────────────────────────────────────────────────────────────┤
│ ┌────────┐┌──────────┐┌────────┐┌──────────┐┌────────┐┌────────┐         │
│ │ ZONES  ││DISTRICTS ││ANNUAL F││   PHF    ││MAJOR D ││GOALS ✔ │         │
│ │   1    ││    9     ││$632,386││   685    ││   25   ││ 14/24  │         │
│ └────────┘└──────────┘└────────┘└──────────┘└────────┘└────────┘         │
├───────────────────────────────────────────────────────────────────────────┤
│  Zones                                                                    │
│  ┌────────────────────────────────────────┐                              │
│  │ ZONE 6                            90%  │                              │
│  │ 9 districts · RRFC Rtn Pramod Kumar    │                              │
│  │ $632,386 Annual Fund · 685 PHF         │                              │
│  │ Report: ✔ Filed (3 Jul)   [ Open → ]   │                              │
│  └────────────────────────────────────────┘                              │
├───────────────────────────────────────────────────────────────────────────┤
│  Top / Bottom Districts (all zones)   │  Goal Achievement by Area         │
│  3292  $128,213  ████████████████     │  Annual Fund   ████████░  90%     │
│  3240  $123,339  ███████████████      │  PHF           ████████░  86%     │
│  3250  $123,286  ███████████████      │  PHSM          ███████░░  77%     │
│  …                                     │  Major Donors  █████░░░░  63%     │
│  3261  $  8,966  █                     │  Endowment     █████░░░░  58%     │
├───────────────────────────────────────────────────────────────────────────┤
│  Coordinator Report Status — Zone · Coordinator · Role · Districts · Month │
└───────────────────────────────────────────────────────────────────────────┘
```

`/ridashboard/zones` — sortable zone table. `/ridashboard/goals` — full catalogue at RI scope, per-zone breakdown expandable. `/ridashboard/reports` — all submitted reports, filterable.

> Zone 6 is the only zone with data. The RI view is built to hold *n* zones and renders correctly with one; no synthetic second zone is fabricated to make the screen look fuller.

### 8.3 CHANGED — District Dashboard

Add to sidebar: `Goals`, `Clubs`.

- **`/districtdashboard/overview`** — add a **Zone context strip**: "District 3120 · Zone 6 · Rank 3 of 9 · ARRFC Jhunjhunuwala" linking up to the zone. Add a **Goal Progress vs. District Target** card with a Zone Target column alongside.
- **`/districtdashboard/clubs`** (new) — flat club table with sticky totals (no AG grouping). Where club data is absent, an explicit *"club-level data not yet loaded"* state.
- **`/districtdashboard/goals`** (new) — district-scope entry with a **Club commitment** column (Σ club targets) beside the district's own target and the zone's.

### 8.4 CHANGED — Club Dashboard

Add to sidebar: `Goals`.

- **`/clubdashboard/goals`** (new) — the §6.1 component at club scope, plus:

```
┌────────────────────────────────────────────────────────────┐
│  How we compare — Annual Fund per capita                   │
│  My club        ███████████████░░░░░  $32                  │
│  District 3120  ████████████░░░░░░░░  $24    (weighted)    │
│  Zone 6         ██████████░░░░░░░░░░  $19    (weighted)    │
│  Zone target    ████████████████░░░░  $25                  │
└────────────────────────────────────────────────────────────┘
```

- **`/clubdashboard/overview`** — hierarchy breadcrumb strip + compact Goals card ("6 of 9 goals on track →").

---

## 9. Feature F3 — Monthly Coordinator Report

**Route:** `/zonedashboard/monthly-report`

All 9 PDF sections in order, pre-filled from roll-up, editable before submission.

| § | Section | Behaviour |
|---|---|---|
| 1 | Reporting Details | Role dropdown (RRFC / ARRFC / ARC / RMGA / EMGA / RPIC), name, assistant name, **districts covered pre-filled from the coordinator's `supports[]`**, month, date (auto) |
| 2 | Membership | **Auto-filled**, one row per supported district; editable; Net Change computed |
| 3 | TRF Giving | **Auto-filled** This Month / Year-to-Date from the Foundation metrics; Notes free-text |
| 4 | Public Image | Auto-filled where data exists; manual for Media Mentions, Brand Reviews |
| 5 | Service & New Clubs | Auto-filled counts; Provisional / Satellite status free-text |
| 6 | Goal Progress vs. Zone Target | **Fully auto-filled** from the goal store — every column |
| 7–9 | Challenges · Support Needed · Action Plan | Free-text |
| — | Signature block | Name + date |

**Actions:** `Save Draft` · `Submit to RI Director` · `Export PDF` (print stylesheet matching the original) · `Export Excel` (extend `src/utils/exportExcel.js`, already on `xlsx`; **round-trips the workbook's district-column layout with category codes intact**).

**Header** mirrors the PDF — *"Zone 6 — Monthly Coordinator Progress Report · Office of the RI Director-elect · Due by the 5th"* — with a countdown chip: amber at 2 days, rose when overdue.

`src/modules/district/data/monthlyReportData.js` (10 months of submission status) is the pattern to extend, not replace.

> **Build §6 auto-fill first.** The strongest moment in the presentation is a coordinator's 45-minute typing job reduced to reviewing pre-filled numbers and writing three paragraphs. That is the punchline.

---

## 10. Design system

Inherit the existing app exactly.

| Token | Value | Use |
|---|---|---|
| Royal Blue | `#003DA5` | Primary, banners, active nav, bars |
| Gold | `#F7A81B` | Accent rules, avatar chips, totals |
| Navy | `#1E3A5F` / `#0F172A` | Sidebar, text on gold |
| Slate 50 | `#F8FAFC` | Page background |
| Emerald / Amber / Rose | `#16A34A` / `#F59E0B` / `#E11D48` | On Track / At Risk / Behind |
| Slate 400 | `#94A3B8` | No data |

- **Reuse, don't rebuild:** `src/components/KPICard.jsx`, `StatusBadge.jsx`, `SectionHeader.jsx`, `ui/table.jsx`, `ui/tabs.jsx`, `ui/progress.jsx`, `modules/club/components/StatCard.jsx`.
- **Cards:** `bg-white rounded-2xl border border-slate-200 shadow-sm p-5`
- **Level banners:** full-width `#003DA5` with `h-1 w-8 rounded-full bg-[#F7A81B]` above an uppercase eyebrow — the existing AG "My Clubs" header pattern.
- **Sidebar:** navy, `border-white/10`, gold avatar chip — copy `ClubLayout.jsx` / `DistrictLayout.jsx`.
- **Tables:** sticky header + sticky totals row, `hover:bg-slate-50`, sortable headers, `tabular-nums`.
- **Charts:** Recharts. **Icons:** lucide-react.

**Level identity:**

| Level | Chip | Eyebrow |
|---|---|---|
| Club | `TH` | ROTARY CLUB OF THANE · D 3120 |
| District | `DG` | DISTRICT 3120 · ZONE 6 |
| Zone | `Z6` | ZONE 6 · 9 DISTRICTS · RRFC PRAMOD KUMAR |
| RI | `RI` | RI DIRECTOR OFFICE |

**Responsive:** desktop-first (projector demo). Sidebar → existing hamburger sheet under `lg`; wide tables scroll in their own container; KPI grid 6 → 3 → 2.

---

## 11. Technical approach

**No new dependencies.** Recharts, `xlsx`, lucide-react and `@base-ui/react` are all installed.

```
src/
  data/hierarchy/
    schema.js              JSDoc typedefs (§3.1)
    foundationGoals.js     the 24 metrics + real district actuals (from the workbook)
    zone6.js               ZONES, coordinators, districtIds (§3.2)
    normalize3142.js       realData.js         → Club[]  → reparent 3030
    normalize3192.js       district3192.js     → Club[]  → reparent 3120
    normalize5656.js       district/data/*     → Club[]  → reparent 3250
    index.js               DISTRICTS, CLUBS + lookup helpers
    metrics.js             full goal catalogue (§5)
    goals.seed.js          seeded Goal records
  lib/
    rollup.js              rollUp · percentAchieved · goalStatus · weightedMean
    format.js              ₹L/₹Cr + $ formatters (extract from existing pages)
  context/
    GoalsProvider.jsx      state + localStorage
  components/
    goals/{GoalTable,GoalRow,GoalCompareCard}.jsx
    hierarchy/{Breadcrumb,LevelBanner,DrilldownTable,CoordinatorCard}.jsx
    RoleSwitcher.jsx
  modules/
    zone/layout/ZoneLayout.jsx
    zone/pages/{Overview,Coordinators,Districts,Goals,Foundation,
                Membership,Service,PublicImage,MonthlyReport}.jsx
    ri/layout/RiLayout.jsx
    ri/pages/{Overview,Zones,Goals,Reports}.jsx
```

**Write once, parameterise by scope.** `DrilldownTable`, `GoalTable`, `LevelBanner` and `Breadcrumb` are each written once. "Zone of districts" and "district of clubs" are the same component with different props — four near-identical table implementations is four places for the totals row to drift.

**State:** one `GoalsProvider` React Context holding the normalised dataset plus goal edits, persisted to `localStorage` so edits survive a mid-presentation refresh. No Redux, no server.

**Routes to add in `App.jsx`:**

```
/                                    → /ridashboard/overview   (demo entry)
/ridashboard/*                       overview | zones | goals | reports
/zonedashboard/*                     overview | coordinators | districts | goals | foundation
                                     | membership | service | publicimage | monthly-report
/zonedashboard/district/:districtId  deep link
/districtdashboard/goals             (new)
/districtdashboard/clubs             (new — currently redirects to membership)
/districtdashboard/club/:clubId      deep link
/clubdashboard/goals                 (new)
```

The existing catch-all stays. `/agdashboard/*` is untouched.

---

## 12. Phasing

| Phase | Scope |
|---|---|
| **P0** | Parse the workbook → `foundationGoals.js`; build `zone6.js`; normalisers + re-parenting; delete `src/pages/` duplicates |
| **P1** | `rollup.js` + `GoalsProvider` + metrics catalogue + seeded goals — with the §13/A6 equality check |
| **P2** | `GoalTable`, wired into Club and District |
| **P3** | Zone dashboard: Overview, **Coordinators**, Districts, Foundation grid, breadcrumb |
| **P4** | RI Director dashboard |
| **P5** | Monthly Coordinator Report + PDF/Excel export |
| **P6** | Role switcher, polish, demo rehearsal |

---

## 13. Demo script

| # | Action | Point made |
|---|---|---|
| 1 | Land on RI Director Overview | "One screen, the whole zone." |
| 2 | Click **Zone 6** | Zone's own Foundation numbers vs zone target. |
| 3 | Open **Coordinators** | RRFC + 5 ARRFCs, each with their supporting districts. |
| 4 | Expand **Jhunjhunuwala** ▼ | 3030 and 3120 with full data, in place. |
| 5 | Click **3120** `→` | District dashboard, clubs listed. |
| 6 | Click **Rotary Club of Thane** | Club sees only itself — and how it compares upward. |
| 7 | Club → **Goals**, change Annual Fund target, Save | Toast fires. |
| 8 | Breadcrumb back to **Zone 6** | The zone's rolled-up commitment moved. "Entered once, visible everywhere." |
| 9 | Zone → **Monthly Report** | The PDF, pre-filled. Export. "Generated now, not typed." |

---

## 14. Acceptance criteria

| # | Criterion |
|---|---|
| A1 | Hierarchy is exactly Club → District → Zone → RI Director; no AG level appears in any new screen |
| A2 | Zone 6 shows all 9 districts and all 6 coordinators with correct district assignments |
| A3 | Coordinators page expands a coordinator to their supporting districts' data in place |
| A4 | All 24 Foundation metrics from the workbook are present, with category codes preserved |
| A5 | Yes/No metrics render as badges and roll up as "n of 9 districts" — never as a percentage |
| A6 | **Coordinator-grouped zone total equals district-summed zone total ($632,386)** — 3120 counted once |
| A7 | Goals can be entered/edited at Club, District and Zone; edits persist across refresh |
| A8 | Club edits propagate to District, Zone and RI with no manual refresh |
| A9 | Percentage metrics roll up weighted by membership; spot-check matches hand arithmetic |
| A10 | Missing data renders `—`, is excluded from denominators, and coverage is stated |
| A11 | Every club is reachable by drill-down — no dead links |
| A12 | Breadcrumb on every level page; every crumb navigates correctly |
| A13 | All 9 report sections render, with §2, §3, §5, §6 pre-filled from roll-up |
| A14 | Excel export round-trips the workbook layout with category codes intact |
| A15 | Districts with no roster show "club-level data not yet loaded", never a zero; the 3292/3291 substitution is footnoted wherever 3292 appears |
| A16 | Role switcher moves between all four personas without a page reload |
| A17 | No console errors; the §13 demo script completes end-to-end |

---

## 15. Data notes carried forward

These are recorded, not blocking. Each has a chosen default so the build proceeds.

| # | Note | Default taken |
|---|---|---|
| D1 | **District 3292 is absent from the Foundation workbook**; 3291 is present | Use 3291's figures for 3292, footnoted everywhere it appears |
| D2 | No club-level data exists for any Zone 6 district | Re-parent 3192 → 3120 (42 clubs) and 3142 → 3030 (4 clubs). D5656 is **not** used: its `analyticsData.js` generates members and officers from name-pool arrays, so it is filler rather than data. The other 7 districts show district-level Foundation figures only |
| D3 | `district3192.js` `DISTRICT_TOTALS.clubs = 93` but the array holds 43 | Use the array (43) as truth; surface the totals-vs-array gap in a data-health note |
| D4 | Primary currency | **USD primary** — the workbook is USD throughout; INR shown as secondary where club data provides it |
| D5 | Only Zone 6 has data | RI view built for *n* zones, renders with one; no synthetic zone fabricated |
| D6 | `DDF`, `Polio Plus Society`, `Hall of Honor` are blank for all Zone 6 districts | Treated as `null` / "not collected", never `0` |
| D7 | Only the RRFC/ARRFC (Foundation) track was supplied; the PDF also names ARC, RMGA, EMGA, RPIC | `role` is a free string — other tracks slot in without a schema change |

---

## Appendix A — PDF field → data source

| § | PDF field | Source |
|---|---|---|
| 1 | Coordinator Role / Name / Districts Covered | `coordinator.role` · `.name` · `.supports[]` |
| 2 | Members (Start) / New / Terminated / Net Change | Σ `club.membership.*` per district |
| 2 | Clubs (Start) / Chartered / Closed | `district.clubIds.length` + district goals |
| 3 | Annual Fund ($) | workbook code 47 |
| 3 | PolioPlus Fund ($) | workbook codes 44, 46 |
| 3 | Major / Endowment Gifts ($) | workbook codes 41, 51 |
| 3 | New Paul Harris Fellows | workbook code 48 (PHF) |
| 3 | EREY Participation (%) | workbook code 47 — "100% Rotarians ≥ $10" |
| 4 | Media Mentions / Social Growth / PI Events | club goals `publicimage.*` |
| 4 | Brand Consistency Reviews | district goal `publicimage.brandReviews` |
| 5 | Active Service Projects | Σ `club.service.projects` |
| 5 | New Clubs in Development / Provisional / Satellite | district goals |
| 6 | Goal Area / Zone Target / Actual / % / On Track / Comments | `Goal` records at zone scope — direct render |
| 7–9 | Challenges / Support Needed / Action Plan | report free-text |

## Appendix B — Why percentages are weighted

Real clubs from `district3192.js`, metric `myRotaryPercent`:

| Club | Members | My Rotary % |
|---|---:|---:|
| Thane | 324 | 50.31 |
| Thane Brigades | 53 | 73.58 |
| Thane Centennial | 13 | 53.85 |
| Thane Central | 33 | 93.94 |
| Thane Gokul Vidya | 24 | 95.83 |

- **Wrong** — plain mean: `(50.31 + 73.58 + 53.85 + 93.94 + 95.83) ÷ 5 = 73.50%`
- **Right** — weighted by members: `26,300.17 ÷ 447 = 58.84%`

**A 14.66-point overstatement**, on one metric, from five clubs. Two small clubs with high registration outvote a 324-member club with low registration. Across 43 clubs an unweighted average does not describe anything real — and it flatters, which is worse, because it flatters exactly the metrics a coordinator is being asked to improve.

Hence §7.1: percentages are **never** plain-averaged, `null` is **never** `0`, and the coordinator layer is **never** a summation path.
