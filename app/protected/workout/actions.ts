'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type WorkoutActionState = {
  error?: string
} | null

export async function addWorkout(
  _prev: WorkoutActionState,
  formData: FormData
): Promise<WorkoutActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const exercise_name = (formData.get('exercise_name') as string)?.trim()
  const sets = parseInt(formData.get('sets') as string, 10)
  const reps = parseInt(formData.get('reps') as string, 10)
  const weight = parseFloat(formData.get('weight') as string)
  const unit = (formData.get('unit') as string) || 'lbs'
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!exercise_name) return { error: 'Exercise name is required.' }
  if (isNaN(sets) || sets <= 0) return { error: 'Sets must be a positive number.' }
  if (isNaN(reps) || reps <= 0) return { error: 'Reps must be a positive number.' }
  if (isNaN(weight) || weight < 0) return { error: 'Weight must be 0 or more.' }

  const { error } = await supabase.from('workout_logs').insert({
    user_id: user.id,
    exercise_name,
    sets,
    reps,
    weight,
    unit,
    notes,
    logged_at: new Date().toISOString().split('T')[0],
  })

  if (error) return { error: error.message }

  revalidatePath('/protected/workout')
  revalidatePath('/protected/workout/history')
  redirect('/protected/workout')
}

export async function deleteWorkoutLog(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/protected/workout')
  revalidatePath('/protected/workout/history')
  return {}
}
