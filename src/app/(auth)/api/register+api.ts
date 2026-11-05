import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createSessionInsecure } from '../../../../database/sessions.ts';
import {
  createUserInsecure,
  getUserInsecure,
} from '../../../../database/users.ts';
import { ExpoApiResponse } from '../../../../ExpoApiResponse.ts';
import {
  type User,
  userSchemaRegister,
} from '../../../../migrations/00002-createTableUsers.ts';
import { createSerializedSessionTokenCookie } from '../../../../util/cookies.ts';
import { getCombinedErrorMessage } from '../../../../util/validation.ts';

export type RegisterResponseBodyPost =
  | {
      user: User;
    }
  | {
      error: string;
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<RegisterResponseBodyPost>> {
  if (
    request.headers.get('content-type')?.split(';')[0] !== 'application/json'
  ) {
    return ExpoApiResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 },
    );
  }

  const requestBody = await request.json();
  const result = userSchemaRegister.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      { error: getCombinedErrorMessage(result.error.issues) },
      { status: 400 },
    );
  }

  if (await getUserInsecure(result.data.user.username)) {
    return ExpoApiResponse.json(
      { error: 'Username already exists' },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(result.data.user.password, 12);
  const user = await createUserInsecure(
    result.data.user.username,
    passwordHash,
  );

  if (!user) {
    return ExpoApiResponse.json(
      { error: 'User creation failed' },
      { status: 400 },
    );
  }

  const sessionToken = crypto.randomBytes(100).toString('base64');
  const session = await createSessionInsecure(sessionToken, user.id);

  if (!session) {
    return ExpoApiResponse.json(
      { error: 'Session creation failed' },
      { status: 500 },
    );
  }

  return ExpoApiResponse.json(
    { user },
    {
      status: 201,
      headers: {
        'Set-Cookie': createSerializedSessionTokenCookie(session.token),
      },
    },
  );
}
