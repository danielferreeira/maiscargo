import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  DocumentScanner as DocumentIcon,
  LocationOn as LocationIcon,
  Phone as ContactIcon,
  Settings as PreferencesIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import EnderecoForm from '../components/EnderecoForm';
import PreferenciasTransportador from '../components/PreferenciasTransportador';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Carregando dados do usuário...');
      
      const response = await api.get('/users/profile');
      const userData = response.data;
      console.log('Dados do usuário carregados:', userData);

      setFormData({
        cep: userData.cep || '',
        logradouro: userData.logradouro || '',
        numero: userData.numero || '',
        complemento: userData.complemento || '',
        bairro: userData.bairro || '',
        cidade: userData.cidade || '',
        estado: userData.estado || '',
      });
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      setError('Erro ao carregar dados do usuário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = () => {
    const newErrors = {};
    
    if (!formData.cep || formData.cep.includes('_')) {
      newErrors.cep = 'CEP é obrigatório';
    }
    
    if (!formData.logradouro) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }
    
    if (!formData.numero) {
      newErrors.numero = 'Número é obrigatório';
    }
    
    if (!formData.bairro) {
      newErrors.bairro = 'Bairro é obrigatório';
    }
    
    if (!formData.cidade) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    
    if (!formData.estado) {
      newErrors.estado = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateAddress()) {
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Enviando dados do endereço:', formData);

      const addressData = {
        ...formData,
        cep: formData.cep.replace(/\D/g, ''),
      };

      await api.put('/users/profile', addressData);
      console.log('Endereço atualizado com sucesso');
      setSuccess('Endereço atualizado com sucesso!');
      
      // Recarrega os dados do usuário para garantir que tudo foi salvo corretamente
      await loadUserData();
    } catch (err) {
      console.error('Erro ao atualizar endereço:', err);
      
      if (err.response?.data?.details) {
        const newErrors = {};
        if (Array.isArray(err.response.data.details)) {
          err.response.data.details.forEach(detail => {
            newErrors[detail.field] = detail.message;
          });
          setErrors(newErrors);
        } else {
          setError(err.response.data.details);
        }
      } else {
        setError(
          err.response?.data?.error || 
          'Erro ao atualizar endereço. Por favor, tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Meu Perfil
          </Typography>

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

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="profile tabs"
            >
              <Tab icon={<DocumentIcon />} label="DOCUMENTOS" />
              <Tab icon={<LocationIcon />} label="ENDEREÇO" />
              <Tab icon={<ContactIcon />} label="CONTATOS" />
              {user?.type === 'transportador' && (
                <Tab icon={<PreferencesIcon />} label="PREFERÊNCIAS" />
              )}
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {/* Conteúdo da aba de documentos */}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <EnderecoForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {/* Conteúdo da aba de contatos */}
          </TabPanel>

          {user?.type === 'transportador' && (
            <TabPanel value={activeTab} index={3}>
              <PreferenciasTransportador />
            </TabPanel>
          )}
        </Box>
      </Container>
    </Layout>
  );
} 