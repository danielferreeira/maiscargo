import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        type: Sequelize.ENUM('transportador', 'embarcador'),
        document: Sequelize.STRING,
        phone: Sequelize.STRING,
        status: Sequelize.ENUM('ativo', 'inativo', 'pendente', 'bloqueado'),
        // Campos de documentos
        rg: Sequelize.STRING,
        rg_emissor: Sequelize.STRING,
        cnh: Sequelize.STRING,
        cnh_categoria: Sequelize.STRING,
        cnh_validade: Sequelize.DATE,
        // Campos de endereço
        cep: Sequelize.STRING,
        logradouro: Sequelize.STRING,
        numero: Sequelize.STRING,
        complemento: Sequelize.STRING,
        bairro: Sequelize.STRING,
        cidade: Sequelize.STRING,
        estado: Sequelize.STRING,
        // Campos de contato
        telefone_fixo: Sequelize.STRING,
        telefone_whatsapp: Sequelize.STRING,
        telefone_emergencia: Sequelize.STRING,
        contato_emergencia: Sequelize.STRING,
        // Campos de preferências
        raio_busca: Sequelize.INTEGER,
        raio_sugerido: Sequelize.INTEGER,
        regioes_preferidas: Sequelize.JSON,
        tipos_carga_preferidos: Sequelize.JSON,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.Vehicle, { foreignKey: 'user_id', as: 'vehicles' });
    this.hasMany(models.Freight, { foreignKey: 'user_id', as: 'freights' });
    this.hasMany(models.Freight, { foreignKey: 'carrier_id', as: 'carrier_freights' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  canSearchFreights() {
    return this.type === 'transportador' && this.status === 'ativo';
  }
}

export default User; 