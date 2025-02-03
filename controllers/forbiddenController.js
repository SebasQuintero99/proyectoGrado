exports.renderAccessForbidden = (req, res) => {
    res.render('dashboard', {
        user: req.user,
        content: 'accessForbidden' // Renderizará la vista dentro del dashboard
    });
};