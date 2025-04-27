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
    // Enhanced scraping parameters with maximum context extraction
    const scrapingOptions = {
      url,
      formats: ["markdown", "links", "html", "screenshot", "metadata", "json"], // Get all available formats
      onlyMainContent: false, // Get the full page content
      waitFor: 5000, // Wait longer for dynamic content (5 seconds)
      skipImageSize: false, // Include images for richer context
      removeBase64Images: false, // Keep all images in the output
      blockAds: true, // Block ads and cookie popups for cleaner content
      insecure: true, // Skip TLS verification for more reliable scraping
      timeout: 60000, // Longer timeout for thorough scraping (60 seconds)
      extract: {
        schema: extractionSchema,
        prompt: "Extract very detailed and comprehensive information about this class action lawsuit, including specific settlement amounts, exact payout figures, precise filing/claim deadlines, all eligibility criteria, list of participating law firms, settlement administrators, case numbers, court information, and any other critical details that would be relevant for someone considering joining this lawsuit."
      },
      // Add actions to extract more content
      actions: [
        { wait: 2000 }, // Wait for page to fully render
        { screenshot: true }, // Take a screenshot of the initial view
        { scroll: { y: 1000 } }, // Scroll down to load more content
        { wait: 1000 }, // Wait for content to load after scrolling
        { screenshot: { selector: "main, #main, .main, article, .article, .content, #content" } }, // Screenshot main content area
        // Execute JavaScript to extract any dynamic content
        { executeJavascript: "return { dynamicContent: document.body.innerText, pageTitle: document.title, metaTags: Array.from(document.querySelectorAll('meta')).map(m => ({ name: m.getAttribute('name'), content: m.getAttribute('content') })) }" }
      ]
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
    
    // Process and clean up the response with all available data
    const processedData = {
      // Basic info
      title: data.extraction?.title || data.title || '',
      text: data.markdown || (data.data?.markdown) || '',
      html: data.html || (data.data?.html) || '',
      links: data.links || (data.data?.links) || [],
      
      // Extracted lawsuit details
      payout: data.extraction?.payout || '',
      participants: data.extraction?.participants || '',
      deadline: data.extraction?.deadline || '',
      lawFirm: data.extraction?.lawFirm || '',
      eligibility: data.extraction?.eligibility || '',
      caseNumber: data.extraction?.caseNumber || '',
      courtInfo: data.extraction?.courtInfo || '',
      summary: data.extraction?.summary || '',
      status: data.extraction?.status || '',
      
      // Website preview data
      screenshot: data.screenshot || (data.data?.screenshot) || '',
      screenshotContentArea: data.actions?.screenshots?.[1] || data.actions?.screenshots?.[0] || '',
      
      // Additional context
      metadata: data.metadata || (data.data?.metadata) || {},
      javascript: {
        pageTitle: data.actions?.jsResults?.[0]?.pageTitle || '',
        dynamicContent: data.actions?.jsResults?.[0]?.dynamicContent || '',
        metaTags: data.actions?.jsResults?.[0]?.metaTags || []
      },
      
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
