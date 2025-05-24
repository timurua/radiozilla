import { nobody, RZUser } from "@/components/webplayer/data/model";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getActivityLogsForUserAction, getUser, upsertUserAction } from "../db/actions";
import { getSubscriptionForCurrentUser } from "../db/client";

export const userKeys = {
    all: ['users'] as const,
    current: () => [...userKeys.all, 'current'] as const,
    currentSubscription: () => [...userKeys.current(), 'currentSubscription'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: string) => [...userKeys.lists(), { filters }] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: number) => [...userKeys.details(), id] as const,
    activities: () => [...userKeys.all, 'activities'] as const,
    activity: (id: number) => [...userKeys.activities(), id] as const,
    subscription: () => [...userKeys.all, 'subscription'] as const,
    subscriptionId: (id: number) => [...userKeys.subscription(), id] as const,
};


export function useUserSuspense() {
    return useSuspenseQuery({
        queryKey: userKeys.current(),
        queryFn: getUser,
    });
}

export function useUser() {
    return useQuery({
        queryKey: userKeys.current(),
        queryFn: getUser,
    });
}

export function useUserActivitiesSuspense() {
    return useSuspenseQuery({
        queryKey: userKeys.activities(),
        queryFn: getActivityLogsForUserAction,
    });
}

export function useUserSubscriptionSuspense() {
    return useSuspenseQuery({
        queryKey: userKeys.currentSubscription(),
        queryFn: getSubscriptionForCurrentUser,
    });
}

// Mutation hooks
export function useUpsertUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertUserAction,
        onSuccess: (newUser) => {
            // Update the users list cache
            queryClient.setQueryData<RZUser>(userKeys.current(), newUser);
            // Invalidate to refetch from server
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
        },
    });
}

export function useResetUser() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.setQueryData<RZUser>(userKeys.current(), nobody());
    };
}