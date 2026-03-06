const SUPABASE_URL = 'https://jpxzydsazmeiqunrlqpe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweHp5ZHNhem1laXF1bnJscXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDU5MzEsImV4cCI6MjA4ODIyMTkzMX0.KoTzredQctSBz3lll-VpgeoxaM-TxD3ZaMUXO7iv26I';
const ADMIN_SECRET = 'DODIK1222';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - список игроков для админки
  if (req.method === 'GET') {
    const { secret } = req.query;
    if (secret !== ADMIN_SECRET) return res.status(403).json({ error: 'forbidden' });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/scores?order=balance.desc&limit=50`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    return res.status(200).json(await r.json());
  }

  // POST - действие над игроком
  if (req.method === 'POST') {
    const { secret, action, device_id, amount } = req.body;
    if (secret !== ADMIN_SECRET) return res.status(403).json({ error: 'forbidden' });
    if (!device_id) return res.status(400).json({ error: 'device_id required' });

    let patch = {};
    if (action === 'give')        patch = { bonus_balance: amount };
    if (action === 'clear_bonus') patch = { bonus_balance: 0 };
    if (action === 'reset')       patch = { balance: 1000, bonus_balance: 0 };
    if (action === 'ban')         patch = { banned: true };
    if (action === 'unban')       patch = { banned: false };

    const r = await fetch(`${SUPABASE_URL}/rest/v1/scores?device_id=eq.${encodeURIComponent(device_id)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(patch)
    });
    const data = await r.json();
    return res.status(200).json({ ok: true, data });
  }

  res.status(405).json({ error: 'method not allowed' });
}
