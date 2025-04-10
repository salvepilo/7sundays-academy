import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import useLessons from '../../hooks/useLessons';

interface Lesson {
  _id: string;
  title: string;
  description: string;
}

interface LessonTableProps {
  lessons: Lesson[];
}

const LessonTable: React.FC<LessonTableProps> = ({ lessons }) => {
  const { deleteLesson } = useLessons();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lessons
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow
                key={lesson._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {lesson._id}
                </TableCell>
                <TableCell>{lesson.title}</TableCell>
                <TableCell>{lesson.description}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => deleteLesson(lesson._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LessonTable;