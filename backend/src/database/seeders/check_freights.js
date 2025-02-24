import { Sequelize } from 'sequelize';
import databaseConfig from '../../config/database.js';

const sequelize = new Sequelize(databaseConfig);

async function checkFreights() {
  try {
    const freights = await sequelize.query('SELECT * FROM freights', { type: Sequelize.QueryTypes.SELECT });
    console.log('Total de fretes:', freights.length);
    console.log('Fretes encontrados:', JSON.stringify(freights, null, 2));
  } catch (error) {
    console.error('Erro ao verificar fretes:', error);
  } finally {
    await sequelize.close();
  }
}

checkFreights(); 