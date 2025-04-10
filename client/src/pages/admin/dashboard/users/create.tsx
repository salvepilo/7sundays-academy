import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

const CreateUserPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create User</h1>
      </div>
    </AdminLayout>
  );
};

export default CreateUserPage;