import { useState, useEffect } from 'react';
import { Heart, Send, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { SubscriptionModal } from '@/components/subscription-modal';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { generateQuestion } from '@/lib/openai';
import { trackEvent } from '@/lib/analytics';

const categories = ['Fun', 'Deep', 'Spicy', 'Cute', 'Future', 'Past', 'Dreams', 'Goals'];
const FREE_DAILY_LIMIT = 3;

export function Chat() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setUser = useAuthStore((state) => state.setUser);
  const messages = useAuthStore((state) => state.messages);
  const addMessage = useAuthStore((state) => state.addMessage);
  const dailyQuestionsCount = useAuthStore((state) => state.dailyQuestionsCount);
  const subscription = useAuthStore((state) => state.subscription);
  const setDailyQuestionsCount = useAuthStore((state) => state.setDailyQuestionsCount);
  const incrementQuestionCount = useAuthStore((state) => state.incrementQuestionCount);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch question count
        const { data: questionData, error: questionError } = await supabase
          .from('user_questions')
          .select('count')
          .eq('user_id', supabase.auth.user()?.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .single();

        if (!questionError && questionData) {
          setDailyQuestionsCount(questionData.count);
        }

        // Fetch subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('status, plan, valid_until')
          .eq('user_id', supabase.auth.user()?.id)
          .single();

        if (!subscriptionError && subscriptionData) {
          useAuthStore.getState().setSubscription({
            status: subscriptionData.status as 'active' | 'inactive',
            plan: subscriptionData.plan as 'free' | 'premium',
            validUntil: subscriptionData.valid_until ? new Date(subscriptionData.valid_until) : null
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    trackEvent('user_sign_out');
    navigate('/');
  };

  const handleGetQuestion = async () => {
    if (!selectedCategory) return;
    setError(null);

    if (dailyQuestionsCount >= FREE_DAILY_LIMIT && (!subscription || subscription.status !== 'active')) {
      setShowSubscriptionModal(true);
      trackEvent('subscription_prompt_shown');
      return;
    }
    
    setIsLoading(true);
    try {
      const question = await generateQuestion(selectedCategory);
      
      // Update question count in database
      const { data, error } = await supabase.rpc('increment_question_count');
      
      if (error) throw error;
      
      addMessage({
        id: Date.now().toString(),
        content: question,
        category: selectedCategory,
        timestamp: Date.now()
      });
      
      incrementQuestionCount();
      trackEvent('question_generated', { category: selectedCategory });
    } catch (error) {
      console.error('Error generating question:', error);
      setError('Failed to generate question. Please try again.');
      trackEvent('question_error', { category: selectedCategory });
    } finally {
      setIsLoading(false);
    }
  };

  const remainingQuestions = subscription?.status === 'active' 
    ? '∞' 
    : Math.max(0, FREE_DAILY_LIMIT - dailyQuestionsCount);

  const setUser = useAuthStore((state) => state.setUser);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-pink-600" />
              <span className="text-xl font-bold text-gray-900">AskBoyfriend</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {subscription?.status === 'active' ? (
                  <span className="text-pink-600 font-medium">Premium Member</span>
                ) : (
                  `${remainingQuestions} free questions remaining today`
                )}
                3 free questions remaining today
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 flex gap-6">
          <div className="w-64 space-y-4">
            <h2 className="font-semibold text-gray-900">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-pink-100 text-pink-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-white rounded-lg border p-4 mb-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a category and get your first question
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="bg-pink-50 p-4 rounded-lg"
                    >
                      <div className="text-sm text-pink-600 mb-1">
                        {message.category}
                      </div>
                      <div className="text-gray-900">
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="flex-1 bg-white rounded-lg border p-4 mb-4">
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a category and start asking questions
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button
                className="flex-1"
                disabled={!selectedCategory || isLoading}
                onClick={handleGetQuestion}
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Generating...' : 'Get Question'}
              <Button className="flex-1" disabled={!selectedCategory}>
                <Send className="w-4 h-4 mr-2" />
                Get Question
              </Button>
            </div>
          </div>
        </main>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </div>
    </AuthGuard>
  );
}