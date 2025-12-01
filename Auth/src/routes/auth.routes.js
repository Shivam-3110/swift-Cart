
import express from 'express';
import validators from '../middlewares/validator.middleware.js';
import authController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router= express.Router();

router.post('/api/auth/register',validators.registerUserValidations,validators.respondWithValidationErrors,authController.registerUser);

router.post('/api/auth/login',validators.loginUserValidations,validators.respondWithValidationErrors,authController.loginUser);

router.get('/api/auth/me',authMiddleware.authMiddleware,authController.getCurrentUser);

router.get('/api/auth/logout',authController.logoutUser);

export default router;