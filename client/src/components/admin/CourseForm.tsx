import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import useCourses from '../../hooks/useCourses';

interface CourseFormProps {
  course?: {
    _id: string;
    title: string;
    description: string;
  };
  onClose: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ course, onClose }) => {
  const { createCourse, updateCourse } = useCourses();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
    }
  }, [course]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (course) {
      await updateCourse(course._id, { title, description });
    } else {
      await createCourse({ title, description });
    }
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5">
        {course ? 'Update course' : 'Create course'}
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="title"
        label="Title"
        name="title"
        autoComplete="title"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="description"
        label="Description"
        type="text"
        id="description"
        autoComplete="description"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        {course ? 'Update course' : 'Create course'}
      </Button>
    </Box>
  );
};

export default CourseForm;