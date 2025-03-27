// controllers/recurringController.js
import {
    getAllRecurringTransactions,
    getRecurringTransactionsForUser,
    deleteRecurringTransaction,
    createRecurringTransaction,
    processPendingRecurringTransactions
  } from '../models/recurringTModel.js';
  
  /**
   * GET /recurring/all
   */
  export async function handleGetAllRecurring(req, res) {
    try {
      const data = await getAllRecurringTransactions();
      return res.json(data);
    } catch (error) {
      console.error('[handleGetAllRecurring] Fehler:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * GET /recurring/user/:userId
   */
  export async function handleGetRecurringForUser(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });
      const data = await getRecurringTransactionsForUser(userId);
      return res.json(data);
    } catch (error) {
      console.error('[handleGetRecurringForUser] Fehler:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * DELETE /recurring/:id
   */
  export async function handleDeleteRecurring(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'Missing recurring transaction id' });
      const data = await deleteRecurringTransaction(id);
      return res.json({ message: 'Recurring transaction deleted', data });
    } catch (error) {
      console.error('[handleDeleteRecurring] Fehler:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * POST /recurring/:userId
   * Erwartet im Body: { amount: number, frequency: string, last_run: string }
   */
  export async function handleCreateRecurring(req, res) {
    try {
      const { userId } = req.params;
      const { amount, frequency, last_run } = req.body;
      if (!userId || amount === undefined || !frequency || !last_run) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const data = await createRecurringTransaction(userId, { amount, frequency, last_run });
      return res.json({ message: 'Recurring transaction created', data });
    } catch (error) {
      console.error('[handleCreateRecurring] Fehler:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * POST /recurring/process
   * Diese Route verarbeitet alle fälligen wiederkehrenden Transaktionen.
   */
  export async function handleProcessRecurring(req, res) {
    try {
      const processed = await processPendingRecurringTransactions();
      return res.json({ message: 'Processed recurring transactions', processed });
    } catch (error) {
      console.error('[handleProcessRecurring] Fehler:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  