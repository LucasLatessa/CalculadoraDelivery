-- Tabla usuarios
create table usuarios (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  origen_direc text,
  origen_lat numeric,
  origen_lng numeric
);

-- Tabla precios
create table precios (
  id serial primary key,
  usuario_id uuid references usuarios(id) on delete cascade,
  cuadras int not null,
  precio int not null
);

-- Tabla logs
create table logs (
  id serial primary key,
  usuario_id uuid references usuarios(id) on delete cascade,
  direccion_ingresada text,
  direccion_geocodificada text,
  long_lat text,
  error text,
  tipo_ubicacion text,
  status text,
  fecha timestamp default current_timestamp
);
