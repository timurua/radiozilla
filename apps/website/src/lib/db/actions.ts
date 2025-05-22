'use server';

import { desc } from 'drizzle-orm';
import { TfIdfDocument } from '@/components/webplayer/tfidf/types';
import logger from '@/components/webplayer/utils/logger';
import { PlayableFeedMode } from '@/components/webplayer/data/model';

import { db } from '@/lib/db/drizzle';
import {
    activityLogs,
    FrontendAudio,
    frontendAudios,
    frontendAuthors,
    frontendChannels,
    frontendUsers,
    Subscription,
    subscriptions,
    users
} from '@/lib/db/schema';
import { eq, lte } from 'drizzle-orm';
import { ActivityLogDTO, FrontendAudioDTO, FrontendAuthorDTO, FrontendChannelDTO, FrontendUserDTO, UserDTO } from './interfaces';
import { getAuthenticatedAppForUser, getUser } from '../server/firebase';


export const getAuthorAction = async (id: string): Promise<FrontendAuthorDTO> => {
    const [dbAuthor] = await db
        .select()
        .from(frontendAuthors)
        .where(
            eq(frontendAuthors.normalizedUrlHash, id)
        )
        .limit(1);



    if (dbAuthor) {
        return {
            id: dbAuthor.normalizedUrlHash,
            name: dbAuthor.name || '',
            description: dbAuthor.description || '',
            imageUrl: dbAuthor.imageUrl || '',
            createdAt: dbAuthor.createdAt,
            updatedAt: dbAuthor.updatedAt
        };
    } else {
        logger.error(`No author found with ID: ${id}`);
        throw new Error(`No author found with ID: ${id}`);
    }
}

export const getAllChannelIdsAction = async (): Promise<string[]> => {
    const dbChannelIds = await db.select({
        id: frontendChannels.normalizedUrlHash,
    })
        .from(frontendChannels)
    return dbChannelIds.map((dbChannelId) => dbChannelId.id)
}

export const getChannelAction = async (id: string): Promise<FrontendChannelDTO> => {
    const [dbChannel] = await db
        .select()
        .from(frontendChannels)
        .where(
            eq(frontendChannels.normalizedUrlHash, id)
        )
        .limit(1);

    if (dbChannel) {
        return {
            id: dbChannel.normalizedUrlHash,
            name: dbChannel.name || '',
            description: dbChannel.description || '',
            imageUrl: dbChannel.imageUrl || '',
            sourceUrls: dbChannel.sourceUrls || [],
            createdAt: dbChannel.createdAt,
            updatedAt: dbChannel.updatedAt
        };
    } else {
        logger.error(`No author found with ID: ${id}`);
        throw new Error(`No author found with ID: ${id}`);
    }
}

export const upsertUserAction = async (user: UserDTO): Promise<UserDTO> => {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (!currentUser) {
        throw new Error("No user found");
    }
    if (user.firebaseUserId !== currentUser.uid) {
        throw new Error("User ID mismatch");
    }

    const dbUsers = await db.select({
        id: users.id,
        firebaseUserId: users.firebaseUserId,
        name: users.name,
        description: users.description,
        email: users.email,
        imageUrl: users.imageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        is_enabled: users.is_enabled
    }).from(users).where(eq(users.firebaseUserId, user.firebaseUserId)).limit(1);

    if (dbUsers.length > 0) {
        return dbUsers[0];
    }

    const insertResult = await db.insert(users).values({
        firebaseUserId: user.firebaseUserId,
        name: user.name,
        description: user.description,
        email: user.email,
        imageUrl: user.imageUrl,
        is_enabled: user.is_enabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }).returning({
        id: users.id,
        firebaseUserId: users.firebaseUserId,
        name: users.name,
        description: users.description,
        email: users.email,
        imageUrl: users.imageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        is_enabled: users.is_enabled
    });
    return insertResult[0];
}

export const deleteUserAction = async (userId: number): Promise<void> => {
    await db.delete(users).where(eq(users.id, userId));
}


export const upsertFrontendUserAction = async (userData: FrontendUserDTO): Promise<FrontendUserDTO> => {

    const dbFrontendUsersPromise = db.select({
        userId: frontendUsers.userId,
        createdAt: frontendUsers.createdAt,
        updatedAt: frontendUsers.updatedAt,
        playedAudioIds: frontendUsers.playedAudioIds,
        likedAudioIds: frontendUsers.likedAudioIds,
        searchHistory: frontendUsers.searchHistory,
        subscribedChannelIds: frontendUsers.subscribedChannelIds
    }).from(frontendUsers).where(eq(frontendUsers.userId, userData.userId)).limit(1);

    const dbFrontendUsers = await dbFrontendUsersPromise;
    if (dbFrontendUsers.length > 0) {
        return {
            userId: dbFrontendUsers[0].userId,
            playedAudioIds: dbFrontendUsers[0].playedAudioIds,
            likedAudioIds: dbFrontendUsers[0].likedAudioIds,
            searchHistory: dbFrontendUsers[0].searchHistory,
            subscribedChannelIds: dbFrontendUsers[0].subscribedChannelIds,
            createdAt: dbFrontendUsers[0].createdAt,
            updatedAt: dbFrontendUsers[0].updatedAt
        };
    }
    const insertResult = await db.insert(frontendUsers).values({
        userId: userData.userId,
        playedAudioIds: userData.playedAudioIds,
        likedAudioIds: userData.likedAudioIds,
        searchHistory: userData.searchHistory,
        subscribedChannelIds: userData.subscribedChannelIds,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
    }).returning({
        userId: frontendUsers.userId,
        createdAt: frontendUsers.createdAt,
        updatedAt: frontendUsers.updatedAt,
        playedAudioIds: frontendUsers.playedAudioIds,
        likedAudioIds: frontendUsers.likedAudioIds,
        searchHistory: frontendUsers.searchHistory,
        subscribedChannelIds: frontendUsers.subscribedChannelIds,
    });
    return insertResult[0];

}

function dbAudioToDTO(dbAudio: FrontendAudio): FrontendAudioDTO {
    return {
        id: dbAudio.normalizedUrlHash,
        normalizedUrl: dbAudio.normalizedUrl,
        title: dbAudio.title || '',
        description: dbAudio.description || '',
        imageUrl: dbAudio.imageUrl || '',
        audioUrl: dbAudio.audioUrl || '',
        webUrl: dbAudio.webUrl || '',
        topics: dbAudio.topics || [],
        audioText: dbAudio.audioText || '',
        durationSeconds: dbAudio.durationSeconds || 0,
        authorId: dbAudio.authorId || null,
        channelId: dbAudio.channelId || null,
        publishedAt: dbAudio.publishedAt || null,
        createdAt: dbAudio.createdAt,
        updatedAt: dbAudio.updatedAt
    };
}

// Modify getAudio with caching
export const getAudioAction = async (id: string): Promise<FrontendAudioDTO> => {
    const [dbAudio] = await db
        .select()
        .from(frontendAudios)
        .where(
            eq(frontendAudios.normalizedUrlHash, id)
        )
        .limit(1);

    if (dbAudio) {
        return dbAudioToDTO(dbAudio);
    } else {
        logger.error(`No audio found with ID: ${id}`);
        throw new Error(`No audio found with ID: ${id}`);
    }
}

export const getAudioListForChannelAction = async (channelId: string): Promise<FrontendAudioDTO[]> => {

    const dbAudios = await db
        .select()
        .from(frontendAudios)
        .where(
            eq(frontendAudios.channelId, channelId)
        )
    return dbAudios.map((dbAudio) => dbAudioToDTO(dbAudio))
}

export const getAudioPageAction = async (startAfterPublishedAt: Date | null, pageSize: number): Promise<FrontendAudioDTO[]> => {

    const dbAudios = await (
        startAfterPublishedAt
            ? db.select()
                .from(frontendAudios)
                .where(
                    lte(frontendAudios.publishedAt, startAfterPublishedAt!)
                )
                .orderBy(desc(frontendAudios.publishedAt))
                .limit(pageSize)
            : db.select()
                .from(frontendAudios)
                .orderBy(desc(frontendAudios.publishedAt))
                .limit(pageSize));
    return dbAudios.map((dbAudio) => dbAudioToDTO(dbAudio))
}


export const getSearchDocumentsAction = async (): Promise<TfIdfDocument[]> => {

    const dbAudios = await db
        .select({
            normalizedUrlHash: frontendAudios.normalizedUrlHash,
            title: frontendAudios.title
        })
        .from(frontendAudios)

    return dbAudios.map(dbAudio => ({
        docId: dbAudio.normalizedUrlHash,
        text: dbAudio.title || ''
    }));
}

export const getFeedAudioListAction = async (feedMode: PlayableFeedMode, subscribedChannelIds: string[]): Promise<FrontendAudioDTO[]> => {

    let dbAudios = await db.select()
        .from(frontendAudios)
        .orderBy(desc(frontendAudios.publishedAt))

    if (feedMode == PlayableFeedMode.Subscribed) {
        const subscribedChannelIdsSet = new Set(subscribedChannelIds);
        dbAudios = dbAudios.filter(dbAudio => subscribedChannelIdsSet.has(dbAudio.channelId!));
    }

    return dbAudios.map(dbAudio => dbAudioToDTO(dbAudio));
}

export const getActivityLogsForUserAction = async (userId: number): Promise<ActivityLogDTO[]> => {
    const dbActivityLogs = await db
        .select()
        .from(activityLogs)
        .where(
            eq(activityLogs.userId, userId)
        )
        .orderBy(desc(activityLogs.createdAt));

    return dbActivityLogs.map(dbActivityLog => ({
        id: dbActivityLog.id,
        userId: dbActivityLog.userId,
        userGroupId: dbActivityLog.userGroupId,
        action: dbActivityLog.action,
        createdAt: dbActivityLog.createdAt,
        ipAddress: dbActivityLog.ipAddress
    }));
}

export const getSubscriptionByStripeCustomerIdAction = async (stripeCustomerId: string): Promise<Subscription | null> => {
    const dbSubscription = await db
        .select()
        .from(subscriptions)
        .where(
            eq(subscriptions.stripeCustomerId, stripeCustomerId)
        )
        .limit(1);

    if (dbSubscription.length > 0) {
        return dbSubscription[0];
    }
    return null;
}

export const getSubscriptionForCurrentUserAction = async (): Promise<Subscription | null> => {
    const user = await getUser();
    if (!user) {
        return null;
    }
    return await getSubscriptionByUserIdAction(user.id);
}

export const getSubscriptionUsersForSubscriptionAction = async (): Promise<UserDTO[]> => {
    return [];
}

export const getSubscriptionByUserIdAction = async (userId: number): Promise<Subscription | null> => {
    const dbSubscription = await db
        .select()
        .from(subscriptions)
        .where(
            eq(subscriptions.adminUserId, userId)
        )
        .limit(1);

    if (dbSubscription.length > 0) {
        return dbSubscription[0];
    }
    return null;
}

export const updateSubscriptionAction = async (subscriptionId: number, data: Partial<Subscription>): Promise<Subscription> => {
    const dbSubscription = await db
        .update(subscriptions)
        .set(data)
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

    if (dbSubscription.length > 0) {
        return dbSubscription[0];
    }
    throw new Error(`No subscription found with ID: ${subscriptionId}`);
}



