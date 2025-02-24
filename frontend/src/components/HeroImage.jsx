import { Box } from '@mui/material'

export default function HeroImage() {
  return (
    <Box
      component="svg"
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      sx={{
        width: '100%',
        height: 'auto',
        maxWidth: 600,
      }}
    >
      {/* Fundo */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1976d2', stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: '#2196f3', stopOpacity: 0.1 }} />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#gradient)" />

      {/* Estrada */}
      <path
        d="M0 400 Q400 380 800 400"
        stroke="#90caf9"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M0 420 Q400 400 800 420"
        stroke="#90caf9"
        strokeWidth="4"
        fill="none"
      />

      {/* Caminhão */}
      <g transform="translate(100, 350) scale(0.8)">
        {/* Cabine */}
        <rect x="50" y="0" width="120" height="80" fill="#1976d2" rx="10" />
        <rect x="170" y="20" width="200" height="60" fill="#2196f3" />
        
        {/* Janelas */}
        <rect x="70" y="20" width="80" height="40" fill="#bbdefb" rx="5" />
        
        {/* Rodas */}
        <circle cx="100" cy="85" r="25" fill="#424242" />
        <circle cx="100" cy="85" r="15" fill="#757575" />
        <circle cx="300" cy="85" r="25" fill="#424242" />
        <circle cx="300" cy="85" r="15" fill="#757575" />
        
        {/* Detalhes */}
        <rect x="170" y="40" width="200" height="5" fill="#1565c0" />
        <rect x="50" y="60" width="30" height="5" fill="#1565c0" />
      </g>

      {/* Carga */}
      <g transform="translate(500, 300) scale(0.6)">
        {/* Caixas */}
        <rect x="0" y="0" width="80" height="80" fill="#ff9800" />
        <rect x="90" y="20" width="60" height="60" fill="#f57c00" />
        <rect x="40" y="-40" width="50" height="50" fill="#ffa726" />
      </g>

      {/* Nuvens */}
      <g transform="translate(600, 100) scale(0.8)">
        <path
          d="M-40,50 Q-20,40 0,50 T40,50 T80,50 T120,50 Q140,50 140,40 Q140,20 120,20 Q120,0 100,0 Q80,0 80,20 Q60,0 40,20 Q20,0 0,20 Q-20,20 -20,40 Q-40,40 -40,50"
          fill="#e3f2fd"
        />
      </g>
      <g transform="translate(200, 150) scale(0.6)">
        <path
          d="M-40,50 Q-20,40 0,50 T40,50 T80,50 T120,50 Q140,50 140,40 Q140,20 120,20 Q120,0 100,0 Q80,0 80,20 Q60,0 40,20 Q20,0 0,20 Q-20,20 -20,40 Q-40,40 -40,50"
          fill="#e3f2fd"
        />
      </g>

      {/* Prédios ao fundo */}
      <g transform="translate(650, 250)">
        <rect x="0" y="0" width="40" height="120" fill="#90a4ae" />
        <rect x="50" y="-30" width="40" height="150" fill="#78909c" />
        <rect x="100" y="-10" width="40" height="130" fill="#607d8b" />
      </g>
      <g transform="translate(50, 280)">
        <rect x="0" y="-20" width="30" height="110" fill="#90a4ae" />
        <rect x="40" y="0" width="30" height="90" fill="#78909c" />
        <rect x="80" y="-40" width="30" height="130" fill="#607d8b" />
      </g>
    </Box>
  )
} 