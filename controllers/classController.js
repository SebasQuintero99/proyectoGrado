const db = require('../config/db'); // Ruta hacia tu configuración de la base de datos

exports.getLaboratories = async (req, res) => {
    try {
        const [laboratories] = await db.query('SELECT id_laboratorio, nombre FROM laboratorio');

        res.render('dashboard', {
            content: 'classes',
            laboratories: laboratories || [], 
            error: null,
            user: req.user || { email: 'Invitado' },
        });
    } catch (error) {
        console.error('Error al obtener laboratorios:', error);

        res.render('dashboard', {
            content: 'classes',
            laboratories: [],
            error: 'No se pudieron cargar los laboratorios. Intente más tarde.',
            user: req.user || { email: 'Invitado' },
        });
    }
};

exports.listClasses = async (req, res) => {
    try {
        const error = req.session.error; // Obtener mensaje de error desde la sesión
        delete req.session.error; // Limpiar el mensaje después de usarlo

        const { selectedLaboratory } = req.query; // Obtener el ID del laboratorio seleccionado

        // Consultar laboratorios
        const [laboratories] = await db.query('SELECT id_laboratorio, nombre FROM laboratorio');

        let classes = [];
        if (selectedLaboratory) {
            // Consultar clases filtradas por el laboratorio seleccionado
            [classes] = await db.query(`
                SELECT clase.id_clase, clase.dia_semana, clase.hora_inicio, clase.hora_fin,
                       asignatura.nombre AS asignatura_nombre, asignatura.numero_curso, 
                       asignatura.color AS asignatura_color, 
                       laboratorio.nombre AS laboratorio_nombre, 
                       docente.nombre AS docente_nombre
                FROM clase
                JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
                JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
                LEFT JOIN docente ON asignatura.id_docente = docente.id_docente
                WHERE clase.id_laboratorio = ?
            `, [selectedLaboratory]);
        }

        // Obtener las asignaturas disponibles (sin asignar)
        const [subjects] = await db.query(`
            SELECT asignatura.id_asignatura, asignatura.nombre, asignatura.numero_curso, 
                   docente.nombre AS docente_nombre
            FROM asignatura
            LEFT JOIN clase ON asignatura.id_asignatura = clase.id_asignatura
            LEFT JOIN docente ON asignatura.id_docente = docente.id_docente
            WHERE clase.id_asignatura IS NULL
        `);

        const { editId } = req.query;
        let classToEdit = null;

        if (editId) {
            const [rows] = await db.query('SELECT * FROM clase WHERE id_clase = ?', [editId]);
            classToEdit = rows.length > 0 ? rows[0] : null;

            if (classToEdit) {
                const [currentSubject] = await db.query(`
                    SELECT asignatura.id_asignatura, asignatura.nombre, asignatura.numero_curso, 
                           docente.nombre AS docente_nombre
                    FROM asignatura
                    LEFT JOIN docente ON asignatura.id_docente = docente.id_docente
                    WHERE asignatura.id_asignatura = ?
                `, [classToEdit.id_asignatura]);

                if (currentSubject.length > 0) {
                    subjects.push(currentSubject[0]);
                }
            }
        }

        res.render('dashboard', {
            content: 'classes',
            classes: classes || [],
            subjects,
            laboratories,
            selectedLaboratory, // Pasar el laboratorio seleccionado
            classToEdit,
            error,
            user: req.user || { email: 'Invitado' },
        });
    } catch (error) {
        console.error('Error al listar clases:', error);

        res.render('dashboard', {
            content: 'classes',
            classes: [],
            subjects: [],
            laboratories: [],
            selectedLaboratory: null,
            classToEdit: null,
            error: 'No se pudieron cargar las clases.',
            user: req.user || { email: 'Invitado' },
        });
    }
};

exports.addClass = async (req, res) => {
    const { id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin } = req.body;

    if (!id_asignatura || !id_laboratorio || !dia_semana || !hora_inicio || !hora_fin) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect('/classes');
    }

    try {
        // Obtener semestre y nombre de la asignatura seleccionada
        const [asignatura] = await db.query(`
            SELECT semestre, nombre 
            FROM asignatura 
            WHERE id_asignatura = ?`, [id_asignatura]);

        if (asignatura.length === 0) {
            req.session.error = 'La asignatura seleccionada no existe.';
            return res.redirect('/classes');
        }

        const { semestre, nombre: grupo_actual } = asignatura[0];

        // Obtener el nombre base eliminando el sufijo del grupo (G1, G2, etc.)
        const materia_base = grupo_actual.replace(/\sG\d+$/, '');

        // Validar conflictos
        const [conflicts] = await db.query(`
            SELECT clase.id_clase, asignatura.nombre AS asignatura_nombre, asignatura.semestre, clase.hora_inicio, clase.hora_fin, laboratorio.nombre AS laboratorio_nombre
            FROM clase
            JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
            JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
            WHERE clase.dia_semana = ?
              AND (
                  -- Caso 1: Mismo semestre, diferente laboratorio, mismo nombre base
                  (asignatura.semestre = ? AND asignatura.nombre LIKE ? AND clase.id_laboratorio = ? AND ((clase.hora_inicio < ? AND clase.hora_fin > ?) OR (clase.hora_inicio < ? AND clase.hora_fin > ?)))
                  OR
                  -- Caso 2: Diferente nombre base, mismo semestre
                  (asignatura.semestre = ? AND asignatura.nombre NOT LIKE ? AND ((clase.hora_inicio < ? AND clase.hora_fin > ?) OR (clase.hora_inicio < ? AND clase.hora_fin > ?)))
              )
        `, [
            dia_semana,
            semestre, `${materia_base}%`, id_laboratorio, hora_fin, hora_inicio, hora_inicio, hora_fin, // Caso 1
            semestre, `${materia_base}%`, hora_fin, hora_inicio, hora_inicio, hora_fin // Caso 2
        ]);

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            req.session.error = `No se puede guardar la clase porque se solapa con la asignatura "${conflict.asignatura_nombre}" registrada en el laboratorio "${conflict.laboratorio_nombre}" de ${conflict.hora_inicio} a ${conflict.hora_fin}.`;
            return res.redirect('/classes');
        }

        // Insertar la nueva clase si no hay conflictos
        await db.query(`
            INSERT INTO clase (id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin)
            VALUES (?, ?, ?, ?, ?)
        `, [id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin]);

        res.redirect('/classes');
    } catch (error) {
        console.error('Error al agregar la clase:', error);
        req.session.error = 'Hubo un error al agregar la clase.';
        res.redirect('/classes');
    }
};



exports.updateClass = async (req, res) => {
    const { id_clase, id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin } = req.body;

    if (!id_clase || !id_asignatura || !id_laboratorio || !dia_semana || !hora_inicio || !hora_fin) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect('/classes');
    }

    try {
        // Obtener semestre y nombre de la asignatura seleccionada
        const [asignatura] = await db.query(`
            SELECT semestre, nombre 
            FROM asignatura 
            WHERE id_asignatura = ?`, [id_asignatura]);

        if (asignatura.length === 0) {
            req.session.error = 'La asignatura seleccionada no existe.';
            return res.redirect('/classes');
        }

        const { semestre, nombre: grupo_actual } = asignatura[0];

        // Obtener el nombre base eliminando el sufijo del grupo (G1, G2, etc.)
        const materia_base = grupo_actual.replace(/\sG\d+$/, '');

        // Validar conflictos
        const [conflicts] = await db.query(`
            SELECT clase.id_clase, asignatura.nombre AS asignatura_nombre, asignatura.semestre, clase.hora_inicio, clase.hora_fin, laboratorio.nombre AS laboratorio_nombre
            FROM clase
            JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
            JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
            WHERE clase.dia_semana = ?
              AND clase.id_clase != ?
              AND (
                  -- Caso 1: Mismo semestre, diferente laboratorio, mismo nombre base
                  (asignatura.semestre = ? AND asignatura.nombre LIKE ? AND clase.id_laboratorio = ? AND ((clase.hora_inicio < ? AND clase.hora_fin > ?) OR (clase.hora_inicio < ? AND clase.hora_fin > ?)))
                  OR
                  -- Caso 2: Diferente nombre base, mismo semestre
                  (asignatura.semestre = ? AND asignatura.nombre NOT LIKE ? AND ((clase.hora_inicio < ? AND clase.hora_fin > ?) OR (clase.hora_inicio < ? AND clase.hora_fin > ?)))
              )
        `, [
            dia_semana,
            id_clase,
            semestre, `${materia_base}%`, id_laboratorio, hora_fin, hora_inicio, hora_inicio, hora_fin, // Caso 1
            semestre, `${materia_base}%`, hora_fin, hora_inicio, hora_inicio, hora_fin // Caso 2
        ]);

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            req.session.error = `No se puede actualizar la clase porque se solapa con la asignatura "${conflict.asignatura_nombre}" registrada en el laboratorio "${conflict.laboratorio_nombre}" de ${conflict.hora_inicio} a ${conflict.hora_fin}.`;
            return res.redirect('/classes');
        }

        // Actualizar la clase si no hay conflictos
        await db.query(`
            UPDATE clase 
            SET id_asignatura = ?, id_laboratorio = ?, dia_semana = ?, hora_inicio = ?, hora_fin = ?
            WHERE id_clase = ?
        `, [id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin, id_clase]);

        res.redirect('/classes');
    } catch (error) {
        console.error('Error al actualizar la clase:', error);
        req.session.error = 'Hubo un error al actualizar la clase.';
        res.redirect('/classes');
    }
};


exports.deleteClass = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM clase WHERE id_clase = ?', [id]);
        res.redirect('/classes');
    } catch (error) {
        console.error('Error al eliminar la clase:', error);
        res.status(500).send('Hubo un error al eliminar la clase.');
    }
};
