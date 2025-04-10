import Image from 'next/image';
import React from 'react';

interface UserAvatarProps {
  user?: any;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 40 }) => {
  const avatarUrl = user?.avatar || '/images/avatars/default.jpg';

  return (
    <Image
      src={avatarUrl}
      alt={user?.name || 'User Avatar'}
      width={size}
      height={size}
      style={{ borderRadius: '50%' }}
    />
  );
};

export default UserAvatar;