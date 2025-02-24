import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BuscarFretes from './pages/BuscarFretes'
import PublicarFrete from './pages/PublicarFrete'
import MeusFretes from './pages/MeusFretes'
import MeusVeiculos from './pages/MeusVeiculos'
import GestaoFinanceira from './pages/GestaoFinanceira'
import TipoUsuarioSelector from './pages/TipoUsuarioSelector'
import Perfil from './pages/Perfil'

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#f43f5e',
      light: '#fb7185',
      dark: '#e11d48',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
})

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tipo-usuario" element={<TipoUsuarioSelector />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route
              path="/buscar-fretes"
              element={
                <PrivateRoute>
                  <BuscarFretes />
                </PrivateRoute>
              }
            />
            <Route
              path="/publicar-frete"
              element={
                <PrivateRoute>
                  <PublicarFrete />
                </PrivateRoute>
              }
            />
            <Route
              path="/meus-fretes"
              element={
                <PrivateRoute>
                  <MeusFretes />
                </PrivateRoute>
              }
            />
            <Route
              path="/meus-veiculos"
              element={
                <PrivateRoute>
                  <MeusVeiculos />
                </PrivateRoute>
              }
            />
            <Route
              path="/gestao-financeira"
              element={
                <PrivateRoute>
                  <GestaoFinanceira />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
