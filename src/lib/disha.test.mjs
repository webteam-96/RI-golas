// Checks for the ported DISHA Zone 5 & 6 data:  node src/lib/disha.test.mjs
import assert from 'node:assert/strict'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, DISHA_FIELDS,
  PREVIOUS, prevValue, fieldsIn, districtsIn,
} from '../data/disha.js'
import { completion, coverage, sections, dishaNumber, totalFor, TARGET_FIELDS } from './disha.js'
import { targetValue, DEMO_TARGETS } from '../data/dishaTargets.js'

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

// The consolidated table pairs an achieved figure with a target in every cell, so a target
// that is missing or below what has already been achieved would read as a failure that isn't.
check('a demo target exists wherever there is an achieved figure to measure', () => {
  let paired = 0
  for (const d of DISHA_DISTRICTS)
    for (const f of DISHA_FIELDS) {
      if (f.dataType === 'text' || f.dataType === 'boolean') continue
      const a = parseFloat(prevValue(d.id, f.id))
      if (!Number.isFinite(a) || a === 0) continue
      const t = targetValue(d.id, f.id)
      assert.ok(t != null, `${d.number} field ${f.id} has an achieved figure but no target`)
      assert.ok(t >= a, `${d.number} field ${f.id}: target ${t} sits below achieved ${a}`)
      paired++
    }
  assert.ok(paired > 300, `only ${paired} cells paired`)
})

check('demo targets are absent where there is nothing to measure', () => {
  for (const d of DISHA_DISTRICTS)
    for (const f of DISHA_FIELDS) {
      if (prevValue(d.id, f.id) != null) continue
      assert.equal(targetValue(d.id, f.id), null,
        `${d.number} field ${f.id} has a target with no achieved figure behind it`)
    }
  assert.equal(Object.keys(DEMO_TARGETS).length, DISHA_DISTRICTS.length)
})

check('percentage targets never exceed 100', () => {
  for (const d of DISHA_DISTRICTS)
    for (const f of DISHA_FIELDS.filter((x) => x.dataType === 'percentage')) {
      const t = targetValue(d.id, f.id)
      if (t != null) assert.ok(t <= 100, `${d.number} field ${f.id} target ${t} exceeds 100%`)
    }
})

console.log(`\n${n} checks passed\n`)
