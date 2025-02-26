import { Model, DataTypes } from 'sequelize';
import * as Yup from 'yup';
import { Op } from 'sequelize';
import Freight from '../models/Freight.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import { calcularDistanciaHaversine, obterCoordenadas } from '../utils/geoUtils.js';

// Função para normalizar nomes de cidades e estados
function normalizeCityState(location) {
  if (!location) return { city: '', state: '' };
  
  // Remove espaços extras e divide por vírgula
  const parts = location.split(',').map(part => 
    part.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, ' ') // Remove espaços extras
  );

  return {
    city: parts[0] || '',
    state: parts[1] || ''
  };
}

// Função auxiliar para obter região a partir do estado
function getRegionFromState(state) {
  const regions = {
    'AC': 'Norte', 'AP': 'Norte', 'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
    'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste',
    'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
    'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
    'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
    'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
  };
  return regions[state] || null;
}

class FreightController {
  async index(req, res) {
    try {
      const { type } = await User.findByPk(req.userId);
      let where = {};

      if (type === 'transportador') {
        where = {
          [Op.or]: [
            { carrier_id: req.userId },
            { 
              status: 'disponivel',
              pickup_date: {
                [Op.gt]: new Date() // Apenas fretes futuros
              }
            },
          ],
        };
      } else {
        where = { user_id: req.userId };
      }

      const freights = await Freight.findAll({
        where,
        include: [
          {
            model: User,
            as: 'embarcador',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'transportador',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Vehicle,
            as: 'veiculo',
          },
        ],
        order: [['created_at', 'DESC']],
      });

      console.log(`Total de fretes encontrados: ${freights.length}`);
      return res.json(freights);
    } catch (error) {
      console.error('Erro ao buscar fretes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async available(req, res) {
    try {
      const { showAll } = req.query;
      
      // Buscar o usuário transportador com suas preferências e endereço
      const transporter = await User.findByPk(req.userId, {
        attributes: [
          'id', 'cidade', 'estado', 'raio_busca', 
          'raio_sugerido', 'regioes_preferidas', 'tipos_carga_preferidos'
        ]
      });

      if (!transporter || !transporter.cidade || !transporter.estado) {
        return res.status(400).json({ 
          error: 'É necessário cadastrar seu endereço completo para buscar fretes próximos',
          details: 'Atualize seu endereço na aba "ENDEREÇO" do seu perfil'
        });
      }

      // Obter coordenadas da cidade do transportador
      const transporterAddress = `${transporter.cidade}, ${transporter.estado}, Brasil`;
      const transporterCoords = await obterCoordenadas(transporterAddress);

      // Construir a query base para fretes disponíveis
      const whereClause = {
          status: 'disponivel',
          carrier_id: null,
          pickup_date: {
          [Op.gt]: new Date()
        }
      };

      // Buscar fretes que atendam aos critérios básicos
      const freights = await Freight.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'embarcador',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Função auxiliar para calcular distância e duração
      const calcularDistanciaEDuracao = (freight) => {
        // Calcular distância total do frete (origem ao destino)
        const distanciaTotal = calcularDistanciaHaversine(
          freight.origin_lat,
          freight.origin_lng,
          freight.destination_lat,
          freight.destination_lng
        );

        // Calcular tempo estimado (assumindo velocidade média de 60 km/h)
        const horasViagem = distanciaTotal / 60;
        let duracao;
        
        if (horasViagem < 1) {
          const minutos = Math.round(horasViagem * 60);
          duracao = `${minutos} minutos`;
        } else {
          const horas = Math.floor(horasViagem);
          const minutos = Math.round((horasViagem - horas) * 60);
          duracao = minutos > 0 ? 
            `${horas} hora${horas > 1 ? 's' : ''} e ${minutos} minutos` : 
            `${horas} hora${horas > 1 ? 's' : ''}`;
        }

        return {
          distance: Math.round(distanciaTotal),
          duration: duracao
        };
      };

      // Se showAll for true, retorna todos os fretes disponíveis com informações de distância
      if (showAll === 'true') {
        const freightsWithDetails = await Promise.all(freights.map(async (freight) => {
          // Calcular distância do transportador até a origem
          const distanceFromTransporter = calcularDistanciaHaversine(
            transporterCoords.lat,
            transporterCoords.lng,
            freight.origin_lat,
            freight.origin_lng
          );

          // Calcular distância total e duração da viagem
          const { distance, duration } = calcularDistanciaEDuracao(freight);

          return {
            ...freight.toJSON(),
            distance,
            duration,
            distance_from_transporter: Math.round(distanceFromTransporter),
            same_city: freight.origin_city === transporter.cidade,
            same_state: freight.origin_state === transporter.estado,
            region: getRegionFromState(freight.origin_state)
          };
        }));

        return res.json(freightsWithDetails.sort((a, b) => a.distance_from_transporter - b.distance_from_transporter));
      }

      // Filtrar e ordenar fretes baseado na localização e preferências
      const filteredFreights = freights.filter(freight => {
        // Calcular distância real entre a cidade do transportador e a origem do frete
        const distance = calcularDistanciaHaversine(
          transporterCoords.lat,
          transporterCoords.lng,
          freight.origin_lat,
          freight.origin_lng
        );

        // Arredondar distância para quilômetros inteiros
        freight.real_distance = Math.round(distance);

        // Verificar se está dentro do raio de busca
        if (freight.real_distance > transporter.raio_busca) {
          return false;
        }

        // Verificar região preferida
        const freightRegion = getRegionFromState(freight.origin_state);
        if (transporter.regioes_preferidas?.length > 0 && 
            !transporter.regioes_preferidas.includes(freightRegion)) {
            return false;
        }

        // Verificar tipo de carga preferido
        if (transporter.tipos_carga_preferidos?.length > 0 && 
            !transporter.tipos_carga_preferidos.includes(freight.cargo_type)) {
            return false;
        }

        return true;
      });

      // Ordenar fretes por distância e relevância
      const sortedFreights = filteredFreights.sort((a, b) => {
        // Prioridade 1: Mesma cidade
        if (a.origin_city === transporter.cidade && b.origin_city !== transporter.cidade) return -1;
        if (b.origin_city === transporter.cidade && a.origin_city !== transporter.cidade) return 1;

        // Prioridade 2: Mesmo estado
        if (a.origin_state === transporter.estado && b.origin_state !== transporter.estado) return -1;
        if (b.origin_state === transporter.estado && a.origin_state !== transporter.estado) return 1;

        // Prioridade 3: Distância real
        return a.real_distance - b.real_distance;
      });

      // Preparar resposta com informações detalhadas
      const freightsWithDetails = sortedFreights.map(freight => {
        // Calcular distância total e duração da viagem
        const { distance, duration } = calcularDistanciaEDuracao(freight);

        return {
        ...freight.toJSON(),
          distance,
          duration,
          distance_from_transporter: freight.real_distance,
          same_city: freight.origin_city === transporter.cidade,
          same_state: freight.origin_state === transporter.estado,
          region: getRegionFromState(freight.origin_state)
        };
      });

      return res.json(freightsWithDetails);
    } catch (error) {
      console.error('Erro ao buscar fretes disponíveis:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async store(req, res) {
    try {
      console.log('Iniciando criação de frete...');
      console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));

      const schema = Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string(),
        origin: Yup.string().required(),
        origin_city: Yup.string().required(),
        origin_state: Yup.string().required(),
        destination: Yup.string().required(),
        destination_city: Yup.string().required(),
        destination_state: Yup.string().required(),
        origin_lat: Yup.number().required(),
        origin_lng: Yup.number().required(),
        destination_lat: Yup.number().required(),
        destination_lng: Yup.number().required(),
        cargo_type: Yup.string().required(),
        weight: Yup.number().required(),
        volume: Yup.number(),
        vehicle_type: Yup.string().required(),
        price: Yup.number().required(),
        pickup_date: Yup.date().required(),
        delivery_date: Yup.date().required(),
        distance: Yup.number(),
        duration: Yup.string()
      });

      if (!(await schema.isValid(req.body))) {
        console.log('Falha na validação do schema');
        const validation = await schema.validate(req.body, { abortEarly: false }).catch(err => err);
        console.log('Erros de validação:', validation.errors);
        return res.status(400).json({ 
          error: 'Falha na validação',
          details: validation.errors
        });
      }

      console.log('Validação do schema passou com sucesso');

      const user = await User.findByPk(req.userId);
      console.log('Usuário encontrado:', user.type);

      if (user.type !== 'embarcador') {
        return res.status(403).json({ error: 'Apenas embarcadores podem criar fretes' });
      }

      // Garantir que a distância seja armazenada em quilômetros
      const freightData = {
        ...req.body,
        distance: Math.round(Number(req.body.distance)), // Armazenar em km
        user_id: req.userId
      };

      console.log('Criando registro do frete...');
      const freight = await Freight.create(freightData);
      console.log('Frete criado com sucesso:', freight.id);

      return res.json(freight);
    } catch (error) {
      console.error('Erro ao criar frete:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação',
          details: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      if (error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ 
          error: 'Erro no banco de dados',
          details: error.message
        });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const freight = await Freight.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'embarcador',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'transportador',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Vehicle,
            as: 'veiculo',
          },
        ],
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      return res.json(freight);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const schema = Yup.object().shape({
        title: Yup.string(),
        description: Yup.string(),
        price: Yup.number(),
        pickup_date: Yup.date(),
        delivery_date: Yup.date(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Falha na validação' });
      }

      const user = await User.findByPk(req.userId);
      if (user.type !== 'embarcador') {
        return res.status(403).json({ error: 'Apenas embarcadores podem editar fretes' });
      }

      const freight = await Freight.findOne({
        where: {
          id: req.params.id,
        },
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      if (freight.status !== 'disponivel') {
        return res.status(400).json({ error: 'Frete não pode ser alterado no status atual' });
      }

      const updatedFreight = await freight.update(req.body);

      return res.json(updatedFreight);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const freight = await Freight.findOne({
        where: {
          id: req.params.id,
          user_id: req.userId,
        },
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      if (freight.status !== 'disponivel') {
        return res.status(400).json({ error: 'Frete não pode ser excluído no status atual' });
      }

      await freight.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async accept(req, res) {
    try {
      const schema = Yup.object().shape({
        vehicle_id: Yup.number().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Falha na validação' });
      }

      const user = await User.findByPk(req.userId);

      if (user.type !== 'transportador') {
        return res.status(403).json({ error: 'Apenas transportadores podem aceitar fretes' });
      }

      const freight = await Freight.findOne({
        where: {
          id: req.params.id,
          status: 'disponivel',
        },
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado ou indisponível' });
      }

      const vehicle = await Vehicle.findOne({
        where: {
          id: req.body.vehicle_id,
          user_id: req.userId,
          status: 'disponivel',
        },
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado ou indisponível' });
      }

      if (vehicle.type !== freight.vehicle_type) {
        return res.status(400).json({ 
          error: 'Tipo de veículo incompatível com o frete',
          details: {
            required: freight.vehicle_type,
            provided: vehicle.type
          }
        });
      }

      if (vehicle.capacity < freight.weight) {
        return res.status(400).json({ 
          error: 'Veículo não possui capacidade suficiente para a carga',
          details: {
            required: freight.weight,
            capacity: vehicle.capacity
          }
        });
      }

      const updatedFreight = await freight.update({
        carrier_id: req.userId,
        vehicle_id: vehicle.id,
        status: 'aceito',
      });

      await vehicle.update({ status: 'em_uso' });

      return res.json(updatedFreight);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async startTransport(req, res) {
    try {
      const freight = await Freight.findOne({
        where: {
          id: req.params.id,
          carrier_id: req.userId,
          status: 'aceito',
        },
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado ou não pode ser iniciado' });
      }

      const updatedFreight = await freight.update({ status: 'em_transporte' });

      return res.json(updatedFreight);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async finishTransport(req, res) {
    try {
      const freight = await Freight.findOne({
        where: {
          id: req.params.id,
          carrier_id: req.userId,
          status: 'em_transporte',
        },
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado ou não pode ser finalizado' });
      }

      const vehicle = await Vehicle.findByPk(freight.vehicle_id);
      
      // Atualizar o frete com status finalizado, mantendo a distância original
      const updatedFreight = await freight.update({
        status: 'finalizado',
        // Garantir que a distância seja a mesma da criação do frete
        distance: freight.distance
      });

      // Liberar o veículo
      await vehicle.update({ status: 'disponivel' });

      return res.json(updatedFreight);
    } catch (error) {
      console.error('Erro ao finalizar frete:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async cancel(req, res) {
    try {
      const freight = await Freight.findOne({
        where: {
          id: req.params.id,
          [Op.or]: [
            { user_id: req.userId },
            { carrier_id: req.userId },
          ],
        },
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      if (!['disponivel', 'aceito'].includes(freight.status)) {
        return res.status(400).json({ error: 'Frete não pode ser cancelado no status atual' });
      }

      if (freight.vehicle_id) {
        const vehicle = await Vehicle.findByPk(freight.vehicle_id);
        await vehicle.update({ status: 'disponivel' });
      }

      const updatedFreight = await freight.update({
        status: 'cancelado',
        carrier_id: null,
        vehicle_id: null,
      });

      return res.json(updatedFreight);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateCosts(req, res) {
    try {
      const schema = Yup.object().shape({
        custo_combustivel: Yup.number().min(0),
        custo_pedagio: Yup.number().min(0),
        custo_alimentacao: Yup.number().min(0),
        custo_hospedagem: Yup.number().min(0),
        custo_manutencao: Yup.number().min(0),
        outros_custos: Yup.number().min(0),
        custo_total: Yup.number().min(0),
        lucro_estimado: Yup.number(),
        margem_lucro: Yup.number(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Falha na validação dos custos' });
      }

      const freight = await Freight.findOne({
        where: {
          id: req.params.id,
          carrier_id: req.userId,
        },
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado ou você não tem permissão para atualizá-lo' });
      }

      const updatedFreight = await freight.update(req.body);

      return res.json(updatedFreight);
    } catch (error) {
      console.error('Erro ao atualizar custos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getFinancialData(req, res) {
    try {
      console.log('Iniciando busca de dados financeiros para o transportador:', req.userId);
      
      // Verificar se o usuário existe e é um transportador
      const user = await User.findByPk(req.userId);
      if (!user) {
        console.log('Usuário não encontrado:', req.userId);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      if (user.type !== 'transportador') {
        console.log('Usuário não é transportador:', user.type);
        return res.status(403).json({ error: 'Acesso permitido apenas para transportadores' });
      }

      console.log('Buscando fretes do transportador...');
      const freights = await Freight.findAll({
        where: {
          carrier_id: req.userId
        },
        raw: true // Adiciona esta linha para retornar objetos JavaScript puros
      });

      if (!freights || freights.length === 0) {
        console.log('Nenhum frete encontrado');
        return res.json({
          resumo: {
            valorRecebido: 0,
            valorAReceber: 0,
            custosTotais: 0,
            lucroTotal: 0
          },
          fretesConcluidos: [],
          fretesEmAndamento: []
        });
      }

      console.log(`Encontrados ${freights.length} fretes para o transportador`);

      const concluidos = freights.filter(f => f.status === 'finalizado');
      const emAndamento = freights.filter(f => ['aceito', 'em_transporte'].includes(f.status));

      console.log(`Fretes concluídos: ${concluidos.length}, Fretes em andamento: ${emAndamento.length}`);

      // Garantir que os valores sejam números
      const valorRecebido = concluidos.reduce((total, frete) => {
        const valor = Number(frete.price) || 0;
        console.log(`Frete ${frete.id} - Valor: ${valor}`);
        return total + valor;
      }, 0);

      const valorAReceber = emAndamento.reduce((total, frete) => {
        const valor = Number(frete.price) || 0;
        console.log(`Frete ${frete.id} - Valor a receber: ${valor}`);
        return total + valor;
      }, 0);

      const custosTotais = concluidos.reduce((total, frete) => {
        const custo = Number(frete.custo_total) || 0;
        console.log(`Frete ${frete.id} - Custo: ${custo}`);
        return total + custo;
      }, 0);

      const lucroTotal = valorRecebido - custosTotais;

      console.log('Resumo financeiro calculado:', {
        valorRecebido,
        valorAReceber,
        custosTotais,
        lucroTotal
      });

      const dadosFinanceiros = {
        resumo: {
          valorRecebido: Number(valorRecebido.toFixed(2)),
          valorAReceber: Number(valorAReceber.toFixed(2)),
          custosTotais: Number(custosTotais.toFixed(2)),
          lucroTotal: Number(lucroTotal.toFixed(2))
        },
        fretesConcluidos: concluidos.map(frete => ({
          ...frete,
          price: Number(frete.price) || 0,
          custo_total: Number(frete.custo_total) || 0,
          lucro_estimado: Number(frete.lucro_estimado) || 0
        })),
        fretesEmAndamento: emAndamento.map(frete => ({
          ...frete,
          price: Number(frete.price) || 0,
          custo_total: Number(frete.custo_total) || 0,
          lucro_estimado: Number(frete.lucro_estimado) || 0
        }))
      };

      return res.json(dadosFinanceiros);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', {
        error: error.message,
        stack: error.stack,
        userId: req.userId
      });
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async findNearbyCarriers(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID do frete é obrigatório' });
      }

      // Busca o frete
      const freight = await Freight.findOne({
        where: { id },
        attributes: ['id', 'origin_lat', 'origin_lng', 'vehicle_type']
      });

      if (!freight) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      // Busca transportadores ativos
      const carriers = await User.findAll({
        where: {
          type: 'transportador',
          status: 'ativo'
        },
        attributes: ['id', 'name', 'email', 'phone', 'cidade', 'estado', 'raio_busca'],
        include: [{
          model: Vehicle,
          as: 'vehicles',
          where: {
            type: freight.vehicle_type,
            status: 'disponivel'
          },
          required: true
        }]
      });

      // Calcula a distância de cada transportador até a origem do frete
      const carriersWithDistance = await Promise.all(carriers.map(async carrier => {
        const carrierData = carrier.get({ plain: true });
        
        try {
          // Obter coordenadas do transportador
          const carrierAddress = `${carrier.cidade}, ${carrier.estado}, Brasil`;
          const carrierCoords = await obterCoordenadas(carrierAddress);
          
          // Calcula a distância usando a função de Haversine
          const distanceToOrigin = calcularDistanciaHaversine(
            freight.origin_lat,
            freight.origin_lng,
            carrierCoords.lat,
            carrierCoords.lng
          );

          return {
            ...carrierData,
            distanceToOrigin,
            withinRange: distanceToOrigin <= carrier.raio_busca
          };
        } catch (error) {
          console.error(`Erro ao obter coordenadas para ${carrier.cidade}, ${carrier.estado}:`, error);
          return {
            ...carrierData,
            distanceToOrigin: Infinity,
            withinRange: false
          };
        }
      }));

      // Ordena por distância e se está dentro do raio de busca
      const sortedCarriers = carriersWithDistance
        .filter(carrier => carrier.distanceToOrigin !== Infinity)
        .sort((a, b) => {
          if (a.withinRange === b.withinRange) {
            return a.distanceToOrigin - b.distanceToOrigin;
          }
          return a.withinRange ? -1 : 1;
        });

      return res.json(sortedCarriers);
    } catch (error) {
      console.error('Erro ao buscar transportadores próximos:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar transportadores próximos',
        details: error.message
      });
    }
  }
}

export default new FreightController(); 