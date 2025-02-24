import fetch from 'node-fetch';

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
export function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Retorna a distância em quilômetros
}

// Função para obter coordenadas de um endereço usando OpenStreetMap/Nominatim
export async function obterCoordenadas(endereco) {
  try {
    // Adiciona um atraso de 1 segundo para respeitar os limites da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`,
      {
        headers: {
          'User-Agent': 'MaisCargo/1.0'
        }
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    throw new Error('Não foi possível obter as coordenadas');
  } catch (error) {
    console.error('Erro ao obter coordenadas:', error);
    throw error;
  }
} 