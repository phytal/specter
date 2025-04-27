import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UploadEvidenceStep from "@/components/steps/UploadEvidenceStep";
import { useSerpApiClassMatches } from "@/hooks/useSerpApiClassMatches";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import DocumentReviewStep from "@/components/steps/DocumentReviewStep";
import ClassMatchingStep from "@/components/steps/ClassMatchingStep";
import ComplaintDraftStep from "@/components/steps/ComplaintDraftStep";
import ExportPackageStep from "@/components/steps/ExportPackageStep";
import { Step } from "@/components/WorkflowSidebar";
import { Fact } from "@/lib/mockData";
import { openai } from "@/lib/openai";

interface WorkflowStepsProps {
  currentStep: number;
  steps: Step[];
  isProcessing: boolean;
  uploadedFiles: File[];
  facts: Fact[];
  onFilesSelected: (files: File[]) => void;
  onFactsUpdate: (facts: Fact[]) => void;
  onClassSelect: (classId: string) => void;
  onCreateNewClass: () => void;
  selectedClassId: string | null;
  complaintSections: any[];
  onSectionUpdate: (id: string, content: string) => void;
  exportFiles: any[];
  onDownload: (fileType: "complaint" | "exhibits" | "all") => void;
  onPreview: () => void;
}

const WorkflowSteps: React.FC<WorkflowStepsProps & { onNext: () => void; onPrevious: () => void }> = ({
  currentStep,
  steps,
  isProcessing,
  uploadedFiles,
  facts,
  onFilesSelected,
  onFactsUpdate,
  onClassSelect,
  onCreateNewClass,
  selectedClassId,
  complaintSections,
  onSectionUpdate,
  exportFiles,
  onDownload,
  onPreview,
  onNext,
  onPrevious,
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <UploadEvidenceStep onFilesSelected={onFilesSelected} />;
      case 2:
        return (
          <DocumentReviewStep
            file={uploadedFiles[0]}
            documentName={uploadedFiles[0]?.name || "Document.pdf"}
            facts={facts}
            onFactsUpdate={onFactsUpdate}
            isProcessing={isProcessing}
          />
        );
      case 3: {
        // SerpApi-powered matching
        const { matches, loading, error } = useSerpApiClassMatches(facts, currentStep === 3);
        return (
          <ClassMatchingStep
            matches={matches}
            selectedClassId={selectedClassId}
            onClassSelect={onClassSelect}
            onCreateNewClass={onCreateNewClass}
            isProcessing={loading}
            error={error}
          />
        );
      }
      case 4:
        return (
          <ComplaintDraftStep
            sections={complaintSections}
            onSectionUpdate={onSectionUpdate}
            isGenerating={isProcessing}
            onRegenerateSection={async (id: string) => {
              toast("Regenerating section", { description: "This may take a moment..." });
              try {
                const section = complaintSections.find((s) => s.id === id);
                const prompt = `Draft complaint section '${section?.title}' using facts: ${JSON.stringify(facts)}`;
                const res = await openai.chat.completions.create({
                  model: "webai-llm",
                  // model: "llama-3.3-70b-versatile",
                  messages: [{ role: "user", content: prompt }],
                  stream: false,
                });
                const text = res.choices?.[0]?.message?.content || "";
                onSectionUpdate(id, text);
                toast.success("Section regenerated");
              } catch (err) {
                console.error("LLM complaint draft error:", err);
                toast.error("Regeneration failed");
              }
            }}
          />
        );
      case 5:
        return (
          <ExportPackageStep
            files={exportFiles}
            onDownload={onDownload}
            onPreview={onPreview}
            isExporting={isProcessing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col min-h-screen">
      <div className="container mx-auto flex flex-col flex-1">
        <div className="flex-1">
          {renderStepContent()}
          <WorkflowNavigation
            currentStep={currentStep}
            totalSteps={steps.length}
            isProcessing={isProcessing}
            uploadedFiles={uploadedFiles}
            selectedClassId={selectedClassId}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        </div>
        <div className="pt-4 border-t text-center text-sm text-gray-500 mt-auto">
          <p>
            Specter processes all data on-device for privacy.
            Always consult with a licensed attorney before legal filings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSteps;
