import * as Yup from 'yup';
import { Op } from 'sequelize';
import Vehicle from '../models/Vehicle.js';
import Freight from '../models/Freight.js';
import User from '../models/User.js';

class VehicleController {
  async index(req, res) {
    try {
      const vehicles = await Vehicle.findAll({
        where: { user_id: req.userId },
        include: [{
          model: Freight,
          as: 'fretes',
          attributes: ['id', 'status'],
          where: {
            status: {
              [Op.in]: ['aceito', 'em_transporte']
            }
          },
          required: false
        }],
        order: [['created_at', 'DESC']]
      });

      return res.json(vehicles);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        plate: Yup.string()
          .required('Placa é obrigatória')
          .matches(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/, 'Placa inválida'),
        type: Yup.string().required('Tipo é obrigatório'),
        brand: Yup.string().required('Marca é obrigatória'),
        model: Yup.string().required('Modelo é obrigatório'),
        year: Yup.number()
          .required('Ano é obrigatório')
          .min(1900, 'Ano inválido')
          .max(new Date().getFullYear() + 1, 'Ano inválido'),
        capacity: Yup.number()
          .required('Capacidade é obrigatória')
          .positive('Capacidade deve ser maior que zero'),
        document: Yup.string().required('CRLV é obrigatório'),
        insurance_number: Yup.string().required('Número do seguro é obrigatório'),
        insurance_expiry: Yup.date()
          .required('Data de vencimento do seguro é obrigatória')
          .min(new Date(), 'Data de vencimento deve ser futura'),
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

      const vehicleExists = await Vehicle.findOne({
        where: { 
          plate: req.body.plate,
          user_id: { [Op.ne]: req.userId }
        }
      });

      if (vehicleExists) {
        return res.status(400).json({ error: 'Já existe um veículo cadastrado com esta placa' });
      }

      const vehicle = await Vehicle.create({
        ...req.body,
        user_id: req.userId,
        status: 'disponivel'
      });

      return res.json(vehicle);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const vehicle = await Vehicle.findOne({
        where: {
          id: req.params.id,
          user_id: req.userId,
        },
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      return res.json(vehicle);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const schema = Yup.object().shape({
        plate: Yup.string()
          .matches(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/, 'Placa inválida'),
        type: Yup.string(),
        brand: Yup.string(),
        model: Yup.string(),
        year: Yup.number()
          .min(1900, 'Ano inválido')
          .max(new Date().getFullYear() + 1, 'Ano inválido'),
        capacity: Yup.number()
          .positive('Capacidade deve ser maior que zero'),
        status: Yup.string()
          .oneOf(['disponivel', 'em_uso', 'manutencao'], 'Status inválido'),
        document: Yup.string(),
        insurance_number: Yup.string(),
        insurance_expiry: Yup.date()
          .min(new Date(), 'Data de vencimento deve ser futura'),
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

      const vehicle = await Vehicle.findOne({
        where: {
          id: req.params.id,
          user_id: req.userId,
        },
        include: [{
          model: Freight,
          as: 'fretes',
          attributes: ['id', 'status'],
          where: {
            status: {
              [Op.in]: ['aceito', 'em_transporte']
            }
          },
          required: false
        }]
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      // Verifica se o veículo está em uso antes de permitir alterações
      if (vehicle.fretes.length > 0 && req.body.status !== 'em_uso') {
        return res.status(400).json({ 
          error: 'Não é possível alterar o status de um veículo que está em uso em um frete' 
        });
      }

      if (req.body.plate && req.body.plate !== vehicle.plate) {
        const vehicleExists = await Vehicle.findOne({
          where: { 
            plate: req.body.plate,
            user_id: { [Op.ne]: req.userId }
          }
        });

        if (vehicleExists) {
          return res.status(400).json({ error: 'Já existe um veículo cadastrado com esta placa' });
        }
      }

      const updatedVehicle = await vehicle.update(req.body);

      return res.json(updatedVehicle);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const vehicle = await Vehicle.findOne({
        where: {
          id: req.params.id,
          user_id: req.userId,
        },
        include: [{
          model: Freight,
          as: 'fretes',
          attributes: ['id', 'status'],
          where: {
            status: {
              [Op.in]: ['aceito', 'em_transporte']
            }
          },
          required: false
        }]
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      if (vehicle.fretes.length > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir um veículo que está em uso em um frete' 
        });
      }

      await vehicle.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getFreights(req, res) {
    try {
      const vehicle = await Vehicle.findOne({
        where: {
          id: req.params.id,
          user_id: req.userId,
        },
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      const freights = await Freight.findAll({
        where: {
          vehicle_id: vehicle.id,
        },
        include: [
          {
            model: User,
            as: 'embarcador',
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      return res.json(freights);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new VehicleController(); 