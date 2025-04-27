import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader } from "lucide-react";

interface Fact {
  id: string;
  label: string;
  value: string;
  confidence: number;
  isEdited: boolean;
}

interface DocumentReviewProps {
  documentName: string;
  documentUrl?: string;
  extractedFacts: Fact[];
  onFactsUpdate: (facts: Fact[]) => void;
  onRerunExtraction: () => void;
  isProcessing: boolean;
  jsonPreview?: string | null;
}

// const DocumentReview: React.FC<DocumentReviewProps> = ({
//   documentName,
//   documentUrl,
//   extractedFacts,
//   onFactsUpdate,
//   onRerunExtraction,
//   isProcessing,

// }) => {
//   const [facts, setFacts] = useState<Fact[]>(extractedFacts);
//   useEffect(() => {
//     setFacts(extractedFacts);
//   }, [extractedFacts]);

//   const handleFactChange = (id: string, value: string) => {
//     const updatedFacts = facts.map((fact) =>
//       fact.id === id ? { ...fact, value, isEdited: true } : fact
//     );
//     setFacts(updatedFacts);
//     onFactsUpdate(updatedFacts);
//   };

const DocumentReview: React.FC<DocumentReviewProps> = ({
  documentName,
  documentUrl,
  extractedFacts,
  onFactsUpdate,
  onRerunExtraction,
  isProcessing,
  jsonPreview,
}) => {
  const [facts, setFacts] = useState<Fact[]>(extractedFacts);

  const handleFactChange = (id: string, value: string) => {
    const updatedFacts = facts.map((fact) =>
      fact.id === id ? { ...fact, value, isEdited: true } : fact
    );
    setFacts(updatedFacts);
    onFactsUpdate(updatedFacts);
  };

  const anyFactEdited = facts.some((fact) => fact.isEdited);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-100 rounded-lg p-4 min-h-[500px] flex flex-col">
        <div className="bg-gray-800 text-white p-2 rounded-t-lg">
          <h3 className="text-sm font-medium truncate">{documentName}</h3>
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded-b-lg flex items-center justify-center">
          {documentUrl ? (
                       <iframe
                       src={documentUrl}
                       className="w-full h-full rounded-b-lg"
                       title={documentName}
                     />
          ) : (
            <div className="text-center text-gray-500">
              <p>Document preview not available</p>
              <p className="text-sm">Extracted data shown on the right</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Extracted Information</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRerunExtraction}
                  disabled={isProcessing}
                  className="text-sm mr-2"
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 mr-1 animate-spin" />
                  ) : facts.length === 0 ? (
                    "Run Extraction"
                  ) : (
                    "Re-run Extraction"
                  )}
                </Button>
                <span className="text-xs text-gray-500">
                  {facts.length === 0
                    ? "Not extracted"
                    : anyFactEdited
                    ? "Edited"
                    : "Auto-extracted"}
                </span>
                {facts.length > 0 && !anyFactEdited && (
                  <Check className="h-4 w-4 text-green-500 ml-1" />
                )}
              </div>
            </div>

            <Separator className="my-4" />


            <div className="space-y-4">
              {facts.map((fact) => (
                <div key={fact.id} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={fact.id} className="text-sm font-medium">
                      {fact.label}
                    </Label>
                    <div className="flex items-center">
                      <div
                        className="h-1 w-16 bg-gray-200 rounded-full mr-2"
                        role="progressbar"
                        aria-valuenow={fact.confidence * 100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${fact.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(fact.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  {fact.label === "Description" || fact.value.length > 50 ? (
                    <Textarea
                      id={fact.id}
                      value={fact.value}
                      onChange={(e) => handleFactChange(fact.id, e.target.value)}
                      className={fact.isEdited ? "border-amber" : ""}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={fact.id}
                      value={fact.value}
                      onChange={(e) => handleFactChange(fact.id, e.target.value)}
                      className={fact.isEdited ? "border-amber" : ""}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentReview;
