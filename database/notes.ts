import { cache } from 'react';
import type { Session } from '../migrations/00003-createTableSessions.ts';
import type { Note } from '../migrations/00004-createTableNotes.ts';
import { sql } from './connect.ts';

// Secure database query functions below, with
// verification of session token

export const getNotes = cache(async (sessionToken: Session['token']) => {
  const notes = await sql<Note[]>`
    SELECT
      notes.*
    FROM
      notes
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
        AND notes.user_id = sessions.user_id
        AND sessions.expiry_timestamp > now()
      )
    ORDER BY
      notes.id DESC
  `;

  return notes;
});

export const getNote = cache(
  async (sessionToken: Session['token'], noteId: Note['id']) => {
    const [note] = await sql<Note[]>`
      SELECT
        notes.*
      FROM
        notes
        INNER JOIN sessions ON (
          sessions.token = ${sessionToken}
          AND notes.user_id = sessions.user_id
          AND sessions.expiry_timestamp > now()
        )
      WHERE
        notes.id = ${noteId}
    `;

    return note;
  },
);

export const selectNoteExists = cache(
  async (sessionToken: Session['token'], noteId: Note['id']) => {
    const [record] = await sql<{ exists: boolean }[]>`
      SELECT
        EXISTS (
          SELECT
            1
          FROM
            notes
          WHERE
            notes.id = ${noteId}
        )
      FROM
        sessions
      WHERE
        sessions.token = ${sessionToken}
        AND sessions.expiry_timestamp > now()
    `;

    return !!record && record.exists;
  },
);

export const createNote = cache(
  async (
    sessionToken: Session['token'],
    newNote: Omit<Note, 'id' | 'userId'>,
  ) => {
    const [note] = await sql<Note[]>`
      INSERT INTO
        notes (user_id, title, text_content)
      SELECT
        -- Security: derive user_id from session token instead
        -- of allowing user to choose which user_id they
        -- assign the note to
        sessions.user_id,
        ${newNote.title},
        ${newNote.textContent}
      FROM
        sessions
      WHERE
        sessions.token = ${sessionToken}
        AND sessions.expiry_timestamp > now()
      RETURNING
        notes.*
    `;

    return note;
  },
);
