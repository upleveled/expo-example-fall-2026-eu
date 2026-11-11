import { cache } from 'react';
import type { User } from '../migrations/00002-createTableUsers.ts';
import type { Session } from '../migrations/00003-createTableSessions.ts';
import { sql } from './connect.ts';

// Secure database query functions below, with
// verification of session token

export const getUser = cache(async (sessionToken: Session['token']) => {
  const [user] = await sql<User[]>`
    SELECT
      users.id,
      users.username
    FROM
      users
      INNER JOIN sessions ON (
        -- Session token matches
        sessions.token = ${sessionToken}
        -- Session expiry timestamp in future (not yet expired)
        AND sessions.expiry_timestamp > now()
        -- Connect session with user
        AND users.id = sessions.user_id
      )
  `;
  return user;
});

// Insecure database query functions below, without
// verification of session token

export const getUserInsecure = cache(async (username: User['username']) => {
  const [user] = await sql<User[]>`
    SELECT
      id,
      username
    FROM
      users
    WHERE
      username = ${username.toLowerCase()}
  `;
  return user;
});

export const getUserWithPasswordHashInsecure = cache(
  async (username: User['username']) => {
    // Security: leave out `password_hash` in TypeScript type to:
    // 1. Make access of `password_hash` intentional
    // 2. Ensure TypeScript and SafeQL catch incorrect usage
    type UserWithPasswordHash = User & {
      passwordHash: string;
    };

    const [user] = await sql<UserWithPasswordHash[]>`
      SELECT
        id,
        username,
        password_hash
      FROM
        users
      WHERE
        username = ${username.toLowerCase()}
    `;
    return user;
  },
);

export const createUserInsecure = cache(
  async (username: User['username'], passwordHash: string) => {
    const [user] = await sql<User[]>`
      INSERT INTO
        users (username, password_hash)
      VALUES
        (
          ${username.toLowerCase()},
          ${passwordHash}
        )
      ON CONFLICT (username) DO NOTHING
      RETURNING
        id,
        username
    `;
    return user;
  },
);
