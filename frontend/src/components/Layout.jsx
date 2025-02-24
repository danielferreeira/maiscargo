import { AppBar, Box, Container, Toolbar, Typography, Button, Menu, MenuItem, Divider } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { Add as AddIcon, Search as SearchIcon, LocalShipping as LocalShippingIcon, Person as PersonIcon, AttachMoney as MoneyIcon } from '@mui/icons-material'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleClose()
    signOut()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 0, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              mr: 4
            }}
          >
            MaisCargo
          </Typography>

          {user && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              {user.type === 'transportador' ? (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/buscar-fretes"
                    startIcon={<SearchIcon />}
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Buscar Fretes
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/meus-fretes"
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Meus Fretes
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/meus-veiculos"
                    startIcon={<LocalShippingIcon />}
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Meus Veículos
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/gestao-financeira"
                    startIcon={<MoneyIcon />}
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Gestão Financeira
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/publicar-frete"
                    startIcon={<AddIcon />}
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Publicar Frete
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/meus-fretes"
                    sx={{ 
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Meus Fretes
                  </Button>
                </>
              )}
            </Box>
          )}

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Olá, {user.name}
              </Typography>
              <Button 
                color="inherit"
                onClick={handleMenu}
                startIcon={<PersonIcon />}
                sx={{ 
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Minha Conta
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 2,
                  sx: { minWidth: 180 }
                }}
              >
                <MenuItem component={RouterLink} to="/perfil" onClick={handleClose}>
                  Perfil
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Sair
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { borderColor: 'white' }
                }}
              >
                Entrar
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/tipo-usuario"
                variant="contained"
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                }}
              >
                Registrar
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} MaisCargo. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
} 