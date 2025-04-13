export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('it-IT').format(number);
};

export const formatPercentage = (number: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(number / 100);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'instructor':
      return 'bg-blue-100 text-blue-800';
    case 'student':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'web-development':
      return 'bg-blue-100 text-blue-800';
    case 'mobile-development':
      return 'bg-purple-100 text-purple-800';
    case 'data-science':
      return 'bg-green-100 text-green-800';
    case 'design':
      return 'bg-pink-100 text-pink-800';
    case 'business':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 