import { nobody, RZChannel, RZStation, RZUser } from "@/components/webplayer/data/model";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { addChannelToStationAction, createStationForUserAction, getActivityLogsForCurrentUserAction, getStationChannelsForCurrentUserAction, getStationForCurrentUserAction, getStationsForCurrentUserAction, getSubscriptionForCurrentUserAction, getSubscriptionsForCurrentUserAction, getSubscriptionUsersForSubscriptionAction, getUser, getUserPermissionsForCurrentUserAction, updateStationForUserAction, upsertUserAction } from "../db/actions";
import { useNotification } from '@/components/webplayer/providers/NotificationProvider';

export const queryKeys = {
    // Base keys
    all: ['all'] as const,

    // User related keys
    user: {
        current: () => [...queryKeys.all, 'current'] as const,
        allForSubscription: (subscriptionId: number) => [...queryKeys.user.current(), 'allForSubscription', subscriptionId] as const,
    },

    userPermissions: {
        current: () => [...queryKeys.all, 'current'] as const,
    },

    // Station related keys
    station: {
        root: () => [...queryKeys.all, 'stations'] as const,
        allForCurrentUser: () => [...queryKeys.station.root(), 'allForCurrentUser'] as const,
        byId: (id: number) => [...queryKeys.station.root(), id] as const,
    },

    channel: {
        root: () => [...queryKeys.all, 'channels'] as const,
        allForCurrentUser: () => [...queryKeys.channel.root(), 'allForCurrentUser'] as const,
        byStationId: (id: number) => [...queryKeys.channel.root(), "byStationId", id] as const,
        available: () => [...queryKeys.channel.root(), "available"] as const,
    },

    // Subscription related keys
    subscription: {
        root: () => [...queryKeys.all, 'subscription'] as const,
        allForCurrentUser: () => [...queryKeys.subscription.root(), 'allForCurrentUser'] as const,
        byId: (id: number) => [...queryKeys.subscription.root(), id] as const,
    },

    // Activity related keys
    activity: {
        all: () => [...queryKeys.all, 'activities'] as const,
        byId: (id: number) => [...queryKeys.activity.all(), id] as const,
    },
};


export function useCurrentUserSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.user.current(),
        queryFn: getUser,
    });
}

export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.user.current(),
        queryFn: getUser,
    });
}

export function useCurrentUserPermissionsSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.userPermissions.current(),
        queryFn: getUserPermissionsForCurrentUserAction,
    });
}

export function useUserActivitiesSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.activity.all(),
        queryFn: getActivityLogsForCurrentUserAction,
    });
}

export function useUserSubscriptionsSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.subscription.allForCurrentUser(),
        queryFn: getSubscriptionsForCurrentUserAction,
    });
}

export function useUserSubscriptionSuspense(subscriptionId: number) {
    return useSuspenseQuery({
        queryKey: queryKeys.subscription.byId(subscriptionId),
        queryFn: () => getSubscriptionForCurrentUserAction(subscriptionId),
    });
}

export function useSubscriptionUsersSuspense(subscriptionId: number) {
    return useSuspenseQuery({
        queryKey: queryKeys.user.allForSubscription(subscriptionId),
        queryFn: () => getSubscriptionUsersForSubscriptionAction(subscriptionId),
    });
}

export function useUserStationsSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.station.allForCurrentUser(),
        queryFn: getStationsForCurrentUserAction,
    });
}


export function useUserStationSuspense({ id }: { id: number }) {
    return useSuspenseQuery({
        queryKey: queryKeys.station.byId(id),
        queryFn: async () => await getStationForCurrentUserAction(id),
    });
}

export function useUserStationChannelsSuspense({ id }: { id: number }) {
    return useSuspenseQuery({
        queryKey: queryKeys.channel.byStationId(id),
        queryFn: async () => await getStationChannelsForCurrentUserAction(id),
    });
}

// Mutation hooks
export function useCreateUserStation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createStationForUserAction,
        onSuccess: (station) => {
            queryClient.setQueryData<RZStation>(queryKeys.station.byId(station.id), station);
            queryClient.invalidateQueries({ queryKey: queryKeys.station.allForCurrentUser() });
        },
    });
}

// Mutation hooks
export function useUpdateUserStation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStationForUserAction,
        onSuccess: (station) => {
            queryClient.setQueryData<RZStation>(queryKeys.station.byId(station.id), station);
        },
    });
}

export function useAddChannelToStation() {
    const queryClient = useQueryClient();
    const { showInfo, showAlert } = useNotification();

    return useMutation({
        mutationFn: async ({ stationId, channelId }: { stationId: number, channelId: number }) => {
            return addChannelToStationAction(stationId, channelId);
        },
        onSuccess: (_, { stationId }) => {
            // Invalidate the station channels query to refetch the updated list
            queryClient.invalidateQueries({ queryKey: queryKeys.channel.byStationId(stationId) });
            showInfo("Channel added to station successfully");
        },
        onError: (error) => {
            console.error("Error adding channel to station:", error);
            showAlert(error instanceof Error ? error.message : "Failed to add channel to station");
        },
    });
}


// Mutation hooks
export function useUpsertUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertUserAction,
        onSuccess: (newUser) => {
            // Update the users list cache
            queryClient.setQueryData<RZUser>(queryKeys.user.current(), newUser);
            // Invalidate to refetch from server
            queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
        },
    });
}

export function useResetUser() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.setQueryData<RZUser>(queryKeys.user.current(), nobody());
    };
}