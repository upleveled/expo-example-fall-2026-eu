import { getValidSession } from '../../../../database/sessions.ts';
import { parse } from 'cookie';
import { getNote, selectNoteExists } from '../../../../database/notes.ts';
import { ExpoApiResponse } from '../../../../ExpoApiResponse.ts';
import type { Note } from '../../../../migrations/00004-createTableNotes.ts';

export type NoteResponseBodyGet =
  | {
      note: Note;
    }
  | {
      error: string;
    };

export async function GET(
  request: Request,
  { noteId }: { noteId: string },
): Promise<ExpoApiResponse<NoteResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (!sessionToken || !(await getValidSession(sessionToken))) {
    return ExpoApiResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  const parsedNoteId = Number(noteId);

  if (!Number.isInteger(parsedNoteId)) {
    return ExpoApiResponse.json(
      { error: `No note with id ${noteId} found` },
      { status: 404 },
    );
  }

  if (!(await selectNoteExists(sessionToken, parsedNoteId))) {
    return ExpoApiResponse.json(
      { error: `No note with id ${noteId} found` },
      { status: 404 },
    );
  }

  const note = await getNote(sessionToken, parsedNoteId);

  if (!note) {
    return ExpoApiResponse.json(
      { error: `Access denied to note with id ${noteId}` },
      { status: 403 },
    );
  }

  return ExpoApiResponse.json({ note });
}
