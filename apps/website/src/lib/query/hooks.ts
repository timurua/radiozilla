import { nobody, RZStation, RZUser } from "@/components/webplayer/data/model";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createStationForUserAction, getActivityLogsForCurrentUserAction, getStationForCurrentUserAction, getStationsForCurrentUserAction, getUser, getUserPermissionsForCurrentUserAction, updateStationForUserAction, upsertUserAction } from "../db/actions";
import { getSubscriptionForCurrentUser } from "../db/client";

export const queryKeys = {
    // Base keys
    all: ['all'] as const,

    // User related keys
    user: {
        current: () => [...queryKeys.all, 'current'] as const,
    },

    userPermissions: {
        current: () => [...queryKeys.all, 'current'] as const,
    },

    // Station related keys
    station: {
        all: () => [...queryKeys.all, 'station'] as const,
        current: () => [...queryKeys.station.all(), 'current'] as const,
        byId: (id: number) => [...queryKeys.station.all(), id] as const,
    },

    // Subscription related keys
    subscription: {
        all: () => [...queryKeys.all, 'subscription'] as const,
        current: () => [...queryKeys.user.current(), 'currentSubscription'] as const,
        byId: (id: number) => [...queryKeys.subscription.all(), id] as const,
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

export function useUserSubscriptionSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.subscription.current(),
        queryFn: getSubscriptionForCurrentUser,
    });
}

export function useUserStationsSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.station.all(),
        queryFn: getStationsForCurrentUserAction,
    });
}


export function useUserStationSuspense({ id }: { id: number }) {
    return useSuspenseQuery({
        queryKey: queryKeys.station.byId(id),
        queryFn: async () => await getStationForCurrentUserAction(id),
    });
}

// Mutation hooks
export function useCreateUserStation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createStationForUserAction,
        onSuccess: (station) => {
            // Update the users list cache
            queryClient.setQueryData<RZStation>(queryKeys.station.current(), station);
            // Invalidate to refetch from server
            queryClient.invalidateQueries({ queryKey: queryKeys.station.current() });
        },
    });
}

// Mutation hooks
export function useUpdateUserStation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStationForUserAction,
        onSuccess: (station) => {
            // Update the users list cache
            queryClient.setQueryData<RZStation>(queryKeys.station.current(), station);
            // Invalidate to refetch from server
            queryClient.invalidateQueries({ queryKey: queryKeys.station.current() });
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