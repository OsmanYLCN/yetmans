'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  revalidatePath('/', 'layout')
  
  if (roleData?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/panel')
  }
}
