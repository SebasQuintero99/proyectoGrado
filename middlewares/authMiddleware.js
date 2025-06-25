const jwt = require('jsonwebtoken');
const accessControl = require('../config/accessControl.json');

const verifyToken = (req, res, next) => {
    const excludedRoutes = ['/login', '/register', '/favicon.ico', '/css', '/js', '/logout'];

    if (excludedRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    let token = req.cookies?.token;
    const authHeader = req.headers['authorization'];

    if (!token && authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) {
        console.log('Token no proporcionado.');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const { id_rol } = decoded;
        const rutasPermitidas = accessControl.roles[id_rol]?.rutas || [];
        res.locals.permittedRoutes = rutasPermitidas;

        const hasAccess = rutasPermitidas.some(route => {
            const regex = new RegExp(`^${route.replace('*', '.*')}$`);
            return regex.test(req.path);
        });

        if (hasAccess) {
            return next();
        }

        console.log(`Acceso denegado a la ruta ${req.path} para el rol ${id_rol}`);
        if (req.accepts('json')) {
            return res.status(403).json({ success: false, message: 'Acceso prohibido a este recurso.' });
        }
        return res.status(403).render('dashboard', {
            user: decoded,
            content: 'accessForbidden',
        });

    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        if (req.accepts('json')) {
            return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
        }
        return res.redirect('/login?error=unauthorized');
    }
};

module.exports = verifyToken;
