import { DISTRICTS, RY, DATA_AS_OF } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { AREAS, areaLead, shortLabel } from '@/data/headline'
import { actualFor, clubsIn } from '@/lib/rollup'
import { fmt } from '@/lib/format'
import { LevelBanner, Kpi, DataNote } from '@/components/Bits'
import GoalDashboard from '@/components/GoalDashboard'

/** RI Director view. No zone layer — straight from the four goal areas to the districts. */
export default function RiOverview() {
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
        eyebrow="RI Director Office"
        title="Global Overview"
        sub={`${DISTRICTS.length} districts · RY ${RY}, data as of ${DATA_AS_OF}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <Kpi label="Districts" value={DISTRICTS.length} tone="slate" />
        <Kpi label="Clubs" value={totalClubs} tone="slate" sub="rosters loaded" />
        {AREAS.map((a) => {
          const m = areaLead(a.id)
          return (
            <Kpi key={a.id} label={a.label} sub={shortLabel(m)}
                 value={fmt(actualFor(m.id, 'ri', 'ri').value, m.unit)}
                 tone={a.id === 'foundation' ? 'gold' : a.id === 'membership' ? 'blue' : a.id === 'publicimage' ? 'purple' : 'green'} />
          )
        })}
      </div>

      <GoalDashboard scope="ri" scopeId="ri" childScope="district" items={items} itemsTitle="Districts" />

      <div className="mt-5 space-y-2">
        <DataNote>
          <strong>D3292</strong> has no column in the Foundation workbook. Its figures are sourced from
          column <strong>3291</strong> and are flagged wherever they appear.
        </DataNote>
        <DataNote tone="slate">
          Foundation figures are reported for all nine districts. Membership, Public Image and Projects
          roll up from club reports, so they show a dash where no roster is loaded rather than a zero.
        </DataNote>
      </div>
    </>
  )
}
