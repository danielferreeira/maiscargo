import { useState } from 'react';
import {
  Grid,
  TextField,
  CircularProgress,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { consultarCEP } from '../utils/cepUtils';
import { estados } from '../utils/locationData';
import InputMask from 'react-input-mask';

export default function EnderecoForm({ formData, setFormData, errors = {} }) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  const buscarCEP = async (cep) => {
    // Não busca se o CEP estiver incompleto
    if (!cep || cep.includes('_') || cep.length !== 9) {
      return;
    }

    try {
      setLoadingCep(true);
      setCepError('');
      console.log('Iniciando busca do CEP:', cep);
      
      const endereco = await consultarCEP(cep);
      console.log('Endereço retornado pela API:', endereco);
      
      if (!endereco.estado || !endereco.cidade) {
        throw new Error('CEP não retornou um endereço válido');
      }
      
      // Atualiza o formulário com os dados retornados
      setFormData(prevData => ({
        ...prevData,
        cep: endereco.cep,
        logradouro: endereco.logradouro || prevData.logradouro,
        bairro: endereco.bairro || prevData.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        complemento: endereco.complemento || prevData.complemento
      }));
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      setCepError(error.message);
      
      // Limpa os campos de endereço em caso de erro
      setFormData(prevData => ({
        ...prevData,
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        complemento: ''
      }));
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e) => {
    const { value } = e.target;
    console.log('CEP sendo digitado:', value);
    
    // Atualiza o valor do CEP no formData
    setFormData(prev => ({
      ...prev,
      cep: value
    }));

    // Limpa o erro se estiver digitando
    if (cepError) {
      setCepError('');
    }
  };

  const handleCepBlur = (e) => {
    const { value } = e.target;
    console.log('Campo CEP perdeu o foco. Valor:', value);
    
    if (value && !value.includes('_') && value.length === 9) {
      buscarCEP(value);
    } else if (value && value.length > 0) {
      setCepError('CEP inválido. Digite um CEP completo.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Campo ${name} alterado para:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <InputMask
          mask="99999-999"
          value={formData.cep || ''}
          onChange={handleCepChange}
          onBlur={handleCepBlur}
          maskChar="_"
          disabled={loadingCep}
        >
          {(inputProps) => (
            <TextField
              {...inputProps}
              fullWidth
              required
              label="CEP"
              name="cep"
              error={!!errors.cep || !!cepError}
              helperText={errors.cep || cepError}
              InputProps={{
                endAdornment: loadingCep && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              }}
            />
          )}
        </InputMask>
      </Grid>

      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          required
          label="Logradouro"
          name="logradouro"
          value={formData.logradouro || ''}
          onChange={handleChange}
          error={!!errors.logradouro}
          helperText={errors.logradouro}
          disabled={loadingCep}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          required
          label="Número"
          name="numero"
          value={formData.numero || ''}
          onChange={handleChange}
          error={!!errors.numero}
          helperText={errors.numero}
        />
      </Grid>

      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          label="Complemento"
          name="complemento"
          value={formData.complemento || ''}
          onChange={handleChange}
          error={!!errors.complemento}
          helperText={errors.complemento}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Bairro"
          name="bairro"
          value={formData.bairro || ''}
          onChange={handleChange}
          error={!!errors.bairro}
          helperText={errors.bairro}
          disabled={loadingCep}
        />
      </Grid>

      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          required
          label="Cidade"
          name="cidade"
          value={formData.cidade || ''}
          onChange={handleChange}
          error={!!errors.cidade}
          helperText={errors.cidade}
          disabled={loadingCep}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <FormControl fullWidth required error={!!errors.estado}>
          <InputLabel id="estado-label">Estado</InputLabel>
          <Select
            labelId="estado-label"
            value={formData.estado || ''}
            label="Estado"
            name="estado"
            onChange={handleChange}
            disabled={loadingCep}
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            {estados.map((estado) => (
              <MenuItem key={estado.uf} value={estado.uf}>
                {estado.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {cepError && (
        <Grid item xs={12}>
          <Alert severity="error">
            {cepError}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
} 