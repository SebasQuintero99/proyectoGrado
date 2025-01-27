const db = require('../config/db'); // Conexión a la base de datos

exports.listSchedules = async (req, res) => {
    try {
        // Obtener todos los horarios sin paginación
        const [schedules] = await db.query('SELECT * FROM horario');

        const { editId } = req.query; // Capturamos el ID del horario a editar desde los parámetros de la URL

        let scheduleToEdit = null;
        if (editId) {
            const [rows] = await db.query('SELECT * FROM horario WHERE id_horario = ?', [editId]);
            scheduleToEdit = rows.length > 0 ? rows[0] : null;
        }

        // Renderizar la vista con los datos necesarios
        res.render('dashboard', {
            user: req.user,
            content: 'schedules',
            schedules,           // Pasamos todos los horarios
            scheduleToEdit,      // Pasamos el horario a editar (si corresponde)
        });
    } catch (error) {
        console.error('Error al obtener los horarios:', error);
        res.status(500).send('Hubo un error al obtener los horarios.');
    }
};

// Agregar un nuevo horario
exports.addSchedule = async (req, res) => {
    const { dia, hora_inicio, hora_fin } = req.body;

    if (!dia || !hora_inicio || !hora_fin) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    try {
        await db.query('INSERT INTO horario (dia, hora_inicio, hora_fin) VALUES (?, ?, ?)', [dia, hora_inicio, hora_fin]);
        res.redirect('/schedules');
    } catch (error) {
        console.error('Error al agregar el horario:', error);
        res.status(500).send('Hubo un error al agregar el horario.');
    }
};

// Actualizar un horario
exports.updateSchedule = async (req, res) => {
    const { id_horario, dia, hora_inicio, hora_fin } = req.body;

    if (!id_horario || !dia || !hora_inicio || !hora_fin) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    try {
        await db.query('UPDATE horario SET dia = ?, hora_inicio = ?, hora_fin = ? WHERE id_horario = ?', [dia, hora_inicio, hora_fin, id_horario]);
        res.redirect('/schedules');
    } catch (error) {
        console.error('Error al actualizar el horario:', error);
        res.status(500).send('Hubo un error al actualizar el horario.');
    }
};

// Eliminar un horario
exports.deleteSchedule = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM horario WHERE id_horario = ?', [id]);
        res.redirect('/schedules');
    } catch (error) {
        console.error('Error al eliminar el horario:', error);
        res.status(500).send('Hubo un error al eliminar el horario.');
    }
};
