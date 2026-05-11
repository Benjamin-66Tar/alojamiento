CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  location VARCHAR(180) NOT NULL,
  description TEXT,
  rating NUMERIC(2, 1) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_types (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 2,
  price_per_night NUMERIC(10, 2) NOT NULL
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id INTEGER NOT NULL REFERENCES room_types(id),
  room_number VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'available',
  UNIQUE (hotel_id, room_number)
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  price NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reservation_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  reservation_number VARCHAR(40) NOT NULL UNIQUE,
  guest_id INTEGER NOT NULL REFERENCES users(id),
  hotel_id INTEGER NOT NULL REFERENCES hotels(id),
  room_type_id INTEGER REFERENCES room_types(id),
  reservation_type_id INTEGER NOT NULL REFERENCES reservation_types(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

CREATE TABLE reservation_services (
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (reservation_id, service_id)
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'paid',
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (code, name) VALUES
  ('super-admin', 'Super Admin'),
  ('gerente', 'Gerente'),
  ('recepcionista', 'Recepcionista'),
  ('housekeeping', 'Housekeeping'),
  ('mantenimiento', 'Mantenimiento'),
  ('huesped', 'Huesped');

INSERT INTO reservation_types (name, description) VALUES
  ('Flexible', 'Permite cambios de fecha segun disponibilidad.'),
  ('No reembolsable', 'Tarifa preferencial sin reembolso despues del pago.'),
  ('Ejecutiva', 'Incluye beneficios para viajes de trabajo.'),
  ('Familiar', 'Pensada para grupos familiares y estancias con menores.');

INSERT INTO services (name, summary, price) VALUES
  ('WiFi premium', 'Internet de mayor velocidad para trabajo, streaming y videollamadas.', 12.00),
  ('Desayuno buffet', 'Acceso diario al desayuno con bebidas, frutas, panaderia y platos calientes.', 18.00),
  ('Spa', 'Sesion de relajacion con masaje o circuito humedo segun disponibilidad.', 65.00),
  ('Transporte aeropuerto', 'Traslado programado entre el aeropuerto y el hotel.', 45.00),
  ('Room service', 'Servicio de alimentos y bebidas directo a la habitacion.', 0.00),
  ('Estacionamiento', 'Lugar de estacionamiento privado durante la estancia.', 15.00),
  ('Lavanderia', 'Lavado y planchado de prendas con entrega programada.', 20.00),
  ('Tour local', 'Experiencia guiada por puntos turisticos cercanos al hotel.', 55.00);
