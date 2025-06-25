const db = require('../config/db');

// Listar todos los programas
exports.listPrograms = async (req, res) => {
    try {
        const [programs] = await db.query('SELECT * FROM programa');
        res.render('dashboard', {
            user: req.user,
            content: 'programs',
            programs,
        });
    } catch (error) {
        console.error('Error al listar programas:', error);
        res.status(500).send('Hubo un error al listar los programas.');
    }
};

// Obtener un programa por ID para la API
exports.getProgramById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM programa WHERE id_programa = ?', [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Programa no encontrado' });
        }
    } catch (error) {
        console.error(`Error al obtener el programa por ID: ${id}`, error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Agregar un nuevo programa
exports.addProgram = async (req, res) => {
    const { nombre_programa } = req.body;
    if (!nombre_programa) {
        return res.status(400).json({ success: false, message: 'El nombre del programa es requerido.' });
    }
    try {
        const [result] = await db.query('INSERT INTO programa (nombre_programa) VALUES (?)', [nombre_programa]);
        res.json({ success: true, message: 'Programa agregado correctamente.', programId: result.insertId });
    } catch (error) {
        console.error('Error al agregar el programa:', error);
        res.status(500).json({ success: false, message: 'Hubo un error al agregar el programa.' });
    }
};

// Actualizar un programa
exports.updateProgram = async (req, res) => {
    const { id_programa, nombre_programa } = req.body;
    if (!id_programa || !nombre_programa) {
        return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
    }
    try {
        await db.query('UPDATE programa SET nombre_programa = ? WHERE id_programa = ?', [nombre_programa, id_programa]);
        res.json({ success: true, message: 'Programa actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el programa:', error);
        res.status(500).json({ success: false, message: 'Hubo un error al actualizar el programa.' });
    }
};

// Eliminar un programa
exports.deleteProgram = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM programa WHERE id_programa = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Programa eliminado correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Programa no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar el programa:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: 'No se puede eliminar el programa porque tiene asignaturas asociadas. Por favor, elimine las asignaturas primero.' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};
