'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Skeleton,
} from '@mui/material';
import { ArrowBack, ArrowForward, Check, AccessTime } from '@mui/icons-material';
import { useServices } from '@/hooks/useServices';
import type { Locale } from '@/types';

const steps = {
  ro: ['Selecteaza serviciul', 'Alege data si ora', 'Datele tale', 'Confirmare'],
  en: ['Select service', 'Choose date & time', 'Your details', 'Confirmation'],
};

interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export default function BookingPage() {
  const t = useTranslations('booking');
  const locale = useLocale() as Locale;
  const { services: firestoreServices, loading: servicesLoading } = useServices();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    datetime: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Fallback services if Firestore is empty
  const defaultServices = [
    { id: 'individual-session', title: { ro: 'Sedinta Individuala - 50 min', en: 'Individual Session - 50 min' } },
    { id: 'couples-session', title: { ro: 'Sedinta de Cuplu - 80 min', en: 'Couples Session - 80 min' } },
    { id: 'initial-consultation', title: { ro: 'Consultatie Initiala - 30 min', en: 'Initial Consultation - 30 min' } },
  ];

  const services = firestoreServices.length > 0 
    ? firestoreServices.map(s => ({ id: s.id, title: s.title }))
    : defaultServices;

  // Fetch available dates when component mounts
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.date) {
      fetchAvailableSlots(formData.date);
    }
  }, [formData.date]);

  const fetchAvailableDates = async () => {
    setLoadingDates(true);
    try {
      const response = await fetch('/api/calendar?action=dates');
      const data = await response.json();
      if (data.success) {
        setAvailableDates(data.dates);
      }
    } catch (err) {
      console.error('Error fetching available dates:', err);
      // Use fallback - next 30 weekdays
      const dates: string[] = [];
      const today = new Date();
      for (let i = 1; i <= 30 && dates.length < 20; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          dates.push(date.toISOString().split('T')[0]);
        }
      }
      setAvailableDates(dates);
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    setLoadingSlots(true);
    setFormData(prev => ({ ...prev, time: '', datetime: '' }));
    try {
      const response = await fetch(`/api/calendar?action=slots&date=${date}`);
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.slots);
      }
    } catch (err) {
      console.error('Error fetching available slots:', err);
      // Use fallback time slots
      setAvailableSlots([
        { start: `${date}T09:00:00`, end: `${date}T09:50:00`, label: '09:00' },
        { start: `${date}T10:00:00`, end: `${date}T10:50:00`, label: '10:00' },
        { start: `${date}T11:00:00`, end: `${date}T11:50:00`, label: '11:00' },
        { start: `${date}T14:00:00`, end: `${date}T14:50:00`, label: '14:00' },
        { start: `${date}T15:00:00`, end: `${date}T15:50:00`, label: '15:00' },
        { start: `${date}T16:00:00`, end: `${date}T16:50:00`, label: '16:00' },
        { start: `${date}T17:00:00`, end: `${date}T17:50:00`, label: '17:00' },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setFormData(prev => ({ 
      ...prev, 
      time: slot.label,
      datetime: slot.start,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          serviceId: formData.serviceId,
          datetime: formData.datetime,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setActiveStep(3);
      } else {
        setError(data.error || (locale === 'ro' ? 'A aparut o eroare' : 'An error occurred'));
      }
    } catch {
      setError(locale === 'ro' ? 'A aparut o eroare' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatSelectedDate = () => {
    if (!formData.date) return '';
    const date = new Date(formData.date);
    return date.toLocaleDateString(locale === 'ro' ? 'ro-RO' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getServiceName = () => {
    const service = services.find(s => s.id === formData.serviceId);
    return service?.title[locale] || formData.serviceId;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            {servicesLoading ? (
              <Skeleton variant="rectangular" height={56} />
            ) : (
              <FormControl fullWidth>
                <InputLabel>{t('selectService')}</InputLabel>
                <Select
                  value={formData.serviceId}
                  label={t('selectService')}
                  onChange={(e) => handleChange('serviceId', e.target.value)}
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.title[locale]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('selectDate')}
                </Typography>
                {loadingDates ? (
                  <Skeleton variant="rectangular" height={56} />
                ) : (
                  <TextField
                    fullWidth
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0],
                    }}
                    helperText={availableDates.length > 0 
                      ? `${locale === 'ro' ? 'Zile disponibile in urmatoarele' : 'Available dates in the next'} 30 ${locale === 'ro' ? 'de zile' : 'days'}`
                      : ''
                    }
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('selectTime')}
                </Typography>
                {loadingSlots ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                    ))}
                  </Box>
                ) : !formData.date ? (
                  <Typography variant="body2" color="text.secondary">
                    {locale === 'ro' ? 'Selecteaza o data mai intai' : 'Select a date first'}
                  </Typography>
                ) : availableSlots.length === 0 ? (
                  <Alert severity="info">
                    {locale === 'ro' 
                      ? 'Nu exista sloturi disponibile pentru aceasta zi. Alege alta data.'
                      : 'No available slots for this day. Please choose another date.'}
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {availableSlots.map((slot) => (
                      <Chip
                        key={slot.start}
                        label={slot.label}
                        icon={<AccessTime />}
                        onClick={() => handleTimeSelect(slot)}
                        color={formData.time === slot.label ? 'primary' : 'default'}
                        variant={formData.time === slot.label ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={locale === 'ro' ? 'Nume complet' : 'Full name'}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={locale === 'ro' ? 'Telefon' : 'Phone'}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="+40 7XX XXX XXX"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={locale === 'ro' ? 'Notite (optional)' : 'Notes (optional)'}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  helperText={locale === 'ro' 
                    ? 'Scrie orice informatii utile pentru terapeut'
                    : 'Write any useful information for the therapist'}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {success ? (
              <>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <Check sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" gutterBottom>
                  {t('success')}
                </Typography>
                <Typography color="text.secondary">
                  {locale === 'ro'
                    ? 'Vei primi un email de confirmare in curand.'
                    : 'You will receive a confirmation email shortly.'}
                </Typography>
              </>
            ) : (
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {locale === 'ro' ? 'Sumar Programare' : 'Booking Summary'}
                  </Typography>
                  <Box sx={{ textAlign: 'left', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {locale === 'ro' ? 'Serviciu' : 'Service'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {getServiceName()}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {locale === 'ro' ? 'Data si ora' : 'Date & time'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatSelectedDate()} - {formData.time}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {locale === 'ro' ? 'Contact' : 'Contact'}
                    </Typography>
                    <Typography variant="body1">
                      {formData.name}
                      <br />
                      {formData.email}
                      <br />
                      {formData.phone}
                    </Typography>

                    {formData.notes && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          {locale === 'ro' ? 'Notite' : 'Notes'}
                        </Typography>
                        <Typography variant="body1">
                          {formData.notes}
                        </Typography>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return !!formData.serviceId;
      case 1:
        return !!formData.date && !!formData.time && !!formData.datetime;
      case 2:
        return !!formData.name && !!formData.email && !!formData.phone;
      default:
        return true;
    }
  };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h1" sx={{ mb: 2 }}>
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('description')}
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps[locale].map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {renderStepContent(activeStep)}

            {activeStep < 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                >
                  {locale === 'ro' ? 'Inapoi' : 'Back'}
                </Button>

                {activeStep === 2 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isStepValid() || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Check />}
                  >
                    {t('confirm')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    endIcon={<ArrowForward />}
                  >
                    {locale === 'ro' ? 'Continua' : 'Continue'}
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
