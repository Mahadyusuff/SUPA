'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Clock, TrendingUp } from 'lucide-react'

const TABS = [
  { href: '/protected/workout', label: 'Dashboard', icon: Dumbbell },
  { href: '/protected/workout/history', label: 'History', icon: Clock },
  { href: '/protected/workout/progress', label: 'Progress', icon: TrendingUp },
]

export function WorkoutNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b mb-8">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/protected/workout'
            ? pathname === href || pathname === '/protected/workout/add'
            : pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
