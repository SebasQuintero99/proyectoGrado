exports.handleLogout = (req, res) => {
    // Eliminar el token de las cookies (o de la sesión si estás usando sesiones)
    res.clearCookie('token'); // Elimina la cookie 'token'
    res.redirect('/login'); // Redirige al login después de cerrar sesión
};
