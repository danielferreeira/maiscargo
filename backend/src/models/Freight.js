import { Model, DataTypes } from 'sequelize';

class Freight extends Model {
  static init(sequelize) {
    super.init(
      {
        title: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        description: DataTypes.TEXT,
        origin: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        origin_city: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        origin_state: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        destination: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        destination_city: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        destination_state: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        origin_lat: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: false,
          validate: {
            isDecimal: true
          }
        },
        origin_lng: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: false,
          validate: {
            isDecimal: true
          }
        },
        destination_lat: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: false,
          validate: {
            isDecimal: true
          }
        },
        destination_lng: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: false,
          validate: {
            isDecimal: true
          }
        },
        cargo_type: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        weight: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 0,
            isDecimal: true
          },
        },
        volume: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true
        },
        vehicle_type: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 0,
            isDecimal: true
          },
        },
        distance: {
          type: DataTypes.INTEGER,
          allowNull: true,
          validate: {
            min: 0
          }
        },
        duration: {
          type: DataTypes.STRING,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('disponivel', 'aceito', 'em_transporte', 'finalizado', 'cancelado'),
          defaultValue: 'disponivel',
          allowNull: false,
        },
        pickup_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        delivery_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        custo_combustivel: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        custo_pedagio: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        custo_alimentacao: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        custo_hospedagem: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        custo_manutencao: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        outros_custos: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        custo_total: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        lucro_estimado: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: false,
        },
        margem_lucro: {
          type: DataTypes.DECIMAL(5, 2),
          defaultValue: 0,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'freights',
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'embarcador' });
    this.belongsTo(models.User, { foreignKey: 'carrier_id', as: 'transportador' });
    this.belongsTo(models.Vehicle, { foreignKey: 'vehicle_id', as: 'veiculo' });
  }
}

export default Freight; 
