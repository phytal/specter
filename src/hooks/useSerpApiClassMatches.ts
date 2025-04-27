// import { useEffect, useState } from "react";
// import { Fact, ClassMatch } from "@/lib/mockData";

// // Define types for SerpApi response
// interface OrganicResult {
//   position: number;
//   title: string;
//   link: string;
//   snippet: string;
//   displayed_link: string;
// }

// interface SerpApiResponse {
//   search_metadata: {
//     status: string;
//     id: string;
//     total_time_taken: number;
//   };
//   organic_results: OrganicResult[];
// }

// // Use the correct environment variable name for Vite
// const API_KEY = import.meta.env.VITE_SERPAPI_KEY;

// /**
//  * Custom hook to fetch class action matches from SerpApi using extracted facts as keywords.
//  * @param facts List of extracted facts from the user's document
//  * @param enabled Whether to run the search (should be true only for step 3)
//  */
// export function useSerpApiClassMatches(facts: Fact[], enabled: boolean) {
//   const [matches, setMatches] = useState<ClassMatch[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Debug logging
//     console.log("useSerpApiClassMatches effect running:", {
//       enabled,
//       hasApiKey: !!API_KEY,
//       factsLength: facts?.length,
//       facts,
//     });

//     // FOR TESTING: Use mock data if API key is missing
//     if (!API_KEY) {
//       console.log("Using mock data (no API key)");
//       setMatches([
//         {
//           id: "mock1",
//           name: "Sample Class Action Lawsuit",
//           description:
//             "This is a sample class action lawsuit for testing the UI.",
//           matchConfidence: 0.85,
//           memberCount: 1500,
//           source: "example.com",
//           datePosted: "2025-04-26",
//           url: "https://example.com",
//         },
//         {
//           id: "mock2",
//           name: "Another Class Action Case",
//           description: "Another sample case to test the matching interface.",
//           matchConfidence: 0.75,
//           memberCount: 800,
//           source: "test.com",
//           datePosted: "2025-04-25",
//           url: "https://test.com",
//         },
//       ]);
//       return;
//     }

//     if (!enabled) {
//       console.log("Search disabled");
//       return;
//     }
//     if (!enabled) {
//       console.log("Search disabled");
//       return;
//     }

//     if (!facts || facts.length === 0) {
//       console.log("No facts available");
//       return;
//     }

//     console.log("Using facts:", facts);
//     setLoading(true);
//     setError(null);

//     // HARD-CODED QUERY: Always use a fixed query for SerpApi
//     const query = "facebook class action lawsuit settlement";
//     const relevantFacts = ["facebook", "class action", "lawsuit", "settlement"];

//     import("@/lib/serpApiQuery").then(({ serpApiGoogleQuery }) => {
//       serpApiGoogleQuery(query)
//         .then((organicResults) => {
//           // Map organic results to ClassMatch format with better confidence scoring
//           const mapped: ClassMatch[] = (organicResults || [])
//             .filter((r) => {
//               const lowerTitle = r.title.toLowerCase();
//               const lowerSnippet = r.snippet.toLowerCase();
//               // Filter for results that are likely about class actions
//               return (
//                 (lowerTitle.includes("class action") ||
//                   lowerSnippet.includes("class action")) &&
//                 (lowerTitle.includes("lawsuit") ||
//                   lowerSnippet.includes("lawsuit") ||
//                   lowerTitle.includes("settlement") ||
//                   lowerSnippet.includes("settlement"))
//               );
//             })
//             .slice(0, 5)
//             .map((r, idx) => {
//               // Calculate confidence based on keyword matches
//               const text = (r.title + " " + r.snippet).toLowerCase();
//               const keywordMatches = relevantFacts.filter((fact) =>
//                 text.includes(fact.toLowerCase())
//               ).length;
//               const confidence = Math.min(
//                 0.9, // Max confidence
//                 0.5 + (keywordMatches / relevantFacts.length) * 0.4 // Base confidence + keyword match bonus
//               );

//               // Extract member count if mentioned in the text
//               let memberCount = 0;
//               const memberMatch = text.match(
//                 /(\d+,?\d*)\s*(members?|plaintiffs?|claimants?)/i
//               );
//               if (memberMatch) {
//                 memberCount = parseInt(memberMatch[1].replace(",", ""));
//               } else {
//                 memberCount = Math.floor(Math.random() * 900) + 100; // Fallback to random number
//               }

//               // Extract date if available
//               let datePosted: string | undefined;
//               const dateMatch = text.match(
//                 /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\w+ \d{1,2},? \d{4})/i
//               );
//               if (dateMatch) {
//                 datePosted = dateMatch[0];
//               }

//               return {
//                 id: r.link,
//                 name: r.title.replace(/\s+/g, " ").trim(),
//                 description: r.snippet.replace(/\s+/g, " ").trim(),
//                 matchConfidence: confidence - idx * 0.05, // Slight decrease in confidence for lower results
//                 memberCount,
//                 source: r.displayed_link.split("/")[0],
//                 datePosted: dateMatch?.[0],
//                 url: r.link,
//               };
//             });

//           setMatches(mapped);
//         })
//         .catch((err) => setError(err.message || "Unexpected error"))
//         .finally(() => setLoading(false));
//     });
//   }, [facts, enabled]);

//   return { matches, loading, error };
// }

import { useEffect, useState } from "react";
import { Fact, ClassMatch } from "@/lib/mockData";

// Define types for SerpApi response
interface OrganicResult {
  position?: number;
  title: string;
  link: string;
  snippet?: string;
  displayed_link?: string;
  description?: string;
}

export function useSerpApiClassMatches(facts: Fact[], enabled: boolean) {
  const [matches, setMatches] = useState<ClassMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    fetch("/api/class-actions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch class actions");
        return res.json();
      })
      .then((data) => {
        console.log('[FRONTEND] SerpAPI response:', data);
        // Map backend results to ClassMatch format
        const organicResults: OrganicResult[] = Array.isArray(
          data.organic_results
        )
          ? data.organic_results
          : [];
        const mapped: ClassMatch[] = organicResults.map((r, idx) => ({
          id: r.position ? String(r.position) : String(idx),
          name: r.title || "Unknown Title",
          description: r.snippet || r.description || "No description.",
          matchConfidence: Math.random() * 0.5 + 0.5, // Arbitrary for now
          memberCount: Math.floor(Math.random() * 10000) + 100,
          source: r.displayed_link || "",
          datePosted: undefined,
          url: r.link,
        }));
        setMatches(mapped);
      })
      .catch((err) => setError(err.message || "Unexpected error"))
      .finally(() => setLoading(false));
  }, [facts, enabled]);

  return { matches, loading, error };
}
