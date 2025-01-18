
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const excludedRoutes = ['/login', '/register']; // Rutas que no necesitan token

    if (excludedRoutes.includes(req.path)) {
        return next(); // Saltar la verificación para estas rutas
    }

    const token = req.cookies?.token || req.headers['authorization'];

    if (!token) {
        console.log('Token no proporcionado, redirigiendo al login');
        return res.redirect('/login?error=unauthorized'); // Redirigir al login
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Agregar datos del usuario al objeto de la solicitud
        next(); // Continuar
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.log('Token expirado, redirigiendo al login');
            return res.redirect('/login?error=tokenExpired');
        }

        console.error('Error al verificar el token:', err.message);
        return res.redirect('/login?error=unauthorized'); // Redirigir al login
    }
};

module.exports = verifyToken;



