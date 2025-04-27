import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClassMatch {
  id: string;
  name: string;
  description: string;
  matchConfidence: number;
  memberCount: number;
  url?: string;
  firecrawlContext?: FirecrawlContext;
}

export interface FirecrawlRawData {
  success?: boolean;
  data?: Record<string, unknown>;
  title?: string;
  headline?: string;
  text?: string;
  markdown?: string;
  html?: string;
  payout?: string;
  participants?: string;
  deadline?: string;
  lawFirm?: string;
  error?: string;
  screenshot?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FirecrawlContext {
  // Basic information
  title?: string;
  text?: string;
  payout?: string;
  participants?: string;
  deadline?: string;
  lawFirm?: string;
  error?: string;

  // Additional lawsuit details
  eligibility?: string;
  caseNumber?: string;
  courtInfo?: string;
  summary?: string;
  status?: string;

  // Website preview data
  screenshot?: string;
  screenshotContentArea?: string;
  links?: string[];
  html?: string;
  rawText?: string; // New field for guaranteed text content

  // Additional context
  metadata?: Record<string, unknown>;
  javascript?: {
    pageTitle?: string;
    dynamicContent?: string;
    metaTags?: Array<{ name?: string; content?: string }>;
  };

  // Store the complete raw response
  rawData?: FirecrawlRawData;
}

interface ClassMatchingProps {
  matches: ClassMatch[];
  selectedClassId: string | null;
  onClassSelect: (classId: string) => void;
  onCreateNewClass: () => void;
  onNext: () => void;
  firecrawlResults?: Record<string, FirecrawlContext>;
  firecrawlProgress?: number;
  rawContextModal: {
    open: boolean;
    context: FirecrawlContext | null;
    match: ClassMatch | null;
  };
  setRawContextModal: (modal: {
    open: boolean;
    context: FirecrawlContext | null;
    match: ClassMatch | null;
  }) => void;
  onFirecrawlResultsUpdate: (results: Record<string, FirecrawlContext>) => void;
  onLoadingUpdate: (isLoading: boolean) => void; // Add this prop
}

const ClassMatching: React.FC<ClassMatchingProps> = ({
  matches,
  selectedClassId,
  onClassSelect,
  onCreateNewClass,
  onNext,
  firecrawlResults = {},
  firecrawlProgress = 0,
  rawContextModal,
  setRawContextModal,
  onFirecrawlResultsUpdate,
  onLoadingUpdate, // Destructure the new prop
}) => {
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state starts as true
  const [pendingRequests, setPendingRequests] = useState(0); // Track number of pending requests
  const [localFirecrawlResults, setLocalFirecrawlResults] =
    useState<Record<string, FirecrawlContext>>(firecrawlResults);

  // Report loading state changes up to the parent
  useEffect(() => {
    onLoadingUpdate(isLoading);
  }, [isLoading, onLoadingUpdate]);

  // Load cached data from localStorage on component mount
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem("firecrawlCache");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setLocalFirecrawlResults((prev) => ({ ...prev, ...parsedData }));
        console.log(
          "[Firecrawl] Loaded cached data from localStorage",
          parsedData
        );
      }
    } catch (e) {
      console.error("[Firecrawl] Error loading cached data:", e);
    }
  }, []);
  useEffect(() => {
    const processMatches = async () => {
      // Filter matches to make sure they all have required fields to avoid empty cards
      const validMatches = matches.filter((match) => {
        return match && match.id && match.name && match.description;
      });

      // Set initial pending request count and loading state
      const requestsToMake = validMatches.filter(
        (match) => match.url && !localFirecrawlResults[match.id] // Check against local state
      ).length;
      setPendingRequests(requestsToMake);
      setIsLoading(requestsToMake > 0);

      // If no requests to make, we're done loading
      if (requestsToMake === 0) {
        setIsLoading(false);
        // If no requests needed, ensure parent has the current (potentially cached) results
        onFirecrawlResultsUpdate(localFirecrawlResults);
        return;
      }

      let updatedResults = { ...localFirecrawlResults }; // Work with a local copy within the effect
      let requestsCompleted = 0;

      // For each valid match, check if we need to fetch Firecrawl data
      for (const match of validMatches) {
        if (match.url && !localFirecrawlResults[match.id]) {
          try {
            console.log(
              `[Firecrawl] Fetching data for ${match.id} with URL:`,
              match.url
            );

            // Call the Express backend with the match URL
            const resp = await fetch("/api/firecrawl", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url: match.url }),
            });

            if (resp.ok) {
              const rawData = await resp.json();
              console.log(
                `[Firecrawl] Received data for ${match.id}:`,
                rawData
              );

              // Handle different response formats
              let processedData: FirecrawlRawData = rawData;

              // Check if the response has a 'data' field (nested structure)
              if (rawData.success && rawData.data) {
                processedData = rawData.data as FirecrawlRawData;
              }

              // Extract information, handling different possible structures
              const extractTextContent = (data: unknown): string => {
                if (typeof data === "string") return data;

                // Type guard to safely access properties
                const hasProperty = <T extends object>(
                  obj: unknown,
                  prop: keyof T
                ): obj is T => {
                  return typeof obj === "object" && obj !== null && prop in obj;
                };

                if (
                  hasProperty<{ markdown: string }>(data, "markdown") &&
                  typeof data.markdown === "string"
                ) {
                  return data.markdown;
                }

                if (
                  hasProperty<{ text: string }>(data, "text") &&
                  typeof data.text === "string"
                ) {
                  return data.text;
                }

                if (
                  hasProperty<{ html: string }>(data, "html") &&
                  typeof data.html === "string"
                ) {
                  return data.html;
                }

                return JSON.stringify(data);
              };

              const context: FirecrawlContext = {
                title: processedData.title || processedData.headline || "",
                text: extractTextContent(processedData),
                payout: processedData.payout || "",
                participants: processedData.participants || "",
                deadline: processedData.deadline || "",
                lawFirm: processedData.lawFirm || "",
                rawData: rawData, // Store the complete raw data
              };

              // Update the match object
              match.firecrawlContext = context;

              // Update local state and cache in localStorage
              updatedResults[match.id] = context; // Update the local copy
            } else {
              // Handle fetch error, maybe add an error context
              updatedResults[match.id] = { error: `Failed to fetch: ${resp.statusText}` };
            }
          } catch (e: any) {
            console.error(
              `[Firecrawl] Error fetching data for ${match.id}:`,
              e
            );
            // Add error context on exception
            updatedResults[match.id] = { error: `Fetch exception: ${e.message}` };
          } finally {
            // Decrement pending requests count after each request completes (success or failure)
            requestsCompleted++;
            setPendingRequests((prev) => prev - 1);
            // Check if all requests (that were initially needed) are done
            if (requestsCompleted === requestsToMake) {
              setIsLoading(false);
              setLocalFirecrawlResults(updatedResults); // Update local state
              onFirecrawlResultsUpdate(updatedResults); // Pass final results up
              // Cache to localStorage
              try {
                localStorage.setItem(
                  "firecrawlCache",
                  JSON.stringify(updatedResults)
                );
              } catch (e) {
                console.error("[Firecrawl] Error caching data:", e);
              }
            }
          }
        }
      }
    };

    processMatches();
    // We're intentionally only running this when matches change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  return (
    <div>
      {isLoading ? (
        // Full-page loading screen while Firecrawl data is being fetched
        <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg font-medium">Loading class action data...</p>
          <p className="text-sm text-gray-500">
            Fetching information from {pendingRequests} {pendingRequests === 1 ? 'source' : 'sources'}
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <p className="text-lg font-medium">No matching class actions found</p>
          <Button
            onClick={onCreateNewClass}
            className="bg-amber hover:bg-amber-600 text-white"
          >
            Create New Class Action
          </Button>
        </div>
      ) : (
        <div>
          {/* Progress bar removed - Confidence now shown in each card */}
          <div className="w-full py-4">
            {/* Display cards in a vertical list with appropriate styling */}
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              {matches
                .filter(
                  (match) =>
                    match && match.id && match.name && match.description
                )
                .map((match) => {
                  // Use the local state that includes both prop data and cached data
                  const context =
                    localFirecrawlResults[match.id] ||
                    match.firecrawlContext ||
                    {};
                  return (
                    <Card
                      key={match.id}
                      className={`w-full transition-all duration-200 ${
                        selectedClassId === match.id
                          ? "border-teal-600 shadow-md ring-1 ring-teal-600"
                          : "hover:border-gray-300"
                      }`}
                    >
                      <CardContent className="p-6 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center mb-2 gap-2">
                            <h3 className="text-lg font-bold mr-2">
                              {match.name}
                            </h3>
                            <Badge variant="outline" className="bg-teal-50">
                              {match.memberCount} member
                              {match.memberCount !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4 whitespace-pre-line max-h-32 overflow-y-auto">
                            {match.description}
                          </p>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                              <span>
                                <strong>Match confidence:</strong>
                              </span>
                              <span className="font-semibold">
                                {(match.matchConfidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-teal-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${match.matchConfidence * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {context.payout && (
                              <div className="text-lg">
                                <span role="img" aria-label="money">
                                  💰
                                </span>{" "}
                                <b>Payout:</b> {context.payout}
                              </div>
                            )}
                            {context.participants && (
                              <div className="text-lg">
                                <span role="img" aria-label="group">
                                  👥
                                </span>{" "}
                                <b>Participants:</b> {context.participants}
                              </div>
                            )}
                            {context.deadline && (
                              <div className="text-lg">
                                <span role="img" aria-label="calendar">
                                  📅
                                </span>{" "}
                                <b>Deadline:</b> {context.deadline}
                              </div>
                            )}
                            {context.lawFirm && (
                              <div className="text-lg">
                                <span role="img" aria-label="briefcase">
                                  💼
                                </span>{" "}
                                <b>Law Firm:</b> {context.lawFirm}
                              </div>
                            )}
                            {context.error && (
                              <div className="text-red-500 text-sm font-bold">
                                ❌ {context.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between mt-4 gap-2">
                          <Button
                            variant={
                              selectedClassId === match.id
                                ? "default"
                                : "outline"
                            }
                            className={
                              selectedClassId === match.id
                                ? "bg-teal-700 hover:bg-teal-800"
                                : "text-teal-700 border-teal-700 hover:bg-teal-50"
                            }
                            onClick={() => {
                              if (selectedClassId !== match.id) {
                                onClassSelect(match.id);
                                onNext();
                              }
                            }}
                            disabled={selectedClassId === match.id}
                          >
                            {selectedClassId === match.id
                              ? "Selected"
                              : "Join Class"}
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="text-xs text-gray-500 border border-gray-200 px-2 py-1 hover:bg-gray-50"
                                  onClick={() => {
                                    // Open modal with match context instead of tooltip
                                    setRawContextModal({
                                      open: true,
                                      context: context,
                                      match: match
                                    });
                                  }}
                                >
                                  🔎 View Raw Context
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="w-96 p-0 bg-white shadow-lg border rounded-lg max-h-[80vh] overflow-y-auto"
                                onMouseEnter={() => setHoveredMatch(match.id)}
                                onMouseLeave={() => setHoveredMatch(null)}
                              >
                                <div className="p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-sm">
                                      Lawsuit Details
                                    </h3>
                                    <X
                                      className="h-4 w-4 text-gray-500 cursor-pointer"
                                      onClick={() => setHoveredMatch(null)}
                                    />
                                  </div>
                                  {!context ? (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Loader className="h-4 w-4 text-teal-600 animate-spin" />
                                      <span>Crawling data...</span>
                                    </div>
                                  ) : context.error ? (
                                    <div className="text-red-600 text-xs">
                                      ❌ {context.error}
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {/* Website Preview (Screenshot) */}
                                      {(context.screenshot ||
                                        context.screenshotContentArea) && (
                                        <div>
                                          <strong className="block text-xs text-teal-700 mb-1">
                                            Website Preview
                                          </strong>
                                          <div className="border rounded overflow-hidden">
                                            <img
                                              src={
                                                context.screenshotContentArea ||
                                                context.screenshot
                                              }
                                              alt="Website preview"
                                              className="w-full h-auto object-contain"
                                              style={{ maxHeight: "200px" }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Key Lawsuit Information */}
                                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                                        {context.title && (
                                          <div className="col-span-2 text-xs">
                                            <strong className="block text-teal-700">
                                              Title:
                                            </strong>
                                            <p className="font-medium">
                                              {context.title}
                                            </p>
                                          </div>
                                        )}

                                        {context.summary && (
                                          <div className="col-span-2 text-xs">
                                            <strong className="block text-teal-700">
                                              Summary:
                                            </strong>
                                            <p>{context.summary}</p>
                                          </div>
                                        )}

                                        {context.payout && (
                                          <div className="text-xs">
                                            <strong className="block text-teal-700">
                                              Payout:
                                            </strong>
                                            <p className="font-medium text-green-700">
                                              {context.payout}
                                            </p>
                                          </div>
                                        )}

                                        {context.status && (
                                          <div className="text-xs">
                                            <strong className="block text-teal-700">
                                              Status:
                                            </strong>
                                            <p>{context.status}</p>
                                          </div>
                                        )}

                                        {context.deadline && (
                                          <div className="text-xs">
                                            <strong className="block text-teal-700">
                                              Deadline:
                                            </strong>
                                            <p className="text-orange-700">
                                              {context.deadline}
                                            </p>
                                          </div>
                                        )}

                                        {context.participants && (
                                          <div className="text-xs">
                                            <strong className="block text-teal-700">
                                              Participants:
                                            </strong>
                                            <p>{context.participants}</p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Additional Details (Collapsible) */}
                                      <details className="text-xs">
                                        <summary className="cursor-pointer text-gray-700 hover:text-teal-700 font-medium">
                                          Show Additional Details
                                        </summary>
                                        <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                                          {context.lawFirm && (
                                            <div className="text-xs">
                                              <strong className="block text-teal-700">
                                                Law Firm:
                                              </strong>
                                              <p>{context.lawFirm}</p>
                                            </div>
                                          )}

                                          {context.eligibility && (
                                            <div className="text-xs">
                                              <strong className="block text-teal-700">
                                                Eligibility:
                                              </strong>
                                              <p>{context.eligibility}</p>
                                            </div>
                                          )}

                                          {context.courtInfo && (
                                            <div className="text-xs">
                                              <strong className="block text-teal-700">
                                                Court:
                                              </strong>
                                              <p>{context.courtInfo}</p>
                                            </div>
                                          )}

                                          {context.caseNumber && (
                                            <div className="text-xs">
                                              <strong className="block text-teal-700">
                                                Case Number:
                                              </strong>
                                              <p>{context.caseNumber}</p>
                                            </div>
                                          )}

                                          {context.javascript?.pageTitle && (
                                            <div className="text-xs">
                                              <strong className="block text-teal-700">
                                                Page Title:
                                              </strong>
                                              <p>
                                                {context.javascript.pageTitle}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </details>

                                      {/* Text Content Preview */}
                                      {context.text && (
                                        <details className="text-xs">
                                          <summary className="cursor-pointer text-gray-700 hover:text-teal-700 font-medium">
                                            Content Preview
                                          </summary>
                                          <div className="mt-2 bg-gray-50 rounded p-2 text-xs max-h-40 overflow-auto">
                                            {context.text.substring(0, 500)}
                                            {context.text.length > 500
                                              ? "..."
                                              : ""}
                                          </div>
                                        </details>
                                      )}

                                      {/* Source Links */}
                                      {context.links &&
                                        context.links.length > 0 && (
                                          <details className="text-xs">
                                            <summary className="cursor-pointer text-gray-700 hover:text-teal-700 font-medium">
                                              Related Links
                                            </summary>
                                            <div className="mt-2 bg-gray-50 rounded p-2 text-xs max-h-40 overflow-auto">
                                              <ul className="list-disc pl-4 space-y-1">
                                                {(context.links as string[])
                                                  .slice(0, 5)
                                                  .map((link, i) => (
                                                    <li
                                                      key={i}
                                                      className="text-blue-600 truncate hover:text-blue-800"
                                                    >
                                                      <a
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                      >
                                                        {link}
                                                      </a>
                                                    </li>
                                                  ))}
                                                {(context.links as string[])
                                                  .length > 5 && (
                                                  <li>
                                                    +{" "}
                                                    {(context.links as string[])
                                                      .length - 5}{" "}
                                                    more links
                                                  </li>
                                                )}
                                              </ul>
                                            </div>
                                          </details>
                                        )}

                                      {/* Raw JSON Data */}
                                      <details className="text-xs">
                                        <summary className="cursor-pointer text-gray-500 hover:text-teal-600">
                                          View Raw JSON
                                        </summary>
                                        <pre className="bg-gray-50 rounded p-2 text-xs max-h-40 overflow-auto mt-1">
                                          {JSON.stringify(
                                            context.rawData || context,
                                            null,
                                            2
                                          )}
                                        </pre>
                                      </details>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              {/* Only show Create New Class Action button if there are matches */}
              {matches.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={onCreateNewClass}
                    className="border-amber text-amber hover:bg-amber-50"
                  >
                    Don't see a match? Create New Class Action
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Removed modal in favor of tooltips */}
    </div>
  );
};

export default ClassMatching;
