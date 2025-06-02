'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { getSubscriptionsForCurrentUserAction } from '../db/actions';


export const checkoutAction = async (planId: string) => {
  const subscriptions = await getSubscriptionsForCurrentUserAction();
  // if (!subscriptions || subscriptions.length === 0) {
  //   redirect('/pricing');
  // }
  await createCheckoutSession({ subscription: subscriptions[0], planId });
};

export const customerPortalAction = async () => {
  const subscriptions = await getSubscriptionsForCurrentUserAction();
  if (!subscriptions || subscriptions.length === 0) {
    redirect('/pricing');
  }
  const portalSession = await createCustomerPortalSession(subscriptions[0]);
  redirect(portalSession.url);
};
