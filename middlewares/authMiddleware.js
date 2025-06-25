const jwt = require('jsonwebtoken');
const accessControl = require('../config/accessControl.json');

const verifyToken = (req, res, next) => {
    const excludedRoutes = ['/login', '/register', '/favicon.ico', '/css', '/js', '/logout'];

    if (excludedRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }

    const token = req.cookies?.token || req.headers['authorization'];

    if (!token) {
        console.log('Token no proporcionado, redirigiendo al login');
        return res.redirect('/login?error=unauthorized');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const { id_rol } = decoded;
        const rutasPermitidas = accessControl.roles[id_rol]?.rutas || [];
        res.locals.permittedRoutes = rutasPermitidas;

        // Verificar acceso con rutas exactas o dinámicas
        const hasAccess = rutasPermitidas.some(route => {
            const regex = new RegExp(`^${route.replace('*', '.*')}$`);
            return regex.test(req.path);
        });

        if (hasAccess) {
            return next();
        }

        console.log(`Acceso denegado a la ruta ${req.path} para el rol ${id_rol}`);
        return res.status(403).render('dashboard', {
            user: decoded,
            content: 'accessForbidden',
        });
    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        return res.redirect('/login?error=unauthorized');
    }
};

module.exports = verifyToken;
