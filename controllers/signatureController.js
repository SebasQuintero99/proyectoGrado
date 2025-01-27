const db = require('../config/db'); // Conexión a la base de datos

exports.listSignatures = async (req, res) => {
    try {
        // Obtener todas las asignaturas, docentes y programas sin paginación
        const [signatures] = await db.query(`
            SELECT asignatura.*, docente.nombre AS docente_nombre, programa.nombre_programa
            FROM asignatura
            LEFT JOIN docente ON asignatura.id_docente = docente.id_docente
            LEFT JOIN programa ON asignatura.id_programa = programa.id_programa
        `);

        // Obtener la lista de docentes
        const [teachers] = await db.query('SELECT id_docente, nombre FROM docente');
        // Obtener la lista de programas
        const [programs] = await db.query('SELECT id_programa, nombre_programa FROM programa');

        const { editId } = req.query; // ID de la asignatura a editar (si corresponde)
        const { error } = req.query; // Mensaje de error (si corresponde)

        let signatureToEdit = null;
        if (editId) {
            const [rows] = await db.query('SELECT * FROM asignatura WHERE id_asignatura = ?', [editId]);
            signatureToEdit = rows.length > 0 ? rows[0] : null;
        }

        // Renderizar la vista con los datos necesarios
        res.render('dashboard', {
            user: req.user || { email: 'Invitado' },
            content: 'signatures',
            signatures,
            signatureToEdit,
            teachers,
            programs,
            error
        });
    } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
        res.status(500).send('Hubo un error al obtener las asignaturas.');
    }
};

// Agregar una nueva asignatura
exports.addSignature = async (req, res) => {
    const { nombre, codigo_materia, semestre, id_docente, id_programa } = req.body;

    if (!nombre || !codigo_materia || !semestre || !id_docente || !id_programa) {
        return res.redirect('/signatures?error=Todos los campos son requeridos');
    }

    try {
        const [rows] = await db.query('SELECT * FROM asignatura WHERE codigo_materia = ?', [codigo_materia]);
        if (rows.length > 0) {
            return res.redirect('/signatures?error=Las asignaturas tienen un código único');
        }

        await db.query('INSERT INTO asignatura (nombre, codigo_materia, semestre, id_docente, id_programa) VALUES (?, ?, ?, ?, ?)', 
                       [nombre, codigo_materia, semestre, id_docente, id_programa]);
        res.redirect('/signatures');
    } catch (error) {
        console.error('Error al agregar la asignatura:', error);
        res.status(500).send('Hubo un error al agregar la asignatura.');
    }
};

// Actualizar una asignatura
exports.updateSignature = async (req, res) => {
    const { id_asignatura, nombre, codigo_materia, semestre, id_docente, id_programa } = req.body;

    if (!id_asignatura || !nombre || !codigo_materia || !semestre || !id_docente || !id_programa) {
        return res.redirect('/signatures?error=Todos los campos son requeridos');
    }

    try {
        const [rows] = await db.query('SELECT * FROM asignatura WHERE codigo_materia = ? AND id_asignatura != ?', 
                                      [codigo_materia, id_asignatura]);
        if (rows.length > 0) {
            return res.redirect('/signatures?error=Las asignaturas tienen un código único');
        }

        await db.query('UPDATE asignatura SET nombre = ?, codigo_materia = ?, semestre = ?, id_docente = ?, id_programa = ? WHERE id_asignatura = ?', 
                       [nombre, codigo_materia, semestre, id_docente, id_programa, id_asignatura]);
        res.redirect('/signatures');
    } catch (error) {
        console.error('Error al actualizar la asignatura:', error);
        res.status(500).send('Hubo un error al actualizar la asignatura.');
    }
};


// Eliminar una asignatura
exports.deleteSignature = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM asignatura WHERE id_asignatura = ?', [id]);
        res.redirect('/signatures');
    } catch (error) {
        console.error('Error al eliminar la asignatura:', error);
        res.status(500).send('Hubo un error al eliminar la asignatura.');
    }
};
