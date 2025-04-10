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
import useCareers from '../../hooks/useCareers';

interface Career {
  _id: string;
  title: string;
  company: string;
  location: string;
  // Add other properties as needed
}

interface CareerTableProps {
  careers: Career[];
}

const CareerTable: React.FC<CareerTableProps> = ({ careers }) => {
  const { deleteCareer } = useCareers();

  const handleDelete = async (id: string) => {
    await deleteCareer(id);
  };

  return (
    <Box>
      <Typography variant="h4" component="div">
        Careers
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {careers.map((career) => (
              <TableRow
                key={career._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {career._id}
                </TableCell>
                <TableCell>{career.title}</TableCell>
                <TableCell>{career.company}</TableCell>
                <TableCell>{career.location}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDelete(career._id)}>
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

export default CareerTable;