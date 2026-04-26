import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

type Log = {
  id: string
  exercise_name: string
  sets: number
  reps: number
  weight: number
  unit: string
  logged_at: string
}

async function WorkoutHistory() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('workout_logs')
    .select('id, exercise_name, sets, reps, weight, unit, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .order('created_at', { ascending: true })

  const logs = (data as Log[]) ?? []

  if (logs.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-2xl p-14 text-center text-muted-foreground">
        <p className="text-5xl mb-4">📅</p>
        <p className="font-semibold text-base">No workouts logged yet</p>
        <p className="text-sm mt-1 mb-6">Your session history will appear here.</p>
        <Link
          href="/protected/workout/add"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={15} />
          Log Your First Workout
        </Link>
      </div>
    )
  }

  // Group by date
  const grouped = logs.reduce<Record<string, Log[]>>((acc, log) => {
    if (!acc[log.logged_at]) acc[log.logged_at] = []
    acc[log.logged_at].push(log)
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]
  const entries = Object.entries(grouped)

  return (
    <div className="space-y-1">
      {entries.map(([date, exercises], idx) => {
        const isToday = date === today
        const volume = exercises.reduce((s, e) => s + e.sets * e.reps * e.weight, 0)
        const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        const isLast = idx === entries.length - 1

        return (
          <div key={date} className="flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center pt-1 flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-background ${
                  isToday ? 'bg-emerald-500 ring-emerald-200' : 'bg-muted-foreground/30'
                }`}
              />
              {!isLast && <div className="w-px flex-1 bg-border mt-1 min-h-6" />}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-semibold text-sm">{dateLabel}</p>
                {isToday && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    Today
                  </span>
                )}
              </div>

              <div className="rounded-xl border bg-card overflow-hidden">
                {/* Session summary bar */}
                <div className="px-4 py-2 bg-muted/30 border-b flex gap-4 text-xs text-muted-foreground">
                  <span>{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</span>
                  <span className="text-emerald-600 font-semibold">
                    {volume.toLocaleString()} lbs total
                  </span>
                </div>

                {/* Exercises */}
                <div className="divide-y">
                  {exercises.map(e => (
                    <div
                      key={e.id}
                      className="px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {e.exercise_name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium">{e.exercise_name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground flex-shrink-0">
                        {e.sets} × {e.reps} @ {e.weight} {e.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">All sessions, newest first.</p>
        <Link
          href="/protected/workout/add"
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
        >
          <Plus size={13} />
          Add Workout
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <WorkoutHistory />
      </Suspense>
    </div>
  )
}
