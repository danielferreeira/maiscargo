import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  LocalShipping as TruckIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserContext } from '../contexts/UserContext';

export default function AvailableFreightsTab() {
  const navigate = useNavigate();
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    carregarFretes();
  }, []);

  const carregarFretes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/freights/public');
      setFretes(response.data);
    } catch (error) {
      console.error('Erro ao carregar fretes:', error);
      setError('Não foi possível carregar os fretes disponíveis.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        {fretes.map((frete) => (
          <Grid item xs={12} key={frete.id}>
            <Card sx={{ 
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Origem
                        </Typography>
                        <Typography variant="body1">
                          {frete.origem_cidade} - {frete.origem_estado}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                    <ArrowIcon />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationIcon color="error" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Destino
                        </Typography>
                        <Typography variant="body1">
                          {frete.destino_cidade} - {frete.destino_estado}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TruckIcon color="action" />
                      <Typography variant="body2">
                        {frete.tipo_veiculo}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    * Faça login ou cadastre-se para ver mais detalhes
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/login')}
                    >
                      Ver Detalhes
                    </Button>
                    {user.role === 'EMBARCADOR' && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => navigate(`/edit-freight/${frete.id}`)}
                      >
                        Editar
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {fretes.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum frete disponível no momento
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 