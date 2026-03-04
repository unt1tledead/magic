const SUPABASE_URL = 'https://jpxzydsazmeiqunrlqpe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweHp5ZHNhem1lcXVucmxxcGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0NjE4MDYyOCwiZXhwIjoyMDYxNzU2NjI4fQ.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { name, balance, level, rank_name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    // Upsert by name
    const r = await fetch(`${SUPABASE_URL}/rest/v1/scores?name=eq.${encodeURIComponent(name)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ balance, level, rank_name, updated_at: new Date().toISOString() })
    });

    const existing = await r.json();

    if (!existing || existing.length === 0) {
      // Insert new
      await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, balance, level, rank_name })
      });
    }

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/scores?order=balance.desc&limit=10`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await r.json();
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'method not allowed' });
}
