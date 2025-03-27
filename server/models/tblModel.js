// models/tblModel.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Erstelle den Supabase-Client (verwende deine ENV-Variablen)
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Holt alle Belege (receipts) inklusive der zugehörigen Items.
 */
export const getAllReceiptsWithItems = async () => {
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      id,
      date,
      store,
      total,
      items (
        id,
        name,
        quantity,
        unit_price,
        total_price
      )
    `);

  if (error) {
    throw new Error(`Fehler beim Abrufen der Daten: ${error.message}`);
  }

  // Falls keine Daten vorhanden sind, geben wir ein leeres Array zurück
  if (!data) return [];

  // Struktur anpassen, damit sie zu deinem bisherigen Format passt
  return data.map((receipt) => ({
    receiptId: receipt.id,
    receiptDate: receipt.date,
    store: receipt.store,
    receiptTotal: receipt.total,
    items: (receipt.items || []).map((item) => ({
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price
    }))
  }));
};

/**
 * Aktualisiert einen bestehenden Beleg (receipt) anhand seiner ID.
 */
export const updateReceipt = async (receiptId, date, store, total) => {
  console.log(receiptId);
  const { data, error } = await supabase
    .from('receipts')
    .update({ date, store, total })
    .eq('id', receiptId)
    .select()
    .single(); // .single() gibt uns das aktualisierte Objekt zurück

    console.log(`[updateReceipt] Supabase Antwort:`, data, error);
  if (error) {
    throw new Error(`Fehler beim Aktualisieren des Belegs: ${error.message}`);
  }

  // Falls kein Datensatz zurückkommt, null zurückgeben
  if (!data) return null;

  // Daten ggf. anpassen, damit sie zum bisherigen Format passen
  return {
    receiptId: data.id,
    receiptDate: data.date,
    store: data.store,
    receiptTotal: data.total
  };
};

/**
 * Löscht einen Beleg (receipt) anhand seiner ID.
 */
export const deleteReceipt = async (receiptId) => {
  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', receiptId);

  if (error) {
    throw new Error(`Fehler beim Löschen des Belegs: ${error.message}`);
  }
};

/**
 * Aktualisiert ein Item anhand seiner ID.
 */
export const updateItem = async (itemId, name, quantity, unitPrice, totalPrice) => {
  const { data, error } = await supabase
    .from('items')
    .update({
      name,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice
    })
    .eq('id', itemId)
    .single();

  if (error) {
    throw new Error(`Fehler beim Aktualisieren des Items: ${error.message}`);
  }

  if (!data) return null;

  return {
    itemId: data.id,
    name: data.name,
    quantity: data.quantity,
    unitPrice: data.unit_price,
    totalPrice: data.total_price
  };
};

/**
 * Löscht ein Item anhand seiner ID.
 */
export const deleteItem = async (itemId) => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw new Error(`Fehler beim Löschen des Items: ${error.message}`);
  }
};

export const getReceiptsByUser = async (userId) => {
  console.log(`[getReceiptsByUser] Abrufen der Belege für User:`, userId);

  const { data, error } = await supabase
    .from('receipts')
    .select(`
      id,
      date,
      store,
      total,
      category,
      items (
        id,
        name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('user_id', userId); // Filtert nur nach dem gegebenen User

  console.log(`[getReceiptsByUser] Supabase Antwort:`, data, error);

  if (error) {
    throw new Error(`Fehler beim Abrufen der Belege: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((receipt) => ({
    receiptId: receipt.id,
    receiptDate: receipt.date,
    store: receipt.store,
    receiptTotal: receipt.total,
    category: receipt.category,
    items: (receipt.items || []).map((item) => ({
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price
    }))
  }));
};
