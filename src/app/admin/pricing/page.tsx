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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { getPricing, savePricing, deletePricing } from '@/lib/firestore';
import type { PricingItem, LocalizedContent } from '@/types';

const emptyPricing: Omit<PricingItem, 'id'> = {
  title: { ro: '', en: '' },
  description: { ro: '', en: '' },
  duration: '',
  price: 0,
  currency: 'RON',
  type: 'session',
  order: 0,
};

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
  const [formData, setFormData] = useState<Omit<PricingItem, 'id'>>(emptyPricing);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const data = await getPricing();
      setPricing(data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      showSnackbar('Nu am putut incarca tarifele.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (item?: PricingItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        duration: item.duration,
        price: item.price,
        currency: item.currency,
        type: item.type,
        order: item.order,
      });
    } else {
      setEditingItem(null);
      setFormData({
        ...emptyPricing,
        order: pricing.length + 1,
      });
    }
    setActiveTab(0);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData(emptyPricing);
  };

  const handleInputChange = (field: keyof Omit<PricingItem, 'id'>, value: string | number | LocalizedContent) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalizedChange = (field: 'title' | 'description', locale: 'ro' | 'en', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || { ro: '', en: '' }),
        [locale]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = editingItem?.id || `pricing-${Date.now()}`;
      await savePricing(id, formData);
      await fetchPricing();
      handleCloseDialog();
      showSnackbar(editingItem ? 'Tariful a fost actualizat.' : 'Tariful a fost adaugat.', 'success');
    } catch (error) {
      console.error('Error saving pricing:', error);
      showSnackbar('Nu am putut salva tariful.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: PricingItem) => {
    if (!confirm(`Esti sigur ca vrei sa stergi tariful "${item.title.ro}"?`)) {
      return;
    }

    try {
      await deletePricing(item.id);
      await fetchPricing();
      showSnackbar('Tariful a fost sters.', 'success');
    } catch (error) {
      console.error('Error deleting pricing:', error);
      showSnackbar('Nu am putut sterge tariful.', 'error');
    }
  };

  const currentLocale = activeTab === 0 ? 'ro' : 'en';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tarife</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Adauga tarif
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
          ) : pricing.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nu exista tarife. Adauga primul tarif.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>#</TableCell>
                    <TableCell>Titlu</TableCell>
                    <TableCell>Durata</TableCell>
                    <TableCell>Pret</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell width={150}>Actiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pricing.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <IconButton size="small" sx={{ cursor: 'grab' }}>
                          <DragIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{item.title.ro}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>{item.price} {item.currency}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.type === 'session' ? 'Sedinta' : 'Pachet'}
                          size="small"
                          color={item.type === 'package' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item)}
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
          {editingItem ? 'Editeaza tarif' : 'Adauga tarif'}
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
              value={formData.description?.[currentLocale] || ''}
              onChange={(e) => handleLocalizedChange('description', currentLocale, e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Durata"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                fullWidth
                placeholder="ex: 50 min"
              />
              <FormControl fullWidth>
                <InputLabel>Tip</InputLabel>
                <Select
                  value={formData.type}
                  label="Tip"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <MenuItem value="session">Sedinta</MenuItem>
                  <MenuItem value="package">Pachet</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Pret"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                fullWidth
              />
              <TextField
                label="Valuta"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                fullWidth
              />
            </Box>
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
