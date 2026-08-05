import { useState, useSyncExternalStore } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { ZONE, ARRFC_ROLE_LONG } from '@/data/zone6'
import { DISHA_DISTRICTS, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor, SOURCED_FIELDS } from '@/data/reportFields'
import { targetValue, subscribe, getTargets } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Card, DataNote } from '@/components/Bits'

const byNumber = (n) => DISHA_DISTRICTS.find((d) => d.number === String(n)) ?? null

// The RRFC sits on ZONE.rrfc, not in ZONE.coordinators, so looking the selected name up in the
// coordinators alone never found him.
//
// His coverage comes from the DISHA data, not from zone6.js's hand-written DISTRICTS list: that
// list has nine entries and omits 3291, which the portal carries as a real Zone 6 district with
// its own governor. The RRFC leads the whole zone, so he gets all ten — the same number the RI
// Director's screens show. 3291 having no ARRFC beneath him is a separate, surfaced fact.
const TEAM = [
  { ...ZONE.rrfc, supports: DISHA_DISTRICTS.filter((d) => d.zoneId === 2).map((d) => d.number) },
  ...ZONE.coordinators,
]
const ROLES = ['RRFC', 'ARRFC', 'ARC', 'RMGA', 'EMGA', 'RPIC']

const input = 'w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]'

/**
 * The Zone 6 monthly coordinator report. The category sections are filled from the same figures
 * the rest of the app reads, so the coordinator reviews rather than retypes. Rows the portal has
 * no column for are marked, not guessed, and the closing sections are theirs to write.
 */
export default function MonthlyReport() {
  const [coordinator, setCoordinator] = useState(ZONE.rrfc.name)
  const [role, setRole] = useState('RRFC')
  const [free, setFree] = useState({ challenges: '', support: '', plan: '' })
  const [toast, setToast] = useState(null)
  // Targets are entered on another screen. Subscribing to the snapshot object, not to a count:
  // its identity changes on every write, so overwriting an existing target redraws here too.
  useSyncExternalStore(subscribe, getTargets, getTargets)

  const selected = TEAM.find((c) => c.name === coordinator) ?? ZONE.rrfc
  const districts = selected.supports.map(byNumber).filter(Boolean)

  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const sumOver = (f) => {
    let s = null
    for (const d of districts) {
      const v = achievedFor(f, d)
      if (v != null) s = (s ?? 0) + v
    }
    return s
  }
  const targetOver = (f) => {
    let s = null
    for (const d of districts) {
      const t = targetValue(d.id, f.id)
      if (t != null) s = (s ?? 0) + t
    }
    return s
  }

  return (
    <>
      <LevelBanner
        eyebrow="Office of the RI Director-elect"
        title="Monthly Coordinator Progress Report"
        sub={`${ZONE.name} · due by the 5th of each month · one form per coordinator`}
        right={
          <div className="flex flex-wrap gap-2 no-print">
            <Btn onClick={() => window.print()}><Download size={13} /> Export PDF</Btn>
            <Btn onClick={() => say('Excel export would carry the district columns and field codes.')}>
              <FileSpreadsheet size={13} /> Export Excel
            </Btn>
          </div>
        }
      />

      <div className="mb-4">
        <DataNote>
          The portal carries {SOURCED_FIELDS} of the {REPORT_FIELDS.length} rows on this form, and those
          arrive filled from the reported figures. The other {REPORT_FIELDS.length - SOURCED_FIELDS},
          including all of Public Image, are not collected in the portal and stay blank on both sides.
          The figures are each district&apos;s reported position for {PREVIOUS_YEAR}. The{' '}
          <strong>Target {GOALS_YEAR} column is provisional</strong>: each figure is grown from those
          same reported figures, not supplied by the client and not held in the portal, which seeds no
          targets because District Governors set them at the goal-setting event. A target typed on a
          Goals screen is the real one and replaces the provisional figure for that field, here and
          everywhere else it appears. The coordinator reviews the numbers and writes the closing
          sections.
        </DataNote>
      </div>

      <div className="space-y-4">
        <Section n={1} title="Reporting Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Coordinator role">
              <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Name">
              <select value={coordinator} onChange={(e) => setCoordinator(e.target.value)} className={input}>
                <option>{ZONE.rrfc.name}</option>
                {ZONE.coordinators.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="District(s) covered" auto>
              <div className={`${input} bg-blue-50/70 border-blue-200 font-data text-[12px]`}>
                {districts.map((d) => d.number).join(' · ')}
              </div>
            </Field>
            {/* This was a month picker. The portal carries one figure per district per year, so
                changing the month changed nothing on the page while implying a monthly series
                that does not exist. The period the figures actually cover is stated instead. */}
            <Field label="Figures cover" auto>
              <div className={`${input} bg-blue-50/70 border-blue-200 text-[12px]`}>
                As reported for {PREVIOUS_YEAR}
              </div>
            </Field>
          </div>
          {/* The RRFC carries his own roleLong; the ARRFCs share one, held once in zone6.js. */}
          <p className="text-[11px] text-slate-400 mt-3">
            {selected.roleLong ?? ARRFC_ROLE_LONG} · home district {selected.homeDistrict}
          </p>
        </Section>

        {/* One section per category, districts across */}
        {REPORT_CATEGORIES.map((cat, i) => (
          // Public Image has no source at all, so it carries no "filled in" badge to belie it.
          <Section key={cat.id} n={i + 2} title={cat.label}
                   auto={fieldsInCategory(cat.id).some((f) => f.src)}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[560px]">
                <thead>
                  <tr className="eyebrow text-slate-400 border-b border-slate-200">
                    <th className="text-left font-medium pb-2">Metric</th>
                    {districts.map((d) => (
                      <th key={d.id} className="text-right font-medium pb-2 px-3 font-data">{d.number}</th>
                    ))}
                    <th className="text-right font-medium pb-2 pl-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fieldsInCategory(cat.id).map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="py-2 text-slate-700">
                        {f.label}
                      </td>
                      {districts.map((d) => (
                        <td key={d.id} className="py-2 px-3 text-right font-data tabular-nums text-slate-700">
                          {dishaNumber(achievedFor(f, d), f.unit) ?? <span className="text-slate-300">—</span>}
                        </td>
                      ))}
                      <td className="py-2 pl-3 text-right font-data tabular-nums font-semibold text-royal">
                        {dishaNumber(sumOver(f), f.unit) ?? <span className="text-slate-300 font-normal">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        ))}

        {/* Not "vs. Zone Target": both columns sum the districts this coordinator covers, which
            for ARRFC Konwar is one district. It is only the zone total when the RRFC is selected. */}
        <Section n={REPORT_CATEGORIES.length + 2} title="Goal Progress vs. Target" auto>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[640px]">
              <thead>
                <tr className="eyebrow text-slate-400 border-b border-slate-200">
                  <th className="text-left font-medium pb-2">Goal area</th>
                  <th className="text-right font-medium pb-2 px-3">
                    Target {GOALS_YEAR}
                    {/* This form is exported to PDF and read away from the page, so the column
                        says what it is rather than relying on the note above travelling with it. */}
                    <span className="block tracking-normal text-slate-300">provisional · districts covered</span>
                  </th>
                  <th className="text-right font-medium pb-2 px-3">Achieved {PREVIOUS_YEAR}</th>
                  {/* Not "% achieved" and not "on track": both read as progress made inside the
                      target year, when this is last year's figure measured against next year's
                      target — how far the target reaches beyond where the zone already stands. */}
                  <th className="text-right font-medium pb-2 px-3">% of target</th>
                  <th className="text-center font-medium pb-2 px-3">Near target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REPORT_FIELDS.map((f) => {
                  const a = sumOver(f)
                  const t = targetOver(f)
                  const pct = a != null && t ? (a / t) * 100 : null
                  const ok = pct == null ? null : f.lowerIsBetter ? pct <= 100 : pct >= 90
                  // Every goal area on the form keeps its row, blank or not — dropping the empty
                  // ones would leave this section a different length from the ones above it.
                  return (
                    <tr key={f.id} className={f.src ? 'bg-blue-50/30' : ''}>
                      <td className="py-2 text-slate-700 font-medium">
                        {f.label}
                      </td>
                      <td className="py-2 px-3 text-right font-data tabular-nums text-slate-500">
                        {dishaNumber(t, f.unit) ?? '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-data tabular-nums font-semibold text-ink">
                        {dishaNumber(a, f.unit) ?? '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-data tabular-nums">
                        {pct == null ? '—' : `${Math.round(pct)}%`}
                      </td>
                      <td className={`py-2 px-3 text-center font-bold text-xs ${
                        ok == null ? 'text-slate-300' : ok ? 'text-[#00702A]' : 'text-[#C8102E]'
                      }`}>
                        {ok == null ? '—' : ok ? 'Y' : 'N'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {[
          { title: 'Challenges / Barriers Identified', k: 'challenges' },
          { title: 'Support Needed from RI Director-elect / Zone Team', k: 'support' },
          { title: 'Action Plan for Next Month', k: 'plan' },
        ].map(({ title, k }, i) => (
          <Section key={k} n={REPORT_CATEGORIES.length + 3 + i} title={title}>
            <textarea
              rows={4}
              value={free[k]}
              onChange={(e) => setFree({ ...free, [k]: e.target.value })}
              placeholder="The coordinator's own words — this part is not filled in for them."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y
                         focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]"
            />
          </Section>
        ))}

        <Card>
          <Field label="Submitted by (name & signature)">
            <div className={`${input} text-slate-700 max-w-sm`}>{coordinator}</div>
          </Field>
          <p className="text-[11px] text-slate-400 mt-3">
            Goals for Rotary Year {GOALS_YEAR} · figures as reported for {PREVIOUS_YEAR} ·{' '}
            {districts.length} district{districts.length > 1 ? 's' : ''} covered.
          </p>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl"
             style={{ background: '#003DA5' }}>
          {toast}
        </div>
      )}
    </>
  )
}

function Btn({ onClick, children }) {
  return (
    <button onClick={onClick}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 text-white hover:bg-white/25">
      {children}
    </button>
  )
}

function Section({ n, title, auto, children }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <span className="font-display text-sm font-extrabold text-royal">{n}.</span>
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
        {auto && (
          <span className="eyebrow px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
            filled in
          </span>
        )}
      </div>
      {children}
    </Card>
  )
}

function Field({ label, auto, children }) {
  return (
    <label className="block">
      <span className="eyebrow text-slate-400 block mb-1">
        {label}{auto && <span className="text-blue-500 ml-1">•</span>}
      </span>
      {children}
    </label>
  )
}
