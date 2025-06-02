'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { Suspense } from 'react';
import { Subscription } from '@/lib/db/schema';
import { RZUser } from '@/components/webplayer/data/model';
import { useSubscriptionUsersSuspense, useUserSubscriptionsSuspense } from '@/lib/query/hooks';

export default function SubscriptionsPage() {
    return <Suspense fallback={<div>Loading...</div>}>
        <Subscriptions />
    </Suspense>
}

function Subscriptions() {

    const { data: subscriptions } = useUserSubscriptionsSuspense();

    if (subscriptions.length === 0) {
        return (
            <section className="flex-1 p-4 lg:p-8">
                <h1 className="text-lg lg:text-2xl font-medium mb-6 text-black dark:text-white">No Subscriptions Found</h1>
            </section>
        );
    }

    return (<>
        {subscriptions.map((subscription) => (
            <section className="flex-1 p-4 lg:p-8">
                <h1 className="text-lg lg:text-2xl font-medium mb-6 text-black dark:text-white">Subscription Settings</h1>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-black dark:text-white">Subscription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="mb-4 sm:mb-0">
                                    <p className="font-medium text-black dark:text-white">
                                        Current Plan: {subscription?.stripePlanName || 'Free'}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {subscription?.stripeSubscriptionStatus === 'active'
                                            ? 'Billed monthly'
                                            : subscription?.stripeSubscriptionStatus === 'trialing'
                                                ? 'Trial period'
                                                : 'No active subscription'}
                                    </p>
                                </div>
                                <form action={customerPortalAction}>
                                    <Button type="submit" variant="outline" className="border-gray-300 dark:border-gray-600 text-black dark:text-white">
                                        Manage Subscription
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Suspense fallback={<div>Loading Users...</div>}>
                    <TeamMembers subscription={subscription} />
                </Suspense>
            </section>
        )
        )}
    </>);
}

function TeamMembers({ subscription }: { subscription: Subscription }) {
    const { data: subscriptionUsers } = useSubscriptionUsersSuspense(subscription.id);

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-black dark:text-white">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {subscriptionUsers.map((user) => (
                        <li key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage
                                        src={`/placeholder.svg?height=32&width=32`}
                                        alt={user.name || ''}
                                    />
                                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
                                        {user.name?.split(' ')
                                            .map((n: string) => n[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-black dark:text-white">
                                        {user.name || ''}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {user.email || ''}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}