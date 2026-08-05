// Data-path smoke test:  node src/lib/smoke.test.mjs
// The build passing only proves the JSX parses. This exercises every accessor the pages
// actually call, on every record, so a missing field surfaces here and not on the projector.
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { CLUBS } from '../data/clubs.js'
import * as metrics from '../data/metrics.js'
import { FOUNDATION, CLUB_METRICS, AREAS, metricsFor, metricsInArea } from '../data/metrics.js'
import { AREA_METRIC_IDS, AREA_LEAD, areaLead } from '../data/headline.js'
import { ZONE, DISTRICTS } from '../data/zone6.js'
import { actualFor, coordinatorTotal, clubsIn, achievement } from './rollup.js'
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

// The source carries no targets — District Governors set them live at the goal-setting event —
// so the goals store starts empty and every level must read as unscored rather than inventing
// a bar to measure against. These two checks are the guarantee the old seed used to break.
check('with no targets entered, nothing is scored at any level', () => {
  const score = (scope, id) => {
    const ms = AREAS.flatMap((a) => areaMetricsFor(scope, a.id))
    return achievement(ms.map((m) => ({
      target: null,                                  // an empty goals store: read() yields null
      actual: actualFor(m.id, scope, id).value,
      higherIsBetter: m.higherIsBetter,
    })))
  }

  for (const [scope, id] of [['ri', 'ri'], ['zone', ZONE.id], ['district', '3120'], ['district', '3261'], ['club', '15766']]) {
    const s = score(scope, id)
    assert.ok(s.total > 0, `${scope}/${id} has no goals at all`)
    assert.equal(s.scored, 0, `${scope}/${id} scored ${s.scored} goals with no targets set`)
    assert.equal(s.onTrack, 0, `${scope}/${id} called goals on track with no targets set`)
    assert.equal(s.achieved, 0, `${scope}/${id} called goals achieved with no targets set`)
    assert.equal(s.attainment, null, `${scope}/${id} produced an attainment figure out of nothing`)
  }
})

check('no module ships a seeded target set', () => {
  assert.ok(!existsSync(new URL('../data/seedTargets.js', import.meta.url)), 'seedTargets.js is back')
  const seeded = Object.keys(metrics).filter((k) => /^SEED|TARGET/.test(k))
  assert.deepEqual(seeded, [], `metrics.js exports target values: ${seeded}`)
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
