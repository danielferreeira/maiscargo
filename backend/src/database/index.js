import Sequelize from 'sequelize';
import databaseConfig from '../config/database.js';

// Importar os models aqui
import User from '../models/User.js';
import Freight from '../models/Freight.js';
import Vehicle from '../models/Vehicle.js';

const models = [User, Freight, Vehicle];

class Database {
  constructor() {
    this.init();
  }

  async init() {
    try {
      console.log('Iniciando conexão com o banco de dados...');
      this.connection = new Sequelize(databaseConfig);
      
      // Testar a conexão
      await this.connection.authenticate();
      console.log('Conexão com o banco de dados estabelecida com sucesso.');
      
      // Inicializar os models
      models
        .map(model => model.init(this.connection))
        .map(model => model.associate && model.associate(this.connection.models));
        
      console.log('Models inicializados com sucesso.');
    } catch (error) {
      console.error('Erro ao conectar com o banco de dados:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }
}

export default new Database(); 