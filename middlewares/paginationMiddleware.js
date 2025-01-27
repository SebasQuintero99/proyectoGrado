const paginationMiddleware = (query, tableName, itemsPerPage = 10000) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page) || 1; // Página actual
        const offset = (page - 1) * itemsPerPage;

        try {
            // Contar el total de registros
            const [totalResults] = await query(`SELECT COUNT(*) AS count FROM ${tableName}`);
            const totalItems = totalResults[0].count;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            // Obtener los registros para la página actual
            const [rows] = await query(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [itemsPerPage, offset]);

            // Añadir los datos de paginación al objeto req para la vista
            req.pagination = {
                data: rows,
                currentPage: page,
                totalPages,
                totalItems,
            };
            // console.log('Usuario en paginación (después):', req.user); // Log para verificar
            next();
        } catch (error) {
            console.error('Error en la paginación:', error);
            res.status(500).send('Hubo un error al realizar la paginación.');
        }
    };
};

module.exports = paginationMiddleware;
