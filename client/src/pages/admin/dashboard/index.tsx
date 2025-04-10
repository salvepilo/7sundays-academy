import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Grid, Typography } from '@mui/material';
import AdminLayout from '@/components/layout/AdminLayout';
import { useUsers } from '@/hooks/useUsers';
import { useCourses } from '@/hooks/useCourses';
import { useLessons } from '@/hooks/useLessons';
import CourseTable from '@/components/admin/CourseTable';
import { useCareers } from '@/hooks/useCareers';
import DashboardOverview from '@/components/admin/DashboardOverview';
import UserTable from '@/components/admin/UserTable';
import LessonTable from '@/components/admin/LessonTable';
import CareerTable from '@/components/admin/CareerTable';
import { useAuth } from '@/hooks/useAuth';


const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { users, isLoading: isLoadingUsers, error: errorUsers } = useUsers();
  const { courses, isLoading: isLoadingCourses, error: errorCourses } = useCourses();
  const { lessons, isLoading: isLoadingLessons, error: errorLessons } = useLessons();
  const { careers, isLoading: isLoadingCareers, error: errorCareers } = useCareers();

  useEffect(() => {
    if (!isLoadingAuth && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, isLoadingAuth, router]);

  if (isLoadingAuth || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography> 
        <Grid container spacing={3}>
          {/* Dashboard Overview */}
          <Grid item xs={12}>
            <DashboardOverview />
          </Grid>
          {/* User Table */}
          <Grid item xs={12}>
            <UserTable users={users} />
          </Grid>
          {/* Courses Table */}
          <Grid item xs={12}>
            <CourseTable courses={courses} />
          </Grid>
          {/* Lessons Table */}
          <Grid item xs={12}>
            <LessonTable lessons={lessons} />
          </Grid> 
          {/* Careers Table */}
          <Grid item xs={12}>
            <CareerTable careers={careers} />
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;