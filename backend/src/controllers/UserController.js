import * as Yup from 'yup';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Freight from '../models/Freight.js';

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message
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
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const schema = Yup.object().shape({
        name: Yup.string().nullable(),
        email: Yup.string().email('Email inválido').nullable(),
        document: Yup.string().nullable(),
        phone: Yup.string().nullable(),
        rg: Yup.string().nullable(),
        rg_emissor: Yup.string().nullable(),
        cnh: Yup.string().nullable(),
        cnh_categoria: Yup.string().nullable(),
        cnh_validade: Yup.date().nullable(),
        cep: Yup.string().nullable()
          .test('cep-validation', 'CEP inválido', function(value) {
            if (!value) return true;
            return value.length === 8;
          }),
        logradouro: Yup.string().nullable()
          .test('logradouro-required', 'Logradouro é obrigatório', function(value) {
            // Se algum campo de endereço foi preenchido, logradouro é obrigatório
            const addressFields = ['cep', 'numero', 'bairro', 'cidade', 'estado'];
            const hasAddressFields = addressFields.some(field => this.parent[field]);
            return !hasAddressFields || (hasAddressFields && value);
          }),
        numero: Yup.string().nullable()
          .test('numero-required', 'Número é obrigatório', function(value) {
            const addressFields = ['cep', 'logradouro', 'bairro', 'cidade', 'estado'];
            const hasAddressFields = addressFields.some(field => this.parent[field]);
            return !hasAddressFields || (hasAddressFields && value);
          }),
        complemento: Yup.string().nullable(),
        bairro: Yup.string().nullable()
          .test('bairro-required', 'Bairro é obrigatório', function(value) {
            const addressFields = ['cep', 'logradouro', 'numero', 'cidade', 'estado'];
            const hasAddressFields = addressFields.some(field => this.parent[field]);
            return !hasAddressFields || (hasAddressFields && value);
          }),
        cidade: Yup.string().nullable()
          .test('cidade-required', 'Cidade é obrigatória', function(value) {
            const addressFields = ['cep', 'logradouro', 'numero', 'bairro', 'estado'];
            const hasAddressFields = addressFields.some(field => this.parent[field]);
            return !hasAddressFields || (hasAddressFields && value);
          }),
        estado: Yup.string().nullable()
          .test('estado-required', 'Estado é obrigatório', function(value) {
            const addressFields = ['cep', 'logradouro', 'numero', 'bairro', 'cidade'];
            const hasAddressFields = addressFields.some(field => this.parent[field]);
            return !hasAddressFields || (hasAddressFields && value);
          })
          .test('estado-format', 'Estado deve ter 2 letras maiúsculas', function(value) {
            if (!value) return true;
            return /^[A-Z]{2}$/.test(value);
          }),
        telefone_fixo: Yup.string().nullable(),
        telefone_whatsapp: Yup.string().nullable(),
        telefone_emergencia: Yup.string().nullable()
          .test('telefone-emergencia-required', 'Telefone de emergência é obrigatório quando contato de emergência é fornecido', function(value) {
            return !this.parent.contato_emergencia || (this.parent.contato_emergencia && value);
          }),
        contato_emergencia: Yup.string().nullable()
          .test('contato-emergencia-required', 'Contato de emergência é obrigatório quando telefone de emergência é fornecido', function(value) {
            return !this.parent.telefone_emergencia || (this.parent.telefone_emergencia && value);
          }),
        raio_busca: Yup.number().nullable(),
        raio_sugerido: Yup.number().nullable(),
        regioes_preferidas: Yup.array().of(Yup.string()).nullable(),
        tipos_carga_preferidos: Yup.array().of(Yup.string()).nullable()
      });

      try {
        await schema.validate(req.body, { abortEarly: false });
      } catch (validationError) {
        return res.status(400).json({
          error: 'Erro de validação',
          details: validationError.inner.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      // Se o email foi alterado, verifica se já existe
      if (req.body.email && req.body.email !== user.email) {
        const userExists = await User.findOne({ 
          where: { email: req.body.email }
        });

        if (userExists) {
          return res.status(400).json({ error: 'Email já está em uso' });
        }
      }

      const updatedUser = await user.update(req.body);

      return res.json({
        ...updatedUser.get(),
        password_hash: undefined
      });
    } catch (error) {
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message
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
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.type !== 'transportador') {
        return res.status(403).json({ error: 'Apenas transportadores podem atualizar preferências' });
      }

      const schema = Yup.object().shape({
        raio_busca: Yup.number()
          .min(1, 'Raio de busca deve ser maior que 0')
          .max(1000, 'Raio de busca deve ser menor que 1000'),
        raio_sugerido: Yup.number()
          .min(1, 'Raio sugerido deve ser maior que 0')
          .max(1000, 'Raio sugerido deve ser menor que 1000'),
        regioes_preferidas: Yup.array()
          .of(Yup.string()),
        tipos_carga_preferidos: Yup.array()
          .of(Yup.string())
      });

      try {
        await schema.validate(req.body, { abortEarly: false });
      } catch (validationError) {
        return res.status(400).json({
          error: 'Erro de validação',
          details: validationError.inner.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      const updatedUser = await user.update(req.body);

      return res.json({
        ...updatedUser.get(),
        password_hash: undefined
      });
    } catch (error) {
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

export default new UserController(); 