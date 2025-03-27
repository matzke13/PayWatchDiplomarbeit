// controllers/receiptController.js

import {
  getAllReceiptsWithItems,
  updateReceipt,
  deleteReceipt,
  updateItem,
  deleteItem,
  getReceiptsByUser,
} from "../models/tblModel.js";

/**
 * Controller-Funktion zum Abrufen aller Belege inkl. Items.
 */
export const getAllReceiptsWithItemsController = async (req, res) => {
  try {
    const receipts = await getAllReceiptsWithItems();
    return res.status(200).json(receipts);
  } catch (error) {
    console.error("Fehler beim Abrufen der Belege:", error);
    return res.status(500).json({ error: "Ein Fehler ist aufgetreten" });
  }
};

/**
 * Controller-Funktion zum Aktualisieren eines Belegs (receipt).
 */
export const updateReceiptC = async (req, res) => {
  const { receiptId } = req.params;
  const { date, store, total } = req.body;

  try {
    const updatedReceipt = await updateReceipt(receiptId, date, store, total);

    if (!updatedReceipt) {
      return res.status(404).json({ error: "Beleg nicht gefunden" });
    }

    return res.status(200).json(updatedReceipt);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Belegs:", error);
    return res
      .status(500)
      .json({ error: "Ein Fehler ist beim Aktualisieren des Belegs aufgetreten" });
  }
};

/**
 * Controller-Funktion zum Löschen eines Belegs (receipt).
 */
export const deleteReceiptC = async (req, res) => {
  const { receiptId } = req.params;

  try {
    await deleteReceipt(receiptId);
    return res.status(200).json({ message: "Beleg erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Belegs:", error);
    return res
      .status(500)
      .json({ error: "Ein Fehler ist beim Löschen des Belegs aufgetreten" });
  }
};

/**
 * Controller-Funktion zum Aktualisieren eines Items.
 */
export const updateItemC = async (req, res) => {
  const { itemId } = req.params;
  const { name, quantity, unitPrice, totalPrice } = req.body;

  try {
    const updatedItem = await updateItem(itemId, name, quantity, unitPrice, totalPrice);

    if (!updatedItem) {
      return res.status(404).json({ error: "Item nicht gefunden" });
    }

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Items:", error);
    return res
      .status(500)
      .json({ error: "Ein Fehler ist beim Aktualisieren des Items aufgetreten" });
  }
};

/**
 * Controller-Funktion zum Löschen eines Items.
 */
export const deleteItemC = async (req, res) => {
  const { itemId } = req.params;

  try {
    await deleteItem(itemId);
    return res.status(200).json({ message: "Item erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Items:", error);
    return res
      .status(500)
      .json({ error: "Ein Fehler ist beim Löschen des Items aufgetreten" });
  }
};

/**
 * Controller-Funktion zum Abrufen aller Belege eines bestimmten Benutzers.
 */
export const getReceiptsByUserC = async (req, res) => {
  let { userId } = req.params;
  console.log(`[getReceiptsByUserC] User-ID aus der URL:`, userId);

  if (!userId) {
    return res.status(400).json({ error: "User-ID fehlt in der Anfrage." });
  }

  try {
    const receipts = await getReceiptsByUser(userId);
    return res.status(200).json(receipts);
  } catch (error) {
    console.error("Fehler beim Abrufen der Belege für User:", error);
    return res.status(500).json({ error: "Ein Fehler ist aufgetreten" });
  }
};
