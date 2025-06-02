'use client';

import { useUserSubscriptionsSuspense, useUserSubscriptionSuspense } from '@/lib/query/hooks';
import { Suspense } from 'react';

interface SubscriptionPageProps {
    params: {
        id: string;
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function SubscriptionPage({ params }: SubscriptionPageProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SubscriptionPageInner subscriptionId={params.id} />
        </Suspense>
    );
}

function SubscriptionPageInner({ subscriptionId }: { subscriptionId: string }) {
    const { data: subscription } = useUserSubscriptionSuspense(Number(subscriptionId));

    return (
        <div>
            <h2>Subscription</h2>
            {subscription ? (
                <div>
                    <p>Plan: {subscription.planId}</p>
                    <p>Stripe Subscription Status: {subscription.stripeSubscriptionStatus}</p>
                    <p>Stripe Subscription ID: {subscription.stripeSubscriptionId}</p>
                    <p>Stripe Customer ID: {subscription.stripeCustomerId}</p>
                    <p>Stripe Product ID: {subscription.stripeProductId}</p>
                    <p>Stripe Plan Name: {subscription.stripePlanName}</p>
                    <p>Created At: {subscription.createdAt.toDateString()}</p>
                    <p>Updated At: {subscription.updatedAt.toDateString()}</p>
                </div>
            ) : (
                <p>No subscription found.</p>
            )}
        </div>
    );
}
