import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define paths
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isPanelPath = request.nextUrl.pathname.startsWith('/panel')
  const isAuthPath = request.nextUrl.pathname === '/login'

  if (isAuthPath) {
    if (user) {
      // If user is already logged in, redirect them to their respective panel
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (roleData?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/panel', request.url))
    }
    return supabaseResponse
  }

  // If path requires authentication but user is not logged in
  if ((isAdminPath || isPanelPath) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and trying to access protected routes, check roles
  if (user && (isAdminPath || isPanelPath)) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = roleData?.role || 'staff'

    if (isAdminPath && role !== 'admin') {
      // Non-admins cannot access /admin, redirect to /panel
      return NextResponse.redirect(new URL('/panel', request.url))
    }
    
    // Admins can access /panel and /admin. Staff can access /panel.
  }

  return supabaseResponse
}
