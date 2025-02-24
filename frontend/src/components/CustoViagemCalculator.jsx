import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Divider,
  Button,
  Alert,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Calculate as CalculateIcon, Save as SaveIcon } from '@mui/icons-material';
import api from '../services/api';

export default function CustoViagemCalculator({ veiculo, distancia, valorFrete, freteId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [custos, setCustos] = useState({
    precoDiesel: 6.50, // Valor médio do diesel
    consumoKmL: veiculo?.consumoMedio || 3.5, // Consumo médio em km/l
    pedagio: 0,
    alimentacao: 150, // Valor médio por dia
    hospedagem: 120, // Valor médio por dia
    manutencao: 0.35, // Custo por km rodado
    outrosCustos: 0,
    diasViagem: 1,
    margemLucro: 20, // Porcentagem
  });

  const [resultados, setResultados] = useState({
    custoCombustivel: 0,
    custoPedagio: 0,
    custoAlimentacao: 0,
    custoHospedagem: 0,
    custoManutencao: 0,
    custoTotal: 0,
    lucroEstimado: 0,
    margemLucroReal: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustos(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calcularCustos = () => {
    // Cálculo do custo de combustível
    const custoCombustivel = (distancia / custos.consumoKmL) * custos.precoDiesel;
    
    // Cálculo dos custos de alimentação e hospedagem
    const custoAlimentacao = custos.alimentacao * custos.diasViagem;
    const custoHospedagem = custos.hospedagem * custos.diasViagem;
    
    // Cálculo do custo de manutenção
    const custoManutencao = distancia * custos.manutencao;
    
    // Custo total
    const custoTotal = custoCombustivel + 
                      custos.pedagio + 
                      custoAlimentacao + 
                      custoHospedagem + 
                      custoManutencao + 
                      custos.outrosCustos;
    
    // Cálculo do lucro
    const lucroEstimado = valorFrete - custoTotal;
    const margemLucroReal = (lucroEstimado / valorFrete) * 100;

    setResultados({
      custoCombustivel,
      custoPedagio: custos.pedagio,
      custoAlimentacao,
      custoHospedagem,
      custoManutencao,
      custoTotal,
      lucroEstimado,
      margemLucroReal,
    });
  };

  const salvarCustos = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const dadosCustos = {
        custo_combustivel: resultados.custoCombustivel,
        custo_pedagio: resultados.custoPedagio,
        custo_alimentacao: resultados.custoAlimentacao,
        custo_hospedagem: resultados.custoHospedagem,
        custo_manutencao: resultados.custoManutencao,
        outros_custos: custos.outrosCustos,
        custo_total: resultados.custoTotal,
        lucro_estimado: resultados.lucroEstimado,
        margem_lucro: resultados.margemLucroReal
      };

      await api.put(`/freights/${freteId}/costs`, dadosCustos);
      setSuccess('Custos salvos com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar custos:', err);
      setError('Erro ao salvar os custos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (distancia && valorFrete) {
      calcularCustos();
    }
  }, [custos, distancia, valorFrete]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Calculadora de Custos de Viagem
        </Typography>
        
        <Grid container spacing={3}>
          {/* Inputs */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Parâmetros da Viagem
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preço do Diesel (R$/L)"
                  name="precoDiesel"
                  type="number"
                  value={custos.precoDiesel}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Consumo Médio (Km/L)"
                  name="consumoKmL"
                  type="number"
                  value={custos.consumoKmL}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Km/L</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pedágios"
                  name="pedagio"
                  type="number"
                  value={custos.pedagio}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dias de Viagem"
                  name="diasViagem"
                  type="number"
                  value={custos.diasViagem}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custo Diário - Alimentação"
                  name="alimentacao"
                  type="number"
                  value={custos.alimentacao}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custo Diário - Hospedagem"
                  name="hospedagem"
                  type="number"
                  value={custos.hospedagem}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custo de Manutenção por Km"
                  name="manutencao"
                  type="number"
                  value={custos.manutencao}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Outros Custos"
                  name="outrosCustos"
                  type="number"
                  value={custos.outrosCustos}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Resultados */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Resultados
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Distância: {distancia} km
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Valor do Frete: {formatarMoeda(valorFrete)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body2">
                  Custo de Combustível: {formatarMoeda(resultados.custoCombustivel)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2">
                  Custo de Pedágios: {formatarMoeda(resultados.custoPedagio)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2">
                  Custo de Alimentação: {formatarMoeda(resultados.custoAlimentacao)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2">
                  Custo de Hospedagem: {formatarMoeda(resultados.custoHospedagem)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2">
                  Custo de Manutenção: {formatarMoeda(resultados.custoManutencao)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">
                  Custo Total: {formatarMoeda(resultados.custoTotal)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color={resultados.lucroEstimado >= 0 ? "success.main" : "error.main"}>
                  Lucro Estimado: {formatarMoeda(resultados.lucroEstimado)}
                </Typography>
                <Typography variant="body2" color={resultados.margemLucroReal >= 0 ? "success.main" : "error.main"}>
                  Margem de Lucro: {resultados.margemLucroReal.toFixed(2)}%
                </Typography>
              </Grid>

              {resultados.margemLucroReal < custos.margemLucro && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    A margem de lucro está abaixo do esperado ({custos.margemLucro}%)
                  </Alert>
                </Grid>
              )}

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                </Grid>
              )}

              {success && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={salvarCustos}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Salvando...' : 'Salvar Custos'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
} 