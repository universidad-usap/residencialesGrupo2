CREATE DATABASE residencial_qr;
USE residencial_qr;
SELECT * FROM usuarios;

ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) DEFAULT 'RESIDENTE';

INSERT INTO usuarios 
VALUES ('Jesus Maradiaga', 'J.Maradiaga', '1234', 'ADMIN');

UPDATE usuarios 
SET nombre = 'Angie Cruz',
	usuario = 'A.Cruz', 
    password = '12345',
    rol = 'ADMIN'
WHERE id_usuario = 3;

INSERT INTO usuarios (nombre, usuario, password) 
VALUES ('Jose Sevilla', 'admin', '12345');

ALTER TABLE areas ADD COLUMN estado TINYINT(1) DEFAULT 1;

-- TABLA AREAS
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- TABLA CASAS
CREATE TABLE casas (
    id_casa INT AUTO_INCREMENT PRIMARY KEY,
    numero_casa VARCHAR(20) NOT NULL,
    id_area INT,
    propietario VARCHAR(100),
    telefono VARCHAR(20),
    estado ENUM('ocupada','desocupada') DEFAULT 'ocupada',
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

-- TABLA RESIDENTES
CREATE TABLE residentes (
    id_residente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    id_casa INT,
    tipo ENUM('propietario','familiar','inquilino'),
    FOREIGN KEY (id_casa) REFERENCES casas(id_casa)
);

-- TABLA USUARIOS (ADMIN / GUARDIA)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    usuario VARCHAR(50),
    password VARCHAR(255)
    );

-- TABLA TIPOS DE VISITA
CREATE TABLE tipos_visita (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    descripcion TEXT
);

-- TABLA VISITAS
CREATE TABLE visitas (
    id_visita INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    identidad VARCHAR(50),
    telefono VARCHAR(20),
    placa_vehiculo VARCHAR(20),
    id_tipo INT,
    FOREIGN KEY (id_tipo) REFERENCES tipos_visita(id_tipo)
);

-- CODIGOS QR --
CREATE TABLE IF NOT EXISTS codigos_qr (
    id_qr INT AUTO_INCREMENT PRIMARY KEY,
    id_visita INT,
    codigo_token VARCHAR(255) UNIQUE,
    estado ENUM('activo', 'usado', 'expirado') DEFAULT 'activo',
    FOREIGN KEY (id_visita) REFERENCES visitas(id_visita)
);

-- TABLA CONTROL DE ACCESOS
CREATE TABLE accesos (
    id_acceso INT AUTO_INCREMENT PRIMARY KEY,
    id_qr INT,
    fecha_entrada DATETIME,
    fecha_salida DATETIME,
    guardia_registro INT,
    FOREIGN KEY (id_qr) REFERENCES codigos_qr(id_qr),
    FOREIGN KEY (guardia_registro) REFERENCES usuarios(id_usuario)
);

-- TABLA SERVICIOS
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    costo DECIMAL(10,2)
);

-- TABLA PAGOS
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_casa INT,
    id_servicio INT,
    monto DECIMAL(10,2),
    fecha_pago DATE,
    estado ENUM('pagado','pendiente','atrasado') DEFAULT 'pendiente',
    metodo_pago VARCHAR(50),
    FOREIGN KEY (id_casa) REFERENCES casas(id_casa),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

-- TABLA COMUNICADOS
CREATE TABLE comunicados (
    id_comunicado INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200),
    mensaje TEXT,
    fecha_publicacion DATETIME,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- TABLA VISITAS DE SERVICIO
CREATE TABLE visita_servicio (
    id_visita_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT,
    id_casa INT,
    fecha_visita DATETIME,
    descripcion TEXT,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_casa) REFERENCES casas(id_casa)
);
