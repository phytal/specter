
import React from "react";
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";
import { extractFactsFromPDF } from "@/lib/pdfExtractor";
import { Fact } from "@/lib/mockData";

import { extractTextFromPDF } from "@/lib/pdfExtractor";

interface UploadEvidenceStepProps {
  onFilesSelected: (files: File[]) => void;
  onFactsExtracted?: (facts: Fact[]) => void;
  onPdfTextExtracted?: (text: string) => void;
}

const UploadEvidenceStep: React.FC<UploadEvidenceStepProps> = ({ 
  onFilesSelected,
  onFactsExtracted,
  onPdfTextExtracted
}) => {
  const handleFilesSelected = async (files: File[]) => {
    onFilesSelected(files);
    if (files.length > 0) {
      toast.success("Files uploaded successfully");
      try {
        // Extract facts from the first PDF file
        const facts = await extractFactsFromPDF(files[0]);
        if (onFactsExtracted) {
          onFactsExtracted(facts);
        }
        // Extract full text from the first PDF file
        if (typeof extractTextFromPDF === "function" && files[0]) {
          const arrayBuffer = await files[0].arrayBuffer();
          const text = await extractTextFromPDF(arrayBuffer);
          if (onPdfTextExtracted) {
            onPdfTextExtracted(text);
          }
        }
      } catch (error) {
        console.error('Error extracting facts or text:', error);
        toast.error('Error extracting information from document');
      }
    }
  };


  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Your Evidence</h2>
      <p className="mb-6 text-gray-600">
        Upload documents related to your potential class action claim.
        We accept PDF, Word documents, and images. Your files never leave your device.
      </p>
      <FileUpload onFilesSelected={handleFilesSelected} />
    </div>
  );
};

export default UploadEvidenceStep;
