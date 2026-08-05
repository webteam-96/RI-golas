import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { CLUBS } from '@/data/clubs'
import { GOALS_YEAR } from '@/data/disha'
import { REPORT_CATEGORIES } from '@/data/reportFields'
import { CLUB_FIELDS, clubFieldsIn, clubCategories, clubAchieved, clubTarget } from '@/data/clubFigures'
import { enteredCountIn, useTargetCount } from '@/data/dishaTargets'
import { clubsIn } from '@/lib/rollup'
import { dishaNumber } from '@/lib/disha'
import { LevelBanner, Kpi, Card, Bar, DataNote } from '@/components/Bits'
import GoalMatrix from '@/components/GoalMatrix'

const LEAD = {
  membership: 'membersStart', foundation: 'totalGiving',
  publicimage: 'piEvents', projects: 'serviceProjects', newgen: 'rotaractClubs',
}

/** One club, on the same five categories as every level above it. */
export default function ClubOverview() {
  const { clubId } = useParams()
  useTargetCount() // targets are entered on the Goals tab; re-render when they are
  const club = CLUBS.find((c) => c.id === clubId)
  if (!club) return <Navigate to="/ri/overview" replace />

  const peers = clubsIn(club.districtId)
  const cats = clubCategories(REPORT_CATEGORIES)
  const president = typeof club.president === 'string' ? club.president : club.president?.name

  // A reported field now carries a provisional target, so most of these score. A field the club
  // has not reported has neither half and is left out.
  const scored = CLUB_FIELDS
    .map((f) => ({ a: clubAchieved(f, club), t: clubTarget(club.id, f.id), f }))
    .filter((r) => r.a != null && r.t)
  // Floored as well as capped: a net change of -9 against a target of 10 is 0% attained,
  // not -90%. A negative here dragged the mean below zero and printed as an attainment.
  const attainment = scored.length
    ? scored.reduce((s, r) => s + Math.min(Math.max((r.a / r.t) * 100, 0), 100), 0) / scored.length
    : null
  const anyTarget = CLUB_FIELDS.some((f) => clubTarget(club.id, f.id) != null)
  const entered = enteredCountIn('club', club.id) // real ones only — clubTarget also yields provisionals

  return (
    <>
      <LevelBanner
        eyebrow={`District ${club.districtId} · ${GOALS_YEAR}`}
        title={club.name}
        sub={`Club ID ${club.id}${club.charterDate ? ` · chartered ${club.charterDate}` : ''}${president ? ` · President ${president}` : ''}`}
        right={
          <Link to={`/district/${club.districtId}/overview`}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 border border-white/30 hover:bg-white/25">
            District {club.districtId} <ArrowUpRight size={13} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {cats.map((c) => {
          const f = CLUB_FIELDS.find((x) => x.id === LEAD[c.id]) ?? clubFieldsIn(c.id)[0]
          return (
            <Kpi key={c.id} label={c.label} sub={f?.label}
                 value={dishaNumber(clubAchieved(f, club), f?.unit) ?? '—'}
                 tone={c.id === 'foundation' ? 'gold' : c.id === 'membership' ? 'blue'
                       : c.id === 'publicimage' ? 'purple' : c.id === 'projects' ? 'green' : 'royal'} />
          )
        })}
      </div>

      {/* This club against the others in its district */}
      <GoalMatrix
        categories={cats.map((c) => ({ id: c.id, label: c.label }))}
        fields={(catId) => clubFieldsIn(catId)}
        entities={[{ id: club.id, label: 'This club' }]}
        achieved={(f, e) => clubAchieved(f, CLUBS.find((c) => c.id === e.id))}
        target={(f, e) => clubTarget(e.id, f.id)}
        format={dishaNumber}
        title={club.name}
        // The figures on this page come from src/data/clubs.js, which states no reporting
        // period, so neither line names one. Only the target year is sourced. The provisional
        // caveat is left to the note below rather than repeated in every caption.
        sub={`Achieved as last reported · ${anyTarget ? `target ${GOALS_YEAR}` : `nothing reported, so no target for ${GOALS_YEAR}`}`}
        achievedLabel="Achieved as last reported by the club"
      />

      <Card className="mt-5" title="Against the rest of the district"
            sub={`${peers.length} clubs in District ${club.districtId}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {['membersStart', 'totalGiving', 'serviceProjects', 'womenMembers'].map((id) => {
            const f = CLUB_FIELDS.find((x) => x.id === id)
            if (!f) return null
            const mine = clubAchieved(f, club)
            const vals = peers.map((p) => clubAchieved(f, p)).filter((v) => v != null)
            const max = Math.max(...vals, 0)
            const rank = vals.filter((v) => v > (mine ?? -1)).length + 1
            return (
              <div key={id}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[12px] font-semibold text-slate-600">{f.label}</span>
                  <span className="font-data text-[12px] text-slate-500">
                    {mine == null ? '—' : `${dishaNumber(mine, f.unit)} · rank ${rank} of ${vals.length}`}
                  </span>
                </div>
                {/* This bar is standing against the district's clubs, not attainment: its
                    length is a share of the district's largest club. Colouring it by
                    attainment put two different measures in one mark — the district's biggest
                    club drew a full green bar whether or not it had met its own target. House
                    royal throughout, so the mark says one thing. */}
                <Bar value={mine} max={max} height="h-2" />
              </div>
            )
          })}
        </div>
      </Card>

      <div className="mt-5">
        <DataNote tone="slate">
          Achieved figures are what the club last reported — the club list carries no reporting
          period, so none is claimed. The <strong>{GOALS_YEAR} targets are provisional</strong>:
          each is worked out from the club&apos;s own reported figure, not supplied by the client and
          not held in the portal, which seeds none. A target entered on the Goals tab is the real one
          and replaces the provisional figure for that field
          {entered ? `, and ${entered} ${entered === 1 ? 'has' : 'have'} been entered` : ''}. A club
          answers {CLUB_FIELDS.length} of the report&apos;s fields; the rest are district-level and
          are not shown here.{' '}
          {/* A target can exist on a field the club has not reported, so attainment being null
              is not the same as no target at all — the two cases read differently. */}
          {attainment != null ? (
            <>Attainment across the {scored.length} goal{scored.length === 1 ? '' : 's'} with both a
            figure and a target is <strong>{attainment.toFixed(0)}%</strong>.</>
          ) : anyTarget ? (
            <>Attainment reads <strong>—</strong>: nothing has been reported against the targets
            on file.</>
          ) : (
            <>Attainment reads <strong>—</strong>: the club has reported nothing, so there is no
            target to measure against.</>
          )}
        </DataNote>
      </div>
    </>
  )
}
