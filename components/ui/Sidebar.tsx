'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Network, Map, Zap, Users, Activity } from 'lucide-react'

const nav = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/network',      label: 'Network',      icon: Network },
  { href: '/map',          label: 'Map',          icon: Map },
  { href: '/faults',       label: 'Faults',       icon: Zap },
  { href: '/accounts',     label: 'Accounts',     icon: Users },
  { href: '/transformer',  label: 'Transformer',  icon: Activity },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-56 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-800">
        <span className="text-white font-bold text-sm tracking-widest uppercase">DPMS</span>
        <p className="text-gray-500 text-xs mt-0.5">LCU-001 Network</p>
      </div>
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-3 border-t border-gray-800">
        <p className="text-gray-600 text-xs">IKEDC · DPMS v1.0</p>
      </div>
    </aside>
  )
}
