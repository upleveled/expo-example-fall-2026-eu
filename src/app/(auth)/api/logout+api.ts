import { parse } from 'cookie';
import { deleteSession } from '../../../../database/sessions.ts';
import { ExpoApiResponse } from '../../../../ExpoApiResponse.ts';
import { deleteSerializedSessionTokenCookie } from '../../../../util/cookies.ts';

export type LogoutResponseBodyPost =
  | {
      success: true;
    }
  | {
      error: string;
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<LogoutResponseBodyPost>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (!sessionToken) {
    return ExpoApiResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  await deleteSession(sessionToken);

  return ExpoApiResponse.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': deleteSerializedSessionTokenCookie(),
      },
    },
  );
}
