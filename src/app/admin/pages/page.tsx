'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Chip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Page } from '@/types';

// Predefined pages that should exist
const predefinedPages = [
  { slug: 'home', title: { ro: 'Acasa', en: 'Home' } },
  { slug: 'despre-mine', title: { ro: 'Despre Mine', en: 'About Me' } },
  { slug: 'servicii', title: { ro: 'Servicii', en: 'Services' } },
  { slug: 'tarife', title: { ro: 'Tarife', en: 'Pricing' } },
  { slug: 'contact', title: { ro: 'Contact', en: 'Contact' } },
];

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pages'));
        const firestorePages = snapshot.docs.map((doc) => ({
          slug: doc.id,
          ...doc.data(),
        })) as Page[];
        setPages(firestorePages);
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Merge predefined pages with Firestore data
  const mergedPages = predefinedPages.map((predefined) => {
    const firestorePage = pages.find((p) => p.slug === predefined.slug);
    return {
      ...predefined,
      ...firestorePage,
      hasContent: !!firestorePage,
    };
  });

  const formatDate = (timestamp?: { seconds: number }) => {
    if (!timestamp) return null;
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pagini
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Editeaza continutul paginilor site-ului.
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : (
            <List disablePadding>
              {mergedPages.map((page, index) => (
                <ListItem
                  key={page.slug}
                  divider={index < mergedPages.length - 1}
                  component={NextLink}
                  href={`/admin/pages/${page.slug}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    cursor: 'pointer',
                    py: 2,
                    px: 2,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {page.title.ro}
                        {!page.hasContent && (
                          <Chip label="Fara continut" size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      page.updatedAt
                        ? `Ultima modificare: ${formatDate(page.updatedAt)}`
                        : 'Nu a fost editat inca'
                    }
                  />
                  <EditIcon color="action" />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
