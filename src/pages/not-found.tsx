import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <Heart className="h-16 w-16 text-pink-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl text-gray-600 mb-6">Page not found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Oops! The page you're looking for doesn't exist. Let's get you back to asking meaningful questions.
          </p>
          <Button asChild>
            <Link to="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}