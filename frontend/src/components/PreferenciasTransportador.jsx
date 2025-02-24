import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Alert,
  Slider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const REGIOES_BRASIL = [
  'Norte',
  'Nordeste',
  'Centro-Oeste',
  'Sudeste',
  'Sul'
];

const TIPOS_CARGA = [
  'Granel',
  'Container',
  'Carga Seca',
  'Refrigerada',
  'Perigosa',
  'Indivisível',
  'Veículos',
  'Mudança',
  'Outros'
];

export default function PreferenciasTransportador() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    raio_busca: user?.raio_busca || 100,
    raio_sugerido: user?.raio_sugerido || 200,
    regioes_preferidas: user?.regioes_preferidas || [],
    tipos_carga_preferidos: user?.tipos_carga_preferidos || []
  });

  const handleSliderChange = (field) => (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const handleMultiSelectChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/users/preferences', formData);
      
      if (response.data) {
        setSuccess('Preferências atualizadas com sucesso!');
        updateUser(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar preferências');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Preferências de Busca
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Raio de Busca (km): {formData.raio_busca}
            </Typography>
            <Slider
              value={formData.raio_busca}
              onChange={handleSliderChange('raio_busca')}
              min={50}
              max={1000}
              step={50}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Raio Sugerido (km): {formData.raio_sugerido}
            </Typography>
            <Slider
              value={formData.raio_sugerido}
              onChange={handleSliderChange('raio_sugerido')}
              min={100}
              max={2000}
              step={100}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Regiões Preferidas</InputLabel>
            <Select
              multiple
              value={formData.regioes_preferidas}
              onChange={handleMultiSelectChange('regioes_preferidas')}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {REGIOES_BRASIL.map((regiao) => (
                <MenuItem key={regiao} value={regiao}>
                  {regiao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Tipos de Carga Preferidos</InputLabel>
            <Select
              multiple
              value={formData.tipos_carga_preferidos}
              onChange={handleMultiSelectChange('tipos_carga_preferidos')}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {TIPOS_CARGA.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 