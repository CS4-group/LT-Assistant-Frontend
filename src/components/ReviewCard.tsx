import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserAvatar } from '@/components/UserAvatar';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: {
    user: {
      name: string;
      avatarUrl: string;
    };
    rating: number;
    comment: string;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card
      className="transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-102 cursor-pointer"
    >
      <CardHeader className="flex flex-row items-center space-x-4">
        <UserAvatar src={review.user.avatarUrl} alt={review.user.name} />
        <div>
          <p className="font-semibold">{review.user.name}</p>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{review.comment}</p>
      </CardContent>
    </Card>
  );
}
