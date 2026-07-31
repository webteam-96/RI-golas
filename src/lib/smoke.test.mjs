// Data-path smoke test:  node src/lib/smoke.test.mjs
// The build passing only proves the JSX parses. This exercises every accessor the pages
// actually call, on every record, so a missing field surfaces here and not on the projector.
import assert from 'node:assert/strict'
import { CLUBS } from '../data/clubs.js'
import { FOUNDATION, CLUB_METRICS, AREAS, metricsFor, metricsInArea } from '../data/metrics.js'
import { AREA_METRIC_IDS, AREA_LEAD, areaLead } from '../data/headline.js'
import { ZONE, DISTRICTS } from '../data/zone6.js'
import { actualFor, coordinatorTotal, clubsIn, achievement } from './rollup.js'
import { seedTargets, goalKey } from '../data/seedTargets.js'
import { areaMetricsFor, areaLeadFor } from '../data/headline.js'

let n = 0
const check = (name, fn) => { fn(); n++; console.log('  ok  ' + name) }

console.log('\ndata paths')

check('every club has the shape the pages read', () => {
  for (const c of CLUBS) {
    assert.equal(typeof c.id, 'string', `club id must be a string: ${c.name}`)
    assert.ok(c.name && c.districtId, `club missing name/district: ${c.id}`)
    for (const k of ['membership', 'trf', 'service', 'excellence', 'sponsored'])
      assert.ok(c[k] && typeof c[k] === 'object', `${c.name} missing ${k}`)
    // club/Overview.jsx renders president as either a string or {name}
    if (c.president != null)
      assert.ok(typeof c.president === 'string' || typeof c.president.name === 'string', `${c.name} president shape`)
  }
})

check('every club metric reads every club without throwing', () => {
  for (const m of CLUB_METRICS)
    for (const c of CLUBS) {
      const v = m.get(c)
      assert.ok(v === null || typeof v === 'number', `${m.id} on ${c.name} returned ${typeof v}`)
      if (typeof v === 'number') assert.ok(Number.isFinite(v), `${m.id} on ${c.name} is not finite`)
    }
})

check('every club id is unique', () => {
  const ids = CLUBS.map((c) => c.id)
  assert.equal(new Set(ids).size, ids.length)
})

check('every foundation metric resolves at district, zone and RI scope', () => {
  for (const m of FOUNDATION) {
    for (const d of DISTRICTS) {
      const r = actualFor(m.id, 'district', d.id)
      assert.ok(r.value === null || typeof r.value === 'number' || typeof r.value === 'boolean',
        `${m.id} @ D${d.id}`)
    }
    for (const scope of ['zone', 'ri']) assert.doesNotThrow(() => actualFor(m.id, scope, ZONE.id))
    for (const c of ZONE.coordinators) assert.doesNotThrow(() => coordinatorTotal(m.id, c))
  }
})

check('every club metric resolves at club, district and zone scope', () => {
  for (const m of CLUB_METRICS) {
    for (const c of CLUBS.slice(0, 5)) assert.doesNotThrow(() => actualFor(m.id, 'club', c.id))
    for (const d of DISTRICTS) assert.doesNotThrow(() => actualFor(m.id, 'district', d.id))
    assert.doesNotThrow(() => actualFor(m.id, 'zone', ZONE.id))
  }
})

check('districts without clubs return null, not zero, for club metrics', () => {
  const empty = DISTRICTS.find((d) => clubsIn(d.id).length === 0)
  assert.ok(empty, 'expected at least one district with no club roster')
  const r = actualFor('members', 'district', empty.id)
  assert.equal(r.value, null, 'a district with no clubs must not report 0 members')
  assert.equal(r.total, 0)
})

check('every coordinator supports only real Zone 6 districts', () => {
  for (const c of [...ZONE.coordinators, ZONE.rrfc])
    for (const d of c.supports)
      assert.ok(ZONE.districtIds.includes(d), `${c.name} supports unknown district ${d}`)
})

check('metric ids are unique across the whole catalogue', () => {
  const ids = [...FOUNDATION, ...CLUB_METRICS].map((m) => m.id)
  const dupes = ids.filter((x, i) => ids.indexOf(x) !== i)
  assert.deepEqual(dupes, [], `duplicate metric ids: ${dupes}`)
})

// The tab strip is driven by `area`. A metric with a typo'd area silently disappears from
// every screen rather than erroring, so pin the four areas down here.
check('there are exactly four goal areas', () => {
  assert.deepEqual(AREAS.map((a) => a.id), ['foundation', 'membership', 'publicimage', 'projects'])
})

check('every metric belongs to one of the four areas', () => {
  const ids = new Set(AREAS.map((a) => a.id))
  for (const m of [...FOUNDATION, ...CLUB_METRICS])
    assert.ok(ids.has(m.area), `${m.id} has area "${m.area}"`)
})

check('every area has metrics at every scope that offers it', () => {
  for (const scope of ['ri', 'zone', 'district', 'club']) {
    const ms = metricsFor(scope)
    for (const a of AREAS)
      assert.ok(metricsInArea(ms, a.id).length > 0, `${scope} has no ${a.id} metrics`)
  }
})

check('each area lead and column metric resolves to a real metric', () => {
  for (const a of AREAS) {
    assert.ok(areaLead(a.id), `no lead metric for ${a.id}`)
    assert.equal(areaLead(a.id).area, a.id, `lead metric for ${a.id} sits in the wrong area`)
    const all = [...FOUNDATION, ...CLUB_METRICS]
    for (const id of AREA_METRIC_IDS[a.id]) {
      const m = all.find((x) => x.id === id)
      assert.ok(m, `${a.id} column "${id}" does not exist`)
      assert.equal(m.area, a.id, `${id} is listed under ${a.id} but its area is ${m.area}`)
    }
  }
  assert.deepEqual(Object.keys(AREA_LEAD).sort(), AREAS.map((a) => a.id).sort())
})

// Every level renders the same achievement block. If a scope has no seeded targets its
// dashboard shows a page of dashes, which looks like a bug on the projector.
check('seeded targets make every level scorable', () => {
  const seed = seedTargets()
  const score = (scope, id) => {
    const metrics = AREAS.flatMap((a) => areaMetricsFor(scope, a.id))
    return achievement(metrics.map((m) => ({
      target: seed[goalKey(scope, id, m.id)]?.target ?? null,
      actual: actualFor(m.id, scope, id).value,
      higherIsBetter: m.higherIsBetter,
    })))
  }

  const ri = score('ri', 'ri')
  assert.ok(ri.attainment > 0, 'RI has no scorable goals')
  assert.equal(ri.scored, ri.total, 'every RI goal should be scorable')

  const zone = score('zone', ZONE.id)
  assert.ok(zone.attainment > 0, 'zone has no scorable goals')

  // D3120 carries the club roster. Public Image is the only gap — the 3192 records have no
  // such columns — so 13 of 16 must score.
  const d3120 = score('district', '3120')
  assert.ok(d3120.attainment > 0, 'D3120 has no scorable goals')
  assert.equal(d3120.scored, 13, 'D3120 should score everything except the 3 Public Image goals')

  // A district with no roster still scores Foundation and simply cannot score the rest.
  const d3261 = score('district', '3261')
  assert.ok(d3261.scored > 0, 'D3261 should still score its Foundation goals')
  assert.ok(d3261.scored < d3261.total, 'D3261 has no clubs, so some goals must be unscored')

  const club = score('club', '15766')
  assert.ok(club.attainment > 0, 'club has no scorable goals')
  assert.ok(club.scored >= 9, `club scored only ${club.scored} goals`)
})

// A pure proportional split gives a child contributing nothing a target of zero, which leaves
// it unscored instead of behind — the worst performers would vanish from the average.
check('a district contributing nothing still gets a target it can miss', () => {
  const seed = seedTargets()
  // D3120 reports no PHSM at all.
  const t = seed[goalKey('district', '3120', 'phsmPaulHarrisSocietyMember')]?.target
  assert.ok(t > 0, 'a zero-contributing district must still carry a target')
  assert.equal(actualFor('phsmPaulHarrisSocietyMember', 'district', '3120').value, 0)
})

// A rate is not a total. Every level aims at the same percentage, not a slice of it.
check('rate targets pass down unchanged; totals are split', () => {
  const seed = seedTargets()
  const zoneRate = seed[goalKey('zone', ZONE.id, 'myRotaryPct')].target
  assert.equal(seed[goalKey('district', '3120', 'myRotaryPct')].target, zoneRate)
  assert.equal(seed[goalKey('club', '15766', 'myRotaryPct')].target, zoneRate)

  const zoneTotal = seed[goalKey('zone', ZONE.id, 'annualFund')].target
  const dTotal = seed[goalKey('district', '3120', 'annualFund')].target
  assert.ok(dTotal < zoneTotal, 'a district share of a total must be smaller than the zone target')
})

check('every area lead resolves at the scope it is used in', () => {
  for (const scope of ['ri', 'zone', 'district', 'club'])
    for (const a of AREAS) {
      const m = areaLeadFor(scope, a.id)
      assert.ok(m, `${scope}/${a.id} has no lead metric`)
      assert.equal(m.area, a.id)
      assert.ok(areaMetricsFor(scope, a.id).length > 0, `${scope}/${a.id} has no metrics`)
    }
})

console.log(`\n${n} checks passed\n`)
