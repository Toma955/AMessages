import { NextResponse } from 'next/server';

export function middleware(request) {
  
    const path = request.nextUrl.pathname;

  
    if (path.startsWith('/api/')) {
        return NextResponse.next();
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        
        '/((?!api|_next|static|favicon.ico|sitemap.xml).*)'
    ]
}; 