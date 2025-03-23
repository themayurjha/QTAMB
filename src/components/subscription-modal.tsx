import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { trackEvent } from '@/lib/analytics';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Create a checkout session
      const { data: { sessionId, publicKey }, error } = await supabase
        .functions.invoke('create-checkout-session', {
          body: { userId: user?.id }
        });

      if (error) throw error;

      // Initialize Stripe
      const stripe = await loadStripe(publicKey);
      if (!stripe) throw new Error('Failed to load Stripe');

      // Redirect to checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });

      if (stripeError) throw stripeError;

      trackEvent('subscription_checkout_started');
    } catch (error) {
      console.error('Subscription error:', error);
      trackEvent('subscription_checkout_error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unlock Unlimited Questions</h2>
          <p className="text-gray-600">
            Continue having meaningful conversations with your boyfriend
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">$9/month</div>
            <ul className="text-left space-y-2 mb-4">
              <li className="flex items-center">
                <Heart className="h-4 w-4 text-pink-600 mr-2" />
                Unlimited questions per day
              </li>
              <li className="flex items-center">
                <Heart className="h-4 w-4 text-pink-600 mr-2" />
                Access to all categories
              </li>
              <li className="flex items-center">
                <Heart className="h-4 w-4 text-pink-600 mr-2" />
                Premium conversation starters
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}