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

const persistedUserSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().min(1, 'Email is required'),
  phoneNumber: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  birthDate: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  role: z.enum(userRoles),
  dataIssues: z.array(z.string()).optional(),
});

const createUserBaseSchema = z.object({
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

const addRoleRequirementIssues = (
  user: z.infer<typeof createUserBaseSchema>,
  ctx: z.RefinementCtx,
) => {
  if ((user.role === 'admin' || user.role === 'editor') && !user.phoneNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['phoneNumber'],
      message: 'Phone number is required for admins and editors',
    });
  }

  if (user.role === 'admin' && !user.birthDate) {
    ctx.addIssue({
      code: 'custom',
      path: ['birthDate'],
      message: 'Birth date is required for admins',
    });
  }
};

export const userSchema = persistedUserSchema;

export const createUserSchema = createUserBaseSchema.superRefine(
  addRoleRequirementIssues,
);
