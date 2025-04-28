// src/pages/api/webhook/cartpanda.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { processCartpandaWebhook } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se é um método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Processar o webhook
    const result = await processCartpandaWebhook(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
}
