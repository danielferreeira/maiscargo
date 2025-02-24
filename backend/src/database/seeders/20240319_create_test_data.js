import bcrypt from 'bcryptjs';

export async function up(queryInterface, Sequelize) {
  // Criar usuário embarcador
  const [embarcador] = await queryInterface.bulkInsert(
    'users',
    [
      {
        name: 'Embarcador Teste',
        email: 'embarcador@teste.com',
        password_hash: await bcrypt.hash('123456', 8),
        type: 'embarcador',
        document: '12345678901',
        phone: '11999999999',
        status: 'ativo',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    { returning: true }
  );

  // Criar fretes
  await queryInterface.bulkInsert('freights', [
    {
      title: 'Frete São Paulo - Rio de Janeiro',
      description: 'Transporte de carga geral',
      origin: 'São Paulo, SP',
      destination: 'Rio de Janeiro, RJ',
      origin_lat: -23.5505,
      origin_lng: -46.6333,
      destination_lat: -22.9068,
      destination_lng: -43.1729,
      cargo_type: 'Carga Geral',
      weight: 1500,
      vehicle_type: 'Caminhão 3/4',
      price: 2500,
      status: 'disponivel',
      pickup_date: new Date('2024-03-25T10:00:00Z'),
      delivery_date: new Date('2024-03-26T18:00:00Z'),
      user_id: embarcador.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      title: 'Frete Curitiba - Florianópolis',
      description: 'Transporte de carga refrigerada',
      origin: 'Curitiba, PR',
      destination: 'Florianópolis, SC',
      origin_lat: -25.4284,
      origin_lng: -49.2733,
      destination_lat: -27.5954,
      destination_lng: -48.5480,
      cargo_type: 'Frigorificada',
      weight: 2000,
      vehicle_type: 'Caminhão Truck',
      price: 3500,
      status: 'disponivel',
      pickup_date: new Date('2024-03-26T08:00:00Z'),
      delivery_date: new Date('2024-03-27T16:00:00Z'),
      user_id: embarcador.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      title: 'Frete Belo Horizonte - Brasília',
      description: 'Transporte de carga paletizada',
      origin: 'Belo Horizonte, MG',
      destination: 'Brasília, DF',
      origin_lat: -19.9167,
      origin_lng: -43.9345,
      destination_lat: -15.7801,
      destination_lng: -47.9292,
      cargo_type: 'Paletizada',
      weight: 5000,
      vehicle_type: 'Carreta Baú',
      price: 4800,
      status: 'disponivel',
      pickup_date: new Date('2024-03-27T09:00:00Z'),
      delivery_date: new Date('2024-03-28T18:00:00Z'),
      user_id: embarcador.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('freights', null, {});
  await queryInterface.bulkDelete('users', null, {});
} 