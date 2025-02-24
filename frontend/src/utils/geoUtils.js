// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  return distancia;
}

// Função para formatar a distância em texto
function formatarDistancia(distanciaKm) {
  if (distanciaKm < 1) {
    return `${Math.round(distanciaKm * 1000)} m`;
  }
  return `${Math.round(distanciaKm)} km`;
}

// Função para estimar o tempo de viagem (assumindo velocidade média de 60 km/h)
function estimarTempo(distanciaKm) {
  const velocidadeMedia = 60; // km/h
  const tempoHoras = distanciaKm / velocidadeMedia;
  
  if (tempoHoras < 1) {
    const minutos = Math.round(tempoHoras * 60);
    return `${minutos} minutos`;
  }
  
  const horas = Math.floor(tempoHoras);
  const minutos = Math.round((tempoHoras - horas) * 60);
  
  if (minutos === 0) {
    return `${horas} hora${horas > 1 ? 's' : ''}`;
  }
  return `${horas} hora${horas > 1 ? 's' : ''} e ${minutos} minutos`;
}

// Função para calcular a distância entre duas cidades usando OpenStreetMap
export async function calcularDistancia(origem, destino) {
  try {
    // Obter coordenadas de origem e destino
    const coordOrigem = await obterCoordenadas(origem);
    const coordDestino = await obterCoordenadas(destino);

    // Calcular a distância usando a fórmula de Haversine
    const distanciaKm = calcularDistanciaHaversine(
      coordOrigem.lat,
      coordOrigem.lng,
      coordDestino.lat,
      coordDestino.lng
    );

    return {
      distancia: formatarDistancia(distanciaKm),
      distanciaEmMetros: distanciaKm * 1000,
      duracao: estimarTempo(distanciaKm)
    };
  } catch (error) {
    console.error('Erro ao calcular distância:', error);
    throw error;
  }
}

// Função para obter as coordenadas de um endereço usando OpenStreetMap/Nominatim
export async function obterCoordenadas(endereco) {
  try {
    // Adiciona um atraso de 1 segundo para respeitar os limites da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } else {
      throw new Error('Não foi possível obter as coordenadas');
    }
  } catch (error) {
    console.error('Erro ao obter coordenadas:', error);
    throw error;
  }
} 