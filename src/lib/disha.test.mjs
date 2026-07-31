// Checks for the ported DISHA data:  node src/lib/disha.test.mjs
import assert from 'node:assert/strict'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, DISHA_FIELDS,
  GOALS, PREVIOUS, goalValue, fieldsIn,
} from '../data/disha.js'
import { piPoints, completion, sections, dishaNumber, TARGET_FIELDS } from './disha.js'

let n = 0
const check = (name, fn) => { fn(); n++; console.log('  ok  ' + name) }

console.log('\ndisha data')

check('the catalogue matches the portal: 2 zones, 21 districts, 3 categories, 40 fields', () => {
  assert.equal(DISHA_ZONES.length, 2)
  assert.equal(DISHA_DISTRICTS.length, 21)
  assert.equal(DISHA_CATEGORIES.length, 3)
  assert.equal(DISHA_FIELDS.length, 40)
  assert.deepEqual(DISHA_CATEGORIES.map((c) => c.name), ['Membership', 'TRF', 'Public Image'])
})

check('field ids are split 1-12 / 13-22 / 23-40 as the portal expects', () => {
  assert.deepEqual(fieldsIn(1).map((f) => f.id), Array.from({ length: 12 }, (_, i) => i + 1))
  assert.deepEqual(fieldsIn(2).map((f) => f.id), Array.from({ length: 10 }, (_, i) => i + 13))
  assert.deepEqual(fieldsIn(3).map((f) => f.id), Array.from({ length: 18 }, (_, i) => i + 23))
})

check('zone membership matches the portal', () => {
  const z4 = DISHA_DISTRICTS.filter((d) => d.zoneId === 1).map((d) => d.number)
  const z7 = DISHA_DISTRICTS.filter((d) => d.zoneId === 2).map((d) => d.number)
  assert.deepEqual(z4, ['3011', '3012', '3040', '3053', '3055', '3056', '3060', '3080', '3090', '3141', '3142'])
  assert.deepEqual(z7, ['3020', '3131', '3132', '3150', '3160', '3170', '3181', '3182', '3191', '3192'])
})

check('seeded targets survived the port', () => {
  // Spot-check D3011 against the seed file.
  assert.equal(goalValue(1, 1), '150')      // No of Clubs
  assert.equal(goalValue(1, 2), '5700')     // No of Members
  assert.equal(goalValue(1, 10), '31.93')   // Women Members %
  assert.ok(Object.keys(GOALS).length === 21)
  assert.ok(Object.keys(PREVIOUS).length === 21)
})

check('a blank source cell stays blank rather than becoming zero', () => {
  // D3012 has no Women Member figure in the seed.
  assert.equal(goalValue(2, 9), null)
  assert.equal(dishaNumber(null), null)
  assert.equal(dishaNumber(''), null)
  assert.equal(dishaNumber(0), '0')         // a real zero still renders
})

check('PI points follow the published scale', () => {
  // Seminar 250 + 3 sessions 300 + district social 500 + 40% clubs 200 = 1250
  assert.equal(piPoints({ 23: 'YES', 24: '3', 25: 'YES', 26: '40' }), 1250)
  // 33% is the threshold, not above it
  assert.equal(piPoints({ 26: '33' }), 200)
  assert.equal(piPoints({ 26: '32.9' }), 0)
  // Projects: 5 -> 500; 10 -> 500 + 5x200 = 1500; 12 -> 1500 + 2x300 = 2100
  assert.equal(piPoints({ 31: '5' }), 500)
  assert.equal(piPoints({ 31: '10' }), 1500)
  assert.equal(piPoints({ 31: '12' }), 2100)
  // Display: 5 -> 500; 8 -> 500 + 3x200 = 1100
  assert.equal(piPoints({ 32: '5' }), 500)
  assert.equal(piPoints({ 32: '8' }), 1100)
  assert.equal(piPoints({}), 0)
})

check('Public Image carries no pre-loaded figures', () => {
  const piFields = fieldsIn(3).map((f) => f.id)
  const anySet = DISHA_DISTRICTS.some((d) => piFields.some((fid) => goalValue(d.id, fid) != null))
  assert.equal(anySet, false, 'PI is entered live, so nothing should be seeded')
})

check('completion counts only target fields, and no district is complete yet', () => {
  assert.ok(TARGET_FIELDS.every((f) => f.isTarget && f.dataType !== 'text'))
  const c = completion(1)
  assert.ok(c.filled > 0 && c.filled < c.total)
  assert.equal(DISHA_DISTRICTS.filter((d) => completion(d.id).complete).length, 0)
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

console.log(`\n${n} checks passed\n`)
