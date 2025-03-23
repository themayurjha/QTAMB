import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-pink-600" />
            <span className="text-xl font-bold text-gray-900">AskBoyfriend</span>
          </div>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate('/login')}>Log in</Button>
            <Button onClick={() => navigate('/signup')}>Sign up</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Questions to Ask Your Boyfriend
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get creative, deep, and fun questions powered by AI to strengthen your relationship
          and spark meaningful conversations.
        </p>
        <Button size="lg" className="mb-12" onClick={() => navigate('/signup')}>
          Start Asking Questions
        </Button>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <MessageCircle className="h-10 w-10 text-pink-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Meaningful Conversations</h3>
            <p className="text-gray-600">
              Discover questions that lead to deeper understanding and connection.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <Heart className="h-10 w-10 text-pink-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Strengthen Your Bond</h3>
            <p className="text-gray-600">
              Build trust and intimacy with carefully crafted conversation starters.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <Sparkles className="h-10 w-10 text-pink-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered Magic</h3>
            <p className="text-gray-600">
              Get personalized questions based on your relationship dynamics.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions for Every Moment
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['Fun', 'Deep', 'Spicy', 'Cute', 'Future', 'Past', 'Dreams', 'Goals'].map(
              (category) => (
                <div
                  key={category}
                  className="bg-pink-50 p-4 rounded-lg text-center hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-gray-900">{category}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Deepen Your Connection?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Start with 3 free questions per day. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')}>Get Started Now</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-600" />
              <span className="font-medium">AskBoyfriend</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 AskBoyfriend. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;