const db = require('../config/db'); // Conexión a la base de datos


// exports.listPrograms = async (req, res) => {
//     const itemsPerPage = 10; // Número de registros por página
//     const page = parseInt(req.query.page) || 1; // Página actual
//     const offset = (page - 1) * itemsPerPage;

//     try {
//         // Contar el total de registros en la tabla
//         const [totalResults] = await db.query('SELECT COUNT(*) AS count FROM programa');
//         const totalItems = totalResults[0].count;
//         const totalPages = Math.ceil(totalItems / itemsPerPage);

//         // Obtener los programas para la página actual con paginación
//         const [programs] = await db.query('SELECT * FROM programa LIMIT ? OFFSET ?', [itemsPerPage, offset]);
//         // console.log('Programas obtenidos:', programs);

//         const { editId } = req.query; // Capturamos el ID del programa a editar desde los parámetros de la URL

//         let programToEdit = null;
//         if (editId) {
//             const [rows] = await db.query('SELECT * FROM programa WHERE id_programa = ?', [editId]);
//             programToEdit = rows.length > 0 ? rows[0] : null;
//             // console.log('Programa para editar:', programToEdit);
//         }

//         // Renderizamos la vista con los datos necesarios
//         res.render('dashboard', {
//             user: req.user,
//             content: 'programs',
//             programs,
//             programToEdit, // Pasamos el programa a editar (si corresponde)
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalItems,
//             },
//         });
//     } catch (error) {
//         console.error('Error al obtener los programas:', error);
//         res.status(500).send('Hubo un error al obtener los programas.');
//     }
// };

exports.listPrograms = async (req, res) => {
    try {
        const { data: programs, currentPage, totalPages, totalItems } = req.pagination;

        // Renderizamos la vista con los datos necesarios
        res.render('dashboard', {
            user: req.user,
            content: 'programs',
            programs,
            programToEdit: null, // Si no hay edición
            pagination: {
                currentPage,
                totalPages,
                totalItems,
            },
        });
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
        res.redirect('/programs');
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
        res.redirect('/programs');
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
