import Sequelize, { Model } from 'sequelize';

class Vehicle extends Model {
  static init(sequelize) {
    super.init(
      {
        plate: Sequelize.STRING,
        type: Sequelize.STRING,
        brand: Sequelize.STRING,
        model: Sequelize.STRING,
        year: Sequelize.INTEGER,
        capacity: Sequelize.FLOAT,
        status: Sequelize.ENUM('disponivel', 'em_uso', 'manutencao'),
        document: Sequelize.STRING, // CRLV
        insurance_number: Sequelize.STRING,
        insurance_expiry: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'proprietario' });
    this.hasMany(models.Freight, { foreignKey: 'vehicle_id', as: 'fretes' });
  }
}

export default Vehicle; 