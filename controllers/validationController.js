const db = require('../config/db');

class ValidationController {
    async checkScheduleConflicts(dia_semana, hora_inicio, hora_fin, id_asignatura, id_clase) {
        try {
            // Obtener semestre y nombre de la asignatura seleccionada
            const [asignatura] = await db.query(`
                SELECT semestre, nombre 
                FROM asignatura 
                WHERE id_asignatura = ?`, [id_asignatura]);

            if (asignatura.length === 0) {
                throw new Error('La asignatura seleccionada no existe.');
            }

            const { semestre, nombre: grupo_actual } = asignatura[0];

            // Obtener el nombre base eliminando el sufijo del grupo (G1, G2, etc.)
            const materia_base = grupo_actual.replace(/\sG\d+$/, '');

            // Validar conflictos
            let query = `
                SELECT clase.id_clase, asignatura.nombre AS asignatura_nombre, asignatura.semestre, clase.hora_inicio, clase.hora_fin, laboratorio.nombre AS laboratorio_nombre
                FROM clase
                INNER JOIN asignatura ON clase.id_asignatura = asignatura.id_asignatura
                INNER JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
                WHERE clase.dia_semana = ?
                  AND (
                      -- Caso 1: Diferente laboratorio, mismo horario, mismo semestre, diferente grupo
                      (asignatura.semestre = ? AND asignatura.nombre LIKE ? AND ((clase.hora_inicio < ? AND clase.hora_fin > ?) OR (clase.hora_inicio < ? AND clase.hora_fin > ?)))
                      AND asignatura.nombre != ?
                  )
            `;
            let params = [
                dia_semana,
                semestre, `${materia_base}%`, hora_fin, hora_inicio, hora_inicio, hora_fin, grupo_actual
            ];

            if (id_clase) {
                query += ' AND clase.id_clase != ?';
                params.push(id_clase);
            }

            const [conflicts] = await db.query(query, params);

            return conflicts;
        } catch (error) {
            console.error('Error al validar conflictos:', error);
            throw error;
        }
    }
}

module.exports = ValidationController;