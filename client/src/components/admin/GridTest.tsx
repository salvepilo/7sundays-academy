import React from 'react';
import { Grid } from '@mui/material';

const GridTest: React.FC = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        {"test"}
      </Grid>
    </Grid>
  );
};

export default GridTest;