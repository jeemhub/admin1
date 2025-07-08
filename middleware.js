import { NextResponse } from 'next/server'

export function middleware(request) {
  // Allow access to the login page
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // Check for the 'auth' cookie
  const isAuth = request.cookies.get('auth')?.value

  if (!isAuth) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow access if authenticated
  return NextResponse.next()
}
