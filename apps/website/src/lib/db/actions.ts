'use server';

import { PlayableFeedMode, RZChannel, RZStation, RZUser, RZUserType } from '@/components/webplayer/data/model';
import { TfIdfDocument } from '@/components/webplayer/tfidf/types';
import logger from '@/components/webplayer/utils/logger';
import { withErrorHandler } from '@/lib/serverActionWrapper';
import { and, desc, inArray } from 'drizzle-orm';

import { db } from '@/lib/db/drizzle';
import {
    activityLogs,
    channels,
    FrontendAudio,
    frontendAudios,
    frontendAuthors,
    frontendChannels,
    frontendUsers,
    stationChannels,
    stations,
    Subscription,
    subscriptions,
    userPermissions,
    users
} from '@/lib/db/schema';
import { eq, lte } from 'drizzle-orm';
import { getAuthenticatedAppForUser } from '../server/firebase';
import { ActivityLogDTO, FrontendAudioDTO, FrontendAuthorDTO, FrontendChannelDTO, FrontendUserDTO, UserPermissionDTO } from './interfaces';


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

export const getCurrentUserAction = async (): Promise<RZUser> => {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (currentUser) {
        const rzUserType = currentUser.isAnonymous ?
            RZUserType.AUTH_ANONYMOUS :
            (currentUser.emailVerified ?
                RZUserType.AUTH_USER :
                RZUserType.WAITING_EMAIL_VERIFICATION);

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
        }).from(users).where(eq(users.firebaseUserId, currentUser.uid)).limit(1);
        if (dbUsers.length > 0) {
            return {
                ...dbUsers[0],
                userType: rzUserType
            };
        }
    }

    return {
        id: 0,
        firebaseUserId: "",
        name: null,
        description: null,
        email: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        is_enabled: false,
        userType: RZUserType.NONE
    };
}

export const getUser = async (): Promise<RZUser | null> => {
    const userDTO = await getCurrentUserAction();
    if (!userDTO) {
        return null;
    }
    return {
        id: userDTO.id,
        firebaseUserId: userDTO.firebaseUserId,
        name: userDTO.name,
        description: userDTO.description,
        imageUrl: userDTO.imageUrl,
        email: userDTO.email,
        is_enabled: userDTO.is_enabled,
        createdAt: userDTO.createdAt,
        updatedAt: userDTO.updatedAt,
        userType: userDTO.userType,
    };
}

export const upsertUserAction = withErrorHandler(async (user: RZUser): Promise<RZUser> => {
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
        return {
            ...dbUsers[0],
            userType: user.userType
        }
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
    return {
        ...insertResult[0],
        userType: user.userType
    };
});

export const deleteUserAction = async (): Promise<void> => {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (!currentUser) {
        throw new Error("No user found");
    }
    await db.delete(users).where(eq(users.firebaseUserId, currentUser.uid));
}

export const checkViewUserPermission = async (userId: number, permissionTargetName: string, permissionTargetId: number): Promise<boolean> => {
    const permissions = await getUserPermissionsForUserAction(userId, permissionTargetName, permissionTargetId);
    if (!permissions || permissions.length === 0) {
        return false;
    }
    return true;
}

export const checkEditUserPermission = async (userId: number, permissionTargetName: string, permissionTargetId: number): Promise<boolean> => {
    const permissions = await getUserPermissionsForUserAction(userId, permissionTargetName, permissionTargetId);
    if (!permissions || permissions.length === 0) {
        return false;
    }
    return permissions.some(p => p.permission === "edit");
}

export const addViewUserPermissionAction = async (userId: number, permissionTargetName: string, permissionTargetId: number): Promise<void> => {
    await db.insert(userPermissions).values({
        userId: userId,
        permissionTargetName: permissionTargetName,
        permissionTargetId: permissionTargetId,
        permission: "view"
    });
}

export const addEditUserPermissionAction = async (userId: number, permissionTargetName: string, permissionTargetId: number): Promise<void> => {
    await db.insert(userPermissions).values({
        userId: userId,
        permissionTargetName: permissionTargetName,
        permissionTargetId: permissionTargetId,
        permission: "edit"
    });
}

export const getStationsForCurrentUserAction = async (): Promise<RZStation[]> => {
    const user = await getCurrentUserAction();
    if (!user) {
        throw new Error("No user found");
    }

    const permission = await getUserPermissionsForCurrentUserAction();
    if (!permission || permission.length === 0) {
        return [];
    }
    const stationIds = permission.filter(p => p.permissionTargetName === "station").map(p => p.permissionTargetId);

    const dbStations = await db.select({
        id: stations.id,
        name: stations.name,
        description: stations.description,
        imageUrl: stations.imageUrl,
        isPublic: stations.isPublic,
        createdAt: stations.createdAt,
        updatedAt: stations.updatedAt
    }).from(stations).where(inArray(stations.id, stationIds)).limit(1);
    return dbStations;
}


export const getStationForCurrentUserAction = async (stationId: number): Promise<RZStation | null> => {
    const user = await getCurrentUserAction();
    if (!user) {
        throw new Error("No user found");
    }

    if (!await checkViewUserPermission(user.id, "station", stationId)) {
        return null;
    }

    const dbStation = await db.select({
        id: stations.id,
        name: stations.name,
        description: stations.description,
        imageUrl: stations.imageUrl,
        isPublic: stations.isPublic,
        createdAt: stations.createdAt,
        updatedAt: stations.updatedAt
    }).from(stations).where(eq(stations.id, stationId)).limit(1);
    return dbStation.length > 0 ? dbStation[0] : null;
}

export const getStationChannelsForCurrentUserAction = async (stationId: number): Promise<RZChannel[]> => {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (!currentUser) {
        throw new Error("No user found");
    }

    const dbChannels = await db
        .select({
            id: channels.id,
            name: channels.name,
            description: channels.description,
            imageUrl: channels.imageUrl,
            isPublic: channels.isPublic,
            createdAt: channels.createdAt,
            updatedAt: channels.updatedAt,
        })
        .from(stationChannels)
        .innerJoin(channels, eq(stationChannels.channelId, channels.id))
        .where(
            and(
                eq(stationChannels.stationId, stationId),
            )
        );

    return dbChannels.map((dbChannel) => ({
        id: dbChannel.id,
        name: dbChannel.name || '',
        description: dbChannel.description || '',
        imageUrl: dbChannel.imageUrl || '',
        isPublic: dbChannel.isPublic || false,
        createdAt: dbChannel.createdAt,
        updatedAt: dbChannel.updatedAt,
    }));
}

export const addChannelToStationAction = withErrorHandler(async (stationId: number, channelId: number): Promise<void> => {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (!currentUser) {
        throw new Error("No user found");
    }

    // Check if the channel is already added to the station
    const existing = await db
        .select()
        .from(stationChannels)
        .where(
            and(
                eq(stationChannels.stationId, stationId),
                eq(stationChannels.channelId, channelId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        throw new Error("Channel is already added to this station");
    }

    // Add channel to station
    await db.insert(stationChannels).values({
        stationId,
        channelId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Log the activity
    await db.insert(activityLogs).values({
        userId: currentUser.uid === 'anonymous' ? null : (await getCurrentUserAction()).id,
        action: `Added channel ${channelId} to station ${stationId}`,
        ipAddress: '', // You might want to get this from the request
        createdAt: new Date(),
    });
});

export const createStationForUserAction = async (station: RZStation): Promise<RZStation> => {
    const user = await getCurrentUserAction();
    if (!user) {
        throw new Error("No user found");
    }

    const result = await db.insert(stations).values({
        name: station.name,
        description: station.description,
        isPublic: station.isPublic,
        imageUrl: station.imageUrl,
        updatedAt: station.updatedAt,
        createdAt: station.createdAt,
    }).returning({
        id: stations.id,
        name: stations.name,
        description: stations.description,
        imageUrl: stations.imageUrl,
        isPublic: stations.isPublic,
        createdAt: stations.createdAt,
        updatedAt: stations.updatedAt
    });

    await addEditUserPermissionAction(user.id, "station", result[0].id);
    return result[0];
}


export const updateStationForUserAction = async (station: RZStation): Promise<RZStation> => {
    const user = await getCurrentUserAction();
    if (!user) {
        throw new Error("No user found");
    }

    if (!await checkEditUserPermission(user.id, "station", station.id)) {
        throw new Error("No permission found");
    }

    const result = await db.update(stations).set({
        name: station.name,
        description: station.description,
        imageUrl: station.imageUrl,
        isPublic: station.isPublic,
        updatedAt: new Date()
    }).returning({
        id: stations.id,
        name: stations.name,
        description: stations.description,
        imageUrl: stations.imageUrl,
        isPublic: stations.isPublic,
        createdAt: stations.createdAt,
        updatedAt: stations.updatedAt
    });
    return result[0];
}

export const upsertAllPlayerForUserAction = async (): Promise<void> => {
    const user = await getCurrentUserAction();
    if (!user) {
        throw new Error("No user found");
    }
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
    return {
        ...insertResult[0],
    };

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

export const getUserPermissionsForUserAction = async (userId: number, permissionTargetName: string, permissionTargetId: number): Promise<UserPermissionDTO[]> => {
    const dbUserPermissions = await db
        .select()
        .from(userPermissions)
        .where(
            and(eq(userPermissions.userId, userId),
                eq(userPermissions.permissionTargetName, permissionTargetName),
                eq(userPermissions.permissionTargetId, permissionTargetId))
        );
    return dbUserPermissions.map(dbUserPermission => ({
        userId: dbUserPermission.userId,
        permissionTargetName: dbUserPermission.permissionTargetName,
        permissionTargetId: dbUserPermission.permissionTargetId,
        permission: dbUserPermission.permission
    }));
}

export const getUserPermissionsForCurrentUserAction = async (): Promise<UserPermissionDTO[]> => {
    const user = await getCurrentUserAction();
    if (!user) {
        return [];
    }
    const dbUserPermissions = await db
        .select()
        .from(userPermissions)
        .where(
            eq(userPermissions.userId, user.id)
        );
    return dbUserPermissions.map(dbUserPermission => ({
        userId: dbUserPermission.userId,
        permissionTargetName: dbUserPermission.permissionTargetName,
        permissionTargetId: dbUserPermission.permissionTargetId,
        permission: dbUserPermission.permission
    }));
}

export const getUserPermissionsForTargetAction = async (permissionTargetName: string, permissionTargetId: number): Promise<UserPermissionDTO[]> => {
    const dbUserPermissions = await db
        .select()
        .from(userPermissions)
        .where(
            and(eq(userPermissions.permissionTargetName, permissionTargetName),
                eq(userPermissions.permissionTargetId, permissionTargetId))
        );
    return dbUserPermissions.map(dbUserPermission => ({
        userId: dbUserPermission.userId,
        permissionTargetName: dbUserPermission.permissionTargetName,
        permissionTargetId: dbUserPermission.permissionTargetId,
        permission: dbUserPermission.permission
    }));
}


export const getActivityLogsForCurrentUserAction = async (): Promise<ActivityLogDTO[]> => {

    const user = await getCurrentUserAction();
    if (!user) {
        return [];
    }

    const dbActivityLogs = await db
        .select()
        .from(activityLogs)
        .where(
            eq(activityLogs.userId, user.id)
        )
        .orderBy(desc(activityLogs.createdAt));

    return dbActivityLogs.map(dbActivityLog => ({
        id: dbActivityLog.id,
        userId: dbActivityLog.userId,
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

export const getSubscriptionUsersForSubscriptionAction = async (subscriptionId: number): Promise<RZUser[]> => {
    const permissions = await getUserPermissionsForTargetAction("subscription", subscriptionId);
    const userIds = permissions.map(permission => permission.userId);

    const dbUsers = await db.select({
        id: users.id,
        firebaseUserId: users.firebaseUserId,
        name: users.name,
        description: users.description,
        email: users.email,
        imageUrl: users.imageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        is_enabled: users.is_enabled,
    }).from(users).where(inArray(users.id, userIds));
    return dbUsers.map(dbUser => ({
        ...dbUser,
        userType: RZUserType.AUTH_USER
    }));
}

export const getSubscriptionsForCurrentUserAction = async (): Promise<Subscription[]> => {

    const user = await getCurrentUserAction();
    if (!user) {
        throw new Error("No user found");
    }

    const permission = await getUserPermissionsForCurrentUserAction();
    if (!permission || permission.length === 0) {
        return [];
    }
    const subscriptionIds = permission.filter(p => p.permissionTargetName === "subscription").map(p => p.permissionTargetId);

    const dbSubscriptions = await db.select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        status: subscriptions.status,
        stripeCustomerId: subscriptions.stripeCustomerId,
        stripeProductId: subscriptions.stripeProductId,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripePlanName: subscriptions.stripePlanName,
        stripeSubscriptionStatus: subscriptions.stripeSubscriptionStatus,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt
    }).from(subscriptions).where(inArray(subscriptions.id, subscriptionIds)).limit(1);
    return dbSubscriptions;
}

export const getSubscriptionForCurrentUserAction = async (subscriptionId: number): Promise<Subscription | null> => {

    const user = await getCurrentUserAction();
    if (!user) {
        throw new Error("No user found");
    }

    const permission = await checkViewUserPermission(user.id, "subscription", subscriptionId);
    if (!permission) {
        return null;
    }

    const dbSubscriptions = await db.select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        status: subscriptions.status,
        stripeCustomerId: subscriptions.stripeCustomerId,
        stripeProductId: subscriptions.stripeProductId,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripePlanName: subscriptions.stripePlanName,
        stripeSubscriptionStatus: subscriptions.stripeSubscriptionStatus,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt
    }).from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
    return dbSubscriptions.length > 0 ? dbSubscriptions[0] : null;
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



