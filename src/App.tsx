import { Heart, MessageCircle, Sparkles, Menu } from 'lucide-react';
import { Button } from './components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function App() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b relative">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-pink-600" />
            <span className="text-xl font-bold text-gray-900">AskBoyfriend</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <Button variant="outline" onClick={() => navigate('/login')}>Log in</Button>
            <Button onClick={() => navigate('/signup')}>Sign up</Button>
          </div>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </nav>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b z-50">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button className="w-full" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Spark Meaningful Conversations with Your Boyfriend
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover thoughtful questions that lead to deeper connections, memorable conversations, and a stronger relationship with your boyfriend.
        </p>
        <Button size="lg" className="mb-12 w-full md:w-auto" onClick={() => navigate('/signup')}>
          Start Free Conversations
        </Button>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <MessageCircle className="h-10 w-10 text-pink-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Meaningful Conversations</h2>
            <p className="text-gray-600">
              Start conversations that matter and create lasting memories together.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <Heart className="h-10 w-10 text-pink-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Strengthen Your Bond</h2>
            <p className="text-gray-600">
              Build trust and understanding through carefully crafted conversation starters.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <Sparkles className="h-10 w-10 text-pink-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Personalized Topics</h2>
            <p className="text-gray-600">
              Get AI-powered questions tailored to your relationship journey.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6">
            Explore Conversation Topics
          </h2>
          <p className="text-center text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
            From light-hearted chats to deep discussions about your future together, find the perfect questions for every moment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
            {[
              'Getting to Know You',
              'Future Dreams',
              'Daily Life',
              'Shared Values',
              'Fun & Adventure',
              'Trust & Growth',
              'Memories & Past',
              'Life Goals'
            ].map((category) => (
              <div
                key={category}
                className="bg-pink-50 p-4 rounded-lg text-center hover:bg-pink-100 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-900">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border">
            <p className="text-base md:text-lg text-gray-700 italic mb-4">
              "These conversation starters helped me discover so many new things about my boyfriend. Our relationship has grown stronger with each meaningful discussion."
            </p>
            <p className="text-gray-600">- Sarah, using AskBoyfriend for 3 months</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Meaningful Conversations Today</h2>
          <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8">
            Join thousands of couples who are discovering new ways to connect and grow together.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="w-full md:w-auto">
            Try It Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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