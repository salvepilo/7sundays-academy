import React from 'react';
import Avatar from '@mui/material/Avatar';

interface UserAvatarProps {
  user: any;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  return (
    <Avatar
      alt={user.name || user.email || 'User'}
      src={user.avatarUrl || '/images/avatars/default.jpg'}
    />
  );
};

export default UserAvatar;