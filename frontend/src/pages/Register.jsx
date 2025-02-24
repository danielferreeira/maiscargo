import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../services/api';
import InputMask from 'react-input-mask';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const tipoUsuario = location.state?.tipoUsuario;

  useEffect(() => {
    if (!tipoUsuario) {
      navigate('/tipo-usuario');
    }
  }, [tipoUsuario, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: tipoUsuario || '',
    documentType: tipoUsuario === 'embarcador' ? 'cnpj' : 'cpf',
    document: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
    setGeneralError('');
  };

  const handleDocumentTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      documentType: e.target.checked ? 'cnpj' : 'cpf',
      document: '', // Limpa o documento quando muda o tipo
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.document.trim()) {
      newErrors.document = 'Documento é obrigatório';
    } else {
      // Validação de CPF/CNPJ
      const cleanDoc = formData.document.replace(/\D/g, '');
      if (formData.documentType === 'cpf' && cleanDoc.length !== 11) {
        newErrors.document = 'CPF inválido';
      } else if (formData.documentType === 'cnpj' && cleanDoc.length !== 14) {
        newErrors.document = 'CNPJ inválido';
      }
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone = 'Telefone inválido';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setGeneralError('');
      setLoading(true);
      
      // Remove caracteres especiais do documento e telefone
      const document = formData.document.replace(/[^\d]/g, '');
      const phone = formData.phone.replace(/[^\d]/g, '');
      
      const { confirmPassword, documentType, ...registerData } = formData;
      
      const userData = {
        ...registerData,
        document,
        phone,
        type: tipoUsuario // Garante que está usando o tipo correto
      };

      console.log('Dados sendo enviados:', userData); // Para debug
      
      await api.post('/auth/register', userData);
      
      navigate('/login', { 
        state: { 
          message: 'Conta criada com sucesso! Por favor, faça login.' 
        } 
      });
    } catch (err) {
      console.error('Erro ao registrar:', err.response || err);
      
      if (err.response?.status === 404) {
        setGeneralError('Erro de conexão com o servidor. Por favor, verifique se o backend está rodando.');
      } else if (err.response?.data?.details) {
        const newErrors = {};
        if (Array.isArray(err.response.data.details)) {
          err.response.data.details.forEach(detail => {
            newErrors[detail.field] = detail.message;
          });
          setErrors(newErrors);
        } else {
          setGeneralError(err.response.data.details);
        }
      } else {
        setGeneralError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Erro ao criar conta. Por favor, tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getDocumentMask = () => {
    return formData.documentType === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99';
  };

  const getDocumentLabel = () => {
    return formData.documentType === 'cpf' ? 'CPF' : 'CNPJ';
  };

  if (!tipoUsuario) {
    return null;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/tipo-usuario"
            startIcon={<ArrowBackIcon />}
            sx={{ ml: -1 }}
          >
            Voltar
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Criar Conta como {tipoUsuario === 'transportador' ? 'Transportador' : 'Embarcador'}
          </Typography>
          {generalError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {generalError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome completo"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              type="email"
            />
            
            {tipoUsuario === 'transportador' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.documentType === 'cnpj'}
                    onChange={handleDocumentTypeChange}
                    name="documentType"
                  />
                }
                label="Sou Pessoa Jurídica (CNPJ)"
                sx={{ mt: 2, mb: 1 }}
              />
            )}

            <InputMask
              mask={getDocumentMask()}
              value={formData.document}
              onChange={handleChange}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  margin="normal"
                  required
                  fullWidth
                  id="document"
                  label={getDocumentLabel()}
                  name="document"
                  error={!!errors.document}
                  helperText={errors.document}
                />
              )}
            </InputMask>

            <InputMask
              mask="(99) 99999-9999"
              value={formData.phone}
              onChange={handleChange}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  margin="normal"
                  required
                  fullWidth
                  id="phone"
                  label="Telefone"
                  name="phone"
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              )}
            </InputMask>

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || 'Mínimo de 6 caracteres'}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar senha"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Já tem uma conta? Entre aqui
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 