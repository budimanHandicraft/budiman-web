import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const adminRoute = url.pathname.startsWith('/admin')

    if(adminRoute){
        // jika terbobol akses nya, ganti password (secret) dan nama cookie nya (admin_granted) yaaa
        const secretKey = url.searchParams.get('secret')
        const hasAdminCookie = request.cookies.get('admin_granted')

        if(secretKey == 'token_admin'){
            const response = NextResponse.next()

            response.cookies.set('admin_granted', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
            })
            return response
        }

        if(hasAdminCookie?.value === 'true'){
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}