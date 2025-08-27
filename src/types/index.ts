// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Meeting types (simplified for school project)
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Dashboard types
export interface DashboardStats {
  totalMeetings: number;
  upcomingMeetings: number;
  completedMeetings: number;
  totalUsers: number;
}
