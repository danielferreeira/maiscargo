import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TransportadoresProximos from '../components/TransportadoresProximos';
import { formatarData, formatarPreco } from '../utils/format';

export default function MeusFretes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [tabValue, setTabValue] = useState(0);
  const [selectedFreteId, setSelectedFreteId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (success) {
      // Limpa a mensagem do histórico
      window.history.replaceState({}, document.title);
    }
    carregarFretes();
  }, []);

  const carregarFretes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/freights');
      setFretes(response.data);
    } catch (err) {
      console.error('Erro ao carregar fretes:', err);
      setError('Não foi possível carregar os fretes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    const colors = {
      disponivel: 'info',
      em_negociacao: 'warning',
      aceito: 'primary',
      em_transporte: 'secondary',
      finalizado: 'success',
      cancelado: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      disponivel: 'Disponível',
      em_negociacao: 'Em Negociação',
      aceito: 'Aceito',
      em_transporte: 'Em Transporte',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return texts[status] || status;
  };

  const handleAction = async (freteId, action) => {
    try {
      setError('');
      setSuccess('');
      
      await api.post(`/freights/${freteId}/${action}`);
      
      setSuccess(
        action === 'start' ? 'Transporte iniciado com sucesso!' :
        action === 'finish' ? 'Frete finalizado com sucesso!' :
        action === 'cancel' ? 'Frete cancelado com sucesso!' :
        'Operação realizada com sucesso!'
      );
      
      carregarFretes();
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      setError(
        err.response?.data?.error || 
        'Erro ao executar ação. Por favor, tente novamente.'
      );
    }
  };

  const renderActionButtons = (frete) => {
    if (user.type === 'transportador') {
      switch (frete.status) {
        case 'aceito':
          return (
            <Tooltip title="Iniciar Transporte">
              <IconButton
                color="primary"
                onClick={() => handleAction(frete.id, 'start')}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            </Tooltip>
          );
        case 'em_transporte':
          return (
            <Tooltip title="Finalizar Transporte">
              <IconButton
                color="success"
                onClick={() => handleAction(frete.id, 'finish')}
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  }
                }}
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          );
        default:
          return null;
      }
    } else { // embarcador
      if (frete.status === 'disponivel') {
        return (
          <Tooltip title="Cancelar Frete">
            <IconButton
              color="error"
              onClick={() => handleAction(frete.id, 'cancel')}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark',
                }
              }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        );
      }
      return null;
    }
  };

  const fretesFiltrados = fretes.filter(frete => {
    if (user.type === 'transportador') {
      return frete.carrier_id === user.id;
    } else {
      return frete.user_id === user.id;
    }
  });

  const fretesPorStatus = {
    ativos: fretesFiltrados.filter(f => !['finalizado', 'cancelado'].includes(f.status)),
    finalizados: fretesFiltrados.filter(f => ['finalizado', 'cancelado'].includes(f.status)),
  };

  const handleVerTransportadores = (freteId) => {
    setSelectedFreteId(freteId);
    setDialogOpen(true);
  };

  const renderFreteButtons = (frete) => {
    return (
      <Box sx={{ 
        display: 'flex', 
        gap: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}>
        {renderActionButtons(frete)}
        {user.type === 'embarcador' && frete.status === 'disponivel' && (
          <>
            <Tooltip title="Ver Transportadores">
              <IconButton
                color="primary"
                onClick={() => handleVerTransportadores(frete.id)}
                sx={{
                  border: 1,
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50',
                  }
                }}
              >
                <GroupIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar Frete">
              <IconButton
                color="primary"
                onClick={() => navigate(`/editar-frete/${frete.id}`)}
                sx={{
                  border: 1,
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50',
                  }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    );
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              pb: 1,
              mb: 3
            }}
          >
            Meus Fretes
          </Typography>

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minWidth: '120px'
            }
          }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Ativos" />
              <Tab label="Finalizados" />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {(tabValue === 0 ? fretesPorStatus.ativos : fretesPorStatus.finalizados).map((frete) => (
                <Grid item xs={12} key={frete.id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6">
                              {frete.title}
                            </Typography>
                            <Chip
                              label={getStatusText(frete.status)}
                              color={getStatusColor(frete.status)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body1" color="text.secondary" paragraph>
                            {frete.description}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Origem:</strong> {frete.origin}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Destino:</strong> {frete.destination}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Tipo de Carga:</strong> {frete.cargo_type}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Peso:</strong> {frete.weight}kg
                              </Typography>
                              {frete.volume && (
                                <Typography variant="body2">
                                  <strong>Volume:</strong> {frete.volume}m³
                                </Typography>
                              )}
                              <Typography variant="body2">
                                <strong>Veículo:</strong> {frete.vehicle_type}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                              {formatarPreco(frete.price)}
                            </Typography>
                            <Typography variant="body2">
                              Coleta: {formatarData(frete.pickup_date)}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              Entrega: {formatarData(frete.delivery_date)}
                            </Typography>
                            {renderFreteButtons(frete)}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {(tabValue === 0 ? fretesPorStatus.ativos : fretesPorStatus.finalizados).length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Nenhum frete {tabValue === 0 ? 'ativo' : 'finalizado'} encontrado.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Box>

        {/* Diálogo de Transportadores Próximos */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transportadores Próximos
          </DialogTitle>
          <DialogContent>
            {selectedFreteId && (
              <TransportadoresProximos 
                freteId={selectedFreteId}
                onClose={() => setDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  );
} 