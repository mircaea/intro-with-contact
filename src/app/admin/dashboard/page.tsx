'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Skeleton,
  Button,
} from '@mui/material';
import {
  CalendarMonth as BookingsIcon,
  Email as ContactIcon,
  CheckCircle as ConfirmedIcon,
  Schedule as PendingIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { getBookings, getContactSubmissions } from '@/lib/firestore';
import type { Booking, ContactSubmission } from '@/types';

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, contactsData] = await Promise.all([
          getBookings(),
          getContactSubmissions(),
        ]);
        setBookings(bookingsData);
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const unreadContacts = contacts.filter((c) => !c.read);

  const formatDate = (timestamp: { seconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Programari in asteptare
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width={60} height={48} />
              ) : (
                <Typography variant="h3">{pendingBookings.length}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ConfirmedIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Programari confirmate
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width={60} height={48} />
              ) : (
                <Typography variant="h3">{confirmedBookings.length}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ContactIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Mesaje necitite
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width={60} height={48} />
              ) : (
                <Typography variant="h3">{unreadContacts.length}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BookingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total programari
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width={60} height={48} />
              ) : (
                <Typography variant="h3">{bookings.length}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Items */}
      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Programari recente</Typography>
                <Button
                  component={NextLink}
                  href="/admin/bookings"
                  size="small"
                >
                  Vezi toate
                </Button>
              </Box>
              {loading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : bookings.length === 0 ? (
                <Typography color="text.secondary">Nu exista programari.</Typography>
              ) : (
                <List disablePadding>
                  {bookings.slice(0, 5).map((booking) => (
                    <ListItem key={booking.id} divider>
                      <ListItemText
                        primary={booking.clientName}
                        secondary={formatDate(booking.datetime)}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={
                            booking.status === 'pending' ? 'In asteptare' :
                            booking.status === 'confirmed' ? 'Confirmata' : 'Anulata'
                          }
                          size="small"
                          color={
                            booking.status === 'pending' ? 'warning' :
                            booking.status === 'confirmed' ? 'success' : 'error'
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Contacts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mesaje recente</Typography>
                <Button
                  component={NextLink}
                  href="/admin/contacts"
                  size="small"
                >
                  Vezi toate
                </Button>
              </Box>
              {loading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : contacts.length === 0 ? (
                <Typography color="text.secondary">Nu exista mesaje.</Typography>
              ) : (
                <List disablePadding>
                  {contacts.slice(0, 5).map((contact) => (
                    <ListItem key={contact.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {contact.name}
                            {!contact.read && (
                              <Chip label="Nou" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={contact.message.substring(0, 50) + (contact.message.length > 50 ? '...' : '')}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          <ViewIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
