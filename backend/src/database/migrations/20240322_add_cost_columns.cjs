module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('freights', 'custo_combustivel', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'custo_pedagio', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'custo_alimentacao', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'custo_hospedagem', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'custo_manutencao', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'outros_custos', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'custo_total', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'lucro_estimado', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
      await queryInterface.addColumn('freights', 'margem_lucro', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      });
      console.log('Colunas de custo adicionadas com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar colunas de custo:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('freights', 'custo_combustivel');
      await queryInterface.removeColumn('freights', 'custo_pedagio');
      await queryInterface.removeColumn('freights', 'custo_alimentacao');
      await queryInterface.removeColumn('freights', 'custo_hospedagem');
      await queryInterface.removeColumn('freights', 'custo_manutencao');
      await queryInterface.removeColumn('freights', 'outros_custos');
      await queryInterface.removeColumn('freights', 'custo_total');
      await queryInterface.removeColumn('freights', 'lucro_estimado');
      await queryInterface.removeColumn('freights', 'margem_lucro');
      console.log('Colunas de custo removidas com sucesso');
    } catch (error) {
      console.error('Erro ao remover colunas de custo:', error);
      throw error;
    }
  }
}; 