// Runnable check for the roll-up engine:  node src/lib/rollup.test.mjs
// Covers the three ways this module can be quietly wrong: double-counting through the
// coordinator layer, plain-averaging percentages, and treating null as zero.
import assert from 'node:assert/strict'
import {
  actualFor, zoneTotal, coordinatorTotal, aggregateClubs,
  percentAchieved, goalStatus, onTrackYN, clubsIn, achievement,
} from './rollup.js'
import { ZONE } from '../data/zone6.js'
import { clubMetric } from '../data/metrics.js'

let n = 0
const check = (name, fn) => { fn(); n++; console.log('  ok  ' + name) }

console.log('\nroll-up engine')

check('zone Annual Fund matches the workbook total', () => {
  assert.equal(zoneTotal('annualFund'), 632386)
})

check('zone PHF / Major Donors / PHSM match the workbook', () => {
  assert.equal(zoneTotal('phf'), 685)
  assert.equal(zoneTotal('majorDonors'), 25)
  assert.equal(zoneTotal('phsmPaulHarrisSocietyMember'), 27)
})

// The one that matters: D3120 is the RRFC's home district AND is supported by ARRFC
// Jhunjhunuwala. Summing through coordinators must still count it exactly once.
check('coordinator-grouped total equals district-summed total (D3120 counted once)', () => {
  const viaCoordinators = ZONE.coordinators.reduce((s, c) => s + (coordinatorTotal('annualFund', c) ?? 0), 0)
  assert.equal(viaCoordinators, zoneTotal('annualFund'))
  assert.equal(viaCoordinators, 632386)

  // And prove the trap is real: adding the RRFC's zone-wide slice on top double-counts.
  const naive = viaCoordinators + (coordinatorTotal('annualFund', ZONE.rrfc) ?? 0)
  assert.notEqual(naive, 632386)
})

check('every Zone 6 district is covered by exactly one ARRFC', () => {
  const counts = {}
  for (const c of ZONE.coordinators) for (const d of c.supports) counts[d] = (counts[d] ?? 0) + 1
  assert.deepEqual(Object.keys(counts).sort(), [...ZONE.districtIds].sort())
  for (const [d, k] of Object.entries(counts)) assert.equal(k, 1, `district ${d} covered ${k}x`)
})

check('percentages are weighted by members, not plain-averaged', () => {
  const clubs = [
    { membership: { current: 324, myRotary: 163 } },
    { membership: { current: 53,  myRotary: 39  } },
    { membership: { current: 13,  myRotary: 7   } },
    { membership: { current: 33,  myRotary: 31  } },
    { membership: { current: 24,  myRotary: 23  } },
  ]
  const m = clubMetric('myRotaryPct')
  const { value } = aggregateClubs(m, clubs)
  const plain = clubs.reduce((s, c) => s + m.get(c), 0) / clubs.length

  assert.ok(Math.abs(value - 58.84) < 0.02, `weighted ${value}`)
  assert.ok(Math.abs(plain - 73.50) < 0.02, `plain ${plain}`)
  assert.ok(plain - value > 14, 'plain average overstates by ~15 points')
})

check('null is excluded from the denominator, not counted as zero', () => {
  const m = clubMetric('attendance')
  const clubs = [
    { membership: { current: 100, attendance: 80 } },
    { membership: { current: 100, attendance: null } }, // did not report
  ]
  const { value, reporting, total } = aggregateClubs(m, clubs)
  assert.equal(value, 80, 'the non-reporting club must not drag this to 40')
  assert.equal(reporting, 1)
  assert.equal(total, 2)
})

check('Yes/No metrics report n-of-m, never a percentage', () => {
  const r = actualFor('annualFund100ClubsContributingMinimum100', 'zone', ZONE.id)
  assert.equal(r.isYesNo, true)
  assert.equal(r.value, 1)      // only D3240 achieved it
  assert.equal(r.total, 9)
})

check('lower-is-better metrics invert', () => {
  assert.equal(percentAchieved(10, 8, false), 100)   // under target = fully achieved
  assert.equal(percentAchieved(10, 20, false), 50)   // double the target = half achieved
  assert.equal(percentAchieved(10, 8, true), 80)
})

check('status is pace-aware, not raw percent', () => {
  assert.equal(goalStatus(60, 3), 'ontrack')   // 60% by month 3 is well ahead of a 25% pace
  assert.equal(goalStatus(60, 9), 'atrisk')    // the same 60% by month 9, against a 75% pace
  assert.equal(goalStatus(40, 9), 'behind')
  assert.equal(goalStatus(100, 3), 'achieved') // only >=100% is achieved, whatever the month
  assert.equal(goalStatus(null, 9), 'nodata')
  assert.equal(onTrackYN(goalStatus(95, 9)), 'Y')
  assert.equal(onTrackYN(goalStatus(40, 9)), 'N')
})

check('club rosters landed in the districts they belong to', () => {
  assert.equal(clubsIn('3120').length, 42)
  assert.equal(clubsIn('3030').length, 4)
  assert.equal(clubsIn('3250').length, 0)  // district-level only, by design
  assert.ok(clubsIn('3120').every((c) => c.districtId === '3120'))
})

check('district roll-up of club metrics stays consistent with the club list', () => {
  const members = actualFor('members', 'district', '3120').value
  const byHand = clubsIn('3120').reduce((s, c) => s + (c.membership.current ?? 0), 0)
  assert.equal(members, byHand)
  assert.ok(members > 0)
})

check('achievement caps each goal at 100 so one overachiever cannot mask failures', () => {
  const r = achievement([
    { target: 100, actual: 400 },   // 400% -> capped to 100
    { target: 100, actual: 10 },
    { target: 100, actual: 10 },
    { target: 100, actual: 10 },
  ], 9)
  assert.equal(r.attainment, (100 + 10 + 10 + 10) / 4)   // 32.5, not 107.5
  assert.ok(r.attainment < 100, 'three failing goals must not average above 100')
  assert.equal(r.achieved, 1)
  assert.equal(r.onTrack, 1)
})

check('achievement counts unscored goals without letting them flatter the average', () => {
  const r = achievement([
    { target: 100, actual: 80 },
    { target: null, actual: 50 },   // no target set
    { target: 100, actual: null },  // nothing reported
  ], 9)
  assert.equal(r.total, 3)
  assert.equal(r.scored, 1)
  assert.equal(r.attainment, 80)
})

check('achievement is empty-safe', () => {
  const r = achievement([], 9)
  assert.equal(r.attainment, null)
  assert.equal(r.total, 0)
  assert.equal(r.onTrack, 0)
})

console.log(`\n${n} checks passed\n`)
