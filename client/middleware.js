import { NextResponse } from 'next/server';

export function middleware(request) {
    // Get the pathname of the request (e.g. /protected-route)
    const path = request.nextUrl.pathname;

    // Skip middleware for API routes
    if (path.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/register', '/'];
    const protectedPaths = ['/main', '/admin'];

    // Check if the path is public
    const isPublicPath = publicPaths.includes(path);
    const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

    // Get the token from the cookies
    const token = request.cookies.get('token')?.value;

    // If the path is public and the user is logged in,
    // redirect to the main page (except for the root path)
    if (isPublicPath && token && path !== '/') {
        return NextResponse.redirect(new URL('/main', request.url));
    }

    // If the path is not public and the user is not logged in,
    // redirect to the login page
    if (isProtectedPath && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Za sve ostale slučajeve (uključujući nepostojeće stranice), Next.js preuzima
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all routes except:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /static (static files)
         * 4. All files in the public folder
         */
        '/((?!api|_next|static|favicon.ico|sitemap.xml).*)'
    ]
}; 