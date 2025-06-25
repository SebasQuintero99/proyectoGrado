const db = require('../config/db');

// Obtener laboratorios
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

// Listar clases y asignaturas
exports.listClassesAndSubjects = async (req, res) => {
    try {
        const error = req.session.error;
        delete req.session.error;

        const { selectedLaboratory, selectedSemester } = req.query;

        // Consultar laboratorios y semestres
        const [laboratories] = await db.query('SELECT id_laboratorio, nombre FROM laboratorio');
        const [semesters] = await db.query('SELECT DISTINCT semestre FROM asignatura ORDER BY semestre');

        // Consultar clases filtradas por laboratorio
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

        // Obtener asignaturas filtradas por semestre
        let subjectsQuery = `SELECT id_asignatura, nombre, semestre FROM asignatura WHERE 1=1`;
        let subjectsParams = [];

        if (selectedSemester) {
            subjectsQuery += ' AND semestre = ?';
            subjectsParams.push(selectedSemester);
        }

        const [subjects] = await db.query(subjectsQuery, subjectsParams);

        // Cargar clase a editar si existe
        const { editId } = req.query;
        let classToEdit = null;

        if (editId) {
            const [rows] = await db.query('SELECT * FROM clase WHERE id_clase = ?', [editId]);
            classToEdit = rows.length > 0 ? rows[0] : null;

            if (classToEdit) {
                const [currentSubject] = await db.query(
                    'SELECT id_asignatura, nombre, semestre FROM asignatura WHERE id_asignatura = ?',
                    [classToEdit.id_asignatura]
                );

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
        console.error('Error al listar clases y asignaturas:', error);
        res.render('dashboard', {
            content: 'classes',
            classes: [],
            laboratories: [],
            selectedLaboratory: null,
            selectedSemester: null,
            semesters: [],
            subjects: [],
            classToEdit: null,
            error: 'No se pudieron cargar las clases o asignaturas.',
            user: req.user || { email: 'Invitado' },
        });
    }
};

// Obtener asignaturas por semestre (para AJAX)
exports.getSubjectsBySemester = async (req, res) => {
    try {
        const { semester } = req.query;

        if (!semester) {
            return res.status(400).json({ error: 'El semestre es requerido' });
        }

        const [subjects] = await db.query(
            'SELECT id_asignatura, nombre FROM asignatura WHERE semestre = ?',
            [semester]
        );

        res.json({ subjects });
    } catch (error) {
        console.error('Error al obtener asignaturas por semestre:', error);
        res.status(500).json({ error: 'Hubo un error al obtener las asignaturas.' });
    }
};
