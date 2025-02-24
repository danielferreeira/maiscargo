import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  InputAdornment,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import LocationSelector from '../components/LocationSelector';
import { calcularDistancia, obterCoordenadas } from '../utils/geoUtils';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function PublicarFrete() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openOrigemSelector, setOpenOrigemSelector] = useState(false);
  const [openDestinoSelector, setOpenDestinoSelector] = useState(false);
  const [distanciaInfo, setDistanciaInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    origin: '',
    origin_city: '',
    origin_state: '',
    destination: '',
    destination_city: '',
    destination_state: '',
    origin_lat: 0,
    origin_lng: 0,
    destination_lat: 0,
    destination_lng: 0,
    pickup_date: null,
    delivery_date: null,
    cargo_type: '',
    weight: '',
    vehicle_type: '',
    price: '',
    distance: 0,
    duration: '',
  });

  const tiposVeiculo = [
    'Caminhão 3/4',
    'Caminhão Toco',
    'Caminhão Truck',
    'Carreta Simples',
    'Carreta Baú',
    'Carreta Sider',
    'Carreta Graneleira',
    'Bi-Trem',
    'Rodo-Trem'
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

  const navigate = useNavigate();

  useEffect(() => {
    const calcularDistanciaRota = async () => {
      if (formData.origin && formData.destination) {
        try {
          const info = await calcularDistancia(formData.origin, formData.destination);
          setDistanciaInfo(info);
          setFormData(prev => ({
            ...prev,
            distance: info.distanciaEmMetros / 1000, // Converte para quilômetros
            duration: info.duracao
          }));
        } catch (error) {
          console.error('Erro ao calcular distância:', error);
        }
      }
    };

    calcularDistanciaRota();
  }, [formData.origin, formData.destination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleOrigemSelect = async (location) => {
    const endereco = `${location.cidade}, ${location.uf}, Brasil`;
    try {
      const coordenadas = await obterCoordenadas(endereco);
      
      // Garantir que os dados estejam formatados corretamente
      const cidadeFormatada = location.cidade.trim();
      const estadoFormatado = location.uf.trim().toUpperCase();
      
      setFormData(prev => ({
        ...prev,
        origin: `${cidadeFormatada}, ${estadoFormatado}`,
        origin_city: cidadeFormatada,
        origin_state: estadoFormatado,
        origin_lat: coordenadas.lat,
        origin_lng: coordenadas.lng
      }));
    } catch (error) {
      console.error('Erro ao obter coordenadas da origem:', error);
      setError('Erro ao obter coordenadas da cidade de origem. Por favor, tente novamente.');
    }
  };

  const handleDestinoSelect = async (location) => {
    const endereco = `${location.cidade}, ${location.uf}, Brasil`;
    try {
      const coordenadas = await obterCoordenadas(endereco);
      
      // Garantir que os dados estejam formatados corretamente
      const cidadeFormatada = location.cidade.trim();
      const estadoFormatado = location.uf.trim().toUpperCase();
      
      setFormData(prev => ({
        ...prev,
        destination: `${cidadeFormatada}, ${estadoFormatado}`,
        destination_city: cidadeFormatada,
        destination_state: estadoFormatado,
        destination_lat: coordenadas.lat,
        destination_lng: coordenadas.lng
      }));
    } catch (error) {
      console.error('Erro ao obter coordenadas do destino:', error);
      setError('Erro ao obter coordenadas da cidade de destino. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validação dos campos obrigatórios
      if (!formData.title || !formData.description || !formData.origin || !formData.destination ||
          !formData.pickup_date || !formData.delivery_date || !formData.cargo_type ||
          !formData.weight || !formData.vehicle_type || !formData.price) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Validação específica para cidade e estado
      if (!formData.origin_city || !formData.origin_state || !formData.destination_city || !formData.destination_state) {
        setError('Por favor, selecione corretamente as cidades de origem e destino.');
        setLoading(false);
        return;
      }

      // Validação das datas
      const pickupDate = new Date(formData.pickup_date);
      const deliveryDate = new Date(formData.delivery_date);
      const now = new Date();

      if (pickupDate < now) {
        setError('A data de coleta não pode ser no passado.');
        setLoading(false);
        return;
      }

      if (deliveryDate <= pickupDate) {
        setError('A data de entrega deve ser posterior à data de coleta.');
        setLoading(false);
        return;
      }

      // Formata os dados para envio
      const freightData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        origin: `${formData.origin_city}, ${formData.origin_state}`,
        origin_city: formData.origin_city.trim(),
        origin_state: formData.origin_state.trim(),
        destination: `${formData.destination_city}, ${formData.destination_state}`,
        destination_city: formData.destination_city.trim(),
        destination_state: formData.destination_state.trim(),
        origin_lat: Number(formData.origin_lat.toFixed(8)),
        origin_lng: Number(formData.origin_lng.toFixed(8)),
        destination_lat: Number(formData.destination_lat.toFixed(8)),
        destination_lng: Number(formData.destination_lng.toFixed(8)),
        pickup_date: new Date(formData.pickup_date).toISOString(),
        delivery_date: new Date(formData.delivery_date).toISOString(),
        cargo_type: formData.cargo_type,
        weight: Number(formData.weight),
        vehicle_type: formData.vehicle_type,
        price: Number(formData.price),
        distance: Math.round(Number(formData.distance) * 1000), // Convertendo km para metros
        duration: formData.duration
      };

      // Validação adicional dos campos numéricos
      if (isNaN(freightData.weight) || freightData.weight <= 0) {
        setError('O peso deve ser um número válido maior que zero.');
        setLoading(false);
        return;
      }

      if (isNaN(freightData.price) || freightData.price <= 0) {
        setError('O valor do frete deve ser um número válido maior que zero.');
        setLoading(false);
        return;
      }

      console.log('Dados do frete sendo enviados:', freightData);

      const response = await api.post('/freights', freightData);
      console.log('Resposta do servidor:', response.data);

      setSuccess('Frete publicado com sucesso!');
      setFormData({
        title: '',
        description: '',
        origin: '',
        origin_city: '',
        origin_state: '',
        destination: '',
        destination_city: '',
        destination_state: '',
        origin_lat: 0,
        origin_lng: 0,
        destination_lat: 0,
        destination_lng: 0,
        pickup_date: null,
        delivery_date: null,
        cargo_type: '',
        weight: '',
        vehicle_type: '',
        price: '',
        distance: 0,
        duration: '',
      });
      setDistanciaInfo(null);

      // Redireciona para a lista de fretes após sucesso
      navigate('/meus-fretes', {
        state: { message: 'Frete publicado com sucesso!' }
      });
    } catch (err) {
      console.error('Erro ao publicar frete:', err.response || err);
      
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         'Erro ao publicar o frete. Por favor, tente novamente.';
      
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.type !== 'embarcador') {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Alert severity="error">
              Esta página é restrita a embarcadores.
            </Alert>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Publicar Frete
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Origem"
                    name="origin"
                    value={formData.origin}
                    onClick={() => setOpenOrigemSelector(true)}
                    InputProps={{
                      readOnly: true,
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Destino"
                    name="destination"
                    value={formData.destination}
                    onClick={() => setOpenDestinoSelector(true)}
                    InputProps={{
                      readOnly: true,
                    }}
                    required
                  />
                </Grid>

                {distanciaInfo && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={`Distância: ${distanciaInfo.distancia}`}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Tempo estimado: ${distanciaInfo.duracao}`}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DateTimePicker
                      label="Data de Coleta"
                      value={formData.pickup_date}
                      onChange={handleDateChange('pickup_date')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DateTimePicker
                      label="Data de Entrega"
                      value={formData.delivery_date}
                      onChange={handleDateChange('delivery_date')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo de Carga"
                    name="cargo_type"
                    value={formData.cargo_type}
                    onChange={handleChange}
                    required
                  >
                    {tiposCarga.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Peso (kg)"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo de Veículo"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    required
                  >
                    {tiposVeiculo.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor do Frete"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Publicar Frete'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        <LocationSelector
          open={openOrigemSelector}
          onClose={() => setOpenOrigemSelector(false)}
          onSelect={handleOrigemSelect}
          title="Selecionar Origem"
        />

        <LocationSelector
          open={openDestinoSelector}
          onClose={() => setOpenDestinoSelector(false)}
          onSelect={handleDestinoSelect}
          title="Selecionar Destino"
        />
      </Container>
    </Layout>
  );
} 