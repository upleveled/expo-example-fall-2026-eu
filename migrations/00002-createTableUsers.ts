import { Buffer } from 'node:buffer';
import type { Sql } from 'postgres';
import z from 'zod';

export type User = {
  id: number;
  username: string;
  // Security: leave out `password_hash` in TypeScript type to:
  // 1. Make access of `password_hash` intentional
  // 2. Ensure TypeScript and SafeQL catch incorrect usage
};

export const userSchemaRegister = z.object({
  user: z.object({
    username: z
      .string()
      .trim()
      .min(3, { error: 'Username must be minimum 3 characters' })
      .max(80, { error: 'Username must be maximum 80 characters' }),
    password: z
      .string()
      .min(8, { error: 'Password must be minimum 8 characters' })
      .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
        error: 'Password must be maximum 72 bytes',
      }),
  }),
});

export const userSchemaLogin = z.object({
  user: z.object({
    username: z.string(),
    password: z
      .string()
      .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
        error: 'Password must be maximum 72 bytes',
      }),
  }),
});

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE users (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      -- UNIQUE constraint to make sure each
      -- username is used by only one user
      username varchar(80) NOT NULL UNIQUE,
      password_hash varchar(120) NOT NULL
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE users`;
}
