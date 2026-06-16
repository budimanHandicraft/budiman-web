import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAdminRoute) {
        const secretKey = request.nextUrl.searchParams.get('secret');
        const hasAdminCookie = request.cookies.get('admin_granted');
        if (secretKey === 'token_admin') {
            const response = NextResponse.next();
            
            response.cookies.set('admin_granted', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });
            return response;
        }

        if (hasAdminCookie?.value === 'true') {
            return NextResponse.next();
        }

        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/';
        loginUrl.search = '';
        
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};