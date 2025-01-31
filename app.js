const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const db = require('./config/db'); // Ruta al archivo de conexión de la base de datos
const cookieParser = require('cookie-parser'); // Middleware para manejar cookies
const router = require('./routes/router'); // Rutas
const verifyToken = require('./middlewares/authMiddleware'); // Middleware de autenticación

// Cargar las variables de entorno
dotenv.config();

// Inicialización de la aplicación
const app = express();
const port = process.env.PORT || 3000;

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(cookieParser()); // Middleware para manejar cookies
app.use(express.urlencoded({ extended: true })); // Para manejar formularios
app.use(verifyToken);

app.use(session({
    secret: process.env.SESSION_SECRET, // Usar la variable de entorno
    resave: process.env.SESSION_RESAVE === 'true', // Convertir a booleano
    saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED === 'true' // Convertir a booleano
}));

// Middleware de autenticación
// Esto debe aplicarse solo a rutas protegidas, no de manera global
// Si se requiere global, eliminar este comentario y mantenerlo aquí
// app.use(verifyToken);

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Configuración de archivos estáticos
app.use(express.static('public'));

// Prueba de conexión a la base de datos
db.getConnection()
    .then((connection) => {
        console.log('Conexión exitosa a la base de datos');
        connection.release(); // Libera la conexión después de probarla
    })
    .catch((err) => {
        console.error('Error al conectar a la base de datos:', err.message);
        process.exit(1); // Detener la aplicación en caso de error crítico
    });

// Rutas
app.use('/', router);

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
