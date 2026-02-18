'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { MenuItem, Select, SelectChangeEvent, Box } from '@mui/material';
import { Language } from '@mui/icons-material';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newLocale = event.target.value as Locale;
    
    // Replace the locale in the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    
    router.push(newPath);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Language sx={{ fontSize: 20, opacity: 0.7 }} />
      <Select
        value={locale}
        onChange={handleChange}
        size="small"
        variant="standard"
        disableUnderline
        sx={{
          '& .MuiSelect-select': {
            py: 0.5,
            pr: 3,
            fontSize: '0.875rem',
          },
        }}
      >
        {locales.map((loc) => (
          <MenuItem key={loc} value={loc}>
            {localeNames[loc]}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
