// Checks for the ported DISHA Zone 5 & 6 data:  node src/lib/disha.test.mjs
import assert from 'node:assert/strict'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, DISHA_FIELDS,
  PREVIOUS, prevValue, fieldsIn, districtsIn,
} from '../data/disha.js'
import { completion, coverage, sections, dishaNumber, totalFor, TARGET_FIELDS } from './disha.js'
import { targetValue, DEMO_TARGETS } from '../data/dishaTargets.js'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor } from '../data/reportFields.js'
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

check('a sourced field reads the real figure, not a demo one', () => {
  const d = DISHA_DISTRICTS.find((x) => x.number === '2981')
  const members = REPORT_FIELDS.find((f) => f.id === 'membersStart')
  assert.equal(achievedFor(members, d), 6355)          // seed-previous-year-membership
  assert.equal(members.get(d), 6355)
})

// A figure that changes on refresh is worse than no figure: the same cell must read the same
// on every render, and every category must have something to show.
check('demo figures are stable and cover every category', () => {
  const d = DISHA_DISTRICTS.find((x) => x.number === '2981')
  const erey = REPORT_FIELDS.find((f) => f.id === 'ereyPct')
  assert.equal(erey.src, null)
  assert.equal(erey.get(d), null, 'the raw getter still reports no dataset')
  const first = achievedFor(erey, d)
  assert.ok(typeof first === 'number', 'an unsourced field still shows a demo figure')
  assert.equal(achievedFor(erey, d), first, 'the same cell must not change between reads')

  for (const c of REPORT_CATEGORIES)
    for (const f of fieldsInCategory(c.id))
      assert.ok(achievedFor(f, d) != null, `${c.label} / ${f.id} has nothing to show`)
})

check('demo figures differ between districts and between fields', () => {
  const f = REPORT_FIELDS.find((x) => x.id === 'mediaMentions')
  const vals = DISHA_DISTRICTS.map((d) => achievedFor(f, d))
  assert.ok(new Set(vals).size > 5, 'every district got the same figure')
  const d = DISHA_DISTRICTS[0]
  const across = ['mediaMentions', 'piEvents', 'brandReviews']
    .map((id) => achievedFor(REPORT_FIELDS.find((x) => x.id === id), d))
  assert.equal(new Set(across).size, across.length, 'fields share a figure')
})

// Every cell pairs an achieved figure with a target, so a target that is missing or sits below
// what has already been achieved would read as a failure that isn't.
check('every achieved figure has a target, pointing the right way', () => {
  let paired = 0, lower = 0
  for (const d of DISHA_DISTRICTS)
    for (const f of REPORT_FIELDS) {
      const a = achievedFor(f, d)
      if (a == null || a === 0) continue
      const t = targetValue(d.id, f.id)
      assert.ok(t != null, `${d.number} / ${f.id} has an achieved figure but no target`)
      if (f.lowerIsBetter) {
        // Fewer terminations and closures is the goal, so the target sits below today's figure.
        assert.ok(t <= a, `${d.number} / ${f.id}: lower-is-better target ${t} sits above achieved ${a}`)
        lower++
      } else {
        assert.ok(t >= a, `${d.number} / ${f.id}: target ${t} sits below achieved ${a}`)
      }
      paired++
    }
  assert.ok(paired > 400, `only ${paired} cells paired`)
  assert.ok(lower > 0, 'no lower-is-better field was exercised')
})

check('no target exists where there is nothing to measure', () => {
  for (const d of DISHA_DISTRICTS)
    for (const f of REPORT_FIELDS)
      if (achievedFor(f, d) == null)
        assert.equal(targetValue(d.id, f.id), null,
          `${d.number} / ${f.id} has a target with no achieved figure behind it`)
  assert.ok(Object.keys(DEMO_TARGETS).length > 0)
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

check('club figures read the club record, and every one has a target', () => {
  const c = CLUBS.find((x) => x.id === '15766')          // Thane, from district3192
  const members = CLUB_FIELDS.find((f) => f.id === 'membersStart')
  assert.equal(clubAchieved(members, c), c.membership.current)

  let paired = 0
  for (const club of CLUBS)
    for (const f of CLUB_FIELDS) {
      const a = clubAchieved(f, club)
      if (a == null || a === 0) continue
      const t = clubTarget(club.id, f.id)
      assert.ok(t != null, `${club.name} / ${f.id} has a figure but no target`)
      if (f.lowerIsBetter) assert.ok(t <= a)
      else assert.ok(t >= a, `${club.name} / ${f.id}: target ${t} below achieved ${a}`)
      paired++
    }
  assert.ok(paired > 200, `only ${paired} club cells paired`)
})

console.log(`\n${n} checks passed\n`)
