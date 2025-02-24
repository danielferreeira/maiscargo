import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import database from '../../config/database.js';

const sequelize = new Sequelize(database);

const freightData = [
  {
    title: "Carga de Eletrônicos SP-RJ",
    description: "Transporte de eletrônicos com seguro",
    origin: "São Paulo, SP",
    origin_city: "São Paulo",
    origin_state: "SP",
    destination: "Rio de Janeiro, RJ",
    destination_city: "Rio de Janeiro",
    destination_state: "RJ",
    origin_lat: -23.5505,
    origin_lng: -46.6333,
    destination_lat: -22.9068,
    destination_lng: -43.1729,
    cargo_type: "Carga Geral",
    weight: 5000,
    volume: 20,
    vehicle_type: "Caminhão Baú",
    price: 3500,
    pickup_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
    delivery_date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Depois de amanhã
    status: "disponivel"
  },
  {
    title: "Grãos Curitiba-Porto Alegre",
    description: "Transporte de grãos a granel",
    origin: "Curitiba, PR",
    origin_city: "Curitiba",
    origin_state: "PR",
    destination: "Porto Alegre, RS",
    destination_city: "Porto Alegre",
    destination_state: "RS",
    origin_lat: -25.4284,
    origin_lng: -49.2733,
    destination_lat: -30.0346,
    destination_lng: -51.2177,
    cargo_type: "Granel",
    weight: 28000,
    volume: 40,
    vehicle_type: "Carreta Graneleira",
    price: 4800,
    pickup_date: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 dias
    delivery_date: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 dias
    status: "disponivel"
  },
  {
    title: "Carga Refrigerada Florianópolis-São Paulo",
    description: "Transporte de produtos congelados",
    origin: "Florianópolis, SC",
    origin_city: "Florianópolis",
    origin_state: "SC",
    destination: "São Paulo, SP",
    destination_city: "São Paulo",
    destination_state: "SP",
    origin_lat: -27.5954,
    origin_lng: -48.5480,
    destination_lat: -23.5505,
    destination_lng: -46.6333,
    cargo_type: "Frigorificada",
    weight: 15000,
    volume: 30,
    vehicle_type: "Caminhão Frigorífico",
    price: 5200,
    pickup_date: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 dias
    delivery_date: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 dias
    status: "disponivel"
  },
  {
    title: "Mudança Residencial BH-Brasília",
    description: "Transporte de móveis e utensílios domésticos",
    origin: "Belo Horizonte, MG",
    origin_city: "Belo Horizonte",
    origin_state: "MG",
    destination: "Brasília, DF",
    destination_city: "Brasília",
    destination_state: "DF",
    origin_lat: -19.9167,
    origin_lng: -43.9345,
    destination_lat: -15.7975,
    destination_lng: -47.8919,
    cargo_type: "Mudança",
    weight: 8000,
    volume: 45,
    vehicle_type: "Caminhão Baú",
    price: 4200,
    pickup_date: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 dias
    delivery_date: new Date(Date.now() + 120 * 60 * 60 * 1000), // 5 dias
    status: "disponivel"
  },
  {
    title: "Veículos Salvador-Recife",
    description: "Transporte de automóveis novos",
    origin: "Salvador, BA",
    origin_city: "Salvador",
    origin_state: "BA",
    destination: "Recife, PE",
    destination_city: "Recife",
    destination_state: "PE",
    origin_lat: -12.9714,
    origin_lng: -38.5014,
    destination_lat: -8.0476,
    destination_lng: -34.8770,
    cargo_type: "Veículos",
    weight: 12000,
    volume: 60,
    vehicle_type: "Carreta Cegonha",
    price: 6500,
    pickup_date: new Date(Date.now() + 120 * 60 * 60 * 1000), // 5 dias
    delivery_date: new Date(Date.now() + 144 * 60 * 60 * 1000), // 6 dias
    status: "disponivel"
  }
];

async function up() {
  try {
    // Criar usuário embarcador
    const password_hash = await bcrypt.hash('123456', 8);
    
    const [embarcador] = await sequelize.query(`
      INSERT INTO users (name, email, password_hash, type, document, phone, cidade, estado, created_at, updated_at)
      VALUES ('Embarcador Teste', 'embarcador.teste@example.com', :password_hash, 'embarcador', '12345678901234', '11999999999', 'São Paulo', 'SP', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
      RETURNING id;
    `, {
      replacements: { password_hash },
      type: Sequelize.QueryTypes.INSERT
    });

    // Criar os fretes
    for (const freight of freightData) {
      await sequelize.query(`
        INSERT INTO freights (
          title, description, origin, origin_city, origin_state,
          destination, destination_city, destination_state,
          origin_lat, origin_lng, destination_lat, destination_lng,
          cargo_type, weight, volume, vehicle_type, price,
          pickup_date, delivery_date, status, user_id,
          created_at, updated_at
        ) VALUES (
          :title, :description, :origin, :origin_city, :origin_state,
          :destination, :destination_city, :destination_state,
          :origin_lat, :origin_lng, :destination_lat, :destination_lng,
          :cargo_type, :weight, :volume, :vehicle_type, :price,
          :pickup_date, :delivery_date, :status, :user_id,
          NOW(), NOW()
        )
      `, {
        replacements: {
          ...freight,
          user_id: embarcador[0].id
        }
      });
    }

    console.log('Fretes de teste criados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar fretes de teste:', error);
    process.exit(1);
  }
}

up(); 