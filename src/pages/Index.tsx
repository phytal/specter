
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WorkflowSidebar, Step } from "@/components/WorkflowSidebar";
import FileUpload from "@/components/FileUpload";
import DocumentReview from "@/components/DocumentReview";
import ClassMatching from "@/components/ClassMatching";
import ComplaintDraft from "@/components/ComplaintDraft";
import ExportPackage from "@/components/ExportPackage";
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

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for each step
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [classMatches, setClassMatches] = useState<ClassMatch[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [complaintSections, setComplaintSections] = useState<ComplaintSection[]>([]);
  const [exportFiles, setExportFiles] = useState<ExportFile[]>([]);

  // Steps definition
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

  // Handle file upload
  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };

  // Move to next step with simulated processing
  const handleNextStep = () => {
    if (currentStep >= steps.length) return;

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // For demo purposes, generate mock data based on the current step
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

  // Go back to previous step
  const handlePreviousStep = () => {
    if (currentStep <= 1) return;
    setCurrentStep(currentStep - 1);
  };

  // Handle step click from sidebar
  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      setIsMenuOpen(false);
    }
  };

  // Handle fact updates in document review
  const handleFactsUpdate = (updatedFacts: Fact[]) => {
    setFacts(updatedFacts);
  };

  // Handle class selection
  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    toast.success("Class action selected successfully!");
  };

  // Handle creating a new class
  const handleCreateNewClass = () => {
    toast("Creating a new class action", {
      description: "Your case will be the first in this class action.",
    });
    // In a real app, we would create a new class here
    setSelectedClassId("new-class");
  };

  // Handle section update in complaint draft
  const handleSectionUpdate = (id: string, content: string) => {
    setComplaintSections(
      complaintSections.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
    toast.success("Section updated successfully");
  };

  // Handle regenerating a section
  const handleRegenerateSection = (id: string) => {
    toast("Regenerating section", {
      description: "This may take a moment...",
    });
    // In a real app, we would regenerate the section content here
    setTimeout(() => {
      // For demo purposes, just add a note to the section
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

  // Handle download
  const handleDownload = (fileType: "complaint" | "exhibits" | "all") => {
    toast.success(`Downloading ${fileType} package`, {
      description: "Your files will download shortly.",
    });
    // In a real app, we would trigger the actual download here
  };

  // Handle preview
  const handlePreview = () => {
    toast("Opening preview in new tab", {
      description: "The complaint preview will open in a new browser tab.",
    });
    // In a real app, we would open a preview in a new tab
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
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
      case 2:
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Review Extracted Information</h2>
            <p className="mb-6 text-gray-600">
              We've analyzed your documents and extracted key information. 
              Please review and correct any inaccuracies.
            </p>
            <DocumentReview
              documentName={uploadedFiles[0]?.name || "Document.pdf"}
              extractedFacts={facts}
              onFactsUpdate={handleFactsUpdate}
              onRerunExtraction={() => {
                toast("Re-analyzing document", {
                  description: "This may take a moment...",
                });
                // In a real app, we would re-run the extraction here
              }}
              isProcessing={false}
            />
          </div>
        );
      case 3:
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Find Matching Class Actions</h2>
            <p className="mb-6 text-gray-600">
              Based on your case details, we've found potential matching class actions.
              Select one to join or create a new class action.
            </p>
            <ClassMatching
              possibleMatches={classMatches}
              selectedClassId={selectedClassId}
              onClassSelect={handleClassSelect}
              onCreateNewClass={handleCreateNewClass}
              isProcessing={isProcessing}
            />
          </div>
        );
      case 4:
        return (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Review Complaint Draft</h2>
            <p className="mb-6 text-gray-600">
              We've generated a legal complaint based on your evidence and the selected class action.
              Review and edit as needed before finalizing.
            </p>
            <ComplaintDraft
              sections={complaintSections}
              onSectionUpdate={handleSectionUpdate}
              isGenerating={isProcessing}
              onRegenerateSection={handleRegenerateSection}
            />
          </div>
        );
      case 5:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Export Your Legal Package</h2>
            <p className="mb-6 text-gray-600">
              Your class action complaint package is ready to export.
              All documents are processed locally on your device for privacy.
            </p>
            <ExportPackage
              files={exportFiles}
              onDownload={handleDownload}
              onPreview={handlePreview}
              isExporting={isProcessing}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Navigation buttons
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
      {/* Mobile Navigation */}
      <MobileNavBar
        steps={steps}
        currentStep={currentStep}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onStepClick={handleStepClick}
      />

      {/* Sidebar */}
      <WorkflowSidebar
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="container mx-auto">
          {renderStepContent()}
          {renderNavigationButtons()}

          {/* Footer */}
          <div className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
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
