import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Marketing site pages (served on calnize.com / www.calnize.com)
const MARKETING_PAGES = ['/', '/features', '/pricing', '/faq'];

// Admin email for internal test-booking access
const ADMIN_EMAIL = 'saasfounder43@gmail.com';

export async function proxy(request: NextRequest) {
    const hostname = request.headers.get('host') || '';

    const pathname = request.nextUrl.pathname;

    // Determine if this is the marketing domain or app domain
    const isMarketingSite =
        hostname === 'calnize.com' ||
        hostname === 'www.calnize.com';
    const isAppSite = hostname === 'app.calnize.com';

    // --- DOMAIN-BASED ROUTING ---

    // Marketing site: only allow marketing pages
    if (isMarketingSite) {
        // Allow marketing pages
        if (MARKETING_PAGES.includes(pathname)) {
            return NextResponse.next({ request });
        }

        // Redirect login/signup to app subdomain
        if (pathname === '/login' || pathname === '/signup') {
            return NextResponse.redirect(`https://app.calnize.com${pathname}`);
        }

        // Any other path on marketing site → redirect to app
        return NextResponse.redirect(`https://app.calnize.com${pathname}`);
    }

    // App site: block marketing-only pages (except root which serves dashboard redirect)
    if (isAppSite) {
        const marketingOnly = ['/features', '/pricing', '/faq'];
        if (marketingOnly.includes(pathname)) {
            return NextResponse.redirect('https://calnize.com' + pathname);
        }
    }

    // --- TEST BOOKING PROTECTION ---
    if (pathname.startsWith('/test-booking')) {
        // In production, only allow admin access
        if (process.env.NODE_ENV === 'production') {
            const supabaseResponse = NextResponse.next({ request });
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
                        },
                    },
                }
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    // --- STANDARD AUTH SESSION HANDLING ---
    let supabaseResponse = NextResponse.next({ request });

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
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protected routes: redirect to login if not authenticated
    const protectedPaths = ['/dashboard', '/test-booking'];
    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    if (isProtectedPath && !user) {
        const loginUrl = isAppSite
            ? 'https://app.calnize.com/login'
            : new URL('/login', request.url).toString();
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from auth pages
    const authPaths = ['/login', '/signup'];
    const isAuthPath = authPaths.some((path) =>
        pathname.startsWith(path)
    );

    if (isAuthPath && user) {
        const dashUrl = isAppSite
            ? 'https://app.calnize.com/dashboard'
            : new URL('/dashboard', request.url).toString();
        return NextResponse.redirect(dashUrl);
    }

    // Block indexing for internal/test pages
    if (pathname.startsWith('/test-booking')) {
        supabaseResponse.headers.set('X-Robots-Tag', 'noindex');
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
