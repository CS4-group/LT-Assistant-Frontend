const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
}

export interface Club {
  _id: string;
  title: string;
  description: string;
}

export interface Teacher {
  _id: string;
  title: string;
  description: string;
}

export const api = {
  async fetchCourses(): Promise<Course[]> {
    console.log('🚀 Attempting to fetch courses from:', `${API_BASE_URL}/courses/course-ratings`);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/course-ratings`);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Course[]> = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        console.log('✅ Successfully fetched', data.data.length, 'courses');
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw error;
    }
  },

  // Placeholder for clubs - you can implement similar endpoints later
  async fetchClubs(): Promise<Club[]> {
    // Return empty array for now, implement when you have the endpoint
    return [];
  },

  // Placeholder for teachers - you can implement similar endpoints later  
  async fetchTeachers(): Promise<Teacher[]> {
    // Return empty array for now, implement when you have the endpoint
    return [];
  }
};
