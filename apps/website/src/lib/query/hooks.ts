import { nobody, RZUser } from "@/components/webplayer/data/model";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getActivityLogsForUserAction, getOrCreateStationForUserAction, getUser, upsertUserAction } from "../db/actions";
import { getSubscriptionForCurrentUser } from "../db/client";

export const queryKeys = {
    all: ['users'] as const,
    current: () => [...queryKeys.all, 'current'] as const,
    currentSubscription: () => [...queryKeys.current(), 'currentSubscription'] as const,
    lists: () => [...queryKeys.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.lists(), { filters }] as const,
    details: () => [...queryKeys.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.details(), id] as const,
    activities: () => [...queryKeys.all, 'activities'] as const,
    activity: (id: number) => [...queryKeys.activities(), id] as const,
    subscription: () => [...queryKeys.all, 'subscription'] as const,
    subscriptionId: (id: number) => [...queryKeys.subscription(), id] as const,
    station: () => [...queryKeys.all, 'station'] as const,
    stationId: (id: number) => [...queryKeys.station(), id] as const,
    currentUserStation: () => [...queryKeys.station(), 'current'] as const,
};


export function useUserSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.current(),
        queryFn: getUser,
    });
}

export function useUser() {
    return useQuery({
        queryKey: queryKeys.current(),
        queryFn: getUser,
    });
}

export function useUserActivitiesSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.activities(),
        queryFn: getActivityLogsForUserAction,
    });
}

export function useUserSubscriptionSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.currentSubscription(),
        queryFn: getSubscriptionForCurrentUser,
    });
}

export function useUserStationSuspense() {
    return useSuspenseQuery({
        queryKey: queryKeys.currentUserStation(),
        queryFn: getOrCreateStationForUserAction,
    });
}

// Mutation hooks
export function useUpsertUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertUserAction,
        onSuccess: (newUser) => {
            // Update the users list cache
            queryClient.setQueryData<RZUser>(queryKeys.current(), newUser);
            // Invalidate to refetch from server
            queryClient.invalidateQueries({ queryKey: queryKeys.current() });
        },
    });
}

export function useResetUser() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.setQueryData<RZUser>(queryKeys.current(), nobody());
    };
}