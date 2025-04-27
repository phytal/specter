import { useEffect, useState } from "react";
import { Fact, ClassMatch } from "@/lib/mockData";

// Define types for SerpApi response
interface OrganicResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  displayed_link: string;
}

interface SerpApiResponse {
  search_metadata: {
    status: string;
    id: string;
    total_time_taken: number;
  };
  organic_results: OrganicResult[];
}

const API_KEY = import.meta.env.VITE_SERPAPI_KEY;

/**
 * Custom hook to fetch class action matches from SerpApi using extracted facts as keywords.
 * @param facts List of extracted facts from the user's document
 * @param enabled Whether to run the search (should be true only for step 3)
 */
export function useSerpApiClassMatches(facts: Fact[], enabled: boolean) {
  const [matches, setMatches] = useState<ClassMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !API_KEY) return;
    if (!facts || facts.length === 0) return;
    setLoading(true);
    setError(null);

    // Build query from the most relevant fact values
    const query = facts.map(f => f.value).join(" ");
    const params = new URLSearchParams({
      engine: "google",
      q: query,
      api_key: API_KEY,
      gl: "us",
      hl: "en",
      google_domain: "google.com",
    });

    fetch(`https://serpapi.com/search.json?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = (await response.json()) as SerpApiResponse;
        if (data.search_metadata.status !== "Success") throw new Error(`Search failed: ${data.search_metadata.status}`);
        // Map organic results to ClassMatch format
        const mapped: ClassMatch[] = (data.organic_results || []).slice(0, 5).map((r, idx) => ({
          id: r.link,
          name: r.title,
          description: r.snippet,
          matchConfidence: 0.7 - idx * 0.1, // Fake confidence, descending
          memberCount: Math.floor(Math.random() * 1000) + 10, // Fake member count
        }));
        setMatches(mapped);
      })
      .catch((err) => setError(err.message || "Unexpected error"))
      .finally(() => setLoading(false));
  }, [facts, enabled]);

  return { matches, loading, error };
}
