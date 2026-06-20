import { Injectable } from '@nestjs/common';
import { type CreateUser, type User } from '@org/shared';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findById(id);
  }

  create(input: CreateUser): Promise<User> {
    return this.usersRepository.create(input);
  }
}
