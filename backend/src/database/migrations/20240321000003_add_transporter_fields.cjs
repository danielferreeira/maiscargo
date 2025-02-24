module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'rg', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'rg_emissor', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'cnh', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'cnh_categoria', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'cnh_validade', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'raio_busca', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'rg');
    await queryInterface.removeColumn('users', 'rg_emissor');
    await queryInterface.removeColumn('users', 'cnh');
    await queryInterface.removeColumn('users', 'cnh_categoria');
    await queryInterface.removeColumn('users', 'cnh_validade');
    await queryInterface.removeColumn('users', 'raio_busca');
  }
}; 