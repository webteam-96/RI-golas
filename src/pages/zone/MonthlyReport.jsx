import { useState } from 'react'
import { Download, Send, FileSpreadsheet } from 'lucide-react'
import { ZONE, ARRFC_ROLE_LONG } from '@/data/zone6'
import { DISHA_DISTRICTS, districtsIn, GOALS_YEAR, PREVIOUS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES, REPORT_FIELDS, fieldsInCategory, achievedFor } from '@/data/reportFields'
import { targetValue } from '@/data/dishaTargets'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Card, DataNote } from '@/components/Bits'

const ZONE6 = districtsIn(2)
const byNumber = (n) => DISHA_DISTRICTS.find((d) => d.number === String(n)) ?? null
const ROLES = ['RRFC', 'ARRFC', 'ARC', 'RMGA', 'EMGA', 'RPIC']

const MONTHS = [
  'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025',
  'December 2025', 'January 2026', 'February 2026', 'March 2026',
]

const input = 'w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003DA5]/25 focus:border-[#003DA5]'

/**
 * The Zone 6 monthly coordinator report. Sections 2 to 6 are filled from the same figures the
 * rest of the app reads, so the form arrives complete and the coordinator reviews rather than
 * retypes. Sections 1 and 7 to 9 are theirs to write.
 */
export default function MonthlyReport() {
  const [coordinator, setCoordinator] = useState(ZONE.rrfc.name)
  const [role, setRole] = useState('RRFC')
  const [assistant, setAssistant] = useState('')
  const [month, setMonth] = useState('March 2026')
  const [free, setFree] = useState({ challenges: '', support: '', plan: '' })
  const [toast, setToast] = useState(null)

  const selected = ZONE.coordinators.find((c) => c.name === coordinator)
  const districts = (selected ? selected.supports : ZONE6.map((d) => d.number))
    .map(byNumber).filter(Boolean)

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
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => say('Draft saved.')}>Save Draft</Btn>
            <Btn onClick={() => window.print()}><Download size={13} /> Export PDF</Btn>
            <Btn onClick={() => say('Excel export would carry the district columns and field codes.')}>
              <FileSpreadsheet size={13} /> Export Excel
            </Btn>
            <button onClick={() => say('Report submitted to the RI Director office.')}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-ink"
                    style={{ background: '#F7A81B' }}>
              <Send size={13} /> Submit
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <DataNote>
          Sections 2 to 6 arrive filled from the reported figures. The coordinator reviews the numbers
          and writes sections 7 to 9 — the typing job is gone.
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
            <Field label="Assistant coordinator (if any)">
              <input value={assistant} onChange={(e) => setAssistant(e.target.value)} placeholder="—" className={input} />
            </Field>
            <Field label="District(s) covered" auto>
              <div className={`${input} bg-blue-50/70 border-blue-200 font-data text-[12px]`}>
                {districts.map((d) => d.number).join(' · ')}
              </div>
            </Field>
            <Field label="Reporting month">
              <select value={month} onChange={(e) => setMonth(e.target.value)} className={input}>
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Date submitted" auto>
              <div className={`${input} bg-blue-50/70 border-blue-200 text-slate-500`}>auto on submit</div>
            </Field>
          </div>
          {selected && (
            <p className="text-[11px] text-slate-400 mt-3">
              {ARRFC_ROLE_LONG} · home district {selected.homeDistrict}
            </p>
          )}
        </Section>

        {/* One section per category, districts across */}
        {REPORT_CATEGORIES.map((cat, i) => (
          <Section key={cat.id} n={i + 2} title={cat.label} auto>
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
                      <td className="py-2 text-slate-700">{f.label}</td>
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

        <Section n={REPORT_CATEGORIES.length + 2} title="Goal Progress vs. Zone Target" auto>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[640px]">
              <thead>
                <tr className="eyebrow text-slate-400 border-b border-slate-200">
                  <th className="text-left font-medium pb-2">Goal area</th>
                  <th className="text-right font-medium pb-2 px-3">Zone target</th>
                  <th className="text-right font-medium pb-2 px-3">Actual to date</th>
                  <th className="text-right font-medium pb-2 px-3">% achieved</th>
                  <th className="text-center font-medium pb-2 px-3">On track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REPORT_FIELDS.map((f) => {
                  const a = sumOver(f)
                  const t = targetOver(f)
                  if (a == null && t == null) return null
                  const pct = a != null && t ? (a / t) * 100 : null
                  const ok = pct == null ? null : f.lowerIsBetter ? pct <= 100 : pct >= 90
                  return (
                    <tr key={f.id} className="bg-blue-50/30">
                      <td className="py-2 text-slate-700 font-medium">{f.label}</td>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Submitted by (name & signature)">
              <div className={`${input} text-slate-700`}>{coordinator}</div>
            </Field>
            <Field label="Date submitted">
              <div className={`${input} text-slate-500`}>auto on submit</div>
            </Field>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            {PREVIOUS_YEAR} figures against {GOALS_YEAR} targets · {districts.length} district
            {districts.length > 1 ? 's' : ''} covered.
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
