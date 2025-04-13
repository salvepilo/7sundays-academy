import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  price: number;
  requirements: string[];
  objectives: string[];
  status: 'draft' | 'published';
  totalEnrollments: number;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
}

// Create a new course
export const createCourse = async (formData: FormData) => {
  const response = await axios.post(`${API_URL}/courses`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get all courses
export const getCourses = async (params?: {
  category?: string;
  level?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await axios.get(`${API_URL}/courses`, { params });
  return response.data;
};

// Get a single course
export const getCourse = async (id: string) => {
  const response = await axios.get(`${API_URL}/courses/${id}`);
  return response.data;
};

// Update a course
export const updateCourse = async (id: string, formData: FormData) => {
  const response = await axios.put(`${API_URL}/courses/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a course
export const deleteCourse = async (id: string) => {
  const response = await axios.delete(`${API_URL}/courses/${id}`);
  return response.data;
};

// Enroll in a course
export const enrollInCourse = async (id: string, paymentMethodId?: string) => {
  const response = await axios.post(`${API_URL}/courses/${id}/enroll`, {
    paymentMethodId,
  });
  return response.data;
};

// Get enrolled courses
export const getEnrolledCourses = async (params = {}) => {
  const response = await axios.get(`${API_URL}/courses/enrolled/my`, { params });
  return response.data;
};

// Update course progress
export const updateCourseProgress = async (id: string, lessonId: string, completed: boolean) => {
  const response = await axios.patch(`${API_URL}/courses/${id}/progress`, {
    lessonId,
    completed,
  });
  return response.data;
};

// Generate certificate
export const generateCertificate = async (id: string) => {
  const response = await axios.get(`${API_URL}/courses/${id}/certificate`);
  return response.data;
};

// Add lesson to course
export const addLessonToCourse = async (courseId: string, sectionId: string, lessonData: any) => {
  const response = await axios.post(
    `${API_URL}/courses/${courseId}/lessons/${sectionId}`,
    lessonData
  );
  return response.data;
};

// Remove lesson from course
export const removeLessonFromCourse = async (courseId: string, lessonId: string) => {
  const response = await axios.delete(
    `${API_URL}/courses/${courseId}/lessons/${lessonId}`
  );
  return response.data;
};

// Publish course
export const publishCourse = async (id: string) => {
  const response = await axios.patch(`${API_URL}/courses/${id}/publish`);
  return response.data;
};

// Get course stats
export const getCourseStats = async () => {
  const response = await axios.get(`${API_URL}/courses/stats/dashboard`);
  return response.data;
};

export const toggleCourseStatus = async (id: string) => {
  const response = await axios.patch(`${API_URL}/courses/${id}/status`);
  return response.data;
}; 