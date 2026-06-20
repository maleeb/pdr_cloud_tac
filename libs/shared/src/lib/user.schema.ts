import { z } from 'zod';
import { userRoles } from './user-role';

const isoDateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must use YYYY-MM-DD format')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    );
  }, 'Birth date must be a valid date');

const optionalIsoDateString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  isoDateString.optional(),
);

export const userSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Email must be valid'),
  phoneNumber: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  birthDate: optionalIsoDateString,
  role: z.enum(userRoles),
});

export const createUserSchema = userSchema.omit({ id: true });
