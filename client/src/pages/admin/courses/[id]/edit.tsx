import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../../components/layout/AdminLayout';
import { getCourse, updateCourse } from '../../../../lib/api/courses';

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  requirements: string;
  objectives: string;
  thumbnail?: FileList;
}

export default function EditCourse() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CourseFormData>();

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const course = await getCourse(id as string);
      
      // Set form values
      Object.keys(course).forEach(key => {
        setValue(key as keyof CourseFormData, course[key]);
      });
    } catch (error) {
      toast.error('Error fetching course');
      router.push('/admin/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(data).forEach(key => {
        if (key !== 'thumbnail') {
          formData.append(key, data[key as keyof CourseFormData] as string);
        }
      });

      // Handle thumbnail upload
      if (data.thumbnail?.[0]) {
        formData.append('thumbnail', data.thumbnail[0]);
      }

      await updateCourse(id as string, formData);
      toast.success('Course updated successfully');
      router.push('/admin/courses');
    } catch (error) {
      toast.error('Error updating course');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                {...register('thumbnail')}
                className="mt-1 block w-full"
              />
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Course Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="design">Design</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select
                  {...register('level', { required: 'Level is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>}
              </div>
            </div>
          </div>

          {/* Requirements and Objectives */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Requirements & Objectives</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                <textarea
                  {...register('requirements')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter course requirements (one per line)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Learning Objectives</label>
                <textarea
                  {...register('objectives')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter learning objectives (one per line)"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Course'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 