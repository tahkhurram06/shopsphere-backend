import express from 'express';
import { registerUser, loginUser, getMe, getUsers, getUserById, updateProfile } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.get('/users', protect, adminOnly, getUsers);
router.get('/users/:id', protect, adminOnly, getUserById);

export default router;