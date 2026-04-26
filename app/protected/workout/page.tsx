import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { WorkoutDeleteButton } from '@/components/workout-delete-button'
import Link from 'next/link'
import { Plus, Flame, Dumbbell, Calendar } from 'lucide-react'

type Log = {
  id: string
  exercise_name: string
  sets: number
  reps: number
  weight: number
  unit: string
  notes: string | null
  logged_at: string
}

function calcStreak(allDates: string[]): number {
  const unique = [...new Set(allDates)].sort((a, b) => b.localeCompare(a))
  if (!unique.length) return 0

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  if (unique[0] !== todayStr && unique[0] !== yesterdayStr) return 0

  let streak = 0
  let check = unique[0]
  for (const d of unique) {
    if (d === check) {
      streak++
      const prev = new Date(check + 'T12:00:00')
      prev.setDate(prev.getDate() - 1)
      check = prev.toISOString().split('T')[0]
    } else {
      break
    }
  }
  return streak
}

async function DashboardContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const firstName =
    user.user_metadata?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'Athlete'

  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data } = await supabase
    .from('workout_logs')
    .select('id, exercise_name, sets, reps, weight, unit, notes, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .order('created_at', { ascending: false })

  const all = (data as Log[]) ?? []
  const todayLogs = all.filter(l => l.logged_at === today)
  const weekLogs = all.filter(l => l.logged_at >= weekStartStr)
  const streak = calcStreak(all.map(l => l.logged_at))
  const totalDays = new Set(all.map(l => l.logged_at)).size
  const weekDays = new Set(weekLogs.map(l => l.logged_at)).size
  const todayVolume = todayLogs.reduce((s, l) => s + l.sets * l.reps * l.weight, 0)

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            {dateStr}
          </p>
          <h1 className="text-3xl font-extrabold mb-1.5">
            Welcome back, {firstName}! 💪
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {streak > 1
              ? `You're on a ${streak}-day streak — don't break it!`
              : streak === 1
              ? "You trained today. Keep the streak alive tomorrow!"
              : "No active streak. Today's a great day to start."}
          </p>
          <Link
            href="/protected/workout/add"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-900/40"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Workout
          </Link>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[7rem] opacity-[0.07] select-none pointer-events-none leading-none">
          🏋️‍♂️
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Dumbbell, label: 'Total Days', value: totalDays },
          { icon: Calendar, label: 'This Week', value: weekDays },
          { icon: Flame, label: 'Day Streak', value: streak },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1.5">
              <Icon size={13} className="text-emerald-600" />
              <span className="text-[11px] font-medium">{label}</span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">{value}</p>
          </div>
        ))}
      </div>

      {/* Today's session */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Today&apos;s Session</h2>
          {todayLogs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {todayVolume.toLocaleString()} lbs moved
            </span>
          )}
        </div>

        {todayLogs.length === 0 ? (
          <div className="border-2 border-dashed rounded-2xl p-10 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="font-semibold">No exercises logged yet</p>
            <p className="text-sm mt-1 mb-6">
              Start your session by adding your first exercise.
            </p>
            <Link
              href="/protected/workout/add"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus size={15} />
              Add First Exercise
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayLogs.map(log => {
              const volume = log.sets * log.reps * log.weight
              const initial = log.exercise_name.charAt(0).toUpperCase()
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{log.exercise_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.sets} sets × {log.reps} reps @ {log.weight} {log.unit}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right mr-1 flex-shrink-0">
                    <p className="font-bold text-emerald-600 text-sm leading-tight">
                      {volume.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{log.unit} vol</p>
                  </div>
                  <WorkoutDeleteButton id={log.id} />
                </div>
              )
            })}

            <Link
              href="/protected/workout/add"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors text-sm font-medium mt-2"
            >
              <Plus size={15} />
              Add Another Exercise
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-44 rounded-2xl bg-muted animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
