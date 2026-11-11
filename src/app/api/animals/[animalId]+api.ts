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
  const animal = await getAnimalInsecure(Number(params.animalId));

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

  const animal = await updateAnimalInsecure({
    id: Number(params.animalId),
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
  const existingAnimal = await getAnimalInsecure(Number(params.animalId));
  if (!existingAnimal) {
    return ExpoApiResponse.json(
      {
        error: 'Cannot find animal',
      },
      { status: 404 },
    );
  }

  const animal = await deleteAnimalInsecure({
    id: Number(params.animalId),
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