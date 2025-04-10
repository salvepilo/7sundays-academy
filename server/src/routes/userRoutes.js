const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router(); 

// Route pubbliche per l'autenticazione
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', userController.forgotPassword);
router.patch('/resetPassword/:token', userController.resetPassword);

// Protezione di tutte le routes successive
router.use(authController.protect);
 
// Routes per l'utente corrente
router.get('/me', userController.getMyProfile);
router.patch('/updateMe', 
userController.uploadUserPhoto, 
userController.resizeUserPhoto,
userController.updateMe
); 
router.patch('/updateMyPassword',userController.updatePassword);
router.patch('/updatePreferences',userController.updatePreferences);
router.delete('/deleteMe', userController.deleteMe);

// Routes solo per admin
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);
 
module.exports = router;