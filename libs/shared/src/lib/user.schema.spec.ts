import { describe, expect, test } from 'vitest';
import { createUserSchema, userSchema } from './user.schema';

const validCreateUser = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'viewer',
} as const;

describe('user schemas', () => {
  test('allows viewers without phone number or birth date', () => {
    expect(createUserSchema.safeParse(validCreateUser).success).toBe(true);
  });

  test('requires phone number for editors', () => {
    const result = createUserSchema.safeParse({
      ...validCreateUser,
      role: 'editor',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['phoneNumber'],
        message: 'Phone number is required for admins and editors',
      }),
    );
  });

  test('allows editors with phone number and no birth date', () => {
    const result = createUserSchema.safeParse({
      ...validCreateUser,
      role: 'editor',
      phoneNumber: '+1-555-123-4567',
    });

    expect(result.success).toBe(true);
  });

  test('requires phone number and birth date for admins', () => {
    const result = createUserSchema.safeParse({
      ...validCreateUser,
      role: 'admin',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['phoneNumber'],
          message: 'Phone number is required for admins and editors',
        }),
        expect.objectContaining({
          path: ['birthDate'],
          message: 'Birth date is required for admins',
        }),
      ]),
    );
  });

  test('allows admins with phone number and birth date', () => {
    const result = createUserSchema.safeParse({
      ...validCreateUser,
      role: 'admin',
      phoneNumber: '+1-555-123-4567',
      birthDate: '1990-01-31',
    });

    expect(result.success).toBe(true);
  });

  test('allows viewers without role-specific fields when optional fields are empty', () => {
    const result = createUserSchema.safeParse({
      ...validCreateUser,
      phoneNumber: '',
      birthDate: '',
    });

    expect(result.success).toBe(true);
  });

  test('rejects invalid ISO birth dates', () => {
    const result = createUserSchema.safeParse({
      ...validCreateUser,
      role: 'admin',
      phoneNumber: '+1-555-123-4567',
      birthDate: '1990-02-31',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['birthDate'],
        message: 'Birth date must be a valid date',
      }),
    );
  });

  test('validates persisted users with ids', () => {
    const result = userSchema.safeParse({
      id: 1,
      ...validCreateUser,
    });

    expect(result.success).toBe(true);
  });
});
