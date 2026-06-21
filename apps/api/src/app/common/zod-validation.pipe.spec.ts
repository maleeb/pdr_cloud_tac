import { BadRequestException } from '@nestjs/common';
import { createUserSchema } from '@org/shared';
import { describe, expect, test } from 'vitest';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(createUserSchema);

  test('returns parsed values for valid input', () => {
    const result = pipe.transform(
      {
        firstName: ' Doug ',
        lastName: 'Heffernan',
        email: 'doug.heffernan@example.com',
        role: 'viewer',
      },
      { type: 'body' },
    );

    expect(result).toEqual({
      firstName: 'Doug',
      lastName: 'Heffernan',
      email: 'doug.heffernan@example.com',
      role: 'viewer',
    });
  });

  test('throws bad request for invalid input', () => {
    expect(() =>
      pipe.transform(
        {
          firstName: 'Arthur',
          lastName: 'Spooner',
          email: 'arthur.spooner@example.com',
          role: 'admin',
        },
        { type: 'body' },
      ),
    ).toThrow(BadRequestException);
  });
});
