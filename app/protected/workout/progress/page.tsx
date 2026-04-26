import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  WorkoutProgressChart,
  type ExerciseLog,
} from '@/components/workout-progress-chart'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'

type RawLog = {
  exercise_name: string
  sets: number
  reps: number
  weight: number
  unit: string
  logged_at: string
}

async function ProgressContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('workout_logs')
    .select('exercise_name, sets, reps, weight, unit, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })

  const logs = (data as RawLog[]) ?? []

  if (logs.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-2xl p-14 text-center text-muted-foreground">
        <p className="text-5xl mb-4">📈</p>
        <p className="font-semibold text-base">No data yet</p>
        <p className="text-sm mt-1 mb-6">
          Log workouts across multiple days to see your progress charts.
        </p>
        <Link
          href="/protected/workout/add"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={15} />
          Start Logging
        </Link>
      </div>
    )
  }

  // Aggregate per exercise + date
  const agg: Record<
    string,
    Record<string, { max: number; vol: number; unit: string }>
  > = {}

  for (const log of logs) {
    if (!agg[log.exercise_name]) agg[log.exercise_name] = {}
    const prev = agg[log.exercise_name][log.logged_at] ?? {
      max: 0,
      vol: 0,
      unit: log.unit,
    }
    prev.max = Math.max(prev.max, log.weight)
    prev.vol += log.sets * log.reps * log.weight
    agg[log.exercise_name][log.logged_at] = prev
  }

  const exerciseData: Record<string, ExerciseLog[]> = {}
  for (const [name, dates] of Object.entries(agg)) {
    exerciseData[name] = Object.entries(dates)
      .map(([date, d]) => ({
        logged_at: date,
        max_weight: d.max,
        total_volume: d.vol,
        unit: d.unit,
      }))
      .sort((a, b) => a.logged_at.localeCompare(b.logged_at))
  }

  const exerciseCount = Object.keys(exerciseData).length
  const totalSessions = new Set(logs.map(l => l.logged_at)).size

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-extrabold text-emerald-600">{exerciseCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Exercises Tracked</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-extrabold text-emerald-600">{totalSessions}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
        </div>
      </div>

      <WorkoutProgressChart exerciseData={exerciseData} />
    </div>
  )
}

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-emerald-400" />
            <h2 className="font-extrabold text-lg">Progress Tracker</h2>
          </div>
          <p className="text-slate-400 text-sm">
            See how your strength and volume improve over time.
          </p>
        </div>
        <div className="text-5xl opacity-10 select-none">📈</div>
      </div>

      <Suspense
        fallback={<div className="h-80 rounded-xl bg-muted animate-pulse" />}
      >
        <ProgressContent />
      </Suspense>
    </div>
  )
}
