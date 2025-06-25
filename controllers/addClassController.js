const db = require('../config/db');

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

        // Validar conflictos (esto se delegará al controller de validación)
        const conflicts = await new (require('./validationController'))().checkScheduleConflicts(
            dia_semana, hora_inicio, hora_fin, id_asignatura, null
        );

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            req.session.error = `No se puede guardar la clase porque se solapa con la asignatura "${conflict.asignatura_nombre}" registrada en el laboratorio "${conflict.laboratorio_nombre}" de ${conflict.hora_inicio} a ${conflict.hora_fin}.`;
            return res.redirect('/classes');
        }

        // Insertar la nueva clase
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