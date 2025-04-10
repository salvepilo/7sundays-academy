import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface StatisticCardProps {
  title: string;
  value: number | string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatisticCard;