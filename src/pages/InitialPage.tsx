import { Button } from '@/components/ui/button';
import { GraduationCap, Star, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function InitialPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCoursePlanner = () => {
    navigate('/planner');
  };

  const handleRatingSystem = () => {
    navigate('/rating');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background image + translucent overlay */}
      <div className="absolute inset-0 -z-10">
        <img src="/title-bg.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-white/65" />
      </div>
      {/* Header logo/title */}
      <div className="pt-16 md:pt-20 pb-10 flex flex-col items-center gap-8">
        <img src="/sift.png" alt="LT" className="h-24 md:h-28 w-auto drop-shadow mx-auto" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight text-center">LT Assistant</h1>
        <p className="text-sm text-gray-600">Plan your path and rate experiences</p>
      </div>

      {/* Main content - centered buttons */}
      <div className="flex-1 flex items-start justify-center px-6">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
            {/* Course Planner & AI Button */}
            <Button
              onClick={handleCoursePlanner}
              className="h-64 w-full flex flex-col items-center justify-center space-y-4 text-xl font-semibold bg-primary text-white hover:bg-primary/90 hover:text-primary hover:bg-primary/15 hover:border hover:border-primary/30 transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <GraduationCap className="h-16 w-16" />
              <span className="text-center">Course Planner & AI</span>
            </Button>

            {/* Rating System Button */}
            <Button
              onClick={handleRatingSystem}
              className="h-64 w-full flex flex-col items-center justify-center space-y-4 text-xl font-semibold bg-white text-primary border hover:bg-primary/10 transition-all duration-200 transform hover:scale-105"
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
