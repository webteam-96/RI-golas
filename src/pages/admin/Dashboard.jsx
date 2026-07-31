import { useState } from 'react'
import { DISHA_ZONES, DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR, districtsIn } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, DataNote } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

export default function AdminDashboard() {
  const [zoneId, setZoneId] = useState(null)
  const districts = zoneId ? districtsIn(zoneId) : DISHA_DISTRICTS

  return (
    <>
      <LevelBanner
        eyebrow={`Monthly coordinator report · ${GOALS_YEAR}`}
        title="Goal Progress"
        sub={`${DISHA_ZONES.map((z) => z.name).join(' & ')} · ${DISHA_DISTRICTS.length} districts · achieved against target, field by field`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Districts" value={DISHA_DISTRICTS.length} tone="royal"
             sub={DISHA_ZONES.map((z) => `${z.name.replace('Zone ', 'Z')} ${districtsIn(z.id).length}`).join(' · ')} />
        <Kpi label="Categories" value={REPORT_CATEGORIES.length} tone="gold"
             sub={REPORT_CATEGORIES.map((c) => c.label).join(' · ')} />
        <Kpi label="Fields on the form" value={REPORT_FIELDS.length} tone="purple"
             sub={`${SOURCED_FIELDS} with data behind them`} />
        <Kpi label="Reporting period" value={PREVIOUS_YEAR} tone="slate" sub={`targets for ${GOALS_YEAR}`} />
      </div>

      <GoalMatrix
        categories={REPORT_CATEGORIES.map((c) => ({ id: c.id, label: c.label, badge: c.pdf }))}
        fields={(catId) => fieldsInCategory(catId).map((f) => ({ ...f, muted: f.src ? null : 'not collected' }))}
        entities={districts.map((d) => ({ id: d.id, label: d.number, to: `/admin/districts` }))}
        achieved={(f, e) => achievedFor(f, DISHA_DISTRICTS.find((d) => d.id === e.id))}
        target={(f, e) => targetValue(e.id, f.id)}
        format={dishaNumber}
        sub={`${districts.length} districts across`}
        right={
          <div className="flex gap-0.5 bg-slate-100/80 rounded-xl p-1">
            <Tab on={zoneId === null} go={() => setZoneId(null)}>Both zones</Tab>
            {DISHA_ZONES.map((z) => (
              <Tab key={z.id} on={zoneId === z.id} go={() => setZoneId(z.id)}>{z.name}</Tab>
            ))}
          </div>
        }
      />

      <div className="mt-5 space-y-2">
        <DataNote>
          <strong>Targets are placeholders.</strong> The portal holds none — District Governors set them
          live at the goal-setting event. These are derived from each district&apos;s own figure so the
          layout can be read, and are replaced the moment real targets arrive.
        </DataNote>
        <DataNote tone="slate">
          Fields come from the Zone 6 monthly coordinator report. {REPORT_FIELDS.length - SOURCED_FIELDS} of
          the {REPORT_FIELDS.length} are on the form but not collected in any dataset yet — they are marked
          and left blank rather than filled with a zero.
        </DataNote>
      </div>
    </>
  )
}

function Tab({ on, go, children }) {
  return (
    <button onClick={go}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
              on ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-white'
            }`}>
      {children}
    </button>
  )
}
