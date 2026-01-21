import * as p from 'drizzle-orm/pg-core';

export const userRoleEnum = p.pgEnum('cinema_user_roles', [
  'admin',
  'user',
  'guest',
]);

export const usersTable = p.pgTable('users', {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.varchar({ length: 100 }).notNull(),
  email: p.varchar({ length: 255 }).notNull().unique(),
  password: p.varchar({ length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),

  // Status & Verification
  isVerified: p.boolean().notNull().default(false),
  verificationToken: p.varchar({ length: 255 }),
  verificationTokenExpires: p.timestamp(),

  // Security
  resetPasswordToken: p.varchar({ length: 255 }),
  resetPasswordExpires: p.timestamp(),

  // Profile Information
  age: p.integer(),
  phoneNumber: p.varchar({ length: 20 }),
  profileImageUrl: p.varchar({ length: 500 }),

  // Payment Integration (Stripe/Razorpay Customer ID)
  customerExternalId: p.varchar({ length: 255 }),

  // Metadata
  createdAt: p.timestamp().defaultNow().notNull(),
  updatedAt: p.timestamp().defaultNow().notNull(),
  deletedAt: p.timestamp(), // For soft deletes
});

export const paymentMethodsTable = p.pgTable(
  'payment_methods',
  {
    id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: p
      .integer()
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    provider: p.varchar({ length: 50 }).notNull(),
    externalMethodId: p.varchar({ length: 255 }).notNull(),
    last4: p.varchar({ length: 4 }),
    expiryMonth: p.integer(),
    expiryYear: p.integer(),
    brand: p.varchar({ length: 50 }),
    isDefault: p.boolean().default(false).notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
  },
  table => [p.unique().on(table.userId, table.externalMethodId)]
);
