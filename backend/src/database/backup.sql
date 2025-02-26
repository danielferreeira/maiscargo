-- Criar banco de dados
CREATE DATABASE maiscargo;

-- Conectar ao banco de dados
\c maiscargo;

-- Criar extensão para UUID (se necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('transportador', 'embarcador')),
    document VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente', 'bloqueado')),
    rg VARCHAR(20),
    rg_emissor VARCHAR(20),
    cnh VARCHAR(20),
    cnh_categoria VARCHAR(5),
    cnh_validade DATE,
    cep VARCHAR(9),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(255),
    bairro VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(2),
    telefone_fixo VARCHAR(20),
    telefone_whatsapp VARCHAR(20),
    telefone_emergencia VARCHAR(20),
    contato_emergencia VARCHAR(255),
    raio_busca INTEGER DEFAULT 100,
    raio_sugerido INTEGER DEFAULT 200,
    regioes_preferidas JSON,
    tipos_carga_preferidos JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de veículos
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plate VARCHAR(8) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'manutencao')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fretes
CREATE TABLE freights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    carrier_id INTEGER REFERENCES users(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    origin VARCHAR(255) NOT NULL,
    origin_city VARCHAR(255) NOT NULL,
    origin_state VARCHAR(2) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    destination_city VARCHAR(255) NOT NULL,
    destination_state VARCHAR(2) NOT NULL,
    origin_lat DECIMAL(10,8) NOT NULL,
    origin_lng DECIMAL(11,8) NOT NULL,
    destination_lat DECIMAL(10,8) NOT NULL,
    destination_lng DECIMAL(11,8) NOT NULL,
    cargo_type VARCHAR(50) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    volume DECIMAL(10,2),
    vehicle_type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    distance INTEGER,
    duration VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'aceito', 'em_transporte', 'finalizado', 'cancelado')),
    pickup_date TIMESTAMP NOT NULL,
    delivery_date TIMESTAMP NOT NULL,
    custo_combustivel DECIMAL(10,2) DEFAULT 0,
    custo_pedagio DECIMAL(10,2) DEFAULT 0,
    custo_alimentacao DECIMAL(10,2) DEFAULT 0,
    custo_hospedagem DECIMAL(10,2) DEFAULT 0,
    custo_manutencao DECIMAL(10,2) DEFAULT 0,
    outros_custos DECIMAL(10,2) DEFAULT 0,
    custo_total DECIMAL(10,2) DEFAULT 0,
    lucro_estimado DECIMAL(10,2) DEFAULT 0,
    margem_lucro DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_freights_user_id ON freights(user_id);
CREATE INDEX idx_freights_carrier_id ON freights(carrier_id);
CREATE INDEX idx_freights_status ON freights(status);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freights_updated_at
    BEFORE UPDATE ON freights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 