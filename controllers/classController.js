const db = require('../config/db');

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

exports.listClassesAndSubjects = async (req, res) => {
    try {
        const error = req.session.error;
        delete req.session.error;

        const { selectedLaboratory, selectedSemester } = req.query;

        const [laboratories] = await db.query('SELECT id_laboratorio, nombre FROM laboratorio');
        const [semesters] = await db.query('SELECT DISTINCT semestre FROM asignatura ORDER BY semestre');

        let classes = [];
        if (selectedLaboratory) {
            [classes] = await db.query(`
                SELECT clase.id_clase, clase.dia_semana, clase.hora_inicio, clase.hora_fin,
                       asignatura.nombre AS asignatura_nombre, asignatura.numero_curso, 
                       asignatura.color AS asignatura_color, asignatura.grupo, asignatura.semestre,
                       laboratorio.nombre AS laboratorio_nombre, 
                       docente.nombre AS docente_nombre
                FROM clase
                INNER JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
                INNER JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
                LEFT JOIN docente ON asignatura.id_docente = docente.id_docente
                WHERE clase.id_laboratorio = ?
            `, [selectedLaboratory]);
        }

        let subjectsQuery = `
            SELECT asignatura.id_asignatura, asignatura.nombre, asignatura.semestre
            FROM asignatura
            LEFT JOIN clase ON asignatura.id_asignatura = clase.id_asignatura
            WHERE clase.id_asignatura IS NULL
        `;
        let subjectsParams = [];
        if (selectedSemester) {
            subjectsQuery += ' AND asignatura.semestre = ?';
            subjectsParams.push(selectedSemester);
        }

        const [subjects] = await db.query(subjectsQuery, subjectsParams);

        const { editId } = req.query;
        let classToEdit = null;
        if (editId) {
            const [rows] = await db.query('SELECT * FROM clase WHERE id_clase = ?', [editId]);
            classToEdit = rows.length > 0 ? rows[0] : null;

            if (classToEdit) {
                const [currentSubject] = await db.query(`
                    SELECT asignatura.id_asignatura, asignatura.nombre, asignatura.semestre
                    FROM asignatura
                    WHERE asignatura.id_asignatura = ?
                `, [classToEdit.id_asignatura]);

                if (currentSubject.length > 0) {
                    if (!selectedSemester || currentSubject[0].semestre == selectedSemester) {
                        subjects.push(currentSubject[0]);
                    }
                }
            }
        }

        res.render('dashboard', {
            content: 'classes',
            classes,
            laboratories,
            selectedLaboratory: selectedLaboratory || '',
            selectedSemester: selectedSemester || '',
            semesters: semesters.map(s => s.semestre),
            subjects,
            classToEdit,
            error,
            user: req.user || { email: 'Invitado' },
        });
    } catch (error) {
        console.error('Error al listar clases:', error);
        res.render('dashboard', {
            content: 'classes',
            classes: [],
            laboratories: [],
            selectedLaboratory: null,
            selectedSemester: null,
            semesters: [],
            subjects: [],
            classToEdit: null,
            error: 'No se pudieron cargar las clases.',
            user: req.user || { email: 'Invitado' },
        });
    }
};

exports.addClass = async (req, res) => {
    const { id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin } = req.body;

    //console.log('Datos recibidos:', { id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin });

    if (!id_asignatura || !id_laboratorio || !dia_semana || !hora_inicio || !hora_fin) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect('/classes');
    }

    if (hora_inicio >= hora_fin) {
        req.session.error = 'La hora de inicio debe ser anterior a la hora de fin.';
        return res.redirect('/classes');
    }

    try {
        const [asignatura] = await db.query(`
            SELECT id_asignatura, nombre, id_docente 
            FROM asignatura 
            WHERE id_asignatura = ?`, [id_asignatura]);

        if (asignatura.length === 0) {
            req.session.error = 'La asignatura seleccionada no existe.';
            return res.redirect('/classes');
        }

        const [laboratorio] = await db.query(`
            SELECT id_laboratorio 
            FROM laboratorio 
            WHERE id_laboratorio = ?`, [id_laboratorio]);

        if (laboratorio.length === 0) {
            req.session.error = 'El laboratorio seleccionado no existe.';
            return res.redirect('/classes');
        }

        const [conflicts] = await db.query(`
            SELECT clase.id_clase, asignatura.nombre AS asignatura_nombre, 
                   clase.hora_inicio, clase.hora_fin, laboratorio.nombre AS laboratorio_nombre
            FROM clase
            INNER JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
            INNER JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
            WHERE clase.dia_semana = ?
              AND clase.id_laboratorio = ?
              AND (
                  (clase.hora_inicio <= ? AND clase.hora_fin > ?) OR 
                  (clase.hora_inicio < ? AND clase.hora_fin >= ?)
              )
        `, [dia_semana, id_laboratorio, hora_fin, hora_inicio, hora_fin, hora_inicio]);

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            req.session.error = `No se puede guardar la clase porque se solapa con la asignatura "${conflict.asignatura_nombre}" en el laboratorio "${conflict.laboratorio_nombre}" de ${conflict.hora_inicio} a ${conflict.hora_fin}.`;
            return res.redirect('/classes');
        }

        // Validar conflicto de docente
        const docenteId = asignatura[0].id_docente;
        if (docenteId) {
            const [teacherConflicts] = await db.query(`
                SELECT clase.id_clase, asignatura.nombre AS asignatura_nombre,
                       clase.hora_inicio, clase.hora_fin
                FROM clase
                INNER JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
                WHERE asignatura.id_docente = ?
                  AND clase.dia_semana = ?
                  AND (
                      (clase.hora_inicio <= ? AND clase.hora_fin > ?) OR 
                      (clase.hora_inicio < ? AND clase.hora_fin >= ?)
                  )
            `, [docenteId, dia_semana, hora_fin, hora_inicio, hora_fin, hora_inicio]);
            if (teacherConflicts.length > 0) {
                const tc = teacherConflicts[0];
                req.session.error = `El docente asignado ya dicta la asignatura "${tc.asignatura_nombre}" en el mismo horario de ${tc.hora_inicio} a ${tc.hora_fin}.`;
                return res.redirect('/classes');
            }
        }

        await db.query(`
            INSERT INTO clase (id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin)
            VALUES (?, ?, ?, ?, ?)
        `, [id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin]);

        req.session.success = 'Clase agregada exitosamente.';
        res.redirect('/classes');
    } catch (error) {
        console.error('Error al agregar la clase:', error);
        req.session.error = 'Hubo un error al agregar la clase. Detalles: ' + error.message;
        res.redirect('/classes');
    }
};

exports.updateClass = async (req, res) => {
    const { id_clase, id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin } = req.body;

    if (!id_clase || !id_asignatura || !id_laboratorio || !dia_semana || !hora_inicio || !hora_fin) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect('/classes');
    }

    if (hora_inicio >= hora_fin) {
        req.session.error = 'La hora de inicio debe ser anterior a la hora de fin.';
        return res.redirect('/classes');
    }

    try {
        const [asignatura] = await db.query(`
            SELECT id_asignatura, nombre, id_docente 
            FROM asignatura 
            WHERE id_asignatura = ?`, [id_asignatura]);

        if (asignatura.length === 0) {
            req.session.error = 'La asignatura seleccionada no existe.';
            return res.redirect('/classes');
        }

        const [laboratorio] = await db.query(`
            SELECT id_laboratorio 
            FROM laboratorio 
            WHERE id_laboratorio = ?`, [id_laboratorio]);

        if (laboratorio.length === 0) {
            req.session.error = 'El laboratorio seleccionado no existe.';
            return res.redirect('/classes');
        }

        const [conflicts] = await db.query(`
            SELECT clase.id_clase, asignatura.nombre AS asignatura_nombre, 
                   clase.hora_inicio, clase.hora_fin, laboratorio.nombre AS laboratorio_nombre
            FROM clase
            INNER JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
            INNER JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
            WHERE clase.dia_semana = ?
              AND clase.id_laboratorio = ?
              AND clase.id_clase != ?
              AND (
                  (clase.hora_inicio <= ? AND clase.hora_fin > ?) OR 
                  (clase.hora_inicio < ? AND clase.hora_fin >= ?)
              )
        `, [dia_semana, id_laboratorio, id_clase, hora_fin, hora_inicio, hora_fin, hora_inicio]);

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            req.session.error = `No se puede actualizar la clase porque se solapa con la asignatura "${conflict.asignatura_nombre}" en el laboratorio "${conflict.laboratorio_nombre}" de ${conflict.hora_inicio} a ${conflict.hora_fin}.`;
            return res.redirect('/classes');
        }

        // Validar conflicto de docente
        const docenteId2 = asignatura[0].id_docente;
        if (docenteId2) {
            const [teacherConflicts2] = await db.query(`
                SELECT clase.id_clase, asignatura.nombre AS asignatura_nombre,
                       clase.hora_inicio, clase.hora_fin
                FROM clase
                INNER JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
                WHERE asignatura.id_docente = ?
                  AND clase.dia_semana = ?
                  AND clase.id_clase != ?
                  AND (
                      (clase.hora_inicio <= ? AND clase.hora_fin > ?) OR 
                      (clase.hora_inicio < ? AND clase.hora_fin >= ?)
                  )
            `, [docenteId2, dia_semana, id_clase, hora_fin, hora_inicio, hora_fin, hora_inicio]);
            if (teacherConflicts2.length > 0) {
                const tc = teacherConflicts2[0];
                req.session.error = `El docente asignado ya dicta la asignatura "${tc.asignatura_nombre}" en el mismo horario de ${tc.hora_inicio} a ${tc.hora_fin}.`;
                return res.redirect('/classes');
            }
        }

        await db.query(`
            UPDATE clase 
            SET id_asignatura = ?, id_laboratorio = ?, dia_semana = ?, hora_inicio = ?, hora_fin = ?
            WHERE id_clase = ?
        `, [id_asignatura, id_laboratorio, dia_semana, hora_inicio, hora_fin, id_clase]);

        req.session.success = 'Clase actualizada exitosamente.';
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
        // Éxito: Devolver JSON para que el fetch lo procese
        res.json({ success: true, message: 'Clase eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la clase:', error);
        // Error: Devolver un JSON con el error
        res.status(500).json({ success: false, message: 'Hubo un error al eliminar la clase.' });
    }
};