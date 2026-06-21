import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let tempDir: string;
  let usersPath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'pdr-users-'));
    usersPath = join(tempDir, 'users.json');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test('loads and normalizes persisted users', async () => {
    await writeFile(
      usersPath,
      JSON.stringify([
        {
          id: 1,
          firstName: 'Doug',
          lastName: 'Heffernan',
          email: 'doug.heffernan@example.com',
          birthDate: '31-31-9999',
          role: 'viewer',
        },
        {
          id: 5,
          lastName: 'Spooner',
          email: 'arthur.spooner@example.com',
          phoneNumber: 'invalid-number',
          fistName: 'Arthur',
          role: 'editor',
        },
        {
          id: '8',
          firstName: 'Carrie',
          lastName: 'Heffernan',
          email: 'not-an-email',
          birthDate: '1997-06-03',
          role: 'viewer',
        },
      ]),
      'utf8',
    );

    const repository = UsersRepository.fromFile(usersPath);
    const users = await repository.findAll();

    expect(users).toHaveLength(3);
    expect(users[0]).toEqual(
      expect.objectContaining({
        id: 1,
        firstName: 'Doug',
        lastName: 'Heffernan',
        email: 'doug.heffernan@example.com',
        role: 'viewer',
      }),
    );
    expect(users.find((user) => user.id === 5)).toEqual(
      expect.objectContaining({
        firstName: 'Arthur',
        role: 'editor',
      }),
    );
    expect(users.find((user) => user.id === 8)?.email).toBe(
      'user-8@example.com',
    );
  });

  test('persists created users with the next id', async () => {
    await writeFile(
      usersPath,
      JSON.stringify([
        {
          id: 7,
          firstName: 'Deacon',
          lastName: 'Palmer',
          email: 'deacon.palmer@example.com',
          role: 'viewer',
        },
      ]),
      'utf8',
    );

    const repository = UsersRepository.fromFile(usersPath);
    const user = await repository.create({
      firstName: 'Spence',
      lastName: 'Olchin',
      email: 'spence.olchin@example.com',
      phoneNumber: '+44 555 1234',
      role: 'editor',
    });
    const persistedUsers = JSON.parse(await readFile(usersPath, 'utf8'));

    expect(user).toEqual(
      expect.objectContaining({
        id: 8,
        firstName: 'Spence',
        role: 'editor',
      }),
    );
    expect(persistedUsers).toHaveLength(2);
    expect(persistedUsers[1]).toEqual(user);
  });
});
