
import React from "react";
import DocumentReview from "@/components/DocumentReview";
import { Fact } from "@/lib/mockData";
import { toast } from "sonner";

interface DocumentReviewStepProps {
  documentName: string;
  facts: Fact[];
  onFactsUpdate: (facts: Fact[]) => void;
  isProcessing: boolean;
  uploadedFiles: File[];
}

const DocumentReviewStep: React.FC<DocumentReviewStepProps> = ({
  documentName,
  facts,
  onFactsUpdate,
  isProcessing,
  uploadedFiles,
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Review Extracted Information</h2>
      <p className="mb-6 text-gray-600">
        We've analyzed your documents and extracted key information. 
        Please review and correct any inaccuracies.
      </p>
      <DocumentReview
        documentName={documentName}
        documentUrl={URL.createObjectURL(uploadedFiles[0])}
        extractedFacts={facts}
        onFactsUpdate={onFactsUpdate}
        onRerunExtraction={() => {
          toast("Re-analyzing document", {
            description: "This may take a moment...",
          });
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default DocumentReviewStep;
