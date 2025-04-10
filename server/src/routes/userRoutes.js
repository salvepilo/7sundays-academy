import express from 'express';
import { getMyProfile, updateMe, deleteMe, getAllUsers, createUser, getUser, updateUser } from '../controllers/userController.js';
import { signup, login, updatePassword, forgotPassword, resetPassword, protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Route pubbliche per l'autenticazione
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protezione di tutte le routes successive
router.use(protect);

// Routes per l'utente corrente
router.get('/me', getMyProfile);
router.patch('/updateMe', updateMe);
router.patch('/updateMyPassword',updatePassword);
router.delete('/deleteMe', deleteMe);



// Routes solo per admin
router.use(restrictTo('admin'));
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser);

export default router;