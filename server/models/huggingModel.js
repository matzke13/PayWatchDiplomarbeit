import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const modelname = 'mistralai/Mistral-Nemo-Instruct-2407';
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${modelname}`;
const HUGGINGFACE_API_KEY = process.env.HF_API_TOKEN;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function processInvoice(text, userId) {
  // Logge userId und Typ, damit wir sehen, was übergeben wird
  console.log('[processInvoice] userId:', userId, 'Type:', typeof userId);
  
  try {
    const prompt = `Convert the following receipt into JSON format. Do not repeat the prompt or input.

Receipt:
${text}

Output JSON:
{
  "date": "YYYY-MM-DD",
  "store": "Store Name",
  "total": Total Amount,
  "category": "Category Name",  // Automatically determine the category in German
  "items": [
    {
      "name": "Item Name",
      "quantity": Quantity,
      "unit_price": Unit Price,
      "total_price": Total Price
    }
  ]
}
`;

    // Anfrage an die Huggingface API senden
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_length: 512
        }
      },
      {
        headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` }
      }
    );

    // Den generierten Text bereinigen
    const rawOutput = response.data[0]?.generated_text;
    const cleanOutput = rawOutput.replace(prompt, '').trim();
    console.log('[processInvoice] Clean Output:', cleanOutput);

    // Die JSON-Daten aus dem bereinigten Text parsen
    const invoiceData = JSON.parse(cleanOutput);

    // Logge den Vergleichsprozess vor der Abfrage in Supabase
    console.log('[processInvoice] Querying user in Supabase with id:', userId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('[processInvoice] Supabase query result:', userData, userError);
    if (userError) {
      throw new Error(`Error querying user with id ${userId}: ${userError.message}`);
    }
    if (!userData) {
      throw new Error(`User with id ${userId} does not exist.`);
    }

    // Receipt inkl. Kategorie und userId in Supabase einfügen
    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        date: invoiceData.date,
        store: invoiceData.store,
        total: invoiceData.total,
        category: invoiceData.category,
        user_id: userId  // Speichere die User-ID (UUID)
      })
      .select();

    if (receiptError) {
      throw new Error(`Error inserting receipt: ${receiptError.message}`);
    }
    if (!receiptData || receiptData.length === 0) {
      throw new Error('No receipt record returned after insertion.');
    }

    const newReceiptId = receiptData[0].id;
    console.log('[processInvoice] New Receipt ID:', newReceiptId);

    // Für jedes Item wird ein Eintrag in der Tabelle "items" erstellt
    for (const item of invoiceData.items) {
      const { error: itemError } = await supabase
        .from('items')
        .insert({
          receipt_id: newReceiptId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        });
      if (itemError) {
        throw new Error(`Error inserting item: ${itemError.message}`);
      }
    }

    return cleanOutput;
  } catch (error) {
    console.error('[processInvoice] Error processing invoice with Huggingface API:', error);
    throw error;
  }
}
