'use client';

import NextLink from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Box, Container, Typography, Stack, IconButton, Divider, Link } from '@mui/material';
import { WhatsApp, Facebook, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';
import type { Locale } from '@/i18n/config';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { key: 'home', href: `/${locale}` },
    { key: 'about', href: `/${locale}/${locale === 'ro' ? 'despre-mine' : 'about'}` },
    { key: 'services', href: `/${locale}/${locale === 'ro' ? 'servicii' : 'services'}` },
    { key: 'pricing', href: `/${locale}/${locale === 'ro' ? 'tarife' : 'pricing'}` },
    { key: 'contact', href: `/${locale}/contact` },
    { key: 'booking', href: `/${locale}/${locale === 'ro' ? 'programare' : 'booking'}` },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Brand & Description */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Psihoterapie
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 300 }}>
              {locale === 'ro'
                ? 'Cabinet de psihoterapie dedicat bunastarii tale emotionale si mintale.'
                : 'Psychotherapy practice dedicated to your emotional and mental well-being.'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <WhatsApp fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Navigation Links */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {locale === 'ro' ? 'Navigare' : 'Navigation'}
            </Typography>
            <Stack spacing={1}>
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  component={NextLink}
                  href={link.href}
                  variant="body2"
                  underline="none"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {tNav(link.key)}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Contact Info */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {locale === 'ro' ? 'Contact' : 'Contact'}
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  contact@example.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  +40 700 000 000
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Strada Exemplu, Nr. 1<br />
                  Bucuresti, Romania
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Psihoterapie. {t('copyright')}
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link
              component={NextLink}
              href={`/${locale}/privacy`}
              variant="body2"
              underline="none"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {t('privacy')}
            </Link>
            <Link
              component={NextLink}
              href={`/${locale}/terms`}
              variant="body2"
              underline="none"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {t('terms')}
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
