
const db = require('../config/db'); // Conexión a la base de datos

// Listar programas con filtro (si aplica)
exports.listPrograms = async (req, res) => {
    const { filter } = req.query; // Tomamos el filtro de la query

    try {
        let query = `SELECT * FROM programa`; // Consulta base sin limitación ni paginación
        let queryParams = [];

        // Si existe un filtro, aplicamos el LIKE
        if (filter) {
            query = `SELECT * FROM programa WHERE nombre_programa LIKE ?`;
            queryParams = [`%${filter}%`];
        }

        // Obtener los programas (sin límite ni offset)
        const [programs] = await db.query(query, queryParams);
        

        // Si es una solicitud AJAX (para filtrar), devolver solo los datos
        if (req.xhr) {
            return res.json(programs); // Retornar los programas filtrados
        }

        // Obtener el programa a editar si es necesario
        const { editId } = req.query;
        let programToEdit = null;
        if (editId) {
            const [rows] = await db.query('SELECT * FROM programa WHERE id_programa = ?', [editId]);
            programToEdit = rows.length > 0 ? rows[0] : null;
        }

        // Renderizamos la vista con los datos
        res.render('dashboard', {
            user: req.user,
            content: 'programs',
            programs,  // Pasamos todos los programas
            programToEdit, // Pasamos el programa a editar
            
        });
        // console.log('Usuario autenticado:', req.user);
        
    } catch (error) {
        console.error('Error al listar programas:', error);
        res.status(500).send('Hubo un error al listar los programas.');
    }
};

// Agregar un nuevo programa
exports.addProgram = async (req, res) => {
    const { nombre_programa } = req.body;

    if (!nombre_programa) {
        return res.status(400).send('El nombre del programa es requerido.');
    }

    try {
        await db.query('INSERT INTO programa (nombre_programa) VALUES (?)', [nombre_programa]);
        setTimeout(() => {
            res.redirect('/programs');
        }, 500);
    } catch (error) {
        console.error('Error al agregar el programa:', error);
        res.status(500).send('Hubo un error al agregar el programa.');
    }
};

// Actualizar un programa
exports.updateProgram = async (req, res) => {
    const { id_programa, nombre_programa } = req.body;

    if (!id_programa || !nombre_programa) {
        return res.status(400).send('Todos los campos son requeridos.');
    }

    try {
        await db.query('UPDATE programa SET nombre_programa = ? WHERE id_programa = ?', [nombre_programa, id_programa]);
        setTimeout(() => {
            res.redirect('/programs');
        }, 500);
    } catch (error) {
        console.error('Error al actualizar el programa:', error);
        res.status(500).send('Hubo un error al actualizar el programa.');
    }
};

// Eliminar un programa
exports.deleteProgram = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM programa WHERE id_programa = ?', [id]);
        res.redirect('/programs');
    } catch (error) {
        console.error('Error al eliminar el programa:', error);
        res.status(500).send('Hubo un error al eliminar el programa.');
    }
};

