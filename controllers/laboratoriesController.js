const db = require('../config/db'); // Conexión a la base de datos


exports.listLaboratories = async (req, res) => {
    try {
        // Obtener todos los laboratorios sin paginación
        const [laboratories] = await db.query(`
            SELECT laboratorio.id_laboratorio, laboratorio.nombre, laboratorio.capacidad, 
                   docente.nombre AS docente_nombre, docente.email AS docente_email, docente.telefono AS docente_telefono
            FROM laboratorio
            LEFT JOIN docente ON laboratorio.id_docente = docente.id_docente
        `);

        const { editId } = req.query; // Capturamos el ID del laboratorio a editar desde los parámetros de la URL

        let laboratoryToEdit = null;
        if (editId) {
            const [rows] = await db.query('SELECT * FROM laboratorio WHERE id_laboratorio = ?', [editId]);
            laboratoryToEdit = rows.length > 0 ? rows[0] : null;
        }

        // Obtener la lista de docentes para el selector en el formulario
        const [teachers] = await db.query('SELECT id_docente, nombre, email FROM docente');

        // Renderizar la vista con los datos necesarios
        res.render('dashboard', {
            user: req.user,
            content: 'laboratories', // Esta es la vista de laboratorios
            laboratories,  // Pasamos todos los laboratorios
            laboratoryToEdit, // Pasamos el laboratorio a editar (si corresponde)
            teachers, // Pasamos la lista de docentes para el selector
        });
    } catch (error) {
        console.error('Error al obtener los laboratorios:', error);
        res.status(500).send('Hubo un error al obtener los laboratorios.');
    }
};

// Agregar un nuevo laboratorio
exports.addLaboratory = async (req, res) => {
    const { nombre, capacidad, id_docente } = req.body;

    if (!nombre || !capacidad || !id_docente) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    try {
        await db.query('INSERT INTO laboratorio (nombre, capacidad, id_docente) VALUES (?, ?, ?)', [nombre, capacidad, id_docente]);
        res.redirect('/laboratories');
    } catch (error) {
        console.error('Error al agregar el laboratorio:', error);
        res.status(500).send('Hubo un error al agregar el laboratorio.');
    }
};

// Actualizar un laboratorio
exports.updateLaboratory = async (req, res) => {
    const { id_laboratorio, nombre, capacidad, id_docente } = req.body;

    if (!id_laboratorio || !nombre || !capacidad || !id_docente) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    try {
        await db.query('UPDATE laboratorio SET nombre = ?, capacidad = ?, id_docente = ? WHERE id_laboratorio = ?', [nombre, capacidad, id_docente, id_laboratorio]);
        res.redirect('/laboratories');
    } catch (error) {
        console.error('Error al actualizar el laboratorio:', error);
        res.status(500).send('Hubo un error al actualizar el laboratorio.');
    }
};

// Eliminar un laboratorio
exports.deleteLaboratory = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM laboratorio WHERE id_laboratorio = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Laboratorio eliminado correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Laboratorio no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar el laboratorio:', error);
        res.status(500).json({ success: false, message: 'Hubo un error al eliminar el laboratorio.' });
    }
};

// Obtener un laboratorio por ID para la API
exports.getLaboratoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM laboratorio WHERE id_laboratorio = ?', [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Laboratorio no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el laboratorio:', error);
        res.status(500).send('Error interno del servidor');
    }
};
