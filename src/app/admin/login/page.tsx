'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn, resetPassword, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Introdu adresa de email pentru a primi linkul de resetare.');
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
      if (err.message.includes('invalid-credential')) {
        return 'Email sau parola incorecta.';
      }
      if (err.message.includes('user-not-found')) {
        return 'Nu exista un cont cu aceasta adresa de email.';
      }
      if (err.message.includes('wrong-password')) {
        return 'Parola incorecta.';
      }
      if (err.message.includes('too-many-requests')) {
        return 'Prea multe incercari. Incearca din nou mai tarziu.';
      }
    }
    return 'A aparut o eroare. Incearca din nou.';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Admin Login
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Conecteaza-te pentru a accesa panoul de administrare
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {resetSent && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Ti-am trimis un email cu instructiuni pentru resetarea parolei.
            </Alert>
          )}

          {showReset ? (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Trimite link de resetare'}
              </Button>
              <Box textAlign="center">
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => { setShowReset(false); setResetSent(false); }}
                >
                  Inapoi la login
                </Link>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Parola"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || authLoading}
              >
                {loading ? <CircularProgress size={24} /> : 'Conecteaza-te'}
              </Button>
              <Box textAlign="center">
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setShowReset(true)}
                >
                  Ai uitat parola?
                </Link>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
