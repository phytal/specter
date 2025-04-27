import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WorkflowSidebar, Step } from "@/components/WorkflowSidebar";
import MobileNavBar from "@/components/MobileNavBar";
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
import UploadEvidenceStep from "@/components/steps/UploadEvidenceStep";
import DocumentReviewStep from "@/components/steps/DocumentReviewStep";
import ClassMatchingStep from "@/components/steps/ClassMatchingStep";
import ComplaintDraftStep from "@/components/steps/ComplaintDraftStep";
import ExportPackageStep from "@/components/steps/ExportPackageStep";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [classMatches, setClassMatches] = useState<ClassMatch[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [complaintSections, setComplaintSections] = useState<ComplaintSection[]>([]);
  const [exportFiles, setExportFiles] = useState<ExportFile[]>([]);

  const steps: Step[] = [
    {
      id: 1,
      name: "Upload Evidence",
      description: "Add documents & images",
      status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "upcoming",
    },
    {
      id: 2,
      name: "Review Facts",
      description: "Verify extracted information",
      status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "upcoming",
    },
    {
      id: 3,
      name: "Match Class",
      description: "Find similar cases",
      status: currentStep === 3 ? "current" : currentStep > 3 ? "completed" : "upcoming",
    },
    {
      id: 4,
      name: "Draft Complaint",
      description: "Create legal document",
      status: currentStep === 4 ? "current" : currentStep > 4 ? "completed" : "upcoming",
    },
    {
      id: 5,
      name: "Export Package",
      description: "Download final materials",
      status: currentStep === 5 ? "current" : "upcoming",
    },
  ];

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleNextStep = () => {
    if (currentStep >= steps.length) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      if (currentStep === 1 && uploadedFiles.length > 0) {
        setFacts(generateMockFacts());
      } else if (currentStep === 2) {
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

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      setIsMenuOpen(false);
    }
  };

  const handleFactsUpdate = (updatedFacts: Fact[]) => {
    setFacts(updatedFacts);
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    toast.success("Class action selected successfully!");
  };

  const handleCreateNewClass = () => {
    toast("Creating a new class action", {
      description: "Your case will be the first in this class action.",
    });
    setSelectedClassId("new-class");
  };

  const handleSectionUpdate = (id: string, content: string) => {
    setComplaintSections(
      complaintSections.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
    toast.success("Section updated successfully");
  };

  const handleRegenerateSection = (id: string) => {
    toast("Regenerating section", {
      description: "This may take a moment...",
    });
    setTimeout(() => {
      setComplaintSections(
        complaintSections.map((section) =>
          section.id === id
            ? {
                ...section,
                content: section.content + "\n\n[Regenerated content would appear here]",
              }
            : section
        )
      );
      toast.success("Section regenerated");
    }, 1500);
  };

  const handleDownload = (fileType: "complaint" | "exhibits" | "all") => {
    toast.success(`Downloading ${fileType} package`, {
      description: "Your files will download shortly.",
    });
  };

  const handlePreview = () => {
    toast("Opening preview in new tab", {
      description: "The complaint preview will open in a new browser tab.",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <UploadEvidenceStep onFilesSelected={handleFilesSelected} />;
      case 2:
        return (
          <DocumentReviewStep
            documentName={uploadedFiles[0]?.name || "Document.pdf"}
            facts={facts}
            onFactsUpdate={handleFactsUpdate}
            isProcessing={isProcessing}
          />
        );
      case 3:
        return (
          <ClassMatchingStep
            matches={classMatches}
            selectedClassId={selectedClassId}
            onClassSelect={handleClassSelect}
            onCreateNewClass={handleCreateNewClass}
            isProcessing={isProcessing}
          />
        );
      case 4:
        return (
          <ComplaintDraftStep
            sections={complaintSections}
            onSectionUpdate={handleSectionUpdate}
            onRegenerateSection={handleRegenerateSection}
            isGenerating={isProcessing}
          />
        );
      case 5:
        return (
          <ExportPackageStep
            files={exportFiles}
            onDownload={handleDownload}
            onPreview={handlePreview}
            isExporting={isProcessing}
          />
        );
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => {
    return (
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={currentStep === 1 || isProcessing}
          className="px-8"
        >
          Back
        </Button>
        
        {currentStep < steps.length ? (
          <Button
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && uploadedFiles.length === 0) ||
              (currentStep === 3 && !selectedClassId) ||
              isProcessing
            }
            className="px-8 bg-teal-700 hover:bg-teal-800"
          >
            {isProcessing ? "Processing..." : "Next"}
          </Button>
        ) : (
          <Button
            onClick={() => {
              toast.success("Process completed!", {
                description: "Thank you for using Class-Action Copilot.",
              });
            }}
            className="px-8 bg-amber hover:bg-amber-600 text-white"
          >
            Finish
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <MobileNavBar
        steps={steps}
        currentStep={currentStep}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onStepClick={handleStepClick}
      />

      <WorkflowSidebar
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col min-h-screen">
        <div className="container mx-auto flex flex-col flex-1">
          <div className="flex-1">
            {renderStepContent()}
            {renderNavigationButtons()}
          </div>
          <div className="pt-4 border-t text-center text-sm text-gray-500 mt-auto">
            <p>
              Class-Action Copilot processes all data on-device for privacy.
              Always consult with a licensed attorney before legal filings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
