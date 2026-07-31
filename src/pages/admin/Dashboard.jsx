import { useState, Fragment } from 'react'
import {
  DISHA_ZONES, DISHA_DISTRICTS, DISHA_CATEGORIES, GOALS_YEAR, PREVIOUS_YEAR,
  districtsIn, prevValue,
} from '@/data/disha'
import { zoneStats, sections, dishaNumber, totalFor, TARGET_FIELDS } from '@/lib/disha'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'

/**
 * Consolidated goal view — fields down, districts across, grouped by the section headings the
 * goal forms use. Picking a category swaps the rows; the district columns stay put so the eye
 * keeps its place.
 */
export default function AdminDashboard() {
  const [categoryId, setCategoryId] = useState(1)
  const [zoneId, setZoneId] = useState(null)          // null = both zones

  const districts = zoneId ? districtsIn(zoneId) : DISHA_DISTRICTS
  const groups = sections(categoryId)
  const category = DISHA_CATEGORIES.find((c) => c.id === categoryId)

  return (
    <>
      <LevelBanner
        eyebrow={`Goal setting ${GOALS_YEAR}`}
        title="Consolidated Goals"
        sub={`${DISHA_ZONES.map((z) => z.name).join(' & ')} · ${DISHA_DISTRICTS.length} districts · ${DISHA_CATEGORIES.length} categories`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Districts" value={DISHA_DISTRICTS.length} tone="royal"
             sub={DISHA_ZONES.map((z) => `${z.name.replace('Zone ', 'Z')} ${districtsIn(z.id).length}`).join(' · ')} />
        <Kpi label="Categories" value={DISHA_CATEGORIES.length} tone="gold"
             sub={DISHA_CATEGORIES.map((c) => c.name).join(' · ')} />
        <Kpi label="Target fields" value={TARGET_FIELDS.length} tone="purple" sub="per district" />
        <Kpi label="Targets set" value="0" tone="slate" sub="entered live at the event" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {DISHA_ZONES.map((z) => {
          const s = zoneStats(z.id)
          return (
            <Card key={z.id} title={z.name} sub={`${s.districts} districts`}>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Existing figures on file</span>
                <span className="font-data font-semibold text-slate-600">{s.pct.toFixed(0)}%</span>
              </div>
              <Bar value={s.pct} max={100} height="h-2" />
              <p className="text-[11px] text-slate-400 mt-2">
                {districtsIn(z.id).map((d) => d.number).join(' · ')}
              </p>
            </Card>
          )
        })}
      </div>

      <Card
        title="Consolidated view"
        sub={`${category.name} · ${PREVIOUS_YEAR} existing figures · ${districts.length} districts across`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-0.5 bg-slate-100/80 rounded-xl p-1">
              <ZoneTab active={zoneId === null} onClick={() => setZoneId(null)}>Both</ZoneTab>
              {DISHA_ZONES.map((z) => (
                <ZoneTab key={z.id} active={zoneId === z.id} onClick={() => setZoneId(z.id)}>
                  {z.name}
                </ZoneTab>
              ))}
            </div>
          </div>
        }
      >
        {/* Category tabs — the listing that swaps the rows */}
        <div className="flex gap-1 flex-wrap bg-slate-100/80 rounded-xl p-1 mb-4">
          {DISHA_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                categoryId === c.id ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-white'
              }`}
            >
              {c.name}
              <span className={`ml-1.5 text-[10px] ${categoryId === c.id ? 'text-blue-200' : 'text-slate-400'}`}>
                {sections(c.id).reduce((n, s) => n + s.fields.length, 0)}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="eyebrow text-slate-400 text-left py-3 pl-5 pr-3 sticky left-0 bg-slate-50 min-w-[280px]">
                  Field
                </th>
                {districts.map((d) => (
                  <th key={d.id} className="font-data text-[12px] font-semibold text-slate-600 text-right py-3 px-2.5 min-w-[80px]">
                    {d.number}
                  </th>
                ))}
                <th className="eyebrow text-white text-right py-3 px-3 min-w-[90px] bg-royal">Total</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((section) => (
                <Fragment key={section.name}>
                  <tr>
                    <td colSpan={districts.length + 2}
                        className="eyebrow text-royal bg-royal/[0.05] py-2 pl-5 sticky left-0">
                      {section.name}
                    </td>
                  </tr>
                  {section.fields.filter((f) => f.dataType !== 'text').map((f) => {
                    const total = f.showPrev ? totalFor(f.id, districts.map((d) => d.id)) : null
                    return (
                      <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="py-2.5 pl-5 pr-3 text-slate-700 sticky left-0 bg-white">
                          {f.label}
                          {!f.showPrev && (
                            <span className="ml-2 text-[10px] text-slate-300">
                              {f.readonly ? 'computed' : 'target'}
                            </span>
                          )}
                        </td>
                        {districts.map((d) => {
                          const text = f.showPrev ? dishaNumber(prevValue(d.id, f.id), f.unit) : null
                          return (
                            <td key={d.id} className="py-2.5 px-2.5 text-right tabular-nums text-slate-800">
                              {text ?? <span className="text-slate-300">—</span>}
                            </td>
                          )
                        })}
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-royal bg-royal/[0.04]">
                          {dishaNumber(total, f.unit) ?? <span className="text-slate-300 font-normal">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 space-y-2">
        <DataNote>
          Rows marked <strong>target</strong> are what each District Governor enters at the goal-setting
          event. Nothing is pre-filled for them, so those rows read as dashes until the session runs —
          that is the real state, not missing data.
        </DataNote>
        <DataNote tone="slate">
          The figures shown are the {PREVIOUS_YEAR} existing values each district starts from. A dash
          means the source cell was blank, which is not the same as zero and is left out of the total.
        </DataNote>
      </div>
    </>
  )
}

function ZoneTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
        active ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}
