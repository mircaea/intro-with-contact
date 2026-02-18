'use client';

import { useTranslations, useLocale } from 'next-intl';
import NextLink from 'next/link';
import { Container, Box, Typography, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          py: { xs: 8, md: 12 },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                {t('hero.title')}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  fontWeight: 400,
                }}
              >
                {t('hero.subtitle')}
              </Typography>
              <Button
                LinkComponent={NextLink}
                href={`/${locale}/${locale === 'ro' ? 'programare' : 'booking'}`}
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{ px: 4, py: 1.5 }}
              >
                {t('hero.cta')}
              </Button>
            </Box>
            <Box
              sx={{
                flex: 1,
                width: '100%',
                height: { xs: 250, md: 400 },
                bgcolor: 'grey.200',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">
                {locale === 'ro' ? 'Imagine principala' : 'Hero image'}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* About Preview Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              {t('about.title')}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
            >
              {locale === 'ro'
                ? 'Cu experienta vasta in domeniul psihoterapiei, ofer un spatiu sigur si confidential pentru explorarea gandurilor si emotiilor tale.'
                : 'With extensive experience in psychotherapy, I offer a safe and confidential space for exploring your thoughts and emotions.'}
            </Typography>
            <Button
              LinkComponent={NextLink}
              href={`/${locale}/${locale === 'ro' ? 'despre-mine' : 'about'}`}
              variant="outlined"
              endIcon={<ArrowForward />}
            >
              {t('about.readMore')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Services Preview Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              {t('services.title')}
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {[1, 2, 3].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item}>
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
                  <CardMedia
                    sx={{
                      height: 180,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography color="text.secondary">
                      {locale === 'ro' ? `Serviciu ${item}` : `Service ${item}`}
                    </Typography>
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {locale === 'ro' ? `Titlu Serviciu ${item}` : `Service Title ${item}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {locale === 'ro'
                        ? 'Descriere scurta a serviciului oferit in cadrul cabinetului de psihoterapie.'
                        : 'Short description of the service offered at the psychotherapy practice.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              LinkComponent={NextLink}
              href={`/${locale}/${locale === 'ro' ? 'servicii' : 'services'}`}
              variant="outlined"
              endIcon={<ArrowForward />}
            >
              {t('services.viewAll')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'inherit' }}>
              {locale === 'ro' ? 'Esti gata sa faci primul pas?' : 'Ready to take the first step?'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              {locale === 'ro'
                ? 'Programeaza o consultatie initiala si hai sa discutam despre cum te pot ajuta.'
                : "Schedule an initial consultation and let's discuss how I can help you."}
            </Typography>
            <Button
              LinkComponent={NextLink}
              href={`/${locale}/${locale === 'ro' ? 'programare' : 'booking'}`}
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              {locale === 'ro' ? 'Programeaza acum' : 'Book now'}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
