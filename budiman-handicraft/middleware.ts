import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    if(pathname.startsWith('/admin')){
        // jika terbobol akses nya, ganti password (secret) dan nama cookie nya (admin_granted) yaaa
        const secretKey = searchParams.get('secret')
        const hasAdminCookie = request.cookies.get('admin_granted')

        if(secretKey == 'token_admin'){
            const response = NextResponse.next()

            response.cookies.set('admin_granted', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path:'/',
                maxAge: 60 * 60 * 24 * 7,
            })
            return response
        }

        if(hasAdminCookie?.value === 'true'){
            return NextResponse.next()
        }
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        homeUrl.search = '';

        return NextResponse.redirect(homeUrl)
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/admin', '/admin/:path*'],
}