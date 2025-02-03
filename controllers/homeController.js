const db = require('../config/db');


exports.renderHome = async (req, res) => {
    try {
        // Consulta para obtener estadísticas
        const [classCounts] = await db.query(`SELECT COUNT(*) AS total_clases FROM clase`);
        const [teacherCounts] = await db.query(`SELECT COUNT(*) AS total_docentes FROM docente`);
        const [subjectCounts] = await db.query(`SELECT COUNT(*) AS total_asignaturas FROM asignatura`);
        const [labCounts] = await db.query(`SELECT COUNT(*) AS total_laboratorios FROM laboratorio`);

        // Consulta para clases por día y laboratorio
        const [classesByDay] = await db.query(`
            SELECT clase.dia_semana AS dia, laboratorio.nombre AS laboratorio, COUNT(*) AS total_clases
            FROM clase
            JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
            GROUP BY clase.dia_semana, laboratorio.nombre
            ORDER BY FIELD(clase.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
        `);

        // Consulta para asignaturas por semestre
        const [subjectsBySemester] = await db.query(`
            SELECT asignatura.semestre, COUNT(*) AS total_asignaturas
            FROM asignatura
            GROUP BY asignatura.semestre
            ORDER BY asignatura.semestre
        `);

        // Preparar datos para gráficos
        const clasesPorLaboratorio = classesByDay.reduce((acc, curr) => {
            const { dia, laboratorio, total_clases } = curr;
            acc[dia] = acc[dia] || [];
            acc[dia].push({ laboratorio, total_clases });
            return acc;
        }, {});

        const asignaturasPorSemestre = subjectsBySemester.map(row => ({
            semestre: `Semestre ${row.semestre}`,
            total: row.total_asignaturas
        }));

        res.render('dashboard', {
            content: 'home',
            clasesPorLaboratorio,
            asignaturasPorSemestre,
            user: req.user || { email: 'Invitado' },
            stats: {
                totalClases: classCounts[0]?.total_clases || 0,
                totalDocentes: teacherCounts[0]?.total_docentes || 0,
                totalAsignaturas: subjectCounts[0]?.total_asignaturas || 0,
                totalLaboratorios: labCounts[0]?.total_laboratorios || 0,
            },
            clasesPorLaboratorio: JSON.stringify(clasesPorLaboratorio),
            asignaturasPorSemestre: JSON.stringify(asignaturasPorSemestre)
        });
    } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
        res.render('dashboard', {
            content: 'home',
            user: req.user || { email: 'Invitado' },
            stats: null,
            clasesPorLaboratorio: '{}',
            asignaturasPorSemestre: '[]',
            error: 'No se pudieron cargar las estadísticas.'
        });
    }
};

exports.getHomeData = async (req, res) => {
    try {
        const [clasesPorLaboratorio] = await db.query(`
            SELECT dia_semana, laboratorio.nombre AS laboratorio, COUNT(*) AS total_clases
            FROM clase
            JOIN laboratorio ON clase.id_laboratorio = laboratorio.id_laboratorio
            GROUP BY dia_semana, laboratorio.nombre
            ORDER BY FIELD(dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
        `);

        const [clasesPorDia] = await db.query(`
            SELECT dia_semana, COUNT(*) AS total_clases
            FROM clase
            GROUP BY dia_semana
            ORDER BY FIELD(dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
        `);

        const [stats] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM laboratorio) AS totalLaboratorios,
                (SELECT COUNT(*) FROM docente) AS totalDocentes,
                (SELECT COUNT(*) FROM asignatura) AS totalAsignaturas,
                (SELECT COUNT(*) FROM clase) AS totalClases
        `);

        res.render('dashboard', {
            content: 'home',
            clasesPorLaboratorio,
            clasesPorDia,
            stats: stats[0],
            user: req.user || { email: 'Invitado' }
        });
    } catch (error) {
        console.error('Error al cargar los datos del home:', error);
        res.render('dashboard', {
            content: 'home',
            clasesPorLaboratorio: [],
            clasesPorDia: [],
            stats: {},
            user: req.user || { email: 'Invitado' }
        });
    }
};
