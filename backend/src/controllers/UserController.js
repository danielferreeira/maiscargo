import * as Yup from 'yup';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Freight from '../models/Freight.js';

class UserController {
  async getProfile(req, res) {
    try {
      console.log('Buscando perfil do usuário:', req.userId);
      
      const user = await User.findByPk(req.userId);

      if (!user) {
        console.log('Usuário não encontrado:', req.userId);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Remove o password_hash antes de enviar
      const userData = user.toJSON();
      delete userData.password_hash;

      // Garantir que os campos JSON sejam arrays
      userData.regioes_preferidas = userData.regioes_preferidas || [];
      userData.tipos_carga_preferidos = userData.tipos_carga_preferidos || [];

      // Garantir que os campos numéricos sejam números
      userData.raio_busca = userData.raio_busca ? Number(userData.raio_busca) : null;
      userData.raio_sugerido = userData.raio_sugerido ? Number(userData.raio_sugerido) : null;

      // Garantir que todos os campos existam, mesmo que vazios
      const defaultFields = {
        rg: null,
        rg_emissor: null,
        cnh: null,
        cnh_categoria: null,
        cnh_validade: null,
        cep: null,
        logradouro: null,
        numero: null,
        complemento: null,
        bairro: null,
        cidade: null,
        estado: null,
        telefone_fixo: null,
        telefone_whatsapp: null,
        telefone_emergencia: null,
        contato_emergencia: null,
        raio_busca: null,
        raio_sugerido: null,
        regioes_preferidas: [],
        tipos_carga_preferidos: []
      };

      const responseData = {
        ...defaultFields,
        ...userData
      };

      console.log('Dados do perfil:', responseData);
      return res.json(responseData);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message,
        stack: error.stack
      });
    }
  }

  async getStats(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      let whereClause = {};
      if (user.type === 'transportador') {
        whereClause.carrier_id = user.id;
      } else {
        whereClause.user_id = user.id;
      }

      const [totalFretes, fretesAtivos, fretesConcluidos, valorTotal] = await Promise.all([
        // Total de fretes
        Freight.count({ where: whereClause }),
        
        // Fretes ativos
        Freight.count({
          where: {
            ...whereClause,
            status: {
              [Op.in]: ['aceito', 'em_transporte']
            }
          }
        }),
        
        // Fretes concluídos
        Freight.count({
          where: {
            ...whereClause,
            status: 'finalizado'
          }
        }),
        
        // Valor total (apenas para transportadores)
        user.type === 'transportador' ?
          Freight.sum('price', {
            where: {
              carrier_id: user.id,
              status: 'finalizado'
            }
          }) : 0
      ]);

      return res.json({
        totalFretes,
        fretesAtivos,
        fretesConcluidos,
        valorTotal: valorTotal || 0
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateProfile(req, res) {
    try {
      console.log('Iniciando atualização do perfil...');
      console.log('Dados recebidos:', req.body);

      const user = await User.findByPk(req.userId);

      if (!user) {
        console.log('Usuário não encontrado:', req.userId);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Schema base para validação (campos comuns)
      const baseSchema = {
        name: Yup.string().nullable(),
        email: Yup.string().email().nullable(),
        phone: Yup.string().nullable(),
        document: Yup.string().nullable(),
        // Campos de endereço (obrigatórios para ambos)
        cep: Yup.string()
          .nullable()
          .test('cep', 'CEP inválido', value => !value || value.replace(/\D/g, '').length === 8),
        logradouro: Yup.string().nullable(),
        numero: Yup.string().nullable(),
        complemento: Yup.string().nullable(),
        bairro: Yup.string().nullable(),
        cidade: Yup.string().nullable(),
        estado: Yup.string()
          .nullable()
          .test('estado', 'Estado inválido', value => !value || /^[A-Z]{2}$/.test(value)),
        // Campos de contato (obrigatórios para ambos)
        telefone_fixo: Yup.string()
          .nullable()
          .test('telefone_fixo', 'Telefone fixo inválido', value => !value || value.replace(/\D/g, '').length >= 10),
        telefone_whatsapp: Yup.string()
          .nullable()
          .test('telefone_whatsapp', 'WhatsApp inválido', value => !value || value.replace(/\D/g, '').length >= 11),
        telefone_emergencia: Yup.string()
          .nullable()
          .test('telefone_emergencia', 'Telefone de emergência inválido', value => !value || value.replace(/\D/g, '').length >= 11),
        contato_emergencia: Yup.string().nullable()
      };

      // Schema específico para transportador
      const transportadorSchema = {
        ...baseSchema,
        // Campos de documentos (obrigatórios para transportador)
        rg: Yup.string().required('RG é obrigatório'),
        rg_emissor: Yup.string().required('Órgão emissor é obrigatório'),
        cnh: Yup.string().required('CNH é obrigatória'),
        cnh_categoria: Yup.string()
          .required('Categoria da CNH é obrigatória')
          .oneOf(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'], 'Categoria da CNH inválida'),
        cnh_validade: Yup.date()
          .required('Validade da CNH é obrigatória')
          .min(new Date(), 'CNH não pode estar vencida'),
        // Campos de preferências (obrigatórios para transportador)
        raio_busca: Yup.number()
          .required('Raio de busca é obrigatório')
          .min(10, 'Raio de busca deve ser no mínimo 10 km')
          .max(500, 'Raio de busca deve ser no máximo 500 km'),
        raio_sugerido: Yup.number()
          .required('Raio sugerido é obrigatório')
          .min(50, 'Raio sugerido deve ser no mínimo 50 km')
          .max(1000, 'Raio sugerido deve ser no máximo 1000 km'),
        regioes_preferidas: Yup.array().of(Yup.string()),
        tipos_carga_preferidos: Yup.array().of(Yup.string())
      };

      // Schema específico para embarcador
      const embarcadorSchema = {
        ...baseSchema,
        // Campos de endereço (obrigatórios para embarcador)
        cep: Yup.string()
          .required('CEP é obrigatório')
          .test('cep', 'CEP inválido', value => value && value.replace(/\D/g, '').length === 8),
        logradouro: Yup.string()
          .required('Logradouro é obrigatório')
          .min(3, 'Logradouro deve ter no mínimo 3 caracteres'),
        numero: Yup.string()
          .required('Número é obrigatório'),
        bairro: Yup.string()
          .required('Bairro é obrigatório')
          .min(3, 'Bairro deve ter no mínimo 3 caracteres'),
        cidade: Yup.string()
          .required('Cidade é obrigatória')
          .min(3, 'Cidade deve ter no mínimo 3 caracteres'),
        estado: Yup.string()
          .required('Estado é obrigatório')
          .matches(/^[A-Z]{2}$/, 'Estado deve ter 2 letras maiúsculas'),
        // Campos de contato (obrigatórios para embarcador)
        telefone_whatsapp: Yup.string()
          .required('WhatsApp é obrigatório')
          .test('telefone_whatsapp', 'WhatsApp inválido', value => value && value.replace(/\D/g, '').length === 11),
        telefone_emergencia: Yup.string()
          .required('Telefone de emergência é obrigatório')
          .test('telefone_emergencia', 'Telefone de emergência inválido', value => value && value.replace(/\D/g, '').length === 11),
        contato_emergencia: Yup.string()
          .required('Nome do contato de emergência é obrigatório')
          .min(3, 'Nome do contato deve ter no mínimo 3 caracteres'),
        // Campo opcional
        telefone_fixo: Yup.string()
          .nullable()
          .test('telefone_fixo', 'Telefone fixo inválido', value => !value || value.replace(/\D/g, '').length >= 10)
      };

      // Seleciona o schema apropriado baseado no tipo de usuário
      const schema = Yup.object().shape(
        user.type === 'transportador' ? transportadorSchema : embarcadorSchema
      );

      try {
        await schema.validate(req.body, { abortEarly: false });
      } catch (validationError) {
        console.log('Erro de validação:', validationError.errors);
        return res.status(400).json({
          error: 'Erro de validação',
          details: validationError.inner.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      // Preparar dados para atualização
      const updateData = {
        ...req.body,
        // Remover caracteres especiais dos campos numéricos
        cep: req.body.cep ? req.body.cep.replace(/\D/g, '') : null,
        telefone_fixo: req.body.telefone_fixo ? req.body.telefone_fixo.replace(/\D/g, '') : null,
        telefone_whatsapp: req.body.telefone_whatsapp ? req.body.telefone_whatsapp.replace(/\D/g, '') : null,
        telefone_emergencia: req.body.telefone_emergencia ? req.body.telefone_emergencia.replace(/\D/g, '') : null,
        // Garantir que arrays sejam enviados como JSON
        regioes_preferidas: Array.isArray(req.body.regioes_preferidas) ? req.body.regioes_preferidas : [],
        tipos_carga_preferidos: Array.isArray(req.body.tipos_carga_preferidos) ? req.body.tipos_carga_preferidos : [],
        // Converter datas para o formato correto
        cnh_validade: req.body.cnh_validade ? new Date(req.body.cnh_validade) : null,
        // Converter valores numéricos
        raio_busca: req.body.raio_busca ? Number(req.body.raio_busca) : null,
        raio_sugerido: req.body.raio_sugerido ? Number(req.body.raio_sugerido) : null,
        // Garantir que campos de texto não sejam undefined
        complemento: req.body.complemento || null
      };

      console.log('Dados preparados para atualização:', updateData);

      try {
        const updatedUser = await user.update(updateData);
        console.log('Usuário atualizado com sucesso');

        // Buscar usuário atualizado para garantir que todos os campos estejam corretos
        const refreshedUser = await User.findByPk(req.userId, {
          attributes: { exclude: ['password_hash'] }
        });

        return res.json(refreshedUser);
      } catch (updateError) {
        console.error('Erro ao atualizar usuário:', updateError);
        return res.status(500).json({ 
          error: 'Erro ao atualizar usuário',
          details: updateError.message,
          stack: updateError.stack
        });
      }
    } catch (error) {
      console.error('Erro ao processar atualização do perfil:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message,
        stack: error.stack
      });
    }
  }

  async show(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'name', 'email', 'type', 'status'],
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updatePreferences(req, res) {
    try {
      const schema = Yup.object().shape({
        raio_busca: Yup.number()
          .min(50, 'O raio de busca deve ser no mínimo 50km')
          .max(1000, 'O raio de busca deve ser no máximo 1000km')
          .required('O raio de busca é obrigatório'),
        raio_sugerido: Yup.number()
          .min(100, 'O raio sugerido deve ser no mínimo 100km')
          .max(2000, 'O raio sugerido deve ser no máximo 2000km')
          .required('O raio sugerido é obrigatório'),
        regioes_preferidas: Yup.array()
          .of(Yup.string().oneOf(['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']))
          .min(0)
          .max(5),
        tipos_carga_preferidos: Yup.array()
          .of(Yup.string())
          .min(0)
          .max(10)
      });

      await schema.validate(req.body, { abortEarly: false });

      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.type !== 'transportador') {
        return res.status(403).json({ error: 'Apenas transportadores podem definir preferências' });
      }

      const updatedUser = await user.update({
        raio_busca: req.body.raio_busca,
        raio_sugerido: req.body.raio_sugerido,
        regioes_preferidas: req.body.regioes_preferidas,
        tipos_carga_preferidos: req.body.tipos_carga_preferidos
      });

      // Retornar apenas os dados necessários
      const { 
        id, 
        name, 
        email, 
        type, 
        status,
        raio_busca,
        raio_sugerido,
        regioes_preferidas,
        tipos_carga_preferidos
      } = updatedUser;

      return res.json({
        id,
        name,
        email,
        type,
        status,
        raio_busca,
        raio_sugerido,
        regioes_preferidas,
        tipos_carga_preferidos
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(400).json({ error: err.errors[0] });
      }

      console.error('Erro ao atualizar preferências:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new UserController(); 