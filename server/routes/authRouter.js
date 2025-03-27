// routes/authRouter.js
import express from 'express';
import { login, callback, me, logoutUser, getUserByIdC } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/login', login);                           // POST /auth/login
router.get('/callback', callback);                      // GET /auth/callback
router.get('/me', authenticateToken, me);               // GET /auth/me
router.post('/logout', authenticateToken, logoutUser);  // POST /auth/logout

// Neue Route zum Abrufen eines Nutzers basierend auf userId
router.get('/user/:userId', authenticateToken, getUserByIdC); // GET /auth/user/:userId

export default router;
