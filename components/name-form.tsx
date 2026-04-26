'use client'

import { useActionState } from 'react'
import { saveUserName, type ActionState } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function NameForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    saveUserName,
    null
  )

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Enter Your Name</CardTitle>
        <CardDescription>
          Save your name to explore your surname&apos;s history and family crest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
              Name saved! Scroll down to see the history.
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              placeholder="Enter your last name"
              required
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Name'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
