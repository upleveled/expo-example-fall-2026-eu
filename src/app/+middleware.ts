// Security: Reject write requests from other websites (CSRF protection)
// to prevent attacks like unwanted account changes or login CSRF
//
// Expo Router API Routes do not yet have built-in CSRF protection
// - https://github.com/expo/expo/issues/53058

// eslint-disable-next-line @typescript-eslint/naming-convention -- Expo Router requires this export name
export const unstable_settings = {
  matcher: {
    // Skip screens and other requests with safe methods
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    patterns: [
      '/api',
      '/api/[...path]',
      // Expo also serves auth API routes under /(auth)/api
      '/(auth)/api/[...path]',
    ],
  },
};

export default function middleware(request: Request) {
  const origin = request.headers.get('origin');

  // Allow non-browser clients without Origin
  if (origin === null) return;

  if (
    !URL.canParse(origin) ||
    new URL(origin).host !==
      (request.headers.get('x-forwarded-host') || request.headers.get('host'))
  ) {
    return new Response('Cross-site request forbidden', { status: 403 });
  }
}
