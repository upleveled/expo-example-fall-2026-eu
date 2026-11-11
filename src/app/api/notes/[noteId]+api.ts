import { getValidSession } from '../../../../database/sessions.ts';
import { parse } from 'cookie';
import { getNote, getNoteExistsInsecure } from '../../../../database/notes.ts';
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

  if (
    !Number.isInteger(parsedNoteId) ||
    parsedNoteId < 1 ||
    parsedNoteId > 2147483647
  ) {
    return ExpoApiResponse.json(
      { error: `No note with id ${noteId} found` },
      { status: 404 },
    );
  }

  if (!(await getNoteExistsInsecure(parsedNoteId))) {
    return ExpoApiResponse.json(
      { error: `No note with id ${noteId} found` },
      { status: 404 },
    );
  }

  const note = await getNote(sessionToken, parsedNoteId);

  // Security: This can be an antipattern for security, because of "information
  // exposure": it tells the user that a note with this id exists. Instead,
  // consider returning only the 404 Not Found response in both cases
  // (replace 403 response with 404 response, remove getNoteExistsInsecure()).
  if (!note) {
    return ExpoApiResponse.json(
      { error: `Access denied to note with id ${noteId}` },
      { status: 403 },
    );
  }

  return ExpoApiResponse.json({ note });
}
