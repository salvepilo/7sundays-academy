import React from 'react';
import { Typography, Grid } from '@mui/material';
import StatisticCard from './StatisticCard';
import RecentActivity from './RecentActivity';
import { useUsers } from '../../hooks/useUsers';
import { useCourses } from '../../hooks/useCourses';
import { useLessons } from '../../hooks/useLessons';
import { useCareers } from '../../hooks/useCareers';

const DashboardOverview: React.FC = () => {
  const { users } = useUsers();
  const { courses } = useCourses();
  const { lessons } = useLessons();
  const { careers } = useCareers();

  const activities = [
    { type: 'user', message: 'New user registered' },
    { type: 'course', message: 'New course created' },
    { type: 'career', message: 'New career posted' },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard title="Total Users" value={users.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard title="Total Courses" value={courses.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard title="Total Lessons" value={lessons.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard title="Total Careers" value={careers.length} />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <RecentActivity activities={activities} />
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardOverview;