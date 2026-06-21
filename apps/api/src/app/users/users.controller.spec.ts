import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  const users = [
    {
      id: 1,
      firstName: 'Doug',
      lastName: 'Heffernan',
      email: 'doug.heffernan@example.com',
      role: 'viewer' as const,
    },
    {
      id: 2,
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '+1-555-123-4567',
      role: 'editor' as const,
    },
  ];

  let controller: UsersController;
  let usersService: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersService = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };

    controller = new UsersController(usersService as unknown as UsersService);
  });

  test('returns all users', async () => {
    usersService.findAll.mockResolvedValue(users);

    await expect(controller.findAll()).resolves.toEqual(users);
  });

  test('returns one user by id', async () => {
    usersService.findById.mockResolvedValue(users[0]);

    await expect(controller.findById(1)).resolves.toEqual(users[0]);
    expect(usersService.findById).toHaveBeenCalledWith(1);
  });

  test('throws not found when a user does not exist', async () => {
    usersService.findById.mockResolvedValue(undefined);

    await expect(controller.findById(404)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  test('creates a user', async () => {
    const createUser = {
      firstName: 'Carrie',
      lastName: 'Heffernan',
      email: 'carrie.heffernan@example.com',
      role: 'viewer' as const,
    };
    const createdUser = { id: 3, ...createUser };

    usersService.create.mockResolvedValue(createdUser);

    await expect(controller.create(createUser)).resolves.toEqual(createdUser);
    expect(usersService.create).toHaveBeenCalledWith(createUser);
  });
});
