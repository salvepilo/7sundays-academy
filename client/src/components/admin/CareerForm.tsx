import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import useCareers from '../../hooks/useCareers';

interface Career {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary: string;
  contactEmail: string;
  postedAt: string;
  deadline: string;
}

interface CareerFormProps {
  career?: Career;
  onClose?: () => void;
}

const CareerForm: React.FC<CareerFormProps> = ({ career, onClose }) => {
  const { createCareer, updateCareer } = useCareers();
  const [formData, setFormData] = useState<Career>({
    title: '',
    company: '',
    location: '',
    type: '',
    description: '',
    requirements: [],
    salary: '',
    contactEmail: '',
    postedAt: '',
    deadline: '',
  });

  useEffect(() => {
    if (career) {
      setFormData({ ...career });
    }
  }, [career]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (career) {
      await updateCareer({ ...formData, id: career.id });
    } else {
      await createCareer(formData);
    }
    if(onClose){
      onClose();
    }
  };

  return (
    <Box>
      <Typography variant="h6">
        {career ? 'Update career' : 'Create career'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          multiline
          rows={4}
        />
        <TextField
          label="Requirements"
          name="requirements"
          value={formData.requirements.join(', ')}
          onChange={(e) => setFormData({...formData, requirements: e.target.value.split(',')})}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Salary"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Contact Email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Posted At"
          name="postedAt"
          value={formData.postedAt}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          {career ? 'Update' : 'Create'}
        </Button>
      </form>
    </Box>
  );
};

export default CareerForm;