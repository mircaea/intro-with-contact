import { useTranslations } from 'next-intl';
import { Container, Box, Typography } from '@mui/material';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Typography variant="h1" sx={{ mb: 2 }}>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('description')}
        </Typography>
        
        {/* Placeholder content - will be replaced by CMS content */}
        <Box
          sx={{
            bgcolor: 'grey.100',
            borderRadius: 2,
            p: 4,
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary">
            Content will be loaded from CMS
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
