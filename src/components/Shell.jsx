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
      <div className="px-5 py-5">
        <Link to="/ri/overview" className="block">
          <img src="/logo.png" alt="Rotary" className="h-9 w-auto" />
        </Link>
        <p className="eyebrow text-gold/80 mt-2.5">Goal.Seek</p>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-white/[0.06] border border-white/[0.08]">
          <span className="h-9 w-9 rounded-lg flex items-center justify-center font-data text-[11px] font-semibold flex-shrink-0 text-ink"
                style={{ background: '#F7A81B' }}>
            {chip}
          </span>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold truncate leading-tight">{name}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{role}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2.5 py-2">
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 pl-4 pr-3 py-2.5 my-0.5 rounded-lg text-[13px] transition-all ${
                isActive
                  ? 'text-white font-semibold bg-white/[0.09]'
                  : 'text-slate-400 font-medium hover:text-white hover:bg-white/[0.05]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all"
                  style={{ background: '#F7A81B', height: isActive ? '18px' : '0px' }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </ScrollArea>

      <Separator className="bg-white/[0.08] mx-4" />
      <div className="px-4 py-3.5">
        <p className="eyebrow text-slate-500">Rotary Year {RY}</p>
        <p className="text-[11px] text-slate-600 mt-1">Data as of {DATA_AS_OF}</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-ledger">
      <aside className="hidden lg:flex flex-col w-[248px] flex-shrink-0 bg-sidebar">
        <Sidebar />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-[248px] z-10 shadow-2xl bg-sidebar">
            <button className="absolute top-4 right-3 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-semibold text-ink leading-tight truncate">
                {titles[location.pathname] ?? fallbackTitle}
              </p>
              <Breadcrumb crumbs={crumbs} />
            </div>
          </div>
          <RoleSwitcher />
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
