import { extractTextFromImage } from './controller.js';
import { handleInvoiceProcessing } from './huggingController.js';

export async function fullProcess(req, res) {
  try {
    // Lese userId aus den URL-Parametern
    const { userId } = req.params;
    console.log('user id params: ' ,userId)
    if (!userId) {
      return res.status(400).json({ error: 'UserID is required in the URL parameters.' });
    }

    // 1. Schritt: Text aus dem Bild extrahieren
    const textractResult = await new Promise((resolve, reject) => {
      const mockRes = {
        json: (data) => resolve(data),
        status: (statusCode) => ({
          json: (error) => reject({ statusCode, error }),
        }),
      };
      extractTextFromImage(req, mockRes);
    });

    if (!textractResult || !textractResult.text) {
      return res.status(400).json({ error: 'Fehler beim Extrahieren des Textes.' });
    }

    // 2. Schritt: Invoice Processing durchführen – userId aus req.params wird hier direkt weitergereicht
    const invoiceProcessingResult = await new Promise((resolve, reject) => {
      const mockReq = { body: { text: textractResult.text }, params: { userId } };
      const mockRes = {
        json: (data) => resolve(data),
        status: (statusCode) => ({
          json: (error) => reject({ statusCode, error }),
        }),
      };
      handleInvoiceProcessing(mockReq, mockRes);
    });

    // Ergebnis zurückgeben
    return res.json(invoiceProcessingResult);
  } catch (error) {
    console.error('Fehler in der Full-Process-Route:', error);
    return res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}
