import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  LocalShipping as TruckIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

export default function FreteDisponivel({ frete, onAceitar }) {
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarDistancia = (distancia) => {
    return `${Math.round(distancia)} km`;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              {frete.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <LocationIcon color="primary" />
              <Typography>
                {frete.origin} → {frete.destination}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <ScheduleIcon color="info" />
              <Typography>
                Coleta: {formatarData(frete.pickup_date)}
                <br />
                Entrega: {formatarData(frete.delivery_date)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TruckIcon color="action" />
              <Typography>
                {frete.cargo_type} - {frete.weight}kg
                <br />
                Veículo: {frete.vehicle_type}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <SpeedIcon color="primary" />
                <Typography>
                  Distância total: {formatarDistancia(frete.distance)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TimelineIcon color="primary" />
                <Typography>
                  Tempo estimado: {frete.duration}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {frete.distance_from_transporter && (
                <Chip 
                  label={`Distância até você: ${formatarDistancia(frete.distance_from_transporter)}`}
                  color={frete.same_city ? "success" : "default"}
                  variant="outlined"
                />
              )}
              {frete.same_city && (
                <Chip 
                  label="Mesma Cidade"
                  color="success"
                />
              )}
              {frete.same_state && !frete.same_city && (
                <Chip 
                  label="Mesmo Estado"
                  color="info"
                />
              )}
              <Chip 
                label={`Região: ${frete.region}`}
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                <MoneyIcon sx={{ mr: 1 }} />
                {formatarMoeda(frete.price)}
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onAceitar(frete)}
                sx={{ mt: 2 }}
              >
                Aceitar Frete
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
} 