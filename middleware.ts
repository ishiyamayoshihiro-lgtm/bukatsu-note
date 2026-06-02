import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Role } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role as Role | undefined

    if (pathname.startsWith('/coach') && role !== Role.STAFF) {
      const url = req.nextUrl.clone()
      url.pathname = '/error'
      url.searchParams.set('error', 'AccessDenied')
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/student') && role !== Role.MEMBER) {
      const url = req.nextUrl.clone()
      url.pathname = '/error'
      url.searchParams.set('error', 'AccessDenied')
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/manager') && role !== Role.MANAGER) {
      const url = req.nextUrl.clone()
      url.pathname = '/error'
      url.searchParams.set('error', 'AccessDenied')
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/coach/:path*', '/student/:path*', '/board/:path*', '/manager/:path*'],
}
