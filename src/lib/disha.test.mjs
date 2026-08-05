// Checks for the ported DISHA Zone 5 & 6 data:  node src/lib/disha.test.mjs
import assert from 'node:assert/strict'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, DISHA_FIELDS,
  PREVIOUS, prevValue, fieldsIn, districtsIn,
} from '../data/disha.js'
import { completion, coverage, sections, dishaNumber, totalFor, TARGET_FIELDS } from './disha.js'
import {
  targetValue, targetIn, setTarget, clearTargets, getTargets, anyTargetsSet, subscribe,
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

check('targets are unset — they are entered live at the event', () => {
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

console.log('\ntargets — entered at the event, none seeded')

// The portal's `goals` table is created and never seeded, and every Target column in both
// consolidated workbooks is blank. Nothing here may invent one.
check('no district holds a target until one is entered', () => {
  assert.equal(anyTargetsSet(), false)
  assert.deepEqual(getTargets(), {})
  for (const d of DISHA_DISTRICTS)
    for (const f of REPORT_FIELDS)
      assert.equal(targetValue(d.id, f.id), null, `${d.number} / ${f.id} came with a target`)
})

check('an entered target round-trips, stays in its own cell, and clears', () => {
  const [a, b] = DISHA_DISTRICTS
  let notified = 0
  const stop = subscribe(() => { notified++ })

  setTarget('district', a.id, 'membersStart', 6800)
  assert.equal(targetValue(a.id, 'membersStart'), 6800)
  assert.equal(anyTargetsSet(), true)
  assert.equal(notified, 1, 'entry must wake the pages reading the store')
  assert.equal(targetValue(b.id, 'membersStart'), null, 'a target leaked to another district')
  assert.equal(targetValue(a.id, 'annualFund'), null, 'a target leaked to another field')
  // Scoped, so club 3120-something cannot read district 3120's goal.
  assert.equal(targetIn('club', a.id, 'membersStart'), null)

  setTarget('district', a.id, 'membersStart', null)
  assert.equal(targetValue(a.id, 'membersStart'), null, 'clearing one cell must remove it')

  setTarget('district', a.id, 'annualFund', 100000)
  clearTargets()
  assert.deepEqual(getTargets(), {})
  assert.equal(anyTargetsSet(), false)
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

check('club figures read the club record, and no club starts with a target', () => {
  const c = CLUBS.find((x) => x.id === '15766')          // Thane, from district3192
  const members = CLUB_FIELDS.find((f) => f.id === 'membersStart')
  assert.equal(clubAchieved(members, c), c.membership.current)

  let filled = 0
  for (const club of CLUBS)
    for (const f of CLUB_FIELDS) {
      assert.equal(clubTarget(club.id, f.id), null, `${club.name} / ${f.id} came with a target`)
      if (clubAchieved(f, club) != null) filled++
    }
  assert.ok(filled > 200, `only ${filled} club figures read`)

  const other = CLUBS.find((x) => x.id !== c.id)
  setTarget('club', c.id, 'membersStart', 60)
  assert.equal(clubTarget(c.id, 'membersStart'), 60)
  assert.equal(clubTarget(other.id, 'membersStart'), null, 'a target leaked to another club')
  clearTargets()
  assert.equal(clubTarget(c.id, 'membersStart'), null)
})

console.log(`\n${n} checks passed\n`)
