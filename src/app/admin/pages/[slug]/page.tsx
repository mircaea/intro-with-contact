'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { getPage, savePage } from '@/lib/firestore';
import type { Page, LocalizedContent } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface PageEditorPageProps {
  params: Promise<{ slug: string }>;
}

// Page titles for display
const pageTitles: Record<string, LocalizedContent> = {
  home: { ro: 'Acasa', en: 'Home' },
  'despre-mine': { ro: 'Despre Mine', en: 'About Me' },
  servicii: { ro: 'Servicii', en: 'Services' },
  tarife: { ro: 'Tarife', en: 'Pricing' },
  contact: { ro: 'Contact', en: 'Contact' },
};

export default function PageEditorPage({ params }: PageEditorPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState(0); // 0 = RO, 1 = EN
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [pageData, setPageData] = useState<Partial<Page>>({
    slug,
    title: pageTitles[slug] || { ro: '', en: '' },
    content: { ro: '', en: '' },
  });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await getPage(slug);
        if (data) {
          setPageData({
            ...data,
            title: data.title || pageTitles[slug] || { ro: '', en: '' },
            content: data.content || { ro: '', en: '' },
          });
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Nu am putut incarca pagina.');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const handleTitleChange = (locale: 'ro' | 'en', value: string) => {
    setPageData((prev) => ({
      ...prev,
      title: {
        ...(prev.title || { ro: '', en: '' }),
        [locale]: value,
      },
    }));
  };

  const handleContentChange = (locale: 'ro' | 'en', value: string) => {
    setPageData((prev) => ({
      ...prev,
      content: {
        ...(prev.content || { ro: '', en: '' }),
        [locale]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await savePage(slug, {
        ...pageData,
        slug,
        updatedAt: Timestamp.now(),
      } as Page);
      setSuccess(true);
    } catch (err) {
      console.error('Error saving page:', err);
      setError('Nu am putut salva pagina. Incearca din nou.');
    } finally {
      setSaving(false);
    }
  };

  const currentLocale = activeTab === 0 ? 'ro' : 'en';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          component={NextLink}
          href="/admin/pages"
          startIcon={<BackIcon />}
          variant="outlined"
        >
          Inapoi
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Editeaza: {pageData.title?.ro || slug}
        </Typography>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          Salveaza
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Romana" />
            <Tab label="English" />
          </Tabs>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label={`Titlu (${currentLocale.toUpperCase()})`}
              value={pageData.title?.[currentLocale] || ''}
              onChange={(e) => handleTitleChange(currentLocale, e.target.value)}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Continut ({currentLocale.toUpperCase()})
              </Typography>
              <RichTextEditor
                content={pageData.content?.[currentLocale] || ''}
                onChange={(value) => handleContentChange(currentLocale, value)}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Pagina a fost salvata cu succes!"
      />
    </Box>
  );
}
