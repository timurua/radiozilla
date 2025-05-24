'use client';

import { Suspense } from 'react';
import { useUserSubscriptionSuspense } from '@/lib/query/hooks';

export default function SubscriptionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SubscriptionPageInner />
        </Suspense>
    );
}

function SubscriptionPageInner() {
    const { data: subscription } = useUserSubscriptionSuspense();

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
                    <p>Admin User ID: {subscription.adminUserId}</p>
                    <p>Admin User Group ID: {subscription.adminUserGroupId}</p>
                    <p>Created At: {subscription.createdAt.toDateString()}</p>
                    <p>Updated At: {subscription.updatedAt.toDateString()}</p>
                </div>
            ) : (
                <p>No subscription found.</p>
            )}
        </div>
    );
}
