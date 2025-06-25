const express = require('express');
const router = express.Router();
// const db = require('../config/db'); // Ruta hacia tu configuración de la base de datos
// const paginationMiddleware = require('../middlewares/paginationMiddleware');
const forbiddenController = require('../controllers/forbiddenController');
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const logoutController = require('../controllers/logoutController');
//const classController = require('../controllers/classController');
const verifyToken = require('../middlewares/authMiddleware'); // Importar el middleware de autenticación
const schedulesController = require('../controllers/schedulesController');
const programController = require('../controllers/programController');
const laboratoriesController = require('../controllers/laboratoriesController');
const teacherController = require('../controllers/teacherController');
const signatureController = require('../controllers/signatureController');
const homeController = require('../controllers/homeController');
const adminController = require('../controllers/adminController');

//rutas nuevas de controlador por separado

const listSubjectsController = require('../controllers/listSubjectsController');
const addClassController = require('../controllers/addClassController');
const editDeleteClassController = require('../controllers/editDeleteClassController');

// Rutas de Administrador

router.get('/admin', verifyToken, adminController.listUsers);
router.post('/admin/add', verifyToken, adminController.addUser);
router.post('/admin/update', verifyToken, adminController.updateUser);
router.get('/admin/delete/:id', verifyToken, adminController.deleteUser);





router.get('/home', verifyToken, homeController.renderHome);



// Rutas para listar
router.get('/classes', listSubjectsController.listClassesAndSubjects);
router.get('/classes', listSubjectsController.getLaboratories); // Si necesitas esta ruta específica

// Rutas para agregar
router.post('/classes/add', addClassController.addClass);

// Rutas para editar y borrar
router.post('/classes/update', editDeleteClassController.updateClass);
router.delete('/classes/:id', editDeleteClassController.deleteClass);

// // Listar clases
 // router.get('/classes',verifyToken, classController.getLaboratories);

// Rutas de Clases
// router.get('/classes', verifyToken, classController.listClasses);
// router.post('/classes/add', verifyToken, classController.addClass);
// router.post('/classes/update', verifyToken, classController.updateClass);
// router.get('/classes/delete/:id', verifyToken, classController.deleteClass);




// Ruta para listar programas (y cargar el formulario de edición si corresponde)
router.get('/programs', verifyToken, programController.listPrograms);


// Ruta para agregar un programa
router.post('/programs/add', verifyToken, programController.addProgram);

// Ruta para actualizar un programa
router.post('/programs/update', verifyToken, programController.updateProgram);

// Ruta para eliminar un programa
router.get('/programs/delete/:id', verifyToken, programController.deleteProgram);

// --- Rutas de Horarios --->


// Ruta para listar horarios
router.get('/schedules', verifyToken, schedulesController.listSchedules);

// Ruta para agregar un horario
router.post('/schedules/add', verifyToken, schedulesController.addSchedule);

// Ruta para actualizar un horario
router.post('/schedules/update', verifyToken, schedulesController.updateSchedule);

// Ruta para eliminar un horario
router.get('/schedules/delete/:id', verifyToken, schedulesController.deleteSchedule);



// --- Rutas de Laboratorios --->

// Ruta para listar laboratorios
router.get('/laboratories', verifyToken, laboratoriesController.listLaboratories);

// Ruta para agregar un laboratorio
router.post('/laboratories/add', verifyToken, laboratoriesController.addLaboratory);

// Ruta para actualizar un laboratorio
router.post('/laboratories/update', verifyToken, laboratoriesController.updateLaboratory);

// Ruta para eliminar un laboratorio
router.get('/laboratories/delete/:id', verifyToken, laboratoriesController.deleteLaboratory);


// ----Rutas de Asignaturas--->

// Ruta para listar asignaturas
router.get('/signatures', verifyToken, signatureController.listSignatures);

// Ruta para agregar asignaturas
router.post('/signatures/add', verifyToken, signatureController.addSignature);

// Ruta para actualizar asignaturas
router.post('/signatures/update', verifyToken, signatureController.updateSignature);

// Ruta para eliminar asignaturas
router.get('/signatures/delete/:id', verifyToken, signatureController.deleteSignature);

// Ruta de API para obtener una asignatura por ID (para el modal de edición)
router.get('/api/signatures/:id', verifyToken, signatureController.getSignatureById);



// --- Rutas de Docentes --->

// Ruta para listar docentes
router.get('/teachers', verifyToken, teacherController.listTeachers);

// Ruta para agregar un docente
router.post('/teachers/add', verifyToken, teacherController.addTeacher);

// Ruta para actualizar un docente
router.post('/teachers/update', verifyToken, teacherController.updateTeacher);

// Ruta para eliminar un docente
router.get('/teachers/delete/:id', verifyToken, teacherController.deleteTeacher);




router.get('/login', loginController.renderLogin);
router.post('/login', loginController.handleLogin);

// Rutas de Registro
router.get('/register', registerController.renderRegister);
router.post('/register', registerController.handleRegister);

// // Ruta protegida del Dashboard
// router.get('/dashboard', verifyToken, (req, res) => {
//     res.render('home', { user: req.user }); // Pasar datos del usuario a la vista
    
    
   
    
// });

// Ruta de Cierre de Sesión
router.get('/logout', logoutController.handleLogout);

// Ruta protegida para Home
router.get('/home', verifyToken, (req, res) => {
    res.render('dashboard', { 
        user: req.user, 
        content: 'home' // Solo pasa el nombre de la vista

        
        
    });
    //  console.log('Usuario autenticado:', req.user);
});

// Ruta protegida para Home
router.get('/classes', verifyToken, (req, res) => {
    res.render('dashboard', { 
        user: req.user, 
        content: 'classes' // Solo pasa el nombre de la vista

        
        
    });
    ///  console.log('Usuario autenticado:', req.user);
});





// Ruta comodín al final para manejar rutas no definidas
router.get('*', verifyToken, (req, res) => {
    res.redirect('/home'); // Redirige a la página de inicio (home)
});

// Ruta de acceso denegado
router.get('/forbidden', verifyToken, forbiddenController.renderAccessForbidden);

module.exports = router;