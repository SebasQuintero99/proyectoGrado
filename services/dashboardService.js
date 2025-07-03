const db = require('../config/db');

class DashboardService {
    static async getDashboardStats() {
        try {
            const [
                [stats],
                [clasesPorDia],
                [clasesPorLaboratorio]
            ] = await Promise.all([
                db.query(`
                    SELECT 
                        (SELECT COUNT(*) FROM laboratorio) AS totalLaboratorios,
                        (SELECT COUNT(*) FROM docente) AS totalDocentes,
                        (SELECT COUNT(*) FROM asignatura) AS totalAsignaturas,
                        (SELECT COUNT(*) FROM clase) AS totalClases
                `),
                db.query(`
                    SELECT dia_semana, COUNT(*) AS total_clases
                    FROM clase
                    GROUP BY dia_semana
                    ORDER BY FIELD(dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
                `),
                db.query(`
                    SELECT dia_semana, laboratorio.nombre AS laboratorio, COUNT(*) AS total_clases
                    FROM clase
                    JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
                    GROUP BY dia_semana, laboratorio.nombre
                    ORDER BY FIELD(dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
                `)
            ]);

            return {
                stats: stats[0],
                clasesPorDia,
                clasesPorLaboratorio
            };
        } catch (error) {
            console.error('Error en DashboardService.getDashboardStats:', error);
            throw error;
        }
    }

    static async getProfesoresConClases() {
        try {
            // Primero, veamos la estructura de la tabla asignatura para confirmar los nombres de las columnas
            const [asignaturaColumns] = await db.query(`SHOW COLUMNS FROM asignatura`);
            
            // Consulta modificada para ser más robusta
            const [results] = await db.query(`
                SELECT 
                    COALESCE(d.nombre, 'Sin nombre') AS nombre,
                    COUNT(DISTINCT c.id_clase) AS total_clases
                FROM 
                    clase c
                JOIN 
                    asignatura a ON c.asignatura_idasignatura = a.id_asignatura
                LEFT JOIN 
                    docente d ON a.id_docente = d.id_docente
                WHERE 
                    c.id_clase IS NOT NULL
                GROUP BY 
                    d.id_docente, d.nombre
                HAVING 
                    COUNT(DISTINCT c.id_clase) > 0
                ORDER BY 
                    total_clases DESC
                LIMIT 10
            `);
            
            return results || [];
            
        } catch (error) {
            // En caso de error, devolvemos un array vacío
            return [];
        }
    }
}

module.exports = DashboardService;
