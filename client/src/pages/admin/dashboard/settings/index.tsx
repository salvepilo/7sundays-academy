import React from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';

const SettingsPage = () => {
  const router = useRouter();

  const settingsCategories = [
    {
      title: 'Configurazione Email',
      description: 'Gestisci le impostazioni SMTP per l\'invio di email agli utenti',
      icon: <EmailIcon />,
      path: '/admin/dashboard/settings/email',
    },
    {
      title: 'Impostazioni Generali',
      description: 'Configura le impostazioni generali della piattaforma',
      icon: <SettingsIcon />,
      path: '/admin/dashboard/settings/general',
      disabled: true,
    },
    {
      title: 'Sicurezza',
      description: 'Gestisci le impostazioni di sicurezza e autenticazione',
      icon: <SecurityIcon />,
      path: '/admin/dashboard/settings/security',
      disabled: true,
    },
    {
      title: 'Backup e Ripristino',
      description: 'Configura backup automatici e opzioni di ripristino',
      icon: <StorageIcon />,
      path: '/admin/dashboard/settings/backup',
      disabled: true,
    },
  ];

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Impostazioni di Sistema
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gestisci le impostazioni e le configurazioni della piattaforma 7Sundays Academy
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {settingsCategories.map((category, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: category.disabled ? 'none' : 'translateY(-4px)',
                    boxShadow: category.disabled ? 1 : 6,
                    cursor: category.disabled ? 'default' : 'pointer',
                  },
                  opacity: category.disabled ? 0.7 : 1,
                }}
                onClick={() => !category.disabled && router.push(category.path)}
              >
                <CardHeader
                  avatar={category.icon}
                  title={category.title}
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                  {category.disabled && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Funzionalità in arrivo
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default SettingsPage;