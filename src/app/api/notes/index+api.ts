import { getValidSession } from '../../../../database/sessions.ts';
import { parse } from 'cookie';
import { createNote, getNotes } from '../../../../database/notes.ts';
import { ExpoApiResponse } from '../../../../ExpoApiResponse.ts';
import {
  type Note,
  noteSchema,
} from '../../../../migrations/00004-createTableNotes.ts';
import { getCombinedErrorMessage } from '../../../../util/validation.ts';

export type NotesResponseBodyGet =
  | {
      notes: Note[];
    }
  | {
      error: string;
    };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<NotesResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (!sessionToken || !(await getValidSession(sessionToken))) {
    return ExpoApiResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  const notes = await getNotes(sessionToken);

  return ExpoApiResponse.json({ notes });
}

export type NotesResponseBodyPost =
  | {
      note: Note;
    }
  | {
      error: string;
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<NotesResponseBodyPost>> {
  const requestBody = await request.json();
  const result = noteSchema.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      { error: getCombinedErrorMessage(result.error.issues) },
      { status: 400 },
    );
  }

  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (!sessionToken || !(await getValidSession(sessionToken))) {
    return ExpoApiResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  const note = await createNote(sessionToken, result.data.note);

  if (!note) {
    return ExpoApiResponse.json(
      { error: 'Creating note failed' },
      { status: 401 },
    );
  }

  return ExpoApiResponse.json({ note }, { status: 201 });
}
