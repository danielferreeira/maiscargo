import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import api from '../services/api';

export default function EditarFrete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [frete, setFrete] = useState({
    title: '',
    description: '',
    price: '',
    pickup_datetime: '',
    delivery_datetime: '',
  });

  useEffect(() => {
    if (user?.type !== 'embarcador') {
      setError('Acesso restrito a embarcadores');
      setLoading(false);
      return;
    }
    carregarFrete();
  }, [id, user]);

  const carregarFrete = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/freights/${id}`);
      const { title, description, price, pickup_date, delivery_date } = response.data;
      
      // Converter para o formato datetime-local
      const pickupDateTime = new Date(pickup_date);
      const deliveryDateTime = new Date(delivery_date);

      setFrete({
        title,
        description,
        price,
        pickup_datetime: pickupDateTime.toISOString().slice(0, 16),
        delivery_datetime: deliveryDateTime.toISOString().slice(0, 16),
      });
    } catch (err) {
      console.error('Erro ao carregar frete:', err);
      setError('Não foi possível carregar os dados do frete.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFrete(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const freteToSubmit = {
        ...frete,
        pickup_date: new Date(frete.pickup_datetime).toISOString(),
        delivery_date: new Date(frete.delivery_datetime).toISOString(),
      };
      
      await api.put(`/freights/${id}`, freteToSubmit);
      
      setSuccess('Frete atualizado com sucesso!');
      setTimeout(() => {
        navigate('/meus-fretes', { state: { message: 'Frete atualizado com sucesso!' } });
      }, 2000);
    } catch (err) {
      console.error('Erro ao atualizar frete:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar frete. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error && !frete.title) {
    return (
      <Layout>
        <Container>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ 
          mt: 4, 
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              pb: 1,
              mb: 3
            }}
          >
            Editar Frete
          </Typography>

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

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              {success}
            </Alert>
          )}

          <Card 
            sx={{ 
              p: 3,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    name="title"
                    value={frete.title}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={frete.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Valor (R$)"
                    name="price"
                    type="number"
                    value={frete.price}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Data e Hora de Coleta"
                    name="pickup_datetime"
                    type="datetime-local"
                    value={frete.pickup_datetime}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Data e Hora de Entrega"
                    name="delivery_datetime"
                    type="datetime-local"
                    value={frete.delivery_datetime}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'flex-end',
                    mt: 2 
                  }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/meus-fretes')}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontSize: '1rem'
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: 2
                      }}
                    >
                      Salvar Alterações
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Box>
      </Container>
    </Layout>
  );
} 