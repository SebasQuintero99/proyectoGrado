// adminController.js
const db = require('../config/db'); // Conexión a la base de datos
const bcrypt = require('bcrypt');

// Listar usuarios para la vista principal
exports.listUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id_usuario, u.nombre, u.email, r.nombre AS rol_nombre 
            FROM usuario u 
            JOIN rol r ON u.id_rol = r.id_rol
        `);
        const [roles] = await db.query('SELECT * FROM rol');

        res.render('dashboard', {
            user: req.user,
            content: 'admin',
            users,
            roles,
            errorMessage: null,
        });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).render('dashboard', {
            user: req.user,
            content: 'admin',
            users: [],
            roles: [],
            errorMessage: 'Hubo un error al cargar los datos de usuarios.',
        });
    }
};

// Obtener un usuario por ID (API)
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT id_usuario, nombre, email, id_rol FROM usuario WHERE id_usuario = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Agregar un nuevo usuario
exports.addUser = async (req, res) => {
    const { nombre, email, contraseña, confirmarContraseña, id_rol } = req.body;

    if (!nombre || !email || !contraseña || !id_rol) {
        return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
    }
    if (contraseña !== confirmarContraseña) {
        return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden.' });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ success: false, message: 'El correo ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);
        await db.query('INSERT INTO usuario (nombre, email, contraseña, id_rol) VALUES (?, ?, ?, ?)', [nombre, email, hashedPassword, id_rol]);
        
        res.status(201).json({ success: true, message: 'Usuario agregado correctamente.' });
    } catch (error) {
        console.error('Error al agregar el usuario:', error);
        res.status(500).json({ success: false, message: 'Error al agregar el usuario.' });
    }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
    const { id_usuario, nombre, email, contraseña, confirmarContraseña, id_rol } = req.body;

    if (!id_usuario || !nombre || !email || !id_rol) {
        return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
    }
    if (contraseña && contraseña !== confirmarContraseña) {
        return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden.' });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM usuario WHERE email = ? AND id_usuario != ?', [email, id_usuario]);
        if (existingUser.length > 0) {
            return res.status(409).json({ success: false, message: 'El correo ya está registrado por otro usuario.' });
        }

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
        res.json({ success: true, message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el usuario.' });
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el usuario a eliminar es el superadmin (asumiendo que el ID 1 es superadmin)
        if (id === '1') {
            return res.status(403).json({ success: false, message: 'No se puede eliminar al superadministrador.' });
        }

        const [result] = await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

        if (result.affectedRows > 0) {
            return res.json({ success: true, message: 'Usuario eliminado correctamente.' });
        }
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    } catch (error) {
        // Error de restricción de clave externa
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar el usuario porque está referenciado en otra parte de la aplicación (por ejemplo, en un horario).'
            });
        }
        
        console.error('Error al eliminar el usuario:', error);
        return res.status(500).json({ success: false, message: 'Ocurrió un error inesperado en el servidor.' });
    }
};