import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { createUserSchema, type CreateUser } from '@org/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createUserSchema))
    createUser: CreateUser,
  ) {
    return this.usersService.create(createUser);
  }
}
