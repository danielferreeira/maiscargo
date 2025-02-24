module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'cep', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'logradouro', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'numero', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'complemento', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'bairro', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'cidade', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'estado', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'telefone_whatsapp', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'telefone_emergencia', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'contato_emergencia', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'raio_sugerido', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'regioes_preferidas', {
      type: Sequelize.JSON,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'tipos_carga_preferidos', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'cep');
    await queryInterface.removeColumn('users', 'logradouro');
    await queryInterface.removeColumn('users', 'numero');
    await queryInterface.removeColumn('users', 'complemento');
    await queryInterface.removeColumn('users', 'bairro');
    await queryInterface.removeColumn('users', 'cidade');
    await queryInterface.removeColumn('users', 'estado');
    await queryInterface.removeColumn('users', 'telefone_whatsapp');
    await queryInterface.removeColumn('users', 'telefone_emergencia');
    await queryInterface.removeColumn('users', 'contato_emergencia');
    await queryInterface.removeColumn('users', 'raio_sugerido');
    await queryInterface.removeColumn('users', 'regioes_preferidas');
    await queryInterface.removeColumn('users', 'tipos_carga_preferidos');
  }
}; 