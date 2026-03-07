const SUPABASE_URL = 'https://jpxzydsazmeiqunrlqpe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweHp5ZHNhem1laXF1bnJscXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDU5MzEsImV4cCI6MjA4ODIyMTkzMX0.KoTzredQctSBz3lll-VpgeoxaM-TxD3ZaMUXO7iv26I';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { name, balance, level, rank_name, device_id } = req.body;
    if (!name || !device_id) return res.status(400).json({ error: 'name and device_id required' });

    // Сначала проверяем существует ли игрок
    const check = await fetch(`${SUPABASE_URL}/rest/v1/scores?device_id=eq.${encodeURIComponent(device_id)}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const existing = await check.json();

    if (existing && existing.length > 0) {
      // Обновляем — но не трогаем banned/bonus_balance/reset_needed
      await fetch(`${SUPABASE_URL}/rest/v1/scores?device_id=eq.${encodeURIComponent(device_id)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ name, balance, level, rank_name, updated_at: new Date().toISOString() })
      });
    } else {
      // Новый игрок
      await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, balance, level, rank_name, device_id })
      });
    }

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    const { device_id } = req.query;
    if (device_id) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/scores?device_id=eq.${encodeURIComponent(device_id)}`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const data = await r.json();
      return res.status(200).json(data[0] || null);
    }
    // Топ 10, только не забаненных
    const r = await fetch(`${SUPABASE_URL}/rest/v1/scores?banned=eq.false&order=balance.desc&limit=10`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const data = await r.json();
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'method not allowed' });
}
