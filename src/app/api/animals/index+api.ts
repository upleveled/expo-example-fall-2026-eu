import { parse } from 'cookie';
import { getValidSession } from '../../../../database/sessions.ts';
import { createAnimal, getAnimals } from '../../../../database/animals.ts';
import { ExpoApiResponse } from '../../../../ExpoApiResponse.ts';
import {
  type Animal,
  animalSchema,
} from '../../../../migrations/00000-createTableAnimals.ts';

export type AnimalsResponseBodyGet = { animals: Animal[] } | { error: string };

export async function GET(
  request: Request,
): Promise<ExpoApiResponse<AnimalsResponseBodyGet>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;
  if (!sessionToken || !(await getValidSession(sessionToken))) {
    return ExpoApiResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }
  const animals = await getAnimals(sessionToken);
  return ExpoApiResponse.json({ animals });
}

export type AnimalsResponseBodyPost =
  | {
      animal: Animal;
    }
  | {
      error: string;
    };

export async function POST(
  request: Request,
): Promise<ExpoApiResponse<AnimalsResponseBodyPost>> {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (!sessionToken || !(await getValidSession(sessionToken))) {
    return ExpoApiResponse.json(
      {
        error: 'Authentication required',
      },
      {
        status: 401,
      },
    );
  }

  const requestBody = await request.json();
  const result = animalSchema.safeParse(requestBody);

  if (!result.success) {
    return ExpoApiResponse.json(
      {
        error: 'Pass an object with an animal property',
      },
      {
        status: 400,
      },
    );
  }

  const animal = await createAnimal(sessionToken, result.data.animal);

  if (!animal) {
    return ExpoApiResponse.json(
      {
        error: 'Error creating animal',
      },
      {
        status: 401,
      },
    );
  }

  return ExpoApiResponse.json(
    { animal: animal },
    {
      status: 201,
    },
  );
}
