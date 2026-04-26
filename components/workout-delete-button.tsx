'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteWorkoutLog } from '@/app/protected/workout/actions'

export function WorkoutDeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    setPending(true)
    await deleteWorkoutLog(id)
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={confirming ? 'Click again to confirm' : 'Delete'}
      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors flex-shrink-0 ${
        confirming
          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400'
          : 'text-muted-foreground hover:text-red-500 hover:bg-muted'
      } disabled:opacity-50`}
    >
      {pending ? (
        <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
      ) : confirming ? (
        'Confirm?'
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  )
}
