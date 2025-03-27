// models/recurringModel.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Liefert alle wiederkehrenden Transaktionen.
 */
export async function getAllRecurringTransactions() {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Liefert alle wiederkehrenden Transaktionen für einen bestimmten Benutzer.
 * @param {string} userId - Die UUID des Benutzers.
 */
export async function getRecurringTransactionsForUser(userId) {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Löscht eine wiederkehrende Transaktion anhand der ID.
 * @param {string} recurringId - Die ID der wiederkehrenden Transaktion.
 */
export async function deleteRecurringTransaction(recurringId) {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('recurring_id', recurringId);
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Erstellt eine neue wiederkehrende Transaktion für einen Benutzer.
 * @param {string} userId - Die UUID des Benutzers.
 * @param {object} payload - Enthält amount (numeric), frequency (text) und last_run (ISO-String).
 */
export async function createRecurringTransaction(userId, payload) {
  // Payload enthält z. B. { amount: 100, frequency: 'monthly', last_run: "2024-12-01T00:00:00Z" }
  const { data, error } = await supabase
    .from('recurring_transactions')
    .insert({
      user_id: userId,
      amount: payload.amount,
      frequency: payload.frequency,
      last_run: payload.last_run // Hier kannst du auch den aktuellen Zeitpunkt setzen, wenn gewünscht
    })
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Verarbeitet alle fälligen wiederkehrenden Transaktionen, also solche, bei denen seit last_run
 * genügend Zeit verstrichen ist. Für jede fällige Transaktion wird ein Eintrag in der Tabelle
 * transactions eingefügt. Anschließend wird der last_run-Wert aktualisiert.
 *
 * Wir nehmen an:
 * - daily: 1 Tag
 * - weekly: 7 Tage
 * - monthly: 30 Tage (als Näherung)
 */
export async function processPendingRecurringTransactions() {
  const now = new Date();
  // Hole alle wiederkehrenden Transaktionen
  const { data: recurringTrans, error } = await supabase
    .from('recurring_transactions')
    .select('*');
  if (error) throw new Error(error.message);

  const processed = [];

  for (const rec of recurringTrans) {
    const lastRun = new Date(rec.last_run);
    let periodDays = 0;
    if (rec.frequency === 'daily') {
      periodDays = 1;
    } else if (rec.frequency === 'weekly') {
      periodDays = 7;
    } else if (rec.frequency === 'monthly') {
      periodDays = 30;
    } else {
      console.warn(`Unbekannte Frequenz "${rec.frequency}" für recurring_id ${rec.recurring_id}`);
      continue;
    }
    
    const diffTime = now - lastRun; // in Millisekunden
    const diffDays = diffTime / (1000 * 3600 * 24);
    const periods = Math.floor(diffDays / periodDays);
    
    if (periods > 0) {
      // Berechne den Gesamtbetrag (wobei amount auch negativ sein kann)
      const totalValue = rec.amount * periods;
      
      // Füge in der Tabelle "transactions" einen Eintrag ein
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: rec.user_id,
          value: totalValue,
          description: `Recurring transaction processed for ${periods} period(s)`,
          category_id: null  // Kann bei Bedarf angepasst werden
        });
      if (transError) {
        console.error(`Fehler beim Einfügen der Transaktion für recurring_id ${rec.recurring_id}:`, transError);
        continue;
      }
      
      // Aktualisiere last_run: letze Ausführung + (periods * periodDays)
      const newLastRun = new Date(lastRun.getTime() + periods * periodDays * 24 * 3600 * 1000);
      const { error: updateError } = await supabase
        .from('recurring_transactions')
        .update({ last_run: newLastRun.toISOString() })
        .eq('recurring_id', rec.recurring_id);
      if (updateError) {
        console.error(`Fehler beim Aktualisieren von last_run für recurring_id ${rec.recurring_id}:`, updateError);
        continue;
      }
      
      processed.push({
        recurring_id: rec.recurring_id,
        processedPeriods: periods,
        newLastRun: newLastRun.toISOString()
      });
    }
  }
  return processed;
}
