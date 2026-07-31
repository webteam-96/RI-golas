import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { ZONE, DISTRICTS, getDistrict, coordinatorsForDistrict } from '@/data/zone6'
import { DISTRICT_DATA_SUBSTITUTIONS } from '@/data/foundationGoals'
import { AREAS, areaLead, shortLabel } from '@/data/headline'
import { actualFor, clubsIn } from '@/lib/rollup'
import { fmt } from '@/lib/format'
import { LevelBanner, StatPlate, DataNote } from '@/components/Bits'
import GoalDashboard from '@/components/GoalDashboard'

export default function DistrictOverview() {
  const { districtId } = useParams()
  const d = getDistrict(districtId)
  const clubs = clubsIn(districtId)
  const arrfc = coordinatorsForDistrict(districtId)
  const sub = DISTRICT_DATA_SUBSTITUTIONS[districtId]

  const rank = [...DISTRICTS]
    .map((x) => ({ id: x.id, v: actualFor('annualFund', 'district', x.id).value ?? 0 }))
    .sort((a, b) => b.v - a.v)
    .findIndex((x) => x.id === districtId) + 1

  const items = clubs.map((c) => ({
    id: c.id,
    label: c.name,
    sub: c.charterDate ? `chartered ${c.charterDate}` : null,
    to: `/club/${c.id}/overview`,
  }))

  return (
    <>
      <LevelBanner
        eyebrow={`${ZONE.name} · Annual Fund rank ${rank} of ${DISTRICTS.length}`}
        title={`District ${districtId}`}
        sub={`${d.region} · ARRFC ${arrfc.map((c) => c.name).join(', ') || '—'}`}
        right={
          <Link to="/zone/overview"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            View {ZONE.name} <ArrowUpRight size={13} />
          </Link>
        }
      />

      <StatPlate
        title={`District ${districtId} total`}
        sub={arrfc.length ? `Supported by ${arrfc.map((c) => c.name).join(', ')}` : undefined}
        columns="lg:grid-cols-5"
        items={[
          { label: 'Clubs', value: clubs.length || '—', sub: clubs.length ? 'roster loaded' : 'not loaded' },
          ...AREAS.map((a) => {
            const m = areaLead(a.id)
            return { label: a.label, value: fmt(actualFor(m.id, 'district', districtId).value, m.unit), sub: shortLabel(m) }
          }),
        ]}
      />

      {sub && (
        <div className="mb-5">
          <DataNote>
            District <strong>{districtId}</strong> has no column in the Foundation workbook. Every
            Foundation figure on this page is sourced from column <strong>{sub}</strong>.
          </DataNote>
        </div>
      )}

      <GoalDashboard
        scope="district"
        scopeId={districtId}
        childScope="club"
        items={items}
        itemsTitle="Clubs"
      />

      {!clubs.length && (
        <div className="mt-5">
          <DataNote tone="slate">
            No club roster is loaded for District {districtId}, so Membership, Public Image and Projects
            have nothing to roll up. The Foundation figures above are reported at district level and are real.
          </DataNote>
        </div>
      )}
    </>
  )
}
