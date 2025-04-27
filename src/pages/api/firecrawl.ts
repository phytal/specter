import type { NextApiRequest, NextApiResponse } from 'next';

// Make sure to use the server-side secret key, not the VITE_ one
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || process.env.VITE_FIRECRAWL_API_KEY; // fallback for local dev
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  console.log('[FIRECRAWL API] Incoming request url:', url);
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url' });
  }
  if (!FIRECRAWL_API_KEY) {
    return res.status(500).json({ error: 'Firecrawl API key not set on server' });
  }

  try {
    const firecrawlRes = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({ url }),
    });
    const data = await firecrawlRes.json();
    console.log('[FIRECRAWL API] Firecrawl API response:', JSON.stringify(data, null, 2));
    if (!firecrawlRes.ok) {
      return res.status(firecrawlRes.status).json({ error: data.error || 'Firecrawl API error' });
    }
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
