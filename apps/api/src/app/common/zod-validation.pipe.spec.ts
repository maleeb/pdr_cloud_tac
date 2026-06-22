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

  test('allows editors with phone number and no birth date', () => {
    const result = pipe.transform(
      {
        firstName: 'Arthur',
        lastName: 'Spooner',
        email: 'arthur.spooner@example.com',
        phoneNumber: '+1-555-123-4567',
        role: 'editor',
      },
      { type: 'body' },
    );

    expect(result).toEqual({
      firstName: 'Arthur',
      lastName: 'Spooner',
      email: 'arthur.spooner@example.com',
      phoneNumber: '+1-555-123-4567',
      role: 'editor',
    });
  });

  test('throws bad request for editors without phone number', () => {
    expect(() =>
      pipe.transform(
        {
          firstName: 'Arthur',
          lastName: 'Spooner',
          email: 'arthur.spooner@example.com',
          role: 'editor',
        },
        { type: 'body' },
      ),
    ).toThrow(BadRequestException);
  });

  test('throws bad request for admins without phone number and birth date', () => {
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

  test('throws bad request for admins without birth date', () => {
    expect(() =>
      pipe.transform(
        {
          firstName: 'Arthur',
          lastName: 'Spooner',
          email: 'arthur.spooner@example.com',
          phoneNumber: '+1-555-123-4567',
          role: 'admin',
        },
        { type: 'body' },
      ),
    ).toThrow(BadRequestException);
  });
});
