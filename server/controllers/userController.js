import { getAllUsers, insertCategory, createTransaction, deleteUser, getAllCategoriesForUser, getAllTransactionsForUser, deleteTransactionById, deleteCategoryById } from '../models/userModel.js';

// Controller für das Abrufen aller Benutzer --------------------------------------------------------------
export const getAllUsersC = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
  }
};
// Funktion zum Abrufen aller Kategorien eines Benutzers --------------------------------------------------
export const  getAllCategoriesForUserC = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kategorien vom Modell abrufen
    const categories = await getAllCategoriesForUser(userId);

    // Erfolgsantwort senden
    res.status(200).json(categories);
  } catch (error) {
    // Fehlerantwort senden
    res.status(400).json({ error: error.message });
  }
};
// Funktion zum Abrufen aller Transaktionen eines Benutzers -----------------------------------------------
export const getAllTransactionsForUserC = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Transaktionen vom Modell abrufen
    const transactions = await getAllTransactionsForUser(userId);

    // Erfolgsantwort senden
    res.status(200).json(transactions);
  } catch (error) {
    // Fehlerantwort senden
    res.status(400).json({ error: error.message });
  }
};
// Neue Kategorie hinzufügen -----------------------------------------------------------------------------
export const insertCategoryC = async (req, res) => {
  const { userId, name, color } = req.body;

  try {
    const category = await insertCategory(userId, name, color);
    return res.status(201).json(category);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Neue Transaktion hinzufügen
export const createTransactionC = async (req, res) => {
  try {
      const transactionData = req.body;
      const newTransaction = await createTransaction(transactionData);

      res.status(201).json({
          message: 'Transaction created successfully',
          data: newTransaction
      });
  } catch (error) {
      res.status(500).json({
          message: error.message,
      });
  }
};
//User Löschen
export const deleteUserC = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const error = await deleteUser(userId);
    if (error) {
      return res.status(500).json({ error: `Failed to delete user: ${error.message}` });
    }
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
};

export const deleteTransaction = async (req, res) => {
  const transactionId = req.params.id;

  try {
    // Transaktion löschen
    const result = await deleteTransactionById(transactionId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Fehler beim Löschen der Transaktion:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Kategorie löschen
export const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const result = await deleteCategoryById(categoryId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
