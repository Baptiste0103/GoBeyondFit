'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { authClient } from '@/lib/auth';

interface FavoriteButtonProps {
  exerciseId: string;
  className?: string;
}

export default function FavoriteButton({ exerciseId, className = '' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Check if exercise is favorited on mount
  useEffect(() => {
    const user = authClient.getUser();
    const token = authClient.getToken();
    
    if (!user || !token) return;

    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/exercises/${exerciseId}/is-favorite`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorite || false);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavorite();
  }, [exerciseId]);

  const handleToggleFavorite = async () => {
    const user = authClient.getUser();
    const token = authClient.getToken();

    if (!user || !token) {
      setFeedbackText('Please log in to add favorites');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/exercises/${exerciseId}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      const newFavoritedState = !isFavorited;
      setIsFavorited(newFavoritedState);
      
      setFeedbackText(newFavoritedState ? '❤️ Added to favorites' : '💔 Removed from favorites');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setFeedbackText('Error updating favorite. Please try again.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isFavorited
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          size={20}
          className={`transition-all duration-200 ${
            isFavorited ? 'fill-current' : ''
          }`}
        />
        <span className="hidden sm:inline">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      </button>

      {showFeedback && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-50 animate-in fade-in">
          {feedbackText}
        </div>
      )}
    </div>
  );
}
