export const userRoles = ['admin', 'editor', 'viewer'] as const;

export type UserRole = (typeof userRoles)[number];
