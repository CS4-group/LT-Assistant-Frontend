import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, X } from 'lucide-react';

interface AddReviewPanelProps {
  itemName: string;
  onClose: () => void;
  onSubmit: (review: { rating: number; comment: string }) => void;
}

export function AddReviewPanel({ itemName, onClose, onSubmit }: AddReviewPanelProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = () => {
    onSubmit({ rating, comment });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative border-4 border-silver-300">
        <div className="bg-red-600 text-white p-6 rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-3xl font-bold">Add a review for {itemName}</h2>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <p className="mb-2 font-semibold text-gray-700">Your Rating</p>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  onClick={() => handleRating(i + 1)}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-2 font-semibold text-gray-700">Your Comment</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`What did you think of ${itemName}?`}
              rows={5}
              className="border-silver-300 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full text-lg py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl"
          >
            Submit Review
          </Button>
        </div>
      </div>
    </div>
  );
}
