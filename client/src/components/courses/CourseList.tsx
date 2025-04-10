tsx
import React from 'react';
import { Course } from '../../types/Course';
import Link from 'next/link';
import { Box } from '@mui/material';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Link href={`/courses/${course._id}`}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '300px',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <img
          src={`/images/courses/${course.coverImage}`}
          alt={course.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
        />
        <Box p={2}>
          <Box
            sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#333',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {course.title}
          </Box>
          <Box sx={{ color: '#666', fontSize: '0.9rem' }}>
            {course.description}
          </Box>
        </Box>
      </Box>
    </Link>
  );
};

export default CourseCard;