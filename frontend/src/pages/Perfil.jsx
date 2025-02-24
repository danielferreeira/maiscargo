import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  TravelExplore as TravelExploreIcon,
  DocumentScanner as DocumentIcon,
  Settings as PreferencesIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import InputMask from 'react-input-mask';
import api from '../services/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { parseISO } from 'date-fns';
import EnderecoForm from '../components/EnderecoForm';

// Lista de estados brasileiros
const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Lista de regiões
const regioes = [
  'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'
];

// Lista de tipos de carga
const tiposCarga = [
  'Carga Geral', 'Granel', 'Frigorificada', 'Perigosa', 'Indivisível',
  'Container', 'Mudança', 'Veículos', 'Animais Vivos'
];

// Categorias de CNH
const categoriasCNH = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Perfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    phone: '',
    rg: '',
    rg_emissor: '',
    cnh: '',
    cnh_categoria: '',
    cnh_validade: null,
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    telefone_fixo: '',
    telefone_whatsapp: '',
    telefone_emergencia: '',
    contato_emergencia: '',
    raio_busca: 50,
    raio_sugerido: 100,
    regioes_preferidas: [],
    tipos_carga_preferidos: []
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Iniciando carregamento dos dados do perfil...');
      
      const response = await api.get('/users/profile');
      console.log('Dados recebidos do servidor:', response.data);
      
      // Garantir que todos os campos existam com valores padrão
      const dadosPadrao = {
        name: '',
        email: '',
        document: '',
        phone: '',
        rg: '',
        rg_emissor: '',
        cnh: '',
        cnh_categoria: '',
        cnh_validade: null,
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        telefone_fixo: '',
        telefone_whatsapp: '',
        telefone_emergencia: '',
        contato_emergencia: '',
        raio_busca: 50,
        raio_sugerido: 100,
        regioes_preferidas: [],
        tipos_carga_preferidos: []
      };

      const dadosRecebidos = response.data || {};
      
      // Combinar dados padrão com dados recebidos
      const dadosFormatados = {
        ...dadosPadrao,
        ...dadosRecebidos,
        // Se não houver telefone_whatsapp, usar o phone do cadastro
        telefone_whatsapp: dadosRecebidos.telefone_whatsapp || dadosRecebidos.phone || '',
        // Garantir que a data seja um objeto Date válido
        cnh_validade: dadosRecebidos.cnh_validade ? parseISO(dadosRecebidos.cnh_validade) : null,
        // Garantir que os arrays sejam inicializados corretamente
        regioes_preferidas: Array.isArray(dadosRecebidos.regioes_preferidas) ? dadosRecebidos.regioes_preferidas : [],
        tipos_carga_preferidos: Array.isArray(dadosRecebidos.tipos_carga_preferidos) ? dadosRecebidos.tipos_carga_preferidos : [],
        // Garantir que os valores numéricos sejam números
        raio_busca: Number(dadosRecebidos.raio_busca) || 50,
        raio_sugerido: Number(dadosRecebidos.raio_sugerido) || 100
      };

      console.log('Dados formatados:', dadosFormatados);
      setFormData(dadosFormatados);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
      let mensagemErro = 'Não foi possível carregar os dados do perfil.';
      
      if (!err.response) {
        mensagemErro += ' Verifique sua conexão com a internet.';
      } else if (err.response.status === 401) {
        mensagemErro = 'Sua sessão expirou. Por favor, faça login novamente.';
      } else if (err.response.status === 500) {
        mensagemErro += ' Erro interno do servidor.';
      }
      
      setError(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
    setError('');
    setSuccess('');
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      cnh_validade: date
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    if (e) {
    e.preventDefault();
    }

    try {
      setSaving(true);
      setError('');
      setFieldErrors({});
      setSuccess('');

      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        console.log('Erros de validação:', errors);
        setFieldErrors(errors);
        setError('Por favor, preencha todos os campos obrigatórios corretamente.');
        setSaving(false);
        return;
      }

      // Preparar dados para envio
      const updateData = {
        ...formData,
        // Remover caracteres especiais dos campos numéricos
        cep: formData.cep ? formData.cep.replace(/\D/g, '') : null,
        telefone_fixo: formData.telefone_fixo ? formData.telefone_fixo.replace(/\D/g, '') : null,
        telefone_whatsapp: formData.telefone_whatsapp ? formData.telefone_whatsapp.replace(/\D/g, '') : null,
        telefone_emergencia: formData.telefone_emergencia ? formData.telefone_emergencia.replace(/\D/g, '') : null,
        // Atualizar também o campo phone com o telefone_whatsapp
        phone: formData.telefone_whatsapp ? formData.telefone_whatsapp.replace(/\D/g, '') : null,
        // Garantir que arrays sejam enviados como arrays vazios se não houver dados
        regioes_preferidas: formData.regioes_preferidas || [],
        tipos_carga_preferidos: formData.tipos_carga_preferidos || [],
        // Converter valores numéricos
        raio_busca: formData.raio_busca ? Number(formData.raio_busca) : null,
        raio_sugerido: formData.raio_sugerido ? Number(formData.raio_sugerido) : null,
        // Garantir que a data seja enviada no formato correto
        cnh_validade: formData.cnh_validade ? formData.cnh_validade.toISOString() : null
      };

      console.log('Enviando dados para atualização:', updateData);
      const response = await api.put('/users/profile', updateData);
      console.log('Resposta da API:', response.data);

      setSuccess('Dados atualizados com sucesso!');
      await carregarDados(); // Recarrega os dados para confirmar o salvamento
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      
      if (err.response?.data?.details) {
        if (Array.isArray(err.response.data.details)) {
          const newErrors = {};
          err.response.data.details.forEach(detail => {
            newErrors[detail.field] = detail.message;
          });
          setError('Alguns campos contêm erros. Por favor, verifique.');
          // Atualizar o estado de erro para mostrar as mensagens específicas
          setFormData(prev => ({
            ...prev,
            errors: newErrors
          }));
        } else {
          setError(err.response.data.details);
        }
      } else {
        setError(
          err.response?.data?.error || 
          'Erro ao atualizar os dados. Por favor, tente novamente.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const validateForm = () => {
    const errors = {};
    
    // Validar campos baseado na aba atual
    if (tabValue === 0) { // Aba de Documentos
      if (user?.type === 'transportador') {
        // Validar CPF/CNPJ
        if (!formData.document) {
          errors.document = 'CPF/CNPJ é obrigatório';
        } else {
          const cleanDoc = formData.document.replace(/\D/g, '');
          if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
            errors.document = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos';
          }
        }

        // Validar RG
        if (!formData.rg) {
          errors.rg = 'RG é obrigatório';
        }

        // Validar Órgão Emissor
        if (!formData.rg_emissor) {
          errors.rg_emissor = 'Órgão emissor é obrigatório';
        }

        // Validar CNH
        if (!formData.cnh) {
          errors.cnh = 'CNH é obrigatória';
        }

        // Validar Categoria CNH
        if (!formData.cnh_categoria) {
          errors.cnh_categoria = 'Categoria da CNH é obrigatória';
        }

        // Validar Validade CNH
        if (!formData.cnh_validade) {
          errors.cnh_validade = 'Validade da CNH é obrigatória';
        } else {
          const hoje = new Date();
          if (formData.cnh_validade < hoje) {
            errors.cnh_validade = 'CNH não pode estar vencida';
          }
        }
      } else {
        // Validações para embarcador
        if (!formData.name) {
          errors.name = 'Nome é obrigatório';
        }
        if (!formData.email) {
          errors.email = 'E-mail é obrigatório';
        }
        if (!formData.document) {
          errors.document = 'CNPJ é obrigatório';
        } else {
          const cleanDoc = formData.document.replace(/\D/g, '');
          if (cleanDoc.length !== 14) {
            errors.document = 'CNPJ deve ter 14 dígitos';
          }
        }
      }
    }
    else if (tabValue === 1) { // Aba de Endereço
      const enderecoFields = {
        cep: 'CEP é obrigatório',
        logradouro: 'Logradouro é obrigatório',
        numero: 'Número é obrigatório',
        bairro: 'Bairro é obrigatório',
        cidade: 'Cidade é obrigatória',
        estado: 'Estado é obrigatório'
      };

      Object.entries(enderecoFields).forEach(([field, message]) => {
        if (!formData[field] || formData[field].trim() === '') {
          errors[field] = message;
        }
      });

      // Validar formato do CEP
      if (formData.cep && formData.cep.replace(/\D/g, '').length !== 8) {
        errors.cep = 'CEP deve ter 8 dígitos';
      }

      // Validar formato do estado
      if (formData.estado && !/^[A-Z]{2}$/.test(formData.estado)) {
        errors.estado = 'Estado deve ter 2 letras maiúsculas';
      }
    } 
    else if (tabValue === 2) { // Aba de Contatos
      // Validar WhatsApp (obrigatório)
      if (!formData.telefone_whatsapp) {
        errors.telefone_whatsapp = 'WhatsApp é obrigatório';
      } else {
        const cleanWhatsApp = formData.telefone_whatsapp.replace(/\D/g, '');
        if (cleanWhatsApp.length !== 11) {
          errors.telefone_whatsapp = 'WhatsApp deve ter 11 dígitos';
        }
      }

      // Validar Telefone de Emergência
      if (!formData.telefone_emergencia) {
        errors.telefone_emergencia = 'Telefone de emergência é obrigatório';
      } else {
        const cleanEmergencia = formData.telefone_emergencia.replace(/\D/g, '');
        if (cleanEmergencia.length !== 11) {
          errors.telefone_emergencia = 'Telefone de emergência deve ter 11 dígitos';
        }
      }

      // Validar Nome do Contato de Emergência
      if (!formData.contato_emergencia) {
        errors.contato_emergencia = 'Nome do contato de emergência é obrigatório';
      }

      // Validar Telefone Fixo (opcional)
      if (formData.telefone_fixo) {
        const cleanFixo = formData.telefone_fixo.replace(/\D/g, '');
        if (cleanFixo.length < 10) {
          errors.telefone_fixo = 'Telefone fixo deve ter no mínimo 10 dígitos';
        }
      }
    }

    return errors;
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

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Meu Perfil
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab icon={<DocumentIcon />} label="DOCUMENTOS" />
            <Tab icon={<LocationIcon />} label="ENDEREÇO" />
            <Tab icon={<PhoneIcon />} label="CONTATOS" />
            {user?.type === 'transportador' && (
              <Tab icon={<PreferencesIcon />} label="PREFERÊNCIAS" />
            )}
          </Tabs>

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

          <Box component="form" onSubmit={handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                {user?.type === 'transportador' ? (
                  <>
                <Grid item xs={12} md={6}>
                  <InputMask
                        mask={formData.document?.length > 11 ? "99.999.999/9999-99" : "999.999.999-99"}
                        value={formData.document || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <TextField
                        {...inputProps}
                        fullWidth
                            label={formData.document?.length > 11 ? "CNPJ" : "CPF"}
                        name="document"
                            error={!!fieldErrors.document}
                            helperText={fieldErrors.document}
                      />
                    )}
                  </InputMask>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="RG"
                    name="rg"
                        value={formData.rg || ''}
                    onChange={handleChange}
                        error={!!fieldErrors.rg}
                        helperText={fieldErrors.rg}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Órgão Emissor"
                    name="rg_emissor"
                        value={formData.rg_emissor || ''}
                    onChange={handleChange}
                        error={!!fieldErrors.rg_emissor}
                        helperText={fieldErrors.rg_emissor}
                  />
                </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="CNH"
                        name="cnh"
                        value={formData.cnh || ''}
                        onChange={handleChange}
                        error={!!fieldErrors.cnh}
                        helperText={fieldErrors.cnh}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!fieldErrors.cnh_categoria}>
                        <InputLabel>Categoria CNH</InputLabel>
                        <Select
                          name="cnh_categoria"
                          value={formData.cnh_categoria || ''}
                          onChange={handleChange}
                          label="Categoria CNH"
                        >
                          <MenuItem value="">
                            <em>Selecione</em>
                          </MenuItem>
                          {categoriasCNH.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                        <DatePicker
                          label="Validade CNH"
                          value={formData.cnh_validade}
                          onChange={handleDateChange}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!fieldErrors.cnh_validade,
                              helperText: fieldErrors.cnh_validade
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nome"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="E-mail"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email}
                      />
              </Grid>

                    <Grid item xs={12} md={6}>
                  <InputMask
                        mask="99.999.999/9999-99"
                        value={formData.document || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <TextField
                        {...inputProps}
                        fullWidth
                            label="CNPJ"
                            name="document"
                            error={!!fieldErrors.document}
                            helperText={fieldErrors.document}
                      />
                    )}
                  </InputMask>
                </Grid>

                    <Grid item xs={12} md={6}>
                      <InputMask
                        mask="(99) 99999-9999"
                        value={formData.phone || ''}
                    onChange={handleChange}
                      >
                        {(inputProps) => (
                  <TextField
                            {...inputProps}
                    fullWidth
                            label="Telefone Principal"
                            name="phone"
                            error={!!fieldErrors.phone}
                            helperText={fieldErrors.phone}
                          />
                        )}
                      </InputMask>
                </Grid>
                  </>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <EnderecoForm
                formData={formData}
                setFormData={setFormData}
                errors={fieldErrors}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InputMask
                    mask="(99) 9999-9999"
                    value={formData.telefone_fixo || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <TextField
                        {...inputProps}
                        fullWidth
                        label="Telefone Fixo"
                        name="telefone_fixo"
                        error={!!fieldErrors.telefone_fixo}
                        helperText={fieldErrors.telefone_fixo}
                      />
                    )}
                  </InputMask>
                </Grid>

                <Grid item xs={12} md={6}>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={formData.telefone_whatsapp || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <TextField
                        {...inputProps}
                        fullWidth
                        label="WhatsApp"
                        name="telefone_whatsapp"
                        error={!!fieldErrors.telefone_whatsapp}
                        helperText={fieldErrors.telefone_whatsapp}
                      />
                    )}
                  </InputMask>
                </Grid>

                <Grid item xs={12} md={6}>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={formData.telefone_emergencia || ''}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <TextField
                        {...inputProps}
                        fullWidth
                        label="Telefone de Emergência"
                        name="telefone_emergencia"
                        error={!!fieldErrors.telefone_emergencia}
                        helperText={fieldErrors.telefone_emergencia}
                      />
                    )}
                  </InputMask>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do Contato de Emergência"
                    name="contato_emergencia"
                    value={formData.contato_emergencia || ''}
                    onChange={handleChange}
                    error={!!fieldErrors.contato_emergencia}
                    helperText={fieldErrors.contato_emergencia}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {user?.type === 'transportador' && (
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Raio de Busca de Fretes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Define a distância máxima para buscar fretes a partir da sua localização
                    </Typography>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Slider
                        value={formData.raio_busca}
                        onChange={(event, newValue) => handleChange({ target: { name: 'raio_busca', value: newValue } })}
                        valueLabelDisplay="auto"
                        min={10}
                        max={500}
                        marks={[
                          { value: 10, label: '10 km' },
                          { value: 100, label: '100 km' },
                          { value: 250, label: '250 km' },
                          { value: 500, label: '500 km' },
                        ]}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Raio Sugerido para Fretes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Distância ideal para suas viagens (ajuda a encontrar fretes mais adequados)
                    </Typography>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Slider
                        value={formData.raio_sugerido}
                        onChange={(event, newValue) => handleChange({ target: { name: 'raio_sugerido', value: newValue } })}
                        valueLabelDisplay="auto"
                        min={50}
                        max={1000}
                        marks={[
                          { value: 50, label: '50 km' },
                          { value: 250, label: '250 km' },
                          { value: 500, label: '500 km' },
                          { value: 1000, label: '1000 km' },
                        ]}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Regiões de Preferência
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Regiões Preferidas</InputLabel>
                      <Select
                        multiple
                        value={formData.regioes_preferidas || []}
                        onChange={(e) => handleChange({ target: { name: 'regioes_preferidas', value: e.target.value } })}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                      >
                        {['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'].map((regiao) => (
                          <MenuItem key={regiao} value={regiao}>
                            {regiao}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Tipos de Carga Preferidos
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Tipos de Carga</InputLabel>
                      <Select
                        multiple
                        value={formData.tipos_carga_preferidos || []}
                        onChange={(e) => handleChange({ target: { name: 'tipos_carga_preferidos', value: e.target.value } })}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                      >
                        {[
                          'Carga Geral',
                          'Granel',
                          'Frigorificada',
                          'Perigosa',
                          'Indivisível',
                          'Container',
                          'Mudança',
                          'Veículos',
                          'Animais Vivos'
                        ].map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
} 