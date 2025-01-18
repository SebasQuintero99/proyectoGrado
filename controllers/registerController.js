const bcrypt = require('bcrypt');
const db = require('../config/db');
const { getErrorMessage } = require('./handleErrorRegister');

// Renderizar la vista de registro con o sin mensaje de error
exports.renderRegister = (req, res) => {
    const error = req.query.error; // Leer el parámetro de error
    const errorMessage = error ? getErrorMessage(error) : null;
    res.render('register', { errorMessage });
};

// Manejar el registro de usuario
exports.handleRegister = async (req, res) => {
    const { nombre, email, contraseña, verificar_contraseña } = req.body;

    // Verificar que las contraseñas coincidan
    if (contraseña !== verificar_contraseña) {
        return res.redirect('/register?error=passwordsMismatch');
    }

    try {
        // Verificar si el correo electrónico ya existe
        const [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.redirect('/register?error=emailExists');
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar el nuevo usuario en la base de datos
        await db.query('INSERT INTO usuario (nombre, email, contraseña, id_rol) VALUES (?, ?, ?, ?)', [
            nombre,
            email,
            hashedPassword,
            2, // Rol predeterminado, por ejemplo, usuario regular
        ]);

        res.redirect('/login'); // Redirigir al login después del registro exitoso
    } catch (err) {
        console.error('Error al registrar el usuario:', err.message);
        res.redirect('/register?error=serverError');
    }
};
