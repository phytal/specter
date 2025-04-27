import React, { useState } from "react";
import { toast } from "sonner";
import { WorkflowSidebar, Step } from "@/components/WorkflowSidebar";
import MobileNavBar from "@/components/MobileNavBar";
import WorkflowSteps from "@/components/WorkflowSteps";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { useWorkflowState } from "@/hooks/useWorkflowState";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    currentStep,
    setCurrentStep,
    isProcessing,
    uploadedFiles,
    setUploadedFiles,
    facts,
    setFacts,
    selectedClassId,
    setSelectedClassId,
    complaintSections,
    setComplaintSections,
    exportFiles,
    handleNextStep,
    handlePreviousStep,
  } = useWorkflowState();

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

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      setIsMenuOpen(false);
    }
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

      <div className="flex-1 flex flex-col">
        <WorkflowSteps
          currentStep={currentStep}
          steps={steps}
          isProcessing={isProcessing}
          uploadedFiles={uploadedFiles}
          facts={facts}
          onFilesSelected={setUploadedFiles}
          onFactsUpdate={setFacts}
          onClassSelect={setSelectedClassId}
          onCreateNewClass={handleCreateNewClass}
          selectedClassId={selectedClassId}
          complaintSections={complaintSections}
          onSectionUpdate={handleSectionUpdate}
          exportFiles={exportFiles}
          onDownload={handleDownload}
          onPreview={handlePreview}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
        />

      </div>
    </div>
  );
};

export default Index;
