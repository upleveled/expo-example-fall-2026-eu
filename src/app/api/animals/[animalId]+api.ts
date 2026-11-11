import { parse } from 'cookie';
import { getValidSession } from '../../../../database/sessions.ts';
import {
  deleteAnimal,
  getAnimal,
  getAnimalInsecure,
  updateAnimal,
} from '../../../../database/animals.ts';
import { ExpoApiResponse } from '../../../../ExpoApiResponse.ts';
import {
  type Animal,
  animalSchema,
} from '../../../../migrations/00000-createTableAnimals.ts';

export type AnimalResponseBodyGet =
  | {
      animal: Animal;
    }
  | {
      error: string;
    };

export async function GET(
  request: Request,
  params: { animalId: string },
): Promise<ExpoApiResponse<AnimalResponseBodyGet>> {
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

  const animal = await getAnimal(sessionToken, Number(params.animalId));

  if (!animal) {
    const existingAnimal = await getAnimalInsecure(Number(params.animalId));

    return ExpoApiResponse.json(
      {
        error: existingAnimal
          ? 'Access denied'
          : `No animal with id ${params.animalId} found`,
      },
      {
        status: existingAnimal ? 403 : 404,
      },
    );
  }

  return ExpoApiResponse.json({ animal: animal });
}

export type AnimalResponseBodyPut =
  | {
      animal: Animal;
    }
  | {
      error: string;
    };

export async function PUT(
  request: Request,
  params: { animalId: string },
): Promise<ExpoApiResponse<AnimalResponseBodyPut>> {
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

  const existingAnimal = await getAnimalInsecure(Number(params.animalId));
  if (!existingAnimal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot find animal',
      },
      { status: 404 },
    );
  }

  const animal = await updateAnimal(sessionToken, {
    id: Number(params.animalId),
    ...result.data.animal,
  });

  if (!animal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot update animal',
      },
      {
        status: 401,
      },
    );
  }

  return ExpoApiResponse.json({ animal: animal });
}

export type AnimalResponseBodyDelete =
  | {
      animal: Animal;
    }
  | {
      error: string;
    };

export async function DELETE(
  request: Request,
  params: { animalId: string },
): Promise<ExpoApiResponse<AnimalResponseBodyDelete>> {
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

  const existingAnimal = await getAnimalInsecure(Number(params.animalId));
  if (!existingAnimal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot find animal',
      },
      { status: 404 },
    );
  }

  const animal = await deleteAnimal(sessionToken, {
    id: Number(params.animalId),
  });

  if (!animal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot delete animal',
      },
      {
        status: 401,
      },
    );
  }

  return ExpoApiResponse.json({ animal: animal });
}
