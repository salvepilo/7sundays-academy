import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import AdminLayout from '@/components/layout/AdminLayout';

export default function ViewCourseLessons() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`);
      setCourse(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1>Course Lessons</h1>
      {course ? (
        <div>
          <h2>{course.name}</h2>
          <Link href={`/admin/dashboard/lessons/create?courseId=${id}`}>
            <button>Create Lesson</button>
          </Link>
          <h3>Lessons:</h3>
          {course.lessons && course.lessons.length > 0 ? (
            <ul>
              {course.lessons.map((lessonId) => (
                <li key={lessonId}>
                  <Link href={`/admin/dashboard/lessons/${lessonId}/edit`}>
                    Lesson {lessonId}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons found for this course.</p>
          )}
        </div>
      ) : <div>Course not found</div>}
    </AdminLayout>
  );
}