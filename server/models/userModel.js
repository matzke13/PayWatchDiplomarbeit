import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Funktion zum Abrufen aller Benutzer
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    throw error;
  }

  return data;
};
// Funktion zum Abrufen aller Kategorien eines Benutzers
export const getAllCategoriesForUser = async (userId) => {
  if (!userId || userId.trim() === '') {
    throw new Error('Benutzer-ID darf nicht leer sein.');
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    throw error;
  }
  return data;
};
// Funktion zum Abrufen aller Transaktionen eines Benutzers
export const getAllTransactionsForUser = async (userId) => {
  // 1. Überprüfen, ob die Benutzer-ID angegeben ist und nicht leer ist
  if (!userId || userId.trim() === '') {
    throw new Error('Benutzer-ID darf nicht leer sein.');
  }

  // 2. Transaktionen aus der Datenbank abrufen
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  // 3. Fehlerbehandlung
  if (error) {
    throw error;
  }

  // 4. Falls eine `rid` existiert, die zugehörigen Items zur Rechnung abrufen
  for (let transaction of transactions) {
    if (transaction.rid) {
      const { data: receiptItems, error: receiptError } = await supabase
        .from('items')          // <-- Hier 'items' statt 'receipts'
        .select('*')
        .eq('receipt_id', transaction.rid);  // <-- Hier nach 'receipt_id' filtern

      if (receiptError) {
        console.error('Fehler beim Abrufen der Items:', receiptError);
        transaction.items = [];
      } else {
        transaction.items = receiptItems;
      }
    } else {
      transaction.items = []; // Falls kein `rid`, leeres Array setzen
    }
  }

  return transactions;
};


//Neue Kategorie einfügen
export const insertCategory = async (userId, name, color) => {

  const isValidHexColor = (color) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);

  // 1.Check Überprüfen, ob die Benutzer-ID angegeben ist und nicht leer ist
  if (!userId || userId.trim() === '') {
    throw new Error('Benutzer-ID darf nicht leer sein.');
  }

  // 2.Check Überprüfen, ob der Name angegeben ist und nicht leer ist
  if (!name || name.trim() === '') {
    throw new Error('Der Name darf nicht leer sein.');
  }

  // 3.Check Überprüfen, ob der Name die maximale Länge von 50 Zeichen nicht überschreitet
  if (name.length > 50) {
    throw new Error('Der Name darf maximal 50 Zeichen lang sein.');
  }

  // 4.Check Überprüfen, ob die Farbe im gültigen HEX-Format vorliegt
  if (!color || !isValidHexColor(color)) {
    throw new Error('Farbe muss ein gültiges HEX-Format haben.');
  }


  // 5.Check Überprüfen, ob eine Kategorie mit der gleichen Benutzer-ID und dem gleichen Namen bereits existiert
  const { data: existingCategory, error: checkError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('name', name)
    .single();

  // 6.Check Fehler abfangen, wenn bei der Abfrage nach der Kategorie ein Problem aufgetreten ist
  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError; // PGRST116 bedeutet, dass keine Zeilen gefunden wurden
  }

  // 7.Check Überprüfen, ob die Kategorie bereits existiert
  if (existingCategory) {
    throw new Error('Kategorie existiert bereits für diesen Benutzer.');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([
      { user_id: userId, name, color }
    ])
    .select('*'); // Rückgabe der eingefügten Zeile

  if (error) {
    throw error;
  }

  return data;
};
//Neue Transaktion einfügen
export const createTransaction = async (transactionData) => {
  const { created_at, user_id, value, description, category_id } = transactionData;

  console.log("Creating transaction with data:", { created_at, user_id, value, description, category_id });

  // 1. Füge die Transaktion in der 'transactions'-Tabelle ein
  const { data: newTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
          {
              created_at,
              user_id,
              value,
              description,
              category_id
          }
      ])
      .select();  // Fügt sicher, dass die eingefügte Transaktion zurückgegeben wird

  if (transactionError || !newTransaction) {
      console.error("Transaction creation failed:", transactionError ? transactionError.message : 'No transaction data returned');
      throw new Error(`Transaction creation failed: ${transactionError ? transactionError.message : 'No transaction data returned'}`);
  }

  console.log("Transaction created successfully:", newTransaction);

  // 2. Hole den aktuellen Geldbetrag des Benutzers
  const { data: userData, error: userError } = await supabase
      .from('users')
      .select('money')
      .eq('user_id', user_id)
      .single();

  if (userError || !userData) {
      console.error("User data retrieval failed:", userError ? userError.message : 'No user data returned');
      throw new Error(`User data retrieval failed: ${userError ? userError.message : 'No user data returned'}`);
  }

  console.log("User data retrieved:", userData);

  // 3. Berechne den neuen Geldbetrag
  const newMoneyValue = userData.money + value;

  console.log("Calculated new money value for user:", newMoneyValue);

  // 4. Aktualisiere den Geldbetrag des Benutzers
  const { data: updatedUserData, error: updateError } = await supabase
      .from('users')
      .update({ money: newMoneyValue })
      .eq('user_id', user_id)
      .select();

  if (updateError || !updatedUserData) {
      console.error("User money update failed:", updateError ? updateError.message : 'No updated user data returned');
      throw new Error(`User money update failed: ${updateError ? updateError.message : 'No updated user data returned'}`);
  }

  console.log("User money updated successfully:", updatedUserData);
  return {
      message: "Transaction created successfully",
      data: {
          transaction: newTransaction[0],
          user: updatedUserData[0]
      }
  };
};
//User Löschen
export const deleteUser = async (userId) => {
  const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);
  const { error } = await supabaseServiceClient.auth.admin.deleteUser(userId);
  if (error) {
    console.error('Failed to delete user:', error.message);
  } else {
    console.log('User deleted successfully');
  }
};
// Transaktion löschen
export const deleteTransactionById = async (transactionId) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('tid', transactionId);

  if (error) {
    throw error;
  }

  return { message: 'Transaktion erfolgreich gelöscht.' };
};
// Kategorie nach ID
export const deleteCategoryById = async (categoryId) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('tid', categoryId)

  if (error) {
    throw new Error(error.message);
  }

  return { message: 'Kategorie erfolgreich gelöscht.' };
};