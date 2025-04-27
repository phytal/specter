import { useState } from "react";
import {
  generateMockFacts,
  generateMockClassMatches,
  generateMockComplaintSections,
  generateMockExportFiles,
  Fact,
  ClassMatch,
  ComplaintSection,
  ExportFile,
} from "@/lib/mockData";

export const useWorkflowState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [classMatches, setClassMatches] = useState<ClassMatch[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [complaintSections, setComplaintSections] = useState<ComplaintSection[]>([]);
  const [exportFiles, setExportFiles] = useState<ExportFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleNextStep = () => {
    if (currentStep >= 5) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      if (currentStep === 2) {
        setClassMatches(generateMockClassMatches());
      } else if (currentStep === 3 && selectedClassId) {
        setComplaintSections(generateMockComplaintSections());
      } else if (currentStep === 4) {
        setExportFiles(generateMockExportFiles());
      }

      setCurrentStep(currentStep + 1);
      setIsProcessing(false);
    }, 2000);
  };

  const handlePreviousStep = () => {
    if (currentStep <= 1) return;
    setCurrentStep(currentStep - 1);
  };

  const handleSectionUpdate = (id: string, content: string) => {
    setComplaintSections(
      complaintSections.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
  };

  const handleRegenerateSection = async (id: string) => {
    // This function is a placeholder, the actual implementation 
    // with OpenAI streaming is in WorkflowSteps.tsx onRegenerateSection prop
  };

  return {
    currentStep,
    setCurrentStep,
    isProcessing,
    setIsProcessing,
    uploadedFiles,
    setUploadedFiles,
    facts,
    setFacts,
    classMatches,
    selectedClassId,
    setSelectedClassId,
    complaintSections,
    setComplaintSections,
    exportFiles,
    searchQuery,
    setSearchQuery,
    handleNextStep,
    handlePreviousStep,
    handleSectionUpdate,
    handleRegenerateSection,
  };
};
