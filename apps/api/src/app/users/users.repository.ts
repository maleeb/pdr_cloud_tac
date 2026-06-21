import { Injectable } from '@nestjs/common';
import {
  createUserSchema,
  userSchema,
  type CreateUser,
  type User,
} from '@org/shared';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { z } from 'zod';

const workspaceRoot = findWorkspaceRoot(process.cwd());
const defaultUsersPath = join(workspaceRoot, 'data', 'users.json');

type UnknownRecord = Record<string, unknown>;

function findWorkspaceRoot(startPath: string): string {
  let currentPath = startPath;
  const rootPath = parse(startPath).root;

  while (currentPath !== rootPath) {
    if (existsSync(join(currentPath, 'nx.json'))) {
      return currentPath;
    }

    currentPath = dirname(currentPath);
  }

  return startPath;
}

@Injectable()
export class UsersRepository {
  private usersPath = defaultUsersPath;
  private writeLock: Promise<unknown> = Promise.resolve();

  // INFO: this factory method allows creating a repository instance with a custom users file path, which is useful for testing with temporary files
  static fromFile(usersPath: string): UsersRepository {
    const repository = new UsersRepository();

    repository.usersPath = usersPath;

    return repository;
  }

  async findAll(): Promise<User[]> {
    await this.waitForWrites();

    return this.readUsers();
  }

  async findById(id: number): Promise<User | undefined> {
    const users = await this.findAll();

    return users.find((user) => user.id === id);
  }

  async create(input: CreateUser): Promise<User> {
    const operation = this.writeLock.then(async () => {
      const createUser = createUserSchema.parse(input);
      const users = await this.readUsers();
      const nextId =
        users.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1;
      const user = userSchema.parse({ id: nextId, ...createUser });

      await this.writeUsers([...users, user]);

      return user;
    });

    this.writeLock = operation.catch(() => undefined);

    return operation;
  }

  private async waitForWrites(): Promise<void> {
    try {
      await this.writeLock;
    } catch {
      // failed writes are returned to the caller that triggered them.
    }
  }

  private async readUsers(): Promise<User[]> {
    const rawJson = await readFile(this.usersPath, 'utf8');
    const rawUsers = z.array(z.unknown()).parse(JSON.parse(rawJson));

    return rawUsers.map((rawUser) => this.normalizeUser(rawUser));
  }

  private async writeUsers(users: User[]): Promise<void> {
    await mkdir(dirname(this.usersPath), { recursive: true });
    await writeFile(
      this.usersPath,
      `${JSON.stringify(users, null, 2)}\n`,
      'utf8',
    );
  }

  private normalizeUser(rawUser: unknown): User {
    const record = this.assertRecord(rawUser);
    const id = this.requiredNumber(record.id, 'id');
    const firstName = this.requiredString(
      record.firstName ?? record.fistName,
      'firstName',
    );
    const lastName = this.requiredString(record.lastName, 'lastName');
    const role = this.requiredString(record.role, 'role');
    const email = this.normalizeEmail(record.email, id);
    const phoneNumber = this.optionalString(record.phoneNumber);
    const birthDate = this.optionalBirthDate(
      record.birthDate ?? record.birthDtae,
    );

    return userSchema.parse({
      id,
      firstName,
      lastName,
      email,
      phoneNumber,
      birthDate,
      role,
    });
  }

  private assertRecord(value: unknown): UnknownRecord {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('User data must be an object');
    }

    return value as UnknownRecord;
  }

  private requiredNumber(value: unknown, fieldName: string): number {
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      return Number(value);
    }

    if (typeof value !== 'number') {
      throw new Error(`User ${fieldName} must be a number`);
    }

    return value;
  }

  private requiredString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`User ${fieldName} must be a non-empty string`);
    }

    return value;
  }

  private optionalString(value: unknown): string | undefined {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return undefined;
    }

    return value;
  }

  private optionalBirthDate(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
  }

  private normalizeEmail(value: unknown, id: number): string {
    if (typeof value !== 'string') {
      return `user-${id}@example.com`;
    }

    return z.string().email().safeParse(value).success
      ? value
      : `user-${id}@example.com`;
  }
}
