import { Box, Button, Container, Typography, Grid, Card, CardContent, Divider, Stack, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import {
  LocalShipping as TruckIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Warning as AlertIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  MonetizationOn as MoneyIcon,
  People as PeopleIcon,
} from '@mui/icons-material'
import api from '../services/api'
import HeroImage from '../components/HeroImage'

// Componente para seção de benefícios
const BenefitCard = ({ icon: Icon, title, description }) => (
  <Card sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <Icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Card>
);

// Componente para seção de como funciona
const StepCard = ({ number, title, description }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 3, 
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box 
        sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          mr: 2,
        }}
      >
        {number}
      </Box>
      <Typography variant="h6">
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

// Componente do Dashboard do Embarcador
function EmbarcadorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalFretes: 0,
    fretesAtivos: 0,
    fretesConcluidos: 0,
    fretesCancelados: 0,
  })
  const [ultimosFretes, setUltimosFretes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const response = await api.get('/freights')
      const fretes = response.data

      // Calcula estatísticas
      const stats = {
        totalFretes: fretes.length,
        fretesAtivos: fretes.filter(f => ['disponivel', 'aceito', 'em_transporte'].includes(f.status)).length,
        fretesConcluidos: fretes.filter(f => f.status === 'finalizado').length,
        fretesCancelados: fretes.filter(f => f.status === 'cancelado').length,
      }

      setStats(stats)
      setUltimosFretes(fretes.slice(0, 5)) // Pega os 5 últimos fretes
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      disponivel: '#2196f3',
      aceito: '#ff9800',
      em_transporte: '#9c27b0',
      finalizado: '#4caf50',
      cancelado: '#f44336',
    }
    return colors[status] || '#757575'
  }

  const getStatusText = (status) => {
    const texts = {
      disponivel: 'Disponível',
      aceito: 'Aceito',
      em_transporte: 'Em Transporte',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    }
    return texts[status] || status
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco)
  }

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Dashboard
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/publicar-frete')}
              sx={{ borderRadius: 2 }}
            >
              Publicar Novo Frete
            </Button>
          </Box>

          {/* Cards de Estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TruckIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.totalFretes}
                      </Typography>
                      <Typography variant="body2">
                        Total de Fretes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'warning.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PendingIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.fretesAtivos}
                      </Typography>
                      <Typography variant="body2">
                        Fretes Ativos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.fretesConcluidos}
                      </Typography>
                      <Typography variant="body2">
                        Fretes Concluídos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'error.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AlertIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.fretesCancelados}
                      </Typography>
                      <Typography variant="body2">
                        Fretes Cancelados
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Últimos Fretes */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Últimos Fretes
              </Typography>
              <Stack spacing={2}>
                {ultimosFretes.map((frete) => (
                  <Box key={frete.id}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {frete.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {frete.origin} → {frete.destination}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2">
                          Coleta: {formatarData(frete.pickup_date)}
                        </Typography>
                        <Typography variant="body2">
                          Entrega: {formatarData(frete.delivery_date)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }}>
                          {formatarPreco(frete.price)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: getStatusColor(frete.status),
                            fontWeight: 'medium'
                          }}
                        >
                          {getStatusText(frete.status)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                {ultimosFretes.length === 0 && (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    Nenhum frete publicado ainda
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Layout>
  )
}

// Componente do Dashboard do Transportador
function TransportadorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Bem-vindo, {user?.name}!
            </Typography>
            <Button
              variant="contained"
              startIcon={<TruckIcon />}
              onClick={() => navigate('/buscar-fretes')}
              sx={{ borderRadius: 2 }}
            >
              Buscar Fretes Disponíveis
            </Button>
          </Box>

          {/* Seção de Destaque */}
          <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Encontre as Melhores Oportunidades
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Acesse nossa bolsa de fretes e encontre cargas compatíveis com seu veículo.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
                onClick={() => navigate('/buscar-fretes')}
              >
                Ver Fretes Disponíveis
              </Button>
            </CardContent>
          </Card>

          {/* Grid de Ações Rápidas */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Meus Veículos
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Gerencie sua frota e mantenha os documentos atualizados.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/meus-veiculos')}
                  >
                    Gerenciar Veículos
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fretes em Andamento
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Acompanhe seus fretes ativos e entregas pendentes.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/meus-fretes')}
                  >
                    Ver Meus Fretes
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Histórico
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Consulte seu histórico de fretes e avaliações.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/meus-fretes')}
                  >
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { signed, user } = useAuth()

  // Se o usuário estiver logado, mostra o dashboard específico
  if (signed) {
    if (user?.type === 'embarcador') {
      return <EmbarcadorDashboard />
    } else {
      return <TransportadorDashboard />
    }
  }

  // Página inicial para visitantes
  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                sx={{ 
                  fontWeight: 'bold',
                  mb: 3,
                  background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Conectamos Cargas e Transportadores
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                A plataforma que simplifica a logística do seu negócio. Encontre fretes ou transportadores confiáveis em poucos cliques.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/registro')}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                  }}
                >
                  Comece Agora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                  }}
                >
                  Fazer Login
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <HeroImage />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefícios Section */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          Por que escolher o MaisCargo?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <BenefitCard
              icon={SecurityIcon}
              title="Segurança"
              description="Transportadores e embarcadores verificados para garantir a segurança das suas operações."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <BenefitCard
              icon={SpeedIcon}
              title="Rapidez"
              description="Encontre fretes ou transportadores rapidamente com nossa plataforma intuitiva."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <BenefitCard
              icon={MoneyIcon}
              title="Economia"
              description="Reduza custos operacionais e encontre as melhores ofertas do mercado."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <BenefitCard
              icon={PeopleIcon}
              title="Networking"
              description="Construa uma rede de parceiros confiáveis para seus negócios."
            />
          </Grid>
        </Grid>
      </Container>

      {/* Como Funciona Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container>
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Como Funciona
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  Para Embarcadores
                </Typography>
                <Stack spacing={3}>
                  <StepCard
                    number="1"
                    title="Cadastre-se"
                    description="Crie sua conta gratuita como embarcador em poucos minutos."
                  />
                  <StepCard
                    number="2"
                    title="Publique seu Frete"
                    description="Informe os detalhes da sua carga e encontre transportadores qualificados."
                  />
                  <StepCard
                    number="3"
                    title="Escolha o Melhor"
                    description="Compare propostas e escolha o transportador ideal para sua carga."
                  />
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  Para Transportadores
                </Typography>
                <Stack spacing={3}>
                  <StepCard
                    number="1"
                    title="Faça seu Cadastro"
                    description="Registre-se como transportador e adicione seus veículos."
                  />
                  <StepCard
                    number="2"
                    title="Encontre Fretes"
                    description="Busque fretes disponíveis que combinem com seu veículo."
                  />
                  <StepCard
                    number="3"
                    title="Comece a Transportar"
                    description="Aceite fretes e comece a expandir seus negócios."
                  />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Pronto para Começar?
            </Typography>
            <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
              Junte-se a milhares de empresas que já confiam no MaisCargo
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/registro')}
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                borderRadius: 2,
                py: 2,
                px: 6,
                fontSize: '1.2rem',
              }}
            >
              Criar Conta Grátis
            </Button>
          </Box>
        </Container>
      </Box>
    </Layout>
  )
} 