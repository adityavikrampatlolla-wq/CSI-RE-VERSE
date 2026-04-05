const { MongoClient } = require('mongodb');

// Reuse connection across warm invocations
let client;
let clientPromise;

function getClient() {
  if (!clientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }
  return clientPromise;
}

module.exports = async function handler(req, res) {
  // CORS — allow the page to call this API from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await getClient();
    const db  = client.db('csi_hunt');
    const col = db.collection('air_state');

    // ── GET /api/state?team=TeamName ──
    if (req.method === 'GET') {
      const team = req.query.team;
      if (!team) return res.status(400).json({ error: 'team required' });

      const doc = await col.findOne(
        { teamName: team },
        { projection: { _id: 0 } }
      );
      return res.status(200).json(doc || null);
    }

    // ── POST /api/state  { teamName, clicksUsed, attempts, gameOver, completed, revealed } ──
    if (req.method === 'POST') {
      const { teamName, clicksUsed, attempts, gameOver, completed, revealed } = req.body;
      if (!teamName) return res.status(400).json({ error: 'teamName required' });

      await col.updateOne(
        { teamName },
        {
          $set: {
            teamName,
            clicksUsed: clicksUsed ?? 0,
            attempts:   attempts   ?? 3,
            gameOver:   gameOver   ?? false,
            completed:  completed  ?? false,
            revealed:   revealed   ?? [],
            updatedAt:  new Date(),
          },
        },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/state]', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
