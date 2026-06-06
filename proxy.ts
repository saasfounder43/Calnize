import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Marketing site pages (served on calnize.com / www.calnize.com)
const MARKETING_PAGES = ['/', '/features', '/pricing', '/faq'];

// Protected routes as per latest implementation plan
const PROTECTED_ROUTES = ['/dashboard', '/onboarding', '/settings', '/test-booking', '/api/google/connect'];

// Admin email for internal test-booking access
const ADMIN_EMAIL = 'saasfounder43@gmail.com';

export async function proxy(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const pathname = request.nextUrl.pathname;
    const hasSupabaseEnv =
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Determine hostnames from environment
    const marketingUrlObj = new URL(process.env.NEXT_PUBLIC_MARKETING_URL || 'https://calnize.com');
    const appUrlObj = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://app.calnize.com');

    const marketingHost = marketingUrlObj.host;
    const appHost = appUrlObj.host;

    // Determine if this is the marketing domain or app domain
    const isMarketingSite = hostname === marketingHost || hostname === `www.${marketingHost}`;
    const isAppSite = hostname === appHost || hostname === 'localhost:3000'; // allow localhost to act as app

    // --- 1. DOMAIN-BASED ROUTING ---

    // Marketing site: only allow marketing pages
    if (isMarketingSite && !isAppSite) { // strictly marketing
        // Allow marketing pages
        if (MARKETING_PAGES.includes(pathname)) {
            return NextResponse.next({ request });
        }

        // Redirect login/signup to app subdomain
        if (pathname === '/login' || pathname === '/signup') {
            return NextResponse.redirect(`${appUrlObj.origin}${pathname}`);
        }

        // Any other path on marketing site → redirect to app
        return NextResponse.redirect(`${appUrlObj.origin}${pathname}`);
    }

    // App site: block marketing-only pages (except root which serves dashboard redirect)
    if (isAppSite && !isMarketingSite) {
        const marketingOnly = ['/features', '/pricing', '/faq'];
        if (marketingOnly.includes(pathname)) {
            return NextResponse.redirect(`${marketingUrlObj.origin}${pathname}`);
        }
    }

    // Let localhost boot without production auth secrets during development.
    if (!hasSupabaseEnv && process.env.NODE_ENV !== 'production') {
        const response = NextResponse.next({ request });

        if (pathname.startsWith('/test-booking')) {
            response.headers.set('X-Robots-Tag', 'noindex');
        }

        return response;
    }

    // --- 2. AUTHENTICATION & SESSION HANDLING ---
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Check for protected routes
    const isProtected = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // TEST BOOKING PROTECTION (Admin only)
    if (pathname.startsWith('/test-booking')) {
        if (process.env.NODE_ENV === 'production') {
            if (!user || user.email !== ADMIN_EMAIL) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    // BLOG ADMIN PROTECTION (/admin/blog/* routes)
    if (pathname.startsWith('/admin/blog')) {
        // /admin/blog/login is allowed for everyone
        if (pathname === '/admin/blog/login') {
            return response;
        }

        // All other /admin/blog routes require authentication
        if (!user) {
            const loginUrl = new URL('/admin/blog/login', request.url);
            loginUrl.searchParams.set('redirectedFrom', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check if user is admin by checking the users table
        try {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                const loginUrl = new URL('/admin/blog/login', request.url);
                loginUrl.searchParams.set('redirectedFrom', pathname);
                return NextResponse.redirect(loginUrl);
            }
        } catch (err) {
            // If can't verify role, redirect to login
            const loginUrl = new URL('/admin/blog/login', request.url);
            loginUrl.searchParams.set('redirectedFrom', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect to login if unauthenticated on protected route
    if (!user && isProtected) {
        const loginUrl = isAppSite 
            ? `${appUrlObj.origin}/login` 
            : new URL('/login', request.url).toString();
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from login/signup
    if (user && (pathname === '/login' || pathname === '/signup')) {
        const dashUrl = isAppSite
            ? `${appUrlObj.origin}/dashboard`
            : new URL('/dashboard', request.url).toString();
        return NextResponse.redirect(dashUrl);
    }

    // Block indexing for internal/test pages
    if (pathname.startsWith('/test-booking')) {
        response.headers.set('X-Robots-Tag', 'noindex');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
