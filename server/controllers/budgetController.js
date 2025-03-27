// controllers/budgetController.js
import {
    getBudgetForCategory,
    setBudgetForCategory,
    updateBudgetForCategory,
    deleteBudgetForCategory,
    getBudgetConsumptionForCategory
  } from '../models/budgetModel.js';
  
  /**
   * GET /budget/:userId/:categoryId
   * Liefert das Budget für eine Kategorie eines Benutzers sowie den Verbrauch und einen Indikator, ob das Budget überschritten wurde.
   */
  export async function handleGetBudgetForCategory(req, res) {
    try {
      const { userId, categoryId } = req.params;
      if (!userId || !categoryId) {
        return res.status(400).json({ error: 'Missing userId or categoryId parameter' });
      }
      const budget = await getBudgetForCategory(userId, categoryId);
      const consumption = await getBudgetConsumptionForCategory(userId, categoryId);
      const overBudget = consumption > Number(budget.budget_amount);
      return res.json({ budget, consumption, overBudget });
    } catch (error) {
      console.error('[handleGetBudgetForCategory] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * POST /budget/:userId/:categoryId
   * Erstellt (oder aktualisiert) ein Budget für eine Kategorie eines Benutzers.
   * Erwarteter Body: { budget_amount: number, period_start: string, period_end: string, description: string }
   */
  export async function handleCreateBudgetForCategory(req, res) {
    try {
      const { userId, categoryId } = req.params;
      const { budget_amount, period_start, period_end, description } = req.body;
      if (!userId || !categoryId || budget_amount === undefined || !period_start || !period_end || !description) {
        return res.status(400).json({ error: 'Missing required fields: userId, categoryId, budget_amount, period_start, period_end, description' });
      }
      const data = await setBudgetForCategory(userId, categoryId, { budget_amount, period_start, period_end, description });
      return res.json({ message: 'Budget created/updated successfully', data });
    } catch (error) {
      console.error('[handleCreateBudgetForCategory] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * PATCH /budget/:userId/:categoryId
   * Aktualisiert (patcht) das Budget für eine Kategorie eines Benutzers.
   * Im Body können Felder wie budget_amount, period_start, period_end oder description enthalten sein.
   */
  export async function handleUpdateBudgetForCategory(req, res) {
    try {
      const { userId, categoryId } = req.params;
      const payload = req.body;
      if (!userId || !categoryId || !payload) {
        return res.status(400).json({ error: 'Missing required fields or payload' });
      }
      const data = await updateBudgetForCategory(userId, categoryId, payload);
      return res.json({ message: 'Budget updated successfully', data });
    } catch (error) {
      console.error('[handleUpdateBudgetForCategory] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * DELETE /budget/:userId/:categoryId
   * Löscht das Budget für eine Kategorie eines Benutzers.
   */
  export async function handleDeleteBudgetForCategory(req, res) {
    try {
      const { userId, categoryId } = req.params;
      if (!userId || !categoryId) {
        return res.status(400).json({ error: 'Missing userId or categoryId parameter' });
      }
      const data = await deleteBudgetForCategory(userId, categoryId);
      return res.json({ message: 'Budget deleted successfully', data });
    } catch (error) {
      console.error('[handleDeleteBudgetForCategory] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }



  export async function handleGetBudgetConsumption(req, res) {
  try {
    const { userId, categoryId } = req.params;
    if (!userId || !categoryId) {
      return res.status(400).json({ error: 'Missing userId or categoryId parameter' });
    }
    const realAmount = await getBudgetConsumptionForCategory(userId, categoryId);
    return res.json({ real_amount: realAmount });
  } catch (error) {
    console.error('[handleGetBudgetRealAmount] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}