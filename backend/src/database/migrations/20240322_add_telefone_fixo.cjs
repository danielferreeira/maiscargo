module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'telefone_fixo', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('Coluna telefone_fixo adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar coluna telefone_fixo:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'telefone_fixo');
      console.log('Coluna telefone_fixo removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover coluna telefone_fixo:', error);
      throw error;
    }
  }
}; 