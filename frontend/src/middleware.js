import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path starts with /seller
  if (path.startsWith('/seller')) {
    // Get the token from cookies
    const token = request.cookies.get('token')?.value
    const selectedRole = request.cookies.get('selectedRole')?.value

    // If no token or not a seller, redirect to login
    if (!token || selectedRole !== 'seller') {
      const url = new URL('/identify', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/seller/:path*']
} 