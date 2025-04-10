import React from 'react';
import { Box, Typography, Avatar, Grid } from '@mui/material';
import { IUser } from '@/interfaces/user';

interface UserCardProps {
  user: IUser;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const getAvatarSrc = () => {
    return user.photo ? `images/avatars/${user.photo}` : `images/avatars/default.jpg`;
  };

  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid item>
        <Avatar
          alt={user.name}
          src={getAvatarSrc()}
          sx={{ width: 56, height: 56 }}
        />
      </Grid>
      <Grid item>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default UserCard;