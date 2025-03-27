import { processInvoice } from '../models/huggingModel.js';

export async function handleInvoiceProcessing(req, res) {
    try {
        const { text } = req.body;
        const {userId} = req.params;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid input text.' });
        }

        let rawOutput = await processInvoice(text, userId);

        //console.log('Raw Output from Model:', rawOutput);

        if (typeof rawOutput !== 'string' || rawOutput.length === 0) {
            throw new Error('Invalid output received from the model.');
        }

        let cleanOutput;
        try {
            cleanOutput = JSON.parse(rawOutput);
        } catch (error) {
            console.error('Error parsing JSON:', rawOutput);
            return res.status(500).json({ error: 'Invalid JSON format from model.' });
        }

        // Die bereinigte JSON-Ausgabe zurückgeben
        return res.json(cleanOutput);
    } catch (error) {
        console.error('Error processing invoice:', error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
