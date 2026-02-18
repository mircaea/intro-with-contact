'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Container,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import type { Locale } from '@/i18n/config';

interface NavItem {
  key: string;
  href: string;
}

const getNavItems = (locale: Locale): NavItem[] => [
  { key: 'home', href: `/${locale}` },
  { key: 'about', href: `/${locale}/${locale === 'ro' ? 'despre-mine' : 'about'}` },
  { key: 'services', href: `/${locale}/${locale === 'ro' ? 'servicii' : 'services'}` },
  { key: 'pricing', href: `/${locale}/${locale === 'ro' ? 'tarife' : 'pricing'}` },
  { key: 'contact', href: `/${locale}/contact` },
];

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getNavItems(locale);
  const bookingHref = `/${locale}/${locale === 'ro' ? 'programare' : 'booking'}`;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, mb: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              href={item.href}
              onClick={handleDrawerToggle}
              sx={{ py: 1.5, px: 3 }}
              LinkComponent={NextLink}
            >
              <ListItemText primary={t(item.key)} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            href={bookingHref}
            onClick={handleDrawerToggle}
            LinkComponent={NextLink}
            sx={{
              py: 1.5,
              px: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              mx: 2,
              mt: 2,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <ListItemText primary={t('booking')} sx={{ textAlign: 'center' }} />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, px: 3 }}>
        <LanguageSwitcher />
        <ThemeToggle />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        sx={{
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={NextLink}
              href={`/${locale}`}
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Psihoterapie
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.key}
                    href={item.href}
                    LinkComponent={NextLink}
                    color="inherit"
                    sx={{
                      fontSize: '0.9rem',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {t(item.key)}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <>
                  <LanguageSwitcher />
                  <ThemeToggle />
                  <Button
                    href={bookingHref}
                    LinkComponent={NextLink}
                    variant="contained"
                    color="primary"
                    sx={{ ml: 1 }}
                  >
                    {t('booking')}
                  </Button>
                </>
              )}

              {/* Mobile menu button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
