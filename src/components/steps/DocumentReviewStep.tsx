import React, { useState, useEffect } from "react";
import DocumentReview from "@/components/DocumentReview";
import { Fact } from "@/lib/mockData";
import { toast } from "sonner";
import { openai } from "@/lib/openai";
import { Loader } from "lucide-react";
import { text } from "stream/consumers";

interface DocumentReviewStepProps {
  documentName: string;
  facts: Fact[];
  onFactsUpdate: (facts: Fact[]) => void;
  onSearchQueryExtracted: (searchQuery: string) => void;
  isProcessing: boolean;
  file?: File;
  rawText?: string;
}

const DocumentReviewStep: React.FC<DocumentReviewStepProps> = ({
  documentName,
  file,
  facts,
  onFactsUpdate,
  onSearchQueryExtracted,
  isProcessing,
  rawText,
}) => {
  const [fileContent, setFileContent] = useState("");
  useEffect(() => {
    if (rawText) {
      setFileContent(rawText);
    } else if (file) {
      const reader = new FileReader();
      reader.onload = () => setFileContent(reader.result as string);
      reader.readAsText(file);
    }
  }, [rawText, file]);

  // Local loading state for LLM extraction
  const [loadingExtraction, setLoadingExtraction] = useState(false);
  const [hasAutoRun, setHasAutoRun] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // LLM extraction function
  const runExtraction = async () => {
    setLoadingExtraction(true);
    toast("Running extraction", { description: "This may take a moment..." });
    try {
      const prompt = `Extract meaningful facts and formulate a single, well-structured search query to find any relevant class action cases regarding the matter or those provided by the evidence. Focus exclusively on the text, not PDF metadata.

Document Content:
"""${fileContent}"""

Create a JSON object with two top-level keys:
- "facts": an array of objects, each with id (string), label (string), value (string), confidence (0–1), isEdited (boolean).
- "searchQuery": a single string representing a search query suitable for finding relevant class action lawsuits based on this content.

Respond ONLY with valid JSON, no extra text.`;
      const stream = await openai.chat.completions.create({
        model: "webai-llm",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });
      let text = "";
      for await (const chunk of stream) {
        type OpenAIChatChoice = { delta?: { content?: string }; message?: { content?: string } };
        const choice = chunk.choices?.[0] as OpenAIChatChoice;
        const rawToken = choice.delta?.content ?? choice.message?.content ?? "";
        text += rawToken;
      }
      let newFacts: Fact[] = [];
      console.log("llm text", text);
      try {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        const jsonText = start !== -1 && end !== -1 && end > start ? text.slice(start, end + 1) : text;
        const parsed = JSON.parse(jsonText);
        let newSearchQuery = "";
        if (Array.isArray(parsed.facts)) {
          newFacts = parsed.facts;
        } else {
          console.error("Unexpected JSON structure:", parsed);
        }
        // Extract search query
        if (typeof parsed.searchQuery === "string") {
          newSearchQuery = parsed.searchQuery;
        }
        setSearchQuery(newSearchQuery);
        console.log("onSearchQueryExtracted", onSearchQueryExtracted);
        if (typeof onSearchQueryExtracted === "function") {
          onSearchQueryExtracted(newSearchQuery);
        }
      } catch (parseErr) {
        console.error("Failed to parse JSON from LLM:", text, parseErr);
        toast.error("Invalid JSON from LLM");
      }
      onFactsUpdate(newFacts);
      toast.success("Facts updated");
    } catch (err) {
      console.error("LLM extraction error:", err);
      toast.error("Extraction failed");
    } finally {
      setLoadingExtraction(false);
    }
  };

  // Auto-trigger extraction once content is loaded
  useEffect(() => {
    if (fileContent && !hasAutoRun) {
      setHasAutoRun(true);
      runExtraction();
    }
  }, [fileContent, hasAutoRun]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Review Extracted Information</h2>
      <p className="mb-6 text-gray-600">
        We've analyzed your documents and extracted key information. 
        Please review and correct any inaccuracies.
      </p>
      {(loadingExtraction || !hasAutoRun) ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-4 text-gray-600">Extracting information, please wait...</p>
        </div>
      ) : (
        <DocumentReview
          documentName={documentName}
          documentUrl={file ? URL.createObjectURL(file) : undefined}
          extractedFacts={facts}
          onFactsUpdate={onFactsUpdate}
          onRerunExtraction={runExtraction}
          isProcessing={loadingExtraction}
        />
      )}
    </div>
  );
};

export default DocumentReviewStep;
