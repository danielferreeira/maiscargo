import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import api from '../services/api';
import SelecionarVeiculoDialog from '../components/SelecionarVeiculoDialog';
import FreteDisponivel from '../components/FreteDisponivel';

export default function BuscarFretes() {
  const { user } = useAuth();
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFreight, setSelectedFreight] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAllFreights, setShowAllFreights] = useState(false);
  const [filters, setFilters] = useState({
    origem: '',
    destino: '',
    tipo_veiculo: '',
    tipo_carga: '',
    regiao: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const tiposVeiculo = [
    'Caminhão 3/4',
    'Caminhão Toco',
    'Caminhão Truck',
    'Carreta Simples',
    'Carreta Baú',
    'Carreta Sider',
    'Carreta Graneleira',
  ];

  const tiposCarga = [
    'Granel',
    'Paletizada',
    'Frigorificada',
    'Perigosa',
    'Líquida',
    'Viva',
    'Veículos',
    'Contêiner',
    'Outros',
  ];

  const regioes = [
    'Norte',
    'Nordeste',
    'Centro-Oeste',
    'Sudeste',
    'Sul',
  ];

  useEffect(() => {
    if (user?.type !== 'transportador') {
      setError('Acesso restrito a transportadores');
      setLoading(false);
      return;
    }
    carregarFretes();
  }, [user, showAllFreights]);

  const carregarFretes = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Iniciando carregamento de fretes...');
      
      const response = await api.get('/freights/available', {
        params: { showAll: showAllFreights }
      });
      
      if (Array.isArray(response.data)) {
        setFretes(response.data);
        console.log('Fretes carregados:', response.data);
      } else {
        console.log('Resposta não é um array:', response.data);
        setFretes([]);
      }
    } catch (err) {
      console.error('Erro detalhado ao carregar fretes:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        config: err.config
      });
      
      setError(
        err.response?.data?.error || 
        'Não foi possível carregar os fretes. Tente novamente mais tarde.'
      );
      setFretes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      origem: '',
      destino: '',
      tipo_veiculo: '',
      tipo_carga: '',
      regiao: '',
    });
  };

  const handleAceitarFrete = async (vehicleId) => {
    try {
      setError('');
      await api.post(`/freights/${selectedFreight.id}/accept`, { vehicle_id: vehicleId });
      setSuccess('Frete aceito com sucesso!');
      setDialogOpen(false);
      carregarFretes();
    } catch (err) {
      console.error('Erro ao aceitar frete:', err);
      setError(err.response?.data?.error || 'Erro ao aceitar o frete. Tente novamente.');
    }
  };

  const filteredFretes = fretes.filter(frete => {
    const matchOrigem = !filters.origem || 
      frete.origin.toLowerCase().includes(filters.origem.toLowerCase());
    const matchDestino = !filters.destino || 
      frete.destination.toLowerCase().includes(filters.destino.toLowerCase());
    const matchTipoVeiculo = !filters.tipo_veiculo || 
      frete.vehicle_type === filters.tipo_veiculo;
    const matchTipoCarga = !filters.tipo_carga || 
      frete.cargo_type === filters.tipo_carga;
    const matchRegiao = !filters.regiao || 
      frete.origin.split(',').pop().trim().includes(filters.regiao);
    
    return matchOrigem && matchDestino && matchTipoVeiculo && matchTipoCarga && matchRegiao;
  });

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  if (user?.type !== 'transportador') {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Alert severity="error">
              Esta página é restrita a transportadores.
            </Alert>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Fretes Disponíveis
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterIcon />}
                sx={{ mr: 2 }}
              >
                Filtros
              </Button>
              <Button
                variant="contained"
                onClick={() => setShowAllFreights(!showAllFreights)}
                color={showAllFreights ? "secondary" : "primary"}
              >
                {showAllFreights ? "Ver Fretes Recomendados" : "Ver Todos os Fretes"}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {showFilters && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Origem"
                      name="origem"
                      value={filters.origem}
                      onChange={handleFilterChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Destino"
                      name="destino"
                      value={filters.destino}
                      onChange={handleFilterChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Tipo de Veículo"
                      name="tipo_veiculo"
                      value={filters.tipo_veiculo}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {tiposVeiculo.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Tipo de Carga"
                      name="tipo_carga"
                      value={filters.tipo_carga}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {tiposCarga.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Região"
                      name="regiao"
                      value={filters.regiao}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {regioes.map((regiao) => (
                        <MenuItem key={regiao} value={regiao}>
                          {regiao}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={clearFilters}
                      startIcon={<ClearIcon />}
                    >
                      Limpar Filtros
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Box sx={{ mt: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredFretes.length === 0 ? (
              <Alert severity="info">
                Nenhum frete disponível encontrado.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {filteredFretes.map((frete) => (
                  <Grid item xs={12} key={frete.id}>
                    <FreteDisponivel 
                      frete={frete} 
                      onAceitar={() => {
                        setSelectedFreight(frete);
                        setDialogOpen(true);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>

        <SelecionarVeiculoDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedFreight(null);
          }}
          onConfirm={handleAceitarFrete}
          freteInfo={selectedFreight}
        />
      </Container>
    </Layout>
  );
} 