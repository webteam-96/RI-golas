import { useNavigate, useLocation } from 'react-router-dom'
import { ROLES, roleForPath } from '@/roles'

/**
 * Demo affordance, not auth. The whole point of the presentation is showing the same data
 * through four lenses, so switching lenses is one click rather than four logins.
 */
export default function RoleSwitcher() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const current = roleForPath(pathname)

  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <span className="hidden xl:inline eyebrow text-slate-400">View as</span>
      <div className="flex gap-0.5 bg-slate-100/80 rounded-xl p-1">
        {ROLES.map((r) => {
          const active = r.id === current
          return (
            <button
              key={r.id}
              onClick={() => nav(r.home)}
              title={`${r.label} — ${r.sub}`}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                active ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-ink hover:bg-white'
              }`}
            >
              <span className="sm:hidden font-data">{r.chip}</span>
              <span className="hidden sm:inline">{r.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
