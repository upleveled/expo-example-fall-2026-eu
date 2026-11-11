import {
  deleteAnimalInsecure,
  getAnimalInsecure,
  updateAnimalInsecure,
} from '../../../../database/animals';
import { ExpoApiResponse } from '../../../../ExpoApiResponse';
import {
  type Animal,
  animalSchema,
} from '../../../../migrations/00000-createTableAnimals';

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
  const animalId = Number(params.animalId);

  if (isNaN(animalId)) {
    return ExpoApiResponse.json(
      { error: 'Invalid animal id' },
      { status: 400 },
    );
  }

  const animal = await getAnimalInsecure(animalId);

  if (!animal) {
    return ExpoApiResponse.json(
      {
        error: `No animal with id ${params.animalId} found`,
      },
      {
        status: 404,
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
  const animalId = Number(params.animalId);

  if (isNaN(animalId)) {
    return ExpoApiResponse.json(
      { error: 'Invalid animal id' },
      { status: 400 },
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

  const existingAnimal = await getAnimalInsecure(animalId);
  if (!existingAnimal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot find animal',
      },
      { status: 404 },
    );
  }

  const animal = await updateAnimalInsecure({
    id: animalId,
    ...result.data.animal,
  });

  if (!animal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot update animal',
      },
      {
        status: 500,
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
  const animalId = Number(params.animalId);

  if (isNaN(animalId)) {
    return ExpoApiResponse.json(
      { error: 'Invalid animal id' },
      { status: 400 },
    );
  }

  const existingAnimal = await getAnimalInsecure(animalId);
  if (!existingAnimal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot find animal',
      },
      { status: 404 },
    );
  }

  const animal = await deleteAnimalInsecure({
    id: animalId,
  });

  if (!animal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot delete animal',
      },
      {
        status: 500,
      },
    );
  }

  return ExpoApiResponse.json({ animal: animal });
}
