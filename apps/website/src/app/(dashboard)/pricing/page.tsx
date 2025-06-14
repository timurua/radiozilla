import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';

// Prices are fresh for one hour max
export const revalidate = 3600;

interface PricingPlan {
  planId: string;
  name: string;
  price: number;
}

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const plans = [];

  const basePlan = products.find((product) => product.name.includes('Base'));
  const plusPlan = products.find((product) => product.name.includes('Plus'));

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground mt-3 text-center max-w-xl">
          Choose the plan that works best for your team. All plans include a free trial.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCard
          name={'Free'}
          price={0}
          interval={'month'}
          trialDays={365}
          features={[
            'Unlimited Usage',
            'One Workspace Member',
            'Web Scraping',
            'Wiki Integration',
          ]}
          priceId={""}
        />
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            'Everything in Free',
            'Unlimited Workspace Members',
            'Web Scraping',
            'Slack Integration',
            'GitHub Integration',
            'Wiki Integration',
          ]}
          priceId={basePrice?.id}
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base',
            'Voice Drill Down Agent',
          ]}
          priceId={plusPrice?.id}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-primary mb-2">{name}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-primary mb-6">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-muted-foreground">
          per user / {interval}
        </span>
      </p>
      <p className="text-4xl font-medium text-primary mb-6">
        <form action={checkoutAction}>
          <input type="hidden" name="priceId" value={priceId} />
          <SubmitButton />
        </form>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-5 w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
