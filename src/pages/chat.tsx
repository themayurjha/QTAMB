import { useState } from 'react';
import { Heart, Send, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

const categories = ['Fun', 'Deep', 'Spicy', 'Cute', 'Future', 'Past', 'Dreams', 'Goals'];

export function Chat() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
              <Button className="flex-1" disabled={!selectedCategory}>
                <Send className="w-4 h-4 mr-2" />
                Get Question
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}