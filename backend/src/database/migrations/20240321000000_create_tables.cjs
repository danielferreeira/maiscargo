module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela de usuários
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('transportador', 'embarcador'),
        allowNull: false,
      },
      document: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pendente', 'ativo', 'bloqueado'),
        allowNull: false,
        defaultValue: 'ativo',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela de veículos
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      plate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      capacity: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('disponivel', 'em_uso', 'manutencao'),
        allowNull: false,
        defaultValue: 'disponivel',
      },
      document: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      insurance_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      insurance_expiry: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Criar tabela de fretes
    await queryInterface.createTable('freights', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      carrier_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        references: { model: 'vehicles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      origin: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      origin_city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      origin_state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      destination_city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      destination_state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      origin_lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      origin_lng: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      destination_lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      destination_lng: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      cargo_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      volume: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      vehicle_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      distance: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('disponivel', 'aceito', 'em_transporte', 'finalizado', 'cancelado'),
        allowNull: false,
        defaultValue: 'disponivel',
      },
      pickup_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      delivery_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('freights');
    await queryInterface.dropTable('vehicles');
    await queryInterface.dropTable('users');
  }
}; 