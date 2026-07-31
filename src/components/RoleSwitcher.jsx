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
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Demo — view as
      </span>
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {ROLES.map((r) => {
          const active = r.id === current
          return (
            <button
              key={r.id}
              onClick={() => nav(r.home)}
              title={`${r.label} — ${r.sub}`}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                active ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
              style={active ? { backgroundColor: '#003DA5' } : {}}
            >
              <span className="sm:hidden">{r.chip}</span>
              <span className="hidden sm:inline">{r.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
