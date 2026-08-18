import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  // Configura os cabeçalhos CORS para aceitar requisições do seu site
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ou substitua '*' pelo seu domínio pessoal (ex: 'https://seusite.com.br')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde imediatamente a requisições do tipo OPTIONS (pré-voo do navegador)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { imageUrl, finalUrl, planName, planPrice, boostRate, durationDays, totalAmount, paymentStatus } = req.body;

    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    await turso.execute({
      sql: `INSERT INTO campaigns (image_url, final_url, plan_name, plan_price, boost_rate, duration_days, total_amount, payment_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [imageUrl, finalUrl, planName, planPrice, boostRate, durationDays, totalAmount, paymentStatus]
    });

    return res.status(200).json({ success: true, message: 'Anúncio salvo com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar no Turso:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao processar requisição.' });
  }
}
