'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, Skeleton } from '@mui/material';
import NextLink from 'next/link';
import { usePricing } from '@/hooks/usePricing';
import type { Locale } from '@/types';

// Default pricing used when no data in Firestore
const defaultPricing = [
  {
    id: 'individual-session',
    title: { ro: 'Sedinta Individuala', en: 'Individual Session' },
    duration: '50 min',
    price: 250,
    currency: 'RON',
    type: 'session' as const,
    order: 1,
  },
  {
    id: 'couples-session',
    title: { ro: 'Sedinta de Cuplu', en: 'Couples Session' },
    duration: '80 min',
    price: 350,
    currency: 'RON',
    type: 'session' as const,
    order: 2,
  },
  {
    id: 'package-5',
    title: { ro: 'Pachet 5 Sedinte', en: 'Package 5 Sessions' },
    duration: '5 x 50 min',
    price: 1100,
    currency: 'RON',
    type: 'package' as const,
    order: 3,
  },
  {
    id: 'package-10',
    title: { ro: 'Pachet 10 Sedinte', en: 'Package 10 Sessions' },
    duration: '10 x 50 min',
    price: 2000,
    currency: 'RON',
    type: 'package' as const,
    order: 4,
  },
];

export default function PricingPage() {
  const t = useTranslations('pricing');
  const locale = useLocale() as Locale;
  const { pricing: firestorePricing, loading, error } = usePricing();

  // Use Firestore pricing if available, otherwise use defaults
  const pricing = firestorePricing.length > 0 ? firestorePricing : defaultPricing;

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

        <Grid container spacing={4} justifyContent="center">
          {loading ? (
            // Loading skeletons
            [...Array(4)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 4 }}>
                  <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} height={32} />
                  <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} height={48} />
                </Card>
              </Grid>
            ))
          ) : (
            pricing.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  {item.type === 'package' && (
                    <Chip
                      label={t('package')}
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 16,
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      {item.title[locale]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.duration}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}
                    >
                      {item.price} {item.currency}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.type === 'session' ? t('perSession') : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            LinkComponent={NextLink}
            href={`/${locale}/${locale === 'ro' ? 'programare' : 'booking'}`}
            variant="contained"
            size="large"
          >
            {locale === 'ro' ? 'Programeaza o sedinta' : 'Book a session'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
