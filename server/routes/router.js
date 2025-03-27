import { Router } from 'express';
import multer from 'multer';
import { extractTextFromImage } from '../controllers/controller.js';
import { handleInvoiceProcessing } from '../controllers/huggingController.js';
import { fullProcess } from '../controllers/fullProcessController.js';
import { 
  getAllReceiptsWithItemsController, 
  deleteItemC, 
  deleteReceiptC, 
  updateItemC, 
  updateReceiptC,
  getReceiptsByUserC
} from "../controllers/tblController.js";

const router = Router();
const upload = multer();

// Standard-Routen
router.post('/extract', upload.single('file'), extractTextFromImage);
router.post('/logic', handleInvoiceProcessing);
router.post('/full-process/:userId', upload.single('file'), fullProcess);

// CRUD-Operationen für Belege
router.get("/data", getAllReceiptsWithItemsController);
router.patch("/receipts/:receiptId", updateReceiptC);
router.delete("/receipts/:receiptId", deleteReceiptC);

// CRUD-Operationen für Items
router.patch("/items/:itemId", updateItemC);
router.delete("/items/:itemId", deleteItemC);

// GET fuer Rezepte
router.get("/receipts/user/:userId", getReceiptsByUserC);

export default router;
