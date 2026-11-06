import { serialize } from 'cookie';

export const secureCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;

export function createSerializedSessionTokenCookie(token: string) {
  return serialize('sessionToken', token, {
    ...secureCookieOptions,
    expires: new Date(Date.now() + secureCookieOptions.maxAge * 1000),
  });
}

export function deleteSerializedSessionTokenCookie() {
  return serialize('sessionToken', '', {
    ...secureCookieOptions,
    expires: new Date(0),
    maxAge: -1,
  });
}
