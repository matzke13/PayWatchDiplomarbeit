import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const textract = new AWS.Textract();

export async function extractTextFromImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei gefunden.' });
    }

    const params = {
      Document: {
        Bytes: req.file.buffer,
      },
    };

    const result = await textract.detectDocumentText(params).promise();

    let detectedText = '';
    result.Blocks.forEach((block) => {
      if (block.BlockType === 'LINE') {
        detectedText += block.Text + '\n';
      }
    });

    return res.json({
      text: detectedText.trim(),
    });
  } catch (error) {
    console.error('Fehler beim Textract:', error);
    return res.status(500).json({ error: 'Fehler beim Extrahieren des Textes.' });
  }
}
