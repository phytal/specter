import React, { useEffect } from "react";

// Define the type for a single organic result. Adjust these fields to match your API's response.
export interface OrganicResult {
  title: string;
  link: string;
  snippet?: string;
  position?: number | string;
  description?: string;
  // Add more fields as needed based on your API response
}

interface SerpApiClassMatchingStepProps {
  onResults: (results: OrganicResult[]) => void;
}

const SerpApiClassMatchingStep: React.FC<SerpApiClassMatchingStepProps> = ({
  onResults,
}) => {
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Call the Next.js API route that fetches SERP results
        const res = await fetch("/api/class-actions");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Validate that organic_results is an array
        const results: OrganicResult[] = Array.isArray(data.organic_results)
          ? data.organic_results
          : [];
        onResults(results);
      } catch (error) {
        console.error("Failed to fetch class actions:", error);
        onResults([]); // Pass empty array on error
      }
    };
    fetchResults();
  }, [onResults]);

  return null; // This component just fetches and passes data up
};

export default SerpApiClassMatchingStep;
