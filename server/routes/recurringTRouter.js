// routes/TransactionsRoutes.js
import { Router } from 'express';
import {
  handleGetAllRecurring,
  handleGetRecurringForUser,
  handleDeleteRecurring,
  handleCreateRecurring,
  handleProcessRecurring
} from '../controllers/recurringTController.js';

const router = Router();

// Alle wiederkehrenden Transaktionen abrufen
router.get('/all', handleGetAllRecurring);

// Alle wiederkehrenden Transaktionen für einen Benutzer abrufen (userId in params)
router.get('/user/:userId', handleGetRecurringForUser);

// Eine wiederkehrende Transaktion löschen (id in params)
router.delete('/:id', handleDeleteRecurring);

// Eine neue wiederkehrende Transaktion erstellen (userId in params, weitere Felder im Body)
router.post('/:userId', handleCreateRecurring);

// Route, die alle fälligen wiederkehrenden Transaktionen verarbeitet und als eigene Transaktion einfügt
router.post('/process', handleProcessRecurring);

export default router;
