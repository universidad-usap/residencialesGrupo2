const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const myConnection = require('express-myconnection');

const app = express();

// 1. Configuraciones
app.set('port', process.env.PORT || 3000);

// 2. Middlewares
app.use(morgan('dev'));
app.use(cors({
    origin: "http://localhost:4200", // Permite que Angular se conecte
    credentials: true
}));
app.use(express.json()); // CRÍTICO: Para que el backend entienda los datos que envía Angular

// 3. Conexión a la Nueva Base de Datos
app.use(myConnection(mysql, {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Pon tu contraseña de MySQL
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'residencial_qr'    // Tu nueva base de datos
}, 'single'));

// 4. Importar las nuevas Rutas
const areasRoutes = require('./rotes/areas');
const casasRoutes = require('./rotes/casas');
const residentesRoutes = require('./rotes/residentes');
const serviciosRoutes = require('./rotes/servicios');
const comunicadosRoutes = require('./rotes/comunicados');
const loginRoutes = require('./rotes/login');
const visitasRoutes = require('./rotes/visitas');
const accesosRoutes = require('./rotes/accesos');

// 5. Usar las Rutas (Endpoints)
app.use('/api/areas', areasRoutes);
app.use('/api/casas', casasRoutes);
app.use('/api/residentes', residentesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/comunicados', comunicadosRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/visitas', visitasRoutes);
app.use('/api/accesos', accesosRoutes);

// 6. Servidor
app.listen(app.get('port'), () => {
    console.log(`Servidor Residencial QR corriendo en el puerto ${app.get('port')}`);
});