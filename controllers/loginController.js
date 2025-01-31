const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { getErrorMessage } = require('./handleErrorLogin');

// Renderizar la vista de login con o sin mensaje de error
exports.renderLogin = (req, res) => {
    const error = req.query.error; // Leer el parámetro de error
    const errorMessage = error ? getErrorMessage(error) : null;
    res.render('login', { errorMessage });
};

// Manejar el inicio de sesión
exports.handleLogin = async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.redirect('/login?error=userNotFound');
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(contraseña, user.contraseña);

        if (!isMatch) {
            return res.redirect('/login?error=incorrectPassword');
        }

        const token = jwt.sign(
            { id_usuario: user.id_usuario, email: user.email, id_rol: user.id_rol, nombre: user.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );

        // Guardar el token en una cookie o usarlo en el frontend
        res.cookie('token', token, { httpOnly: true }); // Opcional: usar cookies
        res.redirect('/home'); // Redirigir al dashboard del home
    } catch (err) {
        console.error('Error en el inicio de sesión:', err.message);
        res.redirect('/login?error=serverError');
    }
};
