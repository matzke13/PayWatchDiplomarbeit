// models/budgetModel.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Liefert das Budget für einen Benutzer und eine bestimmte Kategorie.
 * @param {string} userId - Die UUID des Benutzers.
 * @param {number|string} categoryId - Die ID der Kategorie.
 * @returns {Promise<Object>} - Das Budgetobjekt.
 */
export async function getBudgetForCategory(userId, categoryId) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Legt ein Budget für einen Benutzer und eine bestimmte Kategorie fest bzw. aktualisiert es.
 * Erwarteter Payload: { budget_amount, period_start, period_end, description }
 * @param {string} userId - Die UUID des Benutzers.
 * @param {number|string} categoryId - Die ID der Kategorie.
 * @param {Object} payload - Enthält budget_amount, period_start, period_end, description.
 * @returns {Promise<Object>} - Das (neue oder aktualisierte) Budget.
 */
export async function setBudgetForCategory(userId, categoryId, payload) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert({
      user_id: userId,
      category_id: categoryId,
      budget_amount: payload.budget_amount,
      period_start: payload.period_start,
      period_end: payload.period_end,
      description: payload.description
    }, { onConflict: ['user_id', 'category_id'] })
    .select();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Aktualisiert (patcht) ein vorhandenes Budget.
 * @param {string} userId - Die UUID des Benutzers.
 * @param {number|string} categoryId - Die ID der Kategorie.
 * @param {Object} payload - Enthält Felder, die aktualisiert werden sollen.
 * @returns {Promise<Object>} - Das aktualisierte Budget.
 */
export async function updateBudgetForCategory(userId, categoryId, payload) {
  const { data, error } = await supabase
    .from('budgets')
    .update(payload)
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .select();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Löscht das Budget für einen Benutzer und eine bestimmte Kategorie.
 * @param {string} userId - Die UUID des Benutzers.
 * @param {number|string} categoryId - Die ID der Kategorie.
 * @returns {Promise<Object>} - Die gelöschten Datensätze.
 */
export async function deleteBudgetForCategory(userId, categoryId) {
  const { data, error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', userId)
    .eq('category_id', categoryId);
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Berechnet den Verbrauch (Summe der Ausgaben) für alle Transaktionen eines Benutzers
 * in einer bestimmten Kategorie im Budgetzeitraum.
 * Es werden nur negative Transaktionen berücksichtigt.
 * @param {string} userId - Die UUID des Benutzers.
 * @param {number|string} categoryId - Die ID der Kategorie.
 * @returns {Promise<number>} - Der Verbrauch (als positive Zahl).
 */
export async function getBudgetConsumptionForCategory(userId, categoryId) {
  const { data, error } = await supabase
    .from('budgets')
    .select('real_amount, budget_amount')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .single();
  if (error) throw new Error(error.message);
  return { 
    real_amount: data.real_amount, 
    budget_amount: data.budget_amount 
  };
}