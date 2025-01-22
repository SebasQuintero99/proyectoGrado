const db = require('../config/db'); // Conexión a la base de datos

// Listar todos los docentes
exports.listTeachers = async (req, res) => {
    const itemsPerPage = 1000; // Número de registros por página
    const page = parseInt(req.query.page) || 1; // Página actual
    const offset = (page - 1) * itemsPerPage;

    try {
        // Contar el total de registros en la tabla docente
        const [totalResults] = await db.query('SELECT COUNT(*) AS count FROM docente');
        const totalItems = totalResults[0].count;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Obtener los docentes para la página actual con paginación
        const [teachers] = await db.query('SELECT * FROM docente LIMIT ? OFFSET ?', [itemsPerPage, offset]);

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
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
            },
        });
    } catch (error) {
        console.error('Error al obtener los docentes:', error);
        res.status(500).send('Hubo un error al obtener los docentes.');
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
        await db.query('DELETE FROM docente WHERE id_docente = ?', [id]);
        res.redirect('/teachers');
    } catch (error) {
        console.error('Error al eliminar el docente:', error);
        res.status(500).send('Hubo un error al eliminar el docente.');
    }
};
