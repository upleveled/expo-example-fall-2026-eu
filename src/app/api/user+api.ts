import { parse } from 'cookie';
import { getUser } from '../../../database/users.ts';
import { ExpoApiResponse } from '../../../ExpoApiResponse.ts';
import type { User } from '../../../migrations/00002-createTableUsers.ts';

export type UserResponseBodyGet =
  | {
      user: Pick<User, 'username'>;
    }
  | {
      error: string;
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<UserResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (!sessionToken) {
    return ExpoApiResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  const user = await getUser(sessionToken);

  if (!user) {
    return ExpoApiResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  return ExpoApiResponse.json({ user: { username: user.username } });
}
