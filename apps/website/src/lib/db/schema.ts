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

import {
  boolean,
  primaryKey,
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

// User Permissions Table
export const userPermissions = pgTable("user_permissions", {
  userId: integer("user_id").notNull(),
  permissionTargetName: varchar("permission_target_name").notNull(),
  permissionTargetId: integer("permission_target_id").notNull(),
  permission: varchar("permission").notNull(),
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
  planId: varchar("plan_id").notNull(),
  status: varchar("status"),
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
  isPublic: boolean("is_public").default(false),
  imageUrl: varchar("image_url"),
  webPageChannelId: integer("web_page_channel_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stations Table
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Station Channels Table
export const stationChannels = pgTable("station_channels", {
  stationId: integer("station_id").notNull(),
  channelId: integer("channel_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Logs Table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: varchar("action").notNull(),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertUserPermissionSchema = createInsertSchema(userPermissions);
export const selectUserPermissionSchema = createSelectSchema(userPermissions);

export const insertChannelSchema = createInsertSchema(channels);
export const selectChannelSchema = createSelectSchema(channels);

export const insertStationSchema = createInsertSchema(stations);
export const selectStationSchema = createSelectSchema(stations);

export const insertStationChannelsSchema = createInsertSchema(stationChannels);
export const selectStationChannelsSchema = createSelectSchema(stationChannels);

export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);

// Types
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;

export type UserPermission = z.infer<typeof selectUserPermissionSchema>;
export type NewUserPermission = z.infer<typeof insertUserPermissionSchema>;

export type Channel = z.infer<typeof selectChannelSchema>;
export type NewChannel = z.infer<typeof insertChannelSchema>;

export type Station = z.infer<typeof selectStationSchema>;
export type NewStation = z.infer<typeof insertStationSchema>;

export type StationChannels = z.infer<typeof selectStationChannelsSchema>;
export type NewStationChannels = z.infer<typeof insertStationChannelsSchema>;

export type ActivityLog = z.infer<typeof selectActivityLogSchema>;
export type NewActivityLog = z.infer<typeof insertActivityLogSchema>;