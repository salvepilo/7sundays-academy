tsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useRouter } from "next/router";
import React, { useState } from "react";
import axios from "axios";

const CreateLessonPage = () => {
  const router = useRouter();
  const { id: courseId } = router.query;
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/lessons", {
        title,
        videoUrls: [videoUrl],
      });

      if (response.status === 200) {
        const lessonId = response.data._id;
        await axios.post(`/courses/${courseId}/lessons/${lessonId}`);
        router.push(`/admin/dashboard/courses/${courseId}/lessons`);
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create Lesson</h1>
        <form className="max-w-md" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter lesson title"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="videoUrl"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Video URL
            </label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              type="url"
              id="videoUrl"
              multiple
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter video URL"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Lesson
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateLessonPage;