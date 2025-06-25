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

exports.addSignature = async (req, res) => {
    const { nombre, codigo_materia, semestre, numero_curso, numero_creditos, id_docente, id_programa, grupo } = req.body;

    // Verificar que todos los campos obligatorios estén presentes
    if (!nombre || !codigo_materia || !semestre || !numero_curso || !numero_creditos || !id_docente || !id_programa || !grupo) {
        return res.render('dashboard', {
            content: 'signatures',
            error: 'Todos los campos son obligatorios.',
            signatureToEdit: null,
            teachers: [],
            programs: [],
            signatures: [],
        });
    }

    // Función para generar un color pastel
    const getRandomPastelColor = () => {
        const r = Math.floor((Math.random() * 127) + 127); // Rango entre 127 y 255
        const g = Math.floor((Math.random() * 127) + 127); // Rango entre 127 y 255
        const b = Math.floor((Math.random() * 127) + 127); // Rango entre 127 y 255
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`; // Convertir a hexadecimal
    };

    // Generar un color pastel
    const color = getRandomPastelColor();

    try {
        // Insertar la nueva asignatura
        await db.query(`
            INSERT INTO asignatura (nombre, codigo_materia, semestre, numero_curso, numero_creditos, id_docente, id_programa, color, grupo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, codigo_materia, semestre, numero_curso, numero_creditos, id_docente, id_programa, color, grupo]
        );

        res.redirect('/signatures');
    } catch (error) {
        console.error('Error al agregar la asignatura:', error);

        res.render('dashboard', {
            content: 'signatures',
            error: 'Hubo un error al agregar la asignatura.',
            signatureToEdit: null,
            teachers: [],
            programs: [],
            signatures: [],
        });
    }
};

exports.updateSignature = async (req, res) => {
    const { id_asignatura, nombre, codigo_materia, semestre, numero_curso, numero_creditos, id_docente, id_programa, grupo } = req.body;

    if (!id_asignatura || !nombre || !codigo_materia || !semestre || !numero_curso || !numero_creditos || !id_docente || !id_programa || !grupo) {
        return res.render('dashboard', {
            content: 'signatures',
            error: 'Todos los campos son obligatorios.',
            signatureToEdit: null,
            teachers: [],
            programs: [],
            signatures: [],
        });
    }

    // Generar un color pastel si no existe en la asignatura actual
    const [currentSignature] = await db.query('SELECT color FROM asignatura WHERE id_asignatura = ?', [id_asignatura]);
    let color = currentSignature[0]?.color;
    if (!color) {
        const getRandomPastelColor = () => {
            const r = Math.floor((Math.random() * 127) + 127);
            const g = Math.floor((Math.random() * 127) + 127);
            const b = Math.floor((Math.random() * 127) + 127);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        };
        color = getRandomPastelColor();
    }

    try {
        // Actualizar los datos de la asignatura
        await db.query(`
            UPDATE asignatura 
            SET nombre = ?, codigo_materia = ?, semestre = ?, numero_curso = ?, numero_creditos = ?, id_docente = ?, id_programa = ?, color = ?, grupo = ?
            WHERE id_asignatura = ?`,
            [nombre, codigo_materia, semestre, numero_curso, numero_creditos, id_docente, id_programa, color, grupo, id_asignatura]
        );

        res.redirect('/signatures');
    } catch (error) {
        console.error('Error al actualizar la asignatura:', error);

        res.render('dashboard', {
            content: 'signatures',
            error: 'Hubo un error al actualizar la asignatura.',
            signatureToEdit: null,
            teachers: [],
            programs: [],
            signatures: [],
        });
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