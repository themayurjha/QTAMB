import { useState, useEffect, useRef } from 'react';
import { Heart, Send, LogOut, Menu, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  
  const setUser = useAuthStore((state) => state.setUser);
  const messages = useAuthStore((state) => state.messages);
  const addMessage = useAuthStore((state) => state.addMessage);
  const dailyQuestionsCount = useAuthStore((state) => state.dailyQuestionsCount);
  const subscription = useAuthStore((state) => state.subscription);
  const setDailyQuestionsCount = useAuthStore((state) => state.setDailyQuestionsCount);
  const incrementQuestionCount = useAuthStore((state) => state.incrementQuestionCount);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCategories &&
        categoryMenuRef.current &&
        categoryButtonRef.current &&
        !categoryMenuRef.current.contains(event.target as Node) &&
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategories]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Fetch question count
        const { data: questionData, error: questionError } = await supabase
          .from('user_questions')
          .select('count')
          .eq('user_id', user.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .single();

        if (!questionError && questionData) {
          setDailyQuestionsCount(questionData.count);
        }

        // Fetch subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('status, plan, valid_until')
          .eq('user_id', user.id)
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
      const question = await generateQuestion(selectedCategory, context);
      
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
      trackEvent('question_generated', { 
        category: selectedCategory,
        has_context: Boolean(context).toString()
      });
      setShowCategories(false); // Hide categories after generating question
    } catch (error) {
      console.error('Error generating question:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to generate question. Please try again.');
      }
      trackEvent('question_error', { category: selectedCategory });
    } finally {
      setIsLoading(false);
    }
  };

  const remainingQuestions = subscription?.status === 'active' 
    ? '∞' 
    : Math.max(0, FREE_DAILY_LIMIT - dailyQuestionsCount);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="border-b bg-white sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-pink-600" />
              <span className="text-xl font-bold text-gray-900">AskBoyfriend</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-600">
                {subscription?.status === 'active' ? (
                  <span className="text-pink-600 font-medium">Premium Member</span>
                ) : (
                  `${remainingQuestions} free questions remaining today`
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="sm:hidden border-t bg-white p-4">
              <div className="text-sm text-gray-600 mb-3">
                {subscription?.status === 'active' ? (
                  <span className="text-pink-600 font-medium">Premium Member</span>
                ) : (
                  `${remainingQuestions} free questions remaining today`
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
          <div className="flex-1 flex flex-col min-h-[calc(100vh-16rem)]">
            <div className="flex-1 bg-white rounded-lg border p-4 mb-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-center px-4">
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

            <div className="space-y-3">
              <textarea
                placeholder="Optional: Add context about your relationship to get more personalized questions..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                rows={2}
              />

              <div className="relative">
                <Button
                  ref={categoryButtonRef}
                  className="w-full mb-2"
                  variant="outline"
                  onClick={() => setShowCategories(!showCategories)}
                >
                  {selectedCategory || 'Select Category'}
                  {showCategories ? (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  )}
                </Button>

                {/* Categories Bottom Sheet */}
                {showCategories && (
                  <div
                    ref={categoryMenuRef}
                    className="absolute bottom-full left-0 right-0 bg-white border rounded-lg shadow-lg mb-2 max-h-60 overflow-y-auto z-20"
                  >
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategories(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedCategory === category ? 'bg-pink-50 text-pink-700' : ''
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedCategory || isLoading}
                  onClick={handleGetQuestion}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Get Question'}
                </Button>
              </div>
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