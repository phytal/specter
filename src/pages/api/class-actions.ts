

// API route for fetching Google search results from SerpApi
const SERP_API_KEY = process.env.SERPAPI_API_KEY;
const SERP_API_URL = 'https://serpapi.com/search.json';

import type { Request, Response } from 'express';

export async function classActionsHandler(req: Request, res: Response) {
  if (!SERP_API_KEY) {
    return res.status(500).json({ error: 'SerpApi API key not configured.' });
  }

  let query = '';
  if (req.method === 'POST') {
    query = req.body.query;
  } else if (req.method === 'GET') {
    query = typeof req.query.query === 'string' ? req.query.query : '';
  }
  if (!query) {
    return res.status(400).json({ error: 'Missing search query.' });
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: SERP_API_KEY,
      engine: 'google',
      num: '5',
    });
    const serpApiRes = await fetch(`${SERP_API_URL}?${params.toString()}`);
    const serpApiJson = await serpApiRes.json();
    console.log('[CLASS-ACTIONS API] Raw SerpAPI response:', JSON.stringify(serpApiJson, null, 2));
    if (!serpApiRes.ok) {
      throw new Error('Failed to fetch from SerpApi');
    }
    // Only return the top 5 organic results
    const organic_results = (serpApiJson.organic_results || []).slice(0, 5);
    res.status(200).json({ organic_results });
  } catch (error) {
    const message = (error instanceof Error) ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
