import { useState } from 'react'
import { Download, Send, FileSpreadsheet } from 'lucide-react'
import { ZONE, DISTRICTS, DATA_AS_OF } from '@/data/zone6'
import { HEADLINE, shortLabel } from '@/data/headline'
import { FOUNDATION } from '@/data/metrics'
import { actualFor, zoneTotal, percentAchieved, goalStatus, onTrackYN, clubsIn } from '@/lib/rollup'
import { useGoals } from '@/context/GoalsProvider'
import { fmt, num, pct, usdExact } from '@/lib/format'
import { LevelBanner, Card, DataNote } from '@/components/Bits'

const ROLES = ['RRFC', 'ARRFC', 'ARC', 'RMGA', 'EMGA', 'RPIC']

/**
 * The Zone 6 monthly coordinator report, section for section. Sections 2, 3, 5 and 6 are
 * pre-filled from roll-up; 1 and 7-9 are the coordinator's own words.
 */
export default function MonthlyReport() {
  const { read, notify } = useGoals()
  const [role, setRole] = useState('RRFC')
  const [coordinator, setCoordinator] = useState(ZONE.rrfc.name)
  const [assistant, setAssistant] = useState('')
  const [month, setMonth] = useState('March 2026')
  const [free, setFree] = useState({ challenges: '', support: '', plan: '' })

  const selected = ZONE.coordinators.find((c) => c.name === coordinator)
  const districts = selected ? selected.supports : ZONE.districtIds

  return (
    <>
      <LevelBanner
        eyebrow="Office of the RI Director-elect"
        title="Monthly Coordinator Progress Report"
        sub={`Zone ${ZONE.number} · due by the 5th of each month · one form per coordinator`}
        right={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => notify('Draft saved.')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 text-white hover:bg-white/25">
              Save Draft
            </button>
            <button onClick={() => window.print()}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 text-white hover:bg-white/25">
              <Download size={13} /> Export PDF
            </button>
            <button onClick={() => notify('Excel export would round-trip the workbook layout with category codes intact.')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 text-white hover:bg-white/25">
              <FileSpreadsheet size={13} /> Export Excel
            </button>
            <button onClick={() => notify('Report submitted to the RI Director office.')}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-[#1e3a5f]" style={{ background: '#F7A81B' }}>
              <Send size={13} /> Submit
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <DataNote>
          Every shaded field below is <strong>pre-filled from reported data</strong>. The coordinator
          reviews the numbers and writes sections 7&ndash;9 — the typing job is gone.
        </DataNote>
      </div>

      <div className="space-y-4">
        {/* 1 */}
        <Section n={1} title="Reporting Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Coordinator Role">
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
            <Field label="Assistant Coordinator (if any)">
              <input value={assistant} onChange={(e) => setAssistant(e.target.value)} placeholder="—" className={input} />
            </Field>
            <Field label="District(s) Covered" auto>
              <div className={`${input} bg-blue-50/70 border-blue-200`}>{districts.join(' · ')}</div>
            </Field>
            <Field label="Reporting Month">
              <input value={month} onChange={(e) => setMonth(e.target.value)} className={input} />
            </Field>
            <Field label="Date Submitted" auto>
              <div className={`${input} bg-blue-50/70 border-blue-200 text-slate-500`}>auto on submit</div>
            </Field>
          </div>
        </Section>

        {/* 2 */}
        <Section n={2} title="Membership" auto>
          <Table
            head={['District', 'Members (Start)', 'Members (Current)', 'Net Change', 'Clubs', 'New Chartered', 'Closed']}
            rows={districts.map((d) => {
              const clubs = clubsIn(d)
              const start = clubs.reduce((s, c) => s + (c.membership.atRYStart ?? 0), 0)
              const cur = clubs.reduce((s, c) => s + (c.membership.current ?? 0), 0)
              const has = clubs.length > 0
              return [
                d,
                has ? num(start) : '—',
                has ? num(cur) : '—',
                has ? (cur - start > 0 ? `+${cur - start}` : `${cur - start}`) : '—',
                has ? num(clubs.length) : '—',
                '—', '—',
              ]
            })}
          />
          {districts.some((d) => !clubsIn(d).length) && (
            <p className="text-[11px] text-slate-400 mt-2">
              Dashes are districts with no club-level data loaded — not zeros.
            </p>
          )}
        </Section>

        {/* 3 */}
        <Section n={3} title="Rotary Foundation (TRF) Giving" auto>
          <Table
            head={['Metric', 'This Month', 'Year-to-Date', 'Notes']}
            rows={HEADLINE.map((m) => {
              const v = districts.length === ZONE.districtIds.length
                ? zoneTotal(m.id)
                : districts.reduce((s, d) => s + (actualFor(m.id, 'district', d).value ?? 0), 0)
              return [shortLabel(m), '—', fmt(v, m.unit), read('zone', ZONE.id, m.id).comment || '—']
            })}
          />
        </Section>

        {/* 4 */}
        <Section n={4} title="Public Image">
          <Table
            head={['Metric', 'This Month', 'Year-to-Date', 'Notes']}
            rows={[
              ['Media / Press Mentions', '', '', ''],
              ['Social Media Growth', '', '', ''],
              ['Public Image Events Held', '', '', ''],
              ['Brand Consistency Reviews', '', '', ''],
            ]}
            editable
          />
        </Section>

        {/* 5 */}
        <Section n={5} title="Service & New Club Development" auto>
          <Table
            head={['Metric', 'This Month', 'Year-to-Date', 'Notes']}
            rows={[
              ['Active Service Projects', '—',
                num(districts.reduce((s, d) => s + clubsIn(d).reduce((t, c) => t + (c.service.projects ?? 0), 0), 0)), ''],
              ['Rotaract Clubs Sponsored', '—',
                num(districts.reduce((s, d) => s + clubsIn(d).reduce((t, c) => t + (c.sponsored?.rotaract ?? 0), 0), 0)), ''],
              ['Interact Clubs Sponsored', '—',
                num(districts.reduce((s, d) => s + clubsIn(d).reduce((t, c) => t + (c.sponsored?.interact ?? 0), 0), 0)), ''],
              ['New Clubs in Development', '', '', ''],
              ['Provisional Clubs — Status', '', '', ''],
              ['Satellite Clubs — Status', '', '', ''],
            ]}
          />
        </Section>

        {/* 6 */}
        <Section n={6} title="Goal Progress vs. Zone Target" auto>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                  <th className="text-left font-bold pb-2">Goal Area</th>
                  <th className="text-right font-bold pb-2 px-3">Zone Target</th>
                  <th className="text-right font-bold pb-2 px-3">Actual to Date</th>
                  <th className="text-right font-bold pb-2 px-3">% Achieved</th>
                  <th className="text-center font-bold pb-2 px-3">On Track</th>
                  <th className="text-left font-bold pb-2">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FOUNDATION.filter((m) => m.unit !== 'yesno').map((m) => {
                  const g = read('zone', ZONE.id, m.id)
                  if (g.target == null && g.actual == null) return null
                  const p = percentAchieved(g.target, g.actual, true)
                  const s = goalStatus(p)
                  return (
                    <tr key={m.id} className="bg-blue-50/40">
                      <td className="py-2 text-slate-700 font-medium">{m.label}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{fmt(g.target, m.unit)}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold">{fmt(g.actual, m.unit)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{p == null ? '—' : pct(p)}</td>
                      <td className={`py-2 px-3 text-center font-bold ${p == null ? 'text-slate-300' : onTrackYN(s) === 'Y' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {p == null ? '—' : onTrackYN(s)}
                      </td>
                      <td className="py-2 text-xs text-slate-500">{g.comment || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {[
          { n: 7, title: 'Challenges / Barriers Identified', k: 'challenges' },
          { n: 8, title: 'Support Needed from RI Director-elect / Zone Team', k: 'support' },
          { n: 9, title: 'Action Plan for Next Month', k: 'plan' },
        ].map(({ n, title, k }) => (
          <Section key={n} n={n} title={title}>
            <textarea
              rows={4}
              value={free[k]}
              onChange={(e) => setFree({ ...free, [k]: e.target.value })}
              placeholder="The coordinator's own words — this part is not auto-filled."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-y
                         focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5]"
            />
          </Section>
        ))}

        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Submitted by (Name & Signature)">
              <div className={`${input} text-slate-700`}>{coordinator}</div>
            </Field>
            <Field label="Date Submitted">
              <div className={`${input} text-slate-500`}>auto on submit</div>
            </Field>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Data as of {DATA_AS_OF}. Zone {ZONE.number} · {DISTRICTS.length} districts.
          </p>
        </Card>
      </div>
    </>
  )
}

const input = 'w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5]'

function Section({ n, title, auto, children }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <span className="text-sm font-extrabold" style={{ color: '#003DA5' }}>{n}.</span>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {auto && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
            auto-filled
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
      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">
        {label}{auto && <span className="text-blue-500 ml-1">•</span>}
      </span>
      {children}
    </label>
  )
}

function Table({ head, rows, editable }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
            {head.map((h, i) => (
              <th key={h} className={`font-bold pb-2 ${i === 0 ? 'text-left' : 'text-right px-3'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td key={ci} className={`py-2 ${ci === 0 ? 'text-slate-700 font-medium' : 'text-right px-3 tabular-nums'}`}>
                  {cell === '' && (editable || ci > 0)
                    ? <input className="w-full text-right rounded border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:border-[#003DA5]" />
                    : <span className={cell === '—' ? 'text-slate-300' : ''}>{cell}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
