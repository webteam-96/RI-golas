import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumb({ crumbs = [] }) {
  if (!crumbs.length) return null
  return (
    <nav className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 flex-wrap">
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={11} className="text-slate-300" />}
          {c.to ? (
            <Link to={c.to} className="hover:text-[#003DA5] hover:underline transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-slate-600 font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
