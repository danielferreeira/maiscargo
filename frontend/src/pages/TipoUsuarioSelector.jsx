import { Box, Card, CardContent, Typography, Button, Container } from '@mui/material';
import { LocalShipping as LocalShippingIcon, Business as BusinessIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function TipoUsuarioSelector() {
  const navigate = useNavigate();

  const handleSelect = (tipo) => {
    navigate('/registro', { state: { tipoUsuario: tipo } });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ ml: -1 }}
        >
          Voltar para página inicial
        </Button>
      </Box>

      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Escolha o tipo de conta
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Selecione o tipo de conta que melhor se adequa ao seu perfil
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        <Card 
          sx={{ 
            width: 300,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
          onClick={() => handleSelect('transportador')}
        >
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <LocalShippingIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Transportador
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Para profissionais e empresas que desejam transportar cargas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Encontre fretes disponíveis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Gerencie sua frota
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Controle seus ganhos
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ mt: 3 }}
              onClick={() => handleSelect('transportador')}
            >
              Criar conta como Transportador
            </Button>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            width: 300,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
          onClick={() => handleSelect('embarcador')}
        >
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Embarcador
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Para empresas que precisam transportar suas cargas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Publique seus fretes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Encontre transportadores
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Acompanhe suas cargas
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ mt: 3 }}
              onClick={() => handleSelect('embarcador')}
            >
              Criar conta como Embarcador
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 