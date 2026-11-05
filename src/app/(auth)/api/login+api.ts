import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createSessionInsecure } from '../../../../database/sessions.ts';
import { getUserWithPasswordHashInsecure } from '../../../../database/users.ts';
import { ExpoApiResponse } from '../../../../ExpoApiResponse.ts';
import {
  type User,
  userSchemaLogin,
} from '../../../../migrations/00002-createTableUsers.ts';
import { createSerializedSessionTokenCookie } from '../../../../util/cookies.ts';
import { getCombinedErrorMessage } from '../../../../util/validation.ts';

export type LoginResponseBodyPost =
  | {
      user: User;
    }
  | {
      error: string;
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<LoginResponseBodyPost>> {
  // Prevent cross-site form submissions from creating sessions
  if (
    request.headers.get('content-type')?.split(';')[0] !== 'application/json'
  ) {
    return ExpoApiResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 },
    );
  }

  const requestBody = await request.json();
  const result = userSchemaLogin.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      { error: getCombinedErrorMessage(result.error.issues) },
      { status: 400 },
    );
  }

  const userWithPasswordHash = await getUserWithPasswordHashInsecure(
    result.data.user.username,
  );

  if (!userWithPasswordHash) {
    return ExpoApiResponse.json(
      { error: 'Username or password invalid' },
      { status: 401 },
    );
  }

  const isPasswordValid = await bcrypt.compare(
    result.data.user.password,
    userWithPasswordHash.passwordHash,
  );

  userWithPasswordHash.passwordHash = '';

  if (!isPasswordValid) {
    return ExpoApiResponse.json(
      { error: 'Username or password invalid' },
      { status: 401 },
    );
  }

  const sessionToken = crypto.randomBytes(100).toString('base64');
  const session = await createSessionInsecure(
    sessionToken,
    userWithPasswordHash.id,
  );

  if (!session) {
    return ExpoApiResponse.json(
      { error: 'Session creation failed' },
      { status: 500 },
    );
  }

  return ExpoApiResponse.json(
    {
      user: {
        id: userWithPasswordHash.id,
        username: userWithPasswordHash.username,
      },
    },
    {
      headers: {
        'Set-Cookie': createSerializedSessionTokenCookie(session.token),
      },
    },
  );
}
