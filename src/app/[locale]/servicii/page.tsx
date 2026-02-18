'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Container, Box, Typography, Grid, Card, CardContent, CardMedia, Skeleton } from '@mui/material';
import { useServices } from '@/hooks/useServices';
import type { Locale } from '@/types';

// Default services used when no data in Firestore
const defaultServices = [
  { 
    id: 'individual-therapy', 
    title: { ro: 'Terapie Individuala', en: 'Individual Therapy' }, 
    description: { ro: 'Sesiuni de psihoterapie individuala pentru adulti.', en: 'Individual psychotherapy sessions for adults.' },
    image: undefined as string | undefined,
    order: 1
  },
  { 
    id: 'couples-therapy', 
    title: { ro: 'Terapie de Cuplu', en: 'Couples Therapy' }, 
    description: { ro: 'Sesiuni de terapie pentru cupluri.', en: 'Therapy sessions for couples.' },
    image: undefined as string | undefined,
    order: 2
  },
  { 
    id: 'counseling', 
    title: { ro: 'Consiliere Psihologica', en: 'Psychological Counseling' }, 
    description: { ro: 'Consiliere pentru diverse probleme de viata.', en: 'Counseling for various life issues.' },
    image: undefined as string | undefined,
    order: 3
  },
  { 
    id: 'stress-management', 
    title: { ro: 'Managementul Stresului', en: 'Stress Management' }, 
    description: { ro: 'Tehnici si strategii pentru gestionarea stresului.', en: 'Techniques and strategies for managing stress.' },
    image: undefined as string | undefined,
    order: 4
  },
  { 
    id: 'anxiety-therapy', 
    title: { ro: 'Terapia Anxietatii', en: 'Anxiety Therapy' }, 
    description: { ro: 'Tratament pentru tulburari de anxietate.', en: 'Treatment for anxiety disorders.' },
    image: undefined as string | undefined,
    order: 5
  },
  { 
    id: 'depression-therapy', 
    title: { ro: 'Terapia Depresiei', en: 'Depression Therapy' }, 
    description: { ro: 'Suport pentru persoanele care sufera de depresie.', en: 'Support for people suffering from depression.' },
    image: undefined as string | undefined,
    order: 6
  },
];

export default function ServicesPage() {
  const t = useTranslations('services');
  const locale = useLocale() as Locale;
  const { services: firestoreServices, loading, error } = useServices();

  // Use Firestore services if available, otherwise use defaults
  const services = firestoreServices.length > 0 ? firestoreServices : defaultServices;

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h1" sx={{ mb: 2 }}>
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            {t('description')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            // Loading skeletons
            [...Array(6)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="80%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            services.map((service) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  {service.image ? (
                    <CardMedia
                      component="img"
                      sx={{ height: 160 }}
                      image={service.image}
                      alt={service.title[locale]}
                    />
                  ) : (
                    <CardMedia
                      sx={{
                        height: 160,
                        bgcolor: 'primary.light',
                        opacity: 0.3,
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {service.title[locale]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description[locale]}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}
