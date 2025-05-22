'use client';

import { useAuth } from '@/lib/auth/provider';
import { useState, useEffect } from 'react';
import { getSubscriptionByUserId } from '@/lib/db/client';
import { Subscription } from '@/lib/db/schema';

export default function SubscriptionPage() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        if (user) {
            getSubscriptionByUserId(user.id).then(setSubscription);
        }
    }, [user]);

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
