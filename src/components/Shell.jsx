import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import RoleSwitcher from './RoleSwitcher'
import Breadcrumb from './Breadcrumb'
import { RY, DATA_AS_OF } from '@/data/zone6'

/**
 * One layout for all four levels, parameterised. Four near-identical shells would be four
 * places for the header, the breadcrumb and the active-nav styling to drift apart.
 */
export default function Shell({ nav, titles, chip, name, role, crumbs, fallbackTitle }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <Link to="/ri/overview" className="block">
          <img src="/logo.png" alt="Rotary" className="h-9 w-auto" />
        </Link>
        <p className="text-xs text-slate-400 mt-2 font-medium">GOAL.SEEK</p>
      </div>

      <div className="px-3 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
          <span className="h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: '#F7A81B', color: '#1e3a5f' }}>
            {chip}
          </span>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{name}</p>
            <p className="text-slate-400 text-xs">{role}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pb-2">Navigation</p>
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 mx-0.5 my-0.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'text-[#1e3a5f] font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`
            }
            style={({ isActive }) => (isActive ? { backgroundColor: '#F7A81B' } : {})}
          >
            {({ isActive }) => (
              <>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: isActive ? '#1e3a5f' : '#475569' }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </ScrollArea>

      <Separator className="bg-white/10 mx-3" />
      <p className="text-slate-500 text-[11px] text-center tracking-wide uppercase py-3 leading-relaxed">
        Rotary Year {RY}
        <br />
        <span className="text-slate-600">data as of {DATA_AS_OF}</span>
      </p>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0" style={{ background: '#0f172a' }}>
        <Sidebar />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-60 z-10 shadow-2xl" style={{ background: '#0f172a' }}>
            <button className="absolute top-3 right-3 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b-2 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0 gap-4"
                style={{ borderBottomColor: '#F7A81B' }}>
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100" onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-slate-800 font-semibold text-base leading-tight truncate">
                {titles[location.pathname] ?? fallbackTitle}
              </p>
              <Breadcrumb crumbs={crumbs} />
            </div>
          </div>
          <RoleSwitcher />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
