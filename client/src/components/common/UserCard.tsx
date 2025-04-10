<img
  src={
    user.photo
      ? `/images/avatars/${user.photo}`
      : "/images/avatars/default.jpg"
  }
  alt={user.name}
  className="w-10 h-10 rounded-full object-cover"
/>