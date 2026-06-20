import { z } from 'zod';
import { createUserSchema, userSchema } from './user.schema';

export type User = z.infer<typeof userSchema>;

export type CreateUser = z.infer<typeof createUserSchema>;
