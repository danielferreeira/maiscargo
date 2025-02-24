import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import { estados, getCidadesPorEstado } from '../utils/locationData';

export default function LocationSelector({ open, onClose, onSelect, title }) {
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedEstado) {
      setLoading(true);
      getCidadesPorEstado(selectedEstado)
        .then(cidadesData => {
          setCidades(cidadesData);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [selectedEstado]);

  const handleEstadoChange = (event) => {
    setSelectedEstado(event.target.value);
    setSelectedCidade('');
  };

  const handleCidadeChange = (event) => {
    setSelectedCidade(event.target.value);
  };

  const handleConfirm = () => {
    if (selectedEstado && selectedCidade) {
      const estado = estados.find(e => e.uf === selectedEstado);
      const cidade = cidades.find(c => c.id === selectedCidade);
      onSelect({
        estado: estado.nome,
        cidade: cidade.nome,
        uf: selectedEstado
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedEstado('');
    setSelectedCidade('');
    setCidades([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title || 'Selecionar Localização'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={selectedEstado}
                label="Estado"
                onChange={handleEstadoChange}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.uf} value={estado.uf}>
                    {estado.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cidade</InputLabel>
              <Select
                value={selectedCidade}
                label="Cidade"
                onChange={handleCidadeChange}
                disabled={!selectedEstado || loading}
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Carregando cidades...
                  </MenuItem>
                ) : (
                  cidades.map((cidade) => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleConfirm}
          disabled={!selectedEstado || !selectedCidade}
          variant="contained"
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
} 