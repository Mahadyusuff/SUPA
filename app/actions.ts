'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = {
  error?: string
  success?: boolean
} | null

export async function saveUserName(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()

  if (!firstName || !lastName) {
    return { error: 'Both first name and last name are required.' }
  }

  const { error } = await supabase.from('users').insert({
    user_id: user.id,
    first_name: firstName,
    last_name: lastName,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}
