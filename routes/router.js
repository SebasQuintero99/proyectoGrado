const express = require('express');
const router = express.Router();
const forbiddenController = require('../controllers/forbiddenController');
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const logoutController = require('../controllers/logoutController');
const classController = require('../controllers/classController');
const verifyToken = require('../middlewares/authMiddleware');
const schedulesController = require('../controllers/schedulesController');
const programController = require('../controllers/programController');
const laboratoriesController = require('../controllers/laboratoriesController');
const teacherController = require('../controllers/teacherController');
const signatureController = require('../controllers/signatureController');
const homeController = require('../controllers/homeController');
const adminController = require('../controllers/adminController');

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/admin', verifyToken, adminController.listUsers);
router.post('/admin/add', verifyToken, adminController.addUser);
router.post('/admin/update', verifyToken, adminController.updateUser);
router.delete('/admin/delete/:id', verifyToken, adminController.deleteUser);
router.get('/api/admin/users/:id', verifyToken, adminController.getUserById);

router.get('/home', verifyToken, homeController.renderHome);

router.get('/classes', verifyToken, classController.listClassesAndSubjects);
router.post('/classes/add', verifyToken, classController.addClass);
router.post('/classes/update', verifyToken, classController.updateClass);
router.delete('/classes/delete/:id', verifyToken, classController.deleteClass);

router.get('/programs', verifyToken, programController.listPrograms);
router.post('/programs/add', verifyToken, programController.addProgram);
router.post('/programs/update', verifyToken, programController.updateProgram);
router.delete('/programs/delete/:id', verifyToken, programController.deleteProgram);
router.get('/api/programs/:id', verifyToken, programController.getProgramById);

router.get('/schedules', verifyToken, schedulesController.listSchedules);
router.post('/schedules/add', verifyToken, schedulesController.addSchedule);
router.post('/schedules/update', verifyToken, schedulesController.updateSchedule);
router.get('/schedules/delete/:id', verifyToken, schedulesController.deleteSchedule);

router.get('/laboratories', verifyToken, laboratoriesController.listLaboratories);
router.post('/laboratories/add', verifyToken, laboratoriesController.addLaboratory);
router.post('/laboratories/update', verifyToken, laboratoriesController.updateLaboratory);
router.delete('/laboratories/delete/:id', verifyToken, laboratoriesController.deleteLaboratory);
router.get('/api/laboratories/:id', verifyToken, laboratoriesController.getLaboratoryById);

router.get('/signatures', verifyToken, signatureController.listSignatures);
router.post('/signatures/add', verifyToken, signatureController.addSignature);
router.post('/signatures/update', verifyToken, signatureController.updateSignature);
router.delete('/signatures/delete/:id', verifyToken, signatureController.deleteSignature);
router.get('/api/signatures/:id', verifyToken, signatureController.getSignatureById);

router.get('/teachers', verifyToken, teacherController.listTeachers);
router.post('/teachers/add', verifyToken, teacherController.addTeacher);
router.post('/teachers/update', verifyToken, teacherController.updateTeacher);
router.delete('/teachers/delete/:id', verifyToken, teacherController.deleteTeacher);
router.get('/api/teachers/:id', verifyToken, teacherController.getTeacherById);

router.get('/login', loginController.renderLogin);
router.post('/login', loginController.handleLogin);

router.get('/register', registerController.renderRegister);
router.post('/register', registerController.handleRegister);

router.get('/logout', logoutController.handleLogout);

router.get('/forbidden', verifyToken, forbiddenController.renderAccessForbidden);

router.get('*', verifyToken, (req, res) => {
    res.redirect('/home');
});

module.exports = router;