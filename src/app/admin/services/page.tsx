'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { getServices, saveService, deleteService } from '@/lib/firestore';
import type { Service, LocalizedContent } from '@/types';

const emptyService: Omit<Service, 'id'> = {
  title: { ro: '', en: '' },
  description: { ro: '', en: '' },
  image: '',
  order: 0,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Service, 'id'>>(emptyService);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      showSnackbar('Nu am putut incarca serviciile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        image: service.image || '',
        order: service.order,
      });
    } else {
      setEditingService(null);
      setFormData({
        ...emptyService,
        order: services.length + 1,
      });
    }
    setActiveTab(0);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingService(null);
    setFormData(emptyService);
  };

  const handleInputChange = (field: keyof Omit<Service, 'id'>, value: string | number | LocalizedContent) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalizedChange = (field: 'title' | 'description', locale: 'ro' | 'en', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = editingService?.id || `service-${Date.now()}`;
      await saveService(id, formData);
      await fetchServices();
      handleCloseDialog();
      showSnackbar(editingService ? 'Serviciul a fost actualizat.' : 'Serviciul a fost adaugat.', 'success');
    } catch (error) {
      console.error('Error saving service:', error);
      showSnackbar('Nu am putut salva serviciul.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Esti sigur ca vrei sa stergi serviciul "${service.title.ro}"?`)) {
      return;
    }

    try {
      await deleteService(service.id);
      await fetchServices();
      showSnackbar('Serviciul a fost sters.', 'success');
    } catch (error) {
      console.error('Error deleting service:', error);
      showSnackbar('Nu am putut sterge serviciul.', 'error');
    }
  };

  const currentLocale = activeTab === 0 ? 'ro' : 'en';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Servicii</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Adauga serviciu
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : services.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nu exista servicii. Adauga primul serviciu.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>#</TableCell>
                    <TableCell>Titlu (RO)</TableCell>
                    <TableCell>Titlu (EN)</TableCell>
                    <TableCell width={150}>Actiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <IconButton size="small" sx={{ cursor: 'grab' }}>
                          <DragIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{service.title.ro}</TableCell>
                      <TableCell>{service.title.en}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(service)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? 'Editeaza serviciu' : 'Adauga serviciu'}
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Romana" />
            <Tab label="English" />
          </Tabs>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={`Titlu (${currentLocale.toUpperCase()})`}
              value={formData.title[currentLocale]}
              onChange={(e) => handleLocalizedChange('title', currentLocale, e.target.value)}
              fullWidth
              required
            />
            <TextField
              label={`Descriere (${currentLocale.toUpperCase()})`}
              value={formData.description[currentLocale]}
              onChange={(e) => handleLocalizedChange('description', currentLocale, e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="URL Imagine"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              fullWidth
              helperText="Introdu URL-ul imaginii sau lasa gol"
            />
            <TextField
              label="Ordine"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuleaza</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formData.title.ro}
          >
            {saving ? 'Se salveaza...' : 'Salveaza'}
          </Button>
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
