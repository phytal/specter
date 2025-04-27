// API route for fetching Google search results from SerpApi
const SERP_API_KEY = process.env.SERPAPI_API_KEY;
const SERP_API_URL = 'https://serpapi.com/search.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!SERP_API_KEY) {
    return res.status(500).json({ error: 'SerpApi API key not configured.' });
  }

  // Hardcoded query for now
  const query = 'Facebook class action lawsuit';

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
