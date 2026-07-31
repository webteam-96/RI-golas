import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ZONE, DISTRICTS } from '@/data/zone6'
import { HEADLINE, shortLabel } from '@/data/headline'
import { zoneTotal, clubsIn } from '@/lib/rollup'
import { fmt } from '@/lib/format'
import { LevelBanner } from '@/components/Bits'

export default function RiZones() {
  const clubs = DISTRICTS.reduce((s, d) => s + clubsIn(d.id).length, 0)

  return (
    <>
      <LevelBanner eyebrow="RI Director Office" title="Zones" sub="Every zone, every headline metric" />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200 bg-slate-50">
                <th className="text-left font-bold py-3 pl-5">Zone</th>
                <th className="text-left font-bold py-3 px-3">RRFC</th>
                <th className="text-right font-bold py-3 px-2">Districts</th>
                <th className="text-right font-bold py-3 px-2">Clubs</th>
                {HEADLINE.map((m) => (
                  <th key={m.id} className="text-right font-bold py-3 px-2">{shortLabel(m)}</th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-50/70">
                <td className="py-3 pl-5 font-bold text-slate-800">
                  <Link to="/zone/overview" className="hover:text-[#003DA5] hover:underline">{ZONE.name}</Link>
                </td>
                <td className="py-3 px-3 text-xs text-slate-500">{ZONE.rrfc.name}</td>
                <td className="py-3 px-2 text-right tabular-nums">{DISTRICTS.length}</td>
                <td className="py-3 px-2 text-right tabular-nums text-slate-500">{clubs}</td>
                {HEADLINE.map((m) => (
                  <td key={m.id} className="py-3 px-2 text-right tabular-nums text-slate-700">
                    {fmt(zoneTotal(m.id), m.unit)}
                  </td>
                ))}
                <td className="py-3 pr-4 text-right">
                  <Link to="/zone/overview" className="text-slate-300 hover:text-[#003DA5] inline-block">
                    <ArrowRight size={15} />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
