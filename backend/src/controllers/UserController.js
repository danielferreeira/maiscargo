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
        name: Yup.string(),
        email: Yup.string().email(),
        phone: Yup.string()
          .transform(value => value?.replace(/\D/g, '')),
        document: Yup.string()
          .transform(value => value?.replace(/\D/g, '')),
        cep: Yup.string()
          .transform(value => value?.replace(/\D/g, ''))
          .length(8, 'CEP inválido'),
        logradouro: Yup.string(),
        numero: Yup.string(),
        complemento: Yup.string(),
        bairro: Yup.string(),
        cidade: Yup.string(),
        estado: Yup.string().length(2, 'Estado inválido'),
        telefone_fixo: Yup.string()
          .transform(value => value?.replace(/\D/g, '')),
        telefone_whatsapp: Yup.string()
          .transform(value => value?.replace(/\D/g, '')),
        telefone_emergencia: Yup.string()
          .transform(value => value?.replace(/\D/g, '')),
        contato_emergencia: Yup.string()
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