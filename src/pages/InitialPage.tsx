import { Button } from '@/components/ui/button';
import { GraduationCap, Star, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function InitialPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCoursePlanner = () => {
    // TODO: Navigate to course planner page
    console.log('Navigate to Course Planner & AI');
  };

  const handleRatingSystem = () => {
    navigate('/rating');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content - centered buttons */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Course Planner & AI Button */}
            <Button
              onClick={handleCoursePlanner}
              className="h-64 w-full flex flex-col items-center justify-center space-y-4 text-xl font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <GraduationCap className="h-16 w-16" />
              <span className="text-center">Course Planner & AI</span>
            </Button>

            {/* Rating System Button */}
            <Button
              onClick={handleRatingSystem}
              className="h-64 w-full flex flex-col items-center justify-center space-y-4 text-xl font-semibold bg-accent hover:bg-accent/90 transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <Star className="h-16 w-16" />
              <span className="text-center">Rating System</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Logout button at bottom */}
      <div className="pb-8 flex justify-center">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
