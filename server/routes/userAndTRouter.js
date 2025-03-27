import express from 'express';
import { getAllUsersC, insertCategoryC, createTransactionC, deleteUserC, getAllCategoriesForUserC, getAllTransactionsForUserC, deleteTransaction, deleteCategory } from '../controllers/userController.js';

const router = express.Router();

// Route zum Abrufen aller Benutzer
router.get('/', getAllUsersC);
router.get('/categories/:userId', getAllCategoriesForUserC);
router.get('/transactions/:userId', getAllTransactionsForUserC);
router.post('/categories', insertCategoryC);
router.post('/transactions', createTransactionC);
router.delete('/:userId', deleteUserC);
router.delete('/transactions/:id', deleteTransaction);
router.delete('/categories/:id', deleteCategory);

export default router;
