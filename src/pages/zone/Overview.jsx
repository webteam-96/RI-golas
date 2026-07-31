import { ZONE, DISTRICTS, RY } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { AREAS, areaLead, shortLabel } from '@/data/headline'
import { actualFor, clubsIn } from '@/lib/rollup'
import { fmt } from '@/lib/format'
import { LevelBanner, Kpi, DataNote } from '@/components/Bits'
import GoalDashboard from '@/components/GoalDashboard'

export default function ZoneOverview() {
  const totalClubs = DISTRICTS.reduce((s, d) => s + clubsIn(d.id).length, 0)

  const items = DISTRICTS.map((d) => ({
    id: d.id,
    label: `District ${d.id}`,
    sub: d.region,
    to: `/district/${d.id}/overview`,
    note: DISTRICT_DATA_SUBSTITUTIONS[d.id],
  }))

  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · ${DISTRICTS.length} districts`}
        title={ZONE.name}
        sub={`RRFC ${ZONE.rrfc.name} (D ${ZONE.rrfc.homeDistrict}) · ${ZONE.coordinators.length} ARRFCs · RY ${RY}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <Kpi label="Districts" value={DISTRICTS.length} tone="slate" />
        <Kpi label="Clubs" value={totalClubs} tone="slate" sub="rosters loaded" />
        {AREAS.map((a) => {
          const m = areaLead(a.id)
          return (
            <Kpi key={a.id} label={a.label} sub={shortLabel(m)}
                 value={fmt(actualFor(m.id, 'zone', ZONE.id).value, m.unit)}
                 tone={a.id === 'foundation' ? 'gold' : a.id === 'membership' ? 'blue' : a.id === 'publicimage' ? 'purple' : 'green'} />
          )
        })}
      </div>

      <GoalDashboard scope="zone" scopeId={ZONE.id} childScope="district" items={items} itemsTitle="Districts" />

      <div className="mt-5 space-y-2">
        <DataNote>
          <strong>D3292</strong> has no column in the Foundation workbook. The figures shown for it are
          sourced from column <strong>3291</strong> and are flagged wherever they appear.
        </DataNote>
        <DataNote tone="slate">
          Zone totals sum the 9 districts directly. They are <strong>not</strong> summed through the
          coordinator list, because D3120 is both the RRFC&apos;s home district and an ARRFC&apos;s
          supported district — routing the arithmetic through coordinators would count it twice.
        </DataNote>
      </div>
    </>
  )
}
