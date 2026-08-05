// Checks for the ported DISHA Zone 5 & 6 data:  node src/lib/disha.test.mjs
import assert from 'node:assert/strict'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, DISHA_FIELDS,
  PREVIOUS, prevValue, fieldsIn, districtsIn,
} from '../data/disha.js'
import { completion, coverage, sections, dishaNumber, totalFor, TARGET_FIELDS } from './disha.js'
import {
  targetValue, targetIn, enteredTarget, isEntered, provisionalTarget, provisionalFrom,
  setTarget, clearTargets, getTargets, anyTargetsSet, enteredCount, enteredCountIn, subscribe,
} from '../data/dishaTargets.js'
import {
  REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor,
  SOURCED_FIELDS, UNSOURCED_FIELDS,
} from '../data/reportFields.js'
import { ZONE } from '../data/zone6.js'
import { CLUB_FIELDS, clubFieldsIn, clubCategories, clubAchieved, clubTarget } from '../data/clubFigures.js'
import { CLUBS } from '../data/clubs.js'

let n = 0
const check = (name, fn) => { fn(); n++; console.log('  ok  ' + name) }

console.log('\ndisha zone 5 & 6 data')

check('catalogue matches the portal: 2 zones, 23 districts, 4 categories, 76 fields', () => {
  assert.equal(DISHA_ZONES.length, 2)
  assert.equal(DISHA_DISTRICTS.length, 23)
  assert.equal(DISHA_CATEGORIES.length, 4)
  assert.equal(DISHA_FIELDS.length, 76)
  assert.deepEqual(DISHA_CATEGORIES.map((c) => c.name),
    ['Membership', 'TRF', 'Youth Service', 'Public Image'])
})

check('field ids split 1-17 / 18-38 / 39-56 / 57-76', () => {
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => i + a)
  assert.deepEqual(fieldsIn(1).map((f) => f.id), range(1, 17))
  assert.deepEqual(fieldsIn(2).map((f) => f.id), range(18, 38))
  assert.deepEqual(fieldsIn(3).map((f) => f.id), range(39, 56))
  assert.deepEqual(fieldsIn(4).map((f) => f.id), range(57, 76))
})

// The earlier build treated 3292 as missing and borrowed 3291's figures. They are two
// separate districts with two separate governors.
check('Zone 6 has ten districts, with 3291 and 3292 both present and distinct', () => {
  const z6 = districtsIn(2)
  assert.equal(z6.length, 10)
  assert.deepEqual(z6.map((d) => d.number),
    ['3030', '3100', '3110', '3120', '3240', '3250', '3261', '3262', '3291', '3292'])
  const d3291 = z6.find((d) => d.number === '3291')
  const d3292 = z6.find((d) => d.number === '3292')
  assert.notEqual(d3291.id, d3292.id)
  assert.notEqual(d3291.governor, d3292.governor)
})

check('Zone 5 has thirteen districts', () => {
  assert.deepEqual(districtsIn(1).map((d) => d.number),
    ['2981', '2982', '3000', '3203', '3204', '3205', '3206', '3211', '3212', '3220', '3231', '3233', '3234'])
})

check('every district has a named governor', () => {
  for (const d of DISHA_DISTRICTS)
    assert.ok(d.governor && d.governor.length > 3, `district ${d.number} has no governor`)
})

check('reference figures survived the port', () => {
  // Spot-check D2981 against seed-previous-year-membership.sql
  const d = DISHA_DISTRICTS.find((x) => x.number === '2981')
  assert.equal(prevValue(d.id, 1), '151')     // Total No of Clubs
  assert.equal(prevValue(d.id, 3), '422')     // Existing Women Members
  assert.equal(prevValue(d.id, 11), '6355')   // Total Membership (Existing)
  assert.equal(Object.keys(PREVIOUS).length, 23)
})

check('the 76-field goal form starts empty — nothing is pre-filled', () => {
  for (const d of DISHA_DISTRICTS) {
    const c = completion(d.id)
    assert.equal(c.filled, 0)
    assert.equal(c.complete, false)
  }
  assert.ok(TARGET_FIELDS.length > 0)
  assert.ok(TARGET_FIELDS.every((f) => f.isTarget && f.dataType !== 'text'))
})

check('a blank source cell stays blank rather than becoming zero', () => {
  assert.equal(dishaNumber(null), null)
  assert.equal(dishaNumber(''), null)
  assert.equal(dishaNumber(0), '0')
})

check('totals skip blanks instead of counting them as zero', () => {
  const ids = DISHA_DISTRICTS.map((d) => d.id)
  const byHand = ids.reduce((s, id) => {
    const v = parseFloat(prevValue(id, 1))
    return Number.isFinite(v) ? s + v : s
  }, 0)
  assert.equal(totalFor(1, ids), byHand)
  assert.equal(totalFor(2, ids), null, 'a field with no reference data totals to null, not 0')
})

check('coverage counts only fields that carry reference data', () => {
  const prevFields = DISHA_FIELDS.filter((f) => f.showPrev).length
  for (const d of DISHA_DISTRICTS) {
    const c = coverage(d.id)
    assert.equal(c.total, prevFields)
    assert.ok(c.filled <= c.total)
  }
})

check('sections group in source order without losing a field', () => {
  for (const c of DISHA_CATEGORIES) {
    const grouped = sections(c.id).flatMap((s) => s.fields)
    assert.deepEqual(grouped.map((f) => f.id), fieldsIn(c.id).map((f) => f.id))
  }
})

check('numbers use Indian grouping and only abbreviate past a million', () => {
  assert.equal(dishaNumber(999999), '9,99,999')
  assert.equal(dishaNumber(1736284), '1.74 mn')
  assert.equal(dishaNumber(450000, '$'), '$4,50,000')
  assert.equal(dishaNumber('31.93', '%'), '31.93%')
  assert.equal(dishaNumber('YES'), 'YES')
})

console.log('\nmonthly report fields')

check('the report sections match the PDF, and RAG / Summary are gone', () => {
  assert.deepEqual(REPORT_CATEGORIES.map((c) => c.id),
    ['membership', 'foundation', 'publicimage', 'projects', 'newgen'])
  const names = REPORT_FIELDS.map((f) => f.label.toLowerCase()).join(' ')
  assert.ok(!names.includes('rag'), 'RAG Analysis must not appear')
  assert.ok(!/\bamber\b|\bsuper green\b/.test(names), 'RAG bands must not appear')
})

// The coordinators page maps ARRFC assignments onto the real Zone 6 districts. A support
// entry that names a district the dataset does not have would silently drop a column.
check('every coordinator supports a district that exists in the data', () => {
  const zone6 = districtsIn(2).map((d) => d.number)
  for (const c of ZONE.coordinators)
    for (const n of c.supports)
      assert.ok(zone6.includes(n), `${c.name} supports ${n}, which is not a Zone 6 district`)
  assert.ok(zone6.includes(ZONE.rrfc.homeDistrict))
})

check('the ARRFC assignments leave 3291 uncovered — surfaced, not hidden', () => {
  const assigned = new Set(ZONE.coordinators.flatMap((c) => c.supports))
  const uncovered = districtsIn(2).map((d) => d.number).filter((n) => !assigned.has(n))
  assert.deepEqual(uncovered, ['3291'],
    'if this changes, the note on the coordinators page needs updating')
})

check('Projects holds service projects alone; the rest moved to New Generation', () => {
  assert.deepEqual(fieldsInCategory('projects').map((f) => f.id), ['serviceProjects'])
  assert.deepEqual(fieldsInCategory('newgen').map((f) => f.id),
    ['rotaractClubs', 'rotaractors', 'interactClubs', 'rccClubs', 'newClubsDev'])
})

check('every field belongs to one of the four sections and carries a unit', () => {
  const ids = new Set(REPORT_CATEGORIES.map((c) => c.id))
  for (const f of REPORT_FIELDS) {
    assert.ok(ids.has(f.cat), `${f.id} has section "${f.cat}"`)
    assert.ok(['nos', '$', '%'].includes(f.unit), `${f.id} has unit "${f.unit}"`)
  }
  const grouped = REPORT_CATEGORIES.flatMap((c) => fieldsInCategory(c.id))
  assert.equal(grouped.length, REPORT_FIELDS.length, 'a field is missing from its section')
})

// "dont change the fields": the catalogue is the coordinators' own form. Nothing may be added,
// dropped or moved between sections to make a screen look fuller than the data behind it.
check('the catalogue is 27 fields across 5 sections, 14 of them carried by the portal', () => {
  assert.equal(REPORT_FIELDS.length, 27)
  assert.equal(REPORT_CATEGORIES.length, 5)
  assert.equal(SOURCED_FIELDS, 14)
  assert.equal(UNSOURCED_FIELDS.length, 13)
  assert.equal(SOURCED_FIELDS + UNSOURCED_FIELDS.length, REPORT_FIELDS.length)
  assert.equal(new Set(REPORT_FIELDS.map((f) => f.id)).size, REPORT_FIELDS.length, 'duplicate field id')
  // Public Image is not collected in the portal at all — the whole section is unsourced.
  for (const f of fieldsInCategory('publicimage'))
    assert.ok(UNSOURCED_FIELDS.includes(f), `${f.id} claims a Public Image source`)
})

check('a sourced field reads the real figure from the portal', () => {
  const d = DISHA_DISTRICTS.find((x) => x.number === '2981')
  const members = REPORT_FIELDS.find((f) => f.id === 'membersStart')
  assert.equal(achievedFor(members, d), 6355)          // seed-previous-year-membership
  assert.equal(members.get(d), 6355)
})

// An earlier build filled the thirteen unsourced rows with generated figures so no column
// looked empty. Pinned per field id, for all 23 districts, so a reintroduced fallback names
// itself in the failure rather than passing as real data.
check('a field the portal does not carry reads null for every district — never a number', () => {
  assert.deepEqual(UNSOURCED_FIELDS.map((f) => f.id), [
    'newMembers', 'terminated', 'netChange', 'clubsChartered', 'clubsClosed',
    'newPHF', 'ereyPct',
    'mediaMentions', 'socialGrowth', 'piEvents', 'brandReviews',
    'serviceProjects', 'newClubsDev',
  ])
  for (const f of UNSOURCED_FIELDS) {
    assert.equal(f.src, null, `${f.id} claims a source`)
    for (const d of DISHA_DISTRICTS) {
      assert.equal(f.get(d), null, `${f.id} / ${d.number}: the raw getter invented a figure`)
      assert.equal(achievedFor(f, d), null, `${f.id} / ${d.number}: achievedFor invented a figure`)
    }
  }
})

check('a sourced field reads its portal cell, and stays null where the cell is blank', () => {
  let filled = 0
  for (const f of REPORT_FIELDS.filter((x) => x.src))
    for (const d of DISHA_DISTRICTS) {
      const raw = parseFloat(prevValue(d.id, f.src))
      const a = achievedFor(f, d)
      if (Number.isFinite(raw)) {
        assert.equal(a, raw, `${f.id} / ${d.number} does not match portal field ${f.src}`)
        filled++
      } else {
        assert.equal(a, null, `${f.id} / ${d.number}: a blank cell became ${a}`)
      }
    }
  assert.equal(filled, SOURCED_FIELDS * DISHA_DISTRICTS.length,
    'every sourced field is on file for every district')
})

console.log('\ntargets — provisional until entered, none seeded')

/**
 * The one rule every cell follows, district or club:
 *   no figure           -> no target, so a blank row stays blank on BOTH sides
 *   a figure of zero    -> a count targets its first one; money has nothing to scale from
 *   fewer is better     -> the target sits at or below what happened, never above
 *   anything else       -> a target above the figure it grew from
 */
const checkPair = (label, f, achieved, target) => {
  if (achieved == null)
    assert.equal(target, null, `${label}: no figure, yet a target of ${target}`)
  else if (achieved === 0)
    assert.equal(target, f.unit === 'nos' && !f.lowerIsBetter ? 1 : null, `${label}: at zero, target ${target}`)
  else if (f.lowerIsBetter)
    assert.ok(target <= achieved, `${label}: fewer is better, so ${target} must not be above ${achieved}`)
  else
    assert.ok(typeof target === 'number' && target > achieved, `${label}: achieved ${achieved}, target ${target}`)
}

// The portal's `goals` table holds a single test row, every Target column in both consolidated
// workbooks is blank, and the live database has 1 goal of a possible 1,748 — District Governors
// set theirs at the goal-setting event. So nothing is entered here, and what fills the second
// figure in every cell until then is a provisional target derived from the district's own
// 2025-26 number. Derived on demand, never stored, and never invented out of nothing.
check('nothing is entered, yet every reported figure carries a provisional target', () => {
  assert.equal(anyTargetsSet(), false)
  assert.deepEqual(getTargets(), {})
  assert.equal(enteredCount(), 0)

  let pairs = 0
  for (const d of DISHA_DISTRICTS)
    for (const f of REPORT_FIELDS) {
      assert.equal(enteredTarget('district', d.id, f.id), null, `${d.number} / ${f.id} came with an entered target`)
      assert.equal(targetIn('district', d.id, f.id), null)        // the older alias reads the same store
      assert.equal(isEntered('district', d.id, f.id), false)

      const achieved = achievedFor(f, d)
      const target = targetValue(d.id, f.id)
      checkPair(`${d.number} / ${f.id}`, f, achieved, target)
      if (achieved != null && target != null) pairs++
    }
  assert.ok(pairs > 300, `only ${pairs} district cells carry both figures`)

  // The thirteen rows the portal does not carry stay empty on the target side too — a
  // provisional figure needs a reported one to grow from.
  for (const f of UNSOURCED_FIELDS)
    for (const d of DISHA_DISTRICTS)
      assert.equal(targetValue(d.id, f.id), null, `${f.id} / ${d.number}: an unsourced row grew a target`)

  // Direction and edge cases, pinned on the generator itself rather than on whichever district
  // happens to sit at zero this month.
  assert.deepEqual(REPORT_FIELDS.filter((f) => f.lowerIsBetter).map((f) => f.id), ['terminated', 'clubsClosed'])
  for (const f of REPORT_FIELDS.filter((x) => x.lowerIsBetter)) {
    assert.ok(provisionalFrom(20, f) < 20, `${f.id} does not aim below its achieved figure`)
    for (const base of [1, 2, 3, 50]) assert.ok(provisionalFrom(base, f) <= base, `${f.id} at ${base} aimed higher`)
    assert.equal(provisionalFrom(0, f), null, `${f.id} at zero has nothing left to cut`)
  }
  const byId = (id) => REPORT_FIELDS.find((f) => f.id === id)
  assert.equal(provisionalFrom(0, byId('clubsChartered')), 1, 'a count at zero targets its first one')
  assert.equal(provisionalFrom(0, byId('annualFund')), null, 'money at zero has nothing to scale from')
  assert.equal(provisionalFrom(null, byId('membersStart')), null)
})

check('an entered target replaces the provisional one, and clearing it brings the provisional back', () => {
  const [a, b] = DISHA_DISTRICTS
  const provisional = provisionalTarget(a.id, 'membersStart')
  assert.ok(provisional > 0, 'the fixture district must carry a provisional target to displace')
  assert.notEqual(provisional, 7777, 'the entered figure must differ from the provisional one to prove which won')

  let notified = 0
  const stop = subscribe(() => { notified++ })

  setTarget('district', a.id, 'membersStart', 7777)
  assert.equal(targetValue(a.id, 'membersStart'), 7777, 'the entered figure must win')
  assert.equal(isEntered('district', a.id, 'membersStart'), true)
  assert.equal(enteredCountIn('district', a.id), 1)
  assert.equal(anyTargetsSet(), true)
  assert.equal(notified, 1, 'entry must wake the pages reading the store')

  // Entry is per cell. Everything else still reads its provisional figure, and none of it counts
  // as entered — that difference is what the pages caption.
  assert.equal(enteredTarget('district', b.id, 'membersStart'), null, 'an entry leaked to another district')
  assert.equal(enteredTarget('district', a.id, 'annualFund'), null, 'an entry leaked to another field')
  assert.equal(targetValue(b.id, 'membersStart'), provisionalTarget(b.id, 'membersStart'))
  assert.equal(targetValue(a.id, 'annualFund'), provisionalTarget(a.id, 'annualFund'))
  // Scoped, so club 3120-something cannot read district 3120's goal.
  assert.equal(targetIn('club', a.id, 'membersStart'), null)

  setTarget('district', a.id, 'membersStart', null)
  assert.equal(isEntered('district', a.id, 'membersStart'), false)
  assert.equal(targetValue(a.id, 'membersStart'), provisional, 'clearing one cell falls back to provisional')

  setTarget('district', a.id, 'annualFund', 100000)
  clearTargets()
  assert.deepEqual(getTargets(), {})
  assert.equal(anyTargetsSet(), false)
  assert.equal(targetValue(a.id, 'annualFund'), provisionalTarget(a.id, 'annualFund'))
  stop()
})

console.log('\nclub level')

// Most of the monthly report is district-level. Asking one club how many clubs it has would
// put a dash on every club row, so those fields are left off club screens entirely.
check('clubs answer only the fields a club can answer', () => {
  const ids = CLUB_FIELDS.map((f) => f.id)
  assert.ok(ids.includes('membersStart') && ids.includes('serviceProjects'))
  for (const id of ['clubsStart', 'clubsChartered', 'clubsClosed', 'aks', 'csr', 'newClubsDev'])
    assert.ok(!ids.includes(id), `${id} is district-level and must not appear on a club`)
  assert.ok(CLUB_FIELDS.length < REPORT_FIELDS.length)
})

check('every club category has at least one field, and empty ones are dropped', () => {
  const cats = clubCategories(REPORT_CATEGORIES)
  assert.ok(cats.length > 0)
  for (const c of cats) assert.ok(clubFieldsIn(c.id).length > 0, `${c.label} is empty`)
  const dropped = REPORT_CATEGORIES.filter((c) => !cats.some((x) => x.id === c.id))
  for (const c of dropped) assert.equal(clubFieldsIn(c.id).length, 0)
})

// A club cell reads the same way as a district cell: nothing entered, a provisional figure grown
// from the club's own reported number, and the entered one the moment a president types it.
check('club figures read the club record, and follow the same two-source target rule', () => {
  const c = CLUBS.find((x) => x.id === '15766')          // Thane, from district3192
  const members = CLUB_FIELDS.find((f) => f.id === 'membersStart')
  assert.equal(clubAchieved(members, c), c.membership.current)

  let filled = 0
  for (const club of CLUBS)
    for (const f of CLUB_FIELDS) {
      assert.equal(targetIn('club', club.id, f.id), null, `${club.name} / ${f.id} came with an entered target`)
      const achieved = clubAchieved(f, club)
      checkPair(`${club.name} / ${f.id}`, f, achieved, clubTarget(club.id, f.id))
      if (achieved != null) filled++
    }
  assert.ok(filled > 200, `only ${filled} club figures read`)

  const other = CLUBS.find((x) => x.id !== c.id)
  const provisional = clubTarget(c.id, 'membersStart')
  const otherBefore = clubTarget(other.id, 'membersStart')
  assert.ok(provisional > clubAchieved(members, c), 'a club with members must carry a provisional target')

  setTarget('club', c.id, 'membersStart', 400)
  assert.equal(clubTarget(c.id, 'membersStart'), 400, 'the entered figure must win')
  assert.equal(clubTarget(other.id, 'membersStart'), otherBefore, 'an entry leaked to another club')
  clearTargets()
  assert.equal(clubTarget(c.id, 'membersStart'), provisional, 'clearing falls back to provisional')
})

console.log(`\n${n} checks passed\n`)
