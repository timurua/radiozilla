import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export const frontendAuthors = pgTable('frontend_authors', {
  normalizedUrlHash: varchar('normalized_url_hash', { length: 32 }).primaryKey(),
  normalizedUrl: varchar('normalized_url').notNull(),
  name: varchar('name'),
  description: text('description'),
  imageUrl: varchar('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type FrontendAuthor = typeof frontendAuthors.$inferSelect;
export type NewFrontendAuthor = typeof frontendAuthors.$inferInsert;

export const frontendChannels = pgTable('frontend_channels', {
  normalizedUrlHash: varchar('normalized_url_hash', { length: 32 }).primaryKey(),
  normalizedUrl: varchar('normalized_url').notNull(),
  name: varchar('name'),
  description: text('description'),
  imageUrl: varchar('image_url'),
  sourceUrls: text('source_urls').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type FrontendChannel = typeof frontendChannels.$inferSelect;
export type NewFrontendChannel = typeof frontendChannels.$inferInsert;

export const frontendAudios = pgTable('frontend_audios', {
  normalizedUrlHash: varchar('normalized_url_hash', { length: 32 }).primaryKey(),
  normalizedUrl: varchar('normalized_url').notNull(),
  title: varchar('title'),
  description: text('description'),
  audioText: text('audio_text'),
  imageUrl: varchar('image_url'),
  audioUrl: varchar('audio_url'),
  webUrl: varchar('web_url'),
  authorId: varchar('author_id'),
  channelId: varchar('channel_id'),
  publishedAt: timestamp('published_at'),
  uploadedAt: timestamp('uploaded_at'),
  durationSeconds: integer('duration_seconds'),
  topics: text('topics').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type FrontendAudio = typeof frontendAudios.$inferSelect;
export type NewFrontendAudio = typeof frontendAudios.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

export const frontendUsers = pgTable('frontend_users', {
  userId: varchar('user_id', { length: 32 }).primaryKey(),
  displayName: varchar('display_name'),
  email: varchar('email'),
  imageUrl: varchar('image_url'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  playedAudioIds: jsonb("played_audio_ids").default([]),
  likedAudioIds: jsonb("liked_audio_ids").default([]),
  searchHistory: jsonb("search_history").default([]),
  subscribedChannelIds: jsonb("subscribed_channel_ids").default([]),
});

export type FrontendUser = typeof frontendUsers.$inferSelect;
export type NewFrontendUser = typeof frontendUsers.$inferInsert;
