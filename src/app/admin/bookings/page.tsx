'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ConfirmIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { getBookings, updateBookingStatus, getServices } from '@/lib/firestore';
import type { Booking, Service } from '@/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, servicesData] = await Promise.all([
        getBookings(),
        getServices(),
      ]);
      setBookings(bookingsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Nu am putut incarca datele.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getServiceName = (serviceId: string): string => {
    const service = services.find((s) => s.id === serviceId);
    return service?.title.ro || serviceId;
  };

  const formatDate = (timestamp: { seconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (booking: Booking, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await updateBookingStatus(booking.id, newStatus);
      await fetchData();
      showSnackbar(
        newStatus === 'confirmed' 
          ? 'Programarea a fost confirmata.' 
          : 'Programarea a fost anulata.',
        'success'
      );
    } catch (error) {
      console.error('Error updating status:', error);
      showSnackbar('Nu am putut actualiza statusul.', 'error');
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'In asteptare';
      case 'confirmed': return 'Confirmata';
      case 'cancelled': return 'Anulata';
      default: return status;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterTab === 0) return true; // All
    if (filterTab === 1) return booking.status === 'pending';
    if (filterTab === 2) return booking.status === 'confirmed';
    if (filterTab === 3) return booking.status === 'cancelled';
    return true;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Programari
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={filterTab}
            onChange={(_, newValue) => setFilterTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab label={`Toate (${bookings.length})`} />
            <Tab label={`In asteptare (${bookings.filter(b => b.status === 'pending').length})`} />
            <Tab label={`Confirmate (${bookings.filter(b => b.status === 'confirmed').length})`} />
            <Tab label={`Anulate (${bookings.filter(b => b.status === 'cancelled').length})`} />
          </Tabs>

          {loading ? (
            <Box sx={{ p: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : filteredBookings.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nu exista programari in aceasta categorie.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Serviciu</TableCell>
                    <TableCell>Data si ora</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell width={150}>Actiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.clientName}</TableCell>
                      <TableCell>{booking.clientEmail}</TableCell>
                      <TableCell>{booking.clientPhone}</TableCell>
                      <TableCell>{getServiceName(booking.serviceId)}</TableCell>
                      <TableCell>{formatDate(booking.datetime)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(booking.status)}
                          size="small"
                          color={getStatusColor(booking.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Vezi detalii">
                          <IconButton size="small" onClick={() => handleViewDetails(booking)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {booking.status === 'pending' && (
                          <>
                            <Tooltip title="Confirma">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStatusChange(booking, 'confirmed')}
                              >
                                <ConfirmIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Anuleaza">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleStatusChange(booking, 'cancelled')}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Trimite email">
                          <IconButton
                            size="small"
                            onClick={() => window.location.href = `mailto:${booking.clientEmail}`}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalii programare</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                <Typography>{selectedBooking.clientName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{selectedBooking.clientEmail}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Telefon</Typography>
                <Typography>{selectedBooking.clientPhone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Serviciu</Typography>
                <Typography>{getServiceName(selectedBooking.serviceId)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Data si ora</Typography>
                <Typography>{formatDate(selectedBooking.datetime)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={getStatusLabel(selectedBooking.status)}
                  size="small"
                  color={getStatusColor(selectedBooking.status)}
                />
              </Box>
              {selectedBooking.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Notite</Typography>
                  <Typography>{selectedBooking.notes}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Creat la</Typography>
                <Typography>{formatDate(selectedBooking.createdAt)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Inchide</Button>
          {selectedBooking?.status === 'pending' && (
            <>
              <Button
                color="success"
                onClick={() => {
                  handleStatusChange(selectedBooking, 'confirmed');
                  setDetailsOpen(false);
                }}
              >
                Confirma
              </Button>
              <Button
                color="error"
                onClick={() => {
                  handleStatusChange(selectedBooking, 'cancelled');
                  setDetailsOpen(false);
                }}
              >
                Anuleaza
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

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
