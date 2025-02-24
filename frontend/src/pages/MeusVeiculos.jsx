import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Build as BuildIcon, History as HistoryIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import Layout from '../components/Layout';
import api from '../services/api';
import HistoricoFretesDialog from '../components/HistoricoFretesDialog';

export default function MeusVeiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    document: '',
    insurance_number: '',
    insurance_expiry: null,
  });

  const tiposVeiculo = [
    'Caminhão 3/4',
    'Caminhão Toco',
    'Caminhão Truck',
    'Carreta Simples',
    'Carreta Baú',
    'Carreta Sider',
    'Carreta Graneleira',
  ];

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/vehicles');
      setVeiculos(response.data);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
      setError('Não foi possível carregar os veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      insurance_expiry: date
    }));
  };

  const handleEdit = (veiculo) => {
    setEditingVehicle(veiculo);
    setFormData({
      plate: veiculo.plate,
      type: veiculo.type,
      brand: veiculo.brand,
      model: veiculo.model,
      year: veiculo.year.toString(),
      capacity: veiculo.capacity.toString(),
      document: veiculo.document,
      insurance_number: veiculo.insurance_number,
      insurance_expiry: new Date(veiculo.insurance_expiry),
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      setError('');
      await api.delete(`/vehicles/${selectedVehicle.id}`);
      setSuccess('Veículo excluído com sucesso!');
      setDeleteConfirmOpen(false);
      carregarVeiculos();
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      setError(
        err.response?.data?.error || 
        'Erro ao excluir veículo. Por favor, tente novamente.'
      );
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      setError('');
      const newStatus = selectedVehicle.status === 'manutencao' ? 'disponivel' : 'manutencao';
      await api.put(`/vehicles/${selectedVehicle.id}`, { status: newStatus });
      setSuccess(`Veículo ${newStatus === 'manutencao' ? 'marcado como em manutenção' : 'marcado como disponível'}`);
      setMaintenanceDialogOpen(false);
      carregarVeiculos();
    } catch (err) {
      console.error('Erro ao atualizar status do veículo:', err);
      setError(
        err.response?.data?.error || 
        'Erro ao atualizar status do veículo. Por favor, tente novamente.'
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Validações
      const plateRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
      if (!plateRegex.test(formData.plate.toUpperCase())) {
        setError('Placa inválida. Use o formato ABC1D23');
        return;
      }

      if (!formData.type) {
        setError('Selecione o tipo do veículo');
        return;
      }

      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.year);
      if (!year || year < 1900 || year > currentYear + 1) {
        setError(`Ano inválido. Deve estar entre 1900 e ${currentYear + 1}`);
        return;
      }

      const capacity = parseFloat(formData.capacity);
      if (!capacity || capacity <= 0) {
        setError('Capacidade deve ser maior que zero');
        return;
      }

      if (!formData.insurance_expiry) {
        setError('Data de vencimento do seguro é obrigatória');
        return;
      }

      // Converte campos numéricos e formata dados
      const vehicleData = {
        ...formData,
        plate: formData.plate.toUpperCase(),
        year: year,
        capacity: capacity,
        status: 'disponivel',
      };

      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, vehicleData);
        setSuccess('Veículo atualizado com sucesso!');
      } else {
        await api.post('/vehicles', vehicleData);
        setSuccess('Veículo cadastrado com sucesso!');
      }

      setDialogOpen(false);
      setEditingVehicle(null);
      setFormData({
        plate: '',
        type: '',
        brand: '',
        model: '',
        year: '',
        capacity: '',
        document: '',
        insurance_number: '',
        insurance_expiry: null,
      });
      carregarVeiculos();
    } catch (err) {
      console.error('Erro ao salvar veículo:', err);
      setError(
        err.response?.data?.error || 
        'Erro ao salvar veículo. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      plate: '',
      type: '',
      brand: '',
      model: '',
      year: '',
      capacity: '',
      document: '',
      insurance_number: '',
      insurance_expiry: null,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVehicle(null);
    setError('');
  };

  const getStatusColor = (status) => {
    const colors = {
      disponivel: 'success',
      em_uso: 'primary',
      manutencao: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      disponivel: 'Disponível',
      em_uso: 'Em Uso',
      manutencao: 'Em Manutenção',
    };
    return texts[status] || status;
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Meus Veículos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Adicionar Veículo
            </Button>
          </Box>

          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }} 
              onClose={() => setSuccess('')}
              variant="filled"
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError('')}
              variant="filled"
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : veiculos.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.paper' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum veículo cadastrado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Clique no botão acima para adicionar seu primeiro veículo
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ mt: 2 }}
              >
                Adicionar Veículo
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {veiculos.map((veiculo) => (
                <Grid item xs={12} sm={6} md={4} key={veiculo.id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {veiculo.plate}
                        </Typography>
                        <Chip
                          label={getStatusText(veiculo.status)}
                          color={getStatusColor(veiculo.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        {veiculo.brand} {veiculo.model}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ano: {veiculo.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Capacidade: {veiculo.capacity.toLocaleString('pt-BR')}kg
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tipo: {veiculo.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seguro: {veiculo.insurance_number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Vencimento: {new Date(veiculo.insurance_expiry).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        mt: 'auto', 
                        pt: 2, 
                        borderTop: 1, 
                        borderColor: 'divider',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        gap: 1 
                      }}>
                        <Button
                          size="small"
                          startIcon={<HistoryIcon />}
                          onClick={() => {
                            setSelectedVehicle(veiculo);
                            setHistoricoDialogOpen(true);
                          }}
                          sx={{ flexGrow: 1 }}
                        >
                          Histórico
                        </Button>
                        <Button
                          size="small"
                          startIcon={<BuildIcon />}
                          onClick={() => {
                            setSelectedVehicle(veiculo);
                            setMaintenanceDialogOpen(true);
                          }}
                          color={veiculo.status === 'manutencao' ? 'success' : 'warning'}
                          disabled={veiculo.status === 'em_uso'}
                          sx={{ flexGrow: 1 }}
                        >
                          {veiculo.status === 'manutencao' ? 'Disponível' : 'Manutenção'}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(veiculo)}
                          sx={{ flexGrow: 1 }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedVehicle(veiculo);
                            setDeleteConfirmOpen(true);
                          }}
                          disabled={veiculo.status === 'em_uso'}
                          sx={{ flexGrow: 1 }}
                        >
                          Excluir
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Diálogos */}
        <Dialog 
          open={deleteConfirmOpen} 
          onClose={() => setDeleteConfirmOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Confirmar Exclusão
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Typography>
              Tem certeza que deseja excluir o veículo <strong>{selectedVehicle?.plate}</strong>?
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={maintenanceDialogOpen} 
          onClose={() => setMaintenanceDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Alterar Status do Veículo
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Typography>
              {selectedVehicle?.status === 'manutencao'
                ? `Deseja marcar o veículo ${selectedVehicle?.plate} como disponível?`
                : `Deseja marcar o veículo ${selectedVehicle?.plate} como em manutenção?`}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={() => setMaintenanceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleMaintenanceToggle} 
              color="primary" 
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {editingVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: '16px !important' }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Placa"
                    name="plate"
                    value={formData.plate}
                    onChange={handleChange}
                    inputProps={{ 
                      style: { textTransform: 'uppercase' },
                      maxLength: 7
                    }}
                    helperText="Formato: ABC1D23"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    select
                    label="Tipo"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {tiposVeiculo.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Marca"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Modelo"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Ano"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    inputProps={{ min: "1900", max: new Date().getFullYear() + 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Capacidade (kg)"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    inputProps={{ min: "0", step: "0.1" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Documento (CRLV)"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Número do Seguro"
                    name="insurance_number"
                    value={formData.insurance_number}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Vencimento do Seguro"
                      value={formData.insurance_expiry}
                      onChange={handleDateChange}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? <CircularProgress size={24} /> : editingVehicle ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </Dialog>

        <HistoricoFretesDialog
          open={historicoDialogOpen}
          onClose={() => setHistoricoDialogOpen(false)}
          vehicleId={selectedVehicle?.id}
        />
      </Container>
    </Layout>
  );
} 