import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import api from '../services/api';

export default function HistoricoFretesDialog({ open, onClose, vehicleId }) {
  const [fretes, setFretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && vehicleId) {
      carregarHistorico();
    }
  }, [open, vehicleId]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/vehicles/${vehicleId}/freights`);
      setFretes(response.data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Não foi possível carregar o histórico de fretes.');
    } finally {
      setLoading(false);
    }
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

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Histórico de Fretes</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : fretes.length === 0 ? (
          <Alert severity="info">
            Este veículo ainda não realizou nenhum frete.
          </Alert>
        ) : (
          <List>
            {fretes.map((frete, index) => (
              <div key={frete.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {frete.title}
                        </Typography>
                        <Chip
                          label={getStatusText(frete.status)}
                          color={getStatusColor(frete.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block">
                          {frete.origin} → {frete.destination}
                        </Typography>
                        <Typography variant="body2" component="span" display="block">
                          Coleta: {formatarData(frete.pickup_date)} | 
                          Entrega: {formatarData(frete.delivery_date)}
                        </Typography>
                        <Typography variant="body2" component="span" display="block">
                          Valor: {formatarPreco(frete.price)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </div>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
} 