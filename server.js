// Express backend for SERP API and file upload
import express from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for dev
app.use(cors());

// File upload setup
const upload = multer({ dest: 'uploads/' });

// SERP API endpoint
app.get('/api/class-actions', async (req, res) => {
  const SERP_API_KEY = process.env.SERPAPI_API_KEY;
  const SERP_API_URL = 'https://serpapi.com/search.json';
  const query = 'Facebook class action lawsuit';

  if (!SERP_API_KEY) {
    return res.status(500).json({ error: 'SerpApi API key not configured.' });
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: SERP_API_KEY,
      engine: 'google',
      num: '5',
    });
    const response = await fetch(`${SERP_API_URL}?${params.toString()}`);
    const data = await response.json();
    const organic_results = (data.organic_results || []).slice(0, 5);
    res.json({ organic_results });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.array('files'), (req, res) => {
  // req.files contains array of uploaded files
  res.json({ uploaded: req.files.map(f => ({ filename: f.filename, originalname: f.originalname })) });
});

// Firecrawl proxy endpoint with enhanced scraping capabilities
app.post('/api/firecrawl', express.json(), async (req, res) => {
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';
  const { url } = req.body;

  console.log('[FIRECRAWL API] Incoming request url:', url);
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url' });
  }
  if (!FIRECRAWL_API_KEY) {
    return res.status(500).json({ error: 'Firecrawl API key not set on server' });
  }
  
  // Define a schema for extracting structured lawsuit information
  const extractionSchema = {
    title: { type: 'string', description: 'The title or name of the lawsuit' },
    payout: { type: 'string', description: 'The settlement amount or payout details' },
    participants: { type: 'string', description: 'Number of participants, class members, or affected people' },
    deadline: { type: 'string', description: 'Filing deadline, claim deadline, or important dates' },
    lawFirm: { type: 'string', description: 'Law firm(s) handling the case' },
    eligibility: { type: 'string', description: 'Who is eligible to join or make claims' },
    caseNumber: { type: 'string', description: 'Case number or identifier if available' },
    courtInfo: { type: 'string', description: 'Court information where the lawsuit was filed' },
    summary: { type: 'string', description: 'A brief summary of the lawsuit' },
    status: { type: 'string', description: 'Current status of the lawsuit (pending, settled, etc.)' }
  };

  try {
    // Enhanced scraping parameters with maximum context extraction (using jsonOptions per Firecrawl /scrape spec)
    const scrapingOptions = {
      url,
      formats: [
        "markdown",
        "html",
        "rawHtml",
        "links",
        "screenshot",
        "json"
      ],
      onlyMainContent: true,
      waitFor: 5000,
      blockAds: true,
      skipTlsVerification: false,
      timeout: 90000,
      removeBase64Images: false,
      proxy: "stealth",
      actions: [
        { type: "wait", milliseconds: 2000 },
        { type: "screenshot" }
      ],
      location: {
        country: "US",
        languages: ["en-US"]
      },
      jsonOptions: {
        schema: extractionSchema,
        systemPrompt: "You are an assistant that extracts detailed class action lawsuit information.",
        prompt: "Extract very detailed and comprehensive information about this class action lawsuit, including specific settlement amounts, exact payout figures, precise filing/claim deadlines, all eligibility criteria, list of participating law firms, settlement administrators, case numbers, court information, and any other critical details relevant to joining this lawsuit."
      }
    };
    
    console.log('[FIRECRAWL API] Sending request with options:', JSON.stringify(scrapingOptions, null, 2));
    
    const firecrawlRes = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify(scrapingOptions),
    });
    
    // Handle response
    if (!firecrawlRes.ok) {
      const errorData = await firecrawlRes.json();
      console.error('[FIRECRAWL API] Error response:', firecrawlRes.status, errorData);
      return res.status(firecrawlRes.status).json({
        error: errorData.error || 'Firecrawl API error',
        status: firecrawlRes.status,
        details: errorData
      });
    }
    
    const data = await firecrawlRes.json();
    console.log('[FIRECRAWL API] Successful response status:', firecrawlRes.status);
    
    // Extract from nested data.data if present (Firecrawl spec)
    let firecrawl = data;
    if (data.success === true && typeof data.data === 'object') {
      firecrawl = data.data;
    }
    
    // Extract JSON data if available
    let extractData = {};
    if (firecrawl.llm_extraction) {
      extractData = firecrawl.llm_extraction;
    }
    
    // Get metadata
    const metadata = firecrawl.metadata || {};
    
    // Process text for better display
    const processedData = {
      // Basic info
      title: extractData.title || metadata.title || firecrawl.title || '',
      text: firecrawl.markdown || '',
      html: firecrawl.html || firecrawl.rawHtml || '',
      links: firecrawl.links || [],
      
      // Extracted lawsuit details (from jsonOptions extraction)
      payout: extractData.payout || '',
      participants: extractData.participants || '',
      deadline: extractData.deadline || '',
      lawFirm: extractData.lawFirm || '',
      eligibility: extractData.eligibility || '',
      caseNumber: extractData.caseNumber || '',
      courtInfo: extractData.courtInfo || '',
      summary: extractData.summary || metadata.description || '',
      status: extractData.status || '',
      
      // Website preview data
      screenshot: firecrawl.screenshot || '',
      metadata: metadata,
      
      // Raw text field - ensures we display something in the preview even if extraction fails
      rawText: firecrawl.markdown || metadata.description || metadata.fullText || '',
      
      // Raw response for advanced processing
      raw: data
    };

    return res.status(200).json(processedData);
  } catch (error) {
    console.error('[FIRECRAWL API] Proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API server running at http://localhost:${PORT}`);
});
