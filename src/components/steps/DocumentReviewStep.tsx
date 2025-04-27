import React, { useState, useEffect } from "react";
import DocumentReview from "@/components/DocumentReview";
import { Fact } from "@/lib/mockData";
import { toast } from "sonner";
import { openai } from "@/lib/openai";

interface DocumentReviewStepProps {
  documentName: string;
  facts: Fact[];
  onFactsUpdate: (facts: Fact[]) => void;
  isProcessing: boolean;
  file?: File;
}

const DocumentReviewStep: React.FC<DocumentReviewStepProps> = ({
  documentName,
  file,
  facts,
  onFactsUpdate,
  isProcessing,
}) => {
  const [fileContent, setFileContent] = useState("");
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFileContent(reader.result as string);
      reader.readAsText(file);
    }
  }, [file]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Review Extracted Information</h2>
      <p className="mb-6 text-gray-600">
        We've analyzed your documents and extracted key information. 
        Please review and correct any inaccuracies.
      </p>
      <DocumentReview
        documentName={documentName}
        extractedFacts={facts}
        onFactsUpdate={onFactsUpdate}
        onRerunExtraction={async () => {
          toast("Running extraction", { description: "This may take a moment..." });
          try {
            // Include title and full content, expect JSON array output
            const prompt = `I need a JSON object with a single key "facts" whose value is an array of objects. Each object must have these fields: id (string), label (string), value (string), confidence (number between 0 and 1), isEdited (boolean).\n\nDocument Title: "${documentName}"\nDocument Content:\n"""${fileContent}"""\n\nRespond ONLY with valid JSON, no extra text.`;
            const stream = await openai.chat.completions.create({
              model: "webai-llm",
              // model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }],
              stream: true,
            });
            let text = "";
            for await (const chunk of stream) {
              const choiceAny = chunk.choices?.[0] as any;
              const rawToken = choiceAny.delta?.content ?? choiceAny.message?.content ?? "";
              text += rawToken;
            }
            let newFacts: Fact[] = [];
            console.log("llm text", text);
            try {
              // Trim any leading/trailing non-JSON envelope
              const start = text.indexOf('{');
              const end = text.lastIndexOf('}');
              const jsonText = start !== -1 && end !== -1 && end > start
                ? text.slice(start, end + 1)
                : text;
              const parsed = JSON.parse(jsonText);
              if (Array.isArray(parsed.facts)) newFacts = parsed.facts;
              else console.error("Unexpected JSON structure, missing 'facts' array:", parsed);
            } catch (parseErr) {
              console.error("Failed to parse JSON from LLM:", text, parseErr);
              toast.error("Invalid JSON from LLM");
            }
            onFactsUpdate(newFacts);
            toast.success("Facts updated");
          } catch (err) {
            console.error("LLM extraction error:", err);
            toast.error("Extraction failed");
          }
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default DocumentReviewStep;
