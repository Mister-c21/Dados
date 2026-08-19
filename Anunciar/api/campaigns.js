import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const {
      imageUrl,
      finalUrl,
      planName,
      planPrice,
      boostRate,
      durationDays,
      totalAmount,
      paymentStatus
    } = req.body;

    if (!finalUrl || !totalAmount) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios ausentes.' });
    }

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    await db.execute({
      sql: `INSERT INTO campaigns (imageUrl, finalUrl, planName, planPrice, boostRate, durationDays, totalAmount, paymentStatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        imageUrl || '',
        finalUrl,
        planName || 'Padrão',
        planPrice || 100,
        boostRate || 0,
        durationDays || 15,
        totalAmount,
        paymentStatus || 'Pendente'
      ]
    });

    return res.status(200).json({ success: true, message: 'Anúncio salvo com sucesso!' });

  } catch (error) {
    console.error('Erro ao salvar no Turso:', error);
    return res.status(500).json({ success: false, error: 'Erro interno ao processar a requisição.' });
  }
}
