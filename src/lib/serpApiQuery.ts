export interface SerpApiOrganicResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  displayed_link: string;
}

export interface SerpApiResponse {
  organic_results: SerpApiOrganicResult[];
  [key: string]: any;
}

export async function serpApiGoogleQuery(query: string): Promise<SerpApiOrganicResult[]> {
  const apiKey = import.meta.env.VITE_SERPAPI_KEY as string;
  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: apiKey,
    gl: "us",
    hl: "en",
    google_domain: "google.com",
    device: "desktop",
    num: "10",
    safe: "active",
    tbm: "nws",
    start: "0",
    no_cache: "true",
    output: "json"
  });

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!response.ok) throw new Error(`SerpApi error: ${response.statusText}`);
  const json: SerpApiResponse = await response.json();
  return json["organic_results"] || [];
}
