import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import useUsers from '../../hooks/useUsers';

interface User {
  _id?: string;
  email: string;
  role: string;
}

interface UserFormProps {
  user?: User;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const { createUser, updateUser } = useUsers();
  const [formData, setFormData] = useState<User>({
    email: '',
    role: 'user',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        role: user.role,
      });
    } else {
      setFormData({
        email: '',
        role: 'user',
      });
    }
  }, [user]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (user) {
      await updateUser({ ...formData, _id: user._id });
    } else {
      await createUser(formData);
    }
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5">
        {user ? 'Update User' : 'Create User'}
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="role"
        label="Role"
        id="role"
        value={formData.role}
        onChange={handleChange}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        {user ? 'Update' : 'Create'}
      </Button>
    </Box>
  );
};

export default UserForm;