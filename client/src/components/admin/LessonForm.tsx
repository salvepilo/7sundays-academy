import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import useLessons from '../../hooks/useLessons';

interface Lesson {
  _id?: string;
  title: string;
  description: string;
  order: number;
  video: string;
}

interface LessonFormProps {
  lesson?: Lesson;
}

const LessonForm: React.FC<LessonFormProps> = ({ lesson }) => {
  const { createLesson, updateLesson } = useLessons();
  const [formData, setFormData] = useState<Lesson>({
    title: '',
    description: '',
    order: 0,
    video: '',
  });

  useEffect(() => {
    if (lesson) {
      setFormData(lesson);
    } else {
        setFormData({
            title: '',
            description: '',
            order: 0,
            video: '',
        });
    }
  }, [lesson]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lesson) {
      await updateLesson({ ...formData, _id: lesson._id });
    } else {
      await createLesson(formData);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {lesson ? 'Update lesson' : 'Create lesson'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          multiline
        />
        <TextField
          fullWidth
          margin="normal"
          label="Order"
          name="order"
          type='number'
          value={formData.order}
          onChange={handleChange}
          required
        />
         <TextField
          fullWidth
          margin="normal"
          label="Video"
          name="video"
          value={formData.video}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          {lesson ? 'Update' : 'Create'}
        </Button>
      </form>
    </Box>
  );
};

export default LessonForm;