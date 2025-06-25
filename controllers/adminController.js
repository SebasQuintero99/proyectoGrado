// adminController.js
const db = require('../config/db'); // Conexión a la base de datos
const bcrypt = require('bcrypt');

// Listar usuarios
exports.listUsers = async (req, res) => {
    try {
        const errorMessage = req.session.error; // Recuperar el mensaje de error de la sesión
        delete req.session.error; // Limpiar el mensaje de error después de usarlo

        const [users] = await db.query(`SELECT usuario.*, rol.nombre AS rol_nombre FROM usuario 
                                         INNER JOIN rol ON usuario.id_rol = rol.id_rol`);
        const [roles] = await db.query('SELECT * FROM rol');

        const { editId } = req.query;
        let userToEdit = null;
        if (editId) {
            const [rows] = await db.query('SELECT * FROM usuario WHERE id_usuario = ?', [editId]);
            userToEdit = rows.length > 0 ? rows[0] : null;
        }

        res.render('dashboard', {
            user: req.user,
            content: 'admin',
            users,
            roles,
            userToEdit,
            errorMessage,
        });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        req.session.error = 'Hubo un error al listar los usuarios.';
        res.redirect('/admin');
    }
};

// Agregar un nuevo usuario
exports.addUser = async (req, res) => {
    const { nombre, email, contraseña, confirmarContraseña, id_rol } = req.body;

    try {
        // Validar campos requeridos excepto las contraseñas inicialmente
        if (!nombre || !email || !id_rol) {
            req.session.error = 'Todos los campos son requeridos.';
            return res.redirect('/admin');
        }

        // Validar que las contraseñas coincidan
        if (contraseña !== confirmarContraseña) {
            req.session.error = 'Las contraseñas no coinciden.';
            return res.redirect('/admin');
        }

        // Verificar si el correo ya existe
        const [existingUser] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            req.session.error = 'El correo ya está registrado.';
            return res.redirect('/admin');
        }

        // Insertar el usuario
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const result = await db.query(
            'INSERT INTO usuario (nombre, email, contraseña, id_rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, id_rol]
        );


        res.redirect('/admin');
    } catch (error) {
        console.error('Error al agregar el usuario:', error.message);
        req.session.error = `Hubo un error al agregar el usuario: ${error.message}`;
        res.redirect('/admin');
    }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
    const { id_usuario, nombre, email, contraseña, confirmarContraseña, id_rol } = req.body;

    // Validar campos requeridos excepto las contraseñas inicialmente
    if (!id_usuario || !nombre || !email || !id_rol) {
        req.session.error = 'Todos los campos son requeridos.';
        return res.redirect('/admin');
    }

    // Validar que las contraseñas coincidan si se proporcionan
    if (contraseña && contraseña !== confirmarContraseña) {
        req.session.error = 'Las contraseñas no coinciden.';
        return res.redirect('/admin');
    }

    try {
        // Verificar si el correo ya existe para otro usuario
        const [existingUser] = await db.query('SELECT * FROM usuario WHERE email = ? AND id_usuario != ?', [email, id_usuario]);
        if (existingUser.length > 0) {
            req.session.error = 'El correo ya está registrado por otro usuario.';
            return res.redirect('/admin');
        }

        // Actualizar contraseña solo si se proporciona
        let query = 'UPDATE usuario SET nombre = ?, email = ?, id_rol = ?';
        const params = [nombre, email, id_rol];

        if (contraseña) {
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            query += ', contraseña = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id_usuario = ?';
        params.push(id_usuario);

        await db.query(query, params);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        req.session.error = 'Hubo un error al actualizar el usuario.';
        res.redirect('/admin');
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        req.session.error = 'Hubo un error al eliminar el usuario.';
        res.redirect('/admin');
    }
};