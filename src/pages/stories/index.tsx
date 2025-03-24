import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface WebStory {
  id: string;
  title: string;
  description: string;
  category: string;
  slug: string;
  published_at: string;
}

export function StoriesIndex() {
  const [stories, setStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('web_stories')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;
        setStories(data || []);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories');
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 text-pink-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-pink-600 hover:text-pink-700">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-pink-600" />
            <span className="text-xl font-bold text-gray-900">Questions to Ask Your Boyfriend</span>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Web Stories</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Link
              key={story.id}
              to={`/stories/${story.slug}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {story.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {story.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-pink-50 text-pink-600 px-2 py-1 rounded">
                    {story.category}
                  </span>
                  <span>
                    {format(new Date(story.published_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">No stories have been published yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}