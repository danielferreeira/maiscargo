import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  LocalShipping as TruckIcon,
  TrendingUp as TrendingUpIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import CustoViagemCalculator from '../components/CustoViagemCalculator';
import api from '../services/api';

export default function GestaoFinanceira() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [financeiro, setFinanceiro] = useState({
    recebido: 0,
    aReceber: 0,
    custosTotais: 0,
    lucroTotal: 0,
    fretesConcluidos: [],
    fretesEmAndamento: [],
  });
  const [calculadoraOpen, setCalculadoraOpen] = useState(false);
  const [selectedFrete, setSelectedFrete] = useState(null);

  useEffect(() => {
    if (user?.type !== 'transportador') {
      setError('Acesso restrito a transportadores');
      setLoading(false);
      return;
    }
    carregarDados();
  }, [user]);

  const carregarDados = async (retry = true) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Iniciando carregamento dos dados financeiros...');
      
      // Verificar se o usuário está autenticado
      const token = localStorage.getItem('@MaisCargo:token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await api.get('/freights/data/financial');
      console.log('Resposta recebida:', response.data);
      
      if (!response.data || !response.data.resumo) {
        throw new Error('Dados financeiros inválidos recebidos do servidor');
      }

      const { resumo, fretesConcluidos, fretesEmAndamento } = response.data;
      
      // Garantir que todos os valores numéricos sejam válidos
      const dadosFinanceiros = {
        recebido: Number(resumo.valorRecebido) || 0,
        aReceber: Number(resumo.valorAReceber) || 0,
        custosTotais: Number(resumo.custosTotais) || 0,
        lucroTotal: Number(resumo.lucroTotal) || 0,
        fretesConcluidos: Array.isArray(fretesConcluidos) ? fretesConcluidos.map(frete => ({
          ...frete,
          price: Number(frete.price) || 0,
          custo_total: Number(frete.custo_total) || 0,
          lucro_estimado: Number(frete.lucro_estimado) || 0
        })) : [],
        fretesEmAndamento: Array.isArray(fretesEmAndamento) ? fretesEmAndamento.map(frete => ({
          ...frete,
          price: Number(frete.price) || 0,
          custo_total: Number(frete.custo_total) || 0,
          lucro_estimado: Number(frete.lucro_estimado) || 0
        })) : []
      };

      console.log('Dados financeiros processados:', dadosFinanceiros);
      setFinanceiro(dadosFinanceiros);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      
      // Se for erro de autenticação, redirecionar para login
      if (err.response?.status === 401) {
        localStorage.removeItem('@MaisCargo:token');
        localStorage.removeItem('@MaisCargo:user');
        window.location.href = '/login';
        return;
      }

      // Se for erro 500 e for primeira tentativa, tentar novamente
      if (err.response?.status === 500 && retry) {
        console.log('Tentando carregar dados novamente em 2 segundos...');
        setTimeout(() => carregarDados(false), 2000);
        return;
      }

      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.details || 
                         err.message || 
                         'Erro desconhecido ao carregar dados financeiros';
      
      setError(errorMessage);
      setFinanceiro({
        recebido: 0,
        aReceber: 0,
        custosTotais: 0,
        lucroTotal: 0,
        fretesConcluidos: [],
        fretesEmAndamento: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatarMoeda = (valor) => {
    const numero = parseFloat(valor) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleCalculadora = (frete) => {
    setSelectedFrete(frete);
    setCalculadoraOpen(true);
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
          <Typography variant="h4" gutterBottom>
            Gestão Financeira
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Cards de Resumo */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MoneyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Recebido</Typography>
                      </Box>
                      <Typography variant="h4" color="primary">
                        {formatarMoeda(financeiro.recebido)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TruckIcon color="info" sx={{ mr: 1 }} />
                        <Typography variant="h6">A Receber</Typography>
                      </Box>
                      <Typography variant="h4" color="info.main">
                        {formatarMoeda(financeiro.aReceber)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalculateIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="h6">Custos Totais</Typography>
                      </Box>
                      <Typography variant="h4" color="error.main">
                        {formatarMoeda(financeiro.custosTotais)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6">Lucro Total</Typography>
                      </Box>
                      <Typography variant="h4" color="success.main">
                        {formatarMoeda(financeiro.lucroTotal)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabs de Fretes */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Fretes em Andamento" />
                  <Tab label="Fretes Concluídos" />
                </Tabs>
              </Box>

              <Grid container spacing={2}>
                {(tabValue === 0 ? financeiro.fretesEmAndamento : financeiro.fretesConcluidos).map((frete) => (
                  <Grid item xs={12} key={frete.id}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Typography variant="h6" gutterBottom>
                              {frete.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {frete.origin} → {frete.destination}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Data de Coleta: {formatarData(frete.pickup_date)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Data de Entrega: {formatarData(frete.delivery_date)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" color="primary">
                                {formatarMoeda(frete.price)}
                              </Typography>
                              <Button
                                variant="outlined"
                                startIcon={<CalculateIcon />}
                                onClick={() => handleCalculadora(frete)}
                                sx={{ mt: 1 }}
                              >
                                Calcular Custos
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>

        {/* Modal da Calculadora */}
        <Dialog
          open={calculadoraOpen}
          onClose={() => setCalculadoraOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Calculadora de Custos - {selectedFrete?.title}
          </DialogTitle>
          <DialogContent>
            {selectedFrete && (
              <CustoViagemCalculator
                veiculo={selectedFrete.veiculo}
                distancia={selectedFrete.distance || 500}
                valorFrete={selectedFrete.price}
                freteId={selectedFrete.id}
                onClose={() => setCalculadoraOpen(false)}
                onSave={carregarDados}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  );
} 