'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  Skeleton,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { getSettings, saveSettings } from '@/lib/firestore';
import type { Settings } from '@/types';

const defaultSettings: Settings = {
  siteName: 'Psihoterapie',
  contactEmail: 'contact@example.com',
  phone: '+40 700 000 000',
  address: 'Bucuresti, Romania',
  defaultTheme: 'light',
  defaultLanguage: 'ro',
  socialLinks: {},
  calendar: {
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: '09:00', end: '18:00' },
    sessionDuration: 50,
    bufferTime: 10,
  },
};

const dayLabels = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      if (data) {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar('Nu am putut incarca setarile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (field: keyof Settings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleCalendarChange = (field: keyof Settings['calendar'], value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        [field]: value,
      },
    }));
  };

  const handleWorkingDayToggle = (day: number) => {
    setSettings((prev) => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        workingDays: prev.calendar.workingDays.includes(day)
          ? prev.calendar.workingDays.filter((d) => d !== day)
          : [...prev.calendar.workingDays, day].sort(),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      showSnackbar('Setarile au fost salvate.', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Nu am putut salva setarile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Setari</Typography>
        <Card>
          <CardContent>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2 }} />
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Setari</Typography>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          Salveaza
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informatii generale
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Numele site-ului"
                  value={settings.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="URL Logo"
                  value={settings.logo || ''}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  fullWidth
                  helperText="Introdu URL-ul logo-ului sau lasa gol"
                />
                <TextField
                  label="Email de contact"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Telefon"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Adresa"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aspect si limba
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Tema implicita</InputLabel>
                  <Select
                    value={settings.defaultTheme}
                    label="Tema implicita"
                    onChange={(e) => handleChange('defaultTheme', e.target.value)}
                  >
                    <MenuItem value="light">Deschisa (Light)</MenuItem>
                    <MenuItem value="dark">Inchisa (Dark)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Limba implicita</InputLabel>
                  <Select
                    value={settings.defaultLanguage}
                    label="Limba implicita"
                    onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                  >
                    <MenuItem value="ro">Romana</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Retele sociale
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="WhatsApp"
                  value={settings.socialLinks.whatsapp || ''}
                  onChange={(e) => handleSocialLinkChange('whatsapp', e.target.value)}
                  fullWidth
                  placeholder="https://wa.me/40700000000"
                />
                <TextField
                  label="Facebook"
                  value={settings.socialLinks.facebook || ''}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  fullWidth
                  placeholder="https://facebook.com/pagina"
                />
                <TextField
                  label="Instagram"
                  value={settings.socialLinks.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  fullWidth
                  placeholder="https://instagram.com/cont"
                />
                <TextField
                  label="LinkedIn"
                  value={settings.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  fullWidth
                  placeholder="https://linkedin.com/in/profil"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Calendar Settings */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Setari calendar
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Zile lucratoare
                  </Typography>
                  <FormGroup row>
                    {dayLabels.map((label, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={settings.calendar.workingDays.includes(index)}
                            onChange={() => handleWorkingDayToggle(index)}
                          />
                        }
                        label={label}
                      />
                    ))}
                  </FormGroup>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Ora start"
                        type="time"
                        value={settings.calendar.workingHours.start}
                        onChange={(e) => handleCalendarChange('workingHours', {
                          ...settings.calendar.workingHours,
                          start: e.target.value,
                        })}
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      <TextField
                        label="Ora sfarsit"
                        type="time"
                        value={settings.calendar.workingHours.end}
                        onChange={(e) => handleCalendarChange('workingHours', {
                          ...settings.calendar.workingHours,
                          end: e.target.value,
                        })}
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Durata sedinta (minute)"
                        type="number"
                        value={settings.calendar.sessionDuration}
                        onChange={(e) => handleCalendarChange('sessionDuration', parseInt(e.target.value) || 50)}
                        fullWidth
                      />
                      <TextField
                        label="Pauza intre sedinte (minute)"
                        type="number"
                        value={settings.calendar.bufferTime}
                        onChange={(e) => handleCalendarChange('bufferTime', parseInt(e.target.value) || 10)}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
