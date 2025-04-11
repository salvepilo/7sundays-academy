import express from 'express';
import * as moduleController from '../controllers/moduleController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// Proteggi tutte le rotte
router.use(protect);

// Rotte per la gestione dei moduli
router
  .route('/')
  .get(moduleController.getModules)
  .post(restrictTo('admin'), moduleController.createModule);

router
  .route('/:id')
  .get(moduleController.getModule)
  .patch(restrictTo('admin'), moduleController.updateModule)
  .delete(restrictTo('admin'), moduleController.deleteModule);

// Rotte per la gestione dell'ordine dei moduli
router
  .route('/:id/order')
  .patch(restrictTo('admin'), moduleController.updateModuleOrder);

// Rotte per la gestione delle lezioni nei moduli
router
  .route('/:moduleId/lessons/:lessonId')
  .post(restrictTo('admin'), moduleController.addLessonToModule)
  .delete(restrictTo('admin'), moduleController.removeLessonFromModule);

export default router;