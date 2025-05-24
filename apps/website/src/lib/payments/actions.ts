'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { getSubscriptionForCurrentUser } from '../db/client';
import { getSubscriptionForCurrentUserAction } from '../db/actions';


export const checkoutAction = async (formData: FormData) => {
  const priceId = formData.get('priceId') as string;
  const subscription = await getSubscriptionForCurrentUser();
  if (!subscription) {
    redirect('/pricing');
  }
  await createCheckoutSession({ subscription, priceId });
};

export const customerPortalAction = async () => {
  const subscription = await getSubscriptionForCurrentUserAction();
  if (!subscription) {
    redirect('/pricing');
  }
  const portalSession = await createCustomerPortalSession(subscription);
  redirect(portalSession.url);
};
