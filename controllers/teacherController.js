const db = require('../config/db'); // Conexión a la base de datos

// Listar todos los docentes sin paginación, DataTables maneja la paginación
exports.listTeachers = async (req, res) => {
    try {
        // Obtener todos los docentes sin aplicar la paginación
        const [teachers] = await db.query('SELECT * FROM docente');

        const { editId } = req.query; // Capturamos el ID del docente a editar desde los parámetros de la URL

        let teacherToEdit = null;
        if (editId) {
            const [rows] = await db.query('SELECT * FROM docente WHERE id_docente = ?', [editId]);
            teacherToEdit = rows.length > 0 ? rows[0] : null;
        }

        // Renderizar la vista con los datos necesarios
        res.render('dashboard', {
            user: req.user,
            content: 'teachers',
            teachers,
            teacherToEdit, // Pasamos el docente a editar (si corresponde)
        });
    } catch (error) {
        console.error('Error al obtener los docentes:', error);
        res.status(500).send('Hubo un error al obtener los docentes.');
    }
};

// Obtener un docente por ID para la API
exports.getTeacherById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM docente WHERE id_docente = ?', [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Docente no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el docente por ID:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Agregar un nuevo docente
exports.addTeacher = async (req, res) => {
    const { nombre, email, telefono } = req.body;

    if (!nombre || !email || !telefono) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    try {
        await db.query('INSERT INTO docente (nombre, email, telefono) VALUES (?, ?, ?)', [nombre, email, telefono]);
        res.redirect('/teachers');
    } catch (error) {
        console.error('Error al agregar el docente:', error);
        res.status(500).send('Hubo un error al agregar el docente.');
    }
};

// Actualizar un docente
exports.updateTeacher = async (req, res) => {
    const { id_docente, nombre, email, telefono } = req.body;

    if (!id_docente || !nombre || !email || !telefono) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    try {
        await db.query('UPDATE docente SET nombre = ?, email = ?, telefono = ? WHERE id_docente = ?', [nombre, email, telefono, id_docente]);
        res.redirect('/teachers');
    } catch (error) {
        console.error('Error al actualizar el docente:', error);
        res.status(500).send('Hubo un error al actualizar el docente.');
    }
};

// Eliminar un docente
exports.deleteTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM docente WHERE id_docente = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Docente eliminado correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Docente no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar el docente:', error);
        // Manejo específico para errores de clave foránea
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: 'No se puede eliminar el docente porque está asignado a una asignatura o laboratorio. Por favor, reasigne o elimine esos registros primero.' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};
