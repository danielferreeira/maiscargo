import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  Divider,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

export default function SelecionarVeiculoDialog({ open, onClose, onConfirm, freteInfo }) {
  const [veiculos, setVeiculos] = useState([]);
  const [filteredVeiculos, setFilteredVeiculos] = useState([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: '',
    capacidadeMinima: '',
  });

  useEffect(() => {
    if (open) {
      carregarVeiculos();
    }
  }, [open]);

  useEffect(() => {
    filtrarVeiculos();
  }, [veiculos, filtros]);

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/vehicles');
      setVeiculos(response.data);
      setFilteredVeiculos(response.data);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
      setError('Não foi possível carregar os veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filtrarVeiculos = () => {
    if (!veiculos) return;
    
    let veiculosFiltrados = veiculos.filter(veiculo => {
      // Verifica se o veículo está disponível
      const isDisponivel = veiculo.status === 'disponivel';
      
      // Verifica se o tipo de veículo é compatível
      const tipoCompativel = !freteInfo?.vehicle_type || veiculo.type === freteInfo.vehicle_type;
      
      // Verifica se a capacidade é suficiente
      const capacidadeSuficiente = !freteInfo?.weight || veiculo.capacity >= freteInfo.weight;
      
      return isDisponivel && tipoCompativel && capacidadeSuficiente;
    });

    if (filtros.tipo) {
      veiculosFiltrados = veiculosFiltrados.filter(v => v.type === filtros.tipo);
    }

    if (filtros.capacidadeMinima) {
      veiculosFiltrados = veiculosFiltrados.filter(v => 
        v.capacity >= parseFloat(filtros.capacidadeMinima)
      );
    }

    setFilteredVeiculos(veiculosFiltrados);
  };

  const handleFiltroChange = (event) => {
    const { name, value } = event.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = () => {
    if (!selectedVeiculo) {
      setError('Selecione um veículo para continuar');
      return;
    }

    // Validações adicionais
    if (freteInfo?.weight && selectedVeiculo.capacity < freteInfo.weight) {
      setError('O veículo selecionado não possui capacidade suficiente para esta carga');
      return;
    }

    if (freteInfo?.vehicle_type && selectedVeiculo.type !== freteInfo.vehicle_type) {
      setError('O tipo do veículo selecionado não é compatível com o requisitado');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmAccept = () => {
    setConfirmDialogOpen(false);
    onConfirm(selectedVeiculo.id);
  };

  const handleClose = () => {
    setSelectedVeiculo(null);
    setError('');
    setFiltros({
      tipo: '',
      capacidadeMinima: '',
    });
    setConfirmDialogOpen(false);
    onClose();
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

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const tiposVeiculo = [
    'Caminhão 3/4',
    'Caminhão Toco',
    'Caminhão Truck',
    'Carreta Simples',
    'Carreta Baú',
    'Carreta Sider',
    'Carreta Graneleira',
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Selecionar Veículo para o Frete</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {freteInfo && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Informações do Frete
              </Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Título:</strong> {freteInfo.title}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Origem:</strong> {freteInfo.origin}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Destino:</strong> {freteInfo.destination}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tipo de Carga:</strong> {freteInfo.cargo_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tipo de Veículo:</strong> {freteInfo.vehicle_type || 'Não especificado'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Peso da Carga:</strong> {freteInfo.weight ? `${freteInfo.weight}kg` : 'Não especificado'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Valor do Frete:</strong> {formatarPreco(freteInfo.price)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" gutterBottom>
                        <strong>Data de Coleta:</strong> {freteInfo.pickup_date ? formatarData(freteInfo.pickup_date) : 'Não especificada'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Data de Entrega:</strong> {freteInfo.delivery_date ? formatarData(freteInfo.delivery_date) : 'Não especificada'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filtros
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Veículo</InputLabel>
                  <Select
                    name="tipo"
                    value={filtros.tipo}
                    onChange={handleFiltroChange}
                    label="Tipo de Veículo"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposVeiculo.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacidade Mínima (kg)"
                  name="capacidadeMinima"
                  type="number"
                  value={filtros.capacidadeMinima}
                  onChange={handleFiltroChange}
                  inputProps={{ min: "0", step: "0.1" }}
                />
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredVeiculos.length === 0 ? (
            <Alert severity="warning">
              Nenhum veículo disponível com os critérios selecionados.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {filteredVeiculos.map((veiculo) => (
                <Grid item xs={12} sm={6} key={veiculo.id}>
                  <Card 
                    variant={selectedVeiculo?.id === veiculo.id ? "outlined" : "elevation"}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedVeiculo?.id === veiculo.id ? 2 : 1,
                      borderColor: selectedVeiculo?.id === veiculo.id ? 'primary.main' : 'grey.300',
                      backgroundColor: selectedVeiculo?.id === veiculo.id ? 'action.selected' : 'inherit'
                    }}
                    onClick={() => setSelectedVeiculo(veiculo)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {veiculo.plate}
                        </Typography>
                        <Chip
                          label={getStatusText(veiculo.status)}
                          color={getStatusColor(veiculo.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body1">
                        {veiculo.brand} {veiculo.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tipo: {veiculo.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Capacidade: {veiculo.capacity}kg
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ano: {veiculo.year}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => setSelectedVeiculo(veiculo)}
                      >
                        {selectedVeiculo?.id === veiculo.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            onClick={handleConfirm}
            variant="contained"
            disabled={loading || !selectedVeiculo}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Aceitação do Frete</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Você está prestes a aceitar este frete com o seguinte veículo:
          </Typography>
          {selectedVeiculo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Veículo:</strong> {selectedVeiculo.plate} - {selectedVeiculo.brand} {selectedVeiculo.model}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Tipo:</strong> {selectedVeiculo.type}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Capacidade:</strong> {selectedVeiculo.capacity}kg
              </Typography>
            </Box>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            Ao aceitar o frete, você se compromete a realizar o transporte conforme as condições estabelecidas.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmAccept} variant="contained" color="primary">
            Aceitar Frete
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
} 