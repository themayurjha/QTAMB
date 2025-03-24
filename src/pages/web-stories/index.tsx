import { useState, useEffect } from 'react';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
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

interface StoriesByCategory {
  [key: string]: WebStory[];
}

export function StoriesIndex() {
  const [stories, setStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('web_stories')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;
        setStories(data || []);
        // Initially expand all categories
        if (data) {
          const categories = new Set(data.map(story => story.category));
          setExpandedCategories(categories);
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories');
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  const storiesByCategory = stories.reduce<StoriesByCategory>((acc, story) => {
    if (!acc[story.category]) {
      acc[story.category] = [];
    }
    acc[story.category].push(story);
    return acc;
  }, {});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

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

        {Object.entries(storiesByCategory).length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">No stories have been published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(storiesByCategory).map(([category, categoryStories]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm border">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
                >
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-sm mr-3">
                      {categoryStories.length}
                    </span>
                    {category}
                  </h2>
                  {expandedCategories.has(category) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedCategories.has(category) && (
                  <div className="p-6 pt-2 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categoryStories.map((story) => (
                      <Link
                        key={story.id}
                        to={`/web-stories/${story.slug}`}
                        className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {story.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {story.description}
                        </p>
                        <div className="text-sm text-gray-500">
                          {format(new Date(story.published_at), 'MMM d, yyyy')}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}