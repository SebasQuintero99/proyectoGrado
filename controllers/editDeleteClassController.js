const db = require('../config/db');

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

        // Validar conflictos (esto se delegará al controller de validación)
        const conflicts = await new (require('./validationController'))().checkScheduleConflicts(
            dia_semana, hora_inicio, hora_fin, id_asignatura, id_clase
        );

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            req.session.error = `No se puede actualizar la clase porque se solapa con la asignatura "${conflict.asignatura_nombre}" registrada en el laboratorio "${conflict.laboratorio_nombre}" de ${conflict.hora_inicio} a ${conflict.hora_fin}.`;
            return res.redirect('/classes');
        }

        // Actualizar la clase
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