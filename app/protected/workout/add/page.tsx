'use client'

import { useActionState } from 'react'
import { addWorkout, type WorkoutActionState } from '../actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { useState } from 'react'

const COMMON_EXERCISES = [
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Cable Fly', 'Pec Deck',
  'Squat', 'Front Squat', 'Bulgarian Split Squat', 'Goblet Squat', 'Leg Press',
  'Deadlift', 'Romanian Deadlift', 'Sumo Deadlift', 'Hex Bar Deadlift',
  'Overhead Press', 'Push Press', 'Arnold Press', 'Lateral Raise', 'Front Raise',
  'Barbell Row', 'Dumbbell Row', 'Seated Cable Row', 'Face Pull',
  'Pull-up', 'Chin-up', 'Lat Pulldown',
  'Dumbbell Curl', 'Barbell Curl', 'Hammer Curl',
  'Tricep Dip', 'Tricep Pushdown', 'Skull Crusher',
  'Leg Curl', 'Leg Extension', 'Lunge', 'Hip Thrust',
  'Calf Raise', 'Plank', 'Ab Wheel', 'Push-up', 'Dip',
]

export default function AddWorkoutPage() {
  const [state, formAction, isPending] = useActionState<WorkoutActionState, FormData>(
    addWorkout,
    null
  )
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs')

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <Link
        href="/protected/workout"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </Link>

      <div className="rounded-2xl overflow-hidden shadow-xl border">
        {/* Header */}
        <div
          className="px-7 py-6 text-white"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)' }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Dumbbell size={18} />
            </div>
            <h1 className="text-2xl font-extrabold">Add Workout</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Log your exercise for today&apos;s session
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="bg-card px-7 py-6 space-y-5">
          {state?.error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {state.error}
            </div>
          )}

          {/* Exercise name */}
          <div className="space-y-2">
            <Label htmlFor="exercise_name" className="text-sm font-semibold">
              Exercise Name
            </Label>
            <Input
              id="exercise_name"
              name="exercise_name"
              list="exercise-suggestions"
              placeholder="e.g. Bench Press"
              required
              autoComplete="off"
              autoFocus
              className="h-12 text-base"
            />
            <datalist id="exercise-suggestions">
              {COMMON_EXERCISES.map(ex => (
                <option key={ex} value={ex} />
              ))}
            </datalist>
          </div>

          {/* Sets / Reps / Weight */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'sets', label: 'Sets', placeholder: '3', min: '1', max: '99' },
              { id: 'reps', label: 'Reps', placeholder: '8', min: '1', max: '999' },
              { id: 'weight', label: 'Weight', placeholder: '135', min: '0', step: '0.5' },
            ].map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-semibold">
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type="number"
                  placeholder={field.placeholder}
                  min={field.min}
                  max={'max' in field ? field.max : undefined}
                  step={'step' in field ? field.step : undefined}
                  required
                  className="h-12 text-base text-center"
                />
              </div>
            ))}
          </div>

          {/* Unit toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Unit</Label>
            <input type="hidden" name="unit" value={unit} />
            <div className="flex rounded-xl border border-input overflow-hidden h-11 text-sm font-semibold">
              {(['lbs', 'kg'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`flex-1 transition-colors ${
                    unit === u
                      ? 'bg-emerald-600 text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Notes{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="notes"
              name="notes"
              placeholder="PR attempt, felt strong, form cues..."
              className="h-11"
            />
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Link
              href="/protected/workout"
              className="flex-1 flex items-center justify-center h-11 rounded-xl border border-input text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Workout →'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
