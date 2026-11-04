import { cache } from 'react';
import type { User } from '../migrations/00002-createTableUsers.ts';
import type { Session } from '../migrations/00003-createTableSessions.ts';
import { sql } from './connect.ts';

// Secure database query functions below, with
// verification of session token

export const getValidSession = cache(async (sessionToken: Session['token']) => {
  const [session] = await sql<Session[]>`
    SELECT
      id,
      token,
      expiry_timestamp,
      user_id
    FROM
      sessions
    WHERE
      token = ${sessionToken}
      -- Session expiry timestamp in future (not yet expired)
      AND expiry_timestamp > now()
  `;
  return session;
});

export const deleteSession = cache(async (sessionToken: Session['token']) => {
  const [session] = await sql<Session[]>`
    DELETE FROM sessions
    WHERE
      token = ${sessionToken}
    RETURNING
      id,
      token,
      expiry_timestamp,
      user_id
  `;

  return session;
});

// Insecure database query functions below, without
// verification of session token

export const createSessionInsecure = cache(
  async (sessionToken: Session['token'], userId: User['id']) => {
    await sql`
      DELETE FROM sessions
      WHERE
        expiry_timestamp < now()
    `;

    const [session] = await sql<Session[]>`
      INSERT INTO
        sessions (
          token,
          user_id,
          expiry_timestamp
        )
      VALUES
        (
          ${sessionToken},
          ${userId},
          now() + interval '24 hours'
        )
      RETURNING
        id,
        token,
        expiry_timestamp,
        user_id
    `;
    return session;
  },
);
