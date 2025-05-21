import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import {
  boolean,
  primaryKey,
  json
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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
  userId: integer('user_id').primaryKey(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at').notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
  userStationId: integer('user_station_id'),

  playedAudioIds: jsonb("played_audio_ids").default([]).notNull().$type<string[]>(),
  likedAudioIds: jsonb("liked_audio_ids").default([]).notNull().$type<string[]>(),
  searchHistory: jsonb("search_history").default([]).notNull().$type<string[]>(),
  subscribedChannelIds: jsonb("subscribed_channel_ids").default([]).notNull().$type<string[]>(),
});

export type FrontendUser = typeof frontendUsers.$inferSelect;
export type NewFrontendUser = typeof frontendUsers.$inferInsert;


// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUserId: varchar("firebase_user_id").notNull().unique(),
  name: varchar("name"),
  description: text("description"),
  email: varchar("email"),
  imageUrl: varchar("image_url"),
  is_enabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Groups Table
export const userGroups = pgTable("user_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  description: text("description"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Plans Table
export const plans = pgTable("plans", {
  planId: varchar("plan_id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  pricePerMonth: decimal('price_per_month', { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscriptions Table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  planId: varchar("plan_id").notNull().references(() => plans.planId),
  status: varchar("status"),
  adminUserId: integer("admin_user_id").notNull().references(() => users.id),
  adminUserGroupId: integer("admin_user_group_id").notNull().references(() => userGroups.id),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeProductId: varchar("stripe_product_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripePlanName: varchar("stripe_plan_name"),
  stripeSubscriptionStatus: varchar("stripe_subscription_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

// User User Groups (Junction Table)
export const userUserGroups = pgTable("user_user_groups", {
  userId: integer("user_id").notNull().references(() => users.id),
  userGroupId: integer("user_group_id").notNull().references(() => userGroups.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.userGroupId] })
  };
});

// User Group Invitations Table
export const userGroupInvitations = pgTable("user_group_invitations", {
  id: serial("id").primaryKey(),
  userGroupId: integer("user_group_id").references(() => userGroups.id),
  enviteeEmail: varchar("envitee_email"),
  enviteeId: integer("envitee_id"),
  role: varchar("role"),
  invitedBy: integer("invited_by").references(() => users.id),
  invitedAt: timestamp("invited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Web Page Channel is mentioned but not defined in the provided code
// We'll define a placeholder for it
export const webPageChannels = pgTable("web_page_channels", {
  id: serial("id").primaryKey(),
  // Other fields would be defined here
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Channels Table
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  description: text("description"),
  imageUrl: varchar("image_url"),
  webPageChannelId: integer("web_page_channel_id").references(() => webPageChannels.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stations Table
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isPrivate: boolean("is_private").default(false),
  isLive: boolean("is_live").default(true),
  adminUserId: integer("admin_user_id").references(() => users.id),
  adminUserGroupId: integer("admin_user_group_id").references(() => userGroups.id),
  listenerUserGroupId: integer("listener_user_group_id").references(() => userGroups.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Logs Table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userGroupId: integer("user_group_id").references(() => userGroups.id),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define Relations
export const usersRelations = relations(users, ({ many }) => ({
  userGroups: many(userUserGroups),
}));

export const userGroupsRelations = relations(userGroups, ({ many }) => ({
  users: many(userUserGroups),
}));

export const userUserGroupsRelations = relations(userUserGroups, ({ one }) => ({
  user: one(users, {
    fields: [userUserGroups.userId],
    references: [users.id],
  }),
  userGroup: one(userGroups, {
    fields: [userUserGroups.userGroupId],
    references: [userGroups.id],
  }),
}));

export const webPageChannelsRelations = relations(webPageChannels, ({ many }) => ({
  channels: many(channels),
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
  webPageChannel: one(webPageChannels, {
    fields: [channels.webPageChannelId],
    references: [webPageChannels.id],
  }),
  stations: many(stations),
}));

export const stationsRelations = relations(stations, ({ one, many }) => ({
  adminUser: one(users, {
    fields: [stations.adminUserId],
    references: [users.id],
  }),
  adminUserGroup: one(userGroups, {
    fields: [stations.adminUserGroupId],
    references: [userGroups.id],
  }),
  listenerUserGroup: one(userGroups, {
    fields: [stations.listenerUserGroupId],
    references: [userGroups.id],
  }),
  channels: many(channels),
}));

// Zod Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertUserGroupSchema = createInsertSchema(userGroups);
export const selectUserGroupSchema = createSelectSchema(userGroups);

export const insertChannelSchema = createInsertSchema(channels);
export const selectChannelSchema = createSelectSchema(channels);

export const insertStationSchema = createInsertSchema(stations);
export const selectStationSchema = createSelectSchema(stations);

export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);

// Types
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;

export type UserGroup = z.infer<typeof selectUserGroupSchema>;
export type NewUserGroup = z.infer<typeof insertUserGroupSchema>;

export type Channel = z.infer<typeof selectChannelSchema>;
export type NewChannel = z.infer<typeof insertChannelSchema>;

export type Station = z.infer<typeof selectStationSchema>;
export type NewStation = z.infer<typeof insertStationSchema>;

export type ActivityLog = z.infer<typeof selectActivityLogSchema>;
export type NewActivityLog = z.infer<typeof insertActivityLogSchema>;