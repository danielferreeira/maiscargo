import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  LocalShipping as TruckIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import api from '../services/api';

export default function TransportadoresProximos({ freteId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transportadores, setTransportadores] = useState([]);
  const [selectedTransportador, setSelectedTransportador] = useState(null);
  const [contatoDialogOpen, setContatoDialogOpen] = useState(false);

  useEffect(() => {
    carregarTransportadores();
  }, [freteId]);

  const carregarTransportadores = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/freights/${freteId}/nearby-carriers`);
      setTransportadores(response.data);
    } catch (err) {
      console.error('Erro ao carregar transportadores:', err);
      setError(
        err.response?.data?.error || 
        'Erro ao carregar transportadores. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContatoClick = (transportador) => {
    setSelectedTransportador(transportador);
    setContatoDialogOpen(true);
  };

  const formatarDistancia = (distancia) => {
    return `${Math.round(distancia)} km`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="contained">
            Fechar
          </Button>
        </Box>
      </Box>
    );
  }

  if (transportadores.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Nenhum transportador próximo encontrado.</Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="contained">
            Fechar
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {transportadores.map((transportador) => (
          <Grid item xs={12} key={transportador.id}>
            <Card 
              sx={{
                borderLeft: 6,
                borderColor: transportador.withinRange ? 'success.main' : 'warning.main'
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      {transportador.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>
                        {transportador.cidade}, {transportador.estado}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TruckIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>
                        {transportador.vehicles.length} veículo(s) disponível(is)
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`Distância: ${formatarDistancia(transportador.distanceToOrigin)}`}
                        color={transportador.withinRange ? "success" : "warning"}
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Raio de busca: ${transportador.raio_busca} km`}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={() => handleContatoClick(transportador)}
                      sx={{ minWidth: 200 }}
                    >
                      Ver Contato
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={contatoDialogOpen} 
        onClose={() => setContatoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Informações de Contato</DialogTitle>
        <DialogContent>
          {selectedTransportador && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTransportador.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  {selectedTransportador.phone}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  {selectedTransportador.email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  {selectedTransportador.cidade}, {selectedTransportador.estado}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContatoDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </Box>
    </Box>
  );
} 