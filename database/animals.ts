// Simulate a real database, which cannot be imported from Client
// Components
import { cache } from 'react';
import type { Session } from '../migrations/00003-createTableSessions.ts';
import type { Animal } from '../migrations/00000-createTableAnimals.ts';
import { sql } from './connect.ts';

// const animals = [ { id: 1, firstName: 'Mochi', type: 'red
//   panda', accessory: 'tiny yellow raincoat', birthDate: new
//     Date('2021-04-17'), }, { id: 2, firstName: 'Biscuit',
//     type: 'capybara', accessory: 'striped bow tie', birthDate:
//     new Date('2020-11-03'), }, { id: 3, firstName: 'Pickle',
//     type: 'otter', accessory: 'round sunglasses', birthDate:
//     new Date('2022-07-28'), }, { id: 4, firstName: 'Noodle',
//   type: 'alpaca', accessory: 'sparkly wizard hat', birthDate:
//   new Date('2019-02-14'), }, { id: 5, firstName: 'Waffles',
//     type: 'hedgehog', accessory: 'miniature backpack',
//     birthDate: new Date('2023-09-09'), }, ];

// export function getAnimals() { return animals; }

// export function getAnimal(id) { const animal =
//   animals.find((currentAnimal) => { return currentAnimal.id
//     === id; }); return animal; }

// Secure database query functions below, with
// verification of session token

export const getAnimals = cache(async (sessionToken: Session['token']) => {
  return await sql<Animal[]>`
    SELECT
      animals.*
    FROM
      animals
    WHERE
      EXISTS (
        SELECT
          1
        FROM
          sessions
        WHERE
          sessions.token = ${sessionToken}
          AND sessions.expiry_timestamp > now()
      )
    ORDER BY
      animals.id
  `;
});

export const getAnimal = cache(
  async (sessionToken: Session['token'], id: Animal['id']) => {
    const [animal] = await sql<Animal[]>`
      SELECT
        animals.*
      FROM
        animals
      WHERE
        animals.id = ${id}
        AND EXISTS (
          SELECT
            1
          FROM
            sessions
          WHERE
            sessions.token = ${sessionToken}
            AND sessions.expiry_timestamp > now()
        )
    `;
    return animal;
  },
);

export const createAnimal = cache(
  async (sessionToken: Session['token'], newAnimal: Omit<Animal, 'id'>) => {
    const [animal] = await sql<Animal[]>`
      INSERT INTO
        animals (
          first_name,
          type,
          accessory,
          birth_date
        )
      SELECT
        ${newAnimal.firstName},
        ${newAnimal.type},
        ${newAnimal.accessory},
        ${newAnimal.birthDate}
      FROM
        sessions
      WHERE
        sessions.token = ${sessionToken}
        AND sessions.expiry_timestamp > now()
      RETURNING
        animals.*
    `;
    return animal;
  },
);

export const updateAnimal = cache(
  async (sessionToken: Session['token'], updatedAnimal: Animal) => {
    const [animal] = await sql<Animal[]>`
      UPDATE animals
      SET
        first_name = ${updatedAnimal.firstName},
        type = ${updatedAnimal.type},
        accessory = ${updatedAnimal.accessory},
        birth_date = ${updatedAnimal.birthDate}
      FROM
        sessions
      WHERE
        animals.id = ${updatedAnimal.id}
        AND sessions.token = ${sessionToken}
        AND sessions.expiry_timestamp > now()
      RETURNING
        animals.*
    `;
    return animal;
  },
);

export const deleteAnimal = cache(
  async (
    sessionToken: Session['token'],
    animalToDelete: Pick<Animal, 'id'>,
  ) => {
    const [animal] = await sql<Animal[]>`
      DELETE FROM animals USING sessions
      WHERE
        animals.id = ${animalToDelete.id}
        AND sessions.token = ${sessionToken}
        AND sessions.expiry_timestamp > now()
      RETURNING
        animals.*
    `;
    return animal;
  },
);

// Insecure database query functions below, without
// verification of session token

export const getAnimalsInsecure = cache(async () => {
  const animals = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    ORDER BY
      id
  `;
  return animals;
});

export const getAnimalInsecure = cache(async (id: number) => {
  const [animal] = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    WHERE
      id = ${id}
  `;
  return animal;
});

export const createAnimalInsecure = cache(
  async (newAnimal: Omit<Animal, 'id'>) => {
    const [animal] = await sql<Animal[]>`
      INSERT INTO
        animals (
          first_name,
          type,
          accessory,
          birth_date
        )
      VALUES
        (
          ${newAnimal.firstName},
          ${newAnimal.type},
          ${newAnimal.accessory},
          ${newAnimal.birthDate}
        )
      RETURNING
        animals.*
    `;
    return animal;
  },
);

export const updateAnimalInsecure = cache(async (updatedAnimal: Animal) => {
  const [animal] = await sql<Animal[]>`
    UPDATE animals
    SET
      first_name = ${updatedAnimal.firstName},
      type = ${updatedAnimal.type},
      accessory = ${updatedAnimal.accessory},
      birth_date = ${updatedAnimal.birthDate}
    WHERE
      id = ${updatedAnimal.id}
    RETURNING
      animals.*
  `;
  return animal;
});

export const deleteAnimalInsecure = cache(
  async (animalToDelete: Pick<Animal, 'id'>) => {
    const [animal] = await sql<Animal[]>`
      DELETE FROM animals
      WHERE
        id = ${animalToDelete.id}
      RETURNING
        animals.*
    `;
    return animal;
  },
);
