// routes/budgetRoutes.js
import { Router } from 'express';
import {
  handleGetBudgetForCategory,
  handleCreateBudgetForCategory,
  handleUpdateBudgetForCategory,
  handleDeleteBudgetForCategory,
  handleGetBudgetConsumption
} from '../controllers/budgetController.js';

const router = Router();

// GET: Budget, Verbrauch und overBudget-Status für eine Kategorie eines Benutzers abrufen
router.get('/:userId/:categoryId', handleGetBudgetForCategory);

// POST: Ein Budget für eine Kategorie eines Benutzers erstellen oder aktualisieren
router.post('/:userId/:categoryId', handleCreateBudgetForCategory);

// PATCH: Budget für eine Kategorie eines Benutzers aktualisieren
router.patch('/:userId/:categoryId', handleUpdateBudgetForCategory);

// DELETE: Budget für eine Kategorie eines Benutzers löschen
router.delete('/:userId/:categoryId', handleDeleteBudgetForCategory);

// Neue Route: GET: Liefert den bisher verbrauchten Betrag für ein Budget (Kategorie) eines Benutzers
router.get('/:userId/:categoryId/consumption', handleGetBudgetConsumption);

export default router;
