import React from 'react';
import { Grid, Typography } from '@mui/material';

const DashboardOverview: React.FC = () => {
  return (
    <div>
      <Typography variant="h4">Dashboard</Typography>
      <Grid container>
        <Grid item xs={12}>
          {"test"}
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardOverview;